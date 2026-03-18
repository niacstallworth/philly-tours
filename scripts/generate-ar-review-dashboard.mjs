import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const catalogPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const reviewsDir = path.join(rootDir, "generated", "ar-runtime-staging", "device-reviews");

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonIfPresent(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function relativeRepoPath(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, "/");
}

function readLatestReviewByTour() {
  if (!fs.existsSync(reviewsDir)) {
    return {
      latestByTourId: new Map(),
      previewByTourId: new Map()
    };
  }

  const reviewFiles = fs.readdirSync(reviewsDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));
  const latestByTourId = new Map();
  const previewByTourId = new Map();

  for (const fileName of reviewFiles) {
    if (fileName === "dashboard.json" || fileName === "next-actions.json") {
      continue;
    }
    const reviewPath = path.join(reviewsDir, fileName);
    const review = readJsonIfPresent(reviewPath);
    if (!review?.tourId) {
      continue;
    }

    const normalizedReview = {
      ...review,
      reportPath: relativeRepoPath(reviewPath),
      approvalQueuePath: relativeRepoPath(reviewPath.replace(/\.json$/, "-approval-queue.txt")),
      retuneQueuePath: relativeRepoPath(reviewPath.replace(/\.json$/, "-retune-queue.md"))
    };

    if (review.dryRun || fileName.endsWith("-preview.json")) {
      const existingPreview = previewByTourId.get(review.tourId);
      const existingIsExplicitPreview = existingPreview?.reportPath?.endsWith("-preview.json");
      const incomingIsExplicitPreview = fileName.endsWith("-preview.json");
      if (!existingPreview || incomingIsExplicitPreview || !existingIsExplicitPreview) {
        previewByTourId.set(review.tourId, normalizedReview);
      }
      continue;
    }

    if (fileName.endsWith("-latest.json")) {
      latestByTourId.set(review.tourId, normalizedReview);
    }
  }

  return {
    latestByTourId,
    previewByTourId
  };
}

function summarizeCatalog(records) {
  const byTour = new Map();

  for (const record of records) {
    const tourId = String(record.tourId || "").trim();
    const tourTitle = String(record.tourTitle || "").trim() || tourId;
    const status = String(record.assetStatus || "").trim() || "planned";
    const tourSummary = byTour.get(tourId) || {
      tourId,
      tourTitle,
      totalStops: 0,
      assetStatus: {
        planned: 0,
        in_production: 0,
        ready: 0,
        approved: 0
      }
    };

    tourSummary.totalStops += 1;
    if (Object.hasOwn(tourSummary.assetStatus, status)) {
      tourSummary.assetStatus[status] += 1;
    } else {
      tourSummary.assetStatus.planned += 1;
    }

    byTour.set(tourId, tourSummary);
  }

  return byTour;
}

function indexCatalogByStop(records) {
  const byStop = new Map();

  for (const record of records) {
    byStop.set(String(record.stopId || "").trim(), {
      tourId: String(record.tourId || "").trim(),
      tourTitle: String(record.tourTitle || "").trim(),
      stopId: String(record.stopId || "").trim(),
      stopTitle: String(record.stopTitle || "").trim(),
      assetStatus: String(record.assetStatus || "").trim() || "planned"
    });
  }

  return byStop;
}

function groupCatalogStopsByTour(records) {
  const byTour = new Map();

  for (const record of records) {
    const tourId = String(record.tourId || "").trim();
    const list = byTour.get(tourId) || [];
    list.push({
      tourId,
      tourTitle: String(record.tourTitle || "").trim(),
      stopId: String(record.stopId || "").trim(),
      stopTitle: String(record.stopTitle || "").trim(),
      arPriority: Number.parseInt(String(record.arPriority || "").trim(), 10) || 999,
      arType: String(record.arType || "").trim() || "unknown",
      assetStatus: String(record.assetStatus || "").trim() || "planned",
      anchorStyle: String(record.anchorStyle || "").trim() || "front_of_user",
      scale: String(record.scale || "").trim() || "1",
      rotationYDeg: String(record.rotationYDeg || "").trim() || "0",
      verticalOffsetM: String(record.verticalOffsetM || "").trim() || "0",
      triggerRadiusM: String(record.triggerRadiusM || "").trim() || "",
      estimatedEffort: String(record.estimatedEffort || "").trim() || "",
      notes: String(record.notes || "").trim() || ""
    });
    byTour.set(tourId, list);
  }

  for (const stops of byTour.values()) {
    stops.sort((left, right) => {
      if (left.arPriority !== right.arPriority) {
        return left.arPriority - right.arPriority;
      }
      return left.stopTitle.localeCompare(right.stopTitle);
    });
  }

  return byTour;
}

