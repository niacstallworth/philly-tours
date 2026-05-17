import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadDotEnvFile } from "./lib/provider-clients.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const blogDir = path.join(repoRoot, "content/blog");
const blogAssetDir = path.join(repoRoot, "webapp/assets/blog");
const frameworkPath = path.join(repoRoot, "docs/blog-editorial-framework.md");
const toursPath = path.join(repoRoot, "src/data/tours.ts");
const arBriefsDir = path.join(repoRoot, "docs/ar-briefs");

loadDotEnvFile(path.join(repoRoot, ".env"));
loadDotEnvFile(path.join(repoRoot, ".env.local"));
loadDotEnvFile(path.join(repoRoot, ".env.production.local"));

const TEXT_PROVIDER = (process.env.BLOG_TEXT_PROVIDER || "anthropic").trim().toLowerCase();
const DEFAULT_OPENAI_TEXT_MODEL = process.env.OPENAI_BLOG_MODEL || "gpt-5";
const DEFAULT_ANTHROPIC_TEXT_MODEL = process.env.ANTHROPIC_BLOG_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const DEFAULT_IMAGE_MODEL = process.env.OPENAI_BLOG_IMAGE_MODEL || "gpt-image-1";
const DEFAULT_TIME_ZONE = process.env.BLOG_TIME_ZONE || "America/New_York";

function parseArgs(argv) {
  const args = {
    date: "",
    dryRun: false,
    force: false,
    skipImage: process.env.BLOG_SKIP_IMAGE === "1"
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--date") {
      args.date = argv[index + 1] || "";
      index += 1;
    } else if (value === "--dry-run") {
      args.dryRun = true;
    } else if (value === "--force") {
      args.force = true;
    } else if (value === "--skip-image") {
      args.skipImage = true;
    }
  }
  return args;
}

function todayInTimeZone(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 88)
    .replace(/-+$/g, "");
}

function yamlScalar(value) {
  return JSON.stringify(String(value || "").trim());
}

function existingBlogSummaries() {
  if (!fs.existsSync(blogDir)) {
    return [];
  }
  return fs
    .readdirSync(blogDir)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort()
    .map((fileName) => {
      const raw = readIfExists(path.join(blogDir, fileName));
      const title = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] || fileName.replace(/\.md$/, "");
      const excerpt = raw.match(/^excerpt:\s*["']?(.+?)["']?\s*$/m)?.[1] || "";
      return { fileName, title, excerpt };
    });
}

function listCandidateBriefs() {
  if (!fs.existsSync(arBriefsDir)) {
    return "";
  }
  return fs
    .readdirSync(arBriefsDir)
    .filter((fileName) => fileName.endsWith(".md") && fileName !== "README.md")
    .sort()
    .slice(0, 36)
    .map((fileName) => {
      const raw = readIfExists(path.join(arBriefsDir, fileName));
      const title = raw.match(/^#\s+(.+)$/m)?.[1] || fileName.replace(/\.md$/, "");
      const tour = raw.match(/^- Tour:\s*(.+)$/m)?.[1] || "";
      return `- ${title}${tour ? ` (${tour})` : ""}: docs/ar-briefs/${fileName}`;
    })
    .join("\n");
}

function compactToursContext() {
  const raw = readIfExists(toursPath);
  const matches = [...raw.matchAll(/"title":\s*"([^"]+)"[\s\S]{0,420}?"description":\s*"([^"]+)"/g)]
    .map((match) => `- ${match[1]}: ${match[2]}`)
    .filter((line) => /Black|African|Cecil|Du Bois|Drew|Bates|Latimer|Coltrane|Frazier|Iverson|Allen|Absalom|Marian|Overbrook|Sonny|Mother Bethel|Johnson House|Woodlands/i.test(line));
  return matches.slice(0, 80).join("\n");
}

function extractJsonObject(text) {
  const trimmed = String(text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`OpenAI response did not contain JSON. Response started: ${trimmed.slice(0, 400)}`);
    }
    return JSON.parse(match[0]);
  }
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string") {
    return payload.output_text;
  }
  const chunks = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

