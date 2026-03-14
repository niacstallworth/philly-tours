import React from "react";
import { useNarration } from "../hooks/useNarration";
import { startNarration, stopNarration } from "../services/narration";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { useDriveSession } from "../hooks/useDriveSession";
import { getHandoffModeMeta, parseHandoffUrl, type HandoffMode } from "../services/deepLinks";
import { triggerHandoffTarget } from "../services/handoffBus";
import { getCurrentDriveStop, getNextDriveStop } from "../services/driveMode";

type Props = {
  displayName?: string;
  initialSelectedTourId?: string;
  highlightedStopId?: string;
  handoffMode?: "arrive" | "map" | "ar";
};

export function HomeScreen({
  displayName = "Founder",
  initialSelectedTourId,
  highlightedStopId,
  handoffMode
}: Props) {
  const [selectedTourId, setSelectedTourId] = React.useState<string>(initialSelectedTourId || tours[0]?.id || "");
  const { driveSession } = useDriveSession();
  const narration = useNarration();
  React.useEffect(() => {
    if (initialSelectedTourId && tours.some((tour) => tour.id === initialSelectedTourId)) {
      setSelectedTourId(initialSelectedTourId);
    }
  }, [initialSelectedTourId]);
  React.useEffect(() => {
    if (!initialSelectedTourId && driveSession?.tourId && tours.some((tour) => tour.id === driveSession.tourId)) {
      setSelectedTourId(driveSession.tourId);
    }
  }, [driveSession?.tourId, initialSelectedTourId]);
  const selectedTour = React.useMemo(() => tours.find((tour) => tour.id === selectedTourId) || tours[0], [selectedTourId]);
  const activeDriveTour = React.useMemo(
    () => (driveSession ? tours.find((tour) => tour.id === driveSession.tourId) || null : null),
    [driveSession]
  );
  const currentDriveStop = React.useMemo(() => getCurrentDriveStop(driveSession), [driveSession]);
  const nextDriveStop = React.useMemo(() => getNextDriveStop(driveSession), [driveSession]);
  const activeHandoffMode: HandoffMode = handoffMode || (currentDriveStop?.handoffDeepLink.endsWith("/ar") ? "ar" : "arrive");
  const activeHandoffMeta = React.useMemo(() => getHandoffModeMeta(activeHandoffMode), [activeHandoffMode]);
  const highlightedStop = React.useMemo(
    () => {
      const preferredStopId = highlightedStopId || currentDriveStop?.id;
      return selectedTour?.stops.find((stop) => stop.id === preferredStopId) || null;
    },
    [currentDriveStop?.id, highlightedStopId, selectedTour]
  );
  const heroStop = selectedTour?.stops[0];
  const plannedCount = selectedTour?.stops.filter((stop) => typeof stop.arPriority === "number").length ?? 0;

  async function onPreviewDriveHandoff() {
    if (!currentDriveStop || driveSession?.mode !== "arrived") {
      return;
    }
    const parsed = parseHandoffUrl(currentDriveStop.handoffDeepLink);
    if (!parsed) {
      Alert.alert("Handoff unavailable", "Could not resolve the handoff target.");
      return;
    }
    triggerHandoffTarget(parsed);
  }

  async function onPlayHighlightedNarration() {
    if (!highlightedStop || !selectedTour) {
      return;
    }
    try {
      await startNarration({
        id: highlightedStop.id,
        tourId: selectedTour.id,
        title: highlightedStop.title,
        lat: highlightedStop.lat,
        lng: highlightedStop.lng,
        triggerRadiusM: highlightedStop.triggerRadiusM,
        audioUrl: highlightedStop.audioUrl,
        arrivalSummary: highlightedStop.description.split("|")[0]?.trim() || highlightedStop.description,
        handoffDeepLink: `phillyartours://tour/${selectedTour.id}/stop/${highlightedStop.id}/arrive`
      });
    } catch (error) {
      Alert.alert("Narration unavailable", (error as Error).message || "Could not start narration.");
    }
  }

  async function onStopHighlightedNarration() {
    await stopNarration();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>Philly tours by founders</Text>
        <Text style={styles.heroTitle}>Historic city walks with elegant AR moments.</Text>
        <Text style={styles.heroCopy}>
          Start with one tour pack, follow the map, and launch spatial moments only where they matter.
        </Text>
        <View style={styles.heroChips}>
          <Chip label={`${tours.length} tour packs`} tone="default" />
          <Chip label={`${plannedCount} AR moments in this pack`} tone="success" />
        </View>
      </View>

      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Good evening, {displayName}</Text>
        <Text style={styles.welcomeCopy}>
          Pick a tour pack below. Keep the experience light, focused, and story-first.
        </Text>
      </Card>

      {driveSession && activeDriveTour && currentDriveStop ? (
        <Card style={styles.driveCard}>
          <Text style={styles.featureEyebrow}>Resume drive session</Text>
          <Text style={styles.driveTitle}>{activeDriveTour.title}</Text>
          <Text style={styles.driveCopy}>
            Current: {currentDriveStop.title}
            {nextDriveStop ? ` | Next: ${nextDriveStop.title}` : " | Final stop reached"}
          </Text>
          <View style={styles.heroChips}>
            <Chip label={`Mode ${driveSession.mode}`} tone="success" />
            <Chip
              label={
                driveSession.mode === "arrived"
                  ? activeHandoffMeta.chipLabel
                  : nextDriveStop
                    ? "Open Drive tab to continue"
                    : "Route complete"
              }
              tone="warn"
            />
          </View>
          {driveSession.mode === "arrived" ? <PrimaryButton label={activeHandoffMeta.ctaLabel} onPress={onPreviewDriveHandoff} /> : null}
        </Card>
      ) : null}

      {selectedTour && highlightedStop ? (
        <Card style={styles.handoffCard}>
          <Text style={styles.featureEyebrow}>{driveSession?.mode === "arrived" ? "Arrived" : "Vehicle handoff"}</Text>
          <Text style={styles.handoffTitle}>{driveSession?.mode === "arrived" ? `Now continue at ${highlightedStop.title}` : `Continue at ${highlightedStop.title}`}</Text>
          <Text style={styles.handoffCopy}>{driveSession?.mode === "arrived" ? activeHandoffMeta.summary : highlightedStop.description.split("|")[0]?.trim() || "Arrive and continue on foot."}</Text>
          <View style={styles.heroChips}>
            <Chip label={selectedTour.title} tone="default" />
            <Chip label={activeHandoffMeta.chipLabel} tone="success" />
            <Chip label={narration.stopId === highlightedStop.id && narration.status === "playing" ? "Narration live" : "Tap for narration"} tone="warn" />
          </View>
          <View style={styles.handoffActions}>
            <PrimaryButton label={narration.stopId === highlightedStop.id && narration.status === "playing" ? "Replay Stop Audio" : "Play Stop Audio"} onPress={onPlayHighlightedNarration} />
            {narration.stopId === highlightedStop.id && (narration.status === "playing" || narration.status === "loading") ? <PrimaryButton label="Stop Audio" onPress={onStopHighlightedNarration} /> : null}
            {driveSession?.mode === "arrived" ? <PrimaryButton label={activeHandoffMeta.ctaLabel} onPress={onPreviewDriveHandoff} /> : null}
          </View>
        </Card>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tour Packs</Text>
        <Text style={styles.sectionMeta}>Curated for walkable discovery</Text>
      </View>
      <View style={styles.packList}>
        {tours.map((tour) => {
          const isActive = tour.id === selectedTourId;
          const arMoments = tour.stops.filter((stop) => typeof stop.arPriority === "number").length;
          async function onPlayHighlightedNarration() {
    if (!highlightedStop || !selectedTour) {
      return;
    }
    try {
      await startNarration({
        id: highlightedStop.id,
        tourId: selectedTour.id,
        title: highlightedStop.title,
        lat: highlightedStop.lat,
        lng: highlightedStop.lng,
        triggerRadiusM: highlightedStop.triggerRadiusM,
        audioUrl: highlightedStop.audioUrl,
        arrivalSummary: highlightedStop.description.split("|")[0]?.trim() || highlightedStop.description,
        handoffDeepLink: `phillyartours://tour/${selectedTour.id}/stop/${highlightedStop.id}/arrive`
      });
    } catch (error) {
      Alert.alert("Narration unavailable", (error as Error).message || "Could not start narration.");
    }
  }

  async function onStopHighlightedNarration() {
    await stopNarration();
  }

  return (
            <Pressable
              key={tour.id}
              onPress={() => setSelectedTourId(tour.id)}
              style={[styles.packCard, isActive && styles.packCardActive]}
            >
              <Text style={[styles.packTitle, isActive && styles.packTitleActive]}>{tour.title}</Text>
              <Text style={styles.packMeta}>
                {tour.durationMin} min | {tour.distanceMiles} mi | {tour.rating} rating
              </Text>
              <Text style={styles.packBody} numberOfLines={2}>
                {tour.heroPlanningNote || "Audio-led city storytelling with selective AR reveals."}
              </Text>
              <View style={styles.heroChips}>
                <Chip label={`${tour.stops.length} stops`} tone="default" />
                <Chip label={`${arMoments} AR moments`} tone={arMoments > 0 ? "success" : "default"} />
              </View>
            </Pressable>
          );
        })}
      </View>

      {selectedTour && heroStop ? (
        <Card style={styles.featureCard}>
          <Text style={styles.featureEyebrow}>Featured Stop</Text>
          <Text style={styles.featureTitle}>{heroStop.title}</Text>
          <Text style={styles.featureMeta}>
            {selectedTour.title} | {selectedTour.durationMin} min walk | {selectedTour.distanceMiles} mi
          </Text>
          <Text style={styles.featureBody}>{heroStop.description}</Text>
          <View style={styles.heroChips}>
            <Chip label={heroStop.arType ? heroStop.arType.replaceAll("_", " ") : "story stop"} tone="warn" />
            <Chip label={`${heroStop.triggerRadiusM}m reveal radius`} tone="default" />
          </View>
        </Card>
      ) : null}

      {selectedTour ? (
        <Card style={styles.routeCard}>
          <Text style={styles.sectionTitle}>On This Route</Text>
          {selectedTour.stops.slice(0, 5).map((stop, index) => (
            <View key={stop.id} style={styles.routeRow}>
              <View style={styles.routeIndex}><Text style={styles.routeIndexText}>{index + 1}</Text></View>
              <View style={styles.routeContent}>
                <Text style={styles.routeTitle}>{stop.title}</Text>
                <Text style={styles.routeMeta} numberOfLines={2}>{stop.description}</Text>
              </View>
            </View>
          ))}
        </Card>
      ) : null}
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
    borderRadius: 30,
    padding: 22,
    gap: 12,
    backgroundColor: "#130a25",
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
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800"
  },
  heroCopy: {
    color: "#d8c7df",
    fontSize: 15,
    lineHeight: 22
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  welcomeCard: {
    backgroundColor: "#1a102e",
    borderColor: "rgba(255,255,255,0.06)",
    gap: 6
  },
  welcomeTitle: {
    color: "#fff7f1",
    fontSize: 22,
    fontWeight: "800"
  },
  welcomeCopy: {
    color: "#cdbed5",
    lineHeight: 21
  },
  handoffCard: {
    backgroundColor: "#24112c",
    borderColor: "rgba(255, 140, 168, 0.28)",
    gap: 12
  },
  driveCard: {
    backgroundColor: "#201228",
    borderColor: "rgba(143, 215, 195, 0.24)",
    gap: 12
  },
  handoffActions: {
    gap: 10
  },
  driveTitle: {
    color: "#fff8f3",
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800"
  },
  driveCopy: {
    color: "#e4d7e7",
    lineHeight: 21
  },
  handoffTitle: {
    color: "#fff8f3",
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "800"
  },
  handoffCopy: {
    color: "#ead7e2",
    lineHeight: 22
  },
  sectionHeader: {
    gap: 4
  },
  sectionTitle: {
    color: "#fff0e4",
    fontSize: 22,
    fontWeight: "800"
  },
  sectionMeta: {
    color: "#b69fbe",
    fontSize: 13
  },
  packList: {
    gap: 14
  },
  packCard: {
    borderRadius: 24,
    padding: 20,
    gap: 10,
    backgroundColor: "#120a22",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)"
  },
  packCardActive: {
    borderColor: "rgba(255, 140, 168, 0.65)",
    backgroundColor: "#1b0f31"
  },
  packTitle: {
    color: "#f4e6f0",
    fontSize: 19,
    fontWeight: "800"
  },
  packTitleActive: {
    color: "#fff7f1"
  },
  packMeta: {
    color: "#d2bfca",
    fontSize: 13,
    lineHeight: 18
  },
  packBody: {
    color: "#bdaec7",
    lineHeight: 21
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
  featureMeta: {
    color: "#dbc3cf",
    lineHeight: 19
  },
  featureBody: {
    color: "#f3e8ef",
    lineHeight: 23
  },
  routeCard: {
    backgroundColor: "#120a22",
    gap: 4
  },
  routeRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    paddingVertical: 8
  },
  routeIndex: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8ca8"
  },
  routeIndexText: {
    color: "#220b16",
    fontWeight: "800",
    fontSize: 12
  },
  routeContent: {
    flex: 1,
    gap: 4
  },
  routeTitle: {
    color: "#fff1e8",
    fontWeight: "700",
    fontSize: 16
  },
  routeMeta: {
    color: "#c6b3c5",
    lineHeight: 20
  }
});
