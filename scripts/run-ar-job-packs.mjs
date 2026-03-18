import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const defaultJobDir = path.join(rootDir, "docs", "ar-job-packs");
const defaultOutputDir = path.join(rootDir, "generated", "ar");

function loadDotEnv(filePath) {
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
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const args = {
    stopId: "",
    stage: "text_brief",
    provider: "",
    limit: 1,
    all: false,
    dryRun: false,
    force: false,
    jobDir: defaultJobDir,
    outputDir: defaultOutputDir,
    model: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--stop-id") {
      args.stopId = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (value === "--stage") {
      args.stage = (argv[index + 1] || "").trim() || args.stage;
      index += 1;
      continue;
    }
    if (value === "--provider") {
      args.provider = (argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (value === "--limit") {
      const parsed = Number(argv[index + 1] || "");
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("--limit must be a positive number");
      }
      args.limit = parsed;
      index += 1;
      continue;
    }
    if (value === "--all") {
      args.all = true;
      args.limit = Number.POSITIVE_INFINITY;
      continue;
    }
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (value === "--force") {
      args.force = true;
      continue;
    }
    if (value === "--job-dir") {
      const next = argv[index + 1] || "";
      if (!next.trim()) {
        throw new Error("--job-dir requires a value");
      }
      args.jobDir = path.resolve(rootDir, next);
      index += 1;
      continue;
    }
    if (value === "--output-dir") {
      const next = argv[index + 1] || "";
      if (!next.trim()) {
        throw new Error("--output-dir requires a value");
      }
      args.outputDir = path.resolve(rootDir, next);
      index += 1;
      continue;
    }
    if (value === "--model") {
      args.model = (argv[index + 1] || "").trim();
      index += 1;
    }
  }

  if (!args.provider) {
    args.provider = defaultProviderForStage(args.stage);
  }

  if (args.stopId) {
    args.limit = Number.POSITIVE_INFINITY;
  }

  return args;
}

function defaultProviderForStage(stage) {
  switch (stage) {
    case "text_brief":
      return "anthropic";
    case "concept_image":
      return "replicate";
    case "rough_mesh":
      return "manual";
    default:
      throw new Error(`Unsupported stage: ${stage}`);
  }
}

function relativeRepoPath(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, "/");
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function parseJsonResponse(text, fallbackLabel) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Unable to parse JSON response from ${fallbackLabel}: ${text.slice(0, 300)}`);
  }
}

function loadJobPacks(jobDir) {
  if (!fs.existsSync(jobDir)) {
    throw new Error(`Job pack directory not found: ${relativeRepoPath(jobDir)}`);
  }

  const jobPacks = [];
  for (const entry of fs.readdirSync(jobDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const jobPath = path.join(jobDir, entry.name, "job.json");
    if (!fs.existsSync(jobPath)) {
      continue;
    }

    const jobPack = JSON.parse(fs.readFileSync(jobPath, "utf8"));
    jobPacks.push({
      path: jobPath,
      data: jobPack
    });
  }

  return jobPacks.sort((left, right) => {
    const leftPriority = Number(left.data?.stop?.arPriority || 0);
    const rightPriority = Number(right.data?.stop?.arPriority || 0);
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    const leftTitle = String(left.data?.stop?.stopTitle || "");
    const rightTitle = String(right.data?.stop?.stopTitle || "");
    return leftTitle.localeCompare(rightTitle);
  });
}

function readJsonIfPresent(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listFilesRecursive(dirPath) {
  const collected = [];
  if (!fs.existsSync(dirPath)) {
    return collected;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collected.push(...listFilesRecursive(entryPath));
      continue;
    }
    collected.push(entryPath);
  }

  return collected.sort();
}

function selectPrompt(jobPack, stage) {
  switch (stage) {
    case "text_brief":
      return String(jobPack.promptPack?.textBriefPrompt || "").trim();
    case "concept_image":
      return String(jobPack.promptPack?.conceptImagePrompt || "").trim();
    case "rough_mesh":
      return String(jobPack.promptPack?.roughMeshPrompt || "").trim();
    default:
      throw new Error(`Unsupported stage: ${stage}`);
  }
}

function resolveStageOutputDir(baseOutputDir, stopId, stage, provider) {
  return path.join(baseOutputDir, stopId, stage, provider);
}

function readExistingOutput(outputPath) {
  if (!fs.existsSync(outputPath)) {
    return "";
  }
  return fs.readFileSync(outputPath, "utf8");
}

function writeStageFiles({ outputDir, prompt, outputText, responsePayload, runRecord, extraFiles = [] }) {
  ensureDirectory(outputDir);

  fs.writeFileSync(path.join(outputDir, "prompt.txt"), `${prompt}\n`);
  if (outputText != null) {
    fs.writeFileSync(path.join(outputDir, "output.md"), outputText.endsWith("\n") ? outputText : `${outputText}\n`);
  }
  if (responsePayload != null) {
    fs.writeFileSync(path.join(outputDir, "response.json"), `${JSON.stringify(responsePayload, null, 2)}\n`);
  }
  for (const extraFile of extraFiles) {
    const destinationPath = path.join(outputDir, extraFile.relativePath);
    ensureDirectory(path.dirname(destinationPath));
    fs.writeFileSync(destinationPath, extraFile.contents.endsWith("\n") ? extraFile.contents : `${extraFile.contents}\n`);
  }
  fs.writeFileSync(path.join(outputDir, "run.json"), `${JSON.stringify(runRecord, null, 2)}\n`);
}

function extensionFromContentType(contentType) {
  const normalized = String(contentType || "").trim().toLowerCase();
  if (!normalized) {
    return "";
  }
  if (normalized === "image/jpeg") {
    return ".jpeg";
  }
  if (normalized === "image/png") {
    return ".png";
  }
  if (normalized === "image/webp") {
    return ".webp";
  }
  return "";
}

function extensionFromUrl(fileUrl) {
  try {
    const url = new URL(fileUrl);
    const parsed = path.extname(url.pathname);
    return parsed || "";
  } catch {
    return path.extname(String(fileUrl || "")) || "";
  }
}

async function downloadToFile(fileUrl, destinationPath) {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download artifact from ${fileUrl} (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(destinationPath, Buffer.from(arrayBuffer));
}

function renderConceptImageOutput({ jobPack, provider, model, responsePayload, downloadedFiles }) {
  const imageUrls = extractConceptImageUrls(provider, responsePayload);
  const lines = [
    `# Concept Image Result`,
    ``,
    `- Stop: ${jobPack.stop.stopTitle}`,
    `- Stage: concept_image`,
    `- Provider: ${provider}`,
    `- Model: ${model}`,
    `- Image count: ${imageUrls.length}`,
    `- Prompt echoed by provider: ${String(responsePayload?.prompt || responsePayload?.input?.prompt || "").trim() ? "yes" : "no"}`,
    ``
  ];

  if (downloadedFiles.length) {
    lines.push("## Downloaded Files", "");
    for (const filePath of downloadedFiles) {
      lines.push(`- \`${filePath}\``);
    }
    lines.push("");
  }

  if (imageUrls.length) {
    lines.push("## Remote Images", "");
    imageUrls.forEach((imageUrl, index) => {
      lines.push(`- Image ${index + 1}: ${imageUrl}`);
    });
    lines.push("");
  }

  if (responsePayload?.timings?.inference != null) {
    lines.push(`- Inference seconds: ${responsePayload.timings.inference}`, "");
  }

  return `${lines.join("\n")}\n`;
}

