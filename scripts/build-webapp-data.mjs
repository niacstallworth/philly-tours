import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const sourcePath = path.join(repoRoot, "src/data/tours.ts");
const narrationCatalogPath = path.join(repoRoot, "src/data/narrationCatalog.ts");
const narrationScriptMapPath = path.join(repoRoot, "src/data/narrationScriptMap.ts");
const blogContentDir = path.join(repoRoot, "content/blog");
const toursOutputPath = path.join(repoRoot, "webapp/tours-data.js");
const narrationOutputPath = path.join(repoRoot, "webapp/narration-data.js");
const blogOutputPath = path.join(repoRoot, "webapp/blog-data.js");
const configOutputPath = path.join(repoRoot, "webapp/site-config.js");
const rssOutputPath = path.join(repoRoot, "webapp/rss.xml");
const iosModelsDir = path.join(repoRoot, "ios/PhillyARTours/ARAssets/models");
const webModelsDir = path.join(repoRoot, "assets/models");

const iosModelFiles = fs.existsSync(iosModelsDir) ? new Set(fs.readdirSync(iosModelsDir)) : new Set();
const webModelFiles = fs.existsSync(webModelsDir) ? new Set(fs.readdirSync(webModelsDir)) : new Set();

function evaluateModule(filePath, exportName, replacement) {
  let source = fs.readFileSync(filePath, "utf8");
  source = source.replace(/^import .*\n/gm, "");
  source = source.replace(/^export type [^{=\n]+=\s*{[\s\S]*?^};\n/gm, "");
  source = source.replace(/^export type .*;\n/gm, "");
  source = source.replace(replacement, `globalThis.${exportName} =`);
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.globalThis[exportName];
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFrontmatter(raw) {
  const normalized = String(raw || "").replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { attributes: {}, body: normalized.trim() };
  }

  const endIndex = normalized.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return { attributes: {}, body: normalized.trim() };
  }

  const frontmatter = normalized.slice(4, endIndex);
  const body = normalized.slice(endIndex + 5).trim();
  const attributes = {};

  for (const rawLine of frontmatter.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    attributes[key] = value;
  }

  return { attributes, body };
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }
    html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) {
      return;
    }
    html.push(`<ul>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = Math.min(3, headingMatch[1].length);
      html.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1]);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return html.join("\n");
}

function stripMarkdown(value) {
  return String(value || "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function buildExcerpt(text, maxLength = 180) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function loadBlogPosts() {
  if (!fs.existsSync(blogContentDir)) {
    return [];
  }

  return fs
    .readdirSync(blogContentDir)
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => {
      const filePath = path.join(blogContentDir, entry);
      const { attributes, body } = parseFrontmatter(fs.readFileSync(filePath, "utf8"));
      const plainText = stripMarkdown(body);
      const title = String(attributes.title || path.basename(entry, ".md")).trim();
      const slug = slugify(attributes.slug || path.basename(entry, ".md"));
      const publishedAt = String(attributes.publishedAt || "").trim();
      const excerpt = String(attributes.excerpt || "").trim() || buildExcerpt(plainText);
      const tags = String(attributes.tags || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      return {
        slug,
        title,
        publishedAt,
        excerpt,
        tags,
        bodyHtml: markdownToHtml(body),
        bodyText: plainText
      };
    })
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
}

function renderRssXml(posts) {
  const lastBuildDate = posts[0]?.publishedAt
    ? new Date(`${posts[0].publishedAt}T12:00:00Z`).toUTCString()
    : new Date().toUTCString();
  const items = posts
    .map((post) => {
      const postUrl = `https://philly-tours.com/#tab=blog&post=${encodeURIComponent(post.slug)}`;
      const pubDate = post.publishedAt ? new Date(`${post.publishedAt}T12:00:00Z`).toUTCString() : lastBuildDate;
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(postUrl)}</link>`,
        `      <guid>${escapeXml(postUrl)}</guid>`,
        `      <pubDate>${escapeXml(pubDate)}</pubDate>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        "    </item>"
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<rss version=\"2.0\">",
    "  <channel>",
    "    <title>Founders Threads Blog</title>",
    "    <link>https://philly-tours.com/</link>",
    "    <description>Route launches, guided-tour notes, and product updates from Founders Threads.</description>",
    "    <language>en-us</language>",
    `    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>`,
    items,
    "  </channel>",
    "</rss>",
    ""
  ].join("\n");
}

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

loadDotEnvFile(path.join(repoRoot, "server.local.env"));
loadDotEnvFile(path.join(repoRoot, ".env.server.local"));
loadDotEnvFile(path.join(repoRoot, ".env.server"));
loadDotEnvFile(path.join(repoRoot, ".env.production.local"));
loadDotEnvFile(path.join(repoRoot, ".env.web.local"));
loadDotEnvFile(path.join(repoRoot, ".env.local"));
loadDotEnvFile(path.join(repoRoot, ".env"));

