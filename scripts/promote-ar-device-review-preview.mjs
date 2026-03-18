import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const reviewsDir = path.join(rootDir, "generated", "ar-runtime-staging", "device-reviews");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    force: false,
    tourId: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (value === "--force") {
      args.force = true;
      continue;
    }
    if (value === "--tour-id") {
      args.tourId = (argv[index + 1] || "").trim();
      index += 1;
    }
  }

  return args;
}

function toRelative(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, "/");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function replaceDryRunLine(markdown) {
  return String(markdown).replace(/- Dry run: yes/g, "- Dry run: no");
}

function promoteFile(previewPath, latestPath, transform, dryRun) {
  if (!fs.existsSync(previewPath)) {
    return false;
  }

  if (dryRun) {
    return true;
  }

  const originalContent = fs.readFileSync(previewPath);
  const nextContent = transform ? transform(originalContent) : originalContent;
  fs.writeFileSync(latestPath, nextContent);
  fs.unlinkSync(previewPath);
  return true;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.tourId) {
    throw new Error("Provide --tour-id <tourId>.");
  }

  const previewBase = path.join(reviewsDir, `${args.tourId}-preview`);
  const latestBase = path.join(reviewsDir, `${args.tourId}-latest`);
  const previewJsonPath = `${previewBase}.json`;
  const latestJsonPath = `${latestBase}.json`;

  if (!fs.existsSync(previewJsonPath)) {
    throw new Error(`No preview review found for ${args.tourId}. Expected ${toRelative(previewJsonPath)}.`);
  }

  if (fs.existsSync(latestJsonPath) && !args.force) {
    throw new Error(`Latest review already exists for ${args.tourId}. Use --force to overwrite it.`);
  }

  const previewJson = readJson(previewJsonPath);
  const promotedJson = {
    ...previewJson,
    dryRun: false,
    promotedAt: new Date().toISOString()
  };

  if (!args.dryRun) {
    fs.writeFileSync(latestJsonPath, `${JSON.stringify(promotedJson, null, 2)}\n`);
    fs.unlinkSync(previewJsonPath);
  }

  promoteFile(
    `${previewBase}.md`,
    `${latestBase}.md`,
    (content) => Buffer.from(replaceDryRunLine(content.toString("utf8")), "utf8"),
    args.dryRun
  );
  promoteFile(`${previewBase}-approval-queue.txt`, `${latestBase}-approval-queue.txt`, null, args.dryRun);
  promoteFile(`${previewBase}-retune-queue.md`, `${latestBase}-retune-queue.md`, null, args.dryRun);

  if (!args.dryRun) {
    execFileSync(process.execPath, [path.join(rootDir, "scripts", "generate-ar-review-dashboard.mjs")], {
      cwd: rootDir,
      stdio: "inherit"
    });
  }

  console.log(
    `${args.dryRun ? "Would promote" : "Promoted"} ${toRelative(previewJsonPath)} -> ${toRelative(latestJsonPath)}`
  );
}

main();
