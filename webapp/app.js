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
const siteConfig = {
  ...(window.PHILLY_TOURS_CONFIG || {}),
  ...(window.PHILLY_TOURS_LOCAL_CONFIG || {})
};

const STORAGE_KEY = "philly-ar-tours-web-progress";
const GLASSES_MODE_KEY = "philly-ar-tours-web-glasses-mode";
const AUTH_STORAGE_KEY = "philly-ar-tours-web-session";
const OAUTH_PROVIDER_STORAGE_KEY = "philly-ar-tours-web-oauth-provider";
const TOUR_ORDER_STORAGE_KEY = "philly-ar-tours-web-tour-order-v1";
const PRODUCTION_HOSTS = new Set(["philly-tours.com", "www.philly-tours.com"]);
const CONTACT_EMAIL = "info@foundersthreads.org";
const SOCIAL_CHANNELS = [
  {
    label: "Instagram",
    handle: "@philly_tours",
    href: "https://www.instagram.com/philly_tours",
    icon: "instagram"
  },
  {
    label: "Facebook",
    handle: "@FoundersThreads",
    href: "https://www.facebook.com/people/Founders-Threads/61581897702529/",
    icon: "facebook"
  },
  {
    label: "X",
    handle: "@FoundersThreads",
    href: "https://x.com/FoundrsThreads",
    icon: "x"
  },
  {
    label: "Bluesky",
    handle: "@foundersthreads",
    href: "https://bsky.app/profile/foundersthreads.bsky.social",
    icon: "bluesky"
  },
  {
    label: "Cash App",
    handle: "$FoundersThreads",
    href: "https://cash.app/$FoundersThreads",
    icon: "cashapp"
  },
  {
    label: "YouTube",
    handle: "@niathatswhy",
    href: "https://www.youtube.com/@niathatswhy",
    icon: "youtube"
  },
  {
    label: "WhatsApp",
    handle: "+1 (631) 773-5745",
    href: "https://api.whatsapp.com/send?phone=16317735745",
    icon: "whatsapp"
  }
];
const RSS_FEED_PATH = "./rss.xml";
const RSS_UPDATES = [
  {
    title: "New route drops",
    detail: "Fresh walking and driving story collections as they go live."
  },
  {
    title: "Pilot ride alerts",
    detail: "Invites for field tests, premium audio launches, and heritage viewer updates."
  },
  {
    title: "Founder notes",
    detail: "Short product and curation updates pulled into one RSS feed."
  }
];
const BOARD_LEVELS = [
  { title: "Visitor", minXp: 0 },
  { title: "Route Scout", minXp: 100 },
  { title: "Story Keeper", minXp: 250 },
  { title: "City Archivist", minXp: 500 },
  { title: "Founder Guide", minXp: 900 }
];
const FOUNDERS_COMPASS_ANCHOR = { lat: 39.953405220467, lng: -75.163235969318 };
let routeMap = null;
let routeMapLayers = null;
let stopStreetView = null;
let stopStreetViewRequestToken = 0;
const stopStreetViewAddressCache = new Map();
let googleMapsApiPromise = null;
let activeMapViewportCleanup = null;
let googleMapsAuthFailed = false;
let narrationAudio = null;
let preferredSpeechVoice = null;
let arStream = null;
let arLocationWatchId = null;
let mapLocationWatchId = null;
let compassOrientationHandler = null;
const compassAutoAdvancedStopKeys = new Set();
let xrSession = null;
let xrCanvas = null;
let xrGl = null;
let xrReferenceSpace = null;
const AR_RANGE_HYSTERESIS_M = 15;
const AR_AUTO_NARRATION_COOLDOWN_MS = 45000;
const AUDIO_PREVIEW_LIMIT = 2;
let copyButtonResetTimer = null;
let webTurnstileMountTimer = null;
let webTurnstileWidgetId = null;
let authRefreshTimer = null;
let tabBarAutoHideTimer = null;
let supabaseClientPromise = null;

const state = {
  auth: {
    booting: true,
    session: null,
    authToken: "",
    displayName: "",
    email: "",
    password: "",
    status: "idle",
    message: "",
    turnstileToken: null
  },
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
  xr: {
    checked: false,
    supported: false,
    sessionType: "",
    mode: "idle",
    deviceLabel: "",
    error: ""
  },
  map: {
    tracking: false,
    requested: false,
    locationReady: false,
    error: "",
    userLocation: null,
    nearestStopId: null,
    distanceToSelectedM: null,
    headingReady: false,
    headingDegrees: null,
    headingError: "",
    autoAdvanceNote: "",
    followNearestStop: true
  },
  glassesMode: loadGlassesMode(),
  glassesModeNotice: "",
  subscription: {
    email: "",
    status: "idle",
    message: ""
  },
  checkout: {
    status: "idle",
    message: ""
  },
  audioAccess: {
    fullUnlocked: loadAudioUnlocked(),
    previewedStopIds: loadAudioPreviewedStopIds()
  },
  draggingTourId: "",
  expandedTourCardId: tours[0].id,
  routePageTourId: null,
  home: {
    focusTourId: null
  },
  maps: {
    routePreviewsByTourId: {}
  },
  search: "",
  themeFilter: "all",
  tourOrderIds: loadTourOrderIds(),
  completedStopIds: loadCompletedStops(),
  tourCardImages: loadTourCardImages(),
  chrome: {
    tabBarIdleHidden: false
  }
};

const app = document.getElementById("app");
const tabs = [...document.querySelectorAll("#tabs button")];
const tabBar = document.getElementById("tabs");
const copyViewButton = document.getElementById("copy-view-button");
const glassesModeButton = document.getElementById("glasses-mode-button");
const topbarActions = document.querySelector(".topbar-actions");
const topbar = document.querySelector(".topbar");

document.addEventListener("click", handleClick);
document.addEventListener("input", handleInput);
document.addEventListener("submit", handleSubmit);
document.addEventListener("dragstart", handleDragStart);
document.addEventListener("dragover", handleDragOver);
document.addEventListener("drop", handleDrop);
document.addEventListener("dragend", handleDragEnd);
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
window.addEventListener("scroll", updateTopbarScrollState, { passive: true });
window.addEventListener("scroll", handleChromeActivity, { passive: true });
window.addEventListener("pointerdown", handleChromeActivity, { passive: true });
window.addEventListener("touchstart", handleChromeActivity, { passive: true });
window.addEventListener("keydown", handleChromeActivity);
window.addEventListener("focusin", handleChromeActivity);
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function isTurnstileChallengePage() {
  const url = new URL(window.location.href);
  return url.pathname === "/turnstile/challenge";
}

function getTurnstileChallengeSiteKey() {
  const url = new URL(window.location.href);
  return String(url.searchParams.get("siteKey") || "").trim() || getCloudflareTurnstileSiteKey();
}

function postTurnstileChallengeMessage(payload) {
  try {
    if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === "function") {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  } catch {}
}

hydrateStateFromLocation();
scrollViewportToTop();
updateTopbarScrollState();
render();
initializeWebXRSupport().catch(() => undefined);
initializeWebAuth();

function scrollViewportToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function scrollHomeMapIntoView() {
  window.requestAnimationFrame(() => {
    const mapElement = document.getElementById("home-map");
    const target = mapElement?.closest(".home-hero-panel") || mapElement;
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function openTourPageForStop(tour, stopId) {
  if (!tour) {
    return;
  }
  const resolvedStopId = tour.stops.some((stop) => stop.id === stopId) ? stopId : tour.stops[0]?.id ?? "";
  state.selectedTourId = tour.id;
  state.selectedStopId = resolvedStopId;
  state.activeTab = "map";
  state.home.focusTourId = null;
  state.routePageTourId = tour.id;
  scrollViewportToTop();
  render();
}

function updateTopbarScrollState() {
  if (!topbar) {
    return;
  }
  topbar.classList.toggle("topbar--scrolled", window.scrollY > 16);
}

function scheduleTabBarAutoHide() {
  window.clearTimeout(tabBarAutoHideTimer);
  if (!tabBar || state.routePageTourId) {
    return;
  }
  tabBarAutoHideTimer = window.setTimeout(() => {
    state.chrome.tabBarIdleHidden = true;
    updateChrome();
  }, 2200);
}

function handleChromeActivity() {
  if (state.routePageTourId) {
    return;
  }
  const wasHidden = state.chrome.tabBarIdleHidden;
  state.chrome.tabBarIdleHidden = false;
  if (wasHidden) {
    updateChrome();
  }
  scheduleTabBarAutoHide();
}

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
    cardMedia: normalizeCardMedia(tour.cardMedia),
    stops
  };
}

function normalizeCardMedia(cardMedia) {
  if (!cardMedia || typeof cardMedia !== "object") {
    return null;
  }

  const type = cardMedia.type === "video" ? "video" : cardMedia.type === "image" ? "image" : "";
  const src = String(cardMedia.src || "").trim();
  if (!type || !src) {
    return null;
  }

  return {
    type,
    src,
    poster: String(cardMedia.poster || "").trim(),
    alt: String(cardMedia.alt || "").trim()
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
    locationLabel: metadata.locationLabel,
    fullAddress: metadata.fullAddress,
    streetView: stop.streetView && typeof stop.streetView === "object" ? stop.streetView : null
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
      locationLabel: "",
      fullAddress: ""
    };
  }

  const parts = description.split("|").map((part) => part.trim());
  const dayLabel = parts.find((part) => /^day:/i.test(part))?.replace(/^day:\s*/i, "").trim() ?? "";
  const timeLabel = parts.find((part) => /^time:/i.test(part))?.replace(/^time:\s*/i, "").trim() ?? "";
  const fullAddress =
    parts
      .find((part) => /^location:/i.test(part))
      ?.replace(/^location:\s*/i, "")
      .trim() ?? "";
  const locationLabel = fullAddress
      .replace(/,\s*philadelphia,\s*pa$/i, "")
      .replace(/,\s*pa$/i, "")
      .trim();

  return {
    dayLabel,
    timeLabel,
    locationLabel,
    fullAddress
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

function canPlayNarration(stopId) {
  if (state.audioAccess.fullUnlocked) {
    return true;
  }
  if (!stopId) {
    return false;
  }
  if (state.audioAccess.previewedStopIds.includes(stopId)) {
    return true;
  }
  return state.audioAccess.previewedStopIds.length < AUDIO_PREVIEW_LIMIT;
}

function getRemainingAudioPreviews() {
  return Math.max(AUDIO_PREVIEW_LIMIT - state.audioAccess.previewedStopIds.length, 0);
}

function getAudioAccessSummary(stopId) {
  if (state.audioAccess.fullUnlocked) {
    return {
      locked: false,
      pill: "Full audio unlocked",
      message: "All stop narration is unlocked on this device.",
      cta: ""
    };
  }

  const alreadyPreviewed = !!stopId && state.audioAccess.previewedStopIds.includes(stopId);
  const remaining = getRemainingAudioPreviews();

  if (alreadyPreviewed) {
    return {
      locked: false,
      pill: "Preview saved",
      message: `This stop is already one of your ${AUDIO_PREVIEW_LIMIT} free narration previews on this device.`,
      cta: `You have ${remaining} new preview${remaining === 1 ? "" : "s"} left before full audio purchase is required.`
    };
  }

  if (remaining > 0) {
    return {
      locked: false,
      pill: `${remaining} free ${remaining === 1 ? "preview" : "previews"} left`,
      message: `You can play this stop now as part of your ${AUDIO_PREVIEW_LIMIT} free narration previews.`,
      cta: "After the free previews are used, full audio unlock is required for new stops."
    };
  }

  return {
    locked: true,
    pill: "Purchase required",
    message: `You have used your ${AUDIO_PREVIEW_LIMIT} free narration previews on this device.`,
    cta: "Upgrade to full audio to unlock narration for every stop and every route."
  };
}

function normalizeGoogleMapsProjectUrl(rawUrl) {
  const trimmed = String(rawUrl || "").trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const mid = parsed.searchParams.get("mid")?.trim();
    const hasGoogleHost = /(^|\.)google\.[a-z.]+$/i.test(parsed.hostname);
    const isViewerPath = /\/maps\/d\/(?:u\/\d+\/)?viewer$/i.test(parsed.pathname);
    const isEditPath = /\/maps\/d\/edit$/i.test(parsed.pathname);
    const isEmbedPath = /\/maps\/d\/embed$/i.test(parsed.pathname);

    if (hasGoogleHost && mid && (isViewerPath || isEditPath || parsed.pathname === "/maps")) {
      const embedUrl = new URL("https://www.google.com/maps/d/embed");
      embedUrl.searchParams.set("mid", mid);
      return {
        embedUrl: embedUrl.toString(),
        publicUrl: trimmed
      };
    }

    if (hasGoogleHost && isEmbedPath) {
      return {
        embedUrl: trimmed,
        publicUrl: trimmed.replace("/maps/d/embed", "/maps/d/viewer")
      };
    }

    return {
      embedUrl: trimmed,
      publicUrl: trimmed
    };
  } catch {
    return null;
  }
}

function getGoogleMapsProjectConfig() {
  return normalizeGoogleMapsProjectUrl(siteConfig.googleMapsProjectUrl || "");
}

function getGoogleMapsJsApiKey() {
  return String(siteConfig.googleMapsJsApiKey || "").trim();
}

function getGoogleMapsMapId() {
  return String(siteConfig.googleMapsMapId || "").trim();
}

async function loadGoogleMapsMarkerLibrary(maps) {
  if (!maps || typeof maps.importLibrary !== "function") {
    return null;
  }

  try {
    return await maps.importLibrary("marker");
  } catch {
    return null;
  }
}

function buildGoogleShellMapStyles() {
  return [
    {
      elementType: "geometry",
      stylers: [{ color: "#f6eadf" }]
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b4d45" }]
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#fff7f1" }]
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#d9c3bc" }]
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ color: "#eadfd6" }]
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#f1dfd3" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#dce7d5" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#fffaf5" }]
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#f8e5da" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#f0d3c6" }]
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#dcc4d7" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#d8e6ee" }]
    }
  ];
}

function loadGoogleMapsApi() {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsApiPromise) {
    return googleMapsApiPromise;
  }

  const apiKey = getGoogleMapsJsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("Map preview is unavailable right now."));
  }

  googleMapsApiPromise = new Promise((resolve, reject) => {
    const callbackName = "__phillyToursGoogleMapsInit";
    const script = document.createElement("script");
    let settled = false;
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      if (window.gm_authFailure === handleAuthFailure) {
        delete window.gm_authFailure;
      }
    };
    const fail = (message) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      googleMapsApiPromise = null;
      reject(new Error(message));
    };
    const succeed = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      googleMapsAuthFailed = false;
      resolve(window.google.maps);
    };
    const timeoutId = window.setTimeout(() => {
      fail("Map preview is taking too long to load.");
    }, 12000);
    const handleAuthFailure = () => {
      googleMapsAuthFailed = true;
      fail("Map preview is unavailable right now.");
    };

    window.gm_authFailure = handleAuthFailure;
    window[callbackName] = () => {
      succeed();
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.referrerPolicy = "origin";
    script.onerror = () => {
      fail("Map preview is unavailable right now.");
    };

    document.head.appendChild(script);
  });

  return googleMapsApiPromise;
}

function buildGoogleLatLngEmbedMarkup(position, title, zoom = 14) {
  const src = new URL("https://www.google.com/maps");
  src.searchParams.set("q", `${position.lat},${position.lng}`);
  src.searchParams.set("z", String(zoom));
  src.searchParams.set("output", "embed");

  return `
    <iframe
      class="google-map-embed"
      src="${escapeHtml(src.toString())}"
      title="${escapeHtml(title || "Google map")}"
      loading="lazy"
      allowfullscreen
      referrerpolicy="origin"
    ></iframe>
  `;
}

function buildGoogleStreetViewUrl(point) {
  const streetViewConfig = getStopStreetViewConfig(point);
  if (!streetViewConfig) {
    return "";
  }

  if (streetViewConfig.address) {
    const src = new URL("https://www.google.com/maps/search/");
    src.searchParams.set("api", "1");
    src.searchParams.set("query", streetViewConfig.address);
    return src.toString();
  }

  const src = new URL("https://www.google.com/maps/@");
  src.searchParams.set("api", "1");
  src.searchParams.set("map_action", "pano");
  src.searchParams.set("viewpoint", `${streetViewConfig.viewpoint.lat},${streetViewConfig.viewpoint.lng}`);
  if (streetViewConfig.panoId) {
    src.searchParams.set("pano", streetViewConfig.panoId);
  }
  if (streetViewConfig.heading != null) {
    src.searchParams.set("heading", String(streetViewConfig.heading));
  }
  if (streetViewConfig.pitch != null) {
    src.searchParams.set("pitch", String(streetViewConfig.pitch));
  }
  return src.toString();
}

function parseStreetViewNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getStopStreetViewConfig(stop) {
  const rawConfig = stop?.streetView && typeof stop.streetView === "object" ? stop.streetView : null;
  const targetPosition = getRenderableLatLng(stop);
  const viewpoint = getRenderableLatLng(rawConfig?.viewpoint) || targetPosition;
  const address = typeof stop?.fullAddress === "string" ? stop.fullAddress.trim() : "";
  if (!viewpoint) {
    if (!address) {
      return null;
    }
  }

  const panoId = typeof rawConfig?.panoId === "string" ? rawConfig.panoId.trim() : "";
  const radiusM = parseStreetViewNumber(rawConfig?.radiusM);
  const heading = parseStreetViewNumber(rawConfig?.heading);
  const pitch = parseStreetViewNumber(rawConfig?.pitch);
  const zoom = parseStreetViewNumber(rawConfig?.zoom);

  return {
    panoId,
    address,
    targetPosition: targetPosition || viewpoint,
    viewpoint,
    radiusM: radiusM != null && radiusM >= 0 ? radiusM : 120,
    heading,
    pitch,
    zoom,
    source: rawConfig?.source === "default" ? "default" : "outdoor"
  };
}

async function resolveStopStreetViewLocation(streetViewConfig, maps) {
  if (!streetViewConfig) {
    return null;
  }

  if (!streetViewConfig.address) {
    return streetViewConfig.viewpoint || streetViewConfig.targetPosition || null;
  }

  if (stopStreetViewAddressCache.has(streetViewConfig.address)) {
    return stopStreetViewAddressCache.get(streetViewConfig.address);
  }

  const geocoder = new maps.Geocoder();

  const location = await new Promise((resolve) => {
    geocoder.geocode({ address: streetViewConfig.address }, (results, status) => {
      if (status !== "OK" || !Array.isArray(results) || results.length === 0) {
        resolve(streetViewConfig.viewpoint || streetViewConfig.targetPosition || null);
        return;
      }

      resolve(normalizeLatLngLiteral(results[0]?.geometry?.location) || streetViewConfig.viewpoint || streetViewConfig.targetPosition || null);
    });
  });

  stopStreetViewAddressCache.set(streetViewConfig.address, location);
  return location;
}

function normalizeLatLngLiteral(point) {
  if (!point) {
    return null;
  }
  if (typeof point.lat === "function" && typeof point.lng === "function") {
    return getRenderableLatLng({ lat: point.lat(), lng: point.lng() });
  }
  return getRenderableLatLng(point);
}

function computeHeadingBetweenPoints(fromPoint, toPoint) {
  const from = normalizeLatLngLiteral(fromPoint);
  const to = normalizeLatLngLiteral(toPoint);
  if (!from || !to) {
    return 0;
  }

  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const lngDelta = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(lngDelta) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lngDelta);
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

function buildStopStreetViewFallbackMarkup(message) {
  return `
    <div class="route-map-fallback route-map-fallback--street-view">
      <div>
        <strong>Street View unavailable</strong>
        <span>${escapeHtml(message)}</span>
      </div>
    </div>
  `;
}

function installGoogleMapHealthFallback({
  mapElement,
  fallbackPosition,
  title,
  zoom = 14,
  maps,
  map,
  mobileOnly = true
}) {
  if (!mapElement || !fallbackPosition) {
    return;
  }

  const shouldAllowFallback = !mobileOnly || window.matchMedia("(max-width: 720px)").matches;
  if (!shouldAllowFallback) {
    return;
  }

  const checkAndFallback = () => {
    if (document.getElementById(mapElement.id) !== mapElement) {
      return true;
    }

    const mapText = String(mapElement.innerText || "");
    const hasGoogleErrorBanner =
      googleMapsAuthFailed ||
      mapText.includes("Oops! Something went wrong.") ||
      mapText.includes("This page didn't load Google Maps correctly.");
    const hasRenderedMap = !!mapElement.querySelector(".gm-style");

    if (hasGoogleErrorBanner || !hasRenderedMap) {
      clearMapViewportStabilizer();
      if (routeMap === map) {
        routeMap = null;
        routeMapLayers = [];
      }
      mapElement.innerHTML = buildGoogleLatLngEmbedMarkup(fallbackPosition, title, zoom);
      return true;
    }

    return false;
  };

  [2200, 6000].forEach((delay) => {
    window.setTimeout(() => {
      checkAndFallback();
    }, delay);
  });
}

function clearMapViewportStabilizer() {
  if (typeof activeMapViewportCleanup === "function") {
    activeMapViewportCleanup();
  }
  activeMapViewportCleanup = null;
}

function installMapViewportStabilizer({ map, maps, mapElement, restoreView }) {
  clearMapViewportStabilizer();

  if (!map || !maps || !mapElement || typeof restoreView !== "function") {
    return;
  }

  let disposed = false;
  let rafId = 0;
  const timeoutIds = new Set();

  const runRefresh = () => {
    if (disposed || routeMap !== map || document.getElementById(mapElement.id) !== mapElement) {
      return;
    }

    if (!mapElement.offsetWidth || !mapElement.offsetHeight) {
      return;
    }

    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }

    rafId = window.requestAnimationFrame(() => {
      if (disposed || routeMap !== map || document.getElementById(mapElement.id) !== mapElement) {
        return;
      }

      maps.event.trigger(map, "resize");
      restoreView();
    });
  };

  const scheduleRefresh = (delay = 0) => {
    if (delay <= 0) {
      runRefresh();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      timeoutIds.delete(timeoutId);
      runRefresh();
    }, delay);
    timeoutIds.add(timeoutId);
  };

  const handleViewportShift = () => scheduleRefresh(90);
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      scheduleRefresh(120);
    }
  };

  window.addEventListener("resize", handleViewportShift, { passive: true });
  window.addEventListener("orientationchange", handleViewportShift, { passive: true });
  window.addEventListener("pageshow", handleViewportShift);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  let resizeObserver = null;
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      scheduleRefresh(60);
    });
    resizeObserver.observe(mapElement);
  }

  const visualViewport = window.visualViewport || null;
  if (visualViewport) {
    visualViewport.addEventListener("resize", handleViewportShift, { passive: true });
    visualViewport.addEventListener("scroll", handleViewportShift, { passive: true });
  }

  [0, 120, 320, 900].forEach((delay) => {
    scheduleRefresh(delay);
  });

  activeMapViewportCleanup = () => {
    disposed = true;

    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }

    timeoutIds.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    timeoutIds.clear();

    window.removeEventListener("resize", handleViewportShift);
    window.removeEventListener("orientationchange", handleViewportShift);
    window.removeEventListener("pageshow", handleViewportShift);
    document.removeEventListener("visibilitychange", handleVisibilityChange);

    if (visualViewport) {
      visualViewport.removeEventListener("resize", handleViewportShift);
      visualViewport.removeEventListener("scroll", handleViewportShift);
    }

    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  };
}