const tours = evaluateModule(sourcePath, "__tours", /export const tours\s*:\s*Tour\[\]\s*=/);
const blogPosts = loadBlogPosts();
const narrationCatalogByStopId = evaluateModule(
  narrationCatalogPath,
  "__narrationCatalogByStopId",
  /export const narrationCatalogByStopId\s*:\s*Record<string,\s*NarrationCatalogEntry>\s*=/
);
const narrationScriptMapByStopId = evaluateModule(
  narrationScriptMapPath,
  "__narrationScriptMapByStopId",
  /export const narrationScriptMapByStopId\s*:\s*Record<string,\s*NarrationScriptEntry>\s*=/
);

const toursBanner = [
  "// Auto-generated by scripts/build-webapp-data.mjs",
  "// Source: src/data/tours.ts",
  `window.PHILLY_TOURS_DATA = ${JSON.stringify(tours, null, 2)};`,
  ""
].join("\n");

const narrationBanner = [
  "// Auto-generated by scripts/build-webapp-data.mjs",
  "// Sources: src/data/narrationCatalog.ts, src/data/narrationScriptMap.ts",
  `window.PHILLY_TOURS_NARRATION = ${JSON.stringify(
    {
      catalogByStopId: narrationCatalogByStopId,
      scriptMapByStopId: narrationScriptMapByStopId
    },
    null,
    2
  )};`,
  ""
].join("\n");

const blogBanner = [
  "// Auto-generated by scripts/build-webapp-data.mjs",
  "// Source: content/blog/*.md",
  `window.PHILLY_TOURS_BLOG = ${JSON.stringify(blogPosts, null, 2)};`,
  ""
].join("\n");

const arStops = tours.flatMap((tour) =>
  (tour.stops || []).map((stop) => ({
    id: stop.id,
    title: stop.title,
    arType: stop.arType || "story_card",
    assetNeeded: stop.assetNeeded || "",
    modelUrl: stop.modelUrl || "",
    estimatedEffort: stop.estimatedEffort || "",
    webModelAvailable: stop.modelUrl
      ? webModelFiles.has(`${path.basename(stop.modelUrl, path.extname(stop.modelUrl))}.glb`)
      : false,
    iosModelAvailable: stop.modelUrl
      ? iosModelFiles.has(`${path.basename(stop.modelUrl, path.extname(stop.modelUrl))}.usdz`)
      : false
  }))
);

const arBanner = [
  "// Auto-generated by scripts/build-webapp-data.mjs",
  "// Source: src/data/tours.ts AR fields",
  `window.PHILLY_TOURS_AR = ${JSON.stringify(
    Object.fromEntries(arStops.map((stop) => [stop.id, stop])),
    null,
    2
  )};`,
  ""
].join("\n");

const siteConfig = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  newsletterTable: "newsletter_subscribers",
  syncServerUrl: "",
  cloudflareTurnstileSiteKey: "",
  googleMapsProjectUrl: "",
  googleMapsJsApiKey: "",
  googleMapsMapId: "",
  inPersonTourGuidePriceCents: "",
  inPersonTourGuideLabel: process.env.EXPO_PUBLIC_IN_PERSON_TOUR_GUIDE_LABEL || "In-person tour guide",
  iosAppStoreUrl: "",
  androidPlayStoreUrl: ""
};

const configBanner = [
  "// Auto-generated by scripts/build-webapp-data.mjs",
  "// Source: source-safe placeholder values. Deploy output injects browser-safe env values.",
  `window.PHILLY_TOURS_CONFIG = ${JSON.stringify(siteConfig, null, 2)};`,
  ""
].join("\n");

fs.writeFileSync(toursOutputPath, toursBanner);
fs.writeFileSync(narrationOutputPath, narrationBanner);
fs.writeFileSync(blogOutputPath, blogBanner);
fs.writeFileSync(path.join(repoRoot, "webapp/ar-data.js"), arBanner);
fs.writeFileSync(configOutputPath, configBanner);
fs.writeFileSync(rssOutputPath, renderRssXml(blogPosts));
console.log(`Wrote ${tours.length} tours to ${path.relative(repoRoot, toursOutputPath)}`);
console.log(`Wrote narration data to ${path.relative(repoRoot, narrationOutputPath)}`);
console.log(`Wrote ${blogPosts.length} blog posts to ${path.relative(repoRoot, blogOutputPath)}`);
console.log("Wrote AR overlay data to webapp/ar-data.js");
console.log(`Wrote site config to ${path.relative(repoRoot, configOutputPath)}`);
console.log(`Wrote RSS feed to ${path.relative(repoRoot, rssOutputPath)}`);
