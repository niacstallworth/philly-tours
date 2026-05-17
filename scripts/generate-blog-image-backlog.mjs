import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const blogDir = path.join(repoRoot, "content/blog");
const outputPath = path.join(repoRoot, "docs/blog-image-backlog.md");

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function parseFrontMatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { attributes: {}, body: raw };
  }
  const attributes = {};
  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      continue;
    }
    const [, key, value] = keyMatch;
    if (!value.trim() && lines[index + 1]?.startsWith("  - ")) {
      const values = [];
      while (lines[index + 1]?.startsWith("  - ")) {
        index += 1;
        values.push(lines[index].replace(/^\s*-\s*/, "").trim());
      }
      attributes[key] = values;
    } else {
      attributes[key] = value.trim().replace(/^["']|["']$/g, "");
    }
  }
  return {
    attributes,
    body: raw.slice(match[0].length)
  };
}

function stripMarkdown(markdown) {
  return String(markdown || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#-]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromFileName(fileName) {
  return fileName.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function postUrl(fileName) {
  return `https://philly-tours.com/blog/${fileName.replace(/\.md$/, "")}/`;
}

function promptForPost({ title, excerpt, body }) {
  const context = stripMarkdown(`${excerpt}\n\n${body}`).slice(0, 900);
  return [
    "Create a polished editorial social-media image for a Philadelphia history walking-tour blog post.",
    "Style: warm cinematic Meta AI / Emu-like editorial collage, realistic but art-directed, clean high-detail composition, subtle archival paper textures, modern mobile-feed framing.",
    "Subject matter: Philadelphia civic history, public institutions, neighborhood life, and American history. Include historically respectful visual cues without depicting exact copyrighted photographs.",
    "Composition: square 1:1 hero image, strong central focal point, layered city-map texture, soft depth, natural light, rich but not neon color.",
    "Avoid: text, logos, watermarks, distorted hands, fake signage, caricature, sensationalism, gore, weapons-as-focus.",
    `Blog title: ${title}`,
    `Blog context: ${context}`
  ].join(" ");
}

function missingImagePosts() {
  if (!fs.existsSync(blogDir)) {
    return [];
  }
  return fs
    .readdirSync(blogDir)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort()
    .map((fileName) => {
      const raw = readIfExists(path.join(blogDir, fileName));
      const { attributes, body } = parseFrontMatter(raw);
      return {
        fileName,
        title: attributes.title || slugFromFileName(fileName),
        excerpt: attributes.excerpt || "",
        tags: Array.isArray(attributes.tags) ? attributes.tags : [],
        heroImage: String(attributes.heroImage || "").trim(),
        body
      };
    })
    .filter((post) => !post.heroImage);
}

const posts = missingImagePosts();
const generatedAt = new Date().toISOString();
const lines = [
  "# Blog Image Backlog",
  "",
  `Generated: ${generatedAt}`,
  "",
  "Use these prompts with Meta AI Create or another manually reviewed image generator. After approval, save each image to `webapp/assets/blog/<slug>.jpg`, then add `heroImage`, `heroImageAlt`, and `mediaCaption` to the post frontmatter before rebuilding.",
  ""
];

if (!posts.length) {
  lines.push("No blog posts are missing hero images.", "");
} else {
  for (const post of posts) {
    const slug = slugFromFileName(post.fileName);
    lines.push(
      `## ${post.title}`,
      "",
      `- Source: \`content/blog/${post.fileName}\``,
      `- Live URL: ${postUrl(post.fileName)}`,
      `- Suggested asset path: \`webapp/assets/blog/${slug}.jpg\``,
      "",
      "```text",
      promptForPost(post),
      "```",
      ""
    );
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n").trim()}\n`);
console.log(`Wrote ${path.relative(repoRoot, outputPath)} with ${posts.length} missing-image post${posts.length === 1 ? "" : "s"}.`);
