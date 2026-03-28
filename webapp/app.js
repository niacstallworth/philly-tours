const fallbackTours = [
  {
    id: "black-american-legacy-and-quaker-heritage",
    title: "Black American Legacy & Quaker Heritage",
    theme: "History",
    neighborhood: "Old City to Germantown",
    durationMin: 248,
    distanceMiles: 5.6,
    rating: 4.8,
    tags: ["legacy", "abolition", "architecture"],
    summary:
      "A wide-angle journey through abolition, faith, and civic memory, mixing downtown landmarks with deeper neighborhood context.",
    arFocus: "Portal reconstructions and before/after overlays",
    guideMode: "Best for half-day exploration",
    stops: [
      {
        id: "mother-bethel",
        title: "Mother Bethel AME Church",
        lat: 39.958,
        lng: -75.158,
        radius: 40,
        description: "Founded in 1794 by Richard Allen, with layered storytelling and reconstruction potential."
      },
      {
        id: "presidents-house",
        title: "President's House / Liberty Bell Center",
        lat: 39.9598,
        lng: -75.1596,
        radius: 40,
        description: "A crucial stop for interpreting freedom, contradiction, and public memory in Independence Mall."
      },
      {
        id: "johnson-house",
        title: "Johnson House",
        lat: 40.0389,
        lng: -75.1813,
        radius: 40,
        description: "Underground Railroad history with room for figure-presence AR and route overlays."
      },
      {
        id: "the-woodlands",
        title: "The Woodlands",
        lat: 39.9472,
        lng: -75.207,
        radius: 40,
        description: "A cemetery and mansion site where context cards and before/after scenes can do real narrative work."
      }
    ]
  },
  {
    id: "rainbow-girls-philadelphia",
    title: "Rainbow Girls Philadelphia",
    theme: "Family",
    neighborhood: "Center City to Fairmount Park",
    durationMin: 96,
    distanceMiles: 2.2,
    rating: 4.9,
    tags: ["family", "civic", "playful"],
    summary:
      "A brighter, more accessible route that blends civic buildings, gathering places, and playful storytelling moments.",
    arFocus: "Lightweight story cards and object reveals",
    guideMode: "Great for visitors and mixed-age groups",
    stops: [
      {
        id: "masonic-temple",
        title: "Masonic Temple",
        lat: 39.9552,
        lng: -75.1633,
        radius: 35,
        description: "A dramatic anchor stop with ornament, ritual history, and strong visual framing."
      },
      {
        id: "reading-terminal-market",
        title: "Reading Terminal Market",
        lat: 39.953,
        lng: -75.1594,
        radius: 35,
        description: "High-energy storytelling around gathering, commerce, and everyday Philadelphia life."
      },
      {
        id: "please-touch-museum",
        title: "Please Touch Museum",
        lat: 39.983,
        lng: -75.2092,
        radius: 45,
        description: "A destination stop that leans into play, imagination, and museum-centered discovery."
      },
      {
        id: "shofuso",
        title: "Shofuso Japanese House & Garden",
        lat: 39.9799,
        lng: -75.1888,
        radius: 45,
        description: "A quiet visual reset with garden atmosphere and place-based interpretation."
      }
    ]
  },
  {
    id: "divine-9-legacy-tour",
    title: "Divine 9 Legacy Tour",
    theme: "Campus",
    neighborhood: "University City",
    durationMin: 88,
    distanceMiles: 2.1,
    rating: 4.9,
    tags: ["greek-life", "legacy", "campus"],
    summary:
      "A University City route centered on Black Greek-letter history, neighborhood memory, and chapter legacy.",
    arFocus: "Floating story cards and chapter overlays",
    guideMode: "Works well as a focused afternoon loop",
    stops: [
      {
        id: "alpha-phi-alpha",
        title: "Alpha Phi Alpha - 42nd & Chestnut",
        lat: 39.9563,
        lng: -75.205,
        radius: 35,
        description: "An origin-point style stop with strong chapter storytelling possibilities."
      },
      {
        id: "delta-sigma-theta",
        title: "Delta Sigma Theta - 40th & Market",
        lat: 39.9598,
        lng: -75.2013,
        radius: 35,
        description: "A compact stop that can foreground service, organizing, and neighborhood presence."
      },
      {
        id: "phi-beta-sigma",
        title: "Phi Beta Sigma - 44th & Market",
        lat: 39.9586,
        lng: -75.2089,
        radius: 35,
        description: "Good candidate for archival image stacks and chapter timelines."
      },
      {
        id: "iota-phi-theta",
        title: "Iota Phi Theta - Temple Greek Row",
        lat: 39.9812,
        lng: -75.1552,
        radius: 35,
        description: "A northward jump that broadens the legacy map beyond one campus cluster."
      }
    ]
  },
  {
    id: "black-american-sports",
    title: "Black American Sports",
    theme: "Sports",
    neighborhood: "West Philly and beyond",
    durationMin: 104,
    distanceMiles: 2.7,
    rating: 4.8,
    tags: ["sports", "icons", "performance"],
    summary:
      "A tour about courts, gyms, schools, and stages where Philadelphia sports culture was shaped.",
    arFocus: "Hero moments, animated diagrams, and crowd energy",
    guideMode: "Designed for punchier storytelling and photo moments",
    stops: [
      {
        id: "the-palestra",
        title: "The Palestra",
        lat: 39.9522,
        lng: -75.1932,
        radius: 35,
        description: "A classic arena stop with room for stat overlays and player memory cards."
      },
      {
        id: "hampton-park",
        title: "Allen Iverson's Hampton Park Courts",
        lat: 39.99,
        lng: -75.1729,
        radius: 40,
        description: "Street-level basketball energy with compelling playground-to-legend framing."
      },
      {
        id: "joe-frazier",
        title: "Joe Frazier's Gym (Cloverlay)",
        lat: 39.95,
        lng: -75.1584,
        radius: 35,
        description: "A boxing landmark suited to layered archival storytelling and motion graphics."
      },
      {
        id: "overbrook",
        title: "Overbrook High School",
        lat: 39.9797,
        lng: -75.2415,
        radius: 40,
        description: "A school site that expands the tour from stars to pipelines and institutions."
      }
    ]
  },
  {
    id: "library-story-hop-tour",
    title: "Library Story Hop Tour",
    theme: "Books",
    neighborhood: "Center City",
    durationMin: 80,
    distanceMiles: 1.8,
    rating: 4.8,
    tags: ["libraries", "archives", "reading"],
    summary:
      "An archive-rich walking route through libraries, reading rooms, and places where collections shape public memory.",
    arFocus: "Object-on-plinth moments and archival stacks",
    guideMode: "Best for curious walkers who like short, dense stops",
    stops: [
      {
        id: "library-company",
        title: "Library Company of Philadelphia",
        lat: 39.9478,
        lng: -75.1509,
        radius: 30,
        description: "A compact but content-rich stop for collection-based storytelling."
      },
      {
        id: "athenaeum",
        title: "Athenaeum of Philadelphia",
        lat: 39.9473,
        lng: -75.1495,
        radius: 30,
        description: "An elegant design and architecture anchor with strong visual identity."
      },
      {
        id: "free-library",
        title: "Free Library - Central Parkway",
        lat: 39.9609,
        lng: -75.1693,
        radius: 35,
        description: "A civic-scale reading space that works for layered archive storytelling."
      },
      {
        id: "blockson",
        title: "Charles L. Blockson Collection",
        lat: 39.9811,
        lng: -75.1553,
        radius: 35,
        description: "A stop that can spotlight preservation, Black archives, and scholarly stewardship."
      }
    ]
  }
];

const tours = normalizeTours(window.PHILLY_TOURS_DATA || fallbackTours);
const narrationData = window.PHILLY_TOURS_NARRATION || {
  catalogByStopId: {},
  scriptMapByStopId: {}
};
const arData = window.PHILLY_TOURS_AR || {};
const siteConfig = window.PHILLY_TOURS_CONFIG || {};

const STORAGE_KEY = "philly-ar-tours-web-progress";
const GLASSES_MODE_KEY = "philly-ar-tours-web-glasses-mode";
const PRODUCTION_HOSTS = new Set(["philly-tours.com", "www.philly-tours.com"]);
const CONTACT_EMAIL = "info@foundersthreads.org";
let routeMap = null;
let routeMapLayers = null;
let narrationAudio = null;
let preferredSpeechVoice = null;
let arStream = null;
let arLocationWatchId = null;
const AR_RANGE_HYSTERESIS_M = 15;
const AR_AUTO_NARRATION_COOLDOWN_MS = 45000;
let copyButtonResetTimer = null;

