import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const storeDir = path.join(repoRoot, "assets", "store");
const outputRoot = path.join(storeDir, "framed");

const magickCandidates = [
  process.env.MAGICK_BIN,
  "/opt/homebrew/bin/magick",
  "/usr/local/bin/magick",
  "/usr/bin/magick"
].filter(Boolean);

const magickBin = magickCandidates.find((candidate) => fs.existsSync(candidate));

if (!magickBin) {
  throw new Error("Could not find ImageMagick. Install it with `brew install imagemagick` or set MAGICK_BIN.");
}

const fontRegular = "/System/Library/Fonts/Supplemental/Arial.ttf";
const fontBold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";
const fontBlack = "/System/Library/Fonts/Supplemental/Arial Black.ttf";

const sets = [
  {
    id: "ios",
    name: "iPhone",
    size: [1320, 2868],
    deviceLabel: "iPhone",
    screenshotWidth: 885,
    topOffset: 760,
    headlineSize: 70,
    copySize: 32,
    entries: [
      ["01-home", "core-01-home.png", "Philadelphia history, built for your phone", "Guided city stories, weather, tour packs, and one clear place to begin."],
      ["02-ar", "core-02-ar.png", "Step from story mode into native AR", "Use the phone as the route controller, then hand off to AR when the stop is ready."],
      ["03-board", "core-03-board.png", "Build your Founders Board as you explore", "Every stop adds progress, streaks, and a visible sense of discovery."],
      ["04-compass", "core-05-compass.png", "Follow the Founders Compass", "Turn toward the next point and let the city open outward from North Broad."],
      ["05-settings", "core-04-settings.png", "Choose your tour and unlock the full experience", "Membership, profile, companion setup, and comfort controls stay in one place."]
    ]
  },
  {
    id: "ipad",
    name: "iPad",
    size: [2064, 2752],
    deviceLabel: "iPad",
    screenshotWidth: 1580,
    topOffset: 555,
    headlineSize: 68,
    copySize: 34,
    entries: [
      ["01-home", "core-01-home.png", "A cinematic Philadelphia tour guide", "Preview routes, featured stops, weather, and your next place to explore."],
      ["02-ar", "core-02-ar.png", "Route playback, narration, and AR handoff", "A larger companion view for planning the story before you step outside."],
      ["03-board", "core-03-board.png", "A city board that grows with every stop", "See the route, progress, and rewards in a spacious tablet layout."],
      ["04-compass", "core-05-compass.png", "Compass-led touring with a bigger view", "Use the iPad to see the path, collection cards, and next compass point."],
      ["05-settings", "core-04-settings.png", "Personalize the experience before you go", "Set appearance, membership, companion mode, and comfort preferences."]
    ]
  },
  {
    id: "android",
    name: "Android",
    size: [1080, 2640],
    deviceLabel: "Android",
    screenshotWidth: 720,
    topOffset: 740,
    headlineSize: 54,
    copySize: 27,
    entries: [
      ["01-home", "core-01-home.png", "Explore Philadelphia through guided story routes", "Browse tour packs, open featured stops, and continue at your own pace."],
      ["02-ar", "core-02-ar.png", "Android companion mode for route playback", "Keep narration, stop context, and route state ready while you move."],
      ["03-board", "core-03-board.png", "Earn progress as the city opens up", "Scores, streaks, badges, and rewards make each stop feel alive."],
      ["04-compass", "core-05-compass.png", "Turn toward the next compass point", "The live compass keeps the phone and glasses path focused on the story."],
      ["05-settings", "core-04-settings.png", "Connect your tour profile and membership", "Manage access, app comfort, companion mode, and support from one screen."]
    ]
  },
  {
    id: "web",
    name: "Web",
    size: [1290, 2796],
    deviceLabel: "Web companion",
    screenshotWidth: 900,
    topOffset: 775,
    headlineSize: 62,
    copySize: 30,
    entries: [
      ["01-home", "01-home.png", "Preview Philly Tours from any browser", "Use the web companion to browse routes, stories, maps, and tour packs."],
      ["02-compass", "02-compass.png", "See the compass path before you go", "Plan the route and understand how the story opens across the city."],
      ["03-board", "03-board.png", "Track tour progress from the web companion", "Your board gives each route a clear sense of movement and completion."],
      ["04-ar", "04-ar.png", "Download the native app for real AR projection", "The web is the companion. The native app is the full AR experience."],
      ["05-settings", "05-settings.png", "Manage your tour access and handoff", "Keep account links, app downloads, and tour handoff details close."]
    ]
  }
];

function pngSize(filePath) {
  const data = fs.readFileSync(filePath);
  if (data.length < 24 || data.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`Expected a PNG file: ${path.relative(repoRoot, filePath)}`);
  }
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20)
  };
}

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (nextLine.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  }

  if (line) {
    lines.push(line);
  }
  return lines;
}

function textArgs({ x, y, text, font, size, fill, maxChars, lineHeight, weight = "700" }) {
  const lines = wrapText(text, maxChars);
  const args = ["-font", font, "-fill", fill, "-pointsize", String(size), "-interline-spacing", String(Math.round(size * 0.08))];
  if (weight) {
    args.push("-weight", weight);
  }
  lines.forEach((line, index) => {
    args.push("-annotate", `+${x}+${Math.round(y + index * lineHeight)}`, line);
  });
  return args;
}

