import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const webappDir = path.join(repoRoot, "webapp");
const assetsDir = path.join(repoRoot, "assets");
const outputDir = path.join(repoRoot, "web-dist");
const assetVersion = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
const siteOrigin = "https://philly-tours.com";
const siteLogoPath = "/assets/brand/site-icon-512.png";
const defaultSearchImagePath = "/assets/search/philly-tours-search-thumbnail.jpg";

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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseStopMetadata(description) {
  const parts = String(description || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  const fullAddress =
    parts
      .find((part) => /^location:/i.test(part))
      ?.replace(/^location:\s*/i, "")
      .trim() ?? "";
  const locationLabel = fullAddress
    .replace(/,\s*philadelphia,\s*pa(?:\s*\d{5})?$/i, "")
    .replace(/,\s*pa(?:\s*\d{5})?$/i, "")
    .trim();
  const summary =
    parts.find((part) => !/^day:|^time:|^location:/i.test(part)) ||
    "Philadelphia story stop";

  return { fullAddress, locationLabel, summary };
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
  if (source.includes("speakeasy")) return "Nightlife";
  return "History";
}

function deriveNeighborhood(stops) {
  const first = parseStopMetadata(stops[0]?.description).locationLabel;
  const last = parseStopMetadata(stops[stops.length - 1]?.description).locationLabel;
  if (first && last && first !== last) {
    return `${first} to ${last}`;
  }
  return first || last || "Philadelphia";
}

function deriveSummary(tour) {
  const stops = tour.stops || [];
  const leadStops = stops.slice(0, 2).map((stop) => stop.title).filter(Boolean);
  const opener = leadStops.length
    ? `${leadStops.join(" and ")} anchor this route.`
    : "A story-led Philadelphia route.";
  return `${opener} ${stops.length} stops across ${tour.distanceMiles} miles with maps, narration, Compass guidance, and AR-ready context.`;
}

function truncateMeta(value, maxLength = 156) {
  const compact = String(value || "").replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }
  const clipped = compact.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const safeClip = lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped;
  return `${safeClip.replace(/[.,;:!?-]+$/g, "").trimEnd()}…`;
}

function loadToursFromOutput() {
  const toursDataPath = path.join(outputDir, "tours-data.js");
  if (!fs.existsSync(toursDataPath)) {
    return [];
  }
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(toursDataPath, "utf8"), context);
  return Array.isArray(context.window.PHILLY_TOURS_DATA) ? context.window.PHILLY_TOURS_DATA : [];
}

function absoluteUrl(pathname) {
  return `${siteOrigin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function renderHead({ title, description, canonicalPath, imagePath, type = "website" }) {
  const canonicalUrl = absoluteUrl(canonicalPath);
  const imageUrl = absoluteUrl(imagePath || defaultSearchImagePath);
  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#07070d" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="48x48" href="/assets/brand/favicon-48x48.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/assets/brand/favicon-96x96.png" />
    <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:alt" content="${escapeHtml(`${title} image`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(`${title} image`)}" />
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
  `;
}