function findGeneratedStageRuns(outputRootDir, stopId, stage) {
  const stageDir = path.join(outputRootDir, stopId, stage);
  if (!fs.existsSync(stageDir)) {
    return [];
  }

  const runs = [];
  for (const providerEntry of fs.readdirSync(stageDir, { withFileTypes: true })) {
    if (!providerEntry.isDirectory()) {
      continue;
    }

    const providerDir = path.join(stageDir, providerEntry.name);
    const runRecord = readJsonIfPresent(path.join(providerDir, "run.json"));
    const files = listFilesRecursive(providerDir).map(relativeRepoPath);
    runs.push({
      provider: providerEntry.name,
      status: String(runRecord?.status || "completed"),
      dryRun: Boolean(runRecord?.dryRun),
      finishedAt: runRecord?.finishedAt || null,
      outputFile: files.find((filePath) => filePath.endsWith("/output.md")) || "",
      promptFile: files.find((filePath) => filePath.endsWith("/prompt.txt")) || "",
      imageFiles: files.filter((filePath) => filePath.includes("/images/")),
      allFiles: files
    });
  }

  return runs.sort((left, right) => String(right.finishedAt || "").localeCompare(String(left.finishedAt || "")));
}

function buildRoughMeshCleanupChecklist(jobPack) {
  const arType = String(jobPack?.stop?.arType || "").trim();
  const generic = [
    "Lock real-world scale first using nearby human-height or architectural cues.",
    "Favor large readable silhouette changes before chasing detail or texture polish.",
    "Keep geometry separable so cards, overlays, plinths, and hero objects can be tuned independently.",
    "Set the mesh origin and facing direction for front-of-user placement in AR.",
    "Keep materials lightweight and mobile-safe; avoid unnecessary shader complexity.",
    "Export with clean naming so the runtime packaging step can map to .usdz and .glb targets cleanly."
  ];

  const byType = {
    historical_figure_presence: [
      "Use restrained figure silhouettes; avoid uncanny facial fidelity in the rough blockout stage.",
      "Stage supporting cards and route overlays as separate planes or groups."
    ],
    before_after_overlay: [
      "Prioritize facade proportions and edge alignment against the real-world site.",
      "Break out comparison overlays separately from the main architectural mass."
    ],
    animated_diagram: [
      "Separate moving mechanism parts into clean groups for later animation cleanup.",
      "Keep labels and explanatory overlays as independent geometry or planes."
    ],
    object_on_plinth: [
      "Treat the hero object and the base/plinth as separate assets.",
      "Make sure the footprint feels stable from a standing viewing angle."
    ],
    floating_story_card: [
      "Bias toward lightweight planes/cards instead of unnecessary solid volume.",
      "Preserve clean margins and panel spacing for mobile readability."
    ],
    portal_reconstruction: [
      "Keep the portal frame, foreground depth planes, and background massing in separate groups.",
      "Prioritize a convincing entry silhouette over dense scene detail."
    ]
  };

  return [...generic, ...(byType[arType] || [])];
}

