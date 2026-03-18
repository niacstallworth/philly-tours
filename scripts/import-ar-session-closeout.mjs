import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const reportDir = path.join(rootDir, "generated", "ar-runtime-staging", "session-closeouts");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    file: "",
    skipReview: false,
    skipTuning: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (value === "--file") {
      args.file = (argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (value === "--skip-review") {
      args.skipReview = true;
      continue;
    }
    if (value === "--skip-tuning") {
      args.skipTuning = true;
    }
  }

  return args;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readInput(filePath) {
  if (filePath) {
    return fs.readFileSync(path.resolve(rootDir, filePath), "utf8");
  }

  if (process.stdin.isTTY) {
    throw new Error("Provide a session closeout bundle via stdin or --file <path>.");
  }

  return fs.readFileSync(process.stdin.fd, "utf8");
}

function parseCloseout(input) {
  const lines = String(input || "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd());

  if (String(lines[0] || "").trim() !== "AR_SESSION_CLOSEOUT_V1") {
    throw new Error("Unsupported closeout format. Expected AR_SESSION_CLOSEOUT_V1.");
  }

  const tuningIndex = lines.findIndex((line) => line.trim() === "--- TUNING SNAPSHOT ---");
  const reviewIndex = lines.findIndex((line) => line.trim() === "--- DEVICE REVIEW ---");

  if (tuningIndex === -1 || reviewIndex === -1 || reviewIndex <= tuningIndex) {
    throw new Error("Session closeout is missing the tuning snapshot or device review section markers.");
  }

  const metadata = {};
  for (const line of lines.slice(1, tuningIndex)) {
    if (!line.trim()) {
      continue;
    }
    const [key, ...rest] = line.split("\t");
    metadata[key] = rest.join("\t");
  }

  const tuningSnapshot = lines
    .slice(tuningIndex + 1, reviewIndex)
    .join("\n")
    .trim();
  const reviewReport = lines
    .slice(reviewIndex + 1)
    .join("\n")
    .trim();

  if (!reviewReport.startsWith("AR_DEVICE_REVIEW_V1")) {
    throw new Error("Session closeout is missing a valid AR_DEVICE_REVIEW_V1 report.");
  }

  return {
    schemaVersion: 1,
    importedAt: new Date().toISOString(),
    generatedAt: metadata.generatedAt || "",
    tourId: metadata.tourId || "unknown-tour",
    tourTitle: metadata.tourTitle || "Unknown tour",
    selectedStopId: metadata.selectedStopId || "",
    selectedStopTitle: metadata.selectedStopTitle || "",
    hasTuningSnapshot: metadata.hasTuningSnapshot === "yes",
    tuningSnapshot: tuningSnapshot === "NONE" ? "" : tuningSnapshot,
    reviewReport
  };
}

function runTuningImport(closeout, args) {
  if (args.skipTuning || !closeout.tuningSnapshot) {
    return { ran: false, skipped: true, reason: args.skipTuning ? "skip flag" : "no snapshot" };
  }

  const commandArgs = [path.join(rootDir, "scripts", "apply-ar-tuning-snapshot.mjs")];
  if (args.dryRun) {
    commandArgs.push("--dry-run");
  }
  commandArgs.push("--snapshot", closeout.tuningSnapshot);

  execFileSync(process.execPath, commandArgs, {
    cwd: rootDir,
    stdio: "inherit"
  });

  return { ran: true, skipped: false };
}

function runReviewImport(closeout, args) {
  if (args.skipReview) {
    return { ran: false, skipped: true, reason: "skip flag" };
  }

  const commandArgs = [path.join(rootDir, "scripts", "import-ar-device-review.mjs")];
  if (args.dryRun) {
    commandArgs.push("--dry-run");
  }

  execFileSync(process.execPath, commandArgs, {
    cwd: rootDir,
    input: closeout.reviewReport,
    stdio: ["pipe", "inherit", "inherit"]
  });

  return { ran: true, skipped: false };
}

function buildMarkdown(summary) {
  const lines = [
    "# AR Session Closeout Import",
    "",
    `- Tour: ${summary.tourTitle} (\`${summary.tourId}\`)`,
    `- Imported at: ${summary.importedAt}`,
    `- Generated at: ${summary.generatedAt || "unknown"}`,
    `- Selected stop: ${summary.selectedStopTitle || "none"}${summary.selectedStopId ? ` (\`${summary.selectedStopId}\`)` : ""}`,
    `- Dry run: ${summary.dryRun ? "yes" : "no"}`,
    "",
    "## Actions",
    "",
    `- Tuning snapshot: ${summary.tuning.ran ? "applied" : `skipped (${summary.tuning.reason || "not requested"})`}`,
    `- Device review: ${summary.review.ran ? "imported" : `skipped (${summary.review.reason || "not requested"})`}`,
    ""
  ];

  if (summary.tuningSnapshot) {
    lines.push("## Tuning Snapshot", "", "```text", summary.tuningSnapshot, "```", "");
  } else {
    lines.push("## Tuning Snapshot", "", "None included in this closeout.", "");
  }

  lines.push("## Device Review", "", "```text", summary.reviewReport, "```", "");
  return `${lines.join("\n")}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = readInput(args.file);
  const closeout = parseCloseout(input);
  const tuning = runTuningImport(closeout, args);
  const review = runReviewImport(closeout, args);
  const summary = {
    ...closeout,
    dryRun: args.dryRun,
    tuning,
    review
  };

  ensureDirectory(reportDir);
  const reportStem = `${closeout.tourId}-${args.dryRun ? "preview" : "latest"}`;
  fs.writeFileSync(path.join(reportDir, `${reportStem}.json`), `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(path.join(reportDir, `${reportStem}.md`), buildMarkdown(summary));

  console.log(
    `${args.dryRun ? "Previewed" : "Imported"} AR session closeout for ${closeout.tourTitle}. Report: generated/ar-runtime-staging/session-closeouts/${reportStem}.md`
  );
}

main();