function renderFrame(set, entry) {
  const [slug, fileName, headline, subhead] = entry;
  const [width, height] = set.size;
  const sourcePath = path.join(storeDir, set.id, fileName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing screenshot for ${set.id}/${slug}: ${path.relative(repoRoot, sourcePath)}`);
  }

  const outputDir = path.join(outputRoot, set.id);
  const outputPath = path.join(outputDir, `${slug}.png`);
  fs.mkdirSync(outputDir, { recursive: true });

  const sourceSize = pngSize(sourcePath);
  const screenshotWidth = set.screenshotWidth;
  const screenshotHeight = Math.round((sourceSize.height / sourceSize.width) * screenshotWidth);
  const screenshotX = Math.round((width - screenshotWidth) / 2);
  const screenshotY = set.topOffset;
  const topBandHeight = Math.round(height * 0.3);
  const contentX = Math.round(width * 0.09);
  const contentY = Math.round(height * 0.072);
  const eyebrowY = contentY;
  const headlineY = contentY + Math.round(set.copySize * 2.75);
  const headlineMaxChars = Math.max(14, Math.round((width * 0.58) / (set.headlineSize * 0.56)));
  const headlineLines = wrapText(headline, headlineMaxChars);
  const subheadY = headlineY + headlineLines.length * Math.round(set.headlineSize * 1.02) + Math.round(height * 0.022);
  const subheadMaxChars = Math.max(24, Math.round((width * 0.58) / (set.copySize * 0.52)));
  const accent = set.id === "android" ? "#11824f" : set.id === "ipad" ? "#0e7490" : set.id === "web" ? "#b45309" : "#4f2df5";
  const secondary = set.id === "android" ? "#b45309" : set.id === "ipad" ? "#4f2df5" : set.id === "web" ? "#11824f" : "#0e7490";
  const deviceBorder = set.id === "web" ? 0 : Math.max(12, Math.round(width * 0.012));
  const footerY = height - Math.round(height * 0.047);

  const baseArgs = [
    "-size", `${width}x${height}`,
    "xc:#f4f7fb",
    "-fill", "#121827",
    "-draw", `rectangle 0,0 22,${height}`,
    "-fill", "#fffaf4",
    "-draw", `rectangle 22,0 ${width},${topBandHeight}`,
    "-fill", "#e9e1ff",
    "-draw", `rectangle ${Math.round(width * 0.76)},0 ${width},${topBandHeight}`,
    "-fill", secondary,
    "-draw", `roundrectangle ${contentX},${eyebrowY - 9} ${contentX + 56},${eyebrowY + 1} 8,8`,
    "-font", fontBlack,
    "-fill", accent,
    "-pointsize", String(Math.round(set.copySize * 0.56)),
    "-weight", "900",
    "-annotate", `+${contentX + 76}+${eyebrowY}`, "PHILLY TOURS",
    ...textArgs({
      x: contentX,
      y: headlineY,
      text: headline,
      font: fontBlack,
      size: set.headlineSize,
      fill: "#121827",
      maxChars: headlineMaxChars,
      lineHeight: Math.round(set.headlineSize * 1.02),
      weight: "900"
    }),
    ...textArgs({
      x: contentX,
      y: subheadY,
      text: subhead,
      font: fontBold,
      size: set.copySize,
      fill: "#415065",
      maxChars: subheadMaxChars,
      lineHeight: Math.round(set.copySize * 1.32),
      weight: "700"
    }),
    "-font", fontBlack,
    "-fill", "#64748b",
    "-pointsize", String(Math.round(set.copySize * 0.56)),
    "-weight", "900",
    "-annotate", `+${screenshotX}+${screenshotY - Math.round(set.copySize * 1.05)}`, set.deviceLabel.toUpperCase(),
    "-fill", "rgba(15,23,42,0.22)",
    "-draw", `roundrectangle ${screenshotX + 28},${screenshotY + 36} ${screenshotX + screenshotWidth + 28},${screenshotY + screenshotHeight + 36} 58,58`
  ];

  if (deviceBorder > 0) {
    baseArgs.push(
      "-fill", "#111827",
      "-draw", `roundrectangle ${screenshotX - deviceBorder},${screenshotY - deviceBorder} ${screenshotX + screenshotWidth + deviceBorder},${screenshotY + screenshotHeight + deviceBorder} 58,58`
    );
  }

  baseArgs.push(
    "(",
    sourcePath,
    "-resize",
    `${screenshotWidth}x`,
    ")",
    "-geometry",
    `+${screenshotX}+${screenshotY}`,
    "-composite",
    "-font",
    fontBlack,
    "-fill",
    "#64748b",
    "-pointsize",
    String(Math.round(set.copySize * 0.56)),
    "-weight",
    "900",
    "-annotate",
    `+${contentX}+${footerY}`,
    "FOUNDERS COMPASS",
    "-fill",
    accent,
    "-draw",
    `roundrectangle ${width - contentX - Math.round(width * 0.22)},${footerY - 8} ${width - contentX},${footerY} 8,8`,
    outputPath
  );

  const result = spawnSync(magickBin, baseArgs, { encoding: "utf8", timeout: 30000 });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`ImageMagick render failed for ${path.relative(repoRoot, outputPath)}\n${result.stderr || result.stdout}`);
  }

  return outputPath;
}

fs.mkdirSync(outputRoot, { recursive: true });
fs.rmSync(path.join(outputRoot, "_html"), { recursive: true, force: true });

let renderedCount = 0;

for (const set of sets) {
  for (const entry of set.entries) {
    const outputPath = renderFrame(set, entry);
    renderedCount += 1;
    console.log(`Rendered ${path.relative(repoRoot, outputPath)}`);
  }
}

console.log(`Generated ${renderedCount} framed store screenshot(s).`);