function isBuildableAssetStatus(status) {
  return status === "in_production" || status === "ready" || status === "approved";
}

function deriveCurrentReview(review, catalogByStop) {
  if (!review) {
    return null;
  }

  const reviewedStops = Array.isArray(review.stops)
    ? review.stops.map((stop) => {
        const currentCatalogStop = catalogByStop.get(String(stop.stopId || "").trim());
        return {
          ...stop,
          stopTitle: currentCatalogStop?.stopTitle || stop.stopTitle || stop.stopId,
          assetStatus: currentCatalogStop?.assetStatus || stop.assetStatus || "planned"
        };
      })
    : [];

  const approvalCandidates = reviewedStops.filter(
    (stop) => stop.assetStatus !== "approved" && isBuildableAssetStatus(stop.assetStatus) && stop.passStatus === "stable"
  );
  const needsRetune = reviewedStops.filter((stop) => stop.passStatus === "minor_drift" || stop.passStatus === "needs_retune");

  return {
    reviewedStops,
    approvalCandidates,
    needsRetune
  };
}

function buildTourRows(catalogByTour, catalogByStop, reviewByTour, previewByTour) {
  return Array.from(catalogByTour.values())
    .map((catalogSummary) => {
      const review = reviewByTour.get(catalogSummary.tourId) || null;
      const preview = previewByTour.get(catalogSummary.tourId) || null;
      const currentReview = deriveCurrentReview(review, catalogByStop);
      const projectedPreviewReview = !review && preview ? deriveCurrentReview(preview, catalogByStop) : null;
      const approvalCandidateCount = currentReview?.approvalCandidates.length || 0;
      const needsRetuneCount = currentReview?.needsRetune.length || 0;
      const reviewedStops = currentReview?.reviewedStops.length || 0;
      const projectedPreviewApprovalCandidates = projectedPreviewReview?.approvalCandidates || [];

      let nextStep = "Capture first device review";
      if (approvalCandidateCount > 0) {
        nextStep = "Run approval queue";
      } else if (needsRetuneCount > 0) {
        nextStep = "Run retune pass";
      } else if (review && reviewedStops > 0) {
        nextStep = "Keep validating buildable stops";
      } else if (preview) {
        nextStep = "Promote preview or import a real device review";
      } else if (catalogSummary.assetStatus.in_production > 0 || catalogSummary.assetStatus.ready > 0) {
        nextStep = "Run buildable iPad pass";
      }

      return {
        ...catalogSummary,
        latestReview: review,
        latestPreview: preview,
        currentReview,
        projectedPreviewReview,
        approvalCandidates: currentReview?.approvalCandidates || [],
        needsRetune: currentReview?.needsRetune || [],
        projectedPreviewApprovalCandidates,
        approvalCandidateCount,
        needsRetuneCount,
        reviewedStops,
        nextStep
      };
    })
    .sort((left, right) => {
      if (right.approvalCandidateCount !== left.approvalCandidateCount) {
        return right.approvalCandidateCount - left.approvalCandidateCount;
      }
      if (right.needsRetuneCount !== left.needsRetuneCount) {
        return right.needsRetuneCount - left.needsRetuneCount;
      }
      return left.tourTitle.localeCompare(right.tourTitle);
    });
}

