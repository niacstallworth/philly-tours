import React from "react";
import { useNarration } from "../hooks/useNarration";
import { getNarrationCoverage, startNarration, stopNarration, type NarrationCoverage } from "../services/narration";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { useDriveSession } from "../hooks/useDriveSession";
import { getHandoffModeMeta, parseHandoffUrl } from "../services/deepLinks";
import { triggerHandoffTarget } from "../services/handoffBus";
import {
  advanceDriveSession,
  clearDriveSession,
  getCurrentDriveStop,
  getDriveStops,
  getDriveTourSummaries,
  getNextDriveStop,
  markDriveArrived,
  startDriveSession
} from "../services/driveMode";

type Props = {
  initialTourId?: string;
};

const driveTours = getDriveTourSummaries();

function buildTourCardMediaUrl(src?: string) {
  const trimmed = String(src || "").trim();
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://philly-tours.com${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

function getDriveTourThemeLabel(title: string) {
  const source = title.toLowerCase();
  if (source.includes("library")) return "Books";
  if (source.includes("sports")) return "Sports";
  if (source.includes("inventor")) return "Innovation";
  if (source.includes("medical")) return "Medicine";
  if (source.includes("rainbow")) return "Family";
  if (source.includes("college") || source.includes("divine")) return "Campus";
  if (source.includes("speakeasy")) return "Nightlife";
  return "History";
}

function getDriveTourSummary(tourId: string, durationMin: number, stopCount: number, distanceMiles: number) {
  const sourceTour = tours.find((entry) => entry.id === tourId);
  const leadStops = sourceTour?.stops.slice(0, 2).map((stop) => stop.title) || [];
  const opener = leadStops.length ? `${leadStops.join(" and ")} anchor this route.` : "A story-led Philadelphia route.";
  return durationMin >= 90
    ? `${opener} ${stopCount} stops across ${distanceMiles} miles for a longer city session.`
    : `${opener} ${stopCount} stops across ${distanceMiles} miles with clear pacing and route-first touring.`;
}

function getFullAudioStopCount(tourId: string) {
  return getDriveStops(tourId).filter((stop) => getNarrationCoverage(stop.id) === "full_audio").length;
}

export function DriveScreen({ initialTourId }: Props) {
  const [selectedTourId, setSelectedTourId] = React.useState<string>(initialTourId || driveTours[0]?.id || "");
  const [fullAudioOnly, setFullAudioOnly] = React.useState(false);
  const { driveSession, setDriveSession, loading } = useDriveSession();
  const narration = useNarration();
  const autoNarratedStopIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (initialTourId && driveTours.some((tour) => tour.id === initialTourId)) {
      setSelectedTourId(initialTourId);
    }
  }, [initialTourId]);

  React.useEffect(() => {
    if (driveSession?.tourId) {
      setSelectedTourId(driveSession.tourId);
    }
  }, [driveSession?.tourId]);

  const visibleDriveTours = React.useMemo(
    () => (fullAudioOnly ? driveTours.filter((tour) => getFullAudioStopCount(tour.id) === tour.stopCount) : driveTours),
    [fullAudioOnly]
  );
  const selectedTour = React.useMemo(
    () => visibleDriveTours.find((tour) => tour.id === selectedTourId) || visibleDriveTours[0],
    [selectedTourId, visibleDriveTours]
  );
  const driveStops = React.useMemo(() => getDriveStops(selectedTour?.id || ""), [selectedTour?.id]);
  const selectedTourFullAudioCount = React.useMemo(
    () => (selectedTour ? driveStops.filter((stop) => getNarrationCoverage(stop.id) === "full_audio").length : 0),
    [driveStops, selectedTour]
  );
  const activeSession = driveSession?.tourId === selectedTour?.id ? driveSession : null;
  const currentStop = React.useMemo(() => getCurrentDriveStop(activeSession), [activeSession]);
  const nextStop = React.useMemo(
    () => (activeSession ? getNextDriveStop(activeSession) : driveStops[0] || null),
    [activeSession, driveStops]
  );
  const currentHandoffMeta = React.useMemo(
    () => (currentStop ? getHandoffModeMeta(currentStop.handoffDeepLink.endsWith("/ar") ? "map" : "arrive") : null),
    [currentStop]
  );
  const nextHandoffMeta = React.useMemo(
    () => (nextStop ? getHandoffModeMeta(nextStop.handoffDeepLink.endsWith("/ar") ? "map" : "arrive") : null),
    [nextStop]
  );
  const activeNarrationStop = (narration.stopId ? [currentStop, nextStop].find((stop) => stop?.id === narration.stopId) : null) || null;

  React.useEffect(() => {
    if (!currentStop || activeSession?.mode !== "arrived") {
      return;
    }
    if (autoNarratedStopIdRef.current === currentStop.id) {
      return;
    }
    autoNarratedStopIdRef.current = currentStop.id;
    startNarration(currentStop, "drive").catch(() => undefined);
  }, [activeSession?.mode, currentStop]);

  React.useEffect(() => {
    if (activeSession?.mode !== "arrived") {
      autoNarratedStopIdRef.current = null;
    }
  }, [activeSession?.mode]);

  async function previewArrivalHandoff() {
    const targetStop = activeSession ? currentStop : nextStop;
    if (!targetStop) {
      return;
    }
    const parsed = parseHandoffUrl(targetStop.handoffDeepLink);
    if (!parsed) {
      Alert.alert("Handoff unavailable", "Could not resolve the handoff target.");
      return;
    }
    triggerHandoffTarget(parsed);
  }

  async function onStartDriveSession() {
    if (!selectedTour) {
      return;
    }
    try {
      const nextSession = await startDriveSession(selectedTour.id);
      setDriveSession(nextSession);
    } catch (error) {
      Alert.alert("Drive session unavailable", (error as Error).message || "Could not start this drive session.");
    }
  }

  async function onMarkArrived() {
    if (!activeSession) {
      return;
    }
    try {
      const nextSession = await markDriveArrived(activeSession);
      setDriveSession(nextSession);
    } catch (error) {
      Alert.alert("Arrival update failed", (error as Error).message || "Could not update arrival state.");
    }
  }

  async function onPlayNarration() {
    const targetStop = currentStop || nextStop;
    if (!targetStop) {
      return;
    }
    try {
      await startNarration(targetStop, "drive");
    } catch (error) {
      Alert.alert("Narration unavailable", (error as Error).message || "Could not start narration.");
    }
  }

  async function onStopNarration() {
    await stopNarration();
  }

  function getCoverageMeta(coverage: NarrationCoverage) {
    switch (coverage) {
      case "full_audio":
        return { label: "Full audio", tone: "success" as const };
      case "partial_audio":
        return { label: "Partial audio", tone: "warn" as const };
      case "script_only":
        return { label: "Script voice", tone: "default" as const };
      default:
        return { label: "Basic voice", tone: "default" as const };
    }
  }

  async function onAdvanceStop() {
    if (!activeSession) {
      return;
    }
    try {
      await stopNarration();
      const nextSession = await advanceDriveSession(activeSession);
      setDriveSession(nextSession);
      if (!nextSession) {
        Alert.alert("Drive session complete", "You reached the last stop in this drive route.");
      }
    } catch (error) {
      Alert.alert("Advance failed", (error as Error).message || "Could not move to the next stop.");
    }
  }

  async function onClearSession() {
    await clearDriveSession();
    setDriveSession(null);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <View style={styles.heroGlowPrimary} />
        <View style={styles.heroGlowSecondary} />
        <Text style={styles.heroEyebrow}>Route planner</Text>
        <Text style={styles.heroTitle}>Choose the right Philadelphia route without guessing where to start.</Text>
        <Text style={styles.heroCopy}>
          Keep the route visible, follow the stop order, and move into narration or handoff only when the stop is ready.
        </Text>
      </View>

      <Card style={styles.panel}>
        <View style={styles.routeHeader}>
          <Text style={styles.label}>Collections</Text>
          <PrimaryButton label={fullAudioOnly ? "Showing Full Audio Routes" : "Showing All Routes"} onPress={() => setFullAudioOnly((value) => !value)} />
        </View>
        <View style={styles.routeCatalogGrid}>
          {visibleDriveTours.map((tour, index) => {
            const isActive = selectedTourId === tour.id;
            const hasSession = driveSession?.tourId === tour.id;
            const fullAudioCount = getFullAudioStopCount(tour.id);
            const sourceTour = tours.find((entry) => entry.id === tour.id);
            const mediaUrl = buildTourCardMediaUrl(sourceTour?.cardMedia?.src);
            const accentPairs = [
              ["#5d42ff", "#a68eff"],
              ["#ff8b5c", "#ffd38b"],
              ["#1e2a68", "#6aa5ff"],
              ["#6c1f52", "#ff7db6"]
            ] as const;
            const [accent, glow] = accentPairs[index % accentPairs.length];
            return (
              <Pressable
                key={tour.id}
                onPress={() => setSelectedTourId(tour.id)}
                style={[styles.routeCatalogCard, isActive && styles.routeCatalogCardActive]}
              >
                <View style={[styles.routeCatalogMedia, { backgroundColor: accent }]}>
                  {mediaUrl ? <Image source={{ uri: mediaUrl }} style={styles.routeCatalogImage} resizeMode="cover" /> : null}
                  <View style={styles.routeCatalogFallback}>
                    <View style={[styles.routeCatalogGlow, { backgroundColor: glow }]} />
                  </View>
                  <View style={styles.routeCatalogScrim} />
                  <View style={styles.routeCatalogPill}>
                    <Text style={styles.routeCatalogPillText}>{getDriveTourThemeLabel(tour.title)}</Text>
                  </View>
                  <View style={styles.routeCatalogCopy}>
                    <Text style={styles.routeCatalogEyebrow}>{tour.stopCount} stops{hasSession ? " • live" : ""}</Text>
                    <Text style={styles.routeCatalogTitle}>{tour.title}</Text>
                    <Text style={styles.routeCatalogInlineMeta}>{tour.durationMin} min · {tour.distanceMiles} mi · {fullAudioCount}/{tour.stopCount} full audio</Text>
                  </View>
                </View>
                <View style={styles.routeCatalogBody}>
                  <Text style={styles.routeCatalogBodyCopy}>{getDriveTourSummary(tour.id, tour.durationMin, tour.stopCount, tour.distanceMiles)}</Text>
                  <View style={styles.chips}>
                    <Chip label={tour.heroStopTitle ? `Start with ${tour.heroStopTitle}` : "Start route"} tone="warn" />
                    <Chip label={isActive ? "Selected route" : "Tap to select"} tone={isActive ? "success" : "default"} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
        {fullAudioOnly && visibleDriveTours.length === 0 ? <Text style={styles.copy}>No routes are fully audio-ready yet.</Text> : null}
      </Card>

      {selectedTour ? (
        <Card style={styles.featureCard}>
          <Text style={styles.featureEyebrow}>Selected route page</Text>
          <Text style={styles.featureTitle}>{selectedTour.title}</Text>
          <Text style={styles.featureBody}>
            {getDriveTourSummary(selectedTour.id, selectedTour.durationMin, selectedTour.stopCount, selectedTour.distanceMiles)}
          </Text>
          <View style={styles.chips}>
            <Chip label={`${selectedTour.durationMin} min`} tone="default" />
            <Chip label={`${selectedTour.distanceMiles} mi`} tone="default" />
            <Chip label={`${selectedTour.stopCount} stops`} tone="warn" />
            <Chip label={activeSession ? `Session ${activeSession.mode}` : loading ? "Loading session" : "Ready to start"} tone="success" />
            <Chip label={`${selectedTourFullAudioCount}/${selectedTour.stopCount} full audio`} tone="default" />
          </View>
        </Card>
      ) : null}

      {(currentStop || nextStop) ? (
        <Card style={styles.panel}>
          {currentStop ? (
            <>
              <Text style={styles.label}>Current stop</Text>
              <Text style={styles.nextStopTitle}>{currentStop.title}</Text>
              <Text style={styles.copy}>{currentStop.arrivalSummary}</Text>
              <View style={styles.chips}>
                <Chip label={activeSession?.mode === "arrived" ? "Arrived" : "Driving now"} tone="success" />
                <Chip label={currentHandoffMeta?.chipLabel || "On-foot handoff"} tone="warn" />
                <Chip {...getCoverageMeta(getNarrationCoverage(currentStop.id))} />
              </View>
              {activeSession?.mode === "arrived" && currentHandoffMeta ? <Text style={styles.arrivalCallout}>{currentHandoffMeta.summary}</Text> : null}
              <Text style={styles.specLabel}>Handoff link</Text>
              <Text style={styles.handoffLink}>{currentStop.handoffDeepLink}</Text>
            </>
          ) : null}

          {nextStop ? (
            <>
              <Text style={styles.label}>{currentStop ? "Up next" : "Next stop"}</Text>
              <Text style={styles.nextStopTitle}>{nextStop.title}</Text>
              <Text style={styles.copy}>{nextStop.arrivalSummary}</Text>
              <View style={styles.chips}>
                <Chip label={`${nextStop.triggerRadiusM}m arrival radius`} tone="default" />
                <Chip label={nextHandoffMeta?.chipLabel || "Continue on foot"} tone="success" />
                <Chip {...getCoverageMeta(getNarrationCoverage(nextStop.id))} />
              </View>
            </>
          ) : null}

          <Card style={styles.narrationCard}>
            <Text style={styles.label}>Narration</Text>
            <Text style={styles.copy}>
              {narration.message}
              {activeNarrationStop ? ` ${activeNarrationStop.title}.` : ""}
            </Text>
            <View style={styles.chips}>
              <Chip label={`State ${narration.status}`} tone={narration.status === "playing" ? "success" : narration.status === "error" ? "danger" : "default"} />
              <Chip label={narration.source === "audio" ? "Recorded audio" : narration.source === "speech" ? "Live voice preview" : "No source yet"} tone="warn" />
              <Chip label={narration.target === "companion" ? "To connected audio" : narration.target === "phone" ? "To current output" : "No target"} tone="default" />
            </View>
            <View style={styles.actions}>
              <PrimaryButton label={narration.status === "playing" ? "Replay Narration" : "Play Narration"} onPress={onPlayNarration} />
              {(narration.status === "playing" || narration.status === "loading") ? <PrimaryButton label="Stop Narration" onPress={onStopNarration} /> : null}
            </View>
          </Card>

          <View style={styles.actions}>
            {!activeSession ? <PrimaryButton label="Start Drive Session" onPress={onStartDriveSession} /> : null}
            {activeSession && activeSession.mode !== "arrived" ? (
              <PrimaryButton label="Mark Arrived" onPress={onMarkArrived} />
            ) : null}
            {activeSession?.mode === "arrived" && currentHandoffMeta ? (
              <PrimaryButton label={currentHandoffMeta.ctaLabel} onPress={previewArrivalHandoff} />
            ) : null}
            {activeSession ? <PrimaryButton label="Advance To Next Stop" onPress={onAdvanceStop} /> : null}
            {activeSession ? <PrimaryButton label="Clear Drive Session" onPress={onClearSession} /> : null}
          </View>
        </Card>
      ) : null}

      <Card style={styles.panel}>
        <Text style={styles.label}>Upcoming stops</Text>
        {driveStops.slice(0, 5).map((stop, index) => {
          const isCurrent = currentStop?.id === stop.id;
          const isNext = nextStop?.id === stop.id;
          return (
            <View key={stop.id} style={styles.stopRow}>
              <View style={[styles.stopIndexWrap, isCurrent && styles.stopIndexWrapCurrent, isNext && styles.stopIndexWrapNext]}>
                <Text style={styles.stopIndex}>{index + 1}</Text>
              </View>
              <View style={styles.stopContent}>
                <Text style={styles.stopTitle}>
                  {stop.title}
                  {isCurrent ? " • current" : isNext ? " • next" : ""}
                </Text>
                <View style={styles.chips}>
                  <Chip {...getCoverageMeta(getNarrationCoverage(stop.id))} />
                </View>
                <Text style={styles.copy}>{stop.arrivalSummary}</Text>
              </View>
            </View>
          );
        })}
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.label}>Vehicle product rules</Text>
        <Text style={styles.copy}>Use the dashboard to route and narrate. Use the phone to pay, browse deeply, and launch AR on foot.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 18,
    backgroundColor: "#060312"
  },
  heroPanel: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#130a25",
    borderRadius: 32,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 173, 0.16)",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5
  },
  heroGlowPrimary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(91, 56, 245, 0.24)",
    top: -92,
    right: -74
  },
  heroGlowSecondary: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(255, 188, 138, 0.12)",
    bottom: -90,
    left: -58
  },
  heroEyebrow: {
    color: "#ff9ab2",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  heroTitle: {
    color: "#fff3ea",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800"
  },
  heroCopy: {
    color: "#d8c7df",
    lineHeight: 21
  },
  panel: {
    backgroundColor: "#120a22",
    gap: 14
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  routeCatalogGrid: {
    gap: 16
  },
  routeCatalogCard: {
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.14)",
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  routeCatalogCardActive: {
    borderColor: "rgba(92, 69, 255, 0.24)",
    shadowOpacity: 0.18
  },
  routeCatalogMedia: {
    position: "relative",
    minHeight: 210,
    justifyContent: "flex-end",
    padding: 16
  },
  routeCatalogImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0
  },
  routeCatalogFallback: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  routeCatalogGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    right: -80,
    bottom: -90,
    opacity: 0.45
  },
  routeCatalogScrim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(5, 6, 12, 0.28)"
  },
  routeCatalogPill: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)"
  },
  routeCatalogPillText: {
    color: "#0f172a",
    fontSize: 11,
    fontWeight: "800"
  },
  routeCatalogCopy: {
    position: "relative",
    zIndex: 1
  },
  routeCatalogEyebrow: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  routeCatalogTitle: {
    marginTop: 6,
    color: "#ffffff",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800"
  },
  routeCatalogInlineMeta: {
    marginTop: 8,
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    fontWeight: "700"
  },
  routeCatalogBody: {
    padding: 16,
    gap: 12
  },
  routeCatalogBodyCopy: {
    color: "#334155",
    lineHeight: 20
  },
  narrationCard: {
    marginTop: 8,
    backgroundColor: "#150d22",
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 26
  },
  featureCard: {
    backgroundColor: "#2b1530",
    borderColor: "rgba(255, 176, 132, 0.2)",
    gap: 12,
    borderRadius: 30
  },
  featureEyebrow: {
    color: "#ffbc8a",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9
  },
  featureTitle: {
    color: "#fff8f3",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800"
  },
  featureBody: {
    color: "#f3e8ef",
    lineHeight: 22
  },
  label: {
    color: "#fff0e4",
    fontSize: 18,
    fontWeight: "800"
  },
  tourWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  tourChip: {
    backgroundColor: "#1f1233",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: "hidden",
    minWidth: 170
  },
  tourChipActive: {
    backgroundColor: "rgba(91, 56, 245, 0.24)",
    borderColor: "#7d63ff"
  },
  tourChipEyebrow: {
    color: "#9d8aa8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  tourChipEyebrowActive: {
    color: "#cfc3ff"
  },
  tourChipText: {
    color: "#cab6d2",
    fontWeight: "700"
  },
  tourChipTextActive: {
    color: "#fff4ed"
  },
  tourChipMeta: {
    color: "#9d8aa8",
    fontSize: 12,
    fontWeight: "600"
  },
  tourChipMetaActive: {
    color: "#d8c7df"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  nextStopTitle: {
    color: "#fff8f3",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800"
  },
  arrivalCallout: {
    color: "#f5e1ea",
    lineHeight: 21
  },
  specLabel: {
    color: "#ffcfb5",
    fontWeight: "700"
  },
  handoffLink: {
    color: "#b9f0df",
    fontWeight: "700"
  },
  actions: {
    gap: 10
  },
  stopRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.02)"
  },
  stopIndexWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#231338",
    alignItems: "center",
    justifyContent: "center"
  },
  stopIndexWrapCurrent: {
    backgroundColor: "#ff8ca8"
  },
  stopIndexWrapNext: {
    backgroundColor: "#8fd7c3"
  },
  stopIndex: {
    color: "#fff3ea",
    fontWeight: "800"
  },
  stopContent: {
    flex: 1,
    gap: 4
  },
  stopTitle: {
    color: "#fff5ee",
    fontWeight: "800"
  },
  copy: {
    color: "#d8c7df",
    lineHeight: 21
  }
});
