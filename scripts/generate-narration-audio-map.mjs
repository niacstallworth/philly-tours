import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const audioDir = path.join(rootDir, "assets", "audio");
const outputPath = path.join(rootDir, "src", "data", "narrationAudioMap.ts");
const allowedExtensions = new Set([".mp3", ".m4a", ".wav"]);

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function listAudioFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

const files = listAudioFiles(audioDir);

const lines = [
  "export const narrationAudioMap = {"
];

for (const fileName of files) {
  const assetPath = `/audio/${fileName}`;
  const requirePath = toPosix(path.relative(path.join(rootDir, "src", "data"), path.join(audioDir, fileName)));
  lines.push(`  ${JSON.stringify(assetPath)}: require(${JSON.stringify(requirePath)}),`);
}

lines.push("} as const;");
lines.push("");
lines.push("export type NarrationAudioPath = keyof typeof narrationAudioMap;");
lines.push("");

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);

console.log(`Generated narration audio map with ${files.length} entries.`);