const state = {
  activeTab: "home",
  selectedTourId: tours[0].id,
  selectedStopId: tours[0].stops[0].id,
  drawer: null,
  narrationVariant: "walk",
  narrationState: {
    status: "idle",
    stopId: null,
    source: "none"
  },
  ar: {
    mode: "idle",
    cameraReady: false,
    locationReady: false,
    error: "",
    userLocation: null,
    nearestStopId: null,
    distanceToNearestM: null,
    inRange: false,
    autoNarrationEnabled: true,
    lastAutoNarratedStopId: null,
    lastAutoNarratedAt: 0
  },
  glassesMode: loadGlassesMode(),
  glassesModeNotice: "",
  subscription: {
    email: "",
    status: "idle",
    message: ""
  },
  search: "",
  themeFilter: "all",
  completedStopIds: loadCompletedStops()
};

const app = document.getElementById("app");
const tabs = [...document.querySelectorAll("#tabs button")];
const tabBar = document.getElementById("tabs");
const deployStatus = document.getElementById("deploy-status");
const copyViewButton = document.getElementById("copy-view-button");
const glassesModeButton = document.getElementById("glasses-mode-button");

document.addEventListener("click", handleClick);
document.addEventListener("input", handleInput);
document.addEventListener("submit", handleSubmit);
if (tabBar) {
  tabBar.addEventListener("click", handleClick);
}
tabs.forEach((button) => {
  button.addEventListener("click", () => {
    const nextTab = button.dataset.tab;
    if (!nextTab) {
      return;
    }
    setActiveTab(nextTab);
  });
});
window.addEventListener("hashchange", handleHashChange);

hydrateStateFromLocation();
render();

function normalizeTours(rawTours) {
  if (!Array.isArray(rawTours) || rawTours.length === 0) {
    return fallbackTours;
  }

  return rawTours.map((tour) => normalizeTour(tour));
}

function normalizeTour(tour) {
  const stops = Array.isArray(tour.stops) ? tour.stops.map((stop) => normalizeStop(stop)) : [];
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];

  return {
    id: tour.id,
    title: tour.title,
    theme: deriveTheme(tour.title, tour.id),
    neighborhood: deriveNeighborhood(firstStop, lastStop),
    durationMin: tour.durationMin,
    distanceMiles: tour.distanceMiles,
    rating: tour.rating,
    tags: deriveTags(tour, stops),
    summary: deriveSummary(tour, stops),
    arFocus: deriveArFocus(stops),
    guideMode: deriveGuideMode(tour, stops),
    stops
  };
}

function normalizeStop(stop) {
  const metadata = parseStopMetadata(stop.description);
  return {
    id: stop.id,
    title: stop.title,
    lat: stop.lat,
    lng: stop.lng,
    radius: stop.triggerRadiusM ?? stop.radius ?? 40,
    description: cleanStopDescription(stop.description),
    dayLabel: metadata.dayLabel,
    timeLabel: metadata.timeLabel,
    locationLabel: metadata.locationLabel
  };
}

function deriveTheme(title, id) {
  const source = `${title} ${id}`.toLowerCase();
  if (source.includes("library")) return "Books";
  if (source.includes("sports")) return "Sports";
  if (source.includes("inventor")) return "Innovation";
  if (source.includes("medical")) return "Medicine";
  if (source.includes("rainbow")) return "Family";
  if (source.includes("divine-9") || source.includes("divine 9")) return "Campus";
  if (source.includes("york road")) return "Corridor";
  if (source.includes("masonic") || source.includes("eastern star") || source.includes("job")) return "Fraternal";
  return "History";
}

function deriveNeighborhood(firstStop, lastStop) {
  const start = extractLocation(firstStop?.description);
  const end = extractLocation(lastStop?.description);
  if (start && end && start !== end) {
    return `${start} to ${end}`;
  }
  return start || end || "Philadelphia";
}

function extractLocation(description) {
  return parseStopMetadata(description).locationLabel;
}

function parseStopMetadata(description) {
  if (!description) {
    return {
      dayLabel: "",
      timeLabel: "",
      locationLabel: ""
    };
  }

  const parts = description.split("|").map((part) => part.trim());
  const dayLabel = parts.find((part) => /^day:/i.test(part))?.replace(/^day:\s*/i, "").trim() ?? "";
  const timeLabel = parts.find((part) => /^time:/i.test(part))?.replace(/^time:\s*/i, "").trim() ?? "";
  const locationLabel =
    parts
      .find((part) => /^location:/i.test(part))
      ?.replace(/^location:\s*/i, "")
      .replace(/,\s*philadelphia,\s*pa$/i, "")
      .replace(/,\s*pa$/i, "")
      .trim() ?? "";

  return {
    dayLabel,
    timeLabel,
    locationLabel
  };
}

function cleanStopDescription(description) {
  if (!description) {
    return "Philadelphia story stop";
  }

  const primary = description
    .split("|")
    .map((part) => part.trim())
    .find((part) => !/^day:|^time:|^location:/i.test(part));

  return primary || description;
}

function deriveSummary(tour, stops) {
  const leadStops = stops.slice(0, 2).map((stop) => stop.title);
  const opener = leadStops.length ? `${leadStops.join(" and ")} anchor this route.` : "A story-led Philadelphia route.";
  return `${opener} ${tour.stops.length} stops across ${tour.distanceMiles} miles with layered narration and AR-ready context.`;
}

function deriveArFocus(stops) {
  const titles = stops.slice(0, 3).map((stop) => stop.title);
  if (titles.length === 0) {
    return "Story cards and on-site audio";
  }
  return `Story-led stop previews around ${titles.join(", ")}`;
}

function deriveGuideMode(tour) {
  if (tour.durationMin >= 180) {
    return "Best for a long-form city session";
  }
  if (tour.distanceMiles >= 2.5) {
    return "Works well as a half-day route";
  }
  return "Great for a focused neighborhood run";
}

function deriveTags(tour, stops) {
  const titleWords = tour.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !["tour", "philadelphia", "black", "american"].includes(word));

  const stopWords = stops
    .slice(0, 4)
    .flatMap((stop) => stop.title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/))
    .filter((word) => word.length > 4);

  return [...new Set([...titleWords, ...stopWords])].slice(0, 4);
}

function getNarrationEntry(stopId) {
  return narrationData.catalogByStopId?.[stopId] || null;
}

function getNarrationScriptEntry(stopId) {
  return narrationData.scriptMapByStopId?.[stopId] || null;
}