async function callOpenAIResponse({ input, instructions, tools }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for automated blog generation.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_TEXT_MODEL,
      instructions,
      input,
      tools,
      max_output_tokens: 7000
    })
  });
  const raw = await response.text();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error(`OpenAI returned non-JSON response: ${raw.slice(0, 500)}`);
  }
  if (!response.ok) {
    throw new Error(payload?.error?.message || `OpenAI response failed with ${response.status}`);
  }
  return extractResponseText(payload);
}

function extractAnthropicText(payload) {
  const chunks = [];
  for (const item of payload?.content || []) {
    if (item?.type === "text" && typeof item.text === "string") {
      chunks.push(item.text);
    }
  }
  return chunks.join("\n").trim();
}

async function callAnthropicResponse({ input, instructions }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required when BLOG_TEXT_PROVIDER=anthropic.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: DEFAULT_ANTHROPIC_TEXT_MODEL,
      max_tokens: 7000,
      system: instructions,
      messages: [{ role: "user", content: input }],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 4,
          user_location: {
            type: "approximate",
            city: "Philadelphia",
            region: "Pennsylvania",
            country: "US",
            timezone: "America/New_York"
          }
        }
      ]
    })
  });
  const raw = await response.text();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error(`Anthropic returned non-JSON response: ${raw.slice(0, 500)}`);
  }
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Anthropic response failed with ${response.status}`);
  }
  return extractAnthropicText(payload);
}

async function draftBlogPost({ date }) {
  const existing = existingBlogSummaries();
  const instructions = [
    "You write Philly Tours blog posts that connect American history to current civic life.",
    "Use web search for recent, reliable current-event sources.",
    "Return one JSON object only. Do not wrap it in Markdown.",
    "Do not invent quotes, facts, citations, dates, or URLs.",
    "Avoid European history and Jewish history as standalone topics.",
    "Use Markdown links inside bodyMarkdown for sources.",
    "The post must be 700 to 1100 words and include at least two current-context source links.",
    "Use a route stop, person, or place from the provided Philly Tours context.",
    "Do not duplicate the existing posts."
  ].join("\n");

  const input = [
    `Publication date: ${date}`,
    "",
    "Required JSON keys:",
    "{",
    '  "title": string,',
    '  "slugStem": string,',
    '  "excerpt": string,',
    '  "tags": string[],',
    '  "heroImageAlt": string,',
    '  "mediaCaption": string,',
    '  "bodyMarkdown": string,',
    '  "imagePrompt": string,',
    '  "sources": [{"title": string, "url": string}]',
    "}",
    "",
    "Existing posts:",
    existing.map((post) => `- ${post.fileName}: ${post.title} - ${post.excerpt}`).join("\n") || "- none",
    "",
    "Editorial framework:",
    readIfExists(frameworkPath).slice(0, 7000),
    "",
    "Candidate AR briefs:",
    listCandidateBriefs(),
    "",
    "Tour context:",
    compactToursContext(),
    "",
    "Image prompt requirements: square 1:1 editorial collage, no text/logos/watermarks, historically respectful, Philadelphia civic-history imagery, strong mobile-feed composition."
  ].join("\n");

  if (TEXT_PROVIDER === "anthropic") {
    const text = await callAnthropicResponse({ input, instructions });
    return extractJsonObject(text);
  }

  if (TEXT_PROVIDER !== "openai") {
    throw new Error(`Unsupported BLOG_TEXT_PROVIDER: ${TEXT_PROVIDER}. Use "anthropic" or "openai".`);
  }

  const toolSets = [[{ type: "web_search" }], [{ type: "web_search_preview" }]];
  let lastError;
  for (const tools of toolSets) {
    try {
      const text = await callOpenAIResponse({ input, instructions, tools });
      return extractJsonObject(text);
    } catch (error) {
      lastError = error;
      if (!String(error?.message || "").toLowerCase().includes("web_search")) {
        throw error;
      }
    }
  }
  throw lastError;
}

function validateDraft(draft) {
  const required = ["title", "slugStem", "excerpt", "bodyMarkdown", "imagePrompt"];
  for (const key of required) {
    if (!String(draft?.[key] || "").trim()) {
      throw new Error(`Draft is missing ${key}.`);
    }
  }
  if (!Array.isArray(draft.tags) || draft.tags.length < 3) {
    throw new Error("Draft must include at least three tags.");
  }
  if (!Array.isArray(draft.sources) || draft.sources.length < 2) {
    throw new Error("Draft must include at least two sources.");
  }
  const wordCount = String(draft.bodyMarkdown || "").trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 650 || wordCount > 1250) {
    throw new Error(`Draft word count ${wordCount} is outside the expected range.`);
  }
}

async function generateHeroImage({ prompt, outputPath }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for automated image generation.");
  }
  const requestBody = {
    model: DEFAULT_IMAGE_MODEL,
    prompt,
    size: "1024x1024",
    n: 1,
    output_format: "jpeg"
  };

  let response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok && requestBody.output_format) {
    delete requestBody.output_format;
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || `OpenAI image generation failed with ${response.status}`);
  }

  const image = Array.isArray(payload?.data) ? payload.data[0] : null;
  if (image?.b64_json) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(image.b64_json, "base64"));
    return;
  }
  if (image?.url) {
    const fileResponse = await fetch(image.url);
    if (!fileResponse.ok) {
      throw new Error(`Generated image download failed with ${fileResponse.status}`);
    }
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(await fileResponse.arrayBuffer()));
    return;
  }
  throw new Error("OpenAI image generation returned no image.");
}

function renderMarkdown({ date, draft, imagePath }) {
  const tags = draft.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 8).join(", ");
  const body = String(draft.bodyMarkdown || "").trim();
  const frontMatter = [
    "---",
    `title: ${yamlScalar(draft.title)}`,
    `publishedAt: ${yamlScalar(date)}`,
    `excerpt: ${yamlScalar(draft.excerpt)}`,
    `tags: ${yamlScalar(tags)}`
  ];
  if (String(imagePath || "").trim()) {
    frontMatter.push(
      `heroImage: ${yamlScalar(imagePath)}`,
      `heroImageAlt: ${yamlScalar(draft.heroImageAlt || draft.title)}`,
      `mediaCaption: ${yamlScalar(draft.mediaCaption || "A Philly Tours route stop connected to American history and present-day civic life.")}`
    );
  }
  return [
    ...frontMatter,
    "---",
    "",
    body,
    ""
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const date = args.date || todayInTimeZone(DEFAULT_TIME_ZONE);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid --date value: ${date}`);
  }

  fs.mkdirSync(blogDir, { recursive: true });
  const existingForDate = fs.readdirSync(blogDir).filter((fileName) => fileName.startsWith(`${date}-`) && fileName.endsWith(".md"));
  if (existingForDate.length && !args.force) {
    console.log(`Blog post already exists for ${date}: ${existingForDate.join(", ")}`);
    console.log("No new blog post generated.");
    return;
  }

  const draft = await draftBlogPost({ date });
  validateDraft(draft);
  const slugStem = slugify(draft.slugStem || draft.title);
  if (!slugStem) {
    throw new Error("Unable to derive slug.");
  }
  const postSlug = `${date}-${slugStem}`;
  const postPath = path.join(blogDir, `${postSlug}.md`);
  const imageFileName = `${slugStem}.jpg`;
  const imageAssetPath = path.join(blogAssetDir, imageFileName);
  const imagePublicPath = args.skipImage ? "" : `/assets/blog/${imageFileName}`;

  if (!args.skipImage) {
    await generateHeroImage({ prompt: draft.imagePrompt, outputPath: imageAssetPath });
  }
  const markdown = renderMarkdown({ date, draft, imagePath: imagePublicPath });

  if (args.dryRun) {
    console.log(markdown);
    return;
  }

  fs.writeFileSync(postPath, markdown);
  console.log(`Wrote ${path.relative(repoRoot, postPath)}`);
  if (!args.skipImage) {
    console.log(`Wrote ${path.relative(repoRoot, imageAssetPath)}`);
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
