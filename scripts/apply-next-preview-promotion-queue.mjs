import path from "node:path";
import process from "node:process";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const queueScriptPath = path.join(rootDir, "scripts", "promote-ar-device-review-queue.mjs");
const defaultQueuePath = path.join(rootDir, "generated", "ar-runtime-staging", "device-reviews", "next-preview-promotion-queue.txt");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    force: false
  };

  for (const value of argv) {
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (value === "--force") {
      args.force = true;
    }
  }

  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(defaultQueuePath)) {
    console.log("No generated preview-promotion queue found right now.");
    return;
  }

  const hasCommands = fs.readFileSync(defaultQueuePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .some((line) => line.startsWith("npm run ar:reviews:promote -- --tour-id "));

  if (!hasCommands) {
    console.log("No preview promotions queued right now.");
    return;
  }

  const queueArgs = [queueScriptPath, "--file", defaultQueuePath];

  if (args.dryRun) {
    queueArgs.push("--dry-run");
  }
  if (args.force) {
    queueArgs.push("--force");
  }

  execFileSync(process.execPath, queueArgs, {
    cwd: rootDir,
    stdio: "inherit"
  });
}

main();
