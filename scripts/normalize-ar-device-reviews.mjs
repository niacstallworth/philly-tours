import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const reviewsDir = path.join(rootDir, "generated", "ar-runtime-staging", "device-reviews");

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run")
  };
}

function renameIfPresent(fromPath, toPath, dryRun) {
  if (!fs.existsSync(fromPath)) {
    return false;
  }

  if (dryRun) {
    return true;
  }

  fs.renameSync(fromPath, toPath);
  return true;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(reviewsDir)) {
    console.log("No generated device-review directory found. Nothing to normalize.");
    return;
  }

  const reviewFiles = fs.readdirSync(reviewsDir)
    .filter((fileName) => fileName.endsWith("-latest.json"))
    .sort((left, right) => left.localeCompare(right));

  const migrated = [];
  const skipped = [];

  for (const fileName of reviewFiles) {
    const legacyJsonPath = path.join(reviewsDir, fileName);
    const review = JSON.parse(fs.readFileSync(legacyJsonPath, "utf8"));

    if (!review?.dryRun) {
      continue;
    }

    const legacyBase = legacyJsonPath.replace(/\.json$/, "");
    const previewBase = legacyBase.replace(/-latest$/, "-preview");
    const previewJsonPath = `${previewBase}.json`;

    if (fs.existsSync(previewJsonPath)) {
      skipped.push({
        legacy: path.relative(rootDir, legacyJsonPath).replace(/\\/g, "/"),
        reason: "preview file already exists"
      });
      continue;
    }

    renameIfPresent(`${legacyBase}.json`, `${previewBase}.json`, args.dryRun);
    renameIfPresent(`${legacyBase}.md`, `${previewBase}.md`, args.dryRun);
    renameIfPresent(`${legacyBase}-approval-queue.txt`, `${previewBase}-approval-queue.txt`, args.dryRun);
    renameIfPresent(`${legacyBase}-retune-queue.md`, `${previewBase}-retune-queue.md`, args.dryRun);

    migrated.push({
      legacy: path.relative(rootDir, legacyJsonPath).replace(/\\/g, "/"),
      preview: path.relative(rootDir, previewJsonPath).replace(/\\/g, "/")
    });
  }

  if (!args.dryRun) {
    execFileSync(process.execPath, [path.join(rootDir, "scripts", "generate-ar-review-dashboard.mjs")], {
      cwd: rootDir,
      stdio: "inherit"
    });
  }

  if (!migrated.length && !skipped.length) {
    console.log("No legacy preview imports needed normalization.");
    return;
  }

  for (const item of migrated) {
    console.log(`${args.dryRun ? "Would normalize" : "Normalized"} ${item.legacy} -> ${item.preview}`);
  }

  for (const item of skipped) {
    console.log(`Skipped ${item.legacy}: ${item.reason}.`);
  }
}

main();
