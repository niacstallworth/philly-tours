import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const promoteScriptPath = path.join(rootDir, "scripts", "promote-ar-device-review-preview.mjs");
const dashboardScriptPath = path.join(rootDir, "scripts", "generate-ar-review-dashboard.mjs");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    force: false,
    file: ""
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
    if (value === "--file") {
      args.file = (argv[index + 1] || "").trim();
      index += 1;
    }
  }

  return args;
}

function readQueueInput(filePath) {
  if (filePath) {
    return fs.readFileSync(path.resolve(rootDir, filePath), "utf8");
  }

  if (process.stdin.isTTY) {
    throw new Error("Provide queue text via stdin or pass --file <path>.");
  }

  return fs.readFileSync(process.stdin.fd, "utf8");
}

function parseQueueCommands(input) {
  const commands = [];
  const lines = String(input || "").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("npm run ar:reviews:promote -- --tour-id ")) {
      continue;
    }

    const match = trimmed.match(/^npm run ar:reviews:promote -- --tour-id (\S+)(?: --force)?$/);
    if (!match) {
      throw new Error(`Could not parse queue line: ${trimmed}`);
    }

    commands.push({
      tourId: match[1]
    });
  }

  return commands;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = readQueueInput(args.file);
  const commands = parseQueueCommands(input);

  if (!commands.length) {
    throw new Error("No preview-promotion commands found in the provided queue text.");
  }

  for (const command of commands) {
    const promoteArgs = [promoteScriptPath, "--tour-id", command.tourId];
    if (args.dryRun) {
      promoteArgs.push("--dry-run");
    }
    if (args.force) {
      promoteArgs.push("--force");
    }

    execFileSync(process.execPath, promoteArgs, {
      cwd: rootDir,
      stdio: "inherit"
    });
  }

  if (!args.dryRun) {
    execFileSync(process.execPath, [dashboardScriptPath], {
      cwd: rootDir,
      stdio: "inherit"
    });
  }

  console.log(`${args.dryRun ? "Previewed" : "Applied"} preview-promotion queue for ${commands.length} tour(s).`);
}

main();