function buildRoughMeshSuggestedArtifacts(jobPack) {
  const stopId = String(jobPack?.stop?.stopId || "stop").trim();
  return [
    `${stopId}-blockout.glb`,
    `${stopId}-blockout.usdz`,
    `${stopId}-cleanup-notes.md`,
    `${stopId}-turntable-preview.mp4`
  ];
}

function renderRoughMeshOutput({ jobPack, provider, model, prompt, conceptReferences, cleanupChecklist, suggestedArtifacts }) {
  const lines = [
    `# Rough Mesh Handoff`,
    ``,
    `- Stop: ${jobPack.stop.stopTitle}`,
    `- Stage: rough_mesh`,
    `- Provider: ${provider}`,
    `- Mode: ${provider === "manual" ? "no-cost handoff workspace" : "provider-backed"}`,
    `- Model: ${model}`,
    `- AR type: ${jobPack.stop.arType}`,
    `- Runtime targets: iOS ${jobPack.runtimeTargets?.iosAsset || "n/a"}, Android ${jobPack.runtimeTargets?.androidAsset || "n/a"}, Web ${jobPack.runtimeTargets?.webAsset || "n/a"}`,
    `- Concept reference runs found: ${conceptReferences.length}`,
    ``,
    `## Scene Goal`,
    ``,
    `${jobPack.creativeDirection?.conceptGoal || "No concept goal provided."}`,
    ``,
    `## Modeling Priorities`,
    ``,
    `- Primary asset request: ${jobPack.creativeDirection?.assetNeeded || "n/a"}`,
    `- Visual priority: ${jobPack.creativeDirection?.visualPriority || "n/a"}`,
    `- Style preset: ${jobPack.creativeDirection?.stylePreset || "n/a"}`,
    `- Placement note: ${jobPack.placement?.placementNote || "n/a"}`,
    ``,
    `## Concept References`,
    ``
  ];

  if (!conceptReferences.length) {
    lines.push(`- No prior concept-image outputs found under \`generated/ar/<stopId>/concept_image/\` yet.`, "");
  } else {
    for (const reference of conceptReferences) {
      lines.push(
        `- \`${reference.provider}\` (${reference.dryRun ? "dry-run" : "live"}, status=${reference.status}${reference.finishedAt ? `, finished=${reference.finishedAt}` : ""})`
      );
      if (reference.outputFile) {
        lines.push(`  - output: \`${reference.outputFile}\``);
      }
      if (reference.promptFile) {
        lines.push(`  - prompt: \`${reference.promptFile}\``);
      }
      for (const imageFile of reference.imageFiles) {
        lines.push(`  - image: \`${imageFile}\``);
      }
    }
    lines.push("");
  }

  lines.push(`## Cleanup Checklist`, "");
  for (const item of cleanupChecklist) {
    lines.push(`- ${item}`);
  }
  lines.push("", `## Suggested Workspace Artifacts`, "");
  for (const item of suggestedArtifacts) {
    lines.push(`- \`${item}\``);
  }
  lines.push("", `## Prompt Source`, "", "See `prompt.txt` for the provider-ready rough-mesh prompt.", "");

  return `${lines.join("\n")}\n`;
}