function renderTourPage(tour, allTours) {
  const stops = tour.stops || [];
  const theme = deriveTheme(tour.title, tour.id);
  const neighborhood = deriveNeighborhood(stops);
  const summary = deriveSummary(tour);
  const title = `${tour.title} Tour in Philadelphia | Philly Tours`;
  const description = truncateMeta(
    `${tour.title}: ${stops.length} Philadelphia stops across ${tour.distanceMiles} miles with maps, audio narration, Compass guidance, and AR-ready route context.`
  );
  const canonicalPath = `/tours/${tour.id}/`;
  const imagePath = tour.cardMedia?.src || "";
  const stopList = stops
    .map((stop, index) => {
      const meta = parseStopMetadata(stop.description);
      return `
            <li>
              <span>${index + 1}</span>
              <div>
                <strong>${escapeHtml(stop.title)}</strong>
                <p>${escapeHtml(meta.summary)}${meta.fullAddress ? ` · ${escapeHtml(meta.fullAddress)}` : ""}</p>
              </div>
            </li>`;
    })
    .join("");
  const otherTours = allTours
    .filter((candidate) => candidate.id !== tour.id)
    .slice(0, 8)
    .map((candidate) => `<a href="/tours/${escapeHtml(candidate.id)}/">${escapeHtml(candidate.title)}</a>`)
    .join("");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: `${tour.title} Tour`,
    description,
    url: absoluteUrl(canonicalPath),
    image: imagePath ? absoluteUrl(imagePath) : undefined,
    touristType: ["Visitors", "Philadelphia explorers", "History travelers"],
    itinerary: {
      "@type": "ItemList",
      numberOfItems: stops.length,
      itemListElement: stops.map((stop, index) => {
        const meta = parseStopMetadata(stop.description);
        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "TouristAttraction",
            name: stop.title,
            description: meta.summary,
            address: meta.fullAddress || undefined,
            geo:
              typeof stop.lat === "number" && typeof stop.lng === "number"
                ? {
                    "@type": "GeoCoordinates",
                    latitude: stop.lat,
                    longitude: stop.lng
                  }
                : undefined
          }
        };
      })
    },
    provider: {
      "@type": "Organization",
      name: "Philly Tours",
      url: siteOrigin,
      logo: absoluteUrl(siteLogoPath),
      image: absoluteUrl(defaultSearchImagePath)
    }
  };

  return `<!doctype html>
<html lang="en">
  <head>
${renderHead({ title, description, canonicalPath, imagePath })}
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <style>
      :root {
        --ink: #15100a;
        --muted: #605d55;
        --yellow: #f7c02a;
        --green: #007a33;
        --blue: #002d72;
        --gray: #353432;
      }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body {
        margin: 0;
        color: var(--ink);
        background: #111025;
        font-family: "Plus Jakarta Sans", system-ui, sans-serif;
      }
      a { color: inherit; }
      .shell { width: min(1120px, calc(100vw - 28px)); margin: 0 auto; padding: 28px 0 72px; }
      .back {
        display: inline-flex;
        margin-bottom: 18px;
        border: 2px solid var(--ink);
        border-radius: 999px;
        padding: 10px 14px;
        background: #fff9df;
        font-weight: 900;
        text-decoration: none;
      }
      .hero {
        display: grid;
        grid-template-columns: minmax(0, 0.95fr) minmax(320px, 0.8fr);
        gap: 28px;
        min-height: 560px;
        border-radius: 30px;
        overflow: hidden;
        background: linear-gradient(90deg, var(--yellow) 0 48%, var(--gray) 48% 100%);
        box-shadow: 0 34px 80px rgba(0, 0, 0, 0.28);
      }
      .hero-copy { padding: 48px; align-self: center; }
      .eyebrow {
        display: inline-flex;
        border: 2px solid var(--ink);
        border-radius: 999px;
        padding: 8px 11px;
        background: rgba(255, 255, 255, 0.82);
        font-size: 0.76rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      h1 {
        max-width: 10ch;
        margin: 22px 0 18px;
        font-size: clamp(3.2rem, 8vw, 6.4rem);
        font-weight: 900;
        line-height: 0.9;
        text-transform: uppercase;
      }
      .hero-copy p { max-width: 44ch; color: rgba(21, 16, 10, 0.82); font-size: 1.08rem; font-weight: 800; line-height: 1.5; }
      .stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
      .stats span {
        border: 2px solid var(--ink);
        border-radius: 999px;
        padding: 8px 10px;
        background: #fff;
        font-weight: 900;
      }
      .hero-media { align-self: center; padding: 42px 42px 42px 0; }
      .hero-media img {
        width: 100%;
        min-height: 360px;
        max-height: 470px;
        object-fit: cover;
        display: block;
        border: 8px solid #fff9df;
        border-radius: 10px;
        box-shadow: 14px 14px 0 var(--ink);
      }
      .section {
        margin-top: 22px;
        border-radius: 24px;
        background: #fffdf4;
        padding: 26px;
      }
      .section h2 {
        margin: 0 0 14px;
        font-size: clamp(2rem, 4vw, 3.6rem);
        line-height: 0.95;
        text-transform: uppercase;
      }
      .stops { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
      .stops li {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr);
        gap: 12px;
        border: 2px solid rgba(21, 16, 10, 0.12);
        border-radius: 16px;
        padding: 14px;
      }
      .stops li > span {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: 999px;
        background: var(--green);
        color: #fff;
        font-weight: 900;
      }
      .stops strong { display: block; margin-bottom: 4px; }
      .stops p { margin: 0; color: var(--muted); line-height: 1.45; }
      .related { display: flex; flex-wrap: wrap; gap: 10px; }
      .related a {
        border: 2px solid var(--ink);
        border-radius: 999px;
        padding: 8px 10px;
        background: #fff;
        font-weight: 900;
        text-decoration: none;
      }
      .cta {
        display: inline-flex;
        margin-top: 18px;
        border: 2px solid var(--ink);
        border-radius: 10px;
        padding: 13px 16px;
        background: var(--green);
        color: #fff;
        box-shadow: 0 5px 0 var(--ink);
        font-weight: 900;
        text-decoration: none;
      }
      @media (max-width: 820px) {
        .hero { grid-template-columns: 1fr; background: var(--yellow); }
        .hero-copy { padding: 28px 22px 0; }
        .hero-media { padding: 0 22px 28px; }
        .hero-media img { min-height: 250px; box-shadow: 7px 7px 0 var(--ink); }
        h1 { font-size: clamp(2.55rem, 13vw, 4rem); }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <a class="back" href="/">Back to all Philly tours</a>
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">${escapeHtml(theme)} route</span>
          <h1>${escapeHtml(tour.title)}</h1>
          <p>${escapeHtml(summary)}</p>
          <div class="stats">
            <span>${escapeHtml(tour.durationMin)} min</span>
            <span>${escapeHtml(tour.distanceMiles)} mi</span>
            <span>${stops.length} stops</span>
            <span>${escapeHtml(neighborhood)}</span>
          </div>
          <a class="cta" href="/#tab=map&tour=${encodeURIComponent(tour.id)}">Open this route in the Compass</a>
        </div>
        <div class="hero-media">
          ${
            imagePath
              ? `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(tour.cardMedia?.alt || `${tour.title} tour image`)}" loading="eager" />`
              : ""
          }
        </div>
      </section>

      <section class="section">
        <span class="eyebrow">Route overview</span>
        <h2>Stops on this tour</h2>
        <ol class="stops">