function getNarrationAudioPath(stopId, variant = state.narrationVariant) {
  const entry = getNarrationEntry(stopId);
  if (!entry) {
    return null;
  }
  const path = entry[variant] || entry[variant === "walk" ? "drive" : "walk"] || null;
  if (!path) {
    return null;
  }
  return path.replace(/^\/audio\//, "/assets/audio/");
}

function getNarrationScript(stopId, variant = state.narrationVariant) {
  const entry = getNarrationScriptEntry(stopId);
  if (!entry) {
    return null;
  }
  return entry[variant] || entry[variant === "walk" ? "drive" : "walk"] || null;
}

function getNarrationMode(stopId) {
  if (getNarrationAudioPath(stopId)) {
    return "recorded";
  }
  if (getNarrationScript(stopId)) {
    return "speech";
  }
  return "none";
}

function getNarrationLabel(stopId) {
  const mode = getNarrationMode(stopId);
  if (mode === "recorded") {
    return "Recorded narration";
  }
  if (mode === "speech") {
    return "Amy voice fallback";
  }
  return "No narration yet";
}

function getArOverlayMeta(stopId) {
  return arData[stopId] || null;
}

function getResolvedModelUrl(modelUrl) {
  if (!modelUrl) {
    return "";
  }

  return modelUrl.replace(/^\/models\//, "/assets/models/");
}

function getModelReadinessLabel(meta) {
  if (meta?.webModelAvailable) {
    return "web preview ready";
  }

  if (meta?.iosModelAvailable) {
    return "ios model ready";
  }

  if (meta?.modelUrl) {
    return "web model planned";
  }

  return "story overlay";
}

function getDeploymentStatusLabel() {
  const host = window.location.hostname;
  if (PRODUCTION_HOSTS.has(host)) {
    return `Live on ${host}`;
  }

  if (host === "localhost" || host === "127.0.0.1") {
    return "Local field preview";
  }

  if (host.endsWith(".pages.dev")) {
    return "Pages preview";
  }

  return "Web preview";
}

function getGlassesModeLabel() {
  return state.glassesMode ? "Meta glasses mode on" : "Meta glasses mode off";
}

function getGlassesModeButtonLabel() {
  return state.glassesMode ? "Disable Meta glasses mode" : "Enable Meta glasses mode";
}

function getGlassesModeCopy() {
  if (state.glassesMode) {
    return "Browser narration will follow this device's current audio output. Pair Meta glasses over Bluetooth to hear the tour hands-free while keeping route and AR handoff on the phone. Turning this off resets the active audio and AR view back to the standard phone posture.";
  }

  return "Turn on Meta glasses mode when your glasses are already paired to this phone or computer over Bluetooth. The webapp cannot use native Meta DAT, but it can still route narration through the active browser audio output.";
}

function buildPhoneAppHandoffLink(tourId, stopId) {
  return `phillyartours://tour/${encodeURIComponent(tourId)}/stop/${encodeURIComponent(stopId)}/map`;
}

function updateChrome() {
  if (deployStatus) {
    deployStatus.textContent = getDeploymentStatusLabel();
    deployStatus.classList.toggle("is-live", PRODUCTION_HOSTS.has(window.location.hostname));
  }

  if (glassesModeButton) {
    glassesModeButton.textContent = getGlassesModeLabel();
    glassesModeButton.classList.toggle("active", state.glassesMode);
  }
}

function resetCopyButtonLabel() {
  if (copyViewButton) {
    copyViewButton.textContent = "Copy current view";
  }
}

function setCopyButtonLabel(label) {
  if (!copyViewButton) {
    return;
  }

  copyViewButton.textContent = label;
  window.clearTimeout(copyButtonResetTimer);
  copyButtonResetTimer = window.setTimeout(resetCopyButtonLabel, 2200);
}

async function copyCurrentViewLink() {
  const url = window.location.href;

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API unavailable");
    }

    await navigator.clipboard.writeText(url);
    setCopyButtonLabel("Link copied");
  } catch (_error) {
    setCopyButtonLabel("Copy failed");
  }
}

function loadCompletedStops() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadGlassesMode() {
  try {
    return window.localStorage.getItem(GLASSES_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveGlassesMode() {
  try {
    window.localStorage.setItem(GLASSES_MODE_KEY, state.glassesMode ? "1" : "0");
  } catch {
    // Ignore storage failures for this preference.
  }
}

function saveCompletedStops() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.completedStopIds));
}

function stopNarration() {
  if (narrationAudio) {
    narrationAudio.pause();
    narrationAudio.currentTime = 0;
    narrationAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  state.narrationState = {
    status: "idle",
    stopId: null,
    source: "none"
  };
}

function stopArLive() {
  if (arStream) {
    arStream.getTracks().forEach((track) => track.stop());
    arStream = null;
  }
  if (arLocationWatchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(arLocationWatchId);
    arLocationWatchId = null;
  }
  state.ar = {
    ...state.ar,
    mode: "idle",
    cameraReady: false,
    locationReady: false,
    error: "",
    userLocation: null,
    nearestStopId: null,
    distanceToNearestM: null,
    inRange: false,
    autoNarrationEnabled: state.ar.autoNarrationEnabled,
    lastAutoNarratedStopId: state.ar.lastAutoNarratedStopId,
    lastAutoNarratedAt: state.ar.lastAutoNarratedAt
  };
}

function haversineDistanceMeters(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusM = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * earthRadiusM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function updateArNearestStop(positionCoords) {
  const selectedTour = getSelectedTour();
  let nearestStop = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const stop of selectedTour.stops) {
    const distance = haversineDistanceMeters(positionCoords, { lat: stop.lat, lng: stop.lng });
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestStop = stop;
    }
  }

  if (!nearestStop) {
    return;
  }

  const wasInRangeForSameStop = state.ar.inRange && state.ar.nearestStopId === nearestStop.id;
  const enteredRangeThreshold = nearestStop.radius || 40;
  const exitRangeThreshold = enteredRangeThreshold + AR_RANGE_HYSTERESIS_M;
  const nextInRange = wasInRangeForSameStop
    ? nearestDistance <= exitRangeThreshold
    : nearestDistance <= enteredRangeThreshold;
  const justEnteredRange = !wasInRangeForSameStop && nextInRange;

  state.ar.userLocation = positionCoords;
  state.ar.locationReady = true;
  state.ar.nearestStopId = nearestStop.id;
  state.ar.distanceToNearestM = Math.round(nearestDistance);
  state.ar.inRange = nextInRange;

  if (nearestStop.id !== state.selectedStopId) {
    state.selectedStopId = nearestStop.id;
  }

  if (justEnteredRange && state.ar.autoNarrationEnabled) {
    const now = Date.now();
    const recentlyAutoPlayedSameStop =
      state.ar.lastAutoNarratedStopId === nearestStop.id &&
      now - state.ar.lastAutoNarratedAt < AR_AUTO_NARRATION_COOLDOWN_MS;

    if (!recentlyAutoPlayedSameStop) {
      state.ar.lastAutoNarratedStopId = nearestStop.id;
      state.ar.lastAutoNarratedAt = now;
      startNarration(nearestStop.id);
    }
  }
}

async function startArLive() {
  stopArLive();
  state.ar.mode = "starting";
  state.ar.error = "";
  render(false);

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera access is not available in this browser.");
    }

    arStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" }
      },
      audio: false
    });

    state.ar.mode = "live";
    state.ar.cameraReady = true;

    if (navigator.geolocation) {
      arLocationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          updateArNearestStop({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          render(false);
        },
        () => {
          state.ar.error = "Location is unavailable right now. Camera mode still works.";
          render(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
        }
      );
    } else {
      state.ar.error = "Geolocation is not available in this browser.";
    }

    render(false);
  } catch (error) {
    stopArLive();
    state.ar.error = error instanceof Error ? error.message : "Unable to start AR live mode.";
    render(false);
  }
}

function resolvePreferredSpeechVoice() {
  if (preferredSpeechVoice !== null) {
    return preferredSpeechVoice;
  }
  const voices = window.speechSynthesis?.getVoices?.() || [];
  preferredSpeechVoice =
    voices.find((voice) => /(^|[^a-z])amy([^a-z]|$)/i.test(`${voice.name} ${voice.voiceURI}`)) ||
    voices.find((voice) => /^en-gb/i.test(voice.lang || "")) ||
    voices.find((voice) => /^en/i.test(voice.lang || "")) ||
    null;
  return preferredSpeechVoice;
}

function startNarration(stopId) {
  const stop = getStopById(stopId);
  if (!stop) {
    return;
  }

  stopNarration();
  const audioPath = getNarrationAudioPath(stopId);
  if (audioPath) {
    narrationAudio = new Audio(audioPath);
    state.narrationState = {
      status: "loading",
      stopId,
      source: "audio"
    };
    narrationAudio.addEventListener("ended", () => {
      state.narrationState = {
        status: "idle",
        stopId: null,
        source: "none"
      };
      narrationAudio = null;
      render(false);
    });
    narrationAudio.addEventListener("canplay", () => {
      state.narrationState = {
        status: "playing",
        stopId,
        source: "audio"
      };
      render(false);
    });
    narrationAudio
      .play()
      .then(() => {
        state.narrationState = {
          status: "playing",
          stopId,
          source: "audio"
        };
        render(false);
      })
      .catch(() => {
        narrationAudio = null;
        startSpeechNarration(stopId);
      });
    render(false);
    return;
  }

  startSpeechNarration(stopId);
}

