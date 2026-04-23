import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const tmpDir = path.join(repoRoot, "assets", "video", ".tmp");
const outputDir = path.join(repoRoot, "webapp", "assets", "video");
const videoVersion = "20260422";

const fontBlack = "/System/Library/Fonts/Supplemental/Arial Black.ttf";
const fontBold = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";
const fontRegular = "/System/Library/Fonts/Supplemental/Arial.ttf";

const colors = {
  ink: "#15100a",
  yellow: "#f7c02a",
  gray: "#353432",
  green: "#007a33",
  blue: "#002d72",
  white: "#fffaf0"
};

const assets = {
  icon: path.join(repoRoot, "assets", "icons", "philly-app-icon-flat.png"),
  home: path.join(repoRoot, "assets", "store", "framed", "ios", "01-home.png"),
  compass: path.join(repoRoot, "assets", "store", "framed", "ios", "04-compass.png"),
  ar: path.join(repoRoot, "assets", "store", "framed", "ios", "02-ar.png"),
  board: path.join(repoRoot, "assets", "store", "framed", "ios", "03-board.png"),
  heroLegacy: path.join(repoRoot, "assets", "generated", "tour-heroes", "black-american-legacy-and-quaker-heritage-hero.jpeg"),
  heroFoundations: path.join(repoRoot, "assets", "generated", "tour-heroes", "philadelphia-foundations-hero.jpeg"),
  heroInventors: path.join(repoRoot, "assets", "generated", "tour-heroes", "black-inventors-tour-hero.jpg"),
  heroSports: path.join(repoRoot, "assets", "generated", "tour-heroes", "black-american-sports-hero.jpeg"),
  appStore: path.join(repoRoot, "webapp", "assets", "app-store-badge.png"),
  playStore: path.join(repoRoot, "webapp", "assets", "google-play-store-badge.png")
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: options.stdio || "pipe",
    encoding: "utf8"
  });
  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    throw new Error(`${command} ${args.join(" ")} failed${stderr ? `\n${stderr}` : ""}${stdout ? `\n${stdout}` : ""}`);
  }
  return result.stdout || "";
}

function ffmpegPath() {
  try {
    return require("ffmpeg-static");
  } catch {
    const which = spawnSync("command", ["-v", "ffmpeg"], {
      shell: true,
      encoding: "utf8"
    });
    return which.stdout.trim() || "ffmpeg";
  }
}

function magick(args) {
  run("magick", args);
}

function tempPath(name) {
  return path.join(tmpDir, name);
}

function ensureDirs() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
}

function coverImage(source, dest, width, height, { dim = 0.42, blur = false } = {}) {
  const args = [
    source,
    "-auto-orient",
    "-resize",
    `${width}x${height}^`,
    "-gravity",
    "center",
    "-extent",
    `${width}x${height}`
  ];
  if (blur) {
    args.push("-blur", "0x7");
  }
  args.push("-fill", `rgba(0,0,0,${dim})`, "-draw", `rectangle 0,0 ${width},${height}`, dest);
  magick(args);
}

function createText(dest, text, width, pointSize, color, font = fontBold, align = "left", lineSpacing = -2) {
  magick([
    "-background",
    "none",
    "-fill",
    color,
    "-font",
    font,
    "-pointsize",
    String(pointSize),
    "-interline-spacing",
    String(lineSpacing),
    "-gravity",
    align === "center" ? "center" : "west",
    "-size",
    `${width}x`,
    `caption:${text}`,
    dest
  ]);
}

function composite(base, overlay, x, y) {
  magick([base, overlay, "-geometry", `+${Math.round(x)}+${Math.round(y)}`, "-composite", base]);
}

function roundedPanel(base, x, y, width, height, radius, fill, stroke = colors.ink, strokeWidth = 0) {
  magick([
    base,
    "-fill",
    fill,
    "-stroke",
    stroke,
    "-strokewidth",
    String(strokeWidth),
    "-draw",
    `roundrectangle ${x},${y} ${x + width},${y + height} ${radius},${radius}`,
    base
  ]);
}

function accentBars(base, width, height, accent = colors.yellow) {
  magick([
    base,
    "-fill",
    accent,
    "-draw",
    `rectangle 0,0 ${width},28`,
    "-fill",
    colors.gray,
    "-draw",
    `rectangle 0,${height - 28} ${width},${height}`,
    base
  ]);
}

function addEyebrow(base, text, x, y, color = colors.yellow) {
  const width = Math.min(660, Math.max(300, text.length * 15));
  const height = 64;
  roundedPanel(base, x, y, width, height, 18, color, colors.ink, 3);
  const label = tempPath(`eyebrow-${path.basename(base)}-${x}-${y}.png`);
  createText(label, text.toUpperCase(), width - 44, 24, colors.ink, fontBlack, "center", 0);
  composite(base, label, x + 22, y + 17);
}