function buildReviewedDropZoneGuide({ jobPack, suggestedArtifacts }) {
  const runtimeTargets = jobPack.runtimeTargets || {};
  const stopId = String(jobPack?.stop?.stopId || "").trim();
  const lines = [
    "# Reviewed Mesh Drop Zone",
    "",
    `- Stop: ${jobPack.stop.stopTitle}`,
    `- Stop ID: \`${stopId}\``,
    "",
    "Drop cleaned mesh exports here after Blender/manual cleanup.",
    "",
    "Preferred runtime filenames:",
    "",
    `- iOS: \`${path.basename(String(runtimeTargets.iosAsset || "").trim())}\``,
    `- Android: \`${path.basename(String(runtimeTargets.androidAsset || "").trim())}\``,
    `- Web: \`${path.basename(String(runtimeTargets.webAsset || "").trim())}\``,
    "",
    "Accepted intermediate filenames:",
    ""
  ];

  for (const artifact of suggestedArtifacts) {
    lines.push(`- \`${path.basename(String(artifact || "").trim())}\``);
  }

  lines.push(
    "",
    "When the cleaned files are ready, run:",
    "",
    "```bash",
    `cd ${rootDir}`,
    `npm run ar:mesh:ingest -- --stop-id ${stopId} --dry-run`,
    "```",
    ""
  );

  return `${lines.join("\n")}\n`;
}

function buildCleanupNotesTemplate(jobPack) {
  const lines = [
    "# Mesh Cleanup Notes",
    "",
    `- Stop: ${jobPack.stop.stopTitle}`,
    `- Stop ID: \`${jobPack.stop.stopId}\``,
    `- AR type: ${jobPack.stop.arType}`,
    "",
    "## Keep",
    "",
    "- ",
    "",
    "## Simplify",
    "",
    "- ",
    "",
    "## Fix Before Runtime",
    "",
    "- ",
    "",
    "## Export Notes",
    "",
    "- Pivot/origin:",
    "- Scale assumptions:",
    "- Material notes:",
    ""
  ];

  return `${lines.join("\n")}\n`;
}

function extractReplicateOutputUrls(payload) {
  const output = payload?.output;
  if (typeof output === "string" && output.trim()) {
    return [output.trim()];
  }
  if (Array.isArray(output)) {
    return output
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }
        if (item && typeof item === "object" && typeof item.url === "string") {
          return item.url.trim();
        }
        return "";
      })
      .filter(Boolean);
  }
  if (output && typeof output === "object" && typeof output.url === "string") {
    return [output.url.trim()];
  }
  return [];
}

function extractConceptImageUrls(provider, payload) {
  if (provider === "fal") {
    const images = Array.isArray(payload?.images) ? payload.images : [];
    return images.map((image) => String(image?.url || "").trim()).filter(Boolean);
  }
  if (provider === "replicate") {
    return extractReplicateOutputUrls(payload);
  }
  return [];
}

function extractAnthropicText(payload) {
  const content = Array.isArray(payload?.content) ? payload.content : [];
  const raw = content
    .filter((block) => block?.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n\n")
    .trim();

  if (!raw) {
    throw new Error("Anthropic returned no text content.");
  }

  return raw;
}

async function runAnthropicTextBrief({ prompt, model, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required in .env or the environment.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nRespond in Markdown with short headings and production-ready details.`
        }
      ]
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Anthropic request failed with ${response.status}`;
    throw new Error(message);
  }

  return {
    outputText: extractAnthropicText(payload),
    responsePayload: payload
  };
}

async function runFalConceptImage({ prompt, model, imageSize, outputFormat }) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error("FAL_KEY is required in .env or the environment.");
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
    const message = payload?.error?.message || payload?.detail || payload?.message || `fal request failed with ${response.status}`;
    throw new Error(message);
  }

  const images = Array.isArray(payload?.images) ? payload.images : [];
  if (!images.length) {
    throw new Error("fal returned no images.");
  }

  return {
    responsePayload: payload
  };
}

