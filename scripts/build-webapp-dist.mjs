import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const webappDir = path.join(repoRoot, "webapp");
const assetsDir = path.join(repoRoot, "assets");
const outputDir = path.join(repoRoot, "web-dist");
const assetVersion = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) {
      process.env[key] = value;
    }
  }
}

function copyFilter(source) {
  return path.basename(source) !== ".DS_Store";
}

loadDotEnvFile(path.join(repoRoot, "server.local.env"));
loadDotEnvFile(path.join(repoRoot, ".env.server.local"));
loadDotEnvFile(path.join(repoRoot, ".env.server"));
loadDotEnvFile(path.join(repoRoot, ".env.production.local"));
loadDotEnvFile(path.join(repoRoot, ".env.web.local"));
loadDotEnvFile(path.join(repoRoot, ".env.local"));
loadDotEnvFile(path.join(repoRoot, ".env"));

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

fs.cpSync(webappDir, outputDir, { recursive: true, filter: copyFilter });
fs.cpSync(assetsDir, path.join(outputDir, "assets"), { recursive: true, filter: copyFilter });

const siteConfig = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  newsletterTable: "newsletter_subscribers",
  syncServerUrl:
    process.env.EXPO_PUBLIC_WEB_SYNC_SERVER_URL ||
    process.env.EXPO_PUBLIC_SYNC_SERVER_URL ||
    "https://api.philly-tours.com",
  cloudflareTurnstileSiteKey: process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "",
  webMapsEnabled: process.env.EXPO_PUBLIC_WEB_MAPS_ENABLED || "true",
  googleMapsProjectUrl: process.env.EXPO_PUBLIC_GOOGLE_MAPS_EMBED_URL || "",
  googleMapsJsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY || "",
  googleMapsMapId: process.env.EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID || "",
  inPersonTourGuideRateCentsPerMinute: process.env.EXPO_PUBLIC_IN_PERSON_TOUR_GUIDE_RATE_CENTS_PER_MINUTE || "125",
  inPersonTourGuidePriceCents: process.env.EXPO_PUBLIC_IN_PERSON_TOUR_GUIDE_PRICE_CENTS || "",
  inPersonTourGuideLabel: process.env.EXPO_PUBLIC_IN_PERSON_TOUR_GUIDE_LABEL || "In-person guided tour",
  iosAppStoreUrl: process.env.EXPO_PUBLIC_IOS_APP_STORE_URL || "",
  androidPlayStoreUrl: process.env.EXPO_PUBLIC_ANDROID_PLAY_STORE_URL || "",
  city: {
    id: "philly",
    name: "Philly Tours",
    shortName: "Philly",
    cityName: "Philadelphia",
    stateCode: "PA",
    countryCode: "US",
    timezone: "America/New_York",
    slug: "philly-tours",
    websiteOrigin: "https://philly-tours.com",
    serviceArea: ["Philadelphia, PA"],
    defaultMapCenter: {
      lat: 39.9526,
      lng: -75.1652,
      zoom: 12
    },
    defaultTourId: "black-american-legacy-and-quaker-heritage"
  },
  branding: {
    primary: "#f7c02a",
    secondary: "#353432",
    kellyGreen: "#007a33",
    cityBlue: "#002d72",
    ink: "#15100a",
    paper: "#fff9df",
    heroEyebrow: "Philly is ready",
    heroTitle: "Big city stories. Your route, your pace.",
    heroBody: "Choose a Philadelphia route, follow the Compass, hear the story, and open AR moments when the street is ready for you.",
    homeSeoPanelEyebrow: "Philadelphia walking tours",
    homeSeoPanelTitle: "Walk Philly with the story behind the block."
  },
  seo: {
    homeTitle: "Philly Tours | Self-Guided Philadelphia Audio & AR Walking Tours",
    homeDescription: "Walk Philadelphia with self-guided audio tours, maps, Compass guidance, AR-ready stops, Black history, architecture, sports, and hidden routes.",
    catalogTitle: "Philadelphia Walking Tours | Philly Tours",
    catalogDescription: "Browse self-guided Philadelphia walking tours with audio narration, maps, Compass guidance, and AR-ready story stops.",
    homePanelEyebrow: "Philadelphia walking tours",
    homePanelTitle: "Walk Philly with the story behind the block.",
    homePanelBody:
      "Philly Tours is a self-guided Philadelphia tour companion for visitors, families, locals, students, and culture lovers who want more than a generic sightseeing loop. Choose a route, follow the map, hear narration, use Compass guidance, and discover AR-ready story stops across Black history, architecture, sports, libraries, neighborhoods, and hidden city routes.",
    homePanelHighlights: [
      "Self-guided audio tours",
      "Black history routes",
      "Compass walking guidance",
      "AR-ready stops",
      "Philadelphia neighborhoods"
    ],
    organizationType: ["Organization", "TravelAgency"],
    searchImage: "/assets/search/philly-tours-search-thumbnail.jpg",
    knowsAbout: [
      "Philadelphia walking tours",
      "Philadelphia audio tours",
      "Black history tours in Philadelphia",
      "Philadelphia architecture tours",
      "self-guided city tours",
      "AR-guided walking tours"
    ]
  },
  social: {
    sameAs: ["https://philly-tours.com/"],
    channels: []
  },
  businessProfile: {
    businessName: "Philly Tours",
    website: "https://philly-tours.com",
    serviceArea: "Philadelphia, PA",
    primaryCategory: "Tour agency",
    secondaryCategories: ["Sightseeing tour agency", "Tour operator", "Tourist attraction"],
    shortDescription:
      "Self-guided Philadelphia walking tours with audio, maps, Compass guidance, AR-ready stops, and hidden city stories.",
    fullDescription:
      "Philly Tours helps visitors, locals, families, students, and culture lovers walk Philadelphia with more context. Choose a self-guided route, follow the map, hear audio narration, use Compass guidance, and discover AR-ready story stops across Black history, architecture, sports, libraries, neighborhoods, and hidden city routes."
  }
};
const configBanner = [
  "// Auto-generated by scripts/build-webapp-dist.mjs",
  "// Source: deploy-time browser-safe values",
  `window.PHILLY_TOURS_CONFIG = ${JSON.stringify(siteConfig, null, 2)};`,
  ""
].join("\n");
fs.writeFileSync(path.join(outputDir, "site-config.js"), configBanner);
fs.writeFileSync(
  path.join(outputDir, "runtime-config.js"),
  ["// Auto-generated by scripts/build-webapp-dist.mjs", "window.PHILLY_TOURS_RUNTIME_CONFIG = {};", ""].join("\n")
);

for (const entry of fs.readdirSync(outputDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".html")) {
    continue;
  }
  const htmlPath = path.join(outputDir, entry.name);
  const copiedHtml = fs.readFileSync(htmlPath, "utf8");
  const stampedHtml = copiedHtml.replace(/\?v=\d{8}[a-z0-9-]*/gi, `?v=${assetVersion}`);
  fs.writeFileSync(htmlPath, stampedHtml);
}

console.log(`Built deployable web-dist directory with asset version ${assetVersion}`);
