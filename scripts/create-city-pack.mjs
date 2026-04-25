import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    result[key] = value;
    index += 1;
  }
  return result;
}

function titleCase(value) {
  return String(value)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}

const args = parseArgs(process.argv.slice(2));
const cityId = String(args.id || "").trim().toLowerCase();

if (!cityId) {
  console.error("Usage: npm run city:create -- --id <city-id> --city <City Name> --state <ST> [--lat <num> --lng <num> --website <url>]");
  process.exit(1);
}

const cityName = String(args.city || titleCase(cityId)).trim();
const stateCode = String(args.state || "XX").trim().toUpperCase();
const shortName = String(args.shortName || cityName.split(/\s+/)[0] || cityName).trim();
const slug = String(args.slug || `${cityId}-tours`).trim().toLowerCase();
const websiteOrigin = String(args.website || `https://${slug}.com`).trim();
const timezone = String(args.timezone || "America/New_York").trim();
const lat = Number(args.lat ?? 0);
const lng = Number(args.lng ?? 0);
const zoom = Number(args.zoom ?? 12);
const starterTourId = `${cityId}-starter-route`;
const starterStopId = `${starterTourId}-starter-stop`;

const cityDir = path.join(repoRoot, "cities", cityId);

if (fs.existsSync(cityDir)) {
  console.error(`City pack already exists: cities/${cityId}`);
  process.exit(1);
}

fs.mkdirSync(cityDir, { recursive: true });

const files = {
  "city.json": {
    id: cityId,
    name: `${cityName} Tours`,
    shortName,
    cityName,
    stateCode,
    countryCode: "US",
    timezone,
    slug,
    websiteOrigin,
    serviceArea: [`${cityName}, ${stateCode}`],
    defaultMapCenter: { lat, lng, zoom },
    defaultTourId: starterTourId,
    launchStatus: "scaffold"
  },
  "branding.json": {
    primary: "#f7c02a",
    secondary: "#353432",
    kellyGreen: "#007a33",
    cityBlue: "#002d72",
    ink: "#15100a",
    paper: "#fff9df",
    heroEyebrow: `${cityName} is ready`,
    heroTitle: `Walk ${cityName} with the story behind the block.`,
    heroBody: `Build the ${cityName} launch pack with route copy, narration, and local history that feels true to the city.`
  },
  "seo.json": {
    homeTitle: `${cityName} Tours | Self-Guided Audio & AR Walking Tours`,
    homeDescription: `Explore ${cityName} with self-guided walking tours, map guidance, narration, and AR-ready stops.`,
    catalogTitle: `${cityName} Walking Tours | ${cityName} Tours`,
    catalogDescription: `Browse self-guided ${cityName} routes built for story, place, and neighborhood depth.`,
    homePanelEyebrow: `${stateCode} city pack`,
    homePanelTitle: `Plan the ${cityName} launch routes.`,
    homePanelBody: `Start with a signature route, validate the stops, and layer in narration, AR, and search assets.`,
    searchImage: `/assets/search/${slug}-search-thumbnail.jpg`,
    organizationType: ["Organization", "TravelAgency"],
    knowsAbout: [`${cityName} walking tours`, `${cityName} audio tours`, `${cityName} history tours`],
    homePanelHighlights: ["City launch in progress", "Signature route draft", "Narration-ready stops"]
  },
  "social.json": {
    sameAs: []
  },
  "business-profile.json": {
    businessName: `${cityName} Tours`,
    website: websiteOrigin,
    primaryCategory: "Tour operator",
    shortDescription: `Self-guided ${cityName} tours with maps, narration, and neighborhood story routes.`,
    fullDescription: `${cityName} Tours is the city-pack workspace for self-guided routes, story-rich landmarks, and mobile-first visitor exploration.`
  },
  "tours.json": [
    {
      id: starterTourId,
      title: `${cityName} Starter Route`,
      theme: "starter",
      durationMin: 45,
      distanceMiles: 1.5,
      summary: `Starter route for the ${cityName} city pack.`,
      cardMedia: {
        type: "image",
        src: `/assets/generated/tour-heroes/${starterTourId}-hero.avif`
      },
      stops: [
        {
          id: starterStopId,
          title: `${cityName} Starter Stop`,
          description: `Replace this stop with a real landmark as the city pack takes shape.`,
          lat,
          lng
        }
      ]
    }
  ],
  "narration.json": {
    catalogByStopId: {
      [starterStopId]: {
        drive: `/audio/${starterStopId}-drive.mp3`,
        walk: `/audio/${starterStopId}-walk.mp3`
      }
    },
    scriptMapByStopId: {
      [starterStopId]: {
        drive: `Approaching the starter stop for ${cityName}. Replace this line with route-specific narration.`,
        walk: `You have arrived at the starter stop for ${cityName}. Replace this line with grounded local history.`
      }
    }
  },
  "ar.json": {
    [starterStopId]: {
      id: starterStopId,
      title: `${cityName} Starter Stop`,
      arType: "story-card",
      estimatedEffort: "medium",
      webModelAvailable: false,
      iosModelAvailable: false
    }
  }
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(cityDir, filename), `${JSON.stringify(content, null, 2)}\n`);
}

fs.writeFileSync(
  path.join(cityDir, "README.md"),
  [
    `# ${cityName} City Pack`,
    "",
    "This city pack was scaffolded from the multi-city platform.",
    "",
    "Next steps:",
    "- replace the starter route with a real route lineup",
    "- validate map center and service area",
    "- add local branding and search assets",
    "- flesh out narration and AR stop metadata",
    ""
  ].join("\n")
);

spawnSync(process.execPath, [path.join(repoRoot, "scripts", "generate-city-runtime-registry.mjs")], {
  cwd: repoRoot,
  stdio: "inherit"
});

console.log(`Created city pack scaffold at cities/${cityId}`);
