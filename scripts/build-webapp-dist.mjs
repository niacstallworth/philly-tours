import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const webappDir = path.join(repoRoot, "webapp");
const assetsDir = path.join(repoRoot, "assets");
const outputDir = path.join(repoRoot, "web-dist");

function copyFilter(source) {
  return path.basename(source) !== ".DS_Store";
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

fs.cpSync(webappDir, outputDir, { recursive: true, filter: copyFilter });
fs.cpSync(assetsDir, path.join(outputDir, "assets"), { recursive: true, filter: copyFilter });

console.log("Built deployable web-dist directory");