async function getReplicatePrediction(predictionUrl, apiToken) {
  const response = await fetch(predictionUrl, {
    headers: {
      Authorization: `Token ${apiToken}`,
      "content-type": "application/json"
    }
  });

  const raw = await response.text();
  const payload = parseJsonResponse(raw, "Replicate prediction status");
  if (!response.ok) {
    const message = payload?.detail || payload?.error || payload?.message || `Replicate status request failed with ${response.status}`;
    throw new Error(message);
  }
  return payload;
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
    payload = await getReplicatePrediction(predictionUrl, apiToken);
  }

  return payload;
}

async function runReplicateConceptImage({ prompt, model, aspectRatio, outputFormat }) {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is required in .env or the environment.");
  }

  const trimmedModel = model.trim();
  const [owner, name] = trimmedModel.split("/");
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
    const message =
      initialPayload?.detail ||
      initialPayload?.error ||
      initialPayload?.message ||
      `Replicate request failed with ${response.status}`;
    throw new Error(message);
  }

  const finalPayload = await waitForReplicatePrediction(initialPayload, apiToken);
  const status = String(finalPayload?.status || "").toLowerCase();
  if (status !== "succeeded") {
    const errorMessage = finalPayload?.error || `Replicate prediction ended with status "${status}".`;
    throw new Error(errorMessage);
  }

  const outputUrls = extractReplicateOutputUrls(finalPayload);
  if (!outputUrls.length) {
    throw new Error("Replicate returned no image outputs.");
  }

  return {
    responsePayload: finalPayload
  };
}

async function downloadStageArtifacts({ stage, provider, responsePayload, outputDir }) {
  if (!responsePayload) {
    return [];
  }

  if (stage === "concept_image" && provider === "fal") {
    const images = Array.isArray(responsePayload?.images) ? responsePayload.images : [];
    if (!images.length) {
      return [];
    }

    const imageDir = path.join(outputDir, "images");
    ensureDirectory(imageDir);

    const downloadedFiles = [];
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      const fileUrl = String(image?.url || "").trim();
      if (!fileUrl) {
        continue;
      }

      const extension =
        extensionFromContentType(image?.content_type) ||
        extensionFromUrl(fileUrl) ||
        ".jpeg";
      const fileName = `image-${index + 1}${extension}`;
      const destinationPath = path.join(imageDir, fileName);
      await downloadToFile(fileUrl, destinationPath);
      downloadedFiles.push(relativeRepoPath(destinationPath));
    }

    return downloadedFiles;
  }

  if (stage === "concept_image" && provider === "replicate") {
    const outputUrls = extractReplicateOutputUrls(responsePayload);
    if (!outputUrls.length) {
      return [];
    }

    const imageDir = path.join(outputDir, "images");
    ensureDirectory(imageDir);

    const downloadedFiles = [];
    for (let index = 0; index < outputUrls.length; index += 1) {
      const fileUrl = outputUrls[index];
      const extension = extensionFromUrl(fileUrl) || ".png";
      const fileName = `image-${index + 1}${extension}`;
      const destinationPath = path.join(imageDir, fileName);
      await downloadToFile(fileUrl, destinationPath);
      downloadedFiles.push(relativeRepoPath(destinationPath));
    }

    return downloadedFiles;
  }

  return [];
}

