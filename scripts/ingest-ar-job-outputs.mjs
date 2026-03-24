import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const defaultGeneratedDir = path.join(rootDir, "generated", "ar");
const defaultJobDir = path.join(rootDir, "docs", "ar-job-packs");
const defaultStagingDir = path.join(rootDir, "generated", "ar-runtime-staging");

function parseArgs(argv) {
  const args = {
    stopId: "",
    generatedDir: defaultGeneratedDir,
    jobDir: defaultJobDir,
    stagingDir: defaultStagingDir,
    outputJson: path.join(defaultGeneratedDir, "ingest-index.json"),
    outputMarkdown: path.join(defaultGeneratedDir, "ingest-index.md")
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--stop-id") {
      args.stopId = (argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (value === "--generated-dir") {
      args.generatedDir = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (value === "--job-dir") {
      args.jobDir = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (value === "--staging-dir") {
      args.stagingDir = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (value === "--output-json") {
      args.outputJson = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (value === "--output-markdown") {
      args.outputMarkdown = path.resolve(rootDir, argv[index + 1] || "");
      index += 1;
    }
  }

  return args;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function relativeRepoPath(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, "/");
}

function loadJobPacks(jobDir) {
  const map = new Map();
  if (!fs.existsSync(jobDir)) {
    return map;
  }

  for (const entry of fs.readdirSync(jobDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const jobPath = path.join(jobDir, entry.name, "job.json");
    if (!fs.existsSync(jobPath)) {
      continue;
    }

    const jobPack = JSON.parse(fs.readFileSync(jobPath, "utf8"));
    const stopId = String(jobPack?.stop?.stopId || "").trim();
    if (stopId) {
      map.set(stopId, jobPack);
    }
  }

  return map;
}

function listFilesRecursive(dirPath) {
  const collected = [];
  if (!fs.existsSync(dirPath)) {
    return collected;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collected.push(...listFilesRecursive(entryPath));
      continue;
    }
    collected.push(entryPath);
  }

  return collected.sort();
}

function readJsonIfPresent(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadRuntimeStaging(stagingDir, stopId) {
  const stopStagingDir = path.join(stagingDir, stopId);
  const meshIngestManifestPath = path.join(stopStagingDir, "mesh-ingest-manifest.json");
  const runtimeStageManifestPath = path.join(stopStagingDir, "staging-manifest.json");

  return {
    stopStagingDir,
    meshIngest: readJsonIfPresent(meshIngestManifestPath),
    meshIngestManifestPath,
    runtimeStage: readJsonIfPresent(runtimeStageManifestPath),
    runtimeStageManifestPath
  };
}

function assetResultsSuggestReady(manifest) {
  if (!manifest?.assets?.length) {
    return false;
  }

  const readyResults = new Set(["copied", "skipped_existing", "would_copy", "would_skip_existing"]);
  return manifest.assets.every((asset) => readyResults.has(String(asset?.result || "")));
}

function manifestHasMissingSources(manifest) {
  if (!manifest?.assets?.length) {
    return false;
  }

  return manifest.assets.some((asset) => String(asset?.result || "") === "missing_source");
}

function inferNextStep(stageEntries, runtimeStaging) {
  const hasTextBrief = stageEntries.some((entry) => entry.stage === "text_brief" && entry.status !== "missing");
  const hasConceptImage = stageEntries.some((entry) => entry.stage === "concept_image" && entry.status !== "missing");
  const hasRoughMesh = stageEntries.some((entry) => entry.stage === "rough_mesh" && entry.status !== "missing");
  const meshIngestReady = assetResultsSuggestReady(runtimeStaging.meshIngest);
  const runtimeStageReady = assetResultsSuggestReady(runtimeStaging.runtimeStage);

  if (meshIngestReady || runtimeStageReady) {
    return "Validate staged runtime assets on device";
  }
  if (manifestHasMissingSources(runtimeStaging.meshIngest)) {
    return "Drop cleaned mesh exports into reviewed/ and run ar:mesh:ingest";
  }
  if (hasRoughMesh) {
    return "Clean mesh exports and run ar:mesh:ingest";
  }
  if (hasConceptImage) {
    return "Concept review and rough-mesh handoff";
  }
  if (hasTextBrief) {
    return "Generate concept image references";
  }
  return "Run the first job stage";
}

function buildStopSummary({ stopId, stopDir, jobPack, stagingDir }) {
  const stageEntries = [];
  if (fs.existsSync(stopDir)) {
    for (const stageEntry of fs.readdirSync(stopDir, { withFileTypes: true })) {
      if (!stageEntry.isDirectory()) {
        continue;
      }

      const stageDir = path.join(stopDir, stageEntry.name);
      for (const providerEntry of fs.readdirSync(stageDir, { withFileTypes: true })) {
        if (!providerEntry.isDirectory()) {
          continue;
        }

        const providerDir = path.join(stageDir, providerEntry.name);
        const runRecord = readJsonIfPresent(path.join(providerDir, "run.json"));
        const filePaths = listFilesRecursive(providerDir).map(relativeRepoPath);
        stageEntries.push({
          stage: stageEntry.name,
          provider: providerEntry.name,
          status: String(runRecord?.status || "completed"),
          dryRun: Boolean(runRecord?.dryRun),
          model: runRecord?.model || null,
          finishedAt: runRecord?.finishedAt || null,
          files: filePaths
        });
      }
    }
  }

  stageEntries.sort((left, right) => {
    if (left.stage === right.stage) {
      return left.provider.localeCompare(right.provider);
    }
    return left.stage.localeCompare(right.stage);
  });

  const finishedAtCandidates = stageEntries.map((entry) => entry.finishedAt).filter(Boolean).sort();
  const latestFinishedAt = finishedAtCandidates.length ? finishedAtCandidates[finishedAtCandidates.length - 1] : null;
  const runtimeStaging = loadRuntimeStaging(stagingDir, stopId);

  return {
    stopId,
    stopTitle: jobPack?.stop?.stopTitle || stopId,
    tourTitle: jobPack?.stop?.tourTitle || "",
    arPriority: jobPack?.stop?.arPriority || null,
    runtimeTargets: jobPack?.runtimeTargets || null,
    generatedWorkspace: relativeRepoPath(stopDir),
    stageRuns: stageEntries,
    latestFinishedAt,
    runtimeStaging: {
      meshIngestManifest: runtimeStaging.meshIngest
        ? {
            path: relativeRepoPath(runtimeStaging.meshIngestManifestPath),
            reviewedDirectory: runtimeStaging.meshIngest.reviewedDirectory || null,
            provider: runtimeStaging.meshIngest.provider || null,
            assets: runtimeStaging.meshIngest.assets || []
          }
        : null,
      runtimeStageManifest: runtimeStaging.runtimeStage
        ? {
            path: relativeRepoPath(runtimeStaging.runtimeStageManifestPath),
            assets: runtimeStaging.runtimeStage.assets || []
          }
        : null
    },
    nextStep: inferNextStep(stageEntries, runtimeStaging)
  };
}

function buildMarkdown(index) {
  const lines = [
    "# AR Generated Workspace Ingest Index",
    "",
    `Generated at: ${index.generatedAt}`,
    `Stops indexed: ${index.stops.length}`,
    ""
  ];

  for (const stop of index.stops) {
    lines.push(`## ${stop.stopTitle}`, "");
    lines.push(`- Stop ID: \`${stop.stopId}\``);
    if (stop.tourTitle) {
      lines.push(`- Tour: ${stop.tourTitle}`);
    }
    if (stop.arPriority != null) {
      lines.push(`- Priority: ${stop.arPriority}`);
    }
    lines.push(`- Workspace: \`${stop.generatedWorkspace}\``);
    lines.push(`- Next step: ${stop.nextStep}`);
    if (stop.latestFinishedAt) {
      lines.push(`- Latest run: ${stop.latestFinishedAt}`);
    }
    lines.push("");

    if (!stop.stageRuns.length) {
      lines.push("- No generated stages yet.", "");
    } else {
      lines.push("### Stage Runs", "");
      for (const stage of stop.stageRuns) {
        const stageSummary = [
          `- \`${stage.stage}\` via \`${stage.provider}\``,
          `status=${stage.status}`,
          stage.dryRun ? "dry-run" : "live",
          stage.model ? `model=${stage.model}` : null
        ]
          .filter(Boolean)
          .join(", ");
        lines.push(stageSummary);
        for (const filePath of stage.files) {
          lines.push(`  - \`${filePath}\``);
        }
      }
      lines.push("");
    }

    if (stop.runtimeStaging.meshIngestManifest || stop.runtimeStaging.runtimeStageManifest) {
      lines.push("### Runtime Staging", "");
      if (stop.runtimeStaging.meshIngestManifest) {
        lines.push(`- Mesh ingest manifest: \`${stop.runtimeStaging.meshIngestManifest.path}\``);
        if (stop.runtimeStaging.meshIngestManifest.reviewedDirectory) {
          lines.push(`- Reviewed directory: \`${stop.runtimeStaging.meshIngestManifest.reviewedDirectory}\``);
        }
        for (const asset of stop.runtimeStaging.meshIngestManifest.assets) {
          lines.push(`  - ${asset.platform}: ${asset.result} -> \`${asset.destination}\``);
        }
      }
      if (stop.runtimeStaging.runtimeStageManifest) {
        lines.push(`- Runtime stage manifest: \`${stop.runtimeStaging.runtimeStageManifest.path}\``);
        for (const asset of stop.runtimeStaging.runtimeStageManifest.assets) {
          lines.push(`  - ${asset.platform}: ${asset.result} -> \`${asset.destination}\``);
        }
      }
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  ensureDirectory(path.dirname(args.outputJson));
  ensureDirectory(path.dirname(args.outputMarkdown));

  const jobPacks = loadJobPacks(args.jobDir);
  const stopIds = new Set();

  if (fs.existsSync(args.generatedDir)) {
    for (const entry of fs.readdirSync(args.generatedDir, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== "." && entry.name !== "..") {
        stopIds.add(entry.name);
      }
    }
  }

  for (const stopId of jobPacks.keys()) {
    stopIds.add(stopId);
  }

  const selectedStopIds = Array.from(stopIds)
    .filter((stopId) => !args.stopId || stopId === args.stopId)
    .sort((left, right) => {
      const leftPriority = Number(jobPacks.get(left)?.stop?.arPriority || Number.POSITIVE_INFINITY);
      const rightPriority = Number(jobPacks.get(right)?.stop?.arPriority || Number.POSITIVE_INFINITY);
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
      return left.localeCompare(right);
    });

  const stops = selectedStopIds.map((stopId) =>
    buildStopSummary({
      stopId,
      stopDir: path.join(args.generatedDir, stopId),
      jobPack: jobPacks.get(stopId) || null,
      stagingDir: args.stagingDir
    })
  );

  const index = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generatedDir: relativeRepoPath(args.generatedDir),
    stopCount: stops.length,
    stops
  };

  fs.writeFileSync(args.outputJson, `${JSON.stringify(index, null, 2)}\n`);
  fs.writeFileSync(args.outputMarkdown, buildMarkdown(index));

  console.log(
    `Indexed ${stops.length} AR generated workspace stop(s) into ${relativeRepoPath(args.outputJson)} and ${relativeRepoPath(args.outputMarkdown)}.`
  );
}

main();