function addBrand(base, width, height) {
  const icon = tempPath(`icon-${width}x${height}.png`);
  magick([assets.icon, "-resize", "86x86", icon]);
  composite(base, icon, 56, height - 126);

  const name = tempPath(`brand-${width}x${height}.png`);
  createText(name, "PHILLY TOURS", 390, 32, colors.white, fontBlack, "left", 0);
  composite(base, name, 154, height - 104);
}

function addPhone(base, source, x, y, height, rotate = 0) {
  const phone = tempPath(`phone-${path.basename(source)}-${height}-${rotate}.png`);
  magick([
    source,
    "-resize",
    `x${height}`,
    "-background",
    "none",
    "-rotate",
    String(rotate),
    phone
  ]);
  composite(base, phone, x, y);
}

function wideSlide(index, spec) {
  const width = 1920;
  const height = 1080;
  const base = tempPath(`wide-${String(index).padStart(2, "0")}.png`);
  coverImage(spec.background, base, width, height, { dim: spec.dim ?? 0.45, blur: spec.blur });
  accentBars(base, width, height, spec.accent);

  if (spec.split) {
    magick([
      base,
      "-fill",
      "rgba(247,192,42,0.86)",
      "-draw",
      "polygon 0,0 810,0 680,1080 0,1080",
      "-fill",
      "rgba(53,52,50,0.52)",
      "-draw",
      "polygon 810,0 1920,0 1920,1080 680,1080",
      base
    ]);
  }

  addEyebrow(base, spec.eyebrow, 88, 112, spec.accent);
  const headline = tempPath(`wide-head-${index}.png`);
  createText(headline, spec.headline, 840, 88, spec.headColor || colors.white, fontBlack, "left", -8);
  composite(base, headline, 88, 216);

  const subline = tempPath(`wide-sub-${index}.png`);
  createText(subline, spec.subline, 760, 35, spec.subColor || colors.white, fontBold, "left", 4);
  composite(base, subline, 94, 604);

  if (spec.phone) {
    addPhone(base, spec.phone, spec.phoneX ?? 1240, spec.phoneY ?? 105, spec.phoneHeight ?? 850, spec.phoneRotate ?? 0);
  }

  if (spec.iconCta) {
    const icon = tempPath("wide-final-icon.png");
    magick([assets.icon, "-resize", "210x210", icon]);
    roundedPanel(base, 1264, 264, 330, 330, 38, "rgba(255,250,240,0.94)", colors.ink, 5);
    composite(base, icon, 1324, 324);

    const cta = tempPath("wide-final-cta.png");
    createText(cta, "philly-tours.com", 520, 46, colors.white, fontBlack, "left", 0);
    composite(base, cta, 1230, 696);
  }

  addBrand(base, width, height);
  return base;
}

function verticalSlide(index, spec) {
  const width = 1080;
  const height = 1920;
  const base = tempPath(`vertical-${String(index).padStart(2, "0")}.png`);
  coverImage(spec.background, base, width, height, { dim: spec.dim ?? 0.5, blur: spec.blur });
  accentBars(base, width, height, spec.accent);

  if (spec.panel) {
    roundedPanel(base, 58, 118, 964, 654, 34, "rgba(21,16,10,0.62)", colors.yellow, 4);
  }

  addEyebrow(base, spec.eyebrow, 86, 150, spec.accent);
  const headline = tempPath(`vertical-head-${index}.png`);
  createText(headline, spec.headline, 920, 76, spec.headColor || colors.white, fontBlack, "left", -6);
  composite(base, headline, 86, 252);

  const subline = tempPath(`vertical-sub-${index}.png`);
  createText(subline, spec.subline, 870, 38, spec.subColor || colors.white, fontBold, "left", 6);
  composite(base, subline, 92, 604);

  if (spec.phone) {
    addPhone(base, spec.phone, spec.phoneX ?? 256, spec.phoneY ?? 804, spec.phoneHeight ?? 1020, spec.phoneRotate ?? 0);
  }

  if (spec.iconCta) {
    const icon = tempPath("vertical-final-icon.png");
    magick([assets.icon, "-resize", "220x220", icon]);
    roundedPanel(base, 430, 840, 220, 220, 34, "rgba(255,250,240,0.94)", colors.ink, 4);
    composite(base, icon, 430, 840);

    const cta = tempPath("vertical-final-cta.png");
    createText(cta, "philly-tours.com", 760, 54, colors.white, fontBlack, "center", 0);
    composite(base, cta, 160, 1168);
  }

  addBrand(base, width, height);
  return base;
}