async function runStage({ jobPack, stage, provider, prompt, dryRun, model, outputRootDir }) {
  if (stage === "rough_mesh" && provider === "manual") {
    const conceptReferences = findGeneratedStageRuns(outputRootDir, String(jobPack?.stop?.stopId || "").trim(), "concept_image");
    const cleanupChecklist = buildRoughMeshCleanupChecklist(jobPack);
    const suggestedArtifacts = buildRoughMeshSuggestedArtifacts(jobPack);
    const handoffPayload = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      stop: jobPack.stop,
      placement: jobPack.placement,
      runtimeTargets: jobPack.runtimeTargets,
      creativeDirection: jobPack.creativeDirection,
      scenePlan: jobPack.scenePlan,
      aiGuardrails: jobPack.aiGuardrails,
      prompt,
      conceptReferences,
      cleanupChecklist,
      suggestedWorkspaceArtifacts: suggestedArtifacts
    };

    return {
      outputText: renderRoughMeshOutput({
        jobPack,
        provider,
        model: model || "manual-handoff",
        prompt,
        conceptReferences,
        cleanupChecklist,
        suggestedArtifacts
      }),
      responsePayload: handoffPayload,
      extraFiles: [
        {
          relativePath: "mesh-handoff.json",
          contents: `${JSON.stringify(handoffPayload, null, 2)}\n`
        },
        {
          relativePath: "cleanup-checklist.md",
          contents: `# Rough Mesh Cleanup Checklist\n\n${cleanupChecklist.map((item) => `- ${item}`).join("\n")}\n`
        },
        {
          relativePath: "references.md",
          contents:
            conceptReferences.length > 0
              ? `# Concept References\n\n${conceptReferences
                  .map((reference) => {
                    const lines = [
                      `## ${reference.provider}`,
                      ``,
                      `- Status: ${reference.status}`,
                      `- Run type: ${reference.dryRun ? "dry-run" : "live"}`
                    ];
                    if (reference.finishedAt) {
                      lines.push(`- Finished: ${reference.finishedAt}`);
                    }
                    if (reference.outputFile) {
                      lines.push(`- Output: \`${reference.outputFile}\``);
                    }
                    if (reference.promptFile) {
                      lines.push(`- Prompt: \`${reference.promptFile}\``);
                    }
                    if (reference.imageFiles.length) {
                      lines.push(`- Images:`);
                      reference.imageFiles.forEach((imageFile) => {
                        lines.push(`  - \`${imageFile}\``);
                      });
                    }
                    return lines.join("\n");
                  })
                  .join("\n\n")}\n`
              : "# Concept References\n\n- No concept-image outputs found yet for this stop.\n"
        },
        {
          relativePath: "reviewed/README.md",
          contents: buildReviewedDropZoneGuide({
            jobPack,
            suggestedArtifacts
          })
        },
        {
          relativePath: `reviewed/${String(jobPack?.stop?.stopId || "stop").trim()}-cleanup-notes-template.md`,
          contents: buildCleanupNotesTemplate(jobPack)
        }
      ],
      model: model || "manual-handoff",
      status: dryRun ? "dry_run" : "prepared"
    };
  }

  if (dryRun) {
    return {
      outputText: [
        `# Dry Run`,
        ``,
        `- Stop: ${jobPack.stop.stopTitle}`,
        `- Stage: ${stage}`,
        `- Provider: ${provider}`,
        `- Job: ${jobPack.jobId}`,
        ``,
        `This run did not call an external API. See \`prompt.txt\` for the provider-ready prompt.`
      ].join("\n"),
      responsePayload: null,
      status: "dry_run"
    };
  }

  if (stage === "text_brief" && provider === "anthropic") {
    const anthropicModel = model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
    const maxTokens = Number(process.env.ANTHROPIC_MAX_TOKENS || "1200");
    const result = await runAnthropicTextBrief({
      prompt,
      model: anthropicModel,
      maxTokens
    });
    return {
      ...result,
      model: anthropicModel,
      status: "completed"
    };
  }

  if (stage === "concept_image" && provider === "fal") {
    const falModel = model || process.env.FAL_DEFAULT_MODEL || "fal-ai/flux/dev";
    const imageSize = process.env.FAL_DEFAULT_IMAGE_SIZE || "landscape_4_3";
    const outputFormat = process.env.FAL_DEFAULT_OUTPUT_FORMAT || "jpeg";
    const result = await runFalConceptImage({
      prompt,
      model: falModel,
      imageSize,
      outputFormat
    });
    return {
      ...result,
      model: falModel,
      status: "completed"
    };
  }

  if (stage === "concept_image" && provider === "replicate") {
    const replicateModel = model || process.env.REPLICATE_DEFAULT_MODEL || "black-forest-labs/flux-1.1-pro";
    const aspectRatio = process.env.REPLICATE_DEFAULT_ASPECT_RATIO || "3:2";
    const outputFormat = process.env.REPLICATE_DEFAULT_OUTPUT_FORMAT || "png";
    const result = await runReplicateConceptImage({
      prompt,
      model: replicateModel,
      aspectRatio,
      outputFormat
    });
    return {
      ...result,
      model: replicateModel,
      status: "completed"
    };
  }

  throw new Error(
    `Live provider support is not implemented for stage "${stage}" with provider "${provider}". Use --dry-run for now.`
  );
}

