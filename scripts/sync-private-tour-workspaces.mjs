import fs from "fs";
import path from "path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const privateContentDir = path.join(repoRoot, "private-content");
const sourceCatalogPath = path.join(privateContentDir, "catalog.generated.json");
const workspaceDir = path.join(privateContentDir, "tours");
const statusCsvPath = path.join(privateContentDir, "tour-pack-status.csv");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeText(value) {
  return String(value || "").trim();
}

function findFocusedCatalogFiles() {
  return fs
    .readdirSync(privateContentDir)
    .filter((entry) => entry.endsWith(".catalog.json"))
    .filter((entry) => entry !== "catalog.generated.json" && entry !== "catalog.json")
    .map((entry) => path.join(privateContentDir, entry));
}

function buildFocusedTourMap() {
  const focusedFiles = findFocusedCatalogFiles();
  const focusedMap = new Map();
  for (const filePath of focusedFiles) {
    const payload = readJson(filePath);
    const tour = payload?.tours?.[0];
    if (!tour?.id) {
      continue;
    }
    focusedMap.set(tour.id, { filePath, payload, tour });
  }
  return focusedMap;
}

function inferSourceAddress(stop) {
  if (normalizeText(stop.sourceAddress)) {
    return stop.sourceAddress;
  }
  const description = normalizeText(stop.description);
  const scaffoldMatch = description.match(/Address scaffold:\s*([^.|]+)/i);
  if (scaffoldMatch?.[1]) {
    return scaffoldMatch[1].trim();
  }
  const addressMatch = description.match(/Address:\s*([^.|]+)/i);
  if (addressMatch?.[1]) {
    return addressMatch[1].trim();
  }
  return "Philadelphia, PA";
}

function inferPinStatus(stop) {
  if (normalizeText(stop.pinStatus)) {
    return stop.pinStatus;
  }
  const lat = Number(stop.lat || 0);
  const lng = Number(stop.lng || 0);
  if (!lat && !lng) {
    return "unstarted";
  }
  return stop.coordQuality === "verified" ? "verified" : "mapped_proxy";
}

function inferPinNote(stop, pinStatus, sourceAddress) {
  if (normalizeText(stop.pinNote)) {
    return stop.pinNote;
  }
  if (pinStatus === "verified") {
    return `Current pin uses ${sourceAddress}. Confirm the safest visitor-facing standing position before final release.`;
  }
  if (pinStatus === "mapped_proxy") {
    return `Current pin is a proxy near ${sourceAddress}. Replace with the final operator-grade public standing point.`;
  }
  return `Add the real public-facing coordinates for ${sourceAddress} and switch pinStatus to verified.`;
}

function inferNarrationStatus(stop) {
  if (normalizeText(stop.narrationStatus)) {
    return stop.narrationStatus;
  }
  const drive = normalizeText(stop?.scripts?.drive);
  const walk = normalizeText(stop?.scripts?.walk);
  if (!drive && !walk) {
    return "missing";
  }
  const combined = `${drive} ${walk}`.toLowerCase();
  if (combined.includes("replace this placeholder")) {
    return "placeholder";
  }
  return "drafted";
}

function inferMediaStatus(stop) {
  if (normalizeText(stop.mediaStatus)) {
    return stop.mediaStatus;
  }
  const mediaAssets = Array.isArray(stop.mediaAssets) ? stop.mediaAssets : [];
  const audioAssets = mediaAssets.filter((asset) => asset.kind === "audio");
  const readyAudioCount = audioAssets.filter((asset) => asset.status === "ready").length;
  const modelAssets = mediaAssets.filter((asset) => asset.kind === "model");
  if (readyAudioCount >= 2) {
    return "audio_ready";
  }
  if (audioAssets.length > 0) {
    return "audio_scaffolded";
  }
  if (modelAssets.length > 0) {
    return "ar_ready";
  }
  return "not_started";
}

function normalizeStop(stop) {
  const sourceAddress = inferSourceAddress(stop);
  const pinStatus = inferPinStatus(stop);
  return {
    ...stop,
    sourceAddress,
    pinStatus,
    pinNote: inferPinNote(stop, pinStatus, sourceAddress),
    narrationStatus: inferNarrationStatus(stop),
    mediaStatus: inferMediaStatus(stop)
  };
}

function buildEditorWorkflow(tourId, relativeWorkspacePath) {
  return {
    tourFocus: tourId,
    importCommand: `npm run content:import:private -- --file ${relativeWorkspacePath}`,
    notes: [
      "Fill real lat/lng for each stop, then change pinStatus to verified.",
      "Replace placeholder drive and walk scripts with final paid narration.",
      "Upload final private media before marking mediaStatus as ready."
    ]
  };
}

function buildWorkspacePayload(tour, relativeWorkspacePath) {
  return {
    editorWorkflow: buildEditorWorkflow(tour.id, relativeWorkspacePath),
    tours: [
      {
        ...tour,
        stops: (tour.stops || []).map(normalizeStop)
      }
    ]
  };
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

function buildStatusRow(tour, workspacePath) {
  const stops = tour.stops || [];
  const zeroCoordStops = stops.filter((stop) => !Number(stop.lat || 0) && !Number(stop.lng || 0)).length;
  const verifiedPins = stops.filter((stop) => stop.pinStatus === "verified").length;
  const mappedProxyPins = stops.filter((stop) => stop.pinStatus === "mapped_proxy").length;
  const unstartedPins = stops.filter((stop) => stop.pinStatus === "unstarted").length;
  const draftedStops = stops.filter((stop) => stop.narrationStatus === "drafted").length;
  const placeholderStops = stops.filter((stop) => stop.narrationStatus === "placeholder").length;
  const missingNarrationStops = stops.filter((stop) => stop.narrationStatus === "missing").length;
  const audioReadyStops = stops.filter((stop) => stop.mediaStatus === "audio_ready").length;
  const audioScaffoldedStops = stops.filter((stop) => stop.mediaStatus === "audio_scaffolded").length;
  const arReadyStops = stops.filter((stop) => stop.mediaStatus === "ar_ready").length;
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
  ensureDir(workspaceDir);
  const sourceCatalog = readJson(sourceCatalogPath);
  const focusedMap = buildFocusedTourMap();
  const statusRows = [];

  for (const generatedTour of sourceCatalog.tours || []) {
    const focused = focusedMap.get(generatedTour.id);
    const sourceTour = focused?.tour || generatedTour;
    const workspacePath = path.join(workspaceDir, `${sourceTour.id}.catalog.json`);
    const relativeWorkspacePath = path.relative(repoRoot, workspacePath);
    const workspacePayload = buildWorkspacePayload(sourceTour, relativeWorkspacePath);
    writeJson(workspacePath, workspacePayload);
    statusRows.push(buildStatusRow(workspacePayload.tours[0], workspacePath));
  }

  fs.writeFileSync(statusCsvPath, `${toCsv(statusRows)}\n`);
  console.log(`Synced ${statusRows.length} private tour workspaces.`);
  console.log(`Wrote ${path.relative(repoRoot, statusCsvPath)}.`);
}

main();
