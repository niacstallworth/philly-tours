import fs from "node:fs";
import path from "node:path";

export function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

export function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function extensionFromContentType(contentType, fallback = ".png") {
  const normalized = String(contentType || "").trim().toLowerCase();
  if (normalized.includes("jpeg")) return ".jpeg";
  if (normalized.includes("jpg")) return ".jpg";
  if (normalized.includes("png")) return ".png";
  if (normalized.includes("webp")) return ".webp";
  return fallback;
}

async function fetchArrayBuffer(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    throw new Error(`Request failed (${response.status}) for ${url}: ${raw.slice(0, 300)}`);
  }
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || ""
  };
}

function parseJsonResponse(raw, label) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Unable to parse JSON response from ${label}: ${raw.slice(0, 300)}`);
  }
}

function extractReplicateOutputUrls(payload) {
  const output = payload?.output;
  if (typeof output === "string" && output.trim()) {
    return [output.trim()];
  }
  if (Array.isArray(output)) {
    return output
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object" && typeof item.url === "string") return item.url.trim();
        return "";
      })
      .filter(Boolean);
  }
  if (output && typeof output === "object" && typeof output.url === "string") {
    return [output.url.trim()];
  }
  return [];
}

async function waitForReplicatePrediction(initialPayload, apiToken) {
  let payload = initialPayload;
  const predictionUrl = String(initialPayload?.urls?.get || "").trim();
  if (!predictionUrl) {
    return payload;
  }

  const terminalStates = new Set(["succeeded", "failed", "canceled"]);
  const startedAt = Date.now();
  while (!terminalStates.has(String(payload?.status || "").toLowerCase())) {
    if (Date.now() - startedAt > 120_000) {
      throw new Error("Replicate prediction timed out after 120 seconds.");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await fetch(predictionUrl, {
      headers: {
        Authorization: `Token ${apiToken}`,
        "content-type": "application/json"
      }
    });
    const raw = await response.text();
    payload = parseJsonResponse(raw, "Replicate prediction status");
    if (!response.ok) {
      throw new Error(payload?.detail || payload?.error || payload?.message || `Replicate status failed with ${response.status}`);
    }
  }

  return payload;
}

export async function generateImageWithFal({
  prompt,
  model = process.env.FAL_DEFAULT_MODEL || "fal-ai/flux/dev",
  imageSize = process.env.FAL_DEFAULT_IMAGE_SIZE || "landscape_4_3",
  outputFormat = process.env.FAL_DEFAULT_OUTPUT_FORMAT || "jpeg"
}) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error("FAL_KEY is required.");
  }

  const response = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      image_size: imageSize,
      num_images: 1,
      output_format: outputFormat
    })
  });

  const raw = await response.text();
  const payload = parseJsonResponse(raw, `fal model ${model}`);
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.detail || payload?.message || `fal failed with ${response.status}`);
  }

  const image = Array.isArray(payload?.images) ? payload.images[0] : null;
  const fileUrl = String(image?.url || "").trim();
  if (!fileUrl) {
    throw new Error("fal returned no image URL.");
  }

  const downloaded = await fetchArrayBuffer(fileUrl);
  return {
    provider: "fal",
    model,
    prompt,
    responsePayload: payload,
    artifact: {
      buffer: downloaded.buffer,
      extension: extensionFromContentType(downloaded.contentType, `.${outputFormat}`),
      contentType: downloaded.contentType,
      remoteUrl: fileUrl
    }
  };
}

export async function generateImageWithReplicate({
  prompt,
  model = process.env.REPLICATE_DEFAULT_MODEL || "black-forest-labs/flux-1.1-pro",
  aspectRatio = process.env.REPLICATE_DEFAULT_ASPECT_RATIO || "3:2",
  outputFormat = process.env.REPLICATE_DEFAULT_OUTPUT_FORMAT || "png"
}) {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is required.");
  }

  const [owner, name] = String(model).trim().split("/");
  if (!owner || !name) {
    throw new Error(`Replicate model must be in owner/name format. Received: ${model}`);
  }

  const response = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiToken}`,
      "content-type": "application/json",
      Prefer: "wait=60"
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: outputFormat
      }
    })
  });

  const raw = await response.text();
  const initialPayload = parseJsonResponse(raw, `Replicate model ${model}`);
  if (!response.ok) {
    throw new Error(initialPayload?.detail || initialPayload?.error || initialPayload?.message || `Replicate failed with ${response.status}`);
  }

  const finalPayload = await waitForReplicatePrediction(initialPayload, apiToken);
  if (String(finalPayload?.status || "").toLowerCase() !== "succeeded") {
    throw new Error(finalPayload?.error || `Replicate prediction ended with ${finalPayload?.status}`);
  }

  const outputUrls = extractReplicateOutputUrls(finalPayload);
  const fileUrl = outputUrls[0];
  if (!fileUrl) {
    throw new Error("Replicate returned no output URL.");
  }

  const downloaded = await fetchArrayBuffer(fileUrl);
  return {
    provider: "replicate",
    model,
    prompt,
    responsePayload: finalPayload,
    artifact: {
      buffer: downloaded.buffer,
      extension: extensionFromContentType(downloaded.contentType, `.${outputFormat}`),
      contentType: downloaded.contentType,
      remoteUrl: fileUrl
    }
  };
}