function startSpeechNarration(stopId) {
  const script = getNarrationScript(stopId);
  if (!script || !window.speechSynthesis) {
    state.narrationState = {
      status: "idle",
      stopId: null,
      source: "none"
    };
    render(false);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(script);
  const preferredVoice = resolvePreferredSpeechVoice();
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  utterance.rate = 0.96;
  utterance.pitch = 1;
  utterance.onend = () => {
    state.narrationState = {
      status: "idle",
      stopId: null,
      source: "none"
    };
    render(false);
  };
  utterance.onerror = () => {
    state.narrationState = {
      status: "idle",
      stopId: null,
      source: "none"
    };
    render(false);
  };
  state.narrationState = {
    status: "playing",
    stopId,
    source: "speech"
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  render(false);
}

function handleHashChange() {
  hydrateStateFromLocation();
  render(false);
}

function hydrateStateFromLocation() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    state.drawer = null;
    return;
  }

  const params = new URLSearchParams(hash);
  const tab = params.get("tab");
  const tourId = params.get("tour");
  const stopId = params.get("stop");
  const drawerTour = params.get("drawerTour");
  const drawerStop = params.get("drawerStop");

  if (tab && ["home", "map", "ar", "progress", "profile"].includes(tab)) {
    state.activeTab = tab;
  }

  const nextTour = tourId ? getTourById(tourId) : null;
  if (nextTour) {
    state.selectedTourId = nextTour.id;
    state.selectedStopId = nextTour.stops[0]?.id ?? state.selectedStopId;
  }

  if (stopId) {
    const selectedTour = getSelectedTour();
    const stopExists = selectedTour.stops.some((stop) => stop.id === stopId);
    if (stopExists) {
      state.selectedStopId = stopId;
    }
  }

  state.drawer = null;
  if (drawerTour && getTourById(drawerTour)) {
    state.drawer = { type: "tour", id: drawerTour };
  } else if (drawerStop && getStopById(drawerStop)) {
    state.drawer = { type: "stop", id: drawerStop };
  }
}

function syncLocationHash() {
  const params = new URLSearchParams();
  params.set("tab", state.activeTab);

  if (state.activeTab === "map" || state.activeTab === "ar" || state.activeTab === "home") {
    params.set("tour", state.selectedTourId);
  }

  if (state.activeTab === "map") {
    params.set("stop", state.selectedStopId);
  }

  if (state.drawer?.type === "tour") {
    params.set("drawerTour", state.drawer.id);
  } else if (state.drawer?.type === "stop") {
    params.set("drawerStop", state.drawer.id);
  }

  const nextHash = params.toString();
  if (window.location.hash.replace(/^#/, "") !== nextHash) {
    window.history.replaceState(null, "", `#${nextHash}`);
  }
}

function setActiveTab(nextTab) {
  if (state.activeTab === "ar" && nextTab !== "ar") {
    stopArLive();
  }
  state.activeTab = nextTab;
  render();
}

function handleClick(event) {
  const rawTarget = event.target;
  const elementTarget =
    rawTarget instanceof Element ? rawTarget : rawTarget && rawTarget.parentElement ? rawTarget.parentElement : null;
  if (!elementTarget) {
    return;
  }

  const actionTarget = elementTarget.closest("[data-action]");
  if (!actionTarget) {
    return;
  }

  const { action, tab, tourId, stopId, theme } = actionTarget.dataset;

  if (action === "set-tab" && tab) {
    setActiveTab(tab);
    return;
  }

  if (action === "jump-featured") {
    state.selectedTourId = tours[0].id;
    state.selectedStopId = tours[0].stops[0].id;
    setActiveTab("map");
    return;
  }

  if (action === "copy-view") {
    copyCurrentViewLink();
    return;
  }

  if (action === "toggle-glasses-mode") {
    const nextGlassesMode = !state.glassesMode;
    if (!nextGlassesMode) {
      stopNarration();
      stopArLive();
      state.glassesModeNotice = "Meta glasses mode turned off. Reopen the route or AR screen if you want to continue in standard phone mode.";
    } else {
      state.glassesModeNotice = "Meta glasses mode turned on. Narration will follow your active Bluetooth audio output.";
    }
    state.glassesMode = nextGlassesMode;
    saveGlassesMode();
    render(false);
    return;
  }

  if (action === "select-tour" && tourId) {
    const selectedTour = getTourById(tourId);
    if (!selectedTour) {
      return;
    }
    state.selectedTourId = selectedTour.id;
    state.selectedStopId = selectedTour.stops[0]?.id ?? "";
    render();
    return;
  }

  if (action === "open-tour-drawer" && tourId) {
    const selectedTour = getTourById(tourId);
    if (!selectedTour) {
      return;
    }
    state.selectedTourId = selectedTour.id;
    state.selectedStopId = selectedTour.stops[0]?.id ?? state.selectedStopId;
    state.drawer = { type: "tour", id: selectedTour.id };
    render();
    return;
  }

  if (action === "select-stop" && stopId) {
    state.selectedStopId = stopId;
    render();
    return;
  }

  if (action === "open-stop-drawer" && stopId) {
    const stop = getStopById(stopId);
    if (!stop) {
      return;
    }
    state.selectedStopId = stop.id;
    state.drawer = { type: "stop", id: stop.id };
    render();
    return;
  }

  if (action === "toggle-stop" && stopId) {
    toggleStop(stopId);
    render();
    return;
  }

  if (action === "set-narration-variant") {
    const variant = actionTarget.dataset.variant;
    if (variant === "walk" || variant === "drive") {
      stopNarration();
      state.narrationVariant = variant;
      render();
    }
    return;
  }

  if (action === "play-narration" && stopId) {
    startNarration(stopId);
    return;
  }

  if (action === "start-ar-live") {
    startArLive();
    return;
  }

  if (action === "stop-ar-live") {
    stopArLive();
    render();
    return;
  }

  if (action === "toggle-auto-narration") {
    state.ar.autoNarrationEnabled = !state.ar.autoNarrationEnabled;
    render();
    return;
  }

  if (action === "stop-narration") {
    stopNarration();
    render();
    return;
  }

  if (action === "close-drawer") {
    stopNarration();
    state.drawer = null;
    render();
    return;
  }

  if (action === "open-selected-tour") {
    state.drawer = null;
    setActiveTab("map");
    return;
  }

  if (action === "set-theme" && theme) {
    state.themeFilter = theme;
    render();
  }
}

function handleInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.name === "subscription-email") {
    state.subscription.email = target.value;
    if (state.subscription.status !== "idle") {
      state.subscription.status = "idle";
      state.subscription.message = "";
    }
  }
}

function handleSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  if (form.dataset.form !== "newsletter-subscription") {
    return;
  }

  event.preventDefault();
  subscribeProfileEmail();
}

function toggleStop(stopId) {
  if (state.completedStopIds.includes(stopId)) {
    state.completedStopIds = state.completedStopIds.filter((id) => id !== stopId);
  } else {
    state.completedStopIds = [...state.completedStopIds, stopId];
  }
  saveCompletedStops();
}

function getTourById(tourId) {
  return tours.find((tour) => tour.id === tourId);
}

function getSelectedTour() {
  return getTourById(state.selectedTourId) ?? tours[0];
}

function getSelectedStop() {
  const selectedTour = getSelectedTour();
  return selectedTour.stops.find((stop) => stop.id === state.selectedStopId) ?? selectedTour.stops[0];
}

function getStopById(stopId) {
  for (const tour of tours) {
    const stop = tour.stops.find((candidate) => candidate.id === stopId);
    if (stop) {
      return stop;
    }
  }
  return null;
}

function getTourForStop(stopId) {
  return tours.find((tour) => tour.stops.some((stop) => stop.id === stopId)) ?? null;
}

function getVisibleTours() {
  const query = state.search.trim().toLowerCase();
  return tours.filter((tour) => {
    const matchesTheme = state.themeFilter === "all" || tour.theme.toLowerCase() === state.themeFilter;
    const haystack = [tour.title, tour.theme, tour.neighborhood, tour.summary, ...tour.tags].join(" ").toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    return matchesTheme && matchesSearch;
  });
}

function getProgressForTour(tour) {
  const completed = tour.stops.filter((stop) => state.completedStopIds.includes(stop.id)).length;
  const percent = Math.round((completed / tour.stops.length) * 100);
  return { completed, percent };
}

function getRecommendedNextStop(tour) {
  return tour.stops.find((stop) => !state.completedStopIds.includes(stop.id)) ?? tour.stops[0];
}

function buildTourNarrative(tour) {
  const first = tour.stops[0];
  const middle = tour.stops[Math.floor(tour.stops.length / 2)];
  const last = tour.stops[tour.stops.length - 1];
  return [first?.title, middle?.title, last?.title].filter(Boolean).join(" → ");
}

function getGlobalStats() {
  const totalStops = tours.reduce((count, tour) => count + tour.stops.length, 0);
  const completedStops = state.completedStopIds.length;
  const toursStarted = tours.filter((tour) => getProgressForTour(tour).completed > 0).length;
  return { totalStops, completedStops, toursStarted };
}