function buildMarkdown(rows) {
  const projectedApprovalCount = rows.reduce((sum, row) => sum + row.projectedPreviewApprovalCandidates.length, 0);
  const totals = rows.reduce(
    (acc, row) => {
      acc.tours += 1;
      acc.stops += row.totalStops;
      acc.approvalCandidates += row.approvalCandidateCount;
      acc.needsRetune += row.needsRetuneCount;
      acc.reviewedTours += row.latestReview ? 1 : 0;
      acc.previewTours += row.latestPreview ? 1 : 0;
      return acc;
    },
    { tours: 0, stops: 0, approvalCandidates: 0, needsRetune: 0, reviewedTours: 0, previewTours: 0 }
  );

  const lines = [
    "# AR Review Dashboard",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Tours tracked: ${totals.tours}`,
    `- Tours with imported device reviews: ${totals.reviewedTours}`,
    `- Tours with preview-only device reviews: ${totals.previewTours}`,
    `- AR stops tracked: ${totals.stops}`,
    `- Approval candidates: ${totals.approvalCandidates}`,
    `- Needs retune: ${totals.needsRetune}`,
    `- Projected approvals after preview promotion: ${projectedApprovalCount}`,
    "",
    "## Tours",
    ""
  ];

  for (const row of rows) {
    lines.push(`### ${row.tourTitle}`, "");
    lines.push(`- Tour ID: \`${row.tourId}\``);
    lines.push(
      `- Catalog status: planned=${row.assetStatus.planned}, in_production=${row.assetStatus.in_production}, ready=${row.assetStatus.ready}, approved=${row.assetStatus.approved}`
    );
    lines.push(`- Latest review: ${row.latestReview ? `yes (${row.reviewedStops} stop${row.reviewedStops === 1 ? "" : "s"})` : "no"}`);
    lines.push(`- Approval candidates: ${row.approvalCandidateCount}`);
    lines.push(`- Needs retune: ${row.needsRetuneCount}`);
    lines.push(`- Next step: ${row.nextStep}`);
    if (row.latestReview) {
      lines.push(`- Review report: \`${row.latestReview.reportPath}\``);
      lines.push(`- Approval queue: \`${row.latestReview.approvalQueuePath}\``);
      lines.push(`- Retune queue: \`${row.latestReview.retuneQueuePath}\``);
      lines.push(`- Current approval queue: \`${row.latestReview.currentApprovalQueuePath}\``);
      lines.push(`- Current retune queue: \`${row.latestReview.currentRetuneQueuePath}\``);
    } else if (row.latestPreview) {
      lines.push(`- Preview review only: \`${row.latestPreview.reportPath}\``);
      lines.push(`- Projected approvals after preview promotion: ${row.projectedPreviewApprovalCandidates.length}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function buildNextActions(rows) {
  const approvalCandidates = [];
  const previewPromotions = [];
  const projectedApprovalCandidates = [];
  const retuneCandidates = [];
  const firstReviewTours = [];

  for (const row of rows) {
    if (row.approvalCandidates.length) {
      for (const stop of row.approvalCandidates) {
        approvalCandidates.push({
          tourId: row.tourId,
          tourTitle: row.tourTitle,
          stopId: stop.stopId,
          stopTitle: stop.stopTitle,
          note: stop.notes || "Stable on iPad after device pass.",
          command: `npm run ar:catalog:approve -- --stop-id ${stop.stopId} --note ${JSON.stringify(
            stop.notes || "Stable on iPad after device pass."
          )}`
        });
      }
    }

    if (row.needsRetune.length) {
      for (const stop of row.needsRetune) {
        retuneCandidates.push({
          tourId: row.tourId,
          tourTitle: row.tourTitle,
          stopId: stop.stopId,
          stopTitle: stop.stopTitle,
          assetStatus: stop.assetStatus,
          passStatus: stop.passStatus,
          notes: stop.notes || ""
        });
      }
    }

    if (!row.latestReview && row.latestPreview) {
      previewPromotions.push({
        tourId: row.tourId,
        tourTitle: row.tourTitle,
        previewReportPath: row.latestPreview.reportPath,
        command: `npm run ar:reviews:promote -- --tour-id ${row.tourId}`
      });

      for (const stop of row.projectedPreviewApprovalCandidates) {
        projectedApprovalCandidates.push({
          tourId: row.tourId,
          tourTitle: row.tourTitle,
          stopId: stop.stopId,
          stopTitle: stop.stopTitle,
          note: stop.notes || "Stable on iPad after device pass.",
          command: `npm run ar:catalog:approve -- --stop-id ${stop.stopId} --note ${JSON.stringify(
            stop.notes || "Stable on iPad after device pass."
          )}`
        });
      }
    }

    const buildableStopCount = row.assetStatus.in_production + row.assetStatus.ready + row.assetStatus.approved;
    if (!row.latestReview && buildableStopCount > 0) {
      firstReviewTours.push({
        tourId: row.tourId,
        tourTitle: row.tourTitle,
        buildableStopCount,
        previewOnly: Boolean(row.latestPreview)
      });
    }
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    approvalCandidates,
    previewPromotions,
    projectedApprovalCandidates,
    retuneCandidates,
    firstReviewTours
  };
}

function buildSessionHandoff(rows, actions, catalogStopsByTour) {
  const deviceQueue = rows
    .map((row) => {
      const buildableStopCount = row.assetStatus.in_production + row.assetStatus.ready + row.assetStatus.approved;
      if (!buildableStopCount) {
        return null;
      }

      let mode = "";
      let priority = 99;

      if (row.needsRetuneCount > 0) {
        mode = "retune";
        priority = 0;
      } else if (!row.latestReview && !row.latestPreview) {
        mode = "first_review";
        priority = 1;
      } else if (!row.latestReview && row.latestPreview) {
        mode = "preview_follow_up";
        priority = 2;
      } else if (row.latestReview && row.approvalCandidateCount === 0) {
        mode = "continue_validation";
        priority = 3;
      }

      if (!mode) {
        return null;
      }

      const reviewLookup = new Map(
        (row.currentReview?.reviewedStops || []).map((stop) => [stop.stopId, stop])
      );
      const buildableStops = (catalogStopsByTour.get(row.tourId) || [])
        .filter((stop) => isBuildableAssetStatus(stop.assetStatus))
        .map((stop) => {
          const reviewStop = reviewLookup.get(stop.stopId);
          return {
            ...stop,
            passStatus: reviewStop?.passStatus || "untested",
            reviewNotes: reviewStop?.notes || ""
          };
        });

      return {
        tourId: row.tourId,
        tourTitle: row.tourTitle,
        mode,
        priority,
        buildableStopCount,
        reviewedStops: row.reviewedStops,
        previewReportPath: row.latestPreview?.reportPath || "",
        latestReviewPath: row.latestReview?.reportPath || "",
        nextStep: row.nextStep,
        needsRetuneCount: row.needsRetuneCount,
        approvalCandidateCount: row.approvalCandidateCount,
        projectedPreviewApprovalCandidates: row.projectedPreviewApprovalCandidates.map((stop) => ({
          stopId: stop.stopId,
          stopTitle: stop.stopTitle,
          command: `npm run ar:catalog:approve -- --stop-id ${stop.stopId} --note ${JSON.stringify(
            stop.notes || "Stable on iPad after device pass."
          )}`
        })),
        buildableStops,
        retuneStops: row.needsRetune.map((stop) => ({
          stopId: stop.stopId,
          stopTitle: stop.stopTitle,
          passStatus: stop.passStatus,
          notes: stop.notes || ""
        }))
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }
      if (right.buildableStopCount !== left.buildableStopCount) {
        return right.buildableStopCount - left.buildableStopCount;
      }
      return left.tourTitle.localeCompare(right.tourTitle);
    });

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    deskActions: {
      previewPromotionCount: actions.previewPromotions.length,
      approvalCandidateCount: actions.approvalCandidates.length,
      projectedApprovalCandidateCount: actions.projectedApprovalCandidates.length,
      advanceCommand: "npm run ar:reviews:advance -- --dry-run"
    },
    recommendedFocus: deviceQueue[0] || null,
    deviceQueue
  };
}

function buildNextActionsMarkdown(actions) {
  const lines = [
    "# AR Review Next Actions",
    "",
    `Generated at: ${actions.generatedAt}`,
    "",
    "## Preview Promotions",
    ""
  ];

  if (!actions.previewPromotions.length) {
    lines.push("None right now.", "");
  } else {
    for (const tour of actions.previewPromotions) {
      lines.push(`- ${tour.tourTitle} (\`${tour.tourId}\`)`);
      lines.push(`  Preview: \`${tour.previewReportPath}\``);
      lines.push(`  Command: \`${tour.command}\``);
    }
    lines.push("");
  }

  lines.push("## Projected Approvals After Preview Promotion", "");
  if (!actions.projectedApprovalCandidates.length) {
    lines.push("None right now.", "");
  } else {
    for (const stop of actions.projectedApprovalCandidates) {
      lines.push(`- ${stop.tourTitle} -> ${stop.stopTitle} (\`${stop.stopId}\`)`);
      lines.push(`  Command: \`${stop.command}\``);
    }
    lines.push("");
  }

  lines.push(
    "## Approval Candidates",
    ""
  );

  if (!actions.approvalCandidates.length) {
    lines.push("None right now.", "");
  } else {
    for (const stop of actions.approvalCandidates) {
      lines.push(`- ${stop.tourTitle} -> ${stop.stopTitle} (\`${stop.stopId}\`)`);
      lines.push(`  Command: \`${stop.command}\``);
    }
    lines.push("");
  }

  lines.push("## Retune Queue", "");
  if (!actions.retuneCandidates.length) {
    lines.push("None right now.", "");
  } else {
    for (const stop of actions.retuneCandidates) {
      lines.push(
        `- ${stop.tourTitle} -> ${stop.stopTitle} (\`${stop.stopId}\`) | ${stop.passStatus.replaceAll("_", " ")} | asset ${stop.assetStatus}${stop.notes ? ` | ${stop.notes}` : ""}`
      );
    }
    lines.push("");
  }

  lines.push("## Tours Needing First Device Review", "");
  if (!actions.firstReviewTours.length) {
    lines.push("None right now.", "");
  } else {
    for (const tour of actions.firstReviewTours) {
      lines.push(`- ${tour.tourTitle} (\`${tour.tourId}\`) | ${tour.buildableStopCount} buildable stop${tour.buildableStopCount === 1 ? "" : "s"}${tour.previewOnly ? " | preview review exists, promote or import a real one" : ""}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function describeSessionMode(mode) {
  switch (mode) {
    case "retune":
      return "Retune existing buildable stops on the iPad";
    case "first_review":
      return "Capture a first real device review for this buildable tour";
    case "preview_follow_up":
      return "Decide whether to promote the preview review or capture a real device review";
    case "continue_validation":
      return "Keep validating buildable stops after the latest device pass";
    default:
      return "Review this tour on device";
  }
}

function buildSessionHandoffMarkdown(handoff) {
  const lines = [
    "# AR Session Handoff",
    "",
    `Generated at: ${handoff.generatedAt}`,
    "",
    "## Desk Actions Before Next Device Pass",
    "",
    `- Preview promotions queued: ${handoff.deskActions.previewPromotionCount}`,
    `- Approval candidates queued: ${handoff.deskActions.approvalCandidateCount}`,
    `- Projected approvals after preview promotion: ${handoff.deskActions.projectedApprovalCandidateCount}`,
    `- Dry-run command: \`${handoff.deskActions.advanceCommand}\``,
    ""
  ];

  if (handoff.recommendedFocus) {
    const focus = handoff.recommendedFocus;
    lines.push("## Recommended Next Device Focus", "");
    lines.push(`### ${focus.tourTitle}`, "");
    lines.push(`- Tour ID: \`${focus.tourId}\``);
    lines.push(`- Focus mode: ${describeSessionMode(focus.mode)}`);
    lines.push(`- Buildable stops: ${focus.buildableStopCount}`);
    lines.push(`- Needs retune: ${focus.needsRetuneCount}`);
    lines.push(`- Approval candidates already ready: ${focus.approvalCandidateCount}`);
    lines.push(`- Projected approvals after preview promotion: ${focus.projectedPreviewApprovalCandidates.length}`);
    lines.push(`- Next step: ${focus.nextStep}`);
    if (focus.latestReviewPath) {
      lines.push(`- Latest review: \`${focus.latestReviewPath}\``);
    }
    if (focus.previewReportPath) {
      lines.push(`- Preview review: \`${focus.previewReportPath}\``);
    }
    if (focus.devicePassPacketPath) {
      lines.push(`- Device pass packet: \`${focus.devicePassPacketPath}\``);
    }
    lines.push("- Buildable stops for this pass:");
    if (!focus.buildableStops.length) {
      lines.push("  - No buildable stops are currently cataloged for this tour.");
    } else {
      for (const stop of focus.buildableStops) {
        lines.push(
          `  - ${stop.stopTitle} (\`${stop.stopId}\`) | asset ${stop.assetStatus} | ${stop.arType} | anchor ${stop.anchorStyle} | pass ${stop.passStatus.replaceAll("_", " ")}`
        );
        lines.push(
          `    tuning baseline: scale ${stop.scale}, rotation ${stop.rotationYDeg}deg, vertical offset ${stop.verticalOffsetM}m${stop.triggerRadiusM ? `, trigger ${stop.triggerRadiusM}m` : ""}`
        );
        if (stop.reviewNotes) {
          lines.push(`    review notes: ${stop.reviewNotes}`);
        } else if (stop.notes) {
          lines.push(`    catalog notes: ${stop.notes}`);
        }
      }
    }
    lines.push("- Device pass goals:");
    lines.push("  - Mark each buildable stop as Stable, Minor Drift, or Needs Retune.");
    lines.push("  - Save updated tuning if placement or scale changes.");
    lines.push("  - Copy a full device review report when the pass is done.");
    if (focus.retuneStops.length) {
      lines.push("- Retune stops:");
      for (const stop of focus.retuneStops) {
        lines.push(`  - ${stop.stopTitle} (\`${stop.stopId}\`) | ${stop.passStatus.replaceAll("_", " ")}${stop.notes ? ` | ${stop.notes}` : ""}`);
      }
    }
    if (focus.projectedPreviewApprovalCandidates.length) {
      lines.push("- If you promote the preview review, these approval commands unlock:");
      for (const stop of focus.projectedPreviewApprovalCandidates) {
        lines.push(`  - ${stop.stopTitle} (\`${stop.stopId}\`)`);
        lines.push(`    \`${stop.command}\``);
      }
    }
    lines.push("");
  } else {
    lines.push("## Recommended Next Device Focus", "", "No device-session focus is queued right now.", "");
  }

  lines.push("## Additional Device Queue", "");
  const remainingQueue = handoff.deviceQueue.slice(handoff.recommendedFocus ? 1 : 0);
  if (!remainingQueue.length) {
    lines.push("No additional tours are queued for the next device session.", "");
  } else {
    for (const item of remainingQueue) {
      lines.push(`- ${item.tourTitle} (\`${item.tourId}\`) | ${describeSessionMode(item.mode)} | ${item.buildableStopCount} buildable stop${item.buildableStopCount === 1 ? "" : "s"}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function buildDevicePassPacket(item, handoff) {
  const previewPromotionCommand = `npm run ar:reviews:promote -- --tour-id ${item.tourId}`;

  return {
    schemaVersion: 1,
    generatedAt: handoff.generatedAt,
    tourId: item.tourId,
    tourTitle: item.tourTitle,
    mode: item.mode,
    focusDescription: describeSessionMode(item.mode),
    buildableStopCount: item.buildableStopCount,
    deskPrepCommands: [
      handoff.deskActions.advanceCommand,
      "npm run metro:dev-client"
    ],
    beforeLeavingDesk: item.previewReportPath
      ? [
          "Decide whether the existing preview review is strong enough to promote without another pass.",
          `If yes, dry-run: \`${previewPromotionCommand} --dry-run\``
        ]
      : [],
    optionalTuningCloseoutCommands: [
      "Fallback if you only copied a tuning snapshot instead of the full session closeout bundle.",
      "npm run ar:tuning:apply -- --dry-run",
      "npm run ar:tuning:apply"
    ],
    afterSessionCommands: [
      "Preferred: tap Copy Session Closeout from the AR screen on iPad.",
      "pbpaste | npm run ar:closeout:import -- --dry-run",
      "pbpaste | npm run ar:closeout:import",
      "Fallback if you only copied the review report:",
      "pbpaste | npm run ar:reviews:import -- --dry-run",
      "pbpaste | npm run ar:reviews:import"
    ],
    previewPromotionCommand,
    previewReportPath: item.previewReportPath,
    latestReviewPath: item.latestReviewPath,
    projectedPreviewApprovalCandidates: item.projectedPreviewApprovalCandidates || [],
    stops: item.buildableStops
  };
}

function buildDevicePassPacketMarkdown(packet) {
  const lines = [
    "# AR Device Pass Packet",
    "",
    `Generated at: ${packet.generatedAt}`,
    "",
    `- Tour: ${packet.tourTitle} (\`${packet.tourId}\`)`,
    `- Focus: ${packet.focusDescription}`,
    `- Buildable stops: ${packet.buildableStopCount}`,
    ""
  ];

  if (packet.previewReportPath) {
    lines.push(`- Preview review in hand: \`${packet.previewReportPath}\``);
  }
  if (packet.latestReviewPath) {
    lines.push(`- Latest official review: \`${packet.latestReviewPath}\``);
  }
  lines.push("");

  lines.push("## Before Leaving Desk", "");
  for (const command of packet.deskPrepCommands) {
    lines.push(`- \`${command}\``);
  }
  if (packet.beforeLeavingDesk.length) {
    for (const item of packet.beforeLeavingDesk) {
      lines.push(`- ${item}`);
    }
  }
  if (packet.projectedPreviewApprovalCandidates.length) {
    lines.push("- If the preview is promoted, these approvals become available:");
    for (const stop of packet.projectedPreviewApprovalCandidates) {
      lines.push(`  - ${stop.stopTitle} (\`${stop.stopId}\`)`);
      lines.push(`    \`${stop.command}\``);
    }
  }
  lines.push("");

  lines.push("## On Device", "");
  if (!packet.stops.length) {
    lines.push("No buildable stops are currently queued for this device pass.", "");
  } else {
    for (const stop of packet.stops) {
      lines.push(`### ${stop.stopTitle}`, "");
      lines.push(`- Stop ID: \`${stop.stopId}\``);
      lines.push(`- Asset status: \`${stop.assetStatus}\``);
      lines.push(`- AR type: \`${stop.arType}\``);
      lines.push(`- Anchor style: \`${stop.anchorStyle}\``);
      lines.push(`- Baseline tuning: scale ${stop.scale}, rotation ${stop.rotationYDeg}deg, vertical offset ${stop.verticalOffsetM}m${stop.triggerRadiusM ? `, trigger ${stop.triggerRadiusM}m` : ""}`);
      lines.push(`- Current pass status: ${stop.passStatus.replaceAll("_", " ")}`);
      if (stop.reviewNotes) {
        lines.push(`- Review notes: ${stop.reviewNotes}`);
      } else if (stop.notes) {
        lines.push(`- Catalog notes: ${stop.notes}`);
      }
      lines.push("- Capture:");
      lines.push("  - Stable, Minor Drift, or Needs Retune");
      lines.push("  - Updated tuning if placement/scale changes");
      lines.push("  - Any notes worth carrying into approval or retune work");
      lines.push("");
    }
  }

  lines.push("## After Device Pass", "");
  lines.push("- Fallback if you only copied a tuning snapshot instead of the full session closeout bundle:");
  for (const item of packet.optionalTuningCloseoutCommands) {
    lines.push(`  - ${item.startsWith("npm run") ? `\`${item}\`` : item}`);
  }
  for (const item of packet.afterSessionCommands) {
    lines.push(`- ${item.startsWith("pbpaste") ? `\`${item}\`` : item}`);
  }
  if (packet.previewReportPath) {
    lines.push(`- If you decide the preview is already good enough without another pass: \`${packet.previewPromotionCommand}\``);
  }
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function buildAggregateApprovalQueue(actions) {
  const lines = [
    `AR approval queue (${actions.approvalCandidates.length} candidate${actions.approvalCandidates.length === 1 ? "" : "s"})`,
    ""
  ];

  for (const stop of actions.approvalCandidates) {
    lines.push(`${stop.tourTitle} -> ${stop.stopTitle} [${stop.stopId}]`);
    lines.push(stop.command);
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function buildAggregatePreviewPromotionQueue(actions) {
  const lines = [
    `AR preview-promotion queue (${actions.previewPromotions.length} tour${actions.previewPromotions.length === 1 ? "" : "s"})`,
    ""
  ];

  for (const tour of actions.previewPromotions) {
    lines.push(`${tour.tourTitle} [${tour.tourId}]`);
    lines.push(tour.command);
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function buildProjectedApprovalQueue(actions) {
  const lines = [
    `AR projected approval queue (${actions.projectedApprovalCandidates.length} candidate${actions.projectedApprovalCandidates.length === 1 ? "" : "s"})`,
    ""
  ];

  for (const stop of actions.projectedApprovalCandidates) {
    lines.push(`${stop.tourTitle} -> ${stop.stopTitle} [${stop.stopId}]`);
    lines.push(stop.command);
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function buildAggregateRetuneQueue(actions) {
  const lines = [
    "# AR Aggregate Retune Queue",
    "",
    `Generated at: ${actions.generatedAt}`,
    ""
  ];

  if (!actions.retuneCandidates.length) {
    lines.push("No retune items right now.", "");
    return `${lines.join("\n")}\n`;
  }

  for (const stop of actions.retuneCandidates) {
    lines.push(`- ${stop.tourTitle} -> ${stop.stopTitle} (\`${stop.stopId}\`) | ${stop.passStatus.replaceAll("_", " ")} | asset ${stop.assetStatus}${stop.notes ? ` | ${stop.notes}` : ""}`);
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}

function buildFirstReviewQueue(actions) {
  const lines = [
    "# AR First Device Review Queue",
    "",
    `Generated at: ${actions.generatedAt}`,
    ""
  ];

  if (!actions.firstReviewTours.length) {
    lines.push("No tours are waiting for a first device review right now.", "");
    return `${lines.join("\n")}\n`;
  }

  for (const tour of actions.firstReviewTours) {
    lines.push(`- ${tour.tourTitle} (\`${tour.tourId}\`) | ${tour.buildableStopCount} buildable stop${tour.buildableStopCount === 1 ? "" : "s"}`);
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}

function buildTourApprovalQueue(row) {
  const lines = [
    `AR approval queue (${row.approvalCandidates.length} candidate${row.approvalCandidates.length === 1 ? "" : "s"})`,
    ""
  ];

  for (const stop of row.approvalCandidates) {
    lines.push(`${row.tourTitle} -> ${stop.stopTitle} [${stop.stopId}]`);
    lines.push(
      `npm run ar:catalog:approve -- --stop-id ${stop.stopId} --note ${JSON.stringify(stop.notes || "Stable on iPad after device pass.")}`
    );
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function buildTourRetuneQueue(row) {
  const lines = [
    `# ${row.tourTitle} Retune Queue`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    ""
  ];

  if (!row.needsRetune.length) {
    lines.push("No retune items right now.", "");
    return `${lines.join("\n")}\n`;
  }

  for (const stop of row.needsRetune) {
    lines.push(`- ${stop.stopTitle} (\`${stop.stopId}\`) | ${stop.passStatus.replaceAll("_", " ")} | asset ${stop.assetStatus}${stop.notes ? ` | ${stop.notes}` : ""}`);
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}

function main() {
  const catalog = readCatalogCsv(catalogPath);
  const catalogByTour = summarizeCatalog(catalog.records);
  const catalogByStop = indexCatalogByStop(catalog.records);
  const catalogStopsByTour = groupCatalogStopsByTour(catalog.records);
  const { latestByTourId, previewByTourId } = readLatestReviewByTour();
  const rows = buildTourRows(catalogByTour, catalogByStop, latestByTourId, previewByTourId);
  const nextActions = buildNextActions(rows);
  const sessionHandoff = buildSessionHandoff(rows, nextActions, catalogStopsByTour);
  const dashboard = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    tours: rows
  };

  ensureDirectory(reviewsDir);
  const staleCurrentFiles = fs.readdirSync(reviewsDir).filter(
    (fileName) => fileName.endsWith("-current-approval-queue.txt") || fileName.endsWith("-current-retune-queue.md")
  );
  for (const fileName of staleCurrentFiles) {
    fs.unlinkSync(path.join(reviewsDir, fileName));
  }
  const staleDevicePassFiles = fs.readdirSync(reviewsDir).filter(
    (fileName) => fileName.endsWith("-device-pass.md") || fileName.endsWith("-device-pass.json") || fileName === "next-device-pass.md" || fileName === "next-device-pass.json"
  );
  for (const fileName of staleDevicePassFiles) {
    fs.unlinkSync(path.join(reviewsDir, fileName));
  }

  for (const row of rows) {
    if (!row.latestReview) {
      continue;
    }

    const reviewBase = path.join(reviewsDir, `${row.tourId}-current`);
    fs.writeFileSync(`${reviewBase}-approval-queue.txt`, buildTourApprovalQueue(row));
    fs.writeFileSync(`${reviewBase}-retune-queue.md`, buildTourRetuneQueue(row));
    row.latestReview.currentApprovalQueuePath = relativeRepoPath(`${reviewBase}-approval-queue.txt`);
    row.latestReview.currentRetuneQueuePath = relativeRepoPath(`${reviewBase}-retune-queue.md`);
  }

  for (const item of sessionHandoff.deviceQueue) {
    const packet = buildDevicePassPacket(item, sessionHandoff);
    const packetBase = path.join(reviewsDir, `${item.tourId}-device-pass`);
    fs.writeFileSync(`${packetBase}.json`, `${JSON.stringify(packet, null, 2)}\n`);
    fs.writeFileSync(`${packetBase}.md`, buildDevicePassPacketMarkdown(packet));
    item.devicePassPacketPath = relativeRepoPath(`${packetBase}.md`);
  }

  if (sessionHandoff.recommendedFocus) {
    sessionHandoff.recommendedFocus.devicePassPacketPath = sessionHandoff.deviceQueue[0]?.devicePassPacketPath || "";
    const recommendedPacketBase = path.join(reviewsDir, "next-device-pass");
    const recommendedPacket = buildDevicePassPacket(sessionHandoff.recommendedFocus, sessionHandoff);
    fs.writeFileSync(`${recommendedPacketBase}.json`, `${JSON.stringify(recommendedPacket, null, 2)}\n`);
    fs.writeFileSync(`${recommendedPacketBase}.md`, buildDevicePassPacketMarkdown(recommendedPacket));
  }

  fs.writeFileSync(path.join(reviewsDir, "dashboard.json"), `${JSON.stringify(dashboard, null, 2)}\n`);
  fs.writeFileSync(path.join(reviewsDir, "dashboard.md"), buildMarkdown(rows));
  fs.writeFileSync(path.join(reviewsDir, "next-actions.json"), `${JSON.stringify(nextActions, null, 2)}\n`);
  fs.writeFileSync(path.join(reviewsDir, "next-actions.md"), buildNextActionsMarkdown(nextActions));
  fs.writeFileSync(path.join(reviewsDir, "next-session-handoff.json"), `${JSON.stringify(sessionHandoff, null, 2)}\n`);
  fs.writeFileSync(path.join(reviewsDir, "next-session-handoff.md"), buildSessionHandoffMarkdown(sessionHandoff));
  fs.writeFileSync(path.join(reviewsDir, "next-preview-promotion-queue.txt"), buildAggregatePreviewPromotionQueue(nextActions));
  fs.writeFileSync(path.join(reviewsDir, "next-projected-approval-queue.txt"), buildProjectedApprovalQueue(nextActions));
  fs.writeFileSync(path.join(reviewsDir, "next-approval-queue.txt"), buildAggregateApprovalQueue(nextActions));
  fs.writeFileSync(path.join(reviewsDir, "next-retune-queue.md"), buildAggregateRetuneQueue(nextActions));
  fs.writeFileSync(path.join(reviewsDir, "first-device-review-queue.md"), buildFirstReviewQueue(nextActions));

  console.log(`Generated AR review dashboard for ${rows.length} tour(s).`);
}

main();
