import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const webappDir = path.join(repoRoot, "webapp");
const assetsDir = path.join(repoRoot, "assets");
const outputDir = path.join(repoRoot, "web-dist");
const assetVersion = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

function copyFilter(source) {
  return path.basename(source) !== ".DS_Store";
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

fs.cpSync(webappDir, outputDir, { recursive: true, filter: copyFilter });
fs.cpSync(assetsDir, path.join(outputDir, "assets"), { recursive: true, filter: copyFilter });

const indexPath = path.join(outputDir, "index.html");
const copiedIndex = fs.readFileSync(indexPath, "utf8");
const stampedIndex = copiedIndex.replace(/\?v=20260401d/g, `?v=${assetVersion}`);
fs.writeFileSync(indexPath, stampedIndex);

console.log(`Built deployable web-dist directory with asset version ${assetVersion}`);