export async function generateImageWithStability({
  prompt,
  endpoint = process.env.STABILITY_DEFAULT_ENDPOINT || "core",
  aspectRatio = process.env.STABILITY_DEFAULT_ASPECT_RATIO || "3:2",
  outputFormat = process.env.STABILITY_DEFAULT_OUTPUT_FORMAT || "png"
}) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error("STABILITY_API_KEY is required.");
  }

  const formData = new FormData();
  formData.set("prompt", prompt);
  formData.set("aspect_ratio", aspectRatio);
  formData.set("output_format", outputFormat);

  const response = await fetch(`https://api.stability.ai/v2beta/stable-image/generate/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "image/*"
    },
    body: formData
  });

  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    throw new Error(`Stability failed with ${response.status}: ${raw.slice(0, 300)}`);
  }

  const contentType = response.headers.get("content-type") || `image/${outputFormat}`;
  return {
    provider: "stability",
    model: endpoint,
    prompt,
    responsePayload: {
      endpoint,
      contentType,
      aspectRatio,
      outputFormat
    },
    artifact: {
      buffer: Buffer.from(await response.arrayBuffer()),
      extension: extensionFromContentType(contentType, `.${outputFormat}`),
      contentType,
      remoteUrl: ""
    }
  };
}

export async function searchSketchfabModels({
  query,
  limit = 6,
  downloadable = true
}) {
  const apiToken = process.env.SKETCHFAB_API_TOKEN || "";
  const endpoint = new URL("https://api.sketchfab.com/v3/search");
  endpoint.searchParams.set("type", "models");
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("count", String(limit));
  if (downloadable) {
    endpoint.searchParams.set("downloadable", "true");
  }

  const response = await fetch(endpoint.toString(), {
    headers: apiToken ? { Authorization: `Token ${apiToken}` } : {}
  });
  const raw = await response.text();
  const payload = parseJsonResponse(raw, "Sketchfab search");
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.error || payload?.message || `Sketchfab failed with ${response.status}`);
  }

  const results = Array.isArray(payload?.results) ? payload.results : [];
  return results.map((item) => ({
    name: String(item?.name || "").trim(),
    uid: String(item?.uid || "").trim(),
    viewerUrl: String(item?.viewerUrl || item?.viewerUrl || "").trim(),
    embedUrl: String(item?.embedUrl || "").trim(),
    likeCount: Number(item?.likeCount || 0),
    vertexCount: Number(item?.vertexCount || 0),
    faceCount: Number(item?.faceCount || 0),
    isDownloadable: Boolean(item?.isDownloadable),
    license: item?.license?.label || "",
    author: item?.user?.displayName || item?.user?.username || ""
  }));
}

export async function generateImageWithProvider(provider, options) {
  if (provider === "fal") {
    return generateImageWithFal(options);
  }
  if (provider === "replicate") {
    return generateImageWithReplicate(options);
  }
  if (provider === "stability") {
    return generateImageWithStability(options);
  }
  throw new Error(`Unsupported image provider: ${provider}`);
}

export function writeBinaryFile(filePath, buffer) {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, buffer);
}