function renderVideo(slides, outputPath, width, height) {
  const ffmpeg = ffmpegPath();
  const duration = 3.6;
  const fade = 0.35;
  const inputArgs = slides.flatMap((slide) => ["-loop", "1", "-t", String(duration), "-i", slide]);
  const prep = slides
    .map((_, index) => `[${index}:v]scale=${width}:${height},setsar=1,format=yuv420p[v${index}]`)
    .join(";");
  const fades = [];
  let previous = "v0";
  for (let index = 1; index < slides.length; index += 1) {
    const output = index === slides.length - 1 ? "outv" : `x${index}`;
    const offset = (duration - fade) * index;
    fades.push(`[${previous}][v${index}]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(2)}[${output}]`);
    previous = output;
  }
  const filter = `${prep};${fades.join(";")}`;

  run(
    ffmpeg,
    [
      "-y",
      ...inputArgs,
      "-filter_complex",
      filter,
      "-map",
      "[outv]",
      "-r",
      "30",
      "-c:v",
      "libx264",
      "-profile:v",
      "main",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputPath
    ],
    { stdio: "pipe" }
  );
}

function build() {
  ensureDirs();

  const specs = [
    {
      background: assets.heroLegacy,
      accent: colors.yellow,
      eyebrow: "Self-guided Philly stories",
      headline: "YOU HAVE WALKED PAST THIS HISTORY YOUR WHOLE LIFE.",
      subline: "Philly Tours turns every block into a story-led route."
    },
    {
      background: assets.heroFoundations,
      accent: colors.green,
      eyebrow: "Pick your path",
      headline: "CHOOSE A ROUTE WITH A POINT OF VIEW.",
      subline: "Black history, architecture, sports, libraries, hidden neighborhoods.",
      phone: assets.home,
      split: true,
      phoneX: 1218,
      phoneY: 84,
      phoneHeight: 890
    },
    {
      background: assets.heroSports,
      accent: colors.blue,
      eyebrow: "Compass mode",
      headline: "FOLLOW THE COMPASS, NOT A CROWD.",
      subline: "Live route context keeps the walk moving from stop to stop.",
      phone: assets.compass,
      split: true,
      phoneX: 1196,
      phoneY: 82,
      phoneHeight: 900
    },
    {
      background: assets.heroInventors,
      accent: colors.yellow,
      eyebrow: "Audio + AR-ready",
      headline: "HEAR THE STORY. SEE THE CITY DIFFERENT.",
      subline: "Narration, map cues, and AR-ready context at the moment it matters.",
      phone: assets.ar,
      split: true,
      phoneX: 1218,
      phoneY: 84,
      phoneHeight: 890
    },
    {
      background: assets.heroLegacy,
      accent: colors.green,
      eyebrow: "Philly Tours",
      headline: "WALK PHILLY LIKE IT IS TALKING BACK.",
      subline: "Self-guided walking tours for the city's hidden history.",
      iconCta: true,
      dim: 0.58
    }
  ];

  const wideSlides = specs.map((spec, index) => wideSlide(index + 1, spec));
  const verticalSlides = specs.map((spec, index) =>
    verticalSlide(index + 1, {
      ...spec,
      panel: true,
      phoneHeight: index === 1 || index === 2 || index === 3 ? 980 : undefined,
      phoneX: index === 1 || index === 2 || index === 3 ? 314 : undefined,
      phoneY: index === 1 || index === 2 || index === 3 ? 838 : undefined
    })
  );

  const heroVideo = path.join(outputDir, "philly-tours-product-hero.mp4");
  const reelVideo = path.join(outputDir, "philly-tours-product-reel.mp4");
  const heroVersionedVideo = path.join(outputDir, `philly-tours-product-hero-${videoVersion}.mp4`);
  const reelVersionedVideo = path.join(outputDir, `philly-tours-product-reel-${videoVersion}.mp4`);

  renderVideo(wideSlides, heroVideo, 1920, 1080);
  renderVideo(verticalSlides, reelVideo, 1080, 1920);
  fs.copyFileSync(heroVideo, heroVersionedVideo);
  fs.copyFileSync(reelVideo, reelVersionedVideo);

  fs.writeFileSync(
    path.join(outputDir, "README.md"),
    [
      "# Philly Tours Product Videos",
      "",
      "- `philly-tours-product-hero-20260422.mp4`: 16:9 silent website hero/product cut.",
      "- `philly-tours-product-reel-20260422.mp4`: 9:16 silent reel cut for Instagram, TikTok, and Shorts.",
      "- Unversioned aliases are also generated for local previews.",
      "",
      "Regenerate with `node scripts/generate-product-videos.mjs`.",
      ""
    ].join("\n")
  );

  console.log("Generated:");
  console.log(path.relative(repoRoot, heroVersionedVideo));
  console.log(path.relative(repoRoot, reelVersionedVideo));

  if (!process.env.KEEP_VIDEO_FRAMES) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

build();
