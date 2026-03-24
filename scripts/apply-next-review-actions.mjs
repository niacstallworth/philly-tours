import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const promoteNextScriptPath = path.join(rootDir, "scripts", "apply-next-preview-promotion-queue.mjs");
const approveNextScriptPath = path.join(rootDir, "scripts", "apply-next-approval-queue.mjs");
const previewQueuePath = path.join(rootDir, "generated", "ar-runtime-staging", "device-reviews", "next-preview-promotion-queue.txt");
const approvalQueuePath = path.join(rootDir, "generated", "ar-runtime-staging", "device-reviews", "next-approval-queue.txt");
const reviewsDir = path.join(rootDir, "generated", "ar-runtime-staging", "device-reviews");
const catalogPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    force: false,
    skipPromotions: false,
    skipApprovals: false
  };

  for (const value of argv) {
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (value === "--force") {
      args.force = true;
      continue;
    }
    if (value === "--skip-promotions") {
      args.skipPromotions = true;
      continue;
    }
    if (value === "--skip-approvals") {
      args.skipApprovals = true;
    }
  }

  return args;
}

function countQueueCommands(filePath, commandPrefix) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }

  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith(commandPrefix))
    .length;
}

function parsePreviewPromotionTourIds(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.match(/^npm run ar:reviews:promote -- --tour-id (\S+)$/))
    .filter(Boolean)
    .map((match) => match[1]);
}

function isBuildableAssetStatus(status) {
  return status === "in_production" || status === "ready" || status === "approved";
}

function readCatalogStatusByStopId() {
  const catalog = readCatalogCsv(catalogPath);
  return new Map(
    catalog.records.map((record) => [
      String(record.stopId || "").trim(),
      String(record.assetStatus || "").trim() || "planned"
    ])
  );
}

function projectApprovalsFromPreviewTours(tourIds) {
  if (!tourIds.length) {
    return [];
  }

  const catalogStatusByStopId = readCatalogStatusByStopId();
  const projected = [];
  const seenStopIds = new Set();

  for (const tourId of tourIds) {
    const previewPath = path.join(reviewsDir, `${tourId}-preview.json`);
    if (!fs.existsSync(previewPath)) {
      continue;
    }

    const preview = JSON.parse(fs.readFileSync(previewPath, "utf8"));
    const previewStops = Array.isArray(preview.stops) ? preview.stops : [];

    for (const stop of previewStops) {
      const stopId = String(stop.stopId || "").trim();
      if (!stopId || seenStopIds.has(stopId)) {
        continue;
      }

      const currentAssetStatus = catalogStatusByStopId.get(stopId) || String(stop.assetStatus || "").trim() || "planned";
      const passStatus = String(stop.passStatus || "").trim() || "untested";
      if (currentAssetStatus === "approved" || !isBuildableAssetStatus(currentAssetStatus) || passStatus !== "stable") {
        continue;
      }

      seenStopIds.add(stopId);
      projected.push({
        tourId,
        tourTitle: String(preview.tourTitle || tourId).trim(),
        stopId,
        stopTitle: String(stop.stopTitle || stopId).trim(),
        note: String(stop.notes || "").trim() || "Stable on iPad after device pass.",
        command: `npm run ar:catalog:approve -- --stop-id ${stopId} --note ${JSON.stringify(
          String(stop.notes || "").trim() || "Stable on iPad after device pass."
        )}`
      });
    }
  }

  return projected;
}

function runScript(scriptPath, args) {
  execFileSync(process.execPath, [scriptPath, ...args], {
    cwd: rootDir,
    stdio: "inherit"
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const promoteCount = args.skipPromotions
    ? 0
    : countQueueCommands(previewQueuePath, "npm run ar:reviews:promote -- --tour-id ");
  const previewTourIds = args.skipPromotions ? [] : parsePreviewPromotionTourIds(previewQueuePath);

  const baseArgs = [];
  if (args.dryRun) {
    baseArgs.push("--dry-run");
  }
  if (args.force) {
    baseArgs.push("--force");
  }

  if (promoteCount > 0) {
    runScript(promoteNextScriptPath, baseArgs);
  } else if (!args.skipPromotions) {
    console.log("No preview promotions queued right now.");
  }

  let approvalCount = args.skipApprovals
    ? 0
    : countQueueCommands(approvalQueuePath, "npm run ar:catalog:approve -- --stop-id ");
  const projectedApprovals = args.dryRun && !args.skipApprovals
    ? projectApprovalsFromPreviewTours(previewTourIds)
    : [];

  if (!args.dryRun && !args.skipApprovals && promoteCount > 0) {
    approvalCount = countQueueCommands(approvalQueuePath, "npm run ar:catalog:approve -- --stop-id ");
  }

  if (approvalCount > 0) {
    runScript(approveNextScriptPath, baseArgs);
  } else if (!args.skipApprovals) {
    console.log("No approval candidates queued right now.");
  }

  if (args.dryRun && projectedApprovals.length) {
    console.log(
      `Promoting queued preview reviews would surface ${projectedApprovals.length} approval candidate${projectedApprovals.length === 1 ? "" : "s"} on the refreshed board:`
    );
    for (const candidate of projectedApprovals) {
      console.log(`- ${candidate.tourTitle} -> ${candidate.stopTitle} (${candidate.stopId})`);
      console.log(`  ${candidate.command}`);
    }
  }

  console.log(
    `${args.dryRun ? "Previewed" : "Applied"} review action pipeline (${promoteCount} preview promotion${promoteCount === 1 ? "" : "s"}, ${args.dryRun ? `${projectedApprovals.length} projected approval${projectedApprovals.length === 1 ? "" : "s"} after promotion` : `${approvalCount} approval${approvalCount === 1 ? "" : "s"}`}).`
  );
}

main();