function buildProjectMapEmbedMarkup(label) {
  const googleMapProject = getGoogleMapsProjectConfig();
  if (!googleMapProject?.embedUrl) {
    return `
      <div class="route-map-fallback">
        <div>
          <strong>Google map unavailable</strong>
          <span>Map preview is unavailable right now. You can still explore the tour cards and open directions from each stop.</span>
        </div>
      </div>
    `;
  }

  return `
    <iframe
      class="google-map-embed"
      src="${escapeHtml(googleMapProject.embedUrl)}"
      loading="lazy"
      height="420"
      referrerpolicy="no-referrer-when-downgrade"
      allowfullscreen
      aria-label="${escapeHtml(label || "Google map")}"
    ></iframe>
  `;
}

function buildStaticMapMarker(point, options = {}) {
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return "";
  }

  const parts = [];
  if (options.size) {
    parts.push(`size:${options.size}`);
  }
  if (options.color) {
    parts.push(`color:${options.color}`);
  }
  if (options.label) {
    parts.push(`label:${String(options.label).slice(0, 1).toUpperCase()}`);
  }
  parts.push(`${lat},${lng}`);
  return parts.join("|");
}

function getRenderableLatLng(point) {
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  if (lat === 0 && lng === 0) {
    return null;
  }
  return { lat, lng };
}

function hasRenderableCoordinates(point) {
  return Boolean(getRenderableLatLng(point));
}

function getRenderableStops(stops) {
  return Array.isArray(stops)
    ? stops
        .map((stop, index) => {
          const position = getRenderableLatLng(stop);
          if (!position) {
            return null;
          }
          return {
            ...stop,
            ...position,
            originalIndex: index
          };
        })
        .filter(Boolean)
    : [];
}

function getPrimaryRenderableStop(tour) {
  return getRenderableStops(tour?.stops || [])[0] ?? null;
}

function projectLatLngsToPreview(points) {
  const validPoints = points
    .map((point) => {
      const position = getRenderableLatLng(point);
      return position ? { ...point, ...position } : null;
    })
    .filter(Boolean);
  if (!validPoints.length) {
    return [];
  }

  const lats = validPoints.map((point) => Number(point.lat));
  const lngs = validPoints.map((point) => Number(point.lng));
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = Math.max(maxLat - minLat, 0.0015);
  const lngRange = Math.max(maxLng - minLng, 0.0015);

  return validPoints.map((point) => ({
    ...point,
    x: 34 + ((Number(point.lng) - minLng) / lngRange) * 732,
    y: 34 + (1 - (Number(point.lat) - minLat) / latRange) * 352
  }));
}

function buildHomeInlineMapFallback(selectedTour) {
  const focusedTour = state.home.focusTourId ? getTourById(state.home.focusTourId) : null;

  if (!focusedTour) {
    const leadStops = tours
      .map((tour, index) => {
        const leadStop = getPrimaryRenderableStop(tour);
        if (!leadStop) {
          return null;
        }
        return {
          ...leadStop,
          accent: getTourAccent(index)[0] || "#5c45ff",
          label: String(index + 1)
        };
      })
      .filter(Boolean);
    const projectedStops = projectLatLngsToPreview(leadStops);

    return `
      <div class="home-inline-map home-inline-map--overview" aria-label="Tour collection overview">
        <svg viewBox="0 0 800 420" role="img" aria-hidden="true">
          <rect x="0" y="0" width="800" height="420" rx="28" fill="rgba(15,22,38,0.9)"></rect>
          <path d="M48 332 C172 288, 258 312, 392 238 S636 136, 752 168" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" stroke-dasharray="8 12"></path>
          <path d="M78 92 C188 132, 270 86, 384 116 S592 212, 724 188" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="2" stroke-dasharray="10 14"></path>
          ${projectedStops
            .map(
              (stop) => `
                <g transform="translate(${stop.x}, ${stop.y})">
                  <circle r="18" fill="${stop.accent}" opacity="0.22"></circle>
                  <circle r="11" fill="${stop.accent}" stroke="#fffaf5" stroke-width="2"></circle>
                  <text y="4" text-anchor="middle" font-size="10" font-weight="700" fill="#fffaf5">${stop.label}</text>
                </g>
              `
            )
            .join("")}
        </svg>
        <div class="home-inline-map__caption">
          <strong>Collection overview</strong>
          <span>Select a tour card below to isolate its route.</span>
        </div>
      </div>
    `;
  }

  const routePreview = getRoutePreviewRecord(focusedTour.id, state.narrationVariant);
  const renderableStops = getRenderableStops(focusedTour.stops);
  const previewLatLngs = getRoutePreviewPath(routePreview?.route);
  const routePoints =
    previewLatLngs.length >= 2 ? previewLatLngs : renderableStops.map((stop) => ({ lat: stop.lat, lng: stop.lng }));
  const projectedRoute = projectLatLngsToPreview(routePoints);
  const projectedStops = projectLatLngsToPreview(
    renderableStops.map((stop) => ({
      ...stop,
      label: String(stop.originalIndex + 1),
      active: stop.id === state.selectedStopId
    }))
  );

  return `
    <div class="home-inline-map home-inline-map--focused" aria-label="${escapeHtml(focusedTour.title)} overview">
      <svg viewBox="0 0 800 420" role="img" aria-hidden="true">
        <rect x="0" y="0" width="800" height="420" rx="28" fill="rgba(15,22,38,0.92)"></rect>
        <path d="${buildRoutePath(projectedRoute)}" fill="none" stroke="rgba(255,250,245,0.2)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="${buildRoutePath(projectedRoute)}" fill="none" stroke="#a64f38" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.96"></path>
        ${projectedStops
          .map(
            (stop) => `
              <g transform="translate(${stop.x}, ${stop.y})">
                <circle r="${stop.active ? 18 : 14}" fill="${stop.active ? "#f1d1b2" : "#172026"}" stroke="${stop.active ? "#b45b3d" : "#fffaf5"}" stroke-width="${stop.active ? 4 : 2}"></circle>
                <text y="4" text-anchor="middle" font-size="10" font-weight="700" fill="${stop.active ? "#6b3b2f" : "#fffaf5"}">${stop.label}</text>
              </g>
            `
          )
          .join("")}
      </svg>
      <div class="home-inline-map__caption">
        <strong>${escapeHtml(focusedTour.title)}</strong>
        <span>Fallback overview showing only this tour’s stop pattern.</span>
      </div>
    </div>
  `;
}

function buildHomeMapFallbackMarkup(selectedTour) {
  return buildHomeInlineMapFallback(selectedTour);
}

function getInPersonTourGuideConfig() {
  const amountCents = Number(siteConfig.inPersonTourGuidePriceCents || 0);
  return {
    amountCents: Number.isFinite(amountCents) && amountCents > 0 ? Math.round(amountCents) : 0,
    label: String(siteConfig.inPersonTourGuideLabel || "In-person tour guide").trim() || "In-person tour guide"
  };
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

function getGlassesModeLabel() {
  return state.glassesMode ? "Bluetooth audio mode on" : "Bluetooth audio mode off";
}

function getGlassesModeButtonLabel() {
  return state.glassesMode ? "Disable Bluetooth audio mode" : "Enable Bluetooth audio mode";
}

function getGlassesModeCopy() {
  if (state.glassesMode) {
    return "Browser narration will follow this device's current audio output. Use this when you want tour audio to play through your connected Bluetooth headphones or glasses while keeping route and AR controls on the phone.";
  }

  return "Turn this on when your Bluetooth headphones or glasses are already paired to this phone or computer and you want the tour audio routed there.";
}

function formatCoordinateDegrees(value, positiveSuffix, negativeSuffix) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  const suffix = value >= 0 ? positiveSuffix : negativeSuffix;
  return `${Math.abs(value).toFixed(5)}° ${suffix}`;
}

function getArCoordinateLabel() {
  return state.ar.userLocation
    ? `${formatCoordinateDegrees(Number(state.ar.userLocation.lat), "N", "S")} | ${formatCoordinateDegrees(Number(state.ar.userLocation.lng), "E", "W")}`
    : "Lat -- | Lng --";
}

function syncArLiveReadout() {
  const readout = document.querySelector("[data-role='ar-coordinate-readout']");
  if (readout) {
    readout.textContent = getArCoordinateLabel();
  }
}

function getTourCardArtwork(tour) {
  if (tour?.cardMedia?.src) {
    return {
      status: "ready",
      url: tour.cardMedia.src,
      title: tour.cardMedia.alt || tour.title,
      source: tour.cardMedia.type,
      mediaType: tour.cardMedia.type,
      poster: tour.cardMedia.poster || ""
    };
  }

  return {
    status: "disabled",
    url: "",
    title: tour.title,
    source: "",
    mediaType: "",
    poster: ""
  };
}

function renderTourCardArtwork(tour) {
  const artwork = getTourCardArtwork(tour);
  const featuredStop = getRecommendedNextStop(tour);

  if (artwork.status === "ready" && artwork.url) {
    if (artwork.mediaType === "video") {
      return `
        <div class="experience-card-artwork" data-tour-image-id="${tour.id}">
          <video
            src="${escapeHtml(artwork.url)}"
            ${artwork.poster ? `poster="${escapeHtml(artwork.poster)}"` : ""}
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            aria-label="${escapeHtml(artwork.title)}"
          ></video>
          <div class="experience-card-gradient"></div>
        </div>
      `;
    }

    return `
      <div class="experience-card-artwork" data-tour-image-id="${tour.id}">
        <img src="${escapeHtml(artwork.url)}" alt="${escapeHtml(artwork.title)}" loading="lazy" />
        <div class="experience-card-gradient"></div>
      </div>
    `;
  }

  return `
    <div class="experience-card-artwork experience-card-artwork--placeholder" data-tour-image-id="${tour.id}">
      <div class="experience-card-gradient"></div>
    </div>
  `;
}

function buildPhoneAppHandoffLink(tourId, stopId) {
  return `phillyartours://tour/${encodeURIComponent(tourId)}/stop/${encodeURIComponent(stopId)}/map`;
}

function normalizeRoutePreviewVariant(variant = state.narrationVariant) {
  return variant === "drive" ? "drive" : "walk";
}

function getRoutePreviewCacheKey(tourId, variant = state.narrationVariant) {
  return `${tourId}::${normalizeRoutePreviewVariant(variant)}`;
}

function getRouteTravelModeForVariant(variant = state.narrationVariant) {
  return normalizeRoutePreviewVariant(variant) === "drive" ? "DRIVE" : "WALK";
}

function getRouteRoutingPreferenceForVariant(variant = state.narrationVariant) {
  return normalizeRoutePreviewVariant(variant) === "drive" ? "TRAFFIC_AWARE_OPTIMAL" : null;
}

function getRouteModeLabel(variant = state.narrationVariant) {
  return normalizeRoutePreviewVariant(variant) === "drive" ? "drive" : "walking";
}

function getRoutePreviewRecord(tourId, variant = state.narrationVariant) {
  return state.maps.routePreviewsByTourId[getRoutePreviewCacheKey(tourId, variant)] || {
    status: "idle",
    route: null,
    message: ""
  };
}

function parseDurationSeconds(value) {
  const match = String(value || "").trim().match(/^([0-9]+(?:\.[0-9]+)?)s$/i);
  if (!match) {
    return null;
  }
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) ? seconds : null;
}

function formatDurationMinutesFromSeconds(seconds, fallbackMinutes) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return `${fallbackMinutes} min`;
  }
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

function formatMilesFromMeters(meters, fallbackMiles) {
  if (!Number.isFinite(meters) || meters <= 0) {
    return `${Number(fallbackMiles || 0).toFixed(1)} mi`;
  }
  return `${(meters / 1609.344).toFixed(1)} mi`;
}

function createRoutePreviewRequest(tour, variant = state.narrationVariant) {
  const renderableStops = getRenderableStops(tour?.stops || []);
  const routingPreference = getRouteRoutingPreferenceForVariant(variant);
  return {
    stops: renderableStops.map((stop) => ({
      title: stop.title,
      lat: stop.lat,
      lng: stop.lng
    })),
    travelMode: getRouteTravelModeForVariant(variant),
    ...(routingPreference ? { routingPreference } : {})
  };
}

