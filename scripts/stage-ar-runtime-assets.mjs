import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const jobDir = path.join(rootDir, "docs", "ar-job-packs");
const stagingDir = path.join(rootDir, "generated", "ar-runtime-staging");
const iosModelsDir = path.join(rootDir, "ios", "PhillyARTours", "ARAssets", "models");
const webModelsDir = path.join(rootDir, "assets", "models");
const runtimeSyncScriptPath = path.join(rootDir, "scripts", "sync-ar-runtime-readiness.mjs");

function parseArgs(argv) {
  const args = {
    stopId: "",
    sourceDir: "",
    iosFile: "",
    androidFile: "",
    webFile: "",
    dryRun: false,
    force: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--stop-id") {
      args.stopId = (argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (value === "--source-dir") {
      args.sourceDir = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (value === "--ios-file") {
      args.iosFile = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (value === "--android-file") {
      args.androidFile = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (value === "--web-file") {
      args.webFile = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (value === "--force") {
      args.force = true;
    }
  }

  if (!args.stopId) {
    throw new Error("--stop-id is required");
  }

  return args;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function relativeRepoPath(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, "/");
}

function normalizeRuntimePath(assetPath) {
  return String(assetPath || "").replace(/^\/+/, "");
}

function basenameFromRuntimePath(assetPath) {
  return path.basename(normalizeRuntimePath(assetPath));
}

function loadJobPack(stopId) {
  const jobPath = path.join(jobDir, stopId, "job.json");
  if (!fs.existsSync(jobPath)) {
    throw new Error(`Job pack not found for stop ${stopId}: ${relativeRepoPath(jobPath)}`);
  }
  return {
    path: jobPath,
    data: JSON.parse(fs.readFileSync(jobPath, "utf8"))
  };
}

function resolveSourceFile(explicitPath, sourceDir, fileName) {
  if (explicitPath) {
    return explicitPath;
  }
  if (!sourceDir) {
    return "";
  }
  const candidate = path.join(sourceDir, fileName);
  return fs.existsSync(candidate) ? candidate : "";
}

function copyIfNeeded(sourcePath, destinationPath, force) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return "missing_source";
  }
  if (fs.existsSync(destinationPath) && !force) {
    return "skipped_existing";
  }

  ensureDirectory(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
  return "copied";
}

function buildMarkdown(manifest) {
  const lines = [
    `# Runtime Asset Staging`,
    ``,
    `- Stop: ${manifest.stopTitle}`,
    `- Stop ID: \`${manifest.stopId}\``,
    `- Dry run: ${manifest.dryRun ? "yes" : "no"}`,
    `- Source job pack: \`${manifest.sourceJobPack}\``,
    ``
  ];

  for (const asset of manifest.assets) {
    lines.push(`## ${asset.platform}`, ``);
    lines.push(`- Runtime target: \`${asset.runtimeTarget}\``);
    lines.push(`- Destination: \`${asset.destination}\``);
    lines.push(`- Source: ${asset.source ? `\`${asset.source}\`` : "not resolved"}`);
    lines.push(`- Result: ${asset.result}`, ``);
  }

  return `${lines.join("\n")}\n`;
}

function runRuntimeSync(stopId) {
  execFileSync(process.execPath, [runtimeSyncScriptPath, "--stop-id", stopId], {
    cwd: rootDir,
    stdio: "inherit"
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const jobPackEntry = loadJobPack(args.stopId);
  const jobPack = jobPackEntry.data;
  const runtimeTargets = {
    ios: jobPack.runtimeTargets?.iosAsset || jobPack.pipeline?.expectedOutputs?.finalRuntimeAssets?.ios || "",
    android: jobPack.runtimeTargets?.androidAsset || jobPack.pipeline?.expectedOutputs?.finalRuntimeAssets?.android || "",
    web: jobPack.runtimeTargets?.webAsset || jobPack.pipeline?.expectedOutputs?.finalRuntimeAssets?.web || ""
  };

  const iosFileName = basenameFromRuntimePath(runtimeTargets.ios);
  const androidFileName = basenameFromRuntimePath(runtimeTargets.android);
  const webFileName = basenameFromRuntimePath(runtimeTargets.web);

  const assets = [
    {
      platform: "iOS",
      runtimeTarget: runtimeTargets.ios,
      source: resolveSourceFile(args.iosFile, args.sourceDir, iosFileName),
      destinationAbsolute: path.join(iosModelsDir, iosFileName)
    },
    {
      platform: "Android",
      runtimeTarget: runtimeTargets.android,
      source: resolveSourceFile(args.androidFile, args.sourceDir, androidFileName),
      destinationAbsolute: path.join(webModelsDir, androidFileName)
    },
    {
      platform: "Web",
      runtimeTarget: runtimeTargets.web,
      source: resolveSourceFile(args.webFile, args.sourceDir, webFileName),
      destinationAbsolute: path.join(webModelsDir, webFileName)
    }
  ];

  const manifestOutputDir = path.join(stagingDir, args.stopId);
  ensureDirectory(manifestOutputDir);

  const stagedAssets = assets.map((asset) => {
    let result = "planned";
    if (!args.dryRun) {
      result = copyIfNeeded(asset.source, asset.destinationAbsolute, args.force);
    } else if (!asset.source) {
      result = "missing_source";
    } else if (fs.existsSync(asset.destinationAbsolute) && !args.force) {
      result = "would_skip_existing";
    } else {
      result = "would_copy";
    }

    return {
      platform: asset.platform,
      runtimeTarget: asset.runtimeTarget,
      source: asset.source ? relativeRepoPath(asset.source) : "",
      destination: relativeRepoPath(asset.destinationAbsolute),
      result
    };
  });

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    stopId: args.stopId,
    stopTitle: jobPack.stop?.stopTitle || args.stopId,
    dryRun: args.dryRun,
    sourceJobPack: relativeRepoPath(jobPackEntry.path),
    assets: stagedAssets
  };

  fs.writeFileSync(path.join(manifestOutputDir, "staging-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(manifestOutputDir, "staging-manifest.md"), buildMarkdown(manifest));

  if (!args.dryRun) {
    runRuntimeSync(args.stopId);
  }

  console.log(
    `Prepared runtime staging manifest for ${args.stopId} in ${relativeRepoPath(manifestOutputDir)}.${args.dryRun ? " Dry-run only." : ""}`
  );
}

main();
