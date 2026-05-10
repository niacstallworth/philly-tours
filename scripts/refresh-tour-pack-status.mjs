import fs from "fs";
import path from "path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const workspaceDir = path.join(repoRoot, "private-content", "tours");
const statusCsvPath = path.join(repoRoot, "private-content", "tour-pack-status.csv");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toCsv(rows) {
  const headers = Object.keys(rows[0] || {});
  const escape = (value) => {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

function deriveMediaStatus(stop) {
  const assets = Array.isArray(stop.mediaAssets) ? stop.mediaAssets : [];
  const audioAssets = assets.filter((asset) => asset.kind === "audio");
  const readyAudioCount = audioAssets.filter((asset) => asset.status === "ready").length;
  const modelAssets = assets.filter((asset) => asset.kind === "model");
  if (readyAudioCount >= 2) {
    return "audio_ready";
  }
  if (audioAssets.length > 0) {
    return "audio_scaffolded";
  }
  if (modelAssets.length > 0) {
    return "ar_ready";
  }
  return stop.mediaStatus || "not_started";
}

function buildStatusRow(tour, workspacePath) {
  const stops = tour.stops || [];
  const mediaStatuses = stops.map(deriveMediaStatus);
  const zeroCoordStops = stops.filter((stop) => !Number(stop.lat || 0) && !Number(stop.lng || 0)).length;
  const verifiedPins = stops.filter((stop) => stop.pinStatus === "verified").length;
  const mappedProxyPins = stops.filter((stop) => stop.pinStatus === "mapped_proxy").length;
  const unstartedPins = stops.filter((stop) => stop.pinStatus === "unstarted").length;
  const draftedStops = stops.filter((stop) => stop.narrationStatus === "drafted").length;
  const placeholderStops = stops.filter((stop) => stop.narrationStatus === "placeholder").length;
  const missingNarrationStops = stops.filter((stop) => stop.narrationStatus === "missing").length;
  const audioReadyStops = mediaStatuses.filter((status) => status === "audio_ready").length;
  const audioScaffoldedStops = mediaStatuses.filter((status) => status === "audio_scaffolded").length;
  const arReadyStops = mediaStatuses.filter((status) => status === "ar_ready").length;

  return {
    tourId: tour.id,
    title: tour.title,
    workspaceFile: path.relative(repoRoot, workspacePath),
    stopCount: stops.length,
    verifiedPins,
    mappedProxyPins,
    unstartedPins,
    zeroCoordStops,
    draftedStops,
    placeholderStops,
    missingNarrationStops,
    audioReadyStops,
    audioScaffoldedStops,
    arReadyStops,
    nextPriority:
      zeroCoordStops > 0
        ? "fill_coordinates"
        : placeholderStops > 0
          ? "replace_placeholder_narration"
          : audioScaffoldedStops > 0
            ? "upload_audio"
            : "polish_and_verify"
  };
}

function main() {
  const files = fs
    .readdirSync(workspaceDir)
    .filter((entry) => entry.endsWith(".catalog.json"))
    .sort();

  const rows = files.map((entry) => {
    const filePath = path.join(workspaceDir, entry);
    const payload = readJson(filePath);
    const tour = payload?.tours?.[0];
    if (!tour?.id) {
      throw new Error(`Missing tour payload in ${entry}`);
    }
    return buildStatusRow(tour, filePath);
  });

  fs.writeFileSync(statusCsvPath, `${toCsv(rows)}\n`);
  console.log(`Refreshed ${rows.length} status row(s).`);
  console.log(`Wrote ${path.relative(repoRoot, statusCsvPath)}.`);
}

main();
