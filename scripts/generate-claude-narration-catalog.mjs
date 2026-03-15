import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { readCatalogCsv, writeCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const toursPath = path.join(rootDir, "src", "data", "tours.ts");
const csvPath = path.join(rootDir, "docs", "narration-script-catalog.csv");
const csvHeaders = ["stopId", "variant", "title", "outputFile", "voiceId", "engine", "textType", "text"];

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const idx = line.indexOf("=");
    if (idx <= 0) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
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
    limit: null,
    stopId: null,
    variant: null,
    force: false,
    output: csvPath
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--limit") {
      args.limit = Number(argv[i + 1] || "0") || null;
      i += 1;
      continue;
    }
    if (arg === "--stop-id") {
      args.stopId = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg === "--variant") {
      args.variant = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg === "--output") {
      args.output = argv[i + 1] || csvPath;
      i += 1;
      continue;
    }
    if (arg === "--force") {
      args.force = true;
    }
  }

  return args;
}

function loadTours() {
  const raw = fs.readFileSync(toursPath, "utf8");
  const match = raw.match(/export const tours: Tour\[\] = ([\s\S]*);\s*$/);
  if (!match) {
    throw new Error("Unable to parse tours from src/data/tours.ts");
  }
  const source = `const tours = ${match[1]}; this.__tours = tours;`;
  const context = vm.createContext({});
  new vm.Script(source).runInContext(context);
  return context.__tours;
}

function slugToOutputFile(stop, variant) {
  const audioUrl = String(stop.audioUrl || "").trim();
  if (audioUrl.startsWith("/audio/")) {
    const basename = path.basename(audioUrl);
    const ext = path.extname(basename) || ".mp3";
    const stem = basename.slice(0, basename.length - ext.length);
    if (stem.endsWith("-drive") || stem.endsWith("-walk")) {
      return `${stem}${ext}`;
    }
    return `${stem}-${variant}${ext}`;
  }
  return `${stop.id.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}-${variant}.mp3`;
}

function extractLocation(description) {
  const parts = String(description || "").split("|").map((part) => part.trim());
  const location = parts.find((part) => part.startsWith("Location:"));
  return location ? location.replace(/^Location:\s*/, "") : "";
}

function existingRowKey(stopId, variant) {
  return `${stopId}::${variant}`;
}

function buildPrompt({ tour, stop, variant }) {
  const location = extractLocation(stop.description);
  const modeNotes =
    variant === "drive"
      ? [
          "Write for a listener approaching by car.",
          "Keep it concise and easy to follow while driving.",
          "Target 35 to 70 words.",
          "End with a practical arrival cue or invitation to continue on foot."
        ]
      : [
          "Write for a listener who is standing at the site on foot.",
          "Make it a bit richer and more atmospheric than the drive version.",
          "Target 70 to 130 words.",
          "Include one concrete thing to notice or imagine at the location."
        ];

  return [
    "You write narration for a premium Philadelphia heritage tour app.",
    "Return JSON only with this exact schema: {\"text\":\"...\"}",
    "Do not wrap the JSON in markdown fences.",
    "Do not invent uncertain facts beyond the source description.",
    "Use a warm, polished, historically grounded tone.",
    "Avoid cliches, exclamation marks, and sales language.",
    ...modeNotes,
    "",
    `Tour title: ${tour.title}`,
    `Stop title: ${stop.title}`,
    `Stop description: ${stop.description}`,
    `Location: ${location || "Unknown"}`,
    `Trigger radius: ${stop.triggerRadiusM} meters`,
    `Variant: ${variant}`
  ].join("\n");
}

function extractResponseText(payload) {
  const content = Array.isArray(payload?.content) ? payload.content : [];
  const raw = content
    .filter((block) => block?.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!raw) {
    throw new Error("Anthropic returned no text content.");
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.text === "string" && parsed.text.trim()) {
      return parsed.text.trim();
    }
  } catch {}

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed?.text === "string" && parsed.text.trim()) {
      return parsed.text.trim();
    }
  }

  throw new Error(`Unable to parse JSON narration text from Anthropic response: ${raw.slice(0, 300)}`);
}

async function generateNarrationRow({ apiKey, model, maxTokens, tour, stop, variant, voiceId, engine }) {
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
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: buildPrompt({ tour, stop, variant })
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
    stopId: stop.id,
    variant,
    title: stop.title,
    outputFile: slugToOutputFile(stop, variant),
    voiceId,
    engine,
    textType: "text",
    text: extractResponseText(payload)
  };
}

loadDotEnv(path.join(rootDir, ".env"));

const args = parseArgs(process.argv.slice(2));
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error("ANTHROPIC_API_KEY is required in .env or the environment.");
}

const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const maxTokens = Number(process.env.ANTHROPIC_MAX_TOKENS || "400");
const voiceId = process.env.POLLY_DEFAULT_VOICE_ID || "Amy";
const engine = process.env.POLLY_DEFAULT_ENGINE || "neural";
const tours = loadTours();
const existingCsv = fs.existsSync(args.output) ? readCatalogCsv(args.output) : { headers: csvHeaders, records: [] };
const recordMap = new Map(existingCsv.records.map((record) => [existingRowKey(record.stopId, record.variant), record]));

const targets = [];
for (const tour of tours) {
  for (const stop of tour.stops) {
    for (const variant of ["drive", "walk"]) {
      if (args.stopId && stop.id !== args.stopId) {
        continue;
      }
      if (args.variant && variant !== args.variant) {
        continue;
      }
      const key = existingRowKey(stop.id, variant);
      if (recordMap.has(key) && !args.force) {
        continue;
      }
      targets.push({ tour, stop, variant, key });
    }
  }
}

const limitedTargets = args.limit ? targets.slice(0, args.limit) : targets;
let generatedCount = 0;
for (const target of limitedTargets) {
  const row = await generateNarrationRow({
    apiKey,
    model,
    maxTokens,
    tour: target.tour,
    stop: target.stop,
    variant: target.variant,
    voiceId,
    engine
  });
  recordMap.set(target.key, row);
  generatedCount += 1;
  console.log(`Generated script for ${target.stop.id}/${target.variant}`);
}

const sortedRecords = Array.from(recordMap.values()).sort((left, right) => {
  if (left.stopId === right.stopId) {
    return left.variant.localeCompare(right.variant);
  }
  return left.stopId.localeCompare(right.stopId);
});

writeCatalogCsv(args.output, csvHeaders, sortedRecords);
console.log(`Claude narration catalog complete. ${generatedCount} row(s) generated.`);
