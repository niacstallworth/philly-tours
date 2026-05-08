import fs from "fs";
import path from "path";
import vm from "vm";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function parseArgs(argv) {
  const args = {
    toursFile: path.join(repoRoot, "webapp", "tours-data.js"),
    narrationFile: path.join(repoRoot, "webapp", "narration-data.js"),
    mediaTemplateFile: path.join(repoRoot, "docs", "tour-card-media-template.csv"),
    arJobPackDir: path.join(repoRoot, "docs", "ar-job-packs"),
    unresolvedStopsFile: path.join(repoRoot, "docs", "remaining-unresolved-stops.md"),
    outputFile: path.join(repoRoot, "private-content", "catalog.generated.json"),
    requiredPlanId: "premium_founders_pass",
    forcePublished: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--tours" && argv[index + 1]) {
      args.toursFile = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--narration" && argv[index + 1]) {
      args.narrationFile = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--media-template" && argv[index + 1]) {
      args.mediaTemplateFile = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--ar-job-packs" && argv[index + 1]) {
      args.arJobPackDir = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--unresolved-stops" && argv[index + 1]) {
      args.unresolvedStopsFile = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--out" && argv[index + 1]) {
      args.outputFile = path.resolve(repoRoot, argv[index + 1]);
      index += 1;
      continue;
    }
    if (value === "--required-plan-id" && argv[index + 1]) {
      args.requiredPlanId = String(argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (value === "--unpublished") {
      args.forcePublished = false;
    }
  }

  return args;
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

function evaluateWindowScript(filePath, expectedGlobalKey) {
  const code = fs.readFileSync(filePath, "utf8");
  const context = {
    window: {},
    console
  };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: filePath });
  return context.window[expectedGlobalKey];
}

function titleFromId(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseSimpleCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) {
    return [];
  }
  const lines = text.split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header.trim(), String(cells[index] || "").trim()]));
  });
}

function collectArJobPackRows(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const rows = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const nextPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(nextPath);
        continue;
      }
      if (entry.name !== "job.json") {
        continue;
      }
      const job = JSON.parse(fs.readFileSync(nextPath, "utf8"));
      const stop = job.stop || {};
      const placement = job.placement || {};
      const creativeDirection = job.creativeDirection || {};
      const runtimeTargets = job.runtimeTargets || {};
      let sceneManifest = {};
      const sceneManifestPath = job?.sourceFiles?.sceneManifest
        ? path.resolve(repoRoot, String(job.sourceFiles.sceneManifest))
        : "";
      if (sceneManifestPath && fs.existsSync(sceneManifestPath)) {
        sceneManifest = JSON.parse(fs.readFileSync(sceneManifestPath, "utf8"));
      }
      rows.push({
        tourId: stop.tourId,
        tourTitle: stop.tourTitle,
        stopId: stop.stopId,
        stopTitle: stop.stopTitle,
        arType: stop.arType || null,
        arPriority: stop.arPriority ?? null,
        triggerRadiusM: placement.triggerRadiusM ?? 35,
        coordQuality: placement.coordQuality || "approximate",
        verticalOffsetM: placement.verticalOffsetM ?? 0,
        assetNeeded: creativeDirection.assetNeeded || null,
        estimatedEffort: creativeDirection.estimatedEffort || null,
        notes: creativeDirection.notes || null,
        summary: sceneManifest.summary || creativeDirection.assetNeeded || null,
        historicalEra: sceneManifest.historicalEra || creativeDirection.historicalEra || null,
        headline: sceneManifest.headline || creativeDirection.headline || null,
        stylePreset: sceneManifest.stylePreset || creativeDirection.stylePreset || null,
        visualPriority: sceneManifest.visualPriority || creativeDirection.visualPriority || null,
        placementNote: sceneManifest.placementNote || placement.placementNote || null,
        iosAsset: runtimeTargets.iosAsset || null,
        androidAsset: runtimeTargets.androidAsset || null,
        webAsset: runtimeTargets.webAsset || null
      });
    }
  }
  walk(dirPath);
  return rows.filter((row) => row.tourId && row.stopId);
}

function slugifyTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseRemainingUnresolvedStops(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const rows = [];
  let currentTourTitle = "";
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const headingMatch = line.match(/^##\s+(.+?)\s+\(\d+\)\s*$/);
    if (headingMatch) {
      currentTourTitle = headingMatch[1].trim();
      continue;
    }
    const stopMatch = line.match(/^- (.+?) \| (.+?) \| `([^`]+)`$/);
    if (!stopMatch || !currentTourTitle) {
      continue;
    }
    const [, stopTitle, address, stopId] = stopMatch;
    const tourId = String(stopId).replace(new RegExp(`-${String(stopTitle).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}$`), "");
    rows.push({
      sectionTitle: currentTourTitle,
      stopId: stopId.trim(),
      stopTitle: stopTitle.trim(),
      address: address.trim()
    });
  }
  return rows;
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeAssetPath(value) {
  const normalized = String(value || "").trim().replace(/^\/+/, "");
  return normalized || null;
}

function toCoverImageConfig(tour) {
  const source = normalizeAssetPath(tour?.cardMedia?.src);
  if (!source) {
    return null;
  }
  return {
    bucket: "tour-images-private",
    objectPath: source
  };
}

function buildMediaAssets(stop) {
  const mediaAssets = [];
  const audioPath = normalizeAssetPath(stop.audioUrl);
  if (audioPath) {
    mediaAssets.push({
      kind: "audio",
      variant: "walk",
      platform: "mobile",
      bucket: "tour-audio-private",
      objectPath: audioPath,
      mimeType: "audio/mpeg",
      isPrivate: true,
      status: "ready"
    });
  }

  const modelPath = normalizeAssetPath(stop.modelUrl);
  if (modelPath) {
    mediaAssets.push({
      kind: "model",
      variant: stop.arType || "default",
      platform: "ios",
      bucket: "tour-models-private",
      objectPath: modelPath,
      mimeType: modelPath.endsWith(".usdz") ? "model/vnd.usdz+zip" : "application/octet-stream",
      isPrivate: true,
      status: "ready"
    });
  }

  return mediaAssets;
}

function mergeScaffoldTours(baseTours, mediaTemplateRows, arJobPackRows, unresolvedStopRows, requiredPlanId, forcePublished) {
  const tourMap = new Map(baseTours.map((tour) => [tour.id, tour]));

  for (const row of mediaTemplateRows) {
    const tourId = String(row.tour_id || "").trim();
    if (!tourId || tourMap.has(tourId)) {
      continue;
    }
    tourMap.set(tourId, {
      id: tourId,
      slug: tourId,
      cityId: "philly",
      title: String(row.tour_title || titleFromId(tourId)).trim(),
      summary: `Scaffolded from surviving repo metadata for ${String(row.tour_title || titleFromId(tourId)).trim()}. Replace locally with real private tour copy.`,
      durationMin: 0,
      distanceMiles: 0,
      rating: 0,
      requiredPlanId,
      isPublished: !!forcePublished,
      sortOrder: tourMap.size,
      coverImage: row.media_src
        ? {
            bucket: "tour-images-private",
            objectPath: String(row.media_src || "").trim().replace(/^\/+/, "")
          }
        : null,
      stops: []
    });
  }

  for (const row of arJobPackRows) {
    const tourId = String(row.tourId || "").trim();
    if (!tourId) {
      continue;
    }
    if (!tourMap.has(tourId)) {
      tourMap.set(tourId, {
        id: tourId,
        slug: tourId,
        cityId: "philly",
        title: String(row.tourTitle || titleFromId(tourId)).trim(),
        summary: `Scaffolded from AR planning metadata for ${String(row.tourTitle || titleFromId(tourId)).trim()}. Replace locally with real private tour copy, route length, and final stop sequencing.`,
        durationMin: 0,
        distanceMiles: 0,
        rating: 0,
        requiredPlanId,
        isPublished: !!forcePublished,
        sortOrder: tourMap.size,
        coverImage: null,
        stops: []
      });
    }
    const tour = tourMap.get(tourId);
    if (
      tour.summary &&
      (tour.summary.startsWith("Scaffolded from surviving repo metadata") ||
        tour.summary.startsWith("Scaffolded from AR planning metadata"))
    ) {
      tour.summary = `Scaffolded from surviving repo metadata for ${tour.title}. Replace locally with real private tour copy, route length, and final stop sequencing.`;
    }
    if (!tour.stops.some((stop) => stop.id === row.stopId)) {
      const mediaAssets = [];
      if (row.iosAsset) {
        mediaAssets.push({
          kind: "model",
          variant: row.arType || "default",
          platform: "ios",
          bucket: "tour-models-private",
          objectPath: String(row.iosAsset).replace(/^\/+/, ""),
          mimeType: String(row.iosAsset).endsWith(".usdz") ? "model/vnd.usdz+zip" : "application/octet-stream",
          isPrivate: true,
          status: "ready"
        });
      }
      if (row.androidAsset) {
        mediaAssets.push({
          kind: "model",
          variant: row.arType || "default",
          platform: "android",
          bucket: "tour-models-private",
          objectPath: String(row.androidAsset).replace(/^\/+/, ""),
          mimeType: "model/gltf-binary",
          isPrivate: true,
          status: "ready"
        });
      }
      if (row.webAsset) {
        mediaAssets.push({
          kind: "model",
          variant: row.arType || "default",
          platform: "web",
          bucket: "tour-models-private",
          objectPath: String(row.webAsset).replace(/^\/+/, ""),
          mimeType: "model/gltf-binary",
          isPrivate: true,
          status: "ready"
        });
      }
      const descriptionParts = [
        row.headline ? `${row.headline}.` : "",
        row.summary ? `${row.summary}.` : "",
        row.historicalEra ? `Era: ${row.historicalEra}.` : "",
        row.placementNote ? row.placementNote : ""
      ].filter(Boolean);
      tour.stops.push({
        id: row.stopId,
        title: row.stopTitle || titleFromId(row.stopId),
        description:
          descriptionParts.join(" ") ||
          row.notes ||
          `Scaffolded from AR job pack metadata for ${row.stopTitle || titleFromId(row.stopId)}. Replace locally with real stop copy.`,
        lat: 0,
        lng: 0,
        coordQuality: row.coordQuality || "approximate",
        triggerRadiusM: safeNumber(row.triggerRadiusM, 35),
        verticalOffsetM: safeNumber(row.verticalOffsetM, 0),
        stopOrder: tour.stops.length,
        arType: row.arType || null,
        arPriority: row.arPriority == null ? null : safeNumber(row.arPriority, 0),
        assetNeeded: row.assetNeeded || null,
        estimatedEffort: row.estimatedEffort || null,
        streetView: null,
        scripts: {
          drive: row.summary
            ? `${row.stopTitle || titleFromId(row.stopId)} is ahead. ${row.summary}. Replace this placeholder with the final private narration script.`
            : "",
          walk: row.summary
            ? `You are now at ${row.stopTitle || titleFromId(row.stopId)}. ${row.summary}. Replace this placeholder with the final private narration script.`
            : ""
        },
        mediaAssets
      });
    }
  }

  for (const row of unresolvedStopRows) {
    const knownTourIds = Array.from(tourMap.keys()).sort((left, right) => right.length - left.length);
    const inferredTourId =
      knownTourIds.find((candidate) => String(row.stopId || "").startsWith(`${candidate}-`)) ||
      String(row.sectionTitle || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const tourId = String(inferredTourId || "").trim();
    if (!tourId) {
      continue;
    }
    if (!tourMap.has(tourId)) {
      tourMap.set(tourId, {
        id: tourId,
        slug: tourId,
        cityId: "philly",
        title: String(row.sectionTitle || titleFromId(tourId)).trim(),
        summary: `Scaffolded from surviving unresolved-stop metadata for ${String(row.sectionTitle || titleFromId(tourId)).trim()}. Replace locally with real private tour copy, route length, and final stop sequencing.`,
        durationMin: 0,
        distanceMiles: 0,
        rating: 0,
        requiredPlanId,
        isPublished: !!forcePublished,
        sortOrder: tourMap.size,
        coverImage: null,
        stops: []
      });
    }
    const tour = tourMap.get(tourId);
    if (!tour.stops.some((stop) => stop.id === row.stopId)) {
      tour.stops.push({
        id: row.stopId,
        title: row.stopTitle || titleFromId(row.stopId),
        description: `Scaffolded from unresolved-stop metadata. Address: ${row.address}. Replace locally with final stop copy, exact coordinates, and premium narration.`,
        lat: 0,
        lng: 0,
        coordQuality: "approximate",
        triggerRadiusM: 35,
        verticalOffsetM: 0,
        stopOrder: tour.stops.length,
        arType: null,
        arPriority: null,
        assetNeeded: null,
        estimatedEffort: null,
        streetView: null,
        scripts: {
          drive: `${row.stopTitle || titleFromId(row.stopId)} is ahead. This stop is scaffolded from unresolved route notes at ${row.address}. Replace this placeholder with the final private narration script.`,
          walk: `You are now at ${row.stopTitle || titleFromId(row.stopId)}. This stop is scaffolded from unresolved route notes at ${row.address}. Replace this placeholder with the final private narration script.`
        },
        mediaAssets: []
      });
    }
  }

  return Array.from(tourMap.values()).map((tour, index) => {
    const stops = (tour.stops || []).map((stop, stopIndex) => ({
      ...stop,
      stopOrder: stop.stopOrder == null ? stopIndex : stop.stopOrder
    }));
    const stopTitles = stops.slice(0, 3).map((stop) => stop.title).filter(Boolean);
    const scaffoldSummary =
      stops.length > 0
        ? `${tour.title} currently has ${stops.length} scaffolded stop${stops.length === 1 ? "" : "s"} from surviving repo metadata${stopTitles.length ? `, including ${stopTitles.join(", ")}` : ""}. Replace locally with final route copy, coordinates, and full narration.`
        : tour.summary;
    return {
      ...tour,
      summary:
        tour.summary &&
        !tour.summary.startsWith("Scaffolded from AR planning metadata") &&
        !tour.summary.startsWith("Scaffolded from surviving repo metadata")
          ? tour.summary
          : scaffoldSummary,
      sortOrder: index,
      stops
    };
  });
}

function buildPrivateCatalog({ tours, narration, mediaTemplateRows, arJobPackRows, unresolvedStopRows, requiredPlanId, forcePublished }) {
  const catalogByStopId = narration?.catalogByStopId || {};
  const scriptMapByStopId = narration?.scriptMapByStopId || {};

  const baseTours = (Array.isArray(tours) ? tours : []).map((tour, tourIndex) => ({
      id: String(tour.id || "").trim(),
      slug: String(tour.id || "").trim(),
      cityId: "philly",
      title: String(tour.title || "").trim(),
      summary: String(tour.stops?.[0]?.description || `${tour.title || "Tour"} imported from current app data.`).trim(),
      durationMin: safeNumber(tour.durationMin, 0),
      distanceMiles: safeNumber(tour.distanceMiles, 0),
      rating: safeNumber(tour.rating, 0),
      requiredPlanId,
      isPublished: !!forcePublished,
      sortOrder: tourIndex,
      coverImage: toCoverImageConfig(tour),
      stops: (Array.isArray(tour.stops) ? tour.stops : []).map((stop, stopIndex) => {
        const scripts = scriptMapByStopId[stop.id] || {};
        const generatedAssets = buildMediaAssets(stop);
        const audioCatalogEntry = catalogByStopId[stop.id] || {};

        if (audioCatalogEntry.walk && !generatedAssets.some((asset) => asset.kind === "audio" && asset.variant === "walk")) {
          generatedAssets.push({
            kind: "audio",
            variant: "walk",
            platform: "mobile",
            bucket: "tour-audio-private",
            objectPath: normalizeAssetPath(audioCatalogEntry.walk),
            mimeType: "audio/mpeg",
            isPrivate: true,
            status: "ready"
          });
        }

        if (audioCatalogEntry.drive && !generatedAssets.some((asset) => asset.kind === "audio" && asset.variant === "drive")) {
          generatedAssets.push({
            kind: "audio",
            variant: "drive",
            platform: "mobile",
            bucket: "tour-audio-private",
            objectPath: normalizeAssetPath(audioCatalogEntry.drive),
            mimeType: "audio/mpeg",
            isPrivate: true,
            status: "ready"
          });
        }

        return {
          id: String(stop.id || "").trim(),
          title: String(stop.title || "").trim(),
          description: String(stop.description || "").trim(),
          lat: safeNumber(stop.lat, 0),
          lng: safeNumber(stop.lng, 0),
          coordQuality: stop.coordQuality || "approximate",
          triggerRadiusM: safeNumber(stop.triggerRadiusM, 35),
          verticalOffsetM: stop.verticalOffsetM == null ? 0 : safeNumber(stop.verticalOffsetM, 0),
          stopOrder: stopIndex,
          arType: stop.arType || null,
          arPriority: stop.arPriority == null ? null : safeNumber(stop.arPriority, 0),
          assetNeeded: stop.assetNeeded || null,
          estimatedEffort: stop.estimatedEffort || null,
          streetView: stop.streetView || null,
          scripts,
          mediaAssets: generatedAssets.filter((asset) => asset.objectPath)
        };
      })
    }));

  return {
    tours: mergeScaffoldTours(baseTours, mediaTemplateRows, arJobPackRows, unresolvedStopRows, requiredPlanId, forcePublished)
  };
}

function countStops(catalog) {
  return (catalog.tours || []).reduce((total, tour) => total + (Array.isArray(tour.stops) ? tour.stops.length : 0), 0);
}

function enrichBlackInventorsTour(catalog) {
  const tour = (catalog.tours || []).find((entry) => entry.id === "black-inventors-tour");
  if (!tour) {
    return;
  }

  tour.summary =
    "A scaffolded inventor route across Philadelphia tracing Black innovation through light, transit, medicine, domestic design, museum memory, and industrial movement. Replace locally with final sequencing, exact coordinates, and full private narration.";

  const stopCopyById = {
    "black-inventors-tour-lewis-latimer-light-bulb-exhibit": {
      description:
        "Animated explainer scene. filament model; patent diagram animation; inventor card. Era: late 19th century innovation. Address scaffold: 15 S 7th St, Philadelphia History Museum, PA. Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.",
      drive:
        "Lewis Latimer Light Bulb Exhibit is ahead. Latimer turns invention into inheritance: light, drawings, patents, and the work behind the glow. Replace this placeholder with the final private narration script.",
      walk:
        "You are now at Lewis Latimer Light Bulb Exhibit. Latimer turns invention into inheritance: light, drawings, patents, and the work behind the glow. Replace this placeholder with the final private narration script."
    },
    "black-inventors-tour-garrett-morgan-traffic-signal": {
      description:
        "Animated explainer scene. signal mechanism; intersection explainer; patent timeline. Era: early 20th century innovation. Address scaffold: 13th & Market St, Philadelphia, PA. Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.",
      drive:
        "Garrett Morgan Traffic Signal is ahead. A traffic signal is a public safety story, and Morgan's idea helped cities move with more care. Replace this placeholder with the final private narration script.",
      walk:
        "You are now at Garrett Morgan Traffic Signal. A traffic signal is a public safety story, and Morgan's idea helped cities move with more care. Replace this placeholder with the final private narration script."
    },
    "black-inventors-tour-dr-charles-drew-blood-bank": {
      description:
        "Animated explainer scene. blood plasma storage explainer; medical card set; tubing sequence. Era: 20th century medical innovation. Address scaffold: 800 Spruce St, Pennsylvania Hospital, PA. Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.",
      drive:
        "Dr. Charles Drew Blood Bank is ahead. This stop remembers medical genius as care, infrastructure, and survival. Replace this placeholder with the final private narration script.",
      walk:
        "You are now at Dr. Charles Drew Blood Bank. This stop remembers medical genius as care, infrastructure, and survival. Replace this placeholder with the final private narration script."
    },
    "black-inventors-tour-norbert-rillieux-way": {
      description:
        "Scaffolded route stop for Black Inventors Tour. Address scaffold: 33rd & Walnut St, Penn Campus, PA. Use this stop to tell a fuller story about heat, refinement, engineering, and Black scientific labor. Replace locally with exact coordinates and final narration.",
      drive:
        "Norbert Rillieux Way is ahead. This scaffolded stop should connect engineering precision, industrial process, and the hidden systems behind modern life. Replace this placeholder with the final private narration script.",
      walk:
        "You are now at Norbert Rillieux Way. This scaffolded stop should connect engineering precision, industrial process, and the hidden systems behind modern life. Replace this placeholder with the final private narration script."
    },
    "black-inventors-tour-granville-t-woods-railway-site": {
      description:
        "Scaffolded route stop for Black Inventors Tour. Address scaffold: Broad & Girard Ave, Philadelphia, PA. Use this stop to frame mobility, rail communication, and the safety systems that modern transit depends on. Replace locally with exact coordinates and final narration.",
      drive:
        "Granville T. Woods Railway Site is ahead. This scaffolded stop should connect Black invention to movement, signaling, and the infrastructure that keeps cities in motion. Replace this placeholder with the final private narration script.",
      walk:
        "You are now at Granville T. Woods Railway Site. This scaffolded stop should connect Black invention to movement, signaling, and the infrastructure that keeps cities in motion. Replace this placeholder with the final private narration script."
    },
    "black-inventors-tour-sarah-e-goode-house": {
      description:
        "Scaffolded route stop for Black Inventors Tour. Address scaffold: 1724 South St, Philadelphia, PA. Use this stop to tell a domestic design story about space, furniture, and how invention enters everyday life. Replace locally with exact coordinates and final narration.",
      drive:
        "Sarah E. Goode House is ahead. This scaffolded stop should connect invention to daily living, design constraints, and how Black women reshaped ordinary space. Replace this placeholder with the final private narration script.",
      walk:
        "You are now at Sarah E. Goode House. This scaffolded stop should connect invention to daily living, design constraints, and how Black women reshaped ordinary space. Replace this placeholder with the final private narration script."
    },
    "black-inventors-tour-frederick-mckinley-jones-route": {
      description:
        "Scaffolded route stop for Black Inventors Tour. Address scaffold: 3400 block E. Ontario St, Port Richmond, PA. Use this stop to connect transport, refrigeration, logistics, and the hidden movement of goods across regions. Replace locally with exact coordinates and final narration.",
      drive:
        "Frederick McKinley Jones Route is ahead. This scaffolded stop should connect invention to cold-chain logistics, mobility, and the routes that keep distant lives linked. Replace this placeholder with the final private narration script.",
      walk:
        "You are now at Frederick McKinley Jones Route. This scaffolded stop should connect invention to cold-chain logistics, mobility, and the routes that keep distant lives linked. Replace this placeholder with the final private narration script."
    },
    "black-inventors-tour-african-american-museum": {
      description:
        "Scaffolded route stop for Black Inventors Tour. Address scaffold: 701 Arch St, Philadelphia, PA. Use this stop as a memory anchor tying invention to public interpretation, archives, and Black historical stewardship. Replace locally with exact coordinates and final narration.",
      drive:
        "African American Museum is ahead. This scaffolded stop should connect invention to archive, interpretation, and the institutions that help keep Black achievement visible. Replace this placeholder with the final private narration script.",
      walk:
        "You are now at African American Museum. This scaffolded stop should connect invention to archive, interpretation, and the institutions that help keep Black achievement visible. Replace this placeholder with the final private narration script."
    }
  };

  for (const stop of tour.stops || []) {
    const copy = stopCopyById[stop.id];
    if (!copy) {
      continue;
    }
    stop.description = copy.description;
    stop.scripts = {
      drive: copy.drive,
      walk: copy.walk
    };
  }
}

const args = parseArgs(process.argv.slice(2));
assertFile(args.toursFile, "Tours file");
assertFile(args.narrationFile, "Narration file");

const tours = evaluateWindowScript(args.toursFile, "PHILLY_TOURS_DATA");
const narration = evaluateWindowScript(args.narrationFile, "PHILLY_TOURS_NARRATION");
const mediaTemplateRows = fs.existsSync(args.mediaTemplateFile) ? parseSimpleCsv(args.mediaTemplateFile) : [];
const arJobPackRows = collectArJobPackRows(args.arJobPackDir);
const unresolvedStopRows = parseRemainingUnresolvedStops(args.unresolvedStopsFile);
const catalog = buildPrivateCatalog({
  tours,
  narration,
  mediaTemplateRows,
  arJobPackRows,
  unresolvedStopRows,
  requiredPlanId: args.requiredPlanId,
  forcePublished: args.forcePublished
});
enrichBlackInventorsTour(catalog);

fs.mkdirSync(path.dirname(args.outputFile), { recursive: true });
fs.writeFileSync(args.outputFile, JSON.stringify(catalog, null, 2) + "\n", "utf8");

console.log(
  `Generated private catalog draft: ${args.outputFile} (${catalog.tours.length} tour(s), ${countStops(catalog)} stop(s)).`
);
console.log("Note: this generator only exports data still present in the repo. Redacted private tours must still be added back locally.");
