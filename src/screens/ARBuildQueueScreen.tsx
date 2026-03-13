import React from "react";
import * as Clipboard from "expo-clipboard";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, SectionTitle } from "../components/ui/Primitives";
import { arAssetCatalogByStopId } from "../data/arAssetCatalog";
import { tours } from "../data/tours";
import { getARReadiness } from "../services/arPlanning";
import {
  loadBuiltSceneIds,
  loadCompletedAssetIds,
  loadQACompleteIds,
  saveBuiltSceneIds,
  saveCompletedAssetIds,
  saveQACompleteIds
} from "../services/buildQueue";
import { colors } from "../theme/tokens";
import { Stop } from "../types";

type PlannedStop = Stop & {
  tourId: string;
  tourTitle: string;
};

type ReadinessFilter = "all" | "planned" | "asset_needed" | "ready";
type EffortFilter = "all" | "low" | "medium" | "high";

export function ARBuildQueueScreen() {
  const [readinessFilter, setReadinessFilter] = React.useState<ReadinessFilter>("all");
  const [effortFilter, setEffortFilter] = React.useState<EffortFilter>("all");
  const [tourFilter, setTourFilter] = React.useState<string>("all");
  const [assetCompleteIds, setAssetCompleteIds] = React.useState<Set<string>>(() => new Set());
  const [sceneBuiltIds, setSceneBuiltIds] = React.useState<Set<string>>(() => new Set());
  const [qaCompleteIds, setQACompleteIds] = React.useState<Set<string>>(() => new Set());
  const [storageLoaded, setStorageLoaded] = React.useState(false);
  const [copyStatus, setCopyStatus] = React.useState<"idle" | "copied" | "error">("idle");

  const plannedStops = React.useMemo<PlannedStop[]>(() => {
    return tours
      .flatMap((tour) =>
        tour.stops
          .filter((stop) => typeof stop.arPriority === "number")
          .map((stop) => ({
            ...stop,
            tourId: tour.id,
            tourTitle: tour.title
          }))
      )
      .sort((left, right) => {
        const leftPriority = left.arPriority ?? Number.MAX_SAFE_INTEGER;
        const rightPriority = right.arPriority ?? Number.MAX_SAFE_INTEGER;
        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }
        return left.title.localeCompare(right.title);
      });
  }, []);

  const effectiveStops = React.useMemo(() => {
    return plannedStops.map((stop) =>
      assetCompleteIds.has(stop.id)
        ? {
            ...stop,
            assetNeeded: ""
          }
        : stop
    );
  }, [assetCompleteIds, plannedStops]);

  const filteredStops = React.useMemo(() => {
    return effectiveStops.filter((stop) => {
      const readiness = getARReadiness(stop);
      const readinessMatch = readinessFilter === "all" || readiness.key === readinessFilter;
      const effortMatch = effortFilter === "all" || stop.estimatedEffort === effortFilter;
      const tourMatch = tourFilter === "all" || stop.tourId === tourFilter;
      return readinessMatch && effortMatch && tourMatch;
    });
  }, [effectiveStops, effortFilter, readinessFilter, tourFilter]);

  const readinessCounts = React.useMemo(() => {
    return effectiveStops.reduce(
      (acc, stop) => {
        const readiness = getARReadiness(stop).key;
        acc[readiness] = (acc[readiness] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [effectiveStops]);

  const filteredCounts = React.useMemo(() => {
    return filteredStops.reduce(
      (acc, stop) => {
        const readiness = getARReadiness(stop).key;
        acc[readiness] = (acc[readiness] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [filteredStops]);

  const perTourProgress = React.useMemo(() => {
    return tours
      .map((tour) => {
        const plannedStops = effectiveStops.filter((stop) => stop.tourId === tour.id);
        if (plannedStops.length === 0) {
          return null;
        }

        const totals = plannedStops.reduce(
          (acc, stop) => {
            const readiness = getARReadiness(stop);
            if (readiness.key === "ready") {
              acc.assetsComplete += 1;
            }
            if (sceneBuiltIds.has(stop.id)) {
              acc.sceneBuilt += 1;
            }
            if (qaCompleteIds.has(stop.id)) {
              acc.qaComplete += 1;
            }
            return acc;
          },
          {
            planned: plannedStops.length,
            assetsComplete: 0,
            sceneBuilt: 0,
            qaComplete: 0
          }
        );

        return {
          tourId: tour.id,
          tourTitle: tour.title,
          ...totals
        };
      })
      .filter((tour): tour is NonNullable<typeof tour> => Boolean(tour));
  }, [effectiveStops, qaCompleteIds, sceneBuiltIds]);

  const builtVisibleCount = React.useMemo(
    () => filteredStops.filter((stop) => sceneBuiltIds.has(stop.id)).length,
    [filteredStops, sceneBuiltIds]
  );
  const qaVisibleCount = React.useMemo(
    () => filteredStops.filter((stop) => qaCompleteIds.has(stop.id)).length,
    [filteredStops, qaCompleteIds]
  );
  const localAssetPresence = React.useMemo(() => {
    return filteredStops.reduce(
      (acc, stop) => {
        const entry = arAssetCatalogByStopId.get(stop.id);
        if (!entry) {
          acc.uncataloged += 1;
          return acc;
        }
        if (entry.iosAssetExistsLocal) {
          acc.iosPresent += 1;
        } else {
          acc.iosMissing += 1;
        }
        if (entry.androidAssetExistsLocal) {
          acc.androidPresent += 1;
        } else {
          acc.androidMissing += 1;
        }
        if (entry.generatedImageExistsLocal) {
          acc.generatedPresent += 1;
        } else {
          acc.generatedMissing += 1;
        }
        return acc;
      },
      {
        iosPresent: 0,
        iosMissing: 0,
        androidPresent: 0,
        androidMissing: 0,
        generatedPresent: 0,
        generatedMissing: 0,
        uncataloged: 0
      }
    );
  }, [filteredStops]);
  const productionSummary = React.useMemo(() => {
    const readinessLabel =
      readinessFilter === "all" ? "all" : readinessFilter.replaceAll("_", " ");
    const effortLabel = effortFilter === "all" ? "all" : effortFilter;
    const tourLabel =
      tourFilter === "all"
        ? "all tours"
        : tours.find((tour) => tour.id === tourFilter)?.title || tourFilter;

    const lines = [
      "# AR Production Summary",
      "",
      `Filters: readiness=${readinessLabel}, effort=${effortLabel}, tour=${tourLabel}`,
      "",
      `Visible planned stops: ${filteredStops.length}`,
      `Visible assets needed: ${filteredCounts.asset_needed || 0}`,
      `Visible ready to build: ${filteredCounts.ready || 0}`,
      `Visible scenes built: ${builtVisibleCount}`,
      `Visible QA complete: ${qaVisibleCount}`,
      `Visible generated concept images: ${localAssetPresence.generatedPresent}`,
      "",
      "## Tour Progress"
    ];

    perTourProgress
      .filter((tour) => tourFilter === "all" || tour.tourId === tourFilter)
      .forEach((tour) => {
        lines.push(
          `- ${tour.tourTitle}: planned ${tour.planned}, assets ${tour.assetsComplete}/${tour.planned}, scenes ${tour.sceneBuilt}/${tour.planned}, QA ${tour.qaComplete}/${tour.planned}`
        );
      });

    lines.push("", "## Visible Queue");
    filteredStops.forEach((stop) => {
      const readiness = getARReadiness(stop).label;
      const pipeline = qaCompleteIds.has(stop.id)
        ? "QA complete"
        : sceneBuiltIds.has(stop.id)
          ? "Scene built"
          : assetCompleteIds.has(stop.id)
            ? "Assets complete"
            : "Planned";
      lines.push(
        `- P${stop.arPriority} | ${stop.tourTitle} | ${stop.title} | ${stop.arType || "unassigned"} | readiness: ${readiness} | pipeline: ${pipeline} | effort: ${stop.estimatedEffort || "n/a"}`
      );
    });

    return lines.join("\n");
  }, [
    assetCompleteIds,
    builtVisibleCount,
    effortFilter,
    filteredCounts.asset_needed,
    filteredCounts.ready,
    filteredStops,
    perTourProgress,
    qaCompleteIds,
    qaVisibleCount,
    readinessFilter,
    sceneBuiltIds,
    tourFilter,
    localAssetPresence.generatedPresent
  ]);

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const [assetIds, builtIds, qaIds] = await Promise.all([
        loadCompletedAssetIds(),
        loadBuiltSceneIds(),
        loadQACompleteIds()
      ]);
      if (cancelled) {
        return;
      }
      setAssetCompleteIds(new Set(assetIds));
      setSceneBuiltIds(new Set(builtIds));
      setQACompleteIds(new Set(qaIds));
      setStorageLoaded(true);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    saveCompletedAssetIds(Array.from(assetCompleteIds));
  }, [assetCompleteIds, storageLoaded]);

  React.useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    saveBuiltSceneIds(Array.from(sceneBuiltIds));
  }, [sceneBuiltIds, storageLoaded]);

  React.useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    saveQACompleteIds(Array.from(qaCompleteIds));
  }, [qaCompleteIds, storageLoaded]);

  function toggleAssetComplete(stopId: string) {
    setAssetCompleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(stopId)) {
        next.delete(stopId);
        setSceneBuiltIds((scenePrev) => {
          const sceneNext = new Set(scenePrev);
          sceneNext.delete(stopId);
          return sceneNext;
        });
        setQACompleteIds((qaPrev) => {
          const qaNext = new Set(qaPrev);
          qaNext.delete(stopId);
          return qaNext;
        });
      } else {
        next.add(stopId);
      }
      return next;
    });
  }

  function toggleSceneBuilt(stopId: string) {
    setSceneBuiltIds((prev) => {
      const next = new Set(prev);
      if (next.has(stopId)) {
        next.delete(stopId);
        setQACompleteIds((qaPrev) => {
          const qaNext = new Set(qaPrev);
          qaNext.delete(stopId);
          return qaNext;
        });
      } else {
        next.add(stopId);
      }
      return next;
    });
  }

  function toggleQAComplete(stopId: string) {
    setQACompleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(stopId)) {
        next.delete(stopId);
      } else {
        next.add(stopId);
      }
      return next;
    });
  }

  async function copySummary() {
    try {
      await Clipboard.setStringAsync(productionSummary);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionTitle>AR Build Queue</SectionTitle>
      <Text style={styles.helper}>
        Cross-tour production queue for planned AR stops. Sorted by priority so asset work and native scene work stay aligned.
      </Text>

      <View style={styles.chips}>
        <Chip label={`Planned stops: ${plannedStops.length}`} tone="success" />
        <Chip label={`Assets needed: ${readinessCounts.asset_needed || 0}`} tone="warn" />
        <Chip label={`Ready: ${readinessCounts.ready || 0}`} tone="success" />
        <Chip label={`Planned only: ${readinessCounts.planned || 0}`} tone="default" />
        <Chip label={`Assets marked complete: ${assetCompleteIds.size}`} tone={assetCompleteIds.size > 0 ? "success" : "default"} />
        <Chip label={`Scenes built: ${sceneBuiltIds.size}`} tone={sceneBuiltIds.size > 0 ? "success" : "default"} />
        <Chip label={`QA complete: ${qaCompleteIds.size}`} tone={qaCompleteIds.size > 0 ? "success" : "default"} />
        <Chip label={storageLoaded ? "Progress saved locally" : "Loading saved progress"} tone={storageLoaded ? "success" : "default"} />
      </View>

      <Card style={styles.card}>
        <Text style={styles.title}>Filters</Text>
        <View style={styles.chips}>
          {(["all", "planned", "asset_needed", "ready"] as ReadinessFilter[]).map((value) => (
            <Pressable
              key={value}
              onPress={() => setReadinessFilter(value)}
            >
              <Chip
                label={value === "all" ? "All readiness" : value.replaceAll("_", " ")}
                tone={readinessFilter === value ? "success" : "default"}
              />
            </Pressable>
          ))}
        </View>
        <View style={styles.chips}>
          {(["all", "low", "medium", "high"] as EffortFilter[]).map((value) => (
            <Pressable
              key={value}
              onPress={() => setEffortFilter(value)}
            >
              <Chip
                label={value === "all" ? "All effort" : value}
                tone={effortFilter === value ? "success" : "default"}
              />
            </Pressable>
          ))}
        </View>
        <View style={styles.chips}>
          <Pressable onPress={() => setTourFilter("all")}>
            <Chip label={tourFilter === "all" ? "All tours" : "Reset tours"} tone={tourFilter === "all" ? "success" : "default"} />
          </Pressable>
          {tours
            .filter((tour) => tour.stops.some((stop) => typeof stop.arPriority === "number"))
            .map((tour) => (
              <Pressable
                key={tour.id}
                onPress={() => setTourFilter(tour.id)}
              >
                <Chip
                  label={tour.title}
                  tone={tourFilter === tour.id ? "success" : "default"}
                />
              </Pressable>
            ))}
        </View>
      </Card>

      <View style={styles.chips}>
        <Chip label={`Visible: ${filteredStops.length}`} tone="success" />
        <Chip label={`Visible assets needed: ${filteredCounts.asset_needed || 0}`} tone="warn" />
        <Chip label={`Visible ready: ${filteredCounts.ready || 0}`} tone="success" />
        <Chip label={`Visible scenes built: ${builtVisibleCount}`} tone="success" />
        <Chip label={`Visible QA complete: ${qaVisibleCount}`} tone="success" />
        <Chip label={`iOS files present: ${localAssetPresence.iosPresent}`} tone={localAssetPresence.iosPresent > 0 ? "success" : "default"} />
        <Chip label={`iOS files missing: ${localAssetPresence.iosMissing}`} tone={localAssetPresence.iosMissing > 0 ? "danger" : "success"} />
        <Chip label={`Android files present: ${localAssetPresence.androidPresent}`} tone={localAssetPresence.androidPresent > 0 ? "success" : "default"} />
        <Chip label={`Android files missing: ${localAssetPresence.androidMissing}`} tone={localAssetPresence.androidMissing > 0 ? "danger" : "success"} />
        <Chip label={`Concept images present: ${localAssetPresence.generatedPresent}`} tone={localAssetPresence.generatedPresent > 0 ? "success" : "default"} />
        <Chip label={`Concept images missing: ${localAssetPresence.generatedMissing}`} tone={localAssetPresence.generatedMissing > 0 ? "warn" : "success"} />
      </View>

      <Card style={styles.card}>
        <Text style={styles.title}>Tour Progress</Text>
        {perTourProgress
          .filter((tour) => tourFilter === "all" || tour.tourId === tourFilter)
          .map((tour) => (
            <View key={tour.tourId} style={styles.tourProgressRow}>
              <Text style={styles.tour}>{tour.tourTitle}</Text>
              <View style={styles.chips}>
                <Chip label={`Planned ${tour.planned}`} tone="default" />
                <Chip label={`Assets ${tour.assetsComplete}/${tour.planned}`} tone={tour.assetsComplete > 0 ? "success" : "default"} />
                <Chip label={`Scenes ${tour.sceneBuilt}/${tour.planned}`} tone={tour.sceneBuilt > 0 ? "success" : "default"} />
                <Chip label={`QA ${tour.qaComplete}/${tour.planned}`} tone={tour.qaComplete > 0 ? "success" : "default"} />
              </View>
            </View>
          ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Export Summary</Text>
        <Text style={styles.meta}>
          Markdown snapshot of the current Build tab state, including active filters and per-tour pipeline counts.
        </Text>
        <View style={styles.chips}>
          <Pressable style={styles.actionButton} onPress={copySummary}>
            <Text style={styles.actionButtonText}>Copy Summary</Text>
          </Pressable>
          {copyStatus === "copied" ? <Chip label="Copied to clipboard" tone="success" /> : null}
          {copyStatus === "error" ? <Chip label="Copy failed" tone="danger" /> : null}
        </View>
        <Text selectable style={styles.summaryBlock}>
          {productionSummary}
        </Text>
      </Card>

      {filteredStops.map((stop) => {
        const readiness = getARReadiness(stop);
        const sceneBuilt = sceneBuiltIds.has(stop.id);
        const qaComplete = qaCompleteIds.has(stop.id);
        const catalogEntry = arAssetCatalogByStopId.get(stop.id);
        return (
          <Card key={stop.id} style={styles.card}>
            <Text style={styles.priority}>Priority {stop.arPriority}</Text>
            <Text style={styles.title}>{stop.title}</Text>
            <Text style={styles.tour}>{stop.tourTitle}</Text>
            <View style={styles.chips}>
              <Chip label={stop.arType || "not assigned"} tone={stop.arType ? "warn" : "default"} />
              <Chip label={readiness.label} tone={readiness.tone} />
              <Chip label={`Effort: ${stop.estimatedEffort || "n/a"}`} tone="default" />
              {assetCompleteIds.has(stop.id) ? <Chip label="Assets marked complete" tone="success" /> : null}
              {sceneBuilt ? <Chip label="Scene built" tone="success" /> : null}
              {qaComplete ? <Chip label="QA complete" tone="success" /> : null}
              {catalogEntry?.iosAssetExistsLocal ? (
                <Chip label="iOS file present" tone="success" />
              ) : (
                <Chip label="iOS file missing" tone="danger" />
              )}
              {catalogEntry?.androidAssetExistsLocal ? (
                <Chip label="Android file present" tone="success" />
              ) : (
                <Chip label="Android file missing" tone="danger" />
              )}
              {catalogEntry?.generatedImageExistsLocal ? (
                <Chip label="Concept image present" tone="success" />
              ) : (
                <Chip label="Concept image missing" tone="warn" />
              )}
            </View>
            <Text style={styles.meta}>Coords: {stop.coordQuality || "approximate"} | Radius: {stop.triggerRadiusM}m</Text>
            <Text style={styles.asset}>Asset brief: {stop.assetNeeded || "No asset blockers remaining"}</Text>
            <Text style={styles.meta}>
              Catalog asset paths: iOS {catalogEntry?.iosAsset || "n/a"} | Android {catalogEntry?.androidAsset || "n/a"}
            </Text>
            <Text style={styles.meta}>
              Fal concept image: {catalogEntry?.generatedImagePath || "n/a"} | Model {catalogEntry?.falModel || "n/a"}
            </Text>
            <Pressable style={styles.actionButton} onPress={() => toggleAssetComplete(stop.id)}>
              <Text style={styles.actionButtonText}>
                {assetCompleteIds.has(stop.id) ? "Mark Assets Incomplete" : "Mark Assets Complete"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, !assetCompleteIds.has(stop.id) && styles.actionButtonDisabled]}
              disabled={!assetCompleteIds.has(stop.id)}
              onPress={() => toggleSceneBuilt(stop.id)}
            >
              <Text style={styles.actionButtonText}>
                {sceneBuilt ? "Mark Scene Not Built" : "Mark Scene Built"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, !sceneBuilt && styles.actionButtonDisabled]}
              disabled={!sceneBuilt}
              onPress={() => toggleQAComplete(stop.id)}
            >
              <Text style={styles.actionButtonText}>
                {qaComplete ? "Mark QA Incomplete" : "Mark QA Complete"}
              </Text>
            </Pressable>
            <Text style={styles.description}>{stop.description}</Text>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  helper: { color: colors.textSoft, lineHeight: 20 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: { gap: 6, backgroundColor: colors.panel },
  tourProgressRow: { gap: 6, paddingTop: 4, paddingBottom: 8 },
  priority: { color: colors.warn, fontWeight: "800" },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  tour: { color: colors.info, fontWeight: "700" },
  meta: { color: colors.textMuted, fontSize: 13 },
  asset: { color: "#fde68a", fontSize: 14, lineHeight: 20 },
  description: { color: colors.textSoft, fontSize: 14, lineHeight: 20 },
  summaryBlock: {
    color: colors.text,
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    lineHeight: 18
  },
  actionButton: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center"
  },
  actionButtonDisabled: {
    opacity: 0.75
  },
  actionButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13
  }
});