function truncateCopy(value, maxLength = 180) {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getNewsletterApiConfig() {
  const supabaseUrl = String(siteConfig.supabaseUrl || "").trim().replace(/\/+$/, "");
  const supabaseAnonKey = String(siteConfig.supabaseAnonKey || "").trim();
  const newsletterTable = String(siteConfig.newsletterTable || "newsletter_subscribers").trim();
  return { supabaseUrl, supabaseAnonKey, newsletterTable };
}

function getSubscriptionStatusMarkup() {
  if (!state.subscription.message) {
    return "";
  }

  const statusClass =
    state.subscription.status === "success"
      ? "subscription-status success"
      : state.subscription.status === "error"
        ? "subscription-status error"
        : "subscription-status";

  return `<p class="${statusClass}" role="status">${escapeHtml(state.subscription.message)}</p>`;
}

async function subscribeProfileEmail() {
  const normalizedEmail = state.subscription.email.trim().toLowerCase();
  if (!normalizedEmail) {
    state.subscription.status = "error";
    state.subscription.message = "Enter an email address before subscribing.";
    render(false);
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalizedEmail)) {
    state.subscription.status = "error";
    state.subscription.message = "Enter a valid email address.";
    render(false);
    return;
  }

  const { supabaseUrl, supabaseAnonKey, newsletterTable } = getNewsletterApiConfig();
  if (!supabaseUrl || !supabaseAnonKey) {
    state.subscription.status = "error";
    state.subscription.message = "Subscription is not configured yet for this web build.";
    render(false);
    return;
  }

  state.subscription.status = "submitting";
  state.subscription.message = "Saving your subscription...";
  render(false);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${newsletterTable}?on_conflict=email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify([
        {
          email: normalizedEmail,
          source: "webapp-profile",
          status: "active",
          subscribed_at: Date.now(),
          updated_at: Date.now(),
          metadata_json: JSON.stringify({
            host: window.location.hostname,
            glassesMode: state.glassesMode
          })
        }
      ])
    });

    if (!response.ok) {
      throw new Error(`Subscription failed with status ${response.status}`);
    }

    state.subscription.email = "";
    state.subscription.status = "success";
    state.subscription.message = "You're on the Founders Threads email list.";
    render(false);
  } catch (error) {
    state.subscription.status = "error";
    state.subscription.message = "We couldn't save your email right now. Please try again in a moment.";
    render(false);
  }
}

function render(shouldSyncHash = true) {
  teardownRouteMap();
  updateChrome();

  tabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });

  const selectedTour = getSelectedTour();
  const selectedStop = getSelectedStop();
  const globalStats = getGlobalStats();

  app.innerHTML = `
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Luxury cultural driving companion</p>
        <h2>Drive Philadelphia through Black legacy, innovation, and place.</h2>
        <p class="hero-text">
          Browse premium routes, hear layered narration, and move through one of America's most drivable and beautiful city regions with purpose.
        </p>
      </div>
      <div class="hero-metrics">
        <article class="metric-card">
          <span>${tours.length}</span>
          <p>Curated drive-ready collections</p>
        </article>
        <article class="metric-card">
          <span>${globalStats.totalStops}</span>
          <p>Story stops staged for route listening</p>
        </article>
        <article class="metric-card">
          <span>${globalStats.completedStops}</span>
          <p>Places you've already unlocked</p>
        </article>
      </div>
    </section>
    ${renderActiveTab(selectedTour, selectedStop, globalStats)}
    ${renderDrawer()}
  `;

  if (shouldSyncHash) {
    syncLocationHash();
  }

  const searchInput = document.querySelector("[data-role='tour-search']");
  if (searchInput) {
    searchInput.value = state.search;
    searchInput.addEventListener("input", (event) => {
      state.search = event.target.value;
      render();
    });
  }

  if (state.activeTab === "map") {
    initRouteMap(selectedTour, selectedStop);
  }

  if (state.activeTab === "ar" && state.ar.mode === "live" && arStream) {
    const video = document.getElementById("ar-camera-feed");
    if (video) {
      video.srcObject = arStream;
      video.play().catch(() => undefined);
    }
  }
}

function renderActiveTab(selectedTour, selectedStop, globalStats) {
  switch (state.activeTab) {
    case "map":
      return renderRouteTab(selectedTour, selectedStop);
    case "ar":
      return renderArTab(selectedTour);
    case "progress":
      return renderProgressTab(globalStats);
    case "profile":
      return renderProfileTab();
    default:
      return renderHomeTab(selectedTour);
  }
}