async function ensureRoutePreviewLoaded(tour, variant = state.narrationVariant) {
  if (!tour || !tour.id) {
    return;
  }

  const requestBody = createRoutePreviewRequest(tour, variant);
  const cacheKey = getRoutePreviewCacheKey(tour.id, variant);
  if (requestBody.stops.length < 2) {
    state.maps.routePreviewsByTourId[cacheKey] = {
      status: "unavailable",
      route: null,
      message: "This tour needs at least two mapped stops before a route can render."
    };
    return;
  }

  const existing = getRoutePreviewRecord(tour.id, variant);
  if (
    existing.status === "loading" ||
    existing.status === "ready" ||
    existing.status === "unavailable" ||
    existing.status === "error"
  ) {
    return;
  }

  const syncServerUrl = getSyncServerUrl();
  if (!syncServerUrl) {
    state.maps.routePreviewsByTourId[cacheKey] = {
      status: "unavailable",
      route: null,
      message: "Add the sync server URL to enable live route previews."
    };
    return;
  }

  state.maps.routePreviewsByTourId[cacheKey] = {
    status: "loading",
    route: null,
    message: ""
  };

  render(false);

  try {
    const response = await fetch(`${syncServerUrl}/api/maps/route-preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(state.auth.authToken ? { Authorization: `Bearer ${state.auth.authToken}` } : {})
      },
      body: JSON.stringify(requestBody)
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Unable to load route preview.");
    }

    state.maps.routePreviewsByTourId[cacheKey] = {
      status: "ready",
      route: payload.primaryRoute || null,
      message: ""
    };
  } catch (error) {
    state.maps.routePreviewsByTourId[cacheKey] = {
      status: "error",
      route: null,
      message: (error && error.message) || "Unable to load route preview."
    };
  }

  render(false);
}

function getRoutePreviewPath(route) {
  const polylineSegments =
    Array.isArray(route?.polylineSegments) && route.polylineSegments.length
      ? route.polylineSegments
      : route?.polyline
        ? [route.polyline]
        : [];

  return polylineSegments
    .flatMap((encodedPolyline, segmentIndex) =>
      decodeEncodedPolyline(encodedPolyline).filter((_, pointIndex) => segmentIndex === 0 || pointIndex > 0)
    )
    .map(([lat, lng]) => ({ lat, lng }))
    .filter(hasRenderableCoordinates);
}

function getRoutePreviewDisplay(tour, variant = state.narrationVariant) {
  const preview = getRoutePreviewRecord(tour.id, variant);
  const route = preview.route;
  const liveDurationSeconds = parseDurationSeconds(route?.duration);
  const liveStaticDurationSeconds = parseDurationSeconds(route?.staticDuration);
  const modeLabel = getRouteModeLabel(variant);

  return {
    status: preview.status,
    statusLabel:
      preview.status === "ready"
        ? `Live ${modeLabel} route`
        : preview.status === "loading"
          ? `Loading ${modeLabel} route`
          : preview.status === "error"
            ? "Using saved route estimate"
            : "Tour plan",
    durationLabel: formatDurationMinutesFromSeconds(liveDurationSeconds ?? liveStaticDurationSeconds, tour.durationMin),
    distanceLabel: formatMilesFromMeters(route?.distanceMeters, tour.distanceMiles),
    legsLabel:
      route?.legs && route.legs.length
        ? `${route.legs.length} live leg${route.legs.length === 1 ? "" : "s"}`
        : `${tour.stops.length} story stops`,
    message:
      preview.status === "ready"
        ? `Google ${modeLabel} route preview is live for this stop order.`
        : preview.status === "loading"
          ? `Checking live ${modeLabel} distance and timing for this route.`
          : preview.status === "error"
            ? `Live ${modeLabel} routing is temporarily unavailable, so this page is showing the saved tour estimate.`
            : preview.message || "Static route estimate from the tour catalog."
  };
}

function decodeEncodedPolyline(encoded) {
  const source = String(encoded || "").trim();
  if (!source) {
    return [];
  }

  const coordinates = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < source.length) {
    let result = 0;
    let shift = 0;
    let byte = null;

    do {
      byte = source.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < source.length + 1);

    const latDelta = result & 1 ? ~(result >> 1) : result >> 1;
    lat += latDelta;

    result = 0;
    shift = 0;

    do {
      byte = source.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < source.length + 1);

    const lngDelta = result & 1 ? ~(result >> 1) : result >> 1;
    lng += lngDelta;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

function updateChrome() {
  if (isTurnstileChallengePage()) {
    if (glassesModeButton) {
      glassesModeButton.hidden = true;
    }
    if (copyViewButton) {
      copyViewButton.hidden = true;
    }
    if (tabBar) {
      tabBar.hidden = true;
      tabBar.classList.remove("is-idle-hidden");
    }
    if (topbar) {
      topbar.hidden = true;
    }
    window.clearTimeout(tabBarAutoHideTimer);
    return;
  }

  const showingHiddenRoutePage = !!state.routePageTourId;
  if (glassesModeButton) {
    glassesModeButton.textContent = getGlassesModeLabel();
    glassesModeButton.classList.toggle("active", state.glassesMode);
    glassesModeButton.hidden = showingHiddenRoutePage;
  }

  if (copyViewButton) {
    copyViewButton.hidden = showingHiddenRoutePage;
  }

  if (tabBar) {
    tabBar.hidden = showingHiddenRoutePage;
    tabBar.classList.toggle("is-idle-hidden", !showingHiddenRoutePage && state.chrome.tabBarIdleHidden);
  }

  if (topbarActions) {
    topbarActions.classList.remove("auth-compact");
  }

  if (!showingHiddenRoutePage) {
    scheduleTabBarAutoHide();
  } else {
    window.clearTimeout(tabBarAutoHideTimer);
  }
}

function renderTurnstileChallengePage() {
  return `
    <section
      class="turnstile-challenge-page"
      style="min-height:86px;display:flex;align-items:center;justify-content:center;padding:8px;background:transparent;"
    >
      <div style="width:100%;display:flex;align-items:center;justify-content:center;">
        <div id="webapp-turnstile" class="turnstile-mount" style="min-height:74px;"></div>
      </div>
      <p
        id="turnstile-challenge-status"
        style="display:none;margin:8px 0 0;color:#fda4af;font:500 12px/1.4 'Plus Jakarta Sans', sans-serif;text-align:center;"
      ></p>
    </section>
  `;
}

function resetCopyButtonLabel() {
  if (copyViewButton) {
    copyViewButton.textContent = "Copy current view";
  }
}

function schedulePostSignInRefresh() {
  window.clearTimeout(authRefreshTimer);
  authRefreshTimer = window.setTimeout(() => {
    if (state.activeTab !== "profile") {
      state.activeTab = "profile";
    }
    syncLocationHash();
    render(false);
  }, 3000);
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

function loadTourCardImages() {
  try {
    window.localStorage.removeItem("philly-ar-tours-web-tour-card-images-v2");
    return {};
  } catch {
    return {};
  }
}

function saveTourCardImages() {
  return;
}

function loadTourOrderIds() {
  try {
    const raw = window.localStorage.getItem(TOUR_ORDER_STORAGE_KEY);
    if (!raw) {
      return tours.map((tour) => tour.id);
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return tours.map((tour) => tour.id);
    }
    const validIds = new Set(tours.map((tour) => tour.id));
    const ordered = parsed.filter((id) => typeof id === "string" && validIds.has(id));
    const missing = tours.map((tour) => tour.id).filter((id) => !ordered.includes(id));
    return [...ordered, ...missing];
  } catch {
    return tours.map((tour) => tour.id);
  }
}

function loadAudioUnlocked() {
  try {
    return window.localStorage.getItem("philly-ar-tours-web-audio-unlocked-v1") === "1";
  } catch {
    return false;
  }
}

function saveAudioUnlocked() {
  try {
    window.localStorage.setItem("philly-ar-tours-web-audio-unlocked-v1", state.audioAccess.fullUnlocked ? "1" : "0");
  } catch {
    // Ignore storage failures for local audio unlock state.
  }
}

function loadAudioPreviewedStopIds() {
  try {
    const raw = window.localStorage.getItem("philly-ar-tours-web-audio-preview-stops-v1");
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function saveAudioPreviewedStopIds() {
  try {
    window.localStorage.setItem(
      "philly-ar-tours-web-audio-preview-stops-v1",
      JSON.stringify(state.audioAccess.previewedStopIds || [])
    );
  } catch {
    // Ignore storage failures for local audio preview tracking.
  }
}

function loadPendingCheckoutPlanId() {
  try {
    return window.localStorage.getItem("philly-ar-tours-web-pending-checkout-plan-v1") || "";
  } catch {
    return "";
  }
}

function savePendingCheckoutPlanId(planId) {
  try {
    if (planId) {
      window.localStorage.setItem("philly-ar-tours-web-pending-checkout-plan-v1", planId);
    } else {
      window.localStorage.removeItem("philly-ar-tours-web-pending-checkout-plan-v1");
    }
  } catch {
    // Ignore storage failures for local checkout tracking.
  }
}

function saveTourOrderIds() {
  try {
    window.localStorage.setItem(TOUR_ORDER_STORAGE_KEY, JSON.stringify(state.tourOrderIds || []));
  } catch {
    // Ignore storage failures for local route order.
  }
}

function loadWebAuthSession() {
  const readRecord = (storage) => {
    try {
      const raw = storage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed?.session) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  };

  return readRecord(window.localStorage) || readRecord(window.sessionStorage) || null;
}

function saveWebAuthSession(record) {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage failures for the web-only auth shell.
  }
  try {
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage failures for the web-only auth shell.
  }
}

function clearWebAuthSession() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage failures for the web-only auth shell.
  }
  try {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage failures for the web-only auth shell.
  }
}

function buildGuestWebSession() {
  return {
    userId: "web-guest-preview",
    displayName: "Guest preview",
    email: "guest@preview.local",
    roles: ["guest"],
    mode: "preview",
    isGuest: true
  };
}

function getSyncServerUrl() {
  return String(siteConfig.syncServerUrl || "").trim().replace(/\/+$/, "");
}

function getCloudflareTurnstileSiteKey() {
  return String(siteConfig.cloudflareTurnstileSiteKey || "").trim();
}

function getSupabaseAuthConfig() {
  const supabaseUrl = String(siteConfig.supabaseUrl || "").trim().replace(/\/+$/, "");
  const supabaseAnonKey = String(siteConfig.supabaseAnonKey || "").trim();
  return {
    supabaseUrl,
    supabaseAnonKey
  };
}

async function getSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseAuthConfig();
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabaseClientPromise) {
    supabaseClientPromise = import("https://esm.sh/@supabase/supabase-js@2.49.8").then(({ createClient }) =>
      createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: "implicit",
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: false
        }
      })
    );
  }

  return supabaseClientPromise;
}

function getPendingOAuthProvider() {
  try {
    return window.localStorage.getItem(OAUTH_PROVIDER_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function setPendingOAuthProvider(provider) {
  try {
    window.localStorage.setItem(OAUTH_PROVIDER_STORAGE_KEY, provider);
  } catch {
    // Ignore storage failures for the browser OAuth handoff.
  }
}

function clearPendingOAuthProvider() {
  try {
    window.localStorage.removeItem(OAUTH_PROVIDER_STORAGE_KEY);
  } catch {
    // Ignore storage failures for the browser OAuth handoff.
  }
}

function hasOAuthRedirectParams() {
  const url = new URL(window.location.href);
  return (
    url.searchParams.has("code") ||
    url.searchParams.has("error") ||
    url.searchParams.has("error_description") ||
    /access_token=|refresh_token=|provider_token=/.test(url.hash)
  );
}

function clearOAuthRedirectParams() {
  const url = new URL(window.location.href);
  [
    "code",
    "error",
    "error_code",
    "error_description",
    "state",
    "provider_token",
    "provider_refresh_token"
  ].forEach((key) => url.searchParams.delete(key));
  url.hash = "";
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

async function finalizeOAuthSignIn(accessToken, provider) {
  const syncServerUrl = getSyncServerUrl();
  if (!syncServerUrl) {
    throw new Error("Sign-in is unavailable right now.");
  }

  const response = await fetch(`${syncServerUrl}/api/auth/oauth-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      accessToken,
      provider
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.token || !payload.session) {
    throw new Error(payload.error || "Unable to complete sign-in.");
  }

  state.auth.session = payload.session;
  state.auth.authToken = payload.token;
  state.auth.displayName = payload.session.displayName || "";
  state.auth.email = payload.session.email || "";
  state.auth.password = "";
  state.auth.status = "success";
  state.auth.message = "Sign-in complete.";
  saveWebAuthSession({
    authToken: payload.token,
    session: payload.session
  });
  setActiveTab("profile");
  schedulePostSignInRefresh();
}

async function completeOAuthRedirectIfPresent() {
  const pendingProvider = getPendingOAuthProvider();
  if (!pendingProvider && !hasOAuthRedirectParams()) {
    return false;
  }

  const client = await getSupabaseBrowserClient();
  if (!client) {
    clearPendingOAuthProvider();
    clearOAuthRedirectParams();
    state.auth.status = "error";
    state.auth.message = "Sign-in is unavailable right now.";
    return false;
  }

  state.auth.status = "submitting";
  state.auth.message = "Completing sign-in...";
  render(false);

  try {
    const url = new URL(window.location.href);
    const authCode = url.searchParams.get("code");

    let accessToken = "";
    const { data: existingSessionData, error: existingSessionError } = await client.auth.getSession();
    if (existingSessionError) {
      throw existingSessionError;
    }
    accessToken = existingSessionData?.session?.access_token || "";

    if (!accessToken && authCode) {
      const { data, error } = await client.auth.exchangeCodeForSession(authCode);
      if (error) {
        throw error;
      }
      accessToken = data?.session?.access_token || "";
    }

    if (!accessToken) {
      throw new Error("Sign-in could not finish.");
    }

    await finalizeOAuthSignIn(accessToken, pendingProvider || undefined);
    clearPendingOAuthProvider();
    clearOAuthRedirectParams();
    return true;
  } catch (error) {
    clearPendingOAuthProvider();
    clearOAuthRedirectParams();
    clearWebAuthSession();
    state.auth.session = null;
    state.auth.authToken = "";
    state.auth.status = "error";
    state.auth.message = withAuthRetryGuidance((error && error.message) || "Unable to complete sign-in.", pendingProvider || "");
    return false;
  }
}

async function initializeWebAuth() {
  const syncServerUrl = getSyncServerUrl();

  if (await completeOAuthRedirectIfPresent()) {
    state.auth.booting = false;
    render(false);
    return;
  }

  const stored = loadWebAuthSession();

  if (!stored) {
    state.auth.booting = false;
    render(false);
    return;
  }

  state.auth.displayName = stored.session.displayName || "";
  state.auth.email = stored.session.email || "";
  state.auth.authToken = stored.authToken || "";
  state.auth.session = stored.session;

  if (!stored.authToken) {
    state.auth.booting = false;
    render(false);
    return;
  }

  if (!syncServerUrl) {
    state.auth.booting = false;
    render(false);
    return;
  }

  state.auth.booting = false;
  render(false);

  try {
    const response = await fetch(`${syncServerUrl}/api/auth/session`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${stored.authToken}`
      }
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.session) {
      throw new Error(payload.error || "Unable to validate web session.");
    }

    state.auth.session = payload.session;
    state.auth.authToken = stored.authToken;
    state.auth.displayName = payload.session.displayName || "";
    state.auth.email = payload.session.email || "";
    saveWebAuthSession({
      authToken: stored.authToken,
      session: payload.session
    });
    render(false);
  } catch {
    state.auth.message = "Saved web session loaded. If Google actions fail, sign out and try once more.";
    render(false);
  }
}

function resetAuthState() {
  window.clearTimeout(authRefreshTimer);
  state.auth = {
    ...state.auth,
    booting: false,
    session: null,
    authToken: "",
    displayName: "",
    email: "",
    password: "",
    status: "idle",
    message: "",
    turnstileToken: null
  };
}

async function startOAuthSignIn(provider) {
  const client = await getSupabaseBrowserClient();
  if (!client) {
    state.auth.status = "error";
    state.auth.message = withAuthRetryGuidance("Sign-in is unavailable right now.");
    render(false);
    return;
  }

  if (getCloudflareTurnstileSiteKey() && !state.auth.turnstileToken) {
    state.auth.status = "idle";
    state.auth.message = "";
    mountWebTurnstile();
    render(false);
    return;
  }

  try {
    state.auth.status = "submitting";
    state.auth.message = `Redirecting to ${provider === "apple" ? "Apple" : "Google"}...`;
    render(false);
    setPendingOAuthProvider(provider);
    const redirectTo = `${window.location.origin}/auth/provider`;
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo
      }
    });

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.location.assign(data.url);
      return;
    }
  } catch (error) {
    clearPendingOAuthProvider();
    state.auth.status = "error";
    state.auth.message = withAuthRetryGuidance((error && error.message) || "Unable to start sign-in.", provider);
    render(false);
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

function isQuestBrowser() {
  const userAgent = navigator.userAgent || "";
  return /OculusBrowser|Quest/i.test(userAgent);
}

function isSocialInAppBrowser() {
  const userAgent = navigator.userAgent || "";
  return /FBAN|FBAV|FB_IAB|Instagram|Line\/|TikTok|Twitter/i.test(userAgent);
}

async function initializeWebXRSupport() {
  if (state.xr.checked) {
    return state.xr;
  }

  state.xr.checked = true;

  if (!window.isSecureContext) {
    state.xr = {
      ...state.xr,
      supported: false,
      sessionType: "",
      deviceLabel: "Headset view is unavailable here.",
      error: ""
    };
    render(false);
    return state.xr;
  }

  if (!isQuestBrowser()) {
    state.xr = {
      ...state.xr,
      supported: false,
      sessionType: "",
      deviceLabel: "Headset view is unavailable here.",
      error: ""
    };
    render(false);
    return state.xr;
  }

  if (!("xr" in navigator) || !navigator.xr) {
    state.xr = {
      ...state.xr,
      supported: false,
      sessionType: "",
      deviceLabel: "Headset view is unavailable here.",
      error: ""
    };
    render(false);
    return state.xr;
  }

  try {
    const supportsImmersiveAr = await navigator.xr.isSessionSupported("immersive-ar");
    const supportsImmersiveVr = !supportsImmersiveAr && (await navigator.xr.isSessionSupported("immersive-vr"));
    state.xr = {
      ...state.xr,
      supported: supportsImmersiveAr || supportsImmersiveVr,
      sessionType: supportsImmersiveAr ? "immersive-ar" : supportsImmersiveVr ? "immersive-vr" : "",
      deviceLabel: supportsImmersiveAr
        ? "Headset camera view is ready."
        : supportsImmersiveVr
          ? "Headset view is ready."
          : "Headset view is unavailable right now.",
      error: ""
    };
  } catch (error) {
    state.xr = {
      ...state.xr,
      supported: false,
      sessionType: "",
      deviceLabel: "Headset view is unavailable right now.",
      error: error instanceof Error ? "Headset view is unavailable right now." : "Could not check headset view."
    };
  }

  render(false);
  return state.xr;
}

function getWebXROverlayRoot() {
  let overlayRoot = document.getElementById("webxr-overlay-root");
  if (overlayRoot) {
    return overlayRoot;
  }

  overlayRoot = document.createElement("div");
  overlayRoot.id = "webxr-overlay-root";
  overlayRoot.className = "webxr-overlay-root";
  overlayRoot.hidden = true;
  document.body.appendChild(overlayRoot);
  overlayRoot.addEventListener("click", (event) => {
    const rawTarget = event.target;
    if (!(rawTarget instanceof Element)) {
      return;
    }
    const action = rawTarget.closest("[data-webxr-action]")?.getAttribute("data-webxr-action");
    if (action === "stop-webxr") {
      stopWebXRMode().catch(() => undefined);
    }
  });
  return overlayRoot;
}

function syncWebXROverlay() {
  const overlayRoot = getWebXROverlayRoot();
  if (state.xr.mode !== "live") {
    overlayRoot.hidden = true;
    overlayRoot.innerHTML = "";
    return;
  }

  const selectedTour = getSelectedTour();
  const selectedStop = getSelectedStop();
  overlayRoot.hidden = false;
  overlayRoot.innerHTML = `
    <div class="webxr-overlay-panel">
      <p class="eyebrow">Headset view</p>
      <h3>${escapeHtml(selectedStop.title)}</h3>
      <p>${escapeHtml(selectedStop.fullAddress || selectedStop.locationLabel || selectedTour.title)}</p>
      <div class="webxr-overlay-meta">
        <span>${escapeHtml(selectedTour.title)}</span>
        <span>${escapeHtml(state.xr.sessionType === "immersive-ar" ? "Passthrough mode" : "Immersive mode")}</span>
      </div>
      <button type="button" class="ghost-button" data-webxr-action="stop-webxr">Exit headset view</button>
    </div>
  `;
}

function onWebXRFrame(_time, frame) {
  if (!xrSession || !xrGl) {
    return;
  }

  xrSession.requestAnimationFrame(onWebXRFrame);
  const pose = xrReferenceSpace ? frame.getViewerPose(xrReferenceSpace) : null;
  const baseLayer = xrSession.renderState.baseLayer;
  if (!baseLayer || !pose) {
    return;
  }

  xrGl.bindFramebuffer(xrGl.FRAMEBUFFER, baseLayer.framebuffer);
  xrGl.clearColor(0.03, 0.04, 0.08, 0.0);
  xrGl.clear(xrGl.COLOR_BUFFER_BIT | xrGl.DEPTH_BUFFER_BIT);
}

async function startWebXRMode() {
  await initializeWebXRSupport();

  if (!state.xr.supported || !state.xr.sessionType || !navigator.xr) {
    state.xr.error = state.xr.error || "Headset view is unavailable here.";
    render(false);
    return;
  }

  if (xrSession) {
    return;
  }

  stopArLive();
  const overlayRoot = getWebXROverlayRoot();
  state.xr = {
    ...state.xr,
    mode: "starting",
    error: ""
  };
  render(false);

  try {
    xrSession = await navigator.xr.requestSession(state.xr.sessionType, {
      optionalFeatures: ["local-floor", "dom-overlay", "hit-test"],
      domOverlay: { root: overlayRoot }
    });
    xrCanvas = document.createElement("canvas");
    xrGl = xrCanvas.getContext("webgl", { xrCompatible: true, alpha: true, antialias: true });
    if (!xrGl) {
      throw new Error("Headset view is unavailable here.");
    }
    if (typeof xrGl.makeXRCompatible === "function") {
      await xrGl.makeXRCompatible();
    }
    xrSession.updateRenderState({
      baseLayer: new XRWebGLLayer(xrSession, xrGl)
    });

    try {
      xrReferenceSpace = await xrSession.requestReferenceSpace("local-floor");
    } catch {
      xrReferenceSpace = await xrSession.requestReferenceSpace("local");
    }

    xrSession.addEventListener("end", () => {
      xrSession = null;
      xrCanvas = null;
      xrGl = null;
      xrReferenceSpace = null;
      state.xr = {
        ...state.xr,
        mode: "idle",
        error: ""
      };
      syncWebXROverlay();
      render(false);
    });

    state.xr = {
      ...state.xr,
      mode: "live",
      error: ""
    };
    syncWebXROverlay();
    xrSession.requestAnimationFrame(onWebXRFrame);
    render(false);
  } catch (error) {
    xrSession = null;
    xrCanvas = null;
    xrGl = null;
    xrReferenceSpace = null;
    state.xr = {
      ...state.xr,
      mode: "idle",
      error: error instanceof Error ? error.message : "Could not start headset view."
    };
    syncWebXROverlay();
    render(false);
  }
}

async function stopWebXRMode() {
  if (!xrSession) {
    state.xr = {
      ...state.xr,
      mode: "idle",
      error: ""
    };
    syncWebXROverlay();
    render(false);
    return;
  }
  const activeSession = xrSession;
  xrSession = null;
  await activeSession.end().catch(() => undefined);
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
  if (xrSession) {
    void stopWebXRMode();
  }
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

function stopHomeMapLive() {
  if (mapLocationWatchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(mapLocationWatchId);
    mapLocationWatchId = null;
  }
  state.map.tracking = false;
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

function normalizeDegrees(degrees) {
  return ((degrees % 360) + 360) % 360;
}

function getCardinalDirection(degrees) {
  if (typeof degrees !== "number") {
    return "Waiting";
  }
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(normalizeDegrees(degrees) / 45) % directions.length];
}

function getBearingToPoint(from, to) {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

function getTurnLabel(delta) {
  if (typeof delta !== "number") {
    return "Start Compass, then hold the device level to wake the heading.";
  }
  const normalized = ((delta + 540) % 360) - 180;
  const magnitude = Math.abs(normalized);
  if (magnitude < 12) {
    return "You are facing the next compass point.";
  }
  return `Turn ${normalized > 0 ? "right" : "left"} ${Math.round(magnitude)} deg toward the next point.`;
}

function getDistanceLabel(distanceMeters) {
  if (typeof distanceMeters !== "number") {
    return "Location pending";
  }
  if (distanceMeters < 160) {
    return `${Math.round(distanceMeters)} m away`;
  }
  const miles = distanceMeters / 1609.344;
  return miles < 1 ? `${miles.toFixed(2)} mi away` : `${miles.toFixed(1)} mi away`;
}

function getCompassReadout(selectedStop) {
  const target = { lat: selectedStop.lat, lng: selectedStop.lng };
  const origin = state.map.userLocation || FOUNDERS_COMPASS_ANCHOR;
  const heading = typeof state.map.headingDegrees === "number" ? normalizeDegrees(state.map.headingDegrees) : null;
  const targetBearing = getBearingToPoint(origin, target);
  const targetDelta = heading === null ? null : targetBearing - heading;
  const triggerRadiusM = selectedStop.triggerRadiusM ?? selectedStop.radius ?? 40;
  const distanceMeters = state.map.userLocation
    ? haversineDistanceMeters(state.map.userLocation, target)
    : null;

  return {
    heading,
    headingLabel: heading === null ? "Finding north" : `${Math.round(heading)} deg ${getCardinalDirection(heading)}`,
    cardinal: getCardinalDirection(heading),
    targetBearing,
    targetRotation: heading === null ? targetBearing : targetBearing - heading,
    needleRotation: heading === null ? 0 : -heading,
    distanceMeters,
    triggerRadiusM,
    inArrivalZone: typeof distanceMeters === "number" && distanceMeters <= triggerRadiusM,
    distanceLabel: getDistanceLabel(distanceMeters),
    instruction: getTurnLabel(targetDelta),
    originLabel: state.map.userLocation ? "Using your location" : "Previewing from Founders Compass"
  };
}

function maybeAdvanceCompassTarget(selectedTour, selectedStop, distanceMeters) {
  if (state.activeTab !== "map" || !state.map.tracking || typeof distanceMeters !== "number") {
    return;
  }

  const triggerRadiusM = selectedStop.triggerRadiusM ?? selectedStop.radius ?? 40;
  if (distanceMeters > triggerRadiusM) {
    return;
  }

  const advanceKey = `${selectedTour.id}:${selectedStop.id}`;
  if (compassAutoAdvancedStopKeys.has(advanceKey)) {
    return;
  }
  compassAutoAdvancedStopKeys.add(advanceKey);

  if (!state.completedStopIds.includes(selectedStop.id)) {
    state.completedStopIds = [...state.completedStopIds, selectedStop.id];
    saveCompletedStops();
  }

  const currentIndex = getStopIndexForTour(selectedTour, selectedStop.id);
  const nextStop = selectedTour.stops[currentIndex + 1] || null;
  if (nextStop) {
    state.selectedStopId = nextStop.id;
    state.map.distanceToSelectedM = state.map.userLocation
      ? Math.round(haversineDistanceMeters(state.map.userLocation, { lat: nextStop.lat, lng: nextStop.lng }))
      : null;
    state.map.autoAdvanceNote = `Reached ${selectedStop.title}. Compass advanced to ${nextStop.title}.`;
  } else {
    state.map.autoAdvanceNote = `Reached ${selectedStop.title}. This compass path is complete.`;
  }
}

async function startCompassHeading() {
  state.map.headingError = "";

  if (compassOrientationHandler) {
    return;
  }

  if (!window.DeviceOrientationEvent) {
    state.map.headingError = "Compass direction is not available here.";
    state.map.headingReady = false;
    return;
  }

  try {
    if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
      const permission = await window.DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        throw new Error("Compass permission is off.");
      }
    }

    compassOrientationHandler = (event) => {
      const webkitHeading = typeof event.webkitCompassHeading === "number" ? event.webkitCompassHeading : null;
      const alphaHeading = typeof event.alpha === "number" ? normalizeDegrees(360 - event.alpha) : null;
      const nextHeading = webkitHeading ?? alphaHeading;

      if (typeof nextHeading !== "number") {
        return;
      }

      state.map.headingDegrees = normalizeDegrees(nextHeading);
      state.map.headingReady = true;
      state.map.headingError = "";

      if (state.activeTab === "map") {
        render(false);
      }
    };

    window.addEventListener("deviceorientation", compassOrientationHandler, true);
  } catch (error) {
    state.map.headingReady = false;
    state.map.headingError = (error && error.message) || "Turn on compass permission for live direction.";
    if (state.activeTab === "map") {
      render(false);
    }
  }
}

function startCompassLive() {
  state.map.requested = true;
  void startCompassHeading();
  startHomeMapLive();
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

function updateHomeMapLocation(positionCoords) {
  const selectedTour = getSelectedTour();
  const selectedStop = getSelectedStop();
  let nearestStop = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const stop of selectedTour.stops) {
    const distance = haversineDistanceMeters(positionCoords, { lat: stop.lat, lng: stop.lng });
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestStop = stop;
    }
  }

  state.map.userLocation = positionCoords;
  state.map.locationReady = true;
  state.map.error = "";
  state.map.nearestStopId = nearestStop?.id ?? null;
  state.map.distanceToSelectedM = Math.round(
    haversineDistanceMeters(positionCoords, { lat: selectedStop.lat, lng: selectedStop.lng })
  );

  if (nearestStop && state.map.followNearestStop && nearestStop.id !== state.selectedStopId) {
    state.selectedStopId = nearestStop.id;
    state.map.distanceToSelectedM = Math.round(
      haversineDistanceMeters(positionCoords, { lat: nearestStop.lat, lng: nearestStop.lng })
    );
  }

  const activeStop = getSelectedStop();
  const activeDistance = Math.round(
    haversineDistanceMeters(positionCoords, { lat: activeStop.lat, lng: activeStop.lng })
  );
  state.map.distanceToSelectedM = activeDistance;
  maybeAdvanceCompassTarget(selectedTour, activeStop, activeDistance);
}

function startHomeMapLive() {
  state.map.requested = true;

  if (!navigator.geolocation) {
    state.map.error = "Location is not available here.";
    state.map.tracking = false;
    state.map.locationReady = false;
    render(false);
    return;
  }

  if (mapLocationWatchId !== null) {
    return;
  }

  state.map.tracking = true;
  state.map.error = "";

  mapLocationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      updateHomeMapLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      if (state.activeTab === "home" || state.activeTab === "map") {
        render(false);
      }
    },
    () => {
      stopHomeMapLive();
      state.map.locationReady = false;
      state.map.error = "Location is off. Turn it on to let the compass follow you.";
      if (state.activeTab === "home" || state.activeTab === "map") {
        render(false);
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }
  );
}

async function startArLive() {
  stopArLive();
  state.ar.mode = "starting";
  state.ar.error = "";
  render(false);

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera is not available here. Try the mobile app for the best AR experience.");
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
          const previousNearestStopId = state.ar.nearestStopId;
          const previousInRange = state.ar.inRange;
          const previousLocationReady = state.ar.locationReady;
          updateArNearestStop({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          if (state.activeTab === "ar" && state.ar.mode === "live") {
            syncArLiveReadout();
          }
          if (
            state.ar.nearestStopId !== previousNearestStopId ||
            state.ar.inRange !== previousInRange ||
            state.ar.locationReady !== previousLocationReady
          ) {
            render(false);
          }
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
      state.ar.error = "Location is not available here. You can still browse the story.";
    }

    render(false);
  } catch (error) {
    stopArLive();
    state.ar.error = error instanceof Error ? error.message : "Unable to start camera mode.";
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

  if (!canPlayNarration(stopId)) {
    state.checkout.status = "error";
    state.checkout.message = "Your 2 free narration previews are used. Purchase full audio to unlock the rest.";
    render(false);
    return;
  }

  if (!state.audioAccess.fullUnlocked && !state.audioAccess.previewedStopIds.includes(stopId)) {
    state.audioAccess.previewedStopIds = [...state.audioAccess.previewedStopIds, stopId];
    saveAudioPreviewedStopIds();
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
  scrollViewportToTop();
  render(false);
}

function hydrateStateFromLocation() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    state.activeTab = "home";
    state.drawer = null;
    state.routePageTourId = null;
    state.home.focusTourId = null;
    return;
  }

  const params = new URLSearchParams(hash);
  const tab = params.get("tab");
  const tourId = params.get("tour");
  const stopId = params.get("stop");
  const routePage = params.get("routePage");
  const homeTour = params.get("homeTour");
  const drawerTour = params.get("drawerTour");
  const drawerStop = params.get("drawerStop");
  const checkoutState = params.get("checkout");
  const pendingCheckoutPlanId = loadPendingCheckoutPlanId();

  if (tab && ["home", "map", "ar", "progress", "profile"].includes(tab)) {
    state.activeTab = tab;
  }

  const nextHomeTour = homeTour ? getTourById(homeTour) : null;
  const nextTour = tourId ? getTourById(tourId) : null;
  const nextRoutePageTour = routePage ? getTourById(routePage) : null;
  const effectiveHomeTour = nextHomeTour || (state.activeTab === "home" ? nextTour : null);
  const effectiveTour = nextRoutePageTour || (state.activeTab === "home" && effectiveHomeTour ? effectiveHomeTour : nextTour);

  state.home.focusTourId = state.activeTab === "home" && effectiveHomeTour ? effectiveHomeTour.id : null;

  if (state.activeTab === "home" && effectiveHomeTour) {
    state.selectedTourId = effectiveHomeTour.id;
    state.selectedStopId = effectiveHomeTour.stops[0]?.id ?? state.selectedStopId;
  }

  if (nextRoutePageTour) {
    state.selectedTourId = nextRoutePageTour.id;
    state.selectedStopId = nextRoutePageTour.stops[0]?.id ?? state.selectedStopId;
  }

  if (nextTour) {
    state.selectedTourId = nextTour.id;
    state.selectedStopId = nextTour.stops[0]?.id ?? state.selectedStopId;
  }

  if (stopId) {
    const selectedTour = effectiveTour || getSelectedTour();
    const stopExists = selectedTour.stops.some((stop) => stop.id === stopId);
    if (stopExists) {
      state.selectedStopId = stopId;
    }
  }

  state.routePageTourId = nextRoutePageTour ? nextRoutePageTour.id : null;

  state.drawer = null;
  if (drawerTour && getTourById(drawerTour)) {
    state.drawer = { type: "tour", id: drawerTour };
  } else if (drawerStop && getStopById(drawerStop)) {
    state.drawer = { type: "stop", id: drawerStop };
  }

  if (checkoutState === "success") {
    if (pendingCheckoutPlanId === "full-audio-unlock-all-tours") {
      state.audioAccess.fullUnlocked = true;
      saveAudioUnlocked();
      state.checkout.status = "success";
      state.checkout.message = "Full audio unlocked on this device.";
    } else {
      state.checkout.status = "success";
      state.checkout.message = "Checkout completed successfully.";
    }
    savePendingCheckoutPlanId("");
  } else if (checkoutState === "cancelled") {
    state.checkout.status = "error";
    state.checkout.message = "Checkout was cancelled.";
    savePendingCheckoutPlanId("");
  }
}

function syncLocationHash() {
  const params = new URLSearchParams();
  const normalizedTab = state.activeTab;
  params.set("tab", normalizedTab);

  if ((normalizedTab === "home" && !state.home.focusTourId) || normalizedTab === "ar" || normalizedTab === "map") {
    params.set("tour", state.selectedTourId);
  }

  if (normalizedTab === "home" && state.home.focusTourId) {
    params.set("homeTour", state.home.focusTourId);
  }

  if (state.routePageTourId) {
    params.set("routePage", state.routePageTourId);
    params.set("tour", state.routePageTourId);
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
  if (nextTab !== "map") {
    state.routePageTourId = null;
  }
  scrollViewportToTop();
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

  const { action, tab, tourId, stopId, theme, provider } = actionTarget.dataset;

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
      state.glassesModeNotice = "Bluetooth audio mode turned off. Reopen the route or AR screen if you want to continue in standard phone mode.";
    } else {
      state.glassesModeNotice = "Bluetooth audio mode turned on. Narration will follow your active Bluetooth audio output.";
    }
    state.glassesMode = nextGlassesMode;
    saveGlassesMode();
    render(false);
    return;
  }

  if (action === "start-upgrade-checkout") {
    startUpgradeCheckout();
    return;
  }

  if (action === "start-tour-guide-checkout") {
    startTourGuideCheckout();
    return;
  }

  if (action === "sign-out-webapp") {
    stopNarration();
    stopArLive();
    clearWebAuthSession();
    clearPendingOAuthProvider();
    resetAuthState();
    render(false);
    return;
  }

  if (action === "oauth-sign-in" && (provider === "google" || provider === "apple")) {
    startOAuthSignIn(provider);
    return;
  }

  if (action === "select-tour" && tourId) {
    const selectedTour = getTourById(tourId);
    if (!selectedTour) {
      return;
    }
    state.selectedTourId = selectedTour.id;
    state.selectedStopId = selectedTour.stops[0]?.id ?? "";
    state.expandedTourCardId = selectedTour.id;
    state.routePageTourId = null;
    state.map.followNearestStop = false;
    state.map.autoAdvanceNote = "";
    render();
    return;
  }

  if (action === "focus-home-tour" && tourId) {
    const selectedTour = getTourById(tourId);
    if (!selectedTour) {
      return;
    }
    state.activeTab = "home";
    state.routePageTourId = null;
    state.home.focusTourId = selectedTour.id;
    state.selectedTourId = selectedTour.id;
    state.selectedStopId = selectedTour.stops[0]?.id ?? "";
    render();
    scrollHomeMapIntoView();
    return;
  }

  if (action === "show-all-home-tours") {
    state.activeTab = "home";
    state.routePageTourId = null;
    state.home.focusTourId = null;
    scrollViewportToTop();
    render();
    return;
  }

  if (action === "open-route-page" && tourId) {
    const selectedTour = getTourById(tourId);
    if (!selectedTour) {
      return;
    }
    openTourPageForStop(selectedTour, selectedTour.stops[0]?.id ?? "");
    return;
  }

  if (action === "close-route-page") {
    state.routePageTourId = null;
    state.activeTab = "home";
    state.home.focusTourId = state.selectedTourId;
    scrollViewportToTop();
    render();
    return;
  }

  if (action === "toggle-tour-card" && tourId) {
    state.expandedTourCardId = state.expandedTourCardId === tourId ? "" : tourId;
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
    state.map.followNearestStop = false;
    state.selectedStopId = stopId;
    state.map.autoAdvanceNote = "";
    render();
    return;
  }

  if (action === "select-prev-stop" || action === "select-next-stop") {
    const selectedTour = getSelectedTour();
    const currentIndex = Math.max(getStopIndexForTour(selectedTour, state.selectedStopId), 0);
    const nextIndex = action === "select-next-stop"
      ? Math.min(currentIndex + 1, selectedTour.stops.length - 1)
      : Math.max(currentIndex - 1, 0);
    const nextStop = selectedTour.stops[nextIndex];
    if (nextStop) {
      state.map.followNearestStop = false;
      state.selectedStopId = nextStop.id;
      state.map.autoAdvanceNote = "";
      render();
    }
    return;
  }

  if (action === "start-map-live") {
    startCompassLive();
    render(false);
    return;
  }

  if (action === "resume-map-follow") {
    state.map.followNearestStop = true;
    if (!state.map.tracking) {
      startCompassLive();
    } else if (state.map.userLocation) {
      updateHomeMapLocation(state.map.userLocation);
      render(false);
    } else {
      render(false);
    }
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

  if (action === "start-webxr") {
    void startWebXRMode();
    return;
  }

  if (action === "stop-webxr") {
    void stopWebXRMode();
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
    return;
  }

}

function handleDragStart(event) {
  const rawTarget = event.target;
  if (!(rawTarget instanceof Element)) {
    return;
  }

  const card = rawTarget.closest("[data-tour-drag-id]");
  const tourId = card?.getAttribute("data-tour-drag-id") || "";
  if (!tourId || !(event.dataTransfer instanceof DataTransfer)) {
    return;
  }

  state.draggingTourId = tourId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", tourId);
}

function handleDragOver(event) {
  const rawTarget = event.target;
  if (!(rawTarget instanceof Element)) {
    return;
  }

  const card = rawTarget.closest("[data-tour-drag-id]");
  if (!card || !state.draggingTourId) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer instanceof DataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

function handleDrop(event) {
  const rawTarget = event.target;
  if (!(rawTarget instanceof Element)) {
    return;
  }

  const card = rawTarget.closest("[data-tour-drag-id]");
  const targetTourId = card?.getAttribute("data-tour-drag-id") || "";
  const movedTourId =
    (event.dataTransfer instanceof DataTransfer && event.dataTransfer.getData("text/plain")) || state.draggingTourId;

  if (!movedTourId || !targetTourId) {
    return;
  }

  event.preventDefault();
  state.draggingTourId = "";
  if (reorderTourIds(movedTourId, targetTourId)) {
    render();
  }
}

function handleDragEnd() {
  state.draggingTourId = "";
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
    return;
  }

  if (target.name === "auth-display-name") {
    state.auth.displayName = target.value;
    if (state.auth.status !== "idle") {
      state.auth.status = "idle";
      state.auth.message = "";
    }
    return;
  }

  if (target.name === "auth-email") {
    state.auth.email = target.value;
    if (state.auth.status !== "idle") {
      state.auth.status = "idle";
      state.auth.message = "";
    }
    return;
  }

  if (target.name === "auth-password") {
    state.auth.password = target.value;
    if (state.auth.status !== "idle") {
      state.auth.status = "idle";
      state.auth.message = "";
    }
    return;
  }
}

function handleSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  if (form.dataset.form === "webapp-auth") {
    event.preventDefault();
    submitWebappAuth();
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

function getTourAccent(index) {
  return [
    ["#b45b3d", "#f0ceb5"],
    ["#6d4bc3", "#d8c7ff"],
    ["#35574f", "#d6eadf"],
    ["#204b74", "#c9dff3"],
    ["#8a4f63", "#f3d2dd"],
    ["#8e6b1f", "#f6e1a8"]
  ][index % 6];
}

function buildMapPinIcon(maps, color, options = {}) {
  const scale = Number.isFinite(options.scale) ? options.scale : 1.45;
  return {
    path: "M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z",
    fillColor: color || "#5c45ff",
    fillOpacity: 1,
    strokeColor: options.strokeColor || "#fffaf5",
    strokeOpacity: 1,
    strokeWeight: Number.isFinite(options.strokeWeight) ? options.strokeWeight : 1.8,
    scale,
    anchor: new maps.Point(12 * scale, 24 * scale),
    labelOrigin: new maps.Point(12 * scale, 9.4 * scale)
  };
}

function buildMapDotIcon(maps, color, options = {}) {
  return {
    path: maps.SymbolPath.CIRCLE,
    fillColor: color || "#5c45ff",
    fillOpacity: Number.isFinite(options.fillOpacity) ? options.fillOpacity : 1,
    strokeColor: options.strokeColor || "#fffaf5",
    strokeOpacity: 1,
    strokeWeight: Number.isFinite(options.strokeWeight) ? options.strokeWeight : 2,
    scale: Number.isFinite(options.scale) ? options.scale : 8
  };
}

function buildAdvancedPinContent(pinConfig) {
  const wrapper = document.createElement("div");
  wrapper.className = "map-pin-chip";
  wrapper.style.setProperty("--map-pin-bg", pinConfig.background || "#5c45ff");
  wrapper.style.setProperty("--map-pin-border", pinConfig.borderColor || "#fffaf5");
  wrapper.style.setProperty("--map-pin-glyph", pinConfig.glyphColor || "#fffaf5");
  wrapper.style.setProperty("--map-pin-scale", String(pinConfig.scale || 1));
  const glyph = document.createElement("span");
  glyph.textContent = pinConfig.glyphText || "";
  wrapper.appendChild(glyph);
  return wrapper;
}

function getSelectedStop() {
  const selectedTour = getSelectedTour();
  return selectedTour.stops.find((stop) => stop.id === state.selectedStopId) ?? selectedTour.stops[0];
}

function getStopIndexForTour(tour, stopId) {
  if (!tour || !stopId) {
    return -1;
  }
  return tour.stops.findIndex((stop) => stop.id === stopId);
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
  const orderedTours = [...tours].sort((left, right) => {
    const leftIndex = state.tourOrderIds.indexOf(left.id);
    const rightIndex = state.tourOrderIds.indexOf(right.id);
    return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });

  return orderedTours.filter((tour) => {
    const matchesTheme = state.themeFilter === "all" || tour.theme.toLowerCase() === state.themeFilter;
    const haystack = [tour.title, tour.theme, tour.neighborhood, tour.summary, ...tour.tags].join(" ").toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    return matchesTheme && matchesSearch;
  });
}

function reorderTourIds(movedTourId, targetTourId) {
  if (!movedTourId || !targetTourId || movedTourId === targetTourId) {
    return false;
  }

  const next = [...state.tourOrderIds];
  const fromIndex = next.indexOf(movedTourId);
  const targetIndex = next.indexOf(targetTourId);
  if (fromIndex === -1 || targetIndex === -1) {
    return false;
  }

  next.splice(fromIndex, 1);
  next.splice(targetIndex, 0, movedTourId);
  state.tourOrderIds = next;
  saveTourOrderIds();
  return true;
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

function isScavengerHuntTour(tour) {
  const searchable = `${tour?.id || ""} ${tour?.title || ""}`.toLowerCase();
  return searchable.includes("scavenger") || searchable.includes("scavanger");
}

function getBoardTitle(title) {
  const cleaned = String(title || "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length <= 22 ? cleaned : `${cleaned.slice(0, 20).trim()}...`;
}

function getBoardLevel(xp) {
  const currentLevelIndex = BOARD_LEVELS.reduce((activeIndex, level, index) => (xp >= level.minXp ? index : activeIndex), 0);
  const currentLevel = BOARD_LEVELS[currentLevelIndex];
  const nextLevel = BOARD_LEVELS[currentLevelIndex + 1] || null;
  const previousLevelXp = currentLevel.minXp;
  const nextLevelXp = nextLevel?.minXp || currentLevel.minXp;
  const levelSpan = Math.max(nextLevelXp - previousLevelXp, 1);
  const levelPct = nextLevel ? Math.min(100, Math.round(((xp - previousLevelXp) / levelSpan) * 100)) : 100;
  return { currentLevel, nextLevel, nextLevelXp, levelPct };
}

function renderBoardSpace(space, placement = "top") {
  if (!space) {
    return `<div class="board-space board-space--empty"></div>`;
  }
  return `
    <div class="board-space board-space--${placement} board-space--${space.state}">
      <span class="board-space-band board-space-band--${space.tone}"></span>
      <span class="board-space-number">${space.index + 1}</span>
      <strong>${escapeHtml(space.title)}</strong>
      <span>${space.state === "claimed" ? "Claimed" : space.state === "next" ? "Next" : space.state === "visited" ? "Visited" : "Locked"}</span>
    </div>
  `;
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

function renderAuthScreen() {
  const hasSiteKey = !!getCloudflareTurnstileSiteKey();
  const hasSyncServer = !!getSyncServerUrl();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseAuthConfig();
  const hasProviderAuth = !!supabaseUrl && !!supabaseAnonKey;
  const providerButtonsEnabled =
    hasProviderAuth &&
    hasSyncServer &&
    state.auth.status !== "submitting" &&
    (!hasSiteKey || !!state.auth.turnstileToken);

  return `
    <section class="auth-shell">
      <div class="auth-backdrop"></div>
      <article class="panel auth-panel auth-panel--cinematic">
        <div class="auth-panel-hero">
          <p class="eyebrow">Founders Threads access</p>
          <h2>Sign in to enter Philly Tours.</h2>
        </div>
        <div class="auth-form auth-form--cinematic">
          <div class="auth-form-top">
            <span class="status-pill">Private access</span>
            <span class="status-pill ${hasProviderAuth ? "is-live" : ""}">${hasProviderAuth ? "Ready" : "Coming soon"}</span>
          </div>
          <div class="auth-provider-row auth-provider-row--waiver">
            <button type="button" class="ghost-button auth-provider-button" data-action="oauth-sign-in" data-provider="google" ${providerButtonsEnabled ? "" : "disabled"}>
              Continue with Google
            </button>
            <button type="button" class="ghost-button auth-provider-button" data-action="oauth-sign-in" data-provider="apple" ${providerButtonsEnabled ? "" : "disabled"}>
              Continue with Apple
            </button>
          </div>
          <div class="drawer-copy auth-helper-box">
            <strong>Login help</strong>
            <p>If sign-in pauses, refresh the page and try again.</p>
          </div>
          ${
            hasSiteKey
              ? state.auth.turnstileToken
                ? ""
                : '<div id="webapp-turnstile" class="turnstile-mount turnstile-mount--silent" aria-hidden="true"></div>'
              : ""
          }
          ${
            hasSyncServer
              ? ""
              : '<div class="subscription-status error">Sign-in is unavailable right now.</div>'
          }
          ${
            hasProviderAuth
              ? ""
              : '<p class="subscription-status">Sign-in is coming soon.</p>'
          }
          ${state.auth.message ? `<p class="subscription-status ${state.auth.status === "error" ? "error" : ""}" role="status">${escapeHtml(state.auth.message)}</p>` : ""}
          <div class="drawer-copy">
            <strong>Follow Founders Threads</strong>
            <p>The socials live on the front door too, not buried lower in settings.</p>
          </div>
          ${renderSocialChannels()}
          <div class="button-row auth-button-row">
            <a class="ghost-button link-button" href="mailto:${CONTACT_EMAIL}">Need help?</a>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderSettingsSignInCard() {
  const hasSiteKey = !!getCloudflareTurnstileSiteKey();
  const hasSyncServer = !!getSyncServerUrl();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseAuthConfig();
  const hasProviderAuth = !!supabaseUrl && !!supabaseAnonKey;
  const activeUser = state.auth.session;
  const providerButtonsEnabled =
    hasProviderAuth &&
    hasSyncServer &&
    state.auth.status !== "submitting" &&
    (!hasSiteKey || !!state.auth.turnstileToken);

  return `
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Sign in</p>
          <h3>${activeUser ? "You are signed in" : "Sign in with Google or Apple"}</h3>
        </div>
        <span class="status-pill ${activeUser || hasProviderAuth ? "is-live" : ""}">${
          activeUser ? "Signed in" : hasProviderAuth ? "Ready" : "Coming soon"
        }</span>
      </div>
      ${
        activeUser
          ? `<div class="drawer-copy auth-helper-box">
              <strong>${escapeHtml(activeUser.displayName || activeUser.email || "Web session active")}</strong>
              <p>${escapeHtml(activeUser.email || "Your visit is saved on this device.")}</p>
            </div>`
          : ""
      }
      <div class="auth-provider-row auth-provider-row--waiver">
        <button type="button" class="ghost-button auth-provider-button" data-action="oauth-sign-in" data-provider="google" ${providerButtonsEnabled ? "" : "disabled"}>
          Continue with Google
        </button>
        <button type="button" class="ghost-button auth-provider-button" data-action="oauth-sign-in" data-provider="apple" ${providerButtonsEnabled ? "" : "disabled"}>
          Continue with Apple
        </button>
      </div>
      ${
        hasSiteKey
          ? state.auth.turnstileToken
            ? ""
            : '<div id="webapp-turnstile" class="turnstile-mount turnstile-mount--silent" aria-hidden="true"></div>'
          : ""
      }
      ${
        hasSyncServer
          ? ""
          : '<div class="subscription-status error">Sign-in is unavailable right now.</div>'
      }
      ${
        hasProviderAuth
          ? ""
          : '<p class="subscription-status">Sign-in is coming soon.</p>'
      }
      ${state.auth.message ? `<p class="subscription-status ${state.auth.status === "error" ? "error" : ""}" role="status">${escapeHtml(state.auth.message)}</p>` : ""}
      <div class="button-row">
        ${activeUser ? '<button type="button" class="ghost-button" data-action="sign-out-webapp">Sign out</button>' : ""}
        <button
          type="button"
          class="primary-button"
          data-action="start-upgrade-checkout"
          ${state.checkout.status === "submitting" ? "disabled" : ""}
        >
          Upgrade full audio experience + unlock all tours · $9.99
        </button>
        <button type="button" class="ghost-button" data-action="set-tab" data-tab="map">Browse tours</button>
        <a class="ghost-button link-button" href="mailto:${CONTACT_EMAIL}">Talk to Founders</a>
      </div>
      ${getCheckoutStatusMarkup()}
    </article>
  `;
}

function getCheckoutStatusMarkup() {
  if (!state.checkout.message) {
    return "";
  }

  const statusClass =
    state.checkout.status === "success"
      ? "subscription-status success"
      : state.checkout.status === "error"
        ? "subscription-status error"
        : "subscription-status";

  return `<p class="${statusClass}" role="status">${escapeHtml(state.checkout.message)}</p>`;
}

function getAppleStoreIconMarkup() {
  return '<img class="store-launch-card__badge-image" src="/assets/app-store-badge.png" alt="Download on the App Store" loading="lazy" />';
}

function getGooglePlayIconMarkup() {
  return '<img class="store-launch-card__badge-image" src="/assets/google-play-store-badge.png" alt="Get it on Google Play" loading="lazy" />';
}

function renderStoreBadge({ label, copy, href, iconMarkup, hideCopy = false }) {
  if (href) {
    return `
      <a class="store-launch-card store-launch-card--link ${hideCopy ? "store-launch-card--badge-only" : ""}" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">
        <span class="store-launch-card__icon" aria-hidden="true">${iconMarkup}</span>
        ${hideCopy ? "" : `
        <span class="store-launch-card__copy">
          <strong>${label}</strong>
          <span>${copy}</span>
        </span>`}
      </a>
    `;
  }

  return `
    <div class="store-launch-card ${hideCopy ? "store-launch-card--badge-only" : ""}" aria-disabled="true">
      <span class="store-launch-card__icon" aria-hidden="true">${iconMarkup}</span>
      ${hideCopy ? "" : `
      <span class="store-launch-card__copy">
        <strong>${label}</strong>
        <span>${copy}</span>
      </span>`}
    </div>
  `;
}

function renderPlatformBadgeGrid() {
  const iosAppStoreUrl = String(siteConfig.iosAppStoreUrl || "").trim();
  const androidPlayStoreUrl = String(siteConfig.androidPlayStoreUrl || "").trim();

  return `
    <div class="store-launch-grid" aria-label="Platform links">
      ${renderStoreBadge({
        label: "Web app",
        copy: "Open in browser",
        href: "https://philly-tours.com",
        iconMarkup: `<span class="platform-glyph">⌂</span>`
      })}
      ${renderStoreBadge({
        label: "App Store",
        copy: iosAppStoreUrl ? "Download on iPhone and iPad" : "iPhone + iPad listing coming soon",
        href: iosAppStoreUrl,
        iconMarkup: getAppleStoreIconMarkup()
      })}
      ${renderStoreBadge({
        label: "Google Play",
        copy: androidPlayStoreUrl ? "Get it on Android" : "Android listing coming soon",
        href: androidPlayStoreUrl,
        iconMarkup: getGooglePlayIconMarkup(),
        hideCopy: true
      })}
      ${renderStoreBadge({
        label: "AR field mode",
        copy: "Camera handoff for on-site tours",
        href: "",
        iconMarkup: `<span class="platform-glyph">◌</span>`
      })}
    </div>
  `;
}

function renderNewsletterSignup(copy = "Get launch notes, route drops, and platform updates by email.") {
  return `
    <form class="subscription-form" data-form="newsletter-subscription">
      <div class="drawer-copy">
        <strong>Join the newsletter</strong>
        <p>${copy}</p>
      </div>
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
      </div>
      ${getSubscriptionStatusMarkup()}
    </form>
  `;
}

function mountWebTurnstile() {
  const mountNode = document.getElementById("webapp-turnstile");
  const challengePage = isTurnstileChallengePage();
  const challengeStatus = document.getElementById("turnstile-challenge-status");
  const siteKey = challengePage ? getTurnstileChallengeSiteKey() : getCloudflareTurnstileSiteKey();
  if (!mountNode || !siteKey || (!challengePage && state.auth.turnstileToken)) {
    return;
  }

  if (!window.turnstile) {
    window.clearTimeout(webTurnstileMountTimer);
    webTurnstileMountTimer = window.setTimeout(mountWebTurnstile, 150);
    return;
  }

  mountNode.innerHTML = "";
  webTurnstileWidgetId = window.turnstile.render("#webapp-turnstile", {
    sitekey: siteKey,
    theme: "light",
    size: challengePage ? "normal" : "invisible",
    appearance: challengePage ? "always" : "execute",
    callback(token) {
      if (challengePage) {
        if (challengeStatus) {
          challengeStatus.style.display = "none";
          challengeStatus.textContent = "";
        }
        postTurnstileChallengeMessage({ type: "token", token });
        return;
      }
      state.auth.turnstileToken = token;
      state.auth.status = "idle";
      state.auth.message = "";
      render(false);
    },
    "expired-callback"() {
      if (challengePage) {
        postTurnstileChallengeMessage({ type: "expired" });
        return;
      }
      state.auth.turnstileToken = null;
      webTurnstileWidgetId = null;
      mountWebTurnstile();
    },
    "timeout-callback"() {
      if (challengePage) {
        postTurnstileChallengeMessage({ type: "expired" });
        return;
      }
      state.auth.turnstileToken = null;
      webTurnstileWidgetId = null;
      mountWebTurnstile();
    },
    "error-callback"(code) {
      if (challengePage) {
        if (challengeStatus) {
          challengeStatus.style.display = "block";
          challengeStatus.textContent = "Verification could not load. Refresh and try again.";
        }
        postTurnstileChallengeMessage({ type: "error", code: code || null });
        return;
      }
      state.auth.turnstileToken = null;
      state.auth.status = "idle";
      state.auth.message = "";
      render(false);
    }
  });
  if (!challengePage && webTurnstileWidgetId && typeof window.turnstile.execute === "function") {
    window.turnstile.execute(webTurnstileWidgetId);
  }
}

async function submitWebappAuth() {
  const syncServerUrl = getSyncServerUrl();
  const displayName = state.auth.displayName.trim();
  const email = state.auth.email.trim().toLowerCase();
  const password = state.auth.password;
  const mode = password.trim() ? "builder" : "tourist";
  const siteKey = getCloudflareTurnstileSiteKey();

  if (!syncServerUrl) {
    state.auth.status = "error";
    state.auth.message = "Sign-in is unavailable right now.";
    render(false);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    state.auth.status = "error";
    state.auth.message = "Enter a valid email address.";
    render(false);
    return;
  }

  if (siteKey && !state.auth.turnstileToken) {
    state.auth.status = "idle";
    state.auth.message = "";
    mountWebTurnstile();
    render(false);
    return;
  }

  state.auth.status = "submitting";
  state.auth.message = "Creating your secure session...";
  render(false);

  try {
    const response = await fetch(`${syncServerUrl}/api/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        displayName,
        email,
        mode,
        password: mode === "builder" ? password : undefined,
        turnstileToken: state.auth.turnstileToken || undefined
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.token || !payload.session) {
      throw new Error(payload.error || "Unable to sign in.");
    }

    state.auth.session = payload.session;
    state.auth.authToken = payload.token;
    state.auth.displayName = payload.session.displayName || displayName;
    state.auth.email = payload.session.email || email;
    state.auth.status = "success";
    state.auth.message = "Sign-in complete.";
    saveWebAuthSession({
      authToken: payload.token,
      session: payload.session
    });
    setActiveTab("profile");
    render();
    schedulePostSignInRefresh();
  } catch (error) {
    state.auth.status = "error";
    state.auth.message = withAuthRetryGuidance((error && error.message) || "Unable to sign in.");
    render(false);
  }
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

function withAuthRetryGuidance(message, provider = "") {
  const baseMessage = String(message || "Unable to sign in.");
  const retryGuidance = " If sign-in fails, refresh the page and try again.";
  return `${baseMessage}${retryGuidance}`;
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
    state.subscription.message = "Email signup is unavailable right now.";
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

async function startUpgradeCheckout() {
  await startCheckoutProduct({
    amount: 999,
    title: "Full audio experience + unlock all tours",
    planId: "full-audio-unlock-all-tours",
    successTab: "profile",
    idempotencyKeyPrefix: "web-upgrade"
  });
}

async function startTourGuideCheckout() {
  const guideConfig = getInPersonTourGuideConfig();
  if (!guideConfig.amountCents) {
    state.checkout.status = "error";
    state.checkout.message = "Tour guide checkout is unavailable right now.";
    render(false);
    return;
  }

  await startCheckoutProduct({
    amount: guideConfig.amountCents,
    title: guideConfig.label,
    planId: "in-person-tour-guide",
    successTab: "map",
    idempotencyKeyPrefix: "web-tour-guide"
  });
}

async function startCheckoutProduct({ amount, title, planId, successTab, idempotencyKeyPrefix }) {
  const syncServerUrl = getSyncServerUrl();
  if (!syncServerUrl) {
    state.checkout.status = "error";
    state.checkout.message = "Checkout is unavailable right now.";
    render(false);
    return;
  }

  state.checkout.status = "submitting";
  state.checkout.message = "Opening secure checkout...";
  savePendingCheckoutPlanId(planId);
  render(false);

  try {
    const currentUrl = new URL(window.location.href);
    const successUrl = `${currentUrl.origin}${currentUrl.pathname}#tab=${successTab}&checkout=success`;
    const cancelUrl = `${currentUrl.origin}${currentUrl.pathname}#tab=${successTab}&checkout=cancelled`;
    const response = await fetch(`${syncServerUrl}/api/payments/checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(state.auth.authToken ? { Authorization: `Bearer ${state.auth.authToken}` } : {})
      },
      body: JSON.stringify({
        amount,
        title,
        planId,
        successUrl,
        cancelUrl,
        idempotencyKey: `${idempotencyKeyPrefix}-${state.auth.session?.userId || "email-checkout"}-${Date.now()}`
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.url) {
      throw new Error(payload.error || "Unable to start checkout.");
    }

    state.checkout.status = "success";
    state.checkout.message = "Redirecting to Stripe checkout...";
    render(false);
    window.location.assign(payload.url);
  } catch (error) {
    savePendingCheckoutPlanId("");
    state.checkout.status = "error";
    state.checkout.message = (error && error.message) || "Unable to start checkout.";
    render(false);
  }
}

function getChromeTabKey() {
  return state.routePageTourId ? "map" : state.activeTab;
}

function getSceneConfig(selectedTour, globalStats) {
  switch (state.activeTab) {
    case "home":
      return {
        eyebrow: "Home atlas",
        title: "Welcome to Philadelphia Tours by Founders Threads.",
        body: "",
        metrics: [],
        floatingCard: `
          <article class="hero-floating-card hero-floating-card--compact">
            <strong>${state.home.focusTourId ? "Focused tour" : "Collection overview"}</strong>
            <h3>${state.home.focusTourId ? selectedTour.title : `${tours.length} tours available`}</h3>
            <p>${state.home.focusTourId ? truncateCopy(selectedTour.summary, 136) : "Choose a tour below to isolate its compass points on the map."}</p>
          </article>
        `
      };
    case "map":
      return {
        eyebrow: "Founders Compass",
        title: "Point the webapp at the next meaningful Philadelphia stop.",
        body: "Choose a Compass path, start location and heading, then let the selected card steer the live bearing, distance, and story order.",
        metrics: [],
        floatingCard: `
          <article class="hero-floating-card">
            <h3>${selectedTour.title}</h3>
            <p>${truncateCopy(selectedTour.summary, 138)}</p>
            <div class="hero-floating-meta">
              <span>${selectedTour.durationMin} min</span>
              <span>${selectedTour.distanceMiles} mi</span>
              <span>${selectedTour.theme}</span>
            </div>
          </article>
        `
      };
    case "ar":
      return {
        eyebrow: "AR field mode",
        title: "Use AR when you are near a stop and ready to look closer.",
        body: "The AR tab helps you get oriented, hear the story, and move into the mobile app when it is time for the full camera experience.",
        metrics: [],
        floatingCard: `
          <article class="hero-floating-card hero-floating-card--compact">
            <strong>Selected tour</strong>
            <h3>${selectedTour.title}</h3>
            <p>${selectedTour.arFocus}</p>
          </article>
        `
      };
    case "progress":
      return {
        eyebrow: "Founders board",
        title: "Your Collection Board",
        body: "Keep a clean record of what you have started and what still deserves a visit, without turning the experience into a cluttered dashboard.",
        metrics: [],
        floatingCard: `
          <article class="hero-floating-card hero-floating-card--compact">
            <strong>Current streak</strong>
            <h3>${Math.max(globalStats.toursStarted, 1)} active collections</h3>
            <p>Every completed stop feeds the same cross-device memory of your journey.</p>
          </article>
        `
      };
    case "profile":
      return {
        eyebrow: "Settings",
        title: "Settings, sign-in, contact, and platform access",
        body: "Use Settings to sign in, stay connected, and move between the web experience and the mobile apps.",
        metrics: [],
        floatingCard: ""
      };
    default:
      return {
        eyebrow: "",
        title: "",
        body: "",
        metrics: [],
        floatingCard: ""
      };
  }
}

function renderSocialIcon(icon) {
  switch (icon) {
    case "instagram":
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" class="social-icon__stroke"></rect>
          <circle cx="12" cy="12" r="4.2" class="social-icon__stroke"></circle>
          <circle cx="17.3" cy="6.8" r="1.2" class="social-icon__fill"></circle>
        </svg>
      `;
    case "facebook":
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M13.4 20.5v-7h2.4l.4-3h-2.8V8.7c0-.9.3-1.6 1.7-1.6h1.3V4.4c-.2 0-1-.1-2-.1-2 0-3.4 1.2-3.4 3.6v2.6H8.6v3h2.4v7h2.4Z" class="social-icon__fill"></path>
        </svg>
      `;
    case "linkedin":
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6.7 8.6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm-1.2 1.8h2.5v8.1H5.5v-8.1Zm4.1 0h2.4v1.1h0c.3-.6 1.2-1.4 2.5-1.4 2.6 0 3.1 1.7 3.1 4v4.4h-2.5v-3.9c0-.9 0-2.1-1.3-2.1s-1.5 1-1.5 2v4h-2.5v-8.1Z" class="social-icon__fill"></path>
        </svg>
      `;
    case "x":
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5.2 4.5h3.5l3.72 5.33L16.94 4.5h1.95l-5.59 6.39 5.91 8.61h-3.5l-4-5.76-5.04 5.76H4.72l6.16-7.05L5.2 4.5Zm2.44 1.38H6.9l8.47 12.24h.74L7.64 5.88Z" class="social-icon__fill"></path>
        </svg>
      `;
    case "bluesky":
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 11.06c1.25-2.44 4.66-6.24 7.83-8.18.91-.56 2.38-1.01 2.38.67 0 .33-.19 2.78-.3 3.18-.37 1.39-1.71 1.75-2.9 1.55 2.08.35 2.61 1.52 1.46 2.69-2.18 2.23-3.13-.56-5.55-.56-2.45 0-3.32 2.84-5.53.56-1.15-1.17-.62-2.34 1.46-2.69-1.19.2-2.53-.16-2.9-1.55-.11-.4-.3-2.85-.3-3.18 0-1.68 1.47-1.23 2.38-.67C7.34 4.82 10.75 8.62 12 11.06Zm0 2.28c-1.02 2.04-3.81 5.2-6.4 6.8-.74.46-1.93.83-1.93-.55 0-.27.15-2.3.24-2.62.3-1.15 1.4-1.45 2.37-1.29-1.7-.29-2.13-1.26-1.18-2.22 1.78-1.82 2.55.46 4.53.46 2 0 2.71-2.31 4.52-.46.95.96.52 1.93-1.18 2.22.97-.16 2.07.14 2.37 1.29.09.32.24 2.35.24 2.62 0 1.38-1.19 1.01-1.93.55-2.59-1.6-5.38-4.76-6.4-6.8Z" class="social-icon__fill"></path>
        </svg>
      `;
    case "cashapp":
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M14.58 7.28c0-.87-.73-1.45-1.84-1.45-1.08 0-1.89.44-2.59 1.32l-1.7-1.63c.99-1.23 2.51-1.97 4.44-1.97 2.54 0 4.34 1.3 4.34 3.5 0 2.55-2.12 3.31-3.85 3.82-1.74.5-2.8.81-2.8 1.94 0 .96.8 1.61 2.06 1.61 1.29 0 2.29-.55 3.14-1.6l1.77 1.58c-1.11 1.51-2.86 2.33-4.96 2.33-2.88 0-4.65-1.46-4.65-3.77 0-2.68 2.33-3.39 4.12-3.9 1.57-.45 2.52-.78 2.52-1.78Z" class="social-icon__fill"></path>
        </svg>
      `;
    case "youtube":
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M21.2 7.2a2.93 2.93 0 0 0-2.06-2.07C17.28 4.6 12 4.6 12 4.6s-5.28 0-7.14.53A2.93 2.93 0 0 0 2.8 7.2 30.6 30.6 0 0 0 2.27 12c0 1.63.18 3.24.53 4.8a2.93 2.93 0 0 0 2.06 2.07c1.86.53 7.14.53 7.14.53s5.28 0 7.14-.53a2.93 2.93 0 0 0 2.06-2.07c.35-1.56.53-3.17.53-4.8 0-1.63-.18-3.24-.53-4.8ZM10.33 15.01V8.99L15.54 12l-5.21 3.01Z" class="social-icon__fill"></path>
        </svg>
      `;
    case "whatsapp":
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 4.25a7.72 7.72 0 0 0-6.69 11.59L4.25 19.75l4.02-1.05A7.75 7.75 0 1 0 12 4.25Zm0 13.91a6.1 6.1 0 0 1-3.12-.86l-.22-.13-2.38.62.64-2.31-.15-.23A6.12 6.12 0 1 1 12 18.16Zm3.35-4.55c-.18-.09-1.08-.53-1.24-.58-.17-.06-.29-.09-.41.09-.12.17-.47.58-.58.69-.11.12-.21.13-.39.04a4.97 4.97 0 0 1-1.46-.9 5.46 5.46 0 0 1-1.01-1.25c-.11-.19-.01-.29.08-.38.08-.08.18-.21.27-.31.09-.11.12-.18.18-.3.06-.12.03-.23-.02-.32-.05-.09-.41-.99-.57-1.36-.15-.35-.3-.3-.41-.31h-.35c-.12 0-.32.05-.49.23-.17.18-.65.64-.65 1.56s.67 1.82.76 1.94c.09.12 1.31 2 3.17 2.8.44.19.79.31 1.06.4.45.14.86.12 1.18.07.36-.05 1.08-.44 1.23-.87.15-.43.15-.79.11-.87-.04-.08-.15-.13-.33-.22Z" class="social-icon__fill"></path>
        </svg>
      `;
    default:
      return "";
  }
}

function renderSocialChannels() {
  return `
    <div class="social-contact-grid" aria-label="Social media channels">
      ${SOCIAL_CHANNELS.map(
        (channel) => `
          <a class="social-contact-card" href="${channel.href}" target="_blank" rel="noreferrer">
            <span class="social-contact-card__icon">${renderSocialIcon(channel.icon)}</span>
            <span class="social-contact-card__copy">
              <strong>${channel.label}</strong>
              <span>${channel.handle}</span>
            </span>
          </a>
        `
      ).join("")}
    </div>
  `;
}

function renderSocialIconStrip() {
  return `
    <div class="social-icon-strip" aria-label="Follow Founders Threads">
      ${SOCIAL_CHANNELS.map(
        (channel) => `
          <a
            class="social-icon-button"
            href="${channel.href}"
            target="_blank"
            rel="noreferrer"
            aria-label="${channel.label} ${channel.handle}"
            title="${channel.label} ${channel.handle}"
          >
            ${renderSocialIcon(channel.icon)}
          </a>
        `
      ).join("")}
    </div>
  `;
}

function renderRssUpdates() {
  return `
    <div class="rss-updates-card">
      <div class="rss-updates-card__header">
        <div>
          <strong>RSS updates</strong>
          <p>Subscribe for route drops, launch notes, and pilot alerts.</p>
        </div>
        <a class="ghost-button link-button" href="${RSS_FEED_PATH}" target="_blank" rel="noreferrer">Open feed</a>
      </div>
      <div class="rss-update-list">
        ${RSS_UPDATES.map(
          (item) => `
            <article class="rss-update-item">
              <span class="rss-pill">RSS</span>
              <div>
                <strong>${item.title}</strong>
                <p>${item.detail}</p>
              </div>
            </article>
          `
        ).join("")}
      </div>
    </div>
  `;
}

function renderSceneHero(selectedTour, globalStats) {
  if (state.routePageTourId) {
    return "";
  }
  const scene = getSceneConfig(selectedTour, globalStats);
  if (!scene.eyebrow && !scene.title && !scene.body && !scene.metrics.length && !scene.floatingCard) {
    return "";
  }
  return `
    <section class="scene-hero scene-hero--${getChromeTabKey()}">
      <div class="scene-hero__veil"></div>
      <div class="scene-hero__content">
        <div class="scene-copy">
          <p class="eyebrow">${scene.eyebrow}</p>
          <h2>${scene.title}</h2>
          <p class="hero-text">${scene.body}</p>
          <div class="hero-button-row">
            <button type="button" class="primary-button" data-action="set-tab" data-tab="map">Explore tours</button>
            <button type="button" class="ghost-button" data-action="set-tab" data-tab="ar">Open AR mode</button>
          </div>
          <div class="hero-social-row">
            <span>routes</span>
            <span>heritage</span>
            <span>audio</span>
            <span>AR</span>
          </div>
        </div>
        ${
          scene.metrics.length
            ? `
              <div class="hero-metrics hero-metrics--cinematic">
                ${scene.metrics
                  .map(
                    (metric) => `
                      <article class="metric-card">
                        <span>${metric.value}</span>
                        <p>${metric.label}</p>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            `
            : ""
        }
      </div>
      ${scene.floatingCard}
    </section>
  `;
}

function render(shouldSyncHash = true) {
  teardownStopStreetView();
  teardownRouteMap();
  updateChrome();

  if (isTurnstileChallengePage()) {
    app.innerHTML = renderTurnstileChallengePage();
    mountWebTurnstile();
    return;
  }

  const chromeTab = getChromeTabKey();
  tabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === chromeTab);
  });

  const selectedTour = getSelectedTour();
  const selectedStop = getSelectedStop();
  const globalStats = getGlobalStats();

  if (state.routePageTourId) {
    const routeTour = getTourById(state.routePageTourId) || selectedTour;
    void ensureRoutePreviewLoaded(routeTour, state.narrationVariant);
  } else if (state.activeTab === "home" && state.home.focusTourId) {
    const focusedTour = getTourById(state.home.focusTourId);
    if (focusedTour) {
      void ensureRoutePreviewLoaded(focusedTour, state.narrationVariant);
    }
  }

  app.innerHTML = `
    ${renderSceneHero(selectedTour, globalStats)}
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

  mountWebTurnstile();

  const routeMapElement = document.getElementById("route-map");
  if (routeMapElement) {
    void initRouteMap(selectedTour, selectedStop, "route-map");
  }

  const stopStreetViewElement = document.getElementById("stop-street-view");
  if (stopStreetViewElement) {
    void initStopStreetView(selectedStop, "stop-street-view");
  }

  const homeMapElement = document.getElementById("home-map");
  if (homeMapElement) {
    void initHomeMap(selectedTour, "home-map");
  }

  if (state.activeTab === "ar" && state.ar.mode === "live" && arStream) {
    const video = document.getElementById("ar-camera-feed");
    if (video) {
      video.srcObject = arStream;
      video.play().catch(() => undefined);
    }
  }

  syncWebXROverlay();
}

function renderActiveTab(selectedTour, selectedStop, globalStats) {
  if (state.routePageTourId) {
    return renderRouteProductPage(getTourById(state.routePageTourId) || selectedTour, selectedStop);
  }
  switch (state.activeTab) {
    case "map":
      return renderRouteTab(selectedTour, selectedStop);
    case "home":
      return renderHomeTab(selectedTour);
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

function renderSelectedStopStreetViewPanel(selectedStop) {
  const locationLabel = selectedStop.fullAddress || selectedStop.locationLabel || selectedStop.title;
  const streetViewUrl = buildGoogleStreetViewUrl(selectedStop);

  return `
    <div class="panel panel--map-host route-pack-map route-street-view-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Selected stop</p>
          <h3>Street View at this stop</h3>
        </div>
        <span class="status-pill">Google powered</span>
      </div>
      <p class="lede">${escapeHtml(locationLabel)}</p>
      <div class="route-map-shell route-map-shell--street-view">
        <div
          id="stop-street-view"
          class="route-map route-map--street-view"
          aria-label="${escapeHtml(`Google Street View panorama for ${selectedStop.title}`)}"
        ></div>
      </div>
      ${
        streetViewUrl
          ? `
            <div class="button-row compact route-street-view-actions">
              <a class="ghost-button link-button" href="${escapeHtml(streetViewUrl)}" target="_blank" rel="noreferrer">Open Street View in Google Maps</a>
            </div>
          `
          : ""
      }
    </div>
  `;
}

function renderHomeTab(selectedTour) {
  const focusedTour = state.home.focusTourId ? getTourById(state.home.focusTourId) : null;
  const previewTour = focusedTour || selectedTour;
  const routePreview = getRoutePreviewDisplay(previewTour);

  return `
    <section class="section-grid home-grid home-grid--cinematic">
      <article class="panel panel--map-host home-hero-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">City-wide collection map</p>
            <h3>${focusedTour ? focusedTour.title : "All available tours in one map view"}</h3>
          </div>
          <span class="status-pill ${focusedTour ? "is-live" : ""}">${focusedTour ? "Tour isolated" : `${tours.length} tours live`}</span>
        </div>
        ${focusedTour
          ? ""
          : `<p class="lede">Start with the full interactive collection map, then click any color-coded tour pin to isolate that tour without leaving the same map.</p>`}
        ${renderStoryLogisticsCard(focusedTour || previewTour)}
        <div class="panel panel--map-host route-pack-map">
          <div class="route-map-shell route-map-shell--home">
            <div id="home-map" class="route-map route-map--home" aria-label="Home map overview"></div>
          </div>
        </div>
        <div class="in-app-browser-notice">
          <strong>Want the best map view?</strong>
          <p>Open this page in your phone browser for the smoothest map and compass experience.</p>
        </div>
        <div class="home-tour-grid">
          ${tours
            .map((tour, index) => {
              const progress = getProgressForTour(tour);
              const isFocused = focusedTour?.id === tour.id;
              const artwork = renderTourCardArtwork(tour);
              const palette = [
                ["#5d42ff", "#a68eff"],
                ["#ff8b5c", "#ffd38b"],
                ["#1e2a68", "#6aa5ff"],
                ["#6c1f52", "#ff7db6"]
              ][index % 4];
              return `
                <article class="experience-card home-tour-card ${isFocused ? "selected active" : ""} expanded" style="--tour-accent:${palette[0]}; --tour-glow:${palette[1]};">
                  <div class="experience-card-media">
                    <span class="experience-card-pill">${tour.theme}</span>
                    ${artwork}
                    <div class="experience-card-copy">
                      <p>${tour.neighborhood}</p>
                      <strong>${tour.title}</strong>
                      <span class="experience-card-inline-meta">${tour.durationMin} min · ${tour.distanceMiles} mi · ${tour.stops.length} stops</span>
                    </div>
                  </div>
                  <div class="experience-card-body">
                    <p>${truncateCopy(tour.summary, 154)}</p>
                    <div class="tour-card-meta">
                      <span>${tour.durationMin} min</span>
                      <span>${tour.distanceMiles} mi</span>
                      <span>${tour.stops.length} stops</span>
                      <span>${progress.percent}% complete</span>
                    </div>
                    <div class="button-row compact">
                      <button
                        type="button"
                        class="primary-button"
                        data-action="${isFocused ? "show-all-home-tours" : "focus-home-tour"}"
                        ${isFocused ? "" : `data-tour-id="${tour.id}"`}
                      >
                        ${isFocused ? "Show all tours" : "Focus tour"}
                      </button>
                      <button type="button" class="ghost-button" data-action="open-route-page" data-tour-id="${tour.id}">
                        Open route page
                      </button>
                    </div>
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

function renderStoryLogisticsCard(tour) {
  const leadStops = (tour?.stops || []).slice(0, 4).map((stop) => stop.title);
  const stopPreview = leadStops.length ? leadStops.join(" -> ") : "Compass start -> next meaningful stop";
  return `
    <div class="story-logistics-card">
      <div>
        <p class="eyebrow">Story Logistics</p>
        <strong>Routes shaped by story, geography, and momentum.</strong>
      </div>
      <p>Each next stop is chosen to keep the route moving forward, avoiding awkward jumps while preserving the story arc.</p>
      <span>${stopPreview}</span>
    </div>
  `;
}

function renderCompassPanel(selectedTour, selectedStop) {
  const readout = getCompassReadout(selectedStop);
  const currentStopIndex = Math.max(getStopIndexForTour(selectedTour, selectedStop.id), 0);
  const stopCount = selectedTour.stops.length;
  const canGoPrev = currentStopIndex > 0;
  const canGoNext = currentStopIndex < stopCount - 1;
  const headingStatus = state.map.headingReady
    ? "Phone compass live"
    : state.map.requested
      ? "Waiting for heading"
      : "Ready to start";
  const locationStatus = state.map.locationReady
    ? readout.inArrivalZone
      ? "Inside arrival zone"
      : readout.distanceLabel
    : state.map.requested
      ? "Waiting for location"
      : "Location off";

  return `
    <article class="panel compass-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Founders Compass</p>
          <h3>${readout.headingLabel}</h3>
        </div>
        <span class="status-pill ${state.map.headingReady ? "is-live" : ""}">${headingStatus}</span>
      </div>
      <div class="compass-shell">
        <div
          class="compass-dial"
          style="--needle-rotation:${readout.needleRotation}deg; --target-rotation:${readout.targetRotation}deg;"
          aria-label="Compass bearing to selected stop"
        >
          <span class="compass-cardinal compass-cardinal--n">N</span>
          <span class="compass-cardinal compass-cardinal--e">E</span>
          <span class="compass-cardinal compass-cardinal--s">S</span>
          <span class="compass-cardinal compass-cardinal--w">W</span>
          <div class="compass-target-ray"></div>
          <div class="compass-needle">
            <span class="compass-needle-north"></span>
            <span class="compass-needle-south"></span>
          </div>
          <div class="compass-center">
            <strong>${readout.cardinal}</strong>
          </div>
        </div>
        <div class="compass-readout">
          <p class="eyebrow">Next compass point</p>
          <h3>${currentStopIndex + 1}. ${selectedStop.title}</h3>
          <p>${readout.instruction}</p>
          <div class="compass-metrics">
            <div>
              <strong>${Math.round(readout.targetBearing)} deg</strong>
              <span>target bearing</span>
            </div>
            <div>
              <strong>${locationStatus}</strong>
              <span>${readout.originLabel}</span>
            </div>
            <div>
              <strong>${currentStopIndex + 1}/${stopCount}</strong>
              <span>story order</span>
            </div>
            <div>
              <strong>${readout.triggerRadiusM} m</strong>
              <span>arrival radius</span>
            </div>
          </div>
          ${state.map.error ? `<p class="compass-error">${state.map.error}</p>` : ""}
          ${state.map.headingError ? `<p class="compass-error">${state.map.headingError}</p>` : ""}
          ${state.map.autoAdvanceNote ? `<p class="compass-display-note">${state.map.autoAdvanceNote}</p>` : ""}
          <div class="button-row compact compass-actions">
            <button type="button" class="primary-button" data-action="start-map-live">${state.map.tracking ? "Refresh Compass" : "Start Compass"}</button>
            <button type="button" class="ghost-button" data-action="select-prev-stop" ${canGoPrev ? "" : "disabled"}>Previous point</button>
            <button type="button" class="ghost-button" data-action="select-next-stop" ${canGoNext ? "" : "disabled"}>Next point</button>
            <a
              class="ghost-button link-button"
              href="https://www.google.com/maps/dir/?api=1&destination=${selectedStop.lat},${selectedStop.lng}&travelmode=walking"
              target="_blank"
              rel="noreferrer"
            >
              Open directions
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderRouteTab(selectedTour, selectedStop) {
  const themes = ["all", ...new Set(tours.map((tour) => tour.theme.toLowerCase()))];
  const visibleTours = getVisibleTours();
  const googleMapProject = getGoogleMapsProjectConfig();
  const guideConfig = getInPersonTourGuideConfig();
  const routeProgress = getProgressForTour(selectedTour);
  const routePreview = getRoutePreviewDisplay(selectedTour);
  const recommendedStop = getRecommendedNextStop(selectedTour);
  const narrationMode = getNarrationMode(selectedStop.id);
  const narrationScript = getNarrationScript(selectedStop.id) || "No narration script is available for this stop yet.";
  const narrationPreview = truncateCopy(narrationScript, 180);
  const isNarrating = state.narrationState.stopId === selectedStop.id && state.narrationState.status === "playing";
  const audioAccess = getAudioAccessSummary(selectedStop.id);

  return `
    <section class="section-grid route-shell">
      ${renderCompassPanel(selectedTour, selectedStop)}

      <article class="panel panel--catalog">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Compass paths</p>
            <h3>Choose your next bearing</h3>
          </div>
          <span class="status-pill">${visibleTours.length} showing</span>
        </div>
        <div class="route-switcher">
          <button type="button" class="filter-chip active">Tours</button>
          <button type="button" class="filter-chip" disabled>Scavenger hunts</button>
          <button type="button" class="filter-chip ${state.activeTab === "map" ? "active" : ""}" data-action="copy-view">Share view</button>
        </div>
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
                  ${theme === "all" ? "All categories" : capitalize(theme)}
                </button>
              `
            )
            .join("")}
        </div>
        <label class="search-field">
          <span>Search tours</span>
          <input type="search" placeholder="History, culture, architecture..." data-role="tour-search" />
        </label>
        <div class="experience-grid">
          ${visibleTours
            .map((tour, index) => {
              const cardProgress = getProgressForTour(tour);
              const isSelected = tour.id === selectedTour.id;
              const isExpanded = state.expandedTourCardId === tour.id;
              const nextStop = getRecommendedNextStop(tour);
              const artwork = renderTourCardArtwork(tour);
              const palette = [
                ["#5d42ff", "#a68eff"],
                ["#ff8b5c", "#ffd38b"],
                ["#1e2a68", "#6aa5ff"],
                ["#6c1f52", "#ff7db6"]
              ][index % 4];
              return `
                <article class="experience-card ${isSelected ? "selected" : ""} ${isExpanded ? "expanded" : "collapsed"}" style="--tour-accent:${palette[0]}; --tour-glow:${palette[1]};" data-tour-drag-id="${tour.id}" draggable="true">
                  <button type="button" class="experience-card-media experience-card-toggle" data-action="toggle-tour-card" data-tour-id="${tour.id}">
                    <span class="experience-card-pill">${tour.theme}</span>
                    <span class="experience-card-drag-hint">Move</span>
                    ${artwork}
                    <div class="experience-card-copy">
                      <p>${tour.neighborhood}</p>
                      <strong>${tour.title}</strong>
                      <span class="experience-card-inline-meta">${tour.stops.length} stops · ${tour.distanceMiles} mi · ${cardProgress.percent}% complete</span>
                    </div>
                  </button>
                  <div class="experience-card-body ${isExpanded ? "" : "is-hidden"}">
                    <p>${truncateCopy(tour.summary, 154)}</p>
                    <div class="tour-card-meta">
                      <span>${tour.durationMin} min</span>
                      <span>${tour.distanceMiles} mi</span>
                      <span>${tour.stops.length} stops</span>
                      <span>${cardProgress.percent}% complete</span>
                    </div>
                    <div class="tour-card-foot">
                      <span>Start with ${nextStop.title}</span>
                    </div>
                    <div class="button-row compact">
                      <button type="button" class="primary-button" data-action="select-tour" data-tour-id="${tour.id}">
                        ${isSelected ? "Compass selected" : "Use in Compass"}
                      </button>
                      <button type="button" class="ghost-button" data-action="open-tour-drawer" data-tour-id="${tour.id}">Quick view</button>
                    </div>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </article>

      <section class="section-grid route-grid">
        <article class="panel panel--map-host route-detail-page">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Selected compass path</p>
              <h3>${selectedTour.title}</h3>
            </div>
            <span class="status-pill">${selectedTour.theme}</span>
          </div>
          <p class="lede">${selectedTour.summary}</p>
          ${renderStoryLogisticsCard(selectedTour)}
          <div class="route-page-stats">
            <div><strong>${routePreview.durationLabel}</strong><span>estimated time</span></div>
            <div><strong>${routePreview.distanceLabel}</strong><span>route distance</span></div>
            <div><strong>${selectedTour.stops.length}</strong><span>story stops</span></div>
            <div><strong>${routeProgress.percent}%</strong><span>current progress</span></div>
          </div>
          <div class="drawer-copy ${routePreview.status === "error" ? "emphasis" : ""}">
            <strong>${routePreview.statusLabel}</strong>
            <p>${routePreview.message}</p>
          </div>
          <div class="stop-summary-grid">
            <div>
              <strong>Neighborhood span</strong>
              <p>${selectedTour.neighborhood}</p>
            </div>
            <div>
              <strong>Recommended first stop</strong>
              <p>${recommendedStop.title}${recommendedStop.fullAddress || recommendedStop.locationLabel ? ` · ${recommendedStop.fullAddress || recommendedStop.locationLabel}` : ""}</p>
            </div>
            <div>
              <strong>Story Logistics flow</strong>
              <p>${buildTourNarrative(selectedTour)}</p>
            </div>
            <div>
              <strong>Route preview</strong>
              <p>${routePreview.legsLabel}</p>
            </div>
          </div>
          <div class="stop-meta-row">
            <span class="chip">${selectedTour.theme}</span>
            <span class="chip">${selectedTour.neighborhood}</span>
            <span class="chip">${selectedTour.stops.length} compass points</span>
          </div>
          <div class="panel panel--map-host route-pack-map">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Compass map</p>
                <h3>Stop map and order</h3>
              </div>
              <span class="status-pill ${routePreview.status === "ready" ? "is-live" : ""}">${routePreview.statusLabel}</span>
            </div>
            <div class="route-map-shell">
              <div id="route-map" class="route-map" aria-label="Route map preview"></div>
            </div>
          </div>
          ${renderSelectedStopStreetViewPanel(selectedStop)}
          <div class="panel panel--preview-callout route-guide-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">In-person tour guide</p>
                <h3>Purchase a guided version of this route</h3>
              </div>
              <span class="status-pill ${guideConfig.amountCents ? "is-live" : ""}">${guideConfig.amountCents ? "Stripe ready" : "Available on May 1st"}</span>
            </div>
            <p class="lede">Turn this route into a hosted experience with a live guide, coordinated pacing, and the matching Google map pack for the tour group.</p>
            <div class="button-row">
              <button
                type="button"
                class="primary-button"
                data-action="start-tour-guide-checkout"
                ${state.checkout.status === "submitting" || !guideConfig.amountCents ? "disabled" : ""}
              >
                ${guideConfig.amountCents ? `Purchase ${guideConfig.label}` : "Configure guide checkout"}
              </button>
              ${googleMapProject ? `<a class="ghost-button link-button" href="${escapeHtml(googleMapProject.publicUrl)}" target="_blank" rel="noreferrer">Open Google map pack</a>` : ""}
            </div>
            ${getCheckoutStatusMarkup()}
          </div>
          <div class="companion-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Audio posture</p>
                <h3>Cross-device companion mode</h3>
              </div>
              <span class="status-pill ${state.glassesMode ? "is-live" : ""}">${state.glassesMode ? "Ready" : "Standby"}</span>
            </div>
            <p>${getGlassesModeCopy()}</p>
            ${state.glassesModeNotice ? `<div class="drawer-copy"><strong>Status</strong><p>${state.glassesModeNotice}</p></div>` : ""}
            <div class="button-row">
              <button type="button" class="ghost-button ${state.glassesMode ? "active" : ""}" data-action="toggle-glasses-mode">
                ${getGlassesModeButtonLabel()}
              </button>
              <a class="ghost-button link-button" href="${buildPhoneAppHandoffLink(selectedTour.id, selectedStop.id)}">Open in phone app</a>
            </div>
          </div>
          <div class="narration-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Narration</p>
                <h3>Live runtime audio</h3>
              </div>
              <span class="status-pill ${state.audioAccess.fullUnlocked ? "is-live" : ""}">${audioAccess.pill}</span>
            </div>
            <div class="drawer-copy ${audioAccess.locked ? "emphasis" : ""}">
              <strong>${state.glassesMode ? `${getNarrationLabel(selectedStop.id)} to Bluetooth audio output` : getNarrationLabel(selectedStop.id)}</strong>
              <p>${audioAccess.message}${audioAccess.cta ? ` ${audioAccess.cta}` : ""}</p>
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
                ${narrationMode === "none" || (!isNarrating && audioAccess.locked) ? "disabled" : ""}
              >
                ${isNarrating ? "Stop narration" : narrationMode === "recorded" ? "Play recorded narration" : "Play Amy fallback"}
              </button>
              <button type="button" class="ghost-button" data-action="open-stop-drawer" data-stop-id="${selectedStop.id}">Full stop brief</button>
              ${audioAccess.locked ? '<button type="button" class="ghost-button" data-action="start-upgrade-checkout">Unlock full audio</button>' : ""}
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
            <a class="ghost-button link-button" href="#tab=home&homeTour=${selectedTour.id}">Copy route page</a>
            <a
              class="ghost-button link-button"
              href="https://www.google.com/maps/search/?api=1&query=${selectedStop.lat},${selectedStop.lng}"
              target="_blank"
              rel="noreferrer"
            >
              Open in maps
            </a>
            <button type="button" class="ghost-button" data-action="set-tab" data-tab="progress">Open board</button>
          </div>
          <div class="drawer-copy emphasis">
            <strong>Compass points in this path</strong>
            <p>Select a point below to update the compass, narration controls, and phone handoff target.</p>
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
                    <p>${stop.fullAddress || stop.locationLabel || truncateCopy(stop.description, 88)}</p>
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
    </section>
  `;
}

function renderRouteCatalogTab(selectedTour) {
  const themes = ["all", ...new Set(tours.map((tour) => tour.theme.toLowerCase()))];
  const visibleTours = getVisibleTours();

  return `
    <section class="section-grid route-shell">
      <article class="panel panel--catalog">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Collections</p>
            <h3>Find the route that matches the day you want</h3>
          </div>
          <span class="status-pill">${visibleTours.length} showing</span>
        </div>
        <div class="route-switcher">
          <button type="button" class="filter-chip active">Tours</button>
          <button type="button" class="filter-chip" disabled>Scavenger hunts</button>
          <button type="button" class="filter-chip ${state.activeTab === "map" ? "active" : ""}" data-action="copy-view">Share view</button>
        </div>
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
                  ${theme === "all" ? "All categories" : capitalize(theme)}
                </button>
              `
            )
            .join("")}
        </div>
        <label class="search-field">
          <span>Search tours</span>
          <input type="search" placeholder="History, culture, architecture..." data-role="tour-search" />
        </label>
        <div class="experience-grid">
          ${visibleTours
            .map((tour, index) => {
              const cardProgress = getProgressForTour(tour);
              const isSelected = tour.id === selectedTour.id;
              const isExpanded = state.expandedTourCardId === tour.id;
              const nextStop = getRecommendedNextStop(tour);
              const artwork = renderTourCardArtwork(tour);
              const palette = [
                ["#5d42ff", "#a68eff"],
                ["#ff8b5c", "#ffd38b"],
                ["#1e2a68", "#6aa5ff"],
                ["#6c1f52", "#ff7db6"]
              ][index % 4];
              return `
                <article class="experience-card ${isSelected ? "selected" : ""} ${isExpanded ? "expanded" : "collapsed"}" style="--tour-accent:${palette[0]}; --tour-glow:${palette[1]};" data-tour-drag-id="${tour.id}" draggable="true">
                  <button type="button" class="experience-card-media experience-card-toggle" data-action="toggle-tour-card" data-tour-id="${tour.id}">
                    <span class="experience-card-pill">${tour.theme}</span>
                    <span class="experience-card-drag-hint">Move</span>
                    ${artwork}
                    <div class="experience-card-copy">
                      <p>${tour.neighborhood}</p>
                      <strong>${tour.title}</strong>
                      <span class="experience-card-inline-meta">${tour.durationMin} min · ${tour.distanceMiles} mi · ${tour.stops.length} stops</span>
                    </div>
                  </button>
                  <div class="experience-card-body ${isExpanded ? "" : "is-hidden"}">
                    <p>${truncateCopy(tour.summary, 154)}</p>
                    <div class="tour-card-meta">
                      <span>${tour.durationMin} min</span>
                      <span>${tour.distanceMiles} mi</span>
                      <span>${tour.stops.length} stops</span>
                      <span>${tour.rating.toFixed(1)} rating</span>
                    </div>
                    <div class="tour-card-foot">
                      <span>Start with ${nextStop.title}</span>
                    </div>
                    <div class="button-row compact">
                      <button type="button" class="primary-button" data-action="open-route-page" data-tour-id="${tour.id}">
                        Open route page
                      </button>
                      <button type="button" class="ghost-button" data-action="select-tour" data-tour-id="${tour.id}">
                        ${isSelected ? "Selected" : "Select route"}
                      </button>
                    </div>
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

function renderRouteProductPage(selectedTour, selectedStop) {
  const googleMapProject = getGoogleMapsProjectConfig();
  const guideConfig = getInPersonTourGuideConfig();
  const routeProgress = getProgressForTour(selectedTour);
  const routePreview = getRoutePreviewDisplay(selectedTour);
  const recommendedStop = getRecommendedNextStop(selectedTour);
  const artwork = getTourCardArtwork(selectedTour);
  const narrationMode = getNarrationMode(selectedStop.id);
  const narrationScript = getNarrationScript(selectedStop.id) || "No narration script is available for this stop yet.";
  const narrationPreview = truncateCopy(narrationScript, 180);
  const isNarrating = state.narrationState.stopId === selectedStop.id && state.narrationState.status === "playing";
  const audioAccess = getAudioAccessSummary(selectedStop.id);

  return `
    <section class="section-grid route-product-page">
      <article class="panel panel--map-host route-product-shell">
        <div class="route-page-backbar">
          <button type="button" class="ghost-button route-page-back" data-action="close-route-page">← Back to routes</button>
        </div>
        <div class="panel-header">
          <div>
            <p class="eyebrow">Tour pack page</p>
            <h3>${selectedTour.title}</h3>
          </div>
          <span class="status-pill">${selectedTour.theme}</span>
        </div>
        <div class="route-product-hero-media" data-tour-image-id="${selectedTour.id}">
          ${
            artwork.status === "ready" && artwork.url
              ? `<img src="${escapeHtml(artwork.url)}" alt="${escapeHtml(artwork.title)}" loading="lazy" />`
              : `<div class="route-product-hero-media__placeholder"><span>${selectedTour.neighborhood}</span></div>`
          }
        </div>
        <p class="lede">${selectedTour.summary}</p>
        ${renderStoryLogisticsCard(selectedTour)}
        <div class="route-page-stats">
          <div><strong>${routePreview.durationLabel}</strong><span>estimated time</span></div>
          <div><strong>${routePreview.distanceLabel}</strong><span>route distance</span></div>
          <div><strong>${selectedTour.stops.length}</strong><span>story stops</span></div>
          <div><strong>${routeProgress.percent}%</strong><span>current progress</span></div>
        </div>
        <div class="drawer-copy ${routePreview.status === "error" ? "emphasis" : ""}">
          <strong>${routePreview.statusLabel}</strong>
          <p>${routePreview.message}</p>
        </div>
        <div class="stop-summary-grid">
          <div>
            <strong>Neighborhood span</strong>
            <p>${selectedTour.neighborhood}</p>
          </div>
          <div>
            <strong>Recommended first stop</strong>
            <p>${recommendedStop.title}${recommendedStop.fullAddress || recommendedStop.locationLabel ? ` · ${recommendedStop.fullAddress || recommendedStop.locationLabel}` : ""}</p>
          </div>
          <div>
            <strong>Story Logistics flow</strong>
            <p>${buildTourNarrative(selectedTour)}</p>
          </div>
          <div>
            <strong>Route preview</strong>
            <p>${routePreview.legsLabel}</p>
          </div>
        </div>
        <div class="stop-meta-row">
          <span class="chip">${selectedTour.theme}</span>
          <span class="chip">${selectedTour.neighborhood}</span>
          <span class="chip">${selectedTour.stops.length} stops on route</span>
        </div>
        <div class="panel panel--map-host route-pack-map">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Route preview</p>
              <h3>Stop map and order</h3>
            </div>
            <span class="status-pill ${routePreview.status === "ready" ? "is-live" : ""}">${routePreview.statusLabel}</span>
          </div>
          <div class="route-map-shell">
            <div id="route-map" class="route-map" aria-label="Route map preview"></div>
          </div>
        </div>
        ${renderSelectedStopStreetViewPanel(selectedStop)}
        <div class="panel panel--preview-callout route-guide-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">In-person tour guide</p>
              <h3>Purchase a guided version of this route</h3>
            </div>
            <span class="status-pill ${guideConfig.amountCents ? "is-live" : ""}">${guideConfig.amountCents ? "Stripe ready" : "Available on May 1st"}</span>
          </div>
          <p class="lede">Turn this route into a hosted experience with a live guide, coordinated pacing, and the matching Google map pack for the tour group.</p>
          <div class="button-row">
            <button
              type="button"
              class="primary-button"
              data-action="start-tour-guide-checkout"
              ${state.checkout.status === "submitting" || !guideConfig.amountCents ? "disabled" : ""}
            >
              ${guideConfig.amountCents ? `Purchase ${guideConfig.label}` : "Configure guide checkout"}
            </button>
            ${googleMapProject ? `<a class="ghost-button link-button" href="${escapeHtml(googleMapProject.publicUrl)}" target="_blank" rel="noreferrer">Open Google map pack</a>` : ""}
          </div>
          ${getCheckoutStatusMarkup()}
        </div>
        <div class="companion-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Audio posture</p>
              <h3>Cross-device companion mode</h3>
            </div>
            <span class="status-pill ${state.glassesMode ? "is-live" : ""}">${state.glassesMode ? "Ready" : "Standby"}</span>
          </div>
          <p>${getGlassesModeCopy()}</p>
          ${state.glassesModeNotice ? `<div class="drawer-copy"><strong>Status</strong><p>${state.glassesModeNotice}</p></div>` : ""}
          <div class="button-row">
            <button type="button" class="ghost-button ${state.glassesMode ? "active" : ""}" data-action="toggle-glasses-mode">
              ${getGlassesModeButtonLabel()}
            </button>
            <a class="ghost-button link-button" href="${buildPhoneAppHandoffLink(selectedTour.id, selectedStop.id)}">Open in phone app</a>
          </div>
        </div>
        <div class="narration-panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Narration</p>
              <h3>Selected stop audio</h3>
            </div>
            <span class="status-pill ${state.audioAccess.fullUnlocked ? "is-live" : ""}">${audioAccess.pill}</span>
          </div>
          <div class="drawer-copy ${audioAccess.locked ? "emphasis" : ""}">
            <strong>${state.glassesMode ? `${getNarrationLabel(selectedStop.id)} to Bluetooth audio output` : getNarrationLabel(selectedStop.id)}</strong>
            <p>${audioAccess.message}${audioAccess.cta ? ` ${audioAccess.cta}` : ""}</p>
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
              ${narrationMode === "none" || (!isNarrating && audioAccess.locked) ? "disabled" : ""}
            >
              ${isNarrating ? "Stop narration" : narrationMode === "recorded" ? "Play recorded narration" : "Play Amy fallback"}
            </button>
            <button type="button" class="ghost-button" data-action="open-stop-drawer" data-stop-id="${selectedStop.id}">Full stop brief</button>
            ${audioAccess.locked ? '<button type="button" class="ghost-button" data-action="start-upgrade-checkout">Unlock full audio</button>' : ""}
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
          <a class="ghost-button link-button" href="#tab=home&homeTour=${selectedTour.id}">Copy route page</a>
          <a
            class="ghost-button link-button"
            href="https://www.google.com/maps/search/?api=1&query=${selectedStop.lat},${selectedStop.lng}"
            target="_blank"
            rel="noreferrer"
          >
            Open in maps
          </a>
        </div>
        <div class="drawer-copy emphasis">
          <strong>Stops in this route</strong>
          <p>Select a stop below to update the route page details, narration controls, and phone handoff target.</p>
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
                  <p>${stop.fullAddress || stop.locationLabel || truncateCopy(stop.description, 88)}</p>
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
            <p>${nextStop.title}${nextStop.fullAddress || nextStop.locationLabel ? ` · ${nextStop.fullAddress || nextStop.locationLabel}` : ""}</p>
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
    const audioAccess = getAudioAccessSummary(stop.id);
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
            ${stop.fullAddress || stop.locationLabel ? `<span class="chip">${stop.fullAddress || stop.locationLabel}</span>` : ""}
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
          <div class="drawer-copy ${audioAccess.locked ? "emphasis" : ""}">
            <strong>${audioAccess.pill}</strong>
            <p>${audioAccess.message}${audioAccess.cta ? ` ${audioAccess.cta}` : ""}</p>
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
              ${narrationMode === "none" || (!isNarrating && audioAccess.locked) ? "disabled" : ""}
            >
              ${isNarrating ? "Stop narration" : narrationMode === "recorded" ? "Play recorded narration" : "Play Amy fallback"}
            </button>
            ${audioAccess.locked ? '<button type="button" class="ghost-button" data-action="start-upgrade-checkout">Unlock full audio</button>' : ""}
          </div>
          <div class="drawer-copy">
            <strong>Transcript</strong>
            <p>${narrationScript}</p>
          </div>
          <div class="drawer-copy emphasis">
            <strong>Recommended next stop</strong>
            <p>${nextStop.id === stop.id ? "You are on the next recommended stop." : `${nextStop.title}${nextStop.fullAddress || nextStop.locationLabel ? ` · ${nextStop.fullAddress || nextStop.locationLabel}` : ""}`}</p>
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
  const selectedTourStop = selectedTour.stops.find((stop) => stop.id === state.selectedStopId) ?? selectedTour.stops[0];
  const nearestStopTour = nearestStop ? getTourForStop(nearestStop.id) : null;
  const effectiveStop = nearestStop && nearestStopTour?.id === selectedTour.id ? nearestStop : selectedTourStop;
  const activeStopIndex = effectiveStop ? getStopIndexForTour(selectedTour, effectiveStop.id) : -1;
  const previousStop = activeStopIndex > 0 ? selectedTour.stops[activeStopIndex - 1] : null;
  const nextStop = activeStopIndex !== -1 && activeStopIndex < selectedTour.stops.length - 1 ? selectedTour.stops[activeStopIndex + 1] : null;
  const narrationMode = effectiveStop ? getNarrationMode(effectiveStop.id) : "none";
  const isNarrating = effectiveStop
    ? state.narrationState.stopId === effectiveStop.id && state.narrationState.status === "playing"
    : false;
  const arDistanceLabel =
    state.ar.distanceToNearestM !== null ? `${state.ar.distanceToNearestM}m` : effectiveStop && state.ar.locationReady ? "Located" : "Locating";
  const arRangeLabel = state.ar.inRange ? "Within trigger radius" : "Move closer to trigger";
  const arCameraLabel = state.ar.cameraReady ? "Camera live" : "Camera pending";
  const arGpsLabel = state.ar.locationReady ? "GPS locked" : "Acquiring GPS";
  const arCoordinateLabel = getArCoordinateLabel();
  const focusStateLabel = state.ar.inRange ? "Ready to trigger" : effectiveStop && state.ar.locationReady ? "Located" : state.ar.locationReady ? "Navigating" : "Scanning";
  const focusAutomationLabel = state.ar.autoNarrationEnabled ? "Auto narration armed" : "Manual narration";
  const focusSourceLabel =
    nearestStop && nearestStopTour?.id === selectedTour.id ? "Following nearest live stop" : "Following selected route stop";
  const audioAccess = effectiveStop ? getAudioAccessSummary(effectiveStop.id) : getAudioAccessSummary("");
  const headsetStatusLabel = state.xr.mode === "live" ? "Headset view live" : state.xr.supported ? "Headset view ready" : "Headset view";
  const headsetMarkup = state.xr.supported || state.xr.mode === "live"
    ? `
        <div class="drawer-copy">
          <strong>Headset view</strong>
          <p>${escapeHtml(state.xr.deviceLabel || "A simple headset view is ready when your device supports it.")}</p>
        </div>
        <div class="button-row">
          <button
            type="button"
            class="ghost-button ${state.xr.mode === "live" ? "active" : ""}"
            data-action="${state.xr.mode === "live" ? "stop-webxr" : "start-webxr"}"
          >
            ${state.xr.mode === "live" ? "Exit headset view" : "Start headset view"}
          </button>
          <span class="status-pill ${state.xr.mode === "live" ? "is-live" : ""}">${escapeHtml(headsetStatusLabel)}</span>
        </div>
        ${state.xr.error ? `<div class="drawer-copy"><strong>Status</strong><p>${escapeHtml(state.xr.error)}</p></div>` : ""}
      `
    : "";

  return `
    <section class="section-grid ar-grid ar-grid--cinematic">
      <article class="panel panel--hero-callout">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Launch mode</p>
            <h3>AR camera handoff for when you are already on location</h3>
          </div>
          <span class="status-pill ${state.ar.mode === "live" ? "is-live" : ""}">${state.ar.mode === "live" ? "Live now" : "Standby"}</span>
        </div>
        <p class="lede">Use the AR tab after you have chosen a route and reached the area. It helps you orient, trigger nearby stops, and keep narration moving without guessing what to do next.</p>
        <div class="quick-start-grid">
          <article class="quick-start-card">
            <span class="quick-start-step">1</span>
            <strong>Open camera</strong>
            <p>Turn on camera and location for the selected route.</p>
          </article>
          <article class="quick-start-card">
            <span class="quick-start-step">2</span>
            <strong>Reach the site</strong>
            <p>Walk into the trigger radius and let the stop become active.</p>
          </article>
          <article class="quick-start-card">
            <span class="quick-start-step">3</span>
            <strong>Hear the story</strong>
            <p>Use phone audio or Bluetooth glasses for the narration handoff.</p>
          </article>
        </div>
      </article>

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
                <div class="ar-coordinate-readout" data-role="ar-coordinate-readout">${escapeHtml(arCoordinateLabel)}</div>
                <button type="button" class="ar-close" data-action="stop-ar-live" aria-label="Stop AR live mode">×</button>
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
        ${state.ar.error ? `<div class="drawer-copy"><strong>Status</strong><p>${state.ar.error}</p></div>` : ""}
        ${headsetMarkup}
      </article>

      <article class="panel readiness-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Current focus</p>
            <h3>${selectedTour.title}</h3>
          </div>
          <span class="status-pill ${state.ar.inRange ? "is-live" : ""}">${state.ar.inRange ? "In range" : "Tracking"}</span>
        </div>
        <div class="focus-command-bar">
          <div class="focus-command-chip focus-command-chip--live">
            <span class="signal-dot signal-dot--small" aria-hidden="true"></span>
            <strong>${focusStateLabel}</strong>
            <span>${arDistanceLabel}</span>
          </div>
          <div class="focus-command-chip">
            <strong>${focusAutomationLabel}</strong>
            <span>${state.ar.autoNarrationEnabled ? "Story starts when you enter range" : "Use play when you want control"}</span>
          </div>
          <div class="focus-command-chip">
            <strong>${focusSourceLabel}</strong>
            <span>${arCameraLabel} · ${arGpsLabel}</span>
          </div>
        </div>
        <div class="readiness-list readiness-list--focus">
          <div>
            <strong>Active stop</strong>
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
              <div class="focus-stop-rail">
                <div class="focus-stop-rail__header">
                  <strong>Route controls</strong>
                  <span>Stop ${activeStopIndex + 1} of ${selectedTour.stops.length}</span>
                </div>
                <div class="focus-stop-rail__actions">
                  <button type="button" class="ghost-button" data-action="select-prev-stop" ${previousStop ? "" : "disabled"}>
                    ${previousStop ? `Previous: ${previousStop.title}` : "At first stop"}
                  </button>
                  <button type="button" class="ghost-button" data-action="select-next-stop" ${nextStop ? "" : "disabled"}>
                    ${nextStop ? `Next: ${nextStop.title}` : "At final stop"}
                  </button>
                </div>
                <div class="focus-stop-rail__list">
                  ${selectedTour.stops
                    .map(
                      (stop, index) => `
                        <button
                          type="button"
                          class="focus-stop-pill ${effectiveStop.id === stop.id ? "active" : ""}"
                          data-action="select-stop"
                          data-stop-id="${stop.id}"
                        >
                          <span>${index + 1}</span>
                          <strong>${stop.title}</strong>
                        </button>
                      `
                    )
                    .join("")}
                </div>
              </div>
              <div class="drawer-copy emphasis live-cue-card">
                <strong>Next action</strong>
                <p>${state.ar.inRange ? `You are in range. Play ${narrationMode === "recorded" ? "recorded narration" : "audio"} or open the stop brief now.` : `Move toward ${effectiveStop.fullAddress || effectiveStop.locationLabel || effectiveStop.title} until you enter the ${effectiveStop.radius}m trigger zone.`}</p>
              </div>
              <div class="focus-automation-panel">
                <div>
                  <strong>Target address</strong>
                  <p>${effectiveStop.fullAddress || effectiveStop.locationLabel || effectiveStop.title}</p>
                </div>
                <div>
                  <strong>Coordinates</strong>
                  <p>${effectiveStop.lat.toFixed(5)}, ${effectiveStop.lng.toFixed(5)}</p>
                </div>
                <div>
                  <strong>Route status</strong>
                  <p>${state.ar.inRange ? "Stop is live and ready." : "Tracking this stop live."}</p>
                </div>
              </div>
              <div class="focus-quick-actions">
                <a
                  class="ghost-button link-button"
                  href="https://www.google.com/maps/search/?api=1&query=${effectiveStop.lat},${effectiveStop.lng}"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in maps
                </a>
                <button type="button" class="ghost-button" data-action="select-stop" data-stop-id="${effectiveStop.id}">Lock this stop</button>
                <button type="button" class="ghost-button" data-action="set-tab" data-tab="map">Open route backup</button>
              </div>
              ${state.glassesModeNotice ? `<div class="drawer-copy"><strong>Status</strong><p>${state.glassesModeNotice}</p></div>` : ""}
              <div class="button-row">
                <button type="button" class="ghost-button ${state.ar.autoNarrationEnabled ? "active" : ""}" data-action="toggle-auto-narration">
                  ${state.ar.autoNarrationEnabled ? "Auto narration on" : "Auto narration off"}
                </button>
                <button type="button" class="ghost-button ${state.glassesMode ? "active" : ""}" data-action="toggle-glasses-mode">
                  ${state.glassesMode ? "Glasses audio on" : "Glasses audio off"}
                </button>
              </div>
              <div class="drawer-copy ${audioAccess.locked ? "emphasis" : ""}">
                <strong>${audioAccess.pill}</strong>
                <p>${audioAccess.message}${audioAccess.cta ? ` ${audioAccess.cta}` : ""}</p>
              </div>
              <div class="button-row">
                <button
                  type="button"
                  class="primary-button cta-beacon"
                  data-action="${isNarrating ? "stop-narration" : "play-narration"}"
                  data-stop-id="${effectiveStop.id}"
                  ${narrationMode === "none" || (!isNarrating && audioAccess.locked) ? "disabled" : ""}
                >
                  ${isNarrating ? "Stop narration" : narrationMode === "recorded" ? "Play stop narration" : "Play Amy fallback"}
                </button>
                <button type="button" class="ghost-button" data-action="open-stop-drawer" data-stop-id="${effectiveStop.id}">Open stop brief</button>
                ${audioAccess.locked ? '<button type="button" class="ghost-button" data-action="start-upgrade-checkout">Unlock full audio</button>' : ""}
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
  const activeTour = getSelectedTour();
  const selectedStop = getSelectedStop();
  const progress = getProgressForTour(activeTour);
  const completedStopSet = new Set(state.completedStopIds);
  const narratedStopSet = new Set(state.audioAccess.previewedStopIds);
  const openedStopSet = new Set([state.selectedStopId, ...state.completedStopIds, ...state.audioAccess.previewedStopIds].filter(Boolean));
  const completedStops = activeTour.stops.filter((stop) => completedStopSet.has(stop.id)).length;
  const openedStops = activeTour.stops.filter((stop) => openedStopSet.has(stop.id)).length;
  const heardNarrations = narratedStopSet.size;
  const activeNarrations = activeTour.stops.filter((stop) => narratedStopSet.has(stop.id)).length;
  const arStops = activeTour.stops.filter((stop) => stop.arType && stop.arType !== "none");
  const arAvailable = tours.flatMap((tour) => tour.stops.filter((stop) => stop.arType && stop.arType !== "none")).length;
  const arDiscoveries = activeTour.stops.filter((stop) => completedStopSet.has(stop.id) && stop.arType && stop.arType !== "none").length;
  const totalStops = activeTour.stops.length;
  const routePct = totalStops ? Math.round((completedStops / totalStops) * 100) : 0;
  const storyPct = totalStops ? Math.round((activeNarrations / totalStops) * 100) : 0;
  const arPct = arStops.length ? Math.round((arDiscoveries / arStops.length) * 100) : 0;
  const xp = state.completedStopIds.length * 40 + heardNarrations * 25 + globalStats.toursStarted * 10 + arDiscoveries * 60;
  const { currentLevel, nextLevel, nextLevelXp, levelPct } = getBoardLevel(xp);
  const nextStop = getRecommendedNextStop(activeTour);
  const badges = [
    { title: "First Stop", detail: "Complete one stop", earned: completedStops >= 1 },
    { title: "Story Listener", detail: "Hear two narrations", earned: heardNarrations >= 2 },
    { title: "AR Explorer", detail: "Find an AR-ready stop", earned: arDiscoveries > 0 },
    { title: "Full Route", detail: "Complete every stop in one tour", earned: totalStops > 0 && completedStops >= totalStops },
    { title: "Streak Starter", detail: "Keep two active days", earned: globalStats.toursStarted >= 2 },
    { title: "Score 250", detail: "Reach 250 total XP", earned: xp >= 250 },
    { title: "Place Witness", detail: "Submit a reflection", earned: false }
  ];
  const earnedBadgeCount = badges.filter((badge) => badge.earned).length;
  const nextBadge = badges.find((badge) => !badge.earned);
  const boardSpaces = activeTour.stops.slice(0, 16).map((stop, index) => {
    const claimed = completedStopSet.has(stop.id);
    const visited = openedStopSet.has(stop.id) || narratedStopSet.has(stop.id);
    const isNext = nextStop?.id === stop.id;
    return {
      id: stop.id,
      title: getBoardTitle(stop.title),
      index,
      state: claimed ? "claimed" : isNext ? "next" : visited ? "visited" : "locked",
      tone: ["gold", "blue", "green", "rose"][index % 4]
    };
  });
  const boardTop = boardSpaces.slice(0, 5);
  const boardRight = boardSpaces.slice(5, 8);
  const boardBottom = boardSpaces.slice(8, 13).reverse();
  const boardLeft = boardSpaces.slice(13, 16).reverse();
  const dailyQuestCount = Math.min(heardNarrations, 3);
  const weeklyQuestCount = Math.min(completedStops, 5);
  const boardQuests = [
    { title: "Daily story", detail: "Hear 3 stories", current: dailyQuestCount, goal: 3, reward: "+25 XP" },
    { title: "Weekly route", detail: "Complete 5 stops", current: weeklyQuestCount, goal: 5, reward: "Route reward" },
    { title: "AR hunt", detail: "Find every AR scene on this tour", current: arDiscoveries, goal: Math.max(arStops.length, 1), reward: "AR token" }
  ];
  const rewardTiers = [
    { title: "Route Starter", detail: "Unlocked at 100 XP", unlocked: xp >= 100 },
    { title: "Story Lens", detail: "Unlocked after 2 heard stories", unlocked: heardNarrations >= 2 },
    { title: "AR Token", detail: "Unlocked after 1 AR discovery", unlocked: arDiscoveries >= 1 },
    { title: "Founder Pass", detail: "Unlocked at 900 XP", unlocked: xp >= 900 }
  ];
  const nextReward = rewardTiers.find((reward) => !reward.unlocked);
  const unlockedRewardCount = rewardTiers.filter((reward) => reward.unlocked).length;
  const collectionStops = activeTour.stops.slice(0, 6).map((stop) => ({
    stop,
    collected: openedStopSet.has(stop.id) || narratedStopSet.has(stop.id) || completedStopSet.has(stop.id),
    complete: completedStopSet.has(stop.id)
  }));
  const challengeGoal = Math.max(totalStops, 1);
  const challengeActions = Math.min(challengeGoal, completedStops + Math.floor(activeNarrations / 2) + Math.min(arDiscoveries, 2));
  const challengePct = Math.round((challengeActions / challengeGoal) * 100);
  const personalBests = [
    { label: "Longest streak", value: `${Math.max(globalStats.toursStarted, completedStops ? 1 : 0)} day${Math.max(globalStats.toursStarted, completedStops ? 1 : 0) === 1 ? "" : "s"}` },
    { label: "Badges", value: `${earnedBadgeCount}/${badges.length}` },
    { label: "Rewards", value: `${unlockedRewardCount}/${rewardTiers.length}` }
  ];
  const tourProgress = tours
    .slice()
    .sort((tourA, tourB) => Number(isScavengerHuntTour(tourB)) - Number(isScavengerHuntTour(tourA)))
    .slice(0, 6)
    .map((tour) => ({ tour, isScavengerHunt: isScavengerHuntTour(tour), ...getProgressForTour(tour) }));
  const recentEvents = [
    ...state.completedStopIds.slice(-3).map((stopId) => ({ id: `done-${stopId}`, label: `Completed ${getStopById(stopId)?.title || "stop"}`, xp: 40 })),
    ...state.audioAccess.previewedStopIds.slice(-2).map((stopId) => ({ id: `story-${stopId}`, label: `Heard ${getStopById(stopId)?.title || "story"}`, xp: 25 }))
  ].slice(-4).reverse();

  return `
    <section class="section-grid progress-grid progress-grid--cinematic board-page">
      <article class="panel board-hero-panel">
        <p class="eyebrow">Board</p>
        <h3>${currentLevel.title}</h3>
        <p>${nextStop ? `Next compass point: ${nextStop.title}` : "Choose a tour and let the city open outward."}</p>
        <div class="board-hero-stats">
          <div><strong>${xp}</strong><span>score</span></div>
          <div><strong>${Math.max(globalStats.toursStarted, completedStops ? 1 : 0)}</strong><span>day streak</span></div>
          <div><strong>${earnedBadgeCount}</strong><span>badges</span></div>
          <div><strong>0</strong><span>voices</span></div>
        </div>
        <div class="board-track"><span style="width:${levelPct}%"></span></div>
        <p class="board-muted">${nextLevel ? `${Math.max(nextLevelXp - xp, 0)} XP to ${nextLevel.title}` : "Top rank reached"}</p>
        <div class="board-focus-row"><span>Next badge</span><strong>${nextBadge?.title || "All badges cleared"}</strong></div>
      </article>

      <article class="panel board-card board-active-quest">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Active quest</p>
            <h3>${activeTour.title}</h3>
          </div>
          <span class="status-pill is-live">${routePct}%</span>
        </div>
        <p class="lede">Next compass point: ${nextStop?.title || selectedStop.title}</p>
        <div class="city-board">
          <div class="board-row">${boardTop.map((space) => renderBoardSpace(space, "top")).join("")}</div>
          <div class="board-middle">
            <div class="board-side-rail">${boardLeft.map((space) => renderBoardSpace(space, "side")).join("")}</div>
            <div class="board-center">
              <p class="eyebrow">Philadelphia</p>
              <h3>Founders Board</h3>
              <p>Claim stops, complete sets, and move from North Broad outward.</p>
              <div class="board-center-stats">
                <div><strong>${completedStops}</strong><span>claimed</span></div>
                <div><strong>${openedStops}</strong><span>visited</span></div>
              </div>
            </div>
            <div class="board-side-rail">${boardRight.map((space) => renderBoardSpace(space, "side")).join("")}</div>
          </div>
          <div class="board-row">${boardBottom.map((space) => renderBoardSpace(space, "bottom")).join("")}</div>
        </div>
        <div class="share-board-panel">
          <div>
            <p class="eyebrow">Social card</p>
            <strong>Share your Founders Board</strong>
            <span>Post your rank, streak, claimed stops, and next compass point.</span>
          </div>
          <button type="button" class="primary-button" data-action="copy-view">Share Founders Board</button>
        </div>
        <div class="board-metric-grid">
          <div><strong>${completedStops}</strong><span>stops done</span></div>
          <div><strong>${openedStops}</strong><span>stops opened</span></div>
          <div><strong>${heardNarrations}</strong><span>stories heard</span></div>
          <div><strong>${tours.length}</strong><span>tour packs</span></div>
        </div>
        <div class="board-track board-track--light"><span style="width:${routePct}%"></span></div>
        <div class="stop-meta-row">
          <span class="chip">${routePct}% unfolded</span>
          <span class="chip">+40 XP per stop</span>
          <span class="chip">+25 XP per narration</span>
        </div>
      </article>

      <article class="panel board-carousel-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Score deck</p>
            <h3>Swipe through progress, rewards, and collections</h3>
          </div>
          <span class="status-pill">Swipe</span>
        </div>
        <div class="board-carousel" aria-label="Board score deck">
          <section class="board-slide board-slide--score">
            <div>
              <p class="eyebrow">Scoring</p>
              <h3>Earn points by touring</h3>
            </div>
            <div class="score-rules-grid">
              <div><strong>+10</strong><span>open stop</span></div>
              <div><strong>+25</strong><span>hear story</span></div>
              <div><strong>+40</strong><span>complete stop</span></div>
              <div><strong>+60</strong><span>find AR</span></div>
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Streak</p>
              <h3>${Math.max(globalStats.toursStarted, completedStops ? 1 : 0)} active day${Math.max(globalStats.toursStarted, completedStops ? 1 : 0) === 1 ? "" : "s"}</h3>
            </div>
            <p class="lede">Open a compass point, hear narration, or complete a stop on a new day to keep the streak alive.</p>
            <div class="streak-dots">
              ${[0, 1, 2, 3, 4, 5, 6].map((day) => `<span class="${day < Math.min(Math.max(globalStats.toursStarted, completedStops ? 1 : 0), 7) ? "active" : ""}"></span>`).join("")}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Quest log</p>
              <h3>Today, this week, and AR</h3>
            </div>
            <div class="board-stack">
              ${boardQuests.map((quest) => {
                const questPct = Math.min(100, Math.round((quest.current / quest.goal) * 100));
                return `
                  <div class="quest-row">
                    <div class="quest-row-header">
                      <div><strong>${quest.title}</strong><span>${quest.detail}</span></div>
                      <span class="status-pill ${questPct >= 100 ? "is-live" : ""}">${quest.reward}</span>
                    </div>
                    <div class="board-track board-track--small"><span style="width:${questPct}%"></span></div>
                    <small>${Math.min(quest.current, quest.goal)} of ${quest.goal}</small>
                  </div>
                `;
              }).join("")}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Next unlock</p>
              <h3>${nextReward?.title || "Reward board cleared"}</h3>
            </div>
            <p class="lede">${nextReward?.detail || "Keep touring to build score, streaks, and collection depth."}</p>
            <div class="unlock-preview">
              <div><strong>${nextLevel ? Math.max(nextLevelXp - xp, 0) : 0}</strong><span>XP to rank</span></div>
              <div><strong>${nextBadge ? earnedBadgeCount : badges.length}</strong><span>badges earned</span></div>
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Compass rings</p>
              <h3>Path, stories, and AR</h3>
            </div>
            <div class="ring-grid">
              ${[
                ["Path", routePct],
                ["Stories", storyPct],
                ["AR", arPct]
              ].map(([label, pct]) => `
                <div class="ring-card">
                  <div class="ring-outer ${pct >= 100 ? "complete" : ""}"><div><strong>${pct}%</strong></div></div>
                  <span>${label}</span>
                  <div class="board-track board-track--small"><span style="width:${pct}%"></span></div>
                </div>
              `).join("")}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Collection book</p>
              <h3>Stop cards</h3>
            </div>
            <div class="collection-book-grid">
              ${collectionStops.map(({ stop, collected, complete }) => `
                <div class="collection-book-card ${collected ? "collected" : ""}">
                  <strong>${collected ? stop.title : "Locked stop"}</strong>
                  <span>${complete ? "Completed" : collected ? "Collected" : "Hidden"}</span>
                </div>
              `).join("")}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Compass meter</p>
              <h3>Personal bests</h3>
            </div>
            <div class="board-track board-track--light"><span style="width:${challengePct}%"></span></div>
            <div class="stop-meta-row">
              <span class="chip">${challengeActions} of ${challengeGoal} compass moves</span>
              <span class="chip">${challengePct}% challenge</span>
            </div>
            <div class="best-grid">
              ${personalBests.map((best) => `<div><strong>${best.value}</strong><span>${best.label}</span></div>`).join("")}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Compass path</p>
              <h3>From North Broad outward</h3>
            </div>
            <div class="timeline">
              ${activeTour.stops.slice(0, 8).map((stop, index) => {
                const done = completedStopSet.has(stop.id);
                const open = openedStopSet.has(stop.id) || narratedStopSet.has(stop.id);
                return `
                  <div class="timeline-row">
                    <span class="timeline-dot ${done ? "done" : open ? "open" : ""}">${index + 1}</span>
                    <div><strong>${stop.title}</strong><span>${done ? "Completed" : open ? "In progress" : "Locked"}</span></div>
                  </div>
                `;
              }).join("")}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Rewards</p>
              <h3>${unlockedRewardCount} of ${rewardTiers.length} unlocked</h3>
            </div>
            <div class="board-stack">
              ${rewardTiers.map((reward) => `
                <div class="reward-row ${reward.unlocked ? "unlocked" : ""}">
                  <div><strong>${reward.title}</strong><span>${reward.detail}</span></div>
                  <span class="status-pill ${reward.unlocked ? "is-live" : ""}">${reward.unlocked ? "Unlocked" : "Locked"}</span>
                </div>
              `).join("")}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Levels</p>
              <h3>Rank ladder</h3>
            </div>
            <div class="board-stack">
              ${BOARD_LEVELS.map((level) => `
                <div class="level-row ${level.title === currentLevel.title ? "active" : ""} ${xp >= level.minXp ? "reached" : ""}">
                  <strong>${level.title}</strong>
                  <span>${level.minXp} XP</span>
                </div>
              `).join("")}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Badge shelf</p>
              <h3>Earned and upcoming</h3>
            </div>
            <div class="badge-grid">
              ${badges.map((badge) => `
                <div class="badge-card ${badge.earned ? "earned" : ""}">
                  <strong>${badge.title}</strong>
                  <span>${badge.detail}</span>
                  <small>${badge.earned ? "Unlocked" : "Locked"}</small>
                </div>
              `).join("")}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">Recent score</p>
              <h3>Latest XP awards</h3>
            </div>
            <div class="board-stack">
              ${recentEvents.length
                ? recentEvents.map((event) => `<div class="score-event-row"><span>${event.label}</span><strong>+${event.xp}</strong></div>`).join("")
                : `<p class="lede">Open a stop or play narration to start scoring.</p>`}
            </div>
          </section>
          <section class="board-slide">
            <div>
              <p class="eyebrow">AR discoveries</p>
              <h3>Scene collection</h3>
            </div>
            <p class="lede">AR-ready stops become hidden points on the Founders Compass. Open the tour page, choose the stop, then launch AR when available.</p>
            <div class="collection-grid">
              <div><strong>${arAvailable}</strong><span>available AR stops</span></div>
              <div><strong>${arDiscoveries}</strong><span>discovered</span></div>
            </div>
          </section>
          <section class="board-slide board-slide--wide">
            <div>
              <p class="eyebrow">Tour collection</p>
              <h3>Compass progress</h3>
            </div>
            <div class="progress-list">
              ${tourProgress.map(({ tour, completed, percent, isScavengerHunt }) => `
                <div class="progress-row board-tour-row">
                  <div class="progress-copy">
                    <strong>${tour.title}</strong>
                    <span>${completed} of ${tour.stops.length} stops completed${isScavengerHunt ? " · Scavenger hunt" : ""}</span>
                  </div>
                  <div class="progress-bar"><span style="width:${percent}%"></span></div>
                  <span class="progress-value">${percent}%</span>
                </div>
              `).join("")}
            </div>
          </section>
        </div>
      </article>
    </section>
  `;
}

function renderProfileTab() {
  const startedTours = tours.filter((tour) => getProgressForTour(tour).completed > 0);
  const activeUser = state.auth.session;
  const iosAppStoreUrl = String(siteConfig.iosAppStoreUrl || "").trim();
  const androidPlayStoreUrl = String(siteConfig.androidPlayStoreUrl || "").trim();
  const hasStoreLinks = !!iosAppStoreUrl || !!androidPlayStoreUrl;
  const renderStoreBadge = ({ label, copy, href, iconMarkup, hideCopy = false }) => {
    if (href) {
      return `
        <a class="store-launch-card store-launch-card--link ${hideCopy ? "store-launch-card--badge-only" : ""}" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">
          <span class="store-launch-card__icon" aria-hidden="true">${iconMarkup}</span>
          ${hideCopy ? "" : `
          <span class="store-launch-card__copy">
            <strong>${label}</strong>
            <span>${copy}</span>
          </span>`}
        </a>
      `;
    }

    return `
      <div class="store-launch-card ${hideCopy ? "store-launch-card--badge-only" : ""}" aria-disabled="true">
        <span class="store-launch-card__icon" aria-hidden="true">${iconMarkup}</span>
        ${hideCopy ? "" : `
        <span class="store-launch-card__copy">
          <strong>${label}</strong>
          <span>${copy}</span>
        </span>`}
      </div>
    `;
  };
  return `
    <section class="section-grid profile-grid profile-grid--cinematic">
      ${renderSettingsSignInCard()}
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
        <div class="drawer-copy">
          <strong>Follow Founders Threads</strong>
        </div>
        ${renderSocialChannels()}
        <div class="button-row">
          <a class="primary-button link-button" href="mailto:${CONTACT_EMAIL}">Contact us</a>
          <button type="button" class="ghost-button" data-action="set-tab" data-tab="map">Browse tours</button>
          <button type="button" class="ghost-button" data-action="set-tab" data-tab="map">Resume route</button>
        </div>
        <div class="native-ar-notice">
          <strong>For the full AR experience, use the mobile app.</strong>
          <p>The website is great for planning, maps, the board, compass, narration, and learning the story. The mobile app brings the camera experience to life when you are out at the stops.</p>
          <span>Download the app below before your walk.</span>
        </div>
        <div class="store-launch-grid" aria-label="Mobile app download links">
          ${renderStoreBadge({
            label: "App Store",
            copy: iosAppStoreUrl ? "Download the iPhone + iPad app" : "App Store link will appear here when the listing is live",
            href: iosAppStoreUrl,
            iconMarkup: getAppleStoreIconMarkup(),
            hideCopy: true
          })}
          ${renderStoreBadge({
            label: "Google Play",
            copy: androidPlayStoreUrl ? "Download the Android app" : "Google Play link will appear here when the listing is live",
            href: androidPlayStoreUrl,
            iconMarkup: getGooglePlayIconMarkup(),
            hideCopy: true
          })}
        </div>
        <form class="subscription-form" data-form="newsletter-subscription">
          <div class="drawer-copy">
            <strong>Join the email list</strong>
            <p>Get the exact App Store and Google Play launch links the moment the mobile apps go live.</p>
          </div>
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
        ${renderRssUpdates()}
        <div class="legal-link-row" aria-label="App links">
          <a href="/privacy.html">Privacy</a>
          <a href="/support.html">Support</a>
        </div>
        ${activeUser ? `
          <div class="button-row compact">
            <button type="button" class="ghost-button" data-action="sign-out-webapp">Sign out</button>
          </div>
        ` : ""}
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
  clearMapViewportStabilizer();
  if (Array.isArray(routeMapLayers)) {
    routeMapLayers.forEach((overlay) => {
      if (overlay && typeof overlay.setMap === "function") {
        overlay.setMap(null);
        return;
      }
      if (overlay && "map" in overlay) {
        overlay.map = null;
      }
    });
  }
  routeMap = null;
  routeMapLayers = [];
}

function teardownStopStreetView() {
  stopStreetViewRequestToken += 1;
  stopStreetView = null;
}

async function initStopStreetView(selectedStop, elementId = "stop-street-view") {
  const streetViewElement = document.getElementById(elementId);
  if (!streetViewElement) {
    return;
  }

  const streetViewConfig = getStopStreetViewConfig(selectedStop);
  if (!streetViewConfig) {
    streetViewElement.innerHTML = buildStopStreetViewFallbackMarkup("This stop does not have a map preview yet.");
    return;
  }

  const requestToken = ++stopStreetViewRequestToken;

  let maps;
  try {
    maps = await loadGoogleMapsApi();
  } catch (error) {
    if (document.getElementById(elementId) === streetViewElement && requestToken === stopStreetViewRequestToken) {
      streetViewElement.innerHTML = buildStopStreetViewFallbackMarkup((error && error.message) || "Unable to load Google Street View.");
    }
    return;
  }

  if (document.getElementById(elementId) !== streetViewElement || requestToken !== stopStreetViewRequestToken) {
    return;
  }

  const resolvedStreetViewLocation = await resolveStopStreetViewLocation(streetViewConfig, maps);
  if (document.getElementById(elementId) !== streetViewElement || requestToken !== stopStreetViewRequestToken) {
    return;
  }

  if (!resolvedStreetViewLocation && !streetViewConfig.panoId) {
    streetViewElement.innerHTML = buildStopStreetViewFallbackMarkup("This stop does not have a mappable address or coordinate for Street View yet.");
    return;
  }

  streetViewElement.innerHTML = "";

  const streetViewService = new maps.StreetViewService();
  const panoramaRequest = streetViewConfig.panoId
    ? { pano: streetViewConfig.panoId }
    : {
        location: resolvedStreetViewLocation,
        radius: streetViewConfig.radiusM,
        preference: maps.StreetViewPreference?.NEAREST,
        ...(streetViewConfig.source === "outdoor" ? { source: maps.StreetViewSource?.OUTDOOR } : {})
      };

  streetViewService.getPanorama(
    panoramaRequest,
    (data, status) => {
      if (document.getElementById(elementId) !== streetViewElement || requestToken !== stopStreetViewRequestToken) {
        return;
      }

      if (status !== maps.StreetViewStatus.OK || !data?.location?.pano) {
        streetViewElement.innerHTML = buildStopStreetViewFallbackMarkup("Google Street View imagery is not available close to this stop yet.");
        return;
      }

      const panoPosition = normalizeLatLngLiteral(data.location.latLng) || resolvedStreetViewLocation || streetViewConfig.viewpoint;
      stopStreetView = new maps.StreetViewPanorama(streetViewElement, {
        pano: data.location.pano,
        position: panoPosition,
        pov: {
          heading:
            streetViewConfig.heading != null
              ? streetViewConfig.heading
              : computeHeadingBetweenPoints(panoPosition, streetViewConfig.targetPosition),
          pitch: streetViewConfig.pitch != null ? streetViewConfig.pitch : 0
        },
        zoom: streetViewConfig.zoom != null ? streetViewConfig.zoom : 0,
        disableDefaultUI: true,
        zoomControl: true,
        linksControl: true,
        clickToGo: true,
        motionTracking: false,
        motionTrackingControl: false,
        fullscreenControl: false,
        addressControl: false,
        enableCloseButton: false,
        showRoadLabels: true
      });

      window.requestAnimationFrame(() => {
        if (stopStreetView && requestToken === stopStreetViewRequestToken) {
          maps.event.trigger(stopStreetView, "resize");
        }
      });
    }
  );
}

async function initRouteMap(selectedTour, selectedStop, elementId = "route-map") {
  const mapElement = document.getElementById(elementId);
  if (!mapElement) {
    return;
  }

  const renderableStops = getRenderableStops(selectedTour?.stops || []);
  const activeRenderableStop = renderableStops.find((stop) => stop.id === selectedStop?.id) ?? renderableStops[0] ?? null;

  let maps;
  try {
    maps = await loadGoogleMapsApi();
  } catch (error) {
    if (document.getElementById(elementId) === mapElement) {
      mapElement.innerHTML = `<div class="route-map-fallback"><div><strong>Google map unavailable</strong><span>${escapeHtml((error && error.message) || "Unable to load the map.")}</span></div></div>`;
    }
    return;
  }

  if (document.getElementById(elementId) !== mapElement) {
    return;
  }

  routeMap = new maps.Map(mapElement, {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: "cooperative",
    clickableIcons: false,
    ...(normalizeRoutePreviewVariant(state.narrationVariant) === "drive"
      ? { mapTypeId: "hybrid" }
      : { styles: buildGoogleShellMapStyles(), mapTypeId: "roadmap" }),
    backgroundColor: "#141b2d",
    ...(getGoogleMapsMapId() ? { mapId: getGoogleMapsMapId() } : {})
  });

  routeMapLayers = [];

  const bounds = new maps.LatLngBounds();
  const fallbackCenter = activeRenderableStop
    ? { lat: activeRenderableStop.lat, lng: activeRenderableStop.lng }
    : { lat: 39.9526, lng: -75.1652 };

  renderableStops.forEach((stop) => {
    const isSelected = stop.id === selectedStop.id;
    const isDone = state.completedStopIds.includes(stop.id);
    const marker = new maps.Marker({
      map: routeMap,
      position: { lat: stop.lat, lng: stop.lng },
      title: `${stop.originalIndex + 1}. ${stop.title}`,
      label: {
        text: String(stop.originalIndex + 1),
        color: isSelected ? "#6b3b2f" : "#fffaf5",
        fontWeight: "700"
      },
      icon: {
        path: maps.SymbolPath.CIRCLE,
        fillColor: isSelected ? "#f1d1b2" : isDone ? "#35574f" : "#172026",
        fillOpacity: 1,
        strokeColor: isSelected ? "#b45b3d" : "#fffaf5",
        strokeOpacity: 1,
        strokeWeight: isSelected ? 3 : 2,
        scale: isSelected ? 13 : 10
      }
    });
    routeMapLayers.push(marker);
    bounds.extend({ lat: stop.lat, lng: stop.lng });

    marker.addListener("click", () => {
      state.map.followNearestStop = false;
      state.selectedStopId = stop.id;
      render();
    });
  });

  if (state.map.locationReady && state.map.userLocation) {
    const userLatLng = {
      lat: state.map.userLocation.lat,
      lng: state.map.userLocation.lng
    };

    const userRadius = new maps.Circle({
      map: routeMap,
      center: userLatLng,
      radius: 36,
      strokeColor: "#5c45ff",
      strokeOpacity: 0.2,
      strokeWeight: 1,
      fillColor: "#5c45ff",
      fillOpacity: 0.12
    });
    routeMapLayers.push(userRadius);

    const userMarker = new maps.Marker({
      map: routeMap,
      position: userLatLng,
      title: "You are here",
      icon: {
        path: maps.SymbolPath.CIRCLE,
        fillColor: "#5c45ff",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeOpacity: 1,
        strokeWeight: 3,
        scale: 9
      }
    });
    routeMapLayers.push(userMarker);

    bounds.extend(userLatLng);
  }

  if (!bounds.isEmpty()) {
    routeMap.fitBounds(bounds, 48);
  } else {
    routeMap.setCenter(fallbackCenter);
    routeMap.setZoom(14);
  }

  installMapViewportStabilizer({
    map: routeMap,
    maps,
    mapElement,
    restoreView: () => {
      if (!bounds.isEmpty()) {
        routeMap.fitBounds(bounds, 48);
        return;
      }

      routeMap.setCenter(fallbackCenter);
      routeMap.setZoom(14);
    }
  });

  installGoogleMapHealthFallback({
    mapElement,
    fallbackPosition: fallbackCenter,
    title: selectedTour.title,
    zoom: 14,
    maps,
    map: routeMap
  });
}

async function initHomeMap(selectedTour, elementId = "home-map") {
  const mapElement = document.getElementById(elementId);
  if (!mapElement) {
    return;
  }

  let maps;
  try {
    maps = await loadGoogleMapsApi();
  } catch (error) {
    if (document.getElementById(elementId) === mapElement) {
      mapElement.innerHTML = `<div class="route-map-fallback"><div><strong>Google map unavailable</strong><span>${escapeHtml((error && error.message) || "Unable to load the map.")}</span></div></div>`;
    }
    return;
  }

  if (document.getElementById(elementId) !== mapElement) {
    return;
  }

  const homeMapId = getGoogleMapsMapId() || "DEMO_MAP_ID";
  const markerLibrary = await loadGoogleMapsMarkerLibrary(maps);
  const advancedMarkersAvailable = Boolean(homeMapId && markerLibrary?.AdvancedMarkerElement);
  const createHomeMarker = ({ position, title, glyphText, color, borderColor, glyphColor, scale, zIndex, onClick }) => {
    if (advancedMarkersAvailable) {
      const marker = new markerLibrary.AdvancedMarkerElement({
        map: routeMap,
        position,
        title,
        zIndex,
        content: buildAdvancedPinContent({
          background: color,
          borderColor,
          glyphColor,
          glyphText,
          scale
        })
      });
      if (typeof onClick === "function") {
        marker.addListener("click", onClick);
      }
      return marker;
    }

    const marker = new maps.Marker({
      map: routeMap,
      position,
      title,
      label: glyphText
        ? {
            text: String(glyphText),
            color: glyphColor || "#fffaf5",
            fontWeight: "700"
          }
        : undefined,
      icon: buildMapPinIcon(maps, color, {
        strokeColor: borderColor,
        scale: (Number(scale) || 1) * 1.45
      }),
      zIndex
    });
    if (typeof onClick === "function") {
      marker.addListener("click", onClick);
    }
    return marker;
  };

  routeMap = new maps.Map(mapElement, {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: "cooperative",
    clickableIcons: false,
    ...(normalizeRoutePreviewVariant(state.narrationVariant) === "drive"
      ? { mapTypeId: "hybrid" }
      : advancedMarkersAvailable
        ? { mapTypeId: "roadmap", mapId: homeMapId }
        : { styles: buildGoogleShellMapStyles(), mapTypeId: "roadmap" }),
    backgroundColor: "#141b2d",
    center: { lat: 39.9526, lng: -75.1652 },
    zoom: 12
  });

  routeMapLayers = [];
  const focusedTour = state.home.focusTourId ? getTourById(state.home.focusTourId) : null;
  const focusedRenderableStops = focusedTour ? getRenderableStops(focusedTour.stops) : [];
  const bounds = new maps.LatLngBounds();
  const collectionCenter = { lat: 39.9526, lng: -75.1652 };

  if (focusedTour) {
    const accent = getTourAccent(tours.findIndex((tour) => tour.id === focusedTour.id));
    const selectedStopId = state.selectedStopId;

    focusedRenderableStops.forEach((stop) => {
      const isSelected = stop.id === selectedStopId;
      const marker = createHomeMarker({
        position: { lat: stop.lat, lng: stop.lng },
        title: `${stop.originalIndex + 1}. ${stop.title}`,
        glyphText: String(stop.originalIndex + 1),
        color: isSelected ? accent?.[1] || "#f1d1b2" : accent?.[0] || "#b45b3d",
        borderColor: isSelected ? accent?.[0] || "#b45b3d" : "#fffaf5",
        glyphColor: isSelected ? "#6b3b2f" : "#fffaf5",
        scale: isSelected ? 1.14 : 0.98,
        zIndex: isSelected ? 1000 : 400 + stop.originalIndex,
        onClick: () => {
          state.map.followNearestStop = false;
          openTourPageForStop(focusedTour, stop.id);
        }
      });
      routeMapLayers.push(marker);
      bounds.extend({ lat: stop.lat, lng: stop.lng });
    });
  } else {
    tours.forEach((tour, index) => {
      const leadStop = getPrimaryRenderableStop(tour);
      if (!leadStop) {
        return;
      }

      const accent = getTourAccent(index);

      const focusTour = (stopId = leadStop.id) => {
        state.activeTab = "home";
        state.routePageTourId = null;
        state.home.focusTourId = tour.id;
        state.selectedTourId = tour.id;
        state.selectedStopId = stopId ?? leadStop.id ?? state.selectedStopId;
        render();
      };

      const marker = createHomeMarker({
        position: { lat: leadStop.lat, lng: leadStop.lng },
        title: tour.title,
        glyphText: String(index + 1),
        color: accent?.[0] || "#5c45ff",
        borderColor: "#fffaf5",
        glyphColor: "#fffaf5",
        scale: 1,
        zIndex: 300 + index,
        onClick: () => {
          focusTour();
        }
      });
      routeMapLayers.push(marker);
      bounds.extend({ lat: leadStop.lat, lng: leadStop.lng });
    });
  }

  if (!bounds.isEmpty()) {
    routeMap.fitBounds(bounds, focusedTour ? 52 : 84);
  } else {
    routeMap.setCenter(collectionCenter);
    routeMap.setZoom(12);
  }

  installMapViewportStabilizer({
    map: routeMap,
    maps,
    mapElement,
    restoreView: () => {
      if (!bounds.isEmpty()) {
        routeMap.fitBounds(bounds, focusedTour ? 52 : 84);
        return;
      }

      routeMap.setCenter(collectionCenter);
      routeMap.setZoom(12);
    }
  });

  installGoogleMapHealthFallback({
    mapElement,
    fallbackPosition: focusedRenderableStops.find((stop) => stop.id === state.selectedStopId)
      ? {
          lat: focusedRenderableStops.find((stop) => stop.id === state.selectedStopId).lat,
          lng: focusedRenderableStops.find((stop) => stop.id === state.selectedStopId).lng
        }
      : focusedRenderableStops[0]
        ? { lat: focusedRenderableStops[0].lat, lng: focusedRenderableStops[0].lng }
        : collectionCenter,
    title: focusedTour ? focusedTour.title : "Philly Tours",
    zoom: focusedTour ? 14 : 12,
    maps,
    map: routeMap
  });
}

function buildRoutePath(stops) {
  return stops.map((stop, index) => `${index === 0 ? "M" : "L"} ${stop.x} ${stop.y}`).join(" ");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