async function main() {
  loadDotEnv(path.join(rootDir, ".env"));
  const args = parseArgs(process.argv.slice(2));
  const jobPacks = loadJobPacks(args.jobDir)
    .filter((entry) => !args.stopId || entry.data?.stop?.stopId === args.stopId)
    .slice(0, args.limit);

  if (!jobPacks.length) {
    throw new Error("No matching AR job packs found.");
  }

  ensureDirectory(args.outputDir);

  let completedCount = 0;
  let skippedCount = 0;
  for (const entry of jobPacks) {
    const jobPack = entry.data;
    const stopId = String(jobPack?.stop?.stopId || "").trim();
    if (!stopId) {
      throw new Error(`Invalid job pack missing stopId: ${relativeRepoPath(entry.path)}`);
    }

    const supportedStages = Array.isArray(jobPack?.pipeline?.apiStages) ? jobPack.pipeline.apiStages : [];
    if (!supportedStages.includes(args.stage)) {
      console.log(`Skipping ${stopId}: stage ${args.stage} is not listed in the job pack.`);
      skippedCount += 1;
      continue;
    }

    const prompt = selectPrompt(jobPack, args.stage);
    if (!prompt) {
      throw new Error(`Job pack prompt is empty for ${stopId}/${args.stage}`);
    }

    const stageOutputDir = resolveStageOutputDir(args.outputDir, stopId, args.stage, args.provider);
    const outputPath = path.join(stageOutputDir, "output.md");
    if (fs.existsSync(outputPath) && !args.force) {
      console.log(`Skipping ${stopId}: ${relativeRepoPath(outputPath)} already exists (use --force to overwrite).`);
      skippedCount += 1;
      continue;
    }

    const startedAt = new Date().toISOString();
    const result = await runStage({
      jobPack,
      stage: args.stage,
      provider: args.provider,
      prompt,
      dryRun: args.dryRun,
      model: args.model,
      outputRootDir: args.outputDir
    });
    const finishedAt = new Date().toISOString();
    const downloadedFiles = await downloadStageArtifacts({
      stage: args.stage,
      provider: args.provider,
      responsePayload: result.responsePayload,
      outputDir: stageOutputDir
    });
    const outputText =
      result.outputText ||
      (args.stage === "concept_image" &&
      (args.provider === "fal" || args.provider === "replicate") &&
      result.responsePayload
        ? renderConceptImageOutput({
            jobPack,
            provider: args.provider,
            model: result.model || args.model || "",
            responsePayload: result.responsePayload,
            downloadedFiles
          })
        : readExistingOutput(outputPath));

    const runRecord = {
      schemaVersion: 1,
      jobId: jobPack.jobId,
      stopId,
      stopTitle: jobPack.stop.stopTitle,
      stage: args.stage,
      provider: args.provider,
      dryRun: args.dryRun,
      status: result.status || "completed",
      startedAt,
      finishedAt,
      sourceJobPack: relativeRepoPath(entry.path),
      outputDir: relativeRepoPath(stageOutputDir),
      files: {
        prompt: `${relativeRepoPath(stageOutputDir)}/prompt.txt`,
        output: `${relativeRepoPath(stageOutputDir)}/output.md`,
        response: result.responsePayload ? `${relativeRepoPath(stageOutputDir)}/response.json` : null,
        artifacts: downloadedFiles,
        extras: Array.isArray(result.extraFiles)
          ? result.extraFiles.map((file) => `${relativeRepoPath(stageOutputDir)}/${file.relativePath}`)
          : []
      },
      model: result.model || args.model || null
    };

    writeStageFiles({
      outputDir: stageOutputDir,
      prompt,
      outputText,
      responsePayload: result.responsePayload,
      runRecord,
      extraFiles: result.extraFiles
    });

    completedCount += 1;
    console.log(`Completed ${stopId}/${args.stage}/${args.provider} -> ${relativeRepoPath(stageOutputDir)}`);
  }

  console.log(
    `AR job runner complete. ${completedCount} run(s) completed, ${skippedCount} skipped.${args.dryRun ? " Dry-run mode only." : ""}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