function renderHomeTab(selectedTour) {
  const visibleTours = getVisibleTours();
  const themes = ["all", ...new Set(tours.map((tour) => tour.theme.toLowerCase()))];
  const featuredNextStop = getRecommendedNextStop(selectedTour);

  return `
    <section class="section-grid home-grid">
      <article class="panel featured-panel" id="featured-tour">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Featured drive</p>
            <h3>${selectedTour.title}</h3>
          </div>
          <span class="status-pill">${selectedTour.theme}</span>
        </div>
        <p class="lede">${selectedTour.summary}</p>
        <div class="chip-row">
          ${selectedTour.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
        </div>
        <div class="quick-start-grid">
          <article class="quick-start-card">
            <span class="quick-start-step">1</span>
            <strong>Pick your drive</strong>
            <p>${selectedTour.title}</p>
          </article>
          <article class="quick-start-card">
            <span class="quick-start-step">2</span>
            <strong>Start with</strong>
            <p>${featuredNextStop.title}</p>
          </article>
          <article class="quick-start-card">
            <span class="quick-start-step">3</span>
            <strong>Best mode</strong>
            <p>${state.glassesMode ? "Glasses-ready narration" : "Drive narration on phone"}</p>
          </article>
        </div>
        <div class="stats-row">
          <div><strong>${selectedTour.durationMin} min</strong><span>Estimated duration</span></div>
          <div><strong>${selectedTour.distanceMiles} mi</strong><span>Scenic city route</span></div>
          <div><strong>${selectedTour.rating}</strong><span>Premium rider rating</span></div>
        </div>
        <div class="button-row">
          <button type="button" class="primary-button" data-action="set-tab" data-tab="map">Start this drive</button>
          <button type="button" class="ghost-button" data-action="open-tour-drawer" data-tour-id="${selectedTour.id}">See full route brief</button>
          <button type="button" class="ghost-button" data-action="set-tab" data-tab="ar">See arrival mode</button>
        </div>
      </article>

      <article class="panel spotlight-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Collections</p>
            <h3>Choose your lens on the road</h3>
          </div>
        </div>
        <p class="lede">Choose one route first. Everything else, including stop context, narration, and AR handoff, gets much easier once a drive is selected.</p>
        <div class="filter-row">
          ${themes
            .map(
              (theme) => `
                <button
                  type="button"
                  class="filter-chip ${state.themeFilter === theme ? "active" : ""}"
                  data-action="set-theme"
                  data-theme="${theme}"
                >
                  ${theme === "all" ? "All themes" : capitalize(theme)}
                </button>
              `
            )
            .join("")}
        </div>
        <label class="search-field">
          <span>Search tours</span>
          <input type="search" placeholder="History, archives, sports..." data-role="tour-search" />
        </label>
        <div class="tour-list">
          ${visibleTours
            .map((tour) => {
              const progress = getProgressForTour(tour);
              const isSelected = tour.id === selectedTour.id;
              const nextStop = getRecommendedNextStop(tour);
              return `
                <article class="tour-card ${isSelected ? "selected" : ""}">
                  <div class="tour-card-top">
                    <div>
                      <p class="eyebrow">${tour.neighborhood}</p>
                      <h4>${tour.title}</h4>
                    </div>
                    <span class="status-pill">${isSelected ? "Selected" : tour.theme}</span>
                  </div>
                  <p>${truncateCopy(tour.summary, 132)}</p>
                  <div class="tour-card-meta">
                    <span>${tour.durationMin} min</span>
                    <span>${tour.distanceMiles} mi</span>
                    <span>${tour.stops.length} stops</span>
                    <span>${progress.percent}% complete</span>
                  </div>
                  <div class="tour-card-foot">
                    <span>Start with ${nextStop.title}</span>
                  </div>
                  <div class="button-row compact">
                    <button type="button" class="primary-button" data-action="select-tour" data-tour-id="${tour.id}">
                      ${isSelected ? "Selected drive" : "Choose drive"}
                    </button>
                    <button type="button" class="ghost-button" data-action="open-tour-drawer" data-tour-id="${tour.id}">Route brief</button>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function renderRouteTab(selectedTour, selectedStop) {
  const progress = getProgressForTour(selectedTour);
  const mapReady = typeof window.L !== "undefined";
  const highlightStops = selectedTour.stops.slice(0, 3);
  const narrationMode = getNarrationMode(selectedStop.id);
  const narrationScript = getNarrationScript(selectedStop.id) || "No narration script is available for this stop yet.";
  const narrationPreview = truncateCopy(narrationScript, 180);
  const isNarrating = state.narrationState.stopId === selectedStop.id && state.narrationState.status === "playing";

  return `
    <section class="section-grid route-grid">
      <article class="panel route-map-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Route preview</p>
            <h3>${selectedTour.title}</h3>
          </div>
          <span class="status-pill">${progress.completed}/${selectedTour.stops.length} complete</span>
        </div>
        <p class="lede">${selectedTour.guideMode}. ${selectedTour.arFocus}.</p>
        <div class="route-map-shell">
          <div class="route-map" id="route-map" aria-label="Interactive route map"></div>
          ${
            mapReady
              ? ""
              : `<div class="map-fallback">Map library unavailable. The route details are still available below.</div>`
          }
        </div>
        <div class="route-legend">
          <span><i class="legend-dot active"></i>Selected</span>
          <span><i class="legend-dot done"></i>Completed</span>
          <span><i class="legend-dot"></i>Upcoming</span>
        </div>
        <div class="route-highlights">
          ${highlightStops
            .map(
              (stop, index) => `
                <article class="highlight-card">
                  <span class="highlight-index">0${index + 1}</span>
                  <strong>${stop.title}</strong>
                  <p>${stop.locationLabel || "Philadelphia"}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </article>

      <article class="panel stop-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Selected stop</p>
            <h3>${selectedStop.title}</h3>
          </div>
          <span class="status-pill">${selectedStop.radius}m radius</span>
        </div>
        <p class="lede">${selectedStop.description}</p>
        <div class="stop-summary-grid">
          <div>
            <strong>Where to aim</strong>
            <p>${selectedStop.locationLabel || "Use the highlighted marker and stop list."}</p>
          </div>
          <div>
            <strong>Visit posture</strong>
            <p>${selectedStop.dayLabel || "Flexible day"}${selectedStop.timeLabel ? ` · ${selectedStop.timeLabel}` : ""}</p>
          </div>
          <div>
            <strong>Next best move</strong>
            <p>${state.completedStopIds.includes(selectedStop.id) ? "Mark it upcoming if you want to revisit it." : "Play the stop, open maps, or mark it complete."}</p>
          </div>
        </div>
        <div class="stop-meta-row">
          <span class="chip">${selectedTour.theme}</span>
          ${selectedStop.locationLabel ? `<span class="chip">${selectedStop.locationLabel}</span>` : ""}
          <span class="chip">${selectedTour.stops.length} stops on route</span>
        </div>
        <div class="companion-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Meta glasses</p>
              <h3>Browser companion mode</h3>
            </div>
            <span class="status-pill ${state.glassesMode ? "is-live" : ""}">${state.glassesMode ? "Ready" : "Standby"}</span>
          </div>
          <p>${getGlassesModeCopy()}</p>
          ${state.glassesModeNotice ? `<div class="drawer-copy"><strong>Status</strong><p>${state.glassesModeNotice}</p></div>` : ""}
          <div class="button-row">
            <button type="button" class="ghost-button ${state.glassesMode ? "active" : ""}" data-action="toggle-glasses-mode">
              ${getGlassesModeButtonLabel()}
            </button>
            <a class="ghost-button link-button" href="${buildPhoneAppHandoffLink(selectedTour.id, selectedStop.id)}">Open in Philly Tours app</a>
          </div>
        </div>
        <div class="narration-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Narration</p>
              <h3>Real runtime audio</h3>
            </div>
            <span class="status-pill">${state.glassesMode ? `${getNarrationLabel(selectedStop.id)} to glasses-ready output` : getNarrationLabel(selectedStop.id)}</span>
          </div>
          <div class="variant-toggle">
            <button type="button" class="filter-chip ${state.narrationVariant === "walk" ? "active" : ""}" data-action="set-narration-variant" data-variant="walk">Walk</button>
            <button type="button" class="filter-chip ${state.narrationVariant === "drive" ? "active" : ""}" data-action="set-narration-variant" data-variant="drive">Drive</button>
          </div>
          <div class="button-row">
            <button
              type="button"
              class="primary-button"
              data-action="${isNarrating ? "stop-narration" : "play-narration"}"
              data-stop-id="${selectedStop.id}"
              ${narrationMode === "none" ? "disabled" : ""}
            >
              ${isNarrating ? "Stop narration" : narrationMode === "recorded" ? "Play recorded narration" : "Play Amy fallback"}
            </button>
            <button type="button" class="ghost-button" data-action="open-stop-drawer" data-stop-id="${selectedStop.id}">Full stop brief</button>
          </div>
          <div class="drawer-copy">
            <strong>Transcript preview</strong>
            <p>${narrationPreview}</p>
          </div>
        </div>
        <div class="button-row">
          <button type="button" class="primary-button" data-action="toggle-stop" data-stop-id="${selectedStop.id}">
            ${state.completedStopIds.includes(selectedStop.id) ? "Mark as upcoming" : "Mark stop complete"}
          </button>
          <a class="ghost-button link-button" href="#tab=map&tour=${selectedTour.id}&stop=${selectedStop.id}">Copyable view</a>
          <a
            class="ghost-button link-button"
            href="https://www.google.com/maps/search/?api=1&query=${selectedStop.lat},${selectedStop.lng}"
            target="_blank"
            rel="noreferrer"
          >
            Open in maps
          </a>
          <button type="button" class="ghost-button" data-action="set-tab" data-tab="progress">View progress</button>
        </div>
        <div class="stop-list">
          ${selectedTour.stops
            .map((stop, index) => `
              <button
                type="button"
                class="stop-row ${selectedStop.id === stop.id ? "active" : ""}"
                data-action="select-stop"
                data-stop-id="${stop.id}"
              >
                <div>
                  <strong>${index + 1}. ${stop.title}</strong>
                  <p>${stop.locationLabel || truncateCopy(stop.description, 88)}</p>
                </div>
                <span class="check-badge ${state.completedStopIds.includes(stop.id) ? "done" : ""}">
                  ${selectedStop.id === stop.id ? "Viewing" : state.completedStopIds.includes(stop.id) ? "Done" : "Open"}
                </span>
              </button>
            `)
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function renderDrawer() {
  if (!state.drawer) {
    return "";
  }

  if (state.drawer.type === "tour") {
    const tour = getTourById(state.drawer.id);
    if (!tour) {
      return "";
    }
    const progress = getProgressForTour(tour);
    const nextStop = getRecommendedNextStop(tour);
    return `
      <aside class="detail-drawer-backdrop" data-action="close-drawer">
        <section class="detail-drawer" aria-label="Tour details">
          <div class="drawer-topbar">
            <div>
              <p class="eyebrow">Tour detail</p>
              <h3>${tour.title}</h3>
            </div>
            <button type="button" class="drawer-close" data-action="close-drawer" aria-label="Close detail panel">×</button>
          </div>
          <p class="lede">${tour.summary}</p>
          <div class="chip-row">
            <span class="chip">${tour.theme}</span>
            <span class="chip">${tour.neighborhood}</span>
            <span class="chip">${tour.stops.length} stops</span>
          </div>
          <div class="drawer-stats">
            <div><strong>${tour.durationMin} min</strong><span>Estimated duration</span></div>
            <div><strong>${tour.distanceMiles} mi</strong><span>Route distance</span></div>
            <div><strong>${progress.percent}%</strong><span>Current progress</span></div>
          </div>
          <div class="drawer-copy">
            <strong>AR posture</strong>
            <p>${tour.arFocus}</p>
          </div>
          <div class="drawer-copy">
            <strong>Stops to know</strong>
            <p>${tour.stops.slice(0, 5).map((stop) => stop.title).join(", ")}</p>
          </div>
          <div class="drawer-copy">
            <strong>Suggested flow</strong>
            <p>${buildTourNarrative(tour)}</p>
          </div>
          <div class="drawer-copy emphasis">
            <strong>Recommended next stop</strong>
            <p>${nextStop.title}${nextStop.locationLabel ? ` · ${nextStop.locationLabel}` : ""}</p>
          </div>
          <div class="button-row">
            <button type="button" class="primary-button" data-action="open-selected-tour">Open route planner</button>
            <button type="button" class="ghost-button" data-action="close-drawer">Close</button>
          </div>
        </section>
      </aside>
    `;
  }

  if (state.drawer.type === "stop") {
    const stop = getStopById(state.drawer.id);
    const tour = stop ? getTourForStop(stop.id) : null;
    if (!stop || !tour) {
      return "";
    }
    const nextStop = getRecommendedNextStop(tour);
    const narrationMode = getNarrationMode(stop.id);
    const narrationScript = getNarrationScript(stop.id) || "No narration transcript is available for this stop yet.";
    const isNarrating = state.narrationState.stopId === stop.id && state.narrationState.status === "playing";
  const arOverlayMeta = getArOverlayMeta(stop.id);
  const resolvedModelUrl = getResolvedModelUrl(arOverlayMeta?.modelUrl);
  return `
      <aside class="detail-drawer-backdrop" data-action="close-drawer">
        <section class="detail-drawer" aria-label="Stop details">
          <div class="drawer-topbar">
            <div>
              <p class="eyebrow">Stop detail</p>
              <h3>${stop.title}</h3>
            </div>
            <button type="button" class="drawer-close" data-action="close-drawer" aria-label="Close detail panel">×</button>
          </div>
          <p class="lede">${stop.description}</p>
          <div class="chip-row">
            ${stop.dayLabel ? `<span class="chip">${stop.dayLabel}</span>` : ""}
            ${stop.timeLabel ? `<span class="chip">${stop.timeLabel}</span>` : ""}
            ${stop.locationLabel ? `<span class="chip">${stop.locationLabel}</span>` : ""}
          </div>
          <div class="drawer-stats">
            <div><strong>${tour.title}</strong><span>Tour collection</span></div>
            <div><strong>${stop.radius}m</strong><span>Trigger radius</span></div>
            <div><strong>${state.completedStopIds.includes(stop.id) ? "Done" : "Upcoming"}</strong><span>Progress state</span></div>
          </div>
          <div class="drawer-copy">
            <strong>Coordinates</strong>
            <p>${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}</p>
          </div>
          <div class="drawer-copy">
            <strong>Narration source</strong>
            <p>${getNarrationLabel(stop.id)}${state.narrationState.source === "speech" ? " using Amy when available" : ""}</p>
          </div>
          <div class="drawer-copy">
            <strong>Model readiness</strong>
            <p>${
              arOverlayMeta?.webModelAvailable
                ? `Web preview available at ${resolvedModelUrl}`
                : arOverlayMeta?.iosModelAvailable
                  ? "An iOS model exists for this stop, but there is no deployed web model yet."
                  : arOverlayMeta?.modelUrl
                    ? `This stop has a planned web model target (${resolvedModelUrl}) but the runtime file has not been deployed yet.`
                    : "No model target is attached to this stop yet."
            }</p>
          </div>
          <div class="variant-toggle">
            <button type="button" class="filter-chip ${state.narrationVariant === "walk" ? "active" : ""}" data-action="set-narration-variant" data-variant="walk">Walk</button>
            <button type="button" class="filter-chip ${state.narrationVariant === "drive" ? "active" : ""}" data-action="set-narration-variant" data-variant="drive">Drive</button>
          </div>
          <div class="button-row">
            <button
              type="button"
              class="primary-button"
              data-action="${isNarrating ? "stop-narration" : "play-narration"}"
              data-stop-id="${stop.id}"
              ${narrationMode === "none" ? "disabled" : ""}
            >
              ${isNarrating ? "Stop narration" : narrationMode === "recorded" ? "Play recorded narration" : "Play Amy fallback"}
            </button>
          </div>
          <div class="drawer-copy">
            <strong>Transcript</strong>
            <p>${narrationScript}</p>
          </div>
          <div class="drawer-copy emphasis">
            <strong>Recommended next stop</strong>
            <p>${nextStop.id === stop.id ? "You are on the next recommended stop." : `${nextStop.title}${nextStop.locationLabel ? ` · ${nextStop.locationLabel}` : ""}`}</p>
          </div>
          <div class="button-row">
            <button type="button" class="primary-button" data-action="open-selected-tour">Open route planner</button>
            <a
              class="ghost-button link-button"
              href="https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}"
              target="_blank"
              rel="noreferrer"
            >
              Open in maps
            </a>
          </div>
        </section>
      </aside>
    `;
  }

  return "";
}

function renderArTab(selectedTour) {
  const nearestStop = state.ar.nearestStopId ? getStopById(state.ar.nearestStopId) : null;
  const effectiveStop = nearestStop || selectedTour.stops[0];
  const narrationMode = effectiveStop ? getNarrationMode(effectiveStop.id) : "none";
  const isNarrating = effectiveStop
    ? state.narrationState.stopId === effectiveStop.id && state.narrationState.status === "playing"
    : false;
  const arDistanceLabel =
    state.ar.distanceToNearestM !== null ? `${state.ar.distanceToNearestM}m` : "Locating";
  const arRangeLabel = state.ar.inRange ? "Within trigger radius" : "Move closer to trigger";
  const arCameraLabel = state.ar.cameraReady ? "Camera live" : "Camera pending";
  const arGpsLabel = state.ar.locationReady ? "GPS locked" : "Acquiring GPS";

  return `
    <section class="section-grid ar-grid">
      <article class="panel ar-live-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">AR live</p>
            <h3>Camera-first field mode</h3>
          </div>
          <span class="status-pill">${state.ar.mode === "live" ? "AR Live" : "Standby"}</span>
        </div>
        <div class="ar-stage">
          ${
            state.ar.mode === "live"
              ? `
                <video id="ar-camera-feed" class="ar-camera-feed" autoplay playsinline muted></video>
                <div class="ar-grid-overlay"></div>
                <div class="ar-reticle"></div>
                <div class="ar-badge top-left">AR Live</div>
                <button type="button" class="ar-close" data-action="stop-ar-live" aria-label="Stop AR live mode">×</button>
                <div class="ar-stop-pill">${effectiveStop ? effectiveStop.title : "Searching for stop"}</div>
                <div class="ar-status-strip">
                  <span class="ar-badge">${arCameraLabel}</span>
                  <span class="ar-badge">${arGpsLabel}</span>
                  <span class="ar-badge">${arDistanceLabel}</span>
                </div>
                <div class="ar-target-card">
                  <strong>${effectiveStop ? effectiveStop.title : "No stop target yet"}</strong>
                  <p>${effectiveStop?.locationLabel || "Waiting for the nearest story stop."}</p>
                  <span>${arRangeLabel}</span>
                  <small>Stories play through audio for the glasses only.</small>
                </div>
              `
              : `
                <div class="ar-placeholder">
                  <div class="ar-icon">⌖</div>
                  <h4>Launch live camera mode</h4>
                  <p>Point your camera at nearby streetscapes and let the selected tour guide you to the nearest story stop.</p>
                </div>
              `
          }
        </div>
        <div class="button-row">
          <button type="button" class="primary-button" data-action="${state.ar.mode === "live" ? "stop-ar-live" : "start-ar-live"}">
            ${state.ar.mode === "live" ? "Stop AR Live" : "Launch AR Camera"}
          </button>
          <button type="button" class="ghost-button" data-action="set-tab" data-tab="map">Open route backup</button>
        </div>
        <div class="drawer-copy">
          <strong>Field note</strong>
          <p>Camera and GPS are allowed on localhost for development, and on secure public deployments like this one over HTTPS.</p>
        </div>
        ${state.ar.error ? `<div class="drawer-copy"><strong>Status</strong><p>${state.ar.error}</p></div>` : ""}
      </article>

      <article class="panel readiness-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Current focus</p>
            <h3>${selectedTour.title}</h3>
          </div>
          <span class="status-pill">${state.ar.inRange ? "In range" : "Tracking"}</span>
        </div>
        <div class="readiness-list">
          <div>
            <strong>Nearest stop</strong>
            <p>${effectiveStop ? effectiveStop.title : "Waiting for a nearby stop"}</p>
          </div>
          <div>
            <strong>Distance</strong>
            <p>${state.ar.distanceToNearestM !== null ? `${state.ar.distanceToNearestM}m away` : "Waiting for location lock"}</p>
          </div>
          <div>
            <strong>Range trigger</strong>
            <p>${effectiveStop ? `${effectiveStop.radius}m activation radius` : "No stop selected"}</p>
          </div>
        </div>
        ${
          effectiveStop
            ? `
              <div class="drawer-copy">
                <strong>Audio-only glasses mode</strong>
                <p>${state.glassesMode ? "Glasses mode is on. Stop stories are told through recorded narration or Amy fallback on the active Bluetooth audio output, not through floating text overlays." : "Enable Meta glasses mode if you want this browser session to behave like a hands-free audio companion while keeping route and AR control on the phone."}</p>
              </div>
              ${state.glassesModeNotice ? `<div class="drawer-copy"><strong>Status</strong><p>${state.glassesModeNotice}</p></div>` : ""}
              <div class="drawer-copy emphasis">
                <strong>Live cue</strong>
                <p>${state.ar.inRange ? `You are within range of ${effectiveStop.title}.` : `Move toward ${effectiveStop.locationLabel || effectiveStop.title} to unlock the stop.`}</p>
              </div>
              <div class="button-row">
                <button type="button" class="ghost-button" data-action="toggle-auto-narration">
                  ${state.ar.autoNarrationEnabled ? "Auto narration on" : "Auto narration off"}
                </button>
              </div>
              <div class="button-row">
                <button
                  type="button"
                  class="primary-button"
                  data-action="${isNarrating ? "stop-narration" : "play-narration"}"
                  data-stop-id="${effectiveStop.id}"
                  ${narrationMode === "none" ? "disabled" : ""}
                >
                  ${isNarrating ? "Stop narration" : narrationMode === "recorded" ? "Play stop narration" : "Play Amy fallback"}
                </button>
                <button type="button" class="ghost-button" data-action="open-stop-drawer" data-stop-id="${effectiveStop.id}">Open stop brief</button>
                <a class="ghost-button link-button" href="${buildPhoneAppHandoffLink(selectedTour.id, effectiveStop.id)}">Open in phone app</a>
              </div>
            `
            : ""
        }
        <div class="button-row">
          <button type="button" class="primary-button" data-action="set-tab" data-tab="map">Inspect stops</button>
          <button type="button" class="ghost-button" data-action="select-tour" data-tour-id="${selectedTour.id}">Keep this route selected</button>
        </div>
      </article>
    </section>
  `;
}

function renderProgressTab(globalStats) {
  return `
    <section class="section-grid progress-grid">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Your footprint</p>
            <h3>Progress across collections</h3>
          </div>
        </div>
        <div class="stats-row">
          <div><strong>${globalStats.completedStops}</strong><span>Stops completed</span></div>
          <div><strong>${globalStats.toursStarted}</strong><span>Tours started</span></div>
          <div><strong>${Math.round((globalStats.completedStops / globalStats.totalStops) * 100) || 0}%</strong><span>Overall completion</span></div>
        </div>
      </article>
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Collection health</p>
            <h3>What’s active on this device</h3>
          </div>
        </div>
        <div class="progress-list">
          ${tours
            .map((tour) => {
              const progress = getProgressForTour(tour);
              return `
                <div class="progress-row">
                  <div class="progress-copy">
                    <strong>${tour.title}</strong>
                    <span>${progress.completed}/${tour.stops.length} stops</span>
                  </div>
                  <div class="progress-bar">
                    <span style="width:${progress.percent}%"></span>
                  </div>
                  <span class="progress-value">${progress.percent}%</span>
                </div>
              `;
            })
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function renderProfileTab() {
  const startedTours = tours.filter((tour) => getProgressForTour(tour).completed > 0);
  return `
    <section class="section-grid profile-grid">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Profile</p>
            <h3>Founder demo rider</h3>
          </div>
          <span class="status-pill">Local-only state</span>
        </div>
        <div class="profile-list">
          <div><strong>Preferred style</strong><p>Long-form cultural routes with AR highlights</p></div>
          <div><strong>Saved tours</strong><p>${startedTours.length ? startedTours.map((tour) => tour.title).join(", ") : "No tours started yet"}</p></div>
          <div><strong>Playback mode</strong><p>Drive-first narration + native handoff</p></div>
          <div><strong>Meta glasses mode</strong><p>${state.glassesMode ? "Enabled for Bluetooth audio routing" : "Off until glasses are paired over Bluetooth"}</p></div>
        </div>
        ${state.glassesModeNotice ? `<div class="drawer-copy"><strong>Mode status</strong><p>${state.glassesModeNotice}</p></div>` : ""}
      </article>
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Stay connected</p>
            <h3>Contact and updates</h3>
          </div>
        </div>
        <p class="lede">
          Reach Founders Threads directly or join the live email list for new routes, pilot drives, and premium launch updates.
        </p>
        <div class="button-row">
          <a class="primary-button link-button" href="mailto:${CONTACT_EMAIL}">Contact us</a>
          <button type="button" class="ghost-button" data-action="set-tab" data-tab="home">Browse tours</button>
          <button type="button" class="ghost-button" data-action="set-tab" data-tab="map">Resume route</button>
        </div>
        <form class="subscription-form" data-form="newsletter-subscription">
          <label class="search-field">
            <span>Email subscription</span>
            <input
              type="email"
              name="subscription-email"
              placeholder="you@example.com"
              autocomplete="email"
              inputmode="email"
              value="${escapeHtml(state.subscription.email)}"
              ${state.subscription.status === "submitting" ? "disabled" : ""}
            />
          </label>
          <div class="button-row compact">
            <button type="submit" class="primary-button" ${state.subscription.status === "submitting" ? "disabled" : ""}>
              ${state.subscription.status === "submitting" ? "Subscribing..." : "Subscribe"}
            </button>
            <button type="button" class="ghost-button ${state.glassesMode ? "active" : ""}" data-action="toggle-glasses-mode">${getGlassesModeButtonLabel()}</button>
          </div>
          ${getSubscriptionStatusMarkup()}
        </form>
        <div class="drawer-copy">
          <strong>Contact email</strong>
          <p>${CONTACT_EMAIL}</p>
        </div>
      </article>
    </section>
  `;
}

function buildRouteDots(stops) {
  const lats = stops.map((stop) => stop.lat);
  const lngs = stops.map((stop) => stop.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  return stops.map((stop) => ({
    ...stop,
    x: 12 + ((stop.lng - minLng) / lngRange) * 70,
    y: 18 + (1 - (stop.lat - minLat) / latRange) * 56
  }));
}

function teardownRouteMap() {
  if (routeMap) {
    routeMap.remove();
    routeMap = null;
    routeMapLayers = null;
  }
}

function initRouteMap(selectedTour, selectedStop) {
  if (typeof window.L === "undefined") {
    return;
  }

  const mapElement = document.getElementById("route-map");
  if (!mapElement) {
    return;
  }

  routeMap = window.L.map(mapElement, {
    zoomControl: true,
    scrollWheelZoom: false
  });

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(routeMap);

  routeMapLayers = window.L.featureGroup().addTo(routeMap);

  const latLngs = selectedTour.stops.map((stop) => [stop.lat, stop.lng]);

  window.L.polyline(latLngs, {
    color: "#7f3119",
    weight: 4,
    opacity: 0.8,
    dashArray: "8 8"
  }).addTo(routeMapLayers);

  selectedTour.stops.forEach((stop, index) => {
    const isSelected = stop.id === selectedStop.id;
    const isDone = state.completedStopIds.includes(stop.id);

    const marker = window.L.circleMarker([stop.lat, stop.lng], {
      radius: isSelected ? 11 : 8,
      color: isSelected ? "#b74d2c" : isDone ? "#35574f" : "#172026",
      weight: isSelected ? 3 : 2,
      fillColor: isSelected ? "#f2d7b2" : isDone ? "#d7eadf" : "#fffaf0",
      fillOpacity: 0.95
    }).addTo(routeMapLayers);

    marker.bindTooltip(`${index + 1}. ${stop.title}`, {
      direction: "top",
      offset: [0, -8]
    });

    marker.on("click", () => {
      state.selectedStopId = stop.id;
      render();
    });
  });

  routeMap.fitBounds(routeMapLayers.getBounds().pad(0.18));
}

function buildRoutePath(stops) {
  return stops.map((stop, index) => `${index === 0 ? "M" : "L"} ${stop.x} ${stop.y}`).join(" ");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