${stopList}
        </ol>
      </section>

      <section class="section">
        <span class="eyebrow">More Philadelphia routes</span>
        <h2>Keep exploring</h2>
        <div class="related">${otherTours}</div>
      </section>
    </main>
  </body>
</html>
`;
}

function renderToursIndexPage(tours) {
  const title = "Philadelphia Tour Catalog | Philly Tours";
  const description = "Browse self-guided Philadelphia walking tours with maps, audio narration, Compass guidance, and AR-ready story stops.";
  const cards = tours
    .map((tour) => {
      const stops = tour.stops || [];
      const summary = deriveSummary(tour);
      return `
        <article class="tour-card">
          ${
            tour.cardMedia?.src
              ? `<img src="${escapeHtml(tour.cardMedia.src)}" alt="${escapeHtml(tour.cardMedia.alt || `${tour.title} tour image`)}" loading="lazy" />`
              : ""
          }
          <div>
            <span>${escapeHtml(deriveTheme(tour.title, tour.id))}</span>
            <h2><a href="/tours/${escapeHtml(tour.id)}/">${escapeHtml(tour.title)}</a></h2>
            <p>${escapeHtml(summary)}</p>
            <strong>${tour.durationMin} min · ${tour.distanceMiles} mi · ${stops.length} stops</strong>
          </div>
        </article>`;
    })
    .join("");
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Philadelphia tour catalog",
    image: absoluteUrl(defaultSearchImagePath),
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/tours/${tour.id}/`),
      name: tour.title
    }))
  };

  return `<!doctype html>
<html lang="en">
  <head>
${renderHead({
  title,
  description,
  canonicalPath: "/tours/",
  imagePath: "/assets/generated/tour-heroes/black-american-legacy-and-quaker-heritage-hero.jpeg"
})}
    <script type="application/ld+json">${JSON.stringify(itemList)}</script>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #111025;
        color: #15100a;
        font-family: "Plus Jakarta Sans", system-ui, sans-serif;
      }
      .shell { width: min(1160px, calc(100vw - 28px)); margin: 0 auto; padding: 30px 0 72px; }
      .back {
        display: inline-flex;
        margin-bottom: 18px;
        border: 2px solid #15100a;
        border-radius: 999px;
        padding: 10px 14px;
        background: #fff9df;
        font-weight: 900;
        text-decoration: none;
      }
      .hero {
        border-radius: 30px;
        padding: 44px;
        background: linear-gradient(90deg, #f7c02a 0 52%, #353432 52% 100%);
        box-shadow: 0 34px 80px rgba(0, 0, 0, 0.28);
      }
      .eyebrow {
        display: inline-flex;
        border: 2px solid #15100a;
        border-radius: 999px;
        padding: 8px 11px;
        background: rgba(255, 255, 255, 0.82);
        font-size: 0.76rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      h1 {
        max-width: 10ch;
        margin: 22px 0 18px;
        font-size: clamp(3.2rem, 8vw, 6.4rem);
        font-weight: 900;
        line-height: 0.9;
        text-transform: uppercase;
      }
      .hero p { max-width: 44ch; margin: 0; font-size: 1.08rem; font-weight: 800; line-height: 1.5; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 22px; }
      .tour-card {
        overflow: hidden;
        border: 3px solid #15100a;
        border-radius: 8px;
        background: #fff9df;
        box-shadow: 8px 8px 0 #15100a;
      }
      .tour-card img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; }
      .tour-card div { padding: 16px; }
      .tour-card span {
        display: inline-flex;
        margin-bottom: 8px;
        border: 2px solid #15100a;
        border-radius: 999px;
        padding: 6px 8px;
        background: #f7c02a;
        font-size: 0.72rem;
        font-weight: 900;
        text-transform: uppercase;
      }
      .tour-card h2 { margin: 0 0 8px; font-size: 1.4rem; line-height: 1.02; }
      .tour-card a { color: inherit; text-decoration: none; }
      .tour-card p { color: #4f473b; font-weight: 750; line-height: 1.45; }
      .tour-card strong { display: block; margin-top: 12px; }
      @media (max-width: 900px) {
        .hero { background: #f7c02a; padding: 28px 22px; }
        .grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <a class="back" href="/">Back to Philly Tours</a>
      <section class="hero">
        <span class="eyebrow">Tour catalog</span>
        <h1>Pick a Philadelphia story.</h1>
        <p>${escapeHtml(description)}</p>
      </section>
      <section class="grid" aria-label="Philadelphia tours">
${cards}
      </section>
    </main>
  </body>
</html>
`;
}

