import React from "react";
import { useNarration } from "../hooks/useNarration";
import { getNarrationCoverage, startNarration, stopNarration, type NarrationCoverage } from "../services/narration";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
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
        <Text style={styles.heroEyebrow}>Drive companion</Text>
        <Text style={styles.heroTitle}>Route first. Audio next. Handoff on arrival.</Text>
        <Text style={styles.heroCopy}>
          This is the phone-side version of the future vehicle experience. It stays short, safe, and built around the next stop.
        </Text>
      </View>

      <Card style={styles.panel}>
        <View style={styles.routeHeader}>
          <Text style={styles.label}>Tour route</Text>
          <PrimaryButton label={fullAudioOnly ? "Showing Full Audio Routes" : "Showing All Routes"} onPress={() => setFullAudioOnly((value) => !value)} />
        </View>
        <View style={styles.tourWrap}>
          {visibleDriveTours.map((tour) => {
            const isActive = selectedTourId === tour.id;
            const hasSession = driveSession?.tourId === tour.id;
            const fullAudioCount = getFullAudioStopCount(tour.id);
            return (
              <Pressable
                key={tour.id}
                onPress={() => setSelectedTourId(tour.id)}
                style={[styles.tourChip, isActive && styles.tourChipActive]}
              >
                <Text style={[styles.tourChipText, isActive && styles.tourChipTextActive]}>
                  {tour.title}{hasSession ? " • live" : ""}
                </Text>
                <Text style={[styles.tourChipMeta, isActive && styles.tourChipMetaActive]}>
                  {fullAudioCount}/{tour.stopCount} full audio
                </Text>
              </Pressable>
            );
          })}
        </View>
        {fullAudioOnly && visibleDriveTours.length === 0 ? <Text style={styles.copy}>No routes are fully audio-ready yet.</Text> : null}
      </Card>

      {selectedTour ? (
        <Card style={styles.featureCard}>
          <Text style={styles.featureEyebrow}>Current drive plan</Text>
          <Text style={styles.featureTitle}>{selectedTour.title}</Text>
          <Text style={styles.featureBody}>
            {selectedTour.durationMin} min | {selectedTour.distanceMiles} mi | {selectedTour.stopCount} stops
          </Text>
          <View style={styles.chips}>
            <Chip label={`Hero stop ${selectedTour.heroStopTitle || "selected"}`} tone="warn" />
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
              <Chip label={narration.target === "companion" ? "To Meta glasses" : narration.target === "phone" ? "To phone" : "No target"} tone="default" />
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
    backgroundColor: "#130a25",
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 173, 0.16)"
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
    gap: 12
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  narrationCard: {
    marginTop: 8,
    backgroundColor: "#150d22",
    borderColor: "rgba(255,255,255,0.06)"
  },
  featureCard: {
    backgroundColor: "#2b1530",
    borderColor: "rgba(255, 176, 132, 0.2)",
    gap: 12
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
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden"
  },
  tourChipActive: {
    backgroundColor: "#ff8ca8",
    borderColor: "#ff8ca8"
  },
  tourChipText: {
    color: "#cab6d2",
    fontWeight: "700"
  },
  tourChipTextActive: {
    color: "#2b1021"
  },
  tourChipMeta: {
    color: "#9d8aa8",
    fontSize: 12,
    fontWeight: "600"
  },
  tourChipMetaActive: {
    color: "#472034"
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
    paddingVertical: 6
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
