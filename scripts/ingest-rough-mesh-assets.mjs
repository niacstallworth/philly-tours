import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const rootDir = process.cwd();
const jobDir = path.join(rootDir, "docs", "ar-job-packs");
const generatedDir = path.join(rootDir, "generated", "ar");
const stagingDir = path.join(rootDir, "generated", "ar-runtime-staging");
const iosModelsDir = path.join(rootDir, "ios", "PhillyARTours", "ARAssets", "models");
const webModelsDir = path.join(rootDir, "assets", "models");
const runtimeSyncScriptPath = path.join(rootDir, "scripts", "sync-ar-runtime-readiness.mjs");

function parseArgs(argv) {
  const args = {
    stopId: "",
    provider: "manual",
    workspaceDir: "",
    reviewedDir: "",
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
    if (value === "--provider") {
      args.provider = (argv[index + 1] || "").trim() || args.provider;
      index += 1;
      continue;
    }
    if (value === "--workspace-dir") {
      args.workspaceDir = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (value === "--reviewed-dir") {
      args.reviewedDir = path.resolve(rootDir, argv[index + 1] || "");
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

function extensionOf(filePath) {
  return path.extname(String(filePath || "").trim()).toLowerCase();
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

function readJsonIfPresent(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolveMeshWorkspace(stopId, provider, explicitWorkspaceDir) {
  if (explicitWorkspaceDir) {
    return explicitWorkspaceDir;
  }
  return path.join(generatedDir, stopId, "rough_mesh", provider);
}

function loadMeshHandoff(workspaceDir) {
  const meshHandoffPath = path.join(workspaceDir, "mesh-handoff.json");
  const responsePath = path.join(workspaceDir, "response.json");
  return readJsonIfPresent(meshHandoffPath) || readJsonIfPresent(responsePath);
}

function listCandidateNames(runtimeTarget, suggestedArtifacts, extension) {
  const names = new Set();
  const runtimeFileName = basenameFromRuntimePath(runtimeTarget);
  if (runtimeFileName) {
    names.add(runtimeFileName);
  }

  for (const artifact of suggestedArtifacts) {
    const fileName = path.basename(String(artifact || "").trim());
    if (fileName && extensionOf(fileName) === extension) {
      names.add(fileName);
    }
  }

  return Array.from(names);
}

function resolveSourceFile(explicitFile, candidatePaths) {
  if (explicitFile) {
    return explicitFile;
  }

  for (const candidatePath of candidatePaths) {
    if (candidatePath && fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return "";
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

function buildReviewedWorkspaceGuide({
  stopTitle,
  stopId,
  reviewedDir,
  runtimeTargets,
  suggestedArtifacts
}) {
  const lines = [
    "# Reviewed Mesh Drop Zone",
    "",
    `- Stop: ${stopTitle}`,
    `- Stop ID: \`${stopId}\``,
    `- Reviewed directory: \`${relativeRepoPath(reviewedDir)}\``,
    "",
    "Drop cleaned mesh exports here, then run:",
    "",
    "```bash",
    `cd ${rootDir}`,
    `npm run ar:mesh:ingest -- --stop-id ${stopId} --dry-run`,
    "```",
    "",
    "Preferred runtime filenames:",
    "",
    `- iOS: \`${basenameFromRuntimePath(runtimeTargets.ios)}\``,
    `- Android: \`${basenameFromRuntimePath(runtimeTargets.android)}\``,
    `- Web: \`${basenameFromRuntimePath(runtimeTargets.web)}\``,
    "",
    "Also accepted from this folder:",
    ""
  ];

  for (const artifact of suggestedArtifacts) {
    lines.push(`- \`${path.basename(String(artifact || "").trim())}\``);
  }

  lines.push(
    "",
    "Tips:",
    "",
    "- If Android and Web use the same `.glb`, one file can satisfy both targets.",
    "- Use the runtime filenames once cleanup is done; keep `*-blockout.*` names for intermediate exports only.",
    "- Re-run with `--force` if you want to overwrite an existing staged runtime asset.",
    ""
  );

  return `${lines.join("\n")}\n`;
}

function buildMarkdown(manifest) {
  const lines = [
    "# Rough Mesh Runtime Ingest",
    "",
    `- Stop: ${manifest.stopTitle}`,
    `- Stop ID: \`${manifest.stopId}\``,
    `- Dry run: ${manifest.dryRun ? "yes" : "no"}`,
    `- Source job pack: \`${manifest.sourceJobPack}\``,
    `- Rough mesh workspace: \`${manifest.roughMeshWorkspace}\``,
    `- Reviewed drop zone: \`${manifest.reviewedDirectory}\``,
    ""
  ];

  for (const asset of manifest.assets) {
    lines.push(`## ${asset.platform}`, "");
    lines.push(`- Runtime target: \`${asset.runtimeTarget}\``);
    lines.push(`- Destination: \`${asset.destination}\``);
    lines.push(`- Source: ${asset.source ? `\`${asset.source}\`` : "not resolved"}`);
    lines.push(`- Candidate names: ${asset.candidateNames.length ? asset.candidateNames.map((item) => `\`${item}\``).join(", ") : "none"}`);
    lines.push(`- Result: ${asset.result}`, "");
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
  const workspaceDir = resolveMeshWorkspace(args.stopId, args.provider, args.workspaceDir);
  const reviewedDir = args.reviewedDir || path.join(workspaceDir, "reviewed");
  const meshHandoff = loadMeshHandoff(workspaceDir);
  const suggestedArtifacts = Array.isArray(meshHandoff?.suggestedWorkspaceArtifacts)
    ? meshHandoff.suggestedWorkspaceArtifacts
    : [];

  ensureDirectory(reviewedDir);
  fs.writeFileSync(
    path.join(reviewedDir, "README.md"),
    buildReviewedWorkspaceGuide({
      stopTitle: jobPack.stop?.stopTitle || args.stopId,
      stopId: args.stopId,
      reviewedDir,
      runtimeTargets,
      suggestedArtifacts
    })
  );

  const assets = [
    {
      platform: "iOS",
      runtimeTarget: runtimeTargets.ios,
      destinationAbsolute: path.join(iosModelsDir, basenameFromRuntimePath(runtimeTargets.ios)),
      explicitFile: args.iosFile,
      candidateNames: listCandidateNames(runtimeTargets.ios, suggestedArtifacts, ".usdz")
    },
    {
      platform: "Android",
      runtimeTarget: runtimeTargets.android,
      destinationAbsolute: path.join(webModelsDir, basenameFromRuntimePath(runtimeTargets.android)),
      explicitFile: args.androidFile,
      candidateNames: listCandidateNames(runtimeTargets.android, suggestedArtifacts, ".glb")
    },
    {
      platform: "Web",
      runtimeTarget: runtimeTargets.web,
      destinationAbsolute: path.join(webModelsDir, basenameFromRuntimePath(runtimeTargets.web)),
      explicitFile: args.webFile,
      candidateNames: listCandidateNames(runtimeTargets.web, suggestedArtifacts, ".glb")
    }
  ];

  const manifestOutputDir = path.join(stagingDir, args.stopId);
  ensureDirectory(manifestOutputDir);

  const stagedAssets = assets.map((asset) => {
    const candidatePaths = asset.candidateNames.flatMap((fileName) => [
      path.join(reviewedDir, fileName),
      path.join(workspaceDir, fileName)
    ]);
    const sourcePath = resolveSourceFile(asset.explicitFile, candidatePaths);

    let result = "planned";
    if (!args.dryRun) {
      result = copyIfNeeded(sourcePath, asset.destinationAbsolute, args.force);
    } else if (!sourcePath) {
      result = "missing_source";
    } else if (fs.existsSync(asset.destinationAbsolute) && !args.force) {
      result = "would_skip_existing";
    } else {
      result = "would_copy";
    }

    return {
      platform: asset.platform,
      runtimeTarget: asset.runtimeTarget,
      candidateNames: asset.candidateNames,
      source: sourcePath ? relativeRepoPath(sourcePath) : "",
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
    provider: args.provider,
    sourceJobPack: relativeRepoPath(jobPackEntry.path),
    roughMeshWorkspace: relativeRepoPath(workspaceDir),
    reviewedDirectory: relativeRepoPath(reviewedDir),
    assets: stagedAssets
  };

  fs.writeFileSync(path.join(manifestOutputDir, "mesh-ingest-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(manifestOutputDir, "mesh-ingest-manifest.md"), buildMarkdown(manifest));

  if (!args.dryRun) {
    runRuntimeSync(args.stopId);
  }

  console.log(
    `Prepared rough-mesh ingest manifest for ${args.stopId} in ${relativeRepoPath(manifestOutputDir)}.${args.dryRun ? " Dry-run only." : ""}`
  );
}

main();