function writeSeoFiles() {
  const tours = loadToursFromOutput();
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: "/", priority: "1.0" },
    { loc: "/tours/", priority: "0.9" },
    { loc: "/privacy", priority: "0.3" },
    { loc: "/support", priority: "0.4" },
    { loc: "/rss.xml", priority: "0.2" }
  ];

  for (const tour of tours) {
    const tourDir = path.join(outputDir, "tours", tour.id);
    fs.mkdirSync(tourDir, { recursive: true });
    fs.writeFileSync(path.join(tourDir, "index.html"), renderTourPage(tour, tours));
    urls.push({ loc: `/tours/${tour.id}/`, priority: "0.8" });
  }

  const toursIndexDir = path.join(outputDir, "tours");
  fs.mkdirSync(toursIndexDir, { recursive: true });
  fs.writeFileSync(path.join(toursIndexDir, "index.html"), renderToursIndexPage(tours));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority }) => `  <url>
    <loc>${escapeXml(absoluteUrl(loc))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${loc.startsWith("/tours/") ? "weekly" : "monthly"}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(outputDir, "sitemap.xml"), sitemap);
  fs.writeFileSync(
    path.join(outputDir, "robots.txt"),
    ["User-agent: *", "Allow: /", "", `Sitemap: ${absoluteUrl("/sitemap.xml")}`, ""].join("\n")
  );
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
  syncServerUrl: process.env.EXPO_PUBLIC_WEB_SYNC_SERVER_URL || process.env.EXPO_PUBLIC_SYNC_SERVER_URL || "",
  cloudflareTurnstileSiteKey: process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "",
  googleMapsProjectUrl: process.env.EXPO_PUBLIC_GOOGLE_MAPS_EMBED_URL || "",
  googleMapsJsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY || "",
  googleMapsMapId: process.env.EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID || "",
  inPersonTourGuidePriceCents: process.env.EXPO_PUBLIC_IN_PERSON_TOUR_GUIDE_PRICE_CENTS || "",
  inPersonTourGuideLabel: process.env.EXPO_PUBLIC_IN_PERSON_TOUR_GUIDE_LABEL || "In-person tour guide",
  iosAppStoreUrl: process.env.EXPO_PUBLIC_IOS_APP_STORE_URL || "",
  androidPlayStoreUrl: process.env.EXPO_PUBLIC_ANDROID_PLAY_STORE_URL || ""
};
const configBanner = [
  "// Auto-generated by scripts/build-webapp-dist.mjs",
  "// Source: deploy-time browser-safe values",
  `window.PHILLY_TOURS_CONFIG = ${JSON.stringify(siteConfig, null, 2)};`,
  ""
].join("\n");
fs.writeFileSync(path.join(outputDir, "site-config.js"), configBanner);
writeSeoFiles();

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
