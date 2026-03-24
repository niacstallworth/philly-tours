import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const reportDir = path.join(rootDir, "generated", "ar-runtime-staging", "device-reviews");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    file: ""
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
    throw new Error("Provide a device review report via stdin or --file <path>.");
  }

  return fs.readFileSync(process.stdin.fd, "utf8");
}

function parseReport(input) {
  const lines = String(input || "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  if (lines[0] !== "AR_DEVICE_REVIEW_V1") {
    throw new Error("Unsupported device review format. Expected AR_DEVICE_REVIEW_V1.");
  }

  const metadata = {};
  let headerIndex = -1;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "stopId\tstopTitle\tassetStatus\tpassStatus\tnotes") {
      headerIndex = index;
      break;
    }

    const [key, ...rest] = line.split("\t");
    metadata[key] = rest.join("\t");
  }

  if (headerIndex === -1) {
    throw new Error("Missing stop table header in device review report.");
  }

  const stops = lines.slice(headerIndex + 1).map((line) => {
    const [stopId, stopTitle, assetStatus, passStatus, ...noteParts] = line.split("\t");
    return {
      stopId: stopId || "",
      stopTitle: stopTitle || "",
      assetStatus: assetStatus || "planned",
      passStatus: passStatus || "untested",
      notes: noteParts.join("\t").trim()
    };
  }).filter((stop) => stop.stopId);

  return {
    schemaVersion: 1,
    importedAt: new Date().toISOString(),
    sourceGeneratedAt: metadata.generatedAt || "",
    tourId: metadata.tourId || "unknown-tour",
    tourTitle: metadata.tourTitle || "Unknown tour",
    stops
  };
}

function isBuildableAssetStatus(status) {
  return status === "in_production" || status === "ready" || status === "approved";
}

function buildApproveCommand(stop) {
  const note = stop.notes || "Stable on iPad after device pass.";
  return `npm run ar:catalog:approve -- --stop-id ${stop.stopId} --note ${JSON.stringify(note)}`;
}

function summarize(report, dryRun) {
  const counts = {
    stable: 0,
    minor_drift: 0,
    needs_retune: 0,
    untested: 0
  };
  const assetCounts = {
    planned: 0,
    in_production: 0,
    ready: 0,
    approved: 0
  };

  for (const stop of report.stops) {
    if (Object.hasOwn(counts, stop.passStatus)) {
      counts[stop.passStatus] += 1;
    }
    if (Object.hasOwn(assetCounts, stop.assetStatus)) {
      assetCounts[stop.assetStatus] += 1;
    }
  }

  const approvalCandidates = report.stops.filter(
    (stop) => stop.assetStatus !== "approved" && isBuildableAssetStatus(stop.assetStatus) && stop.passStatus === "stable"
  );
  const needsRetune = report.stops.filter((stop) => stop.passStatus === "minor_drift" || stop.passStatus === "needs_retune");

  return {
    ...report,
    dryRun,
    summary: {
      passStatus: counts,
      assetStatus: assetCounts,
      approvalCandidateCount: approvalCandidates.length,
      needsRetuneCount: needsRetune.length
    },
    approvalCandidates,
    needsRetune
  };
}

function buildApprovalQueue(summary) {
  const lines = [
    `AR approval queue (${summary.approvalCandidates.length} candidate${summary.approvalCandidates.length === 1 ? "" : "s"})`,
    ""
  ];

  for (const stop of summary.approvalCandidates) {
    lines.push(`${stop.stopTitle} [${stop.stopId}]`);
    lines.push(buildApproveCommand(stop));
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function buildRetuneQueue(summary) {
  const lines = [
    "# AR Retune Queue",
    "",
    `- Tour: ${summary.tourTitle} (\`${summary.tourId}\`)`,
    `- Imported at: ${summary.importedAt}`,
    `- Needs retune count: ${summary.needsRetune.length}`,
    ""
  ];

  if (!summary.needsRetune.length) {
    lines.push("No retune items right now.", "");
    return `${lines.join("\n")}\n`;
  }

  for (const stop of summary.needsRetune) {
    lines.push(`## ${stop.stopTitle}`, "");
    lines.push(`- Stop ID: \`${stop.stopId}\``);
    lines.push(`- Asset status: \`${stop.assetStatus}\``);
    lines.push(`- Pass status: \`${stop.passStatus}\``);
    if (stop.notes) {
      lines.push(`- Notes: ${stop.notes}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function buildMarkdown(summary) {
  const lines = [
    "# AR Device Review Import",
    "",
    `- Tour: ${summary.tourTitle} (\`${summary.tourId}\`)`,
    `- Imported at: ${summary.importedAt}`,
    `- Source generated at: ${summary.sourceGeneratedAt || "unknown"}`,
    `- Dry run: ${summary.dryRun ? "yes" : "no"}`,
    "",
    "## Summary",
    "",
    `- Stable: ${summary.summary.passStatus.stable}`,
    `- Minor drift: ${summary.summary.passStatus.minor_drift}`,
    `- Needs retune: ${summary.summary.passStatus.needs_retune}`,
    `- Untested: ${summary.summary.passStatus.untested}`,
    `- Approval candidates: ${summary.summary.approvalCandidateCount}`,
    `- Buildable stops needing review: ${summary.summary.needsRetuneCount}`,
    "",
    "## Approval Candidates",
    ""
  ];

  if (!summary.approvalCandidates.length) {
    lines.push("None yet.", "");
  } else {
    for (const stop of summary.approvalCandidates) {
      lines.push(`### ${stop.stopTitle}`, "");
      lines.push(`- Stop ID: \`${stop.stopId}\``);
      lines.push(`- Asset status: \`${stop.assetStatus}\``);
      lines.push(`- Pass status: \`${stop.passStatus}\``);
      if (stop.notes) {
        lines.push(`- Notes: ${stop.notes}`);
      }
      lines.push(`- Approve: \`${buildApproveCommand(stop)}\``);
      lines.push("");
    }
  }

  lines.push("## Needs Retune", "");
  if (!summary.needsRetune.length) {
    lines.push("None right now.", "");
  } else {
    for (const stop of summary.needsRetune) {
      lines.push(`- ${stop.stopTitle} (\`${stop.stopId}\`) — ${stop.passStatus.replaceAll("_", " ")}${stop.notes ? ` | ${stop.notes}` : ""}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = readInput(args.file);
  const parsed = parseReport(input);
  const summary = summarize(parsed, args.dryRun);

  ensureDirectory(reportDir);
  const reportStem = args.dryRun ? `${summary.tourId}-preview` : `${summary.tourId}-latest`;
  const reportBase = path.join(reportDir, reportStem);
  fs.writeFileSync(`${reportBase}.json`, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(`${reportBase}.md`, buildMarkdown(summary));
  fs.writeFileSync(`${reportBase}-approval-queue.txt`, buildApprovalQueue(summary));
  fs.writeFileSync(`${reportBase}-retune-queue.md`, buildRetuneQueue(summary));
  execFileSync(process.execPath, [path.join(rootDir, "scripts", "generate-ar-review-dashboard.mjs")], {
    cwd: rootDir,
    stdio: "inherit"
  });

  console.log(
    `${args.dryRun ? "Previewed" : "Imported"} device review for ${summary.tourTitle}. Report: generated/ar-runtime-staging/device-reviews/${reportStem}.md`
  );
}

main();
