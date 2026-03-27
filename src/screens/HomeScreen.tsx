import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { useNarration } from "../hooks/useNarration";
import { getNarrationCoverage, getNarrationUiMeta, startNarration, stopNarration, type NarrationCoverage } from "../services/narration";
import { setCurrentTourSelection } from "../services/tourControl";
import { AppPalette, useThemeColors, useTypeScale } from "../theme/appTheme";

type Props = {
  displayName?: string;
  initialSelectedTourId?: string;
  highlightedStopId?: string;
  audioHistoryOnlyUnlocked?: boolean;
  fullAppUnlocked?: boolean;
  onOpenPurchase?: () => void;
};

const METERS_PER_MILE = 1609.344;

function getTourPackBlurb(durationMin: number, fullAudioCount: number) {
  if (fullAudioCount > 0) {
    return "Audio-led city storytelling with narrated stops, clear pacing, and strong neighborhood context.";
  }
  if (durationMin >= 90) {
    return "A longer city route built for deep historical context, steady pacing, and full-neighborhood discovery.";
  }
  return "A focused walking route built around clear storytelling, easy pacing, and elegant stop-by-stop discovery.";
}

function formatMilesFromMeters(distanceInMeters: number) {
  const miles = distanceInMeters / METERS_PER_MILE;
  return `${miles < 0.1 ? miles.toFixed(2) : miles.toFixed(1)} mi`;
}

export function HomeScreen({
  displayName = "Founder",
  initialSelectedTourId,
  highlightedStopId,
  audioHistoryOnlyUnlocked = false,
  fullAppUnlocked = false,
  onOpenPurchase
}: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const [selectedTourId, setSelectedTourId] = React.useState<string>(initialSelectedTourId || tours[0]?.id || "");
  const [activeStopId, setActiveStopId] = React.useState<string | null>(highlightedStopId || null);
  const [fullAudioOnly, setFullAudioOnly] = React.useState(false);
  const narration = useNarration();

  React.useEffect(() => {
    if (initialSelectedTourId && tours.some((tour) => tour.id === initialSelectedTourId)) {
      setSelectedTourId(initialSelectedTourId);
    }
  }, [initialSelectedTourId]);

  React.useEffect(() => {
    if (highlightedStopId) {
      setActiveStopId(highlightedStopId);
    }
  }, [highlightedStopId]);

  const selectedTour = React.useMemo(() => tours.find((tour) => tour.id === selectedTourId) || tours[0], [selectedTourId]);
  const visibleStops = React.useMemo(
    () => (fullAudioOnly ? (selectedTour?.stops.filter((stop) => getNarrationCoverage(stop.id) === "full_audio") || []) : selectedTour?.stops || []),
    [fullAudioOnly, selectedTour]
  );

  React.useEffect(() => {
    setActiveStopId((current) => {
      if (!visibleStops.length) {
        return null;
      }
      if (current && visibleStops.some((stop) => stop.id === current)) {
        return current;
      }
      return highlightedStopId && visibleStops.some((stop) => stop.id === highlightedStopId) ? highlightedStopId : visibleStops[0]?.id || null;
    });
  }, [highlightedStopId, visibleStops]);

  React.useEffect(() => {
    setCurrentTourSelection(selectedTour?.id || null, activeStopId || highlightedStopId || visibleStops[0]?.id || null);
  }, [activeStopId, highlightedStopId, selectedTour?.id, visibleStops]);

  const highlightedStop = React.useMemo(() => {
    const preferredStopId = activeStopId || highlightedStopId;
    return visibleStops.find((stop) => stop.id === preferredStopId) || visibleStops[0] || null;
  }, [activeStopId, highlightedStopId, visibleStops]);
  const totalStops = selectedTour?.stops.length ?? 0;
  const fullAudioCount = selectedTour?.stops.filter((stop) => getNarrationCoverage(stop.id) === "full_audio").length ?? 0;
  const highlightedNarrationMeta = highlightedStop ? getNarrationUiMeta(highlightedStop.id) : null;
  const selectedTourBlurb = selectedTour ? getTourPackBlurb(selectedTour.durationMin, fullAudioCount) : "";
  const highlightedStopIndex = highlightedStop ? visibleStops.findIndex((stop) => stop.id === highlightedStop.id) : -1;
  const nextStop = highlightedStopIndex >= 0 ? visibleStops[highlightedStopIndex + 1] || null : null;
  const previewLimit = 2;
  const previewCount = Math.min(previewLimit, visibleStops.length);
  const lockedCount = Math.max(visibleStops.length - previewLimit, 0);
  const hasPaidAudioAccess = audioHistoryOnlyUnlocked || fullAppUnlocked;
  const highlightedStopLocked = highlightedStopIndex >= 2 && !hasPaidAudioAccess;
  const nextStopIndex = nextStop ? visibleStops.findIndex((stop) => stop.id === nextStop.id) : -1;
  const nextStopLocked = nextStopIndex >= 2 && !hasPaidAudioAccess;
  const highlightedHasFullAudio = highlightedStop ? getNarrationCoverage(highlightedStop.id) === "full_audio" : false;
  const currentStopFinished =
    !!highlightedStop &&
    narration.stopId === highlightedStop.id &&
    narration.status === "stopped" &&
    narration.message === "Narration finished.";
  const canPlayNextStop = Boolean(nextStop && highlightedHasFullAudio && currentStopFinished);

  async function playStopNarration(stop: (typeof tours)[number]["stops"][number]) {
    try {
      await startNarration({
        id: stop.id,
        title: stop.title,
        lat: stop.lat,
        lng: stop.lng,
        triggerRadiusM: stop.triggerRadiusM,
        audioUrl: stop.audioUrl,
        summary: stop.description.split("|")[0]?.trim() || stop.description
      });
    } catch (error) {
      Alert.alert("Narration unavailable", (error as Error).message || "Could not start narration.");
    }
  }

  async function onPlayHighlightedNarration() {
    if (!highlightedStop) {
      return;
    }
    if (highlightedStopLocked) {
      onOpenPurchase?.();
      return;
    }
    await playStopNarration(highlightedStop);
  }

  async function onStopHighlightedNarration() {
    await stopNarration();
  }

  async function onPlayStopNarration(stop: (typeof tours)[number]["stops"][number]) {
    await playStopNarration(stop);
  }

  async function onPlayNextStop() {
    if (!nextStop) {
      return;
    }
    if (nextStopLocked) {
      onOpenPurchase?.();
      return;
    }
    setActiveStopId(nextStop.id);
    await playStopNarration(nextStop);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>Philly tours by founders</Text>
        <Text style={styles.heroTitle}>Historic city walks with elegant guided storytelling.</Text>
        <Text style={styles.heroCopy}>
          Start with one tour pack and move through Philadelphia one clear stop at a time.
        </Text>
        <View style={styles.heroChips}>
          <Chip label={`${tours.length} tour packs`} tone="default" />
          <Chip label={selectedTour ? `${totalStops} stops in ${selectedTour.title}` : `${totalStops} stops in this pack`} tone="success" />
          {audioHistoryOnlyUnlocked ? <Chip label="Audio history unlocked" tone="warn" /> : null}
          {fullAppUnlocked ? <Chip label="Full app unlocked" tone="success" /> : null}
        </View>
      </View>

      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Good evening, {displayName}</Text>
        <Text style={styles.welcomeCopy}>
          Choose a tour tab below to open that pack, preview the first two stops for free, and continue through the route one stop at a time.
        </Text>
        <View style={styles.heroChips}>
          <PrimaryButton label={fullAudioOnly ? "Showing Full Audio" : "Showing All Stops"} onPress={() => setFullAudioOnly((value) => !value)} />
          {audioHistoryOnlyUnlocked ? <Chip label="All stop history available from home" tone="success" /> : null}
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tour Packs</Text>
        <Text style={styles.sectionMeta}>Tap a tab to open that tour pack</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packTabs}>
        {tours.map((tour) => {
          const isActive = tour.id === selectedTourId;
          return (
            <Pressable key={tour.id} onPress={() => setSelectedTourId(tour.id)} style={[styles.packTab, isActive && styles.packTabActive]}>
              <Text style={[styles.packTabTitle, isActive && styles.packTabTitleActive]} numberOfLines={2}>
                {tour.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedTour ? (
        <Card style={styles.packDetailCard}>
          <Text style={styles.heroEyebrow}>Active Tour Pack</Text>
          <Text style={styles.sectionTitle}>{selectedTour.title}</Text>
          <Text style={styles.routeMeta}>{selectedTourBlurb}</Text>
          <View style={styles.heroChips}>
            <Chip label={`${selectedTour.durationMin} min`} tone="default" />
            <Chip label={`${selectedTour.distanceMiles} mi`} tone="default" />
            <Chip label={`${selectedTour.rating} rating`} tone="warn" />
            <Chip label={`${fullAudioCount} full audio stops`} tone="success" />
            <Chip label={`${previewCount} free stops`} tone="warn" />
            {lockedCount > 0 && !hasPaidAudioAccess ? <Chip label={`${lockedCount} stops unlock after purchase`} tone="default" /> : null}
          </View>
        </Card>
      ) : null}

      {selectedTour && highlightedStop ? (
        <Card style={styles.handoffCard}>
          <Text style={styles.heroEyebrow}>Start Here</Text>
          <Text style={styles.handoffStep}>
            {highlightedStopIndex >= 0 ? `Stop ${highlightedStopIndex + 1} of ${visibleStops.length}` : "Tour stop"}
          </Text>
          <Text style={styles.handoffTitle}>{highlightedStop.title}</Text>
          <Text style={styles.handoffCopy}>{highlightedStop.description.split("|")[0]?.trim() || "Open the stop and start the narration when you're ready."}</Text>
          <View style={styles.heroChips}>
            <Chip label={selectedTour.title} tone="default" />
            {!highlightedStopLocked && highlightedStopIndex < previewLimit && !hasPaidAudioAccess ? <Chip label="Free preview" tone="success" /> : null}
            <Chip
              label={
                highlightedStopLocked
                  ? "Purchase required"
                  : narration.stopId === highlightedStop.id && narration.status === "playing"
                    ? "Narration live"
                    : highlightedNarrationMeta?.coverageLabel || "Narration"
              }
              tone={highlightedStopLocked ? "warn" : highlightedNarrationMeta?.coverageTone || "warn"}
            />
            {narration.stopId === highlightedStop.id ? (
              <Chip label={narration.target === "companion" ? "To Meta glasses" : narration.target === "phone" ? "To phone" : "No target"} tone="default" />
            ) : null}
          </View>
          {highlightedStopLocked ? (
            <Text style={styles.purchaseCopy}>
              The first two stops in each tour are free. Purchase full app content to hear stop three and beyond in this tour.
            </Text>
          ) : null}
          <View style={styles.handoffActions}>
            <PrimaryButton
              label={
                highlightedStopLocked
                  ? "Purchase Full App Content"
                  : narration.stopId === highlightedStop.id && narration.status === "playing"
                    ? highlightedNarrationMeta?.activeLabel || "Replay Narration"
                    : highlightedNarrationMeta?.idleLabel || "Hear Narration"
              }
              onPress={() => void onPlayHighlightedNarration()}
            />
            {narration.stopId === highlightedStop.id && (narration.status === "playing" || narration.status === "loading") ? (
              <PrimaryButton label={highlightedNarrationMeta?.stopLabel || "Stop Narration"} onPress={onStopHighlightedNarration} />
            ) : null}
            {nextStop ? (
              <PrimaryButton
                label={nextStopLocked ? "Purchase Full App Content" : "Play Next Stop"}
                onPress={() => void onPlayNextStop()}
                disabled={nextStopLocked ? false : !canPlayNextStop}
              />
            ) : null}
          </View>
        </Card>
      ) : null}

      {selectedTour ? (
        <Card style={styles.routeCard}>
          <Text style={styles.sectionTitle}>Stops In This Tour Pack</Text>
          <Text style={styles.sectionMeta}>
            {fullAudioOnly
              ? "Showing only stops with recorded full audio."
              : hasPaidAudioAccess
                ? "All stops are available to hear in order."
                : "The first two stops are free. Later stops unlock with full app purchase."}
          </Text>
          {visibleStops.map((stop, index) => (
            <Pressable key={stop.id} style={[styles.routeRow, activeStopId === stop.id && styles.routeRowActive]} onPress={() => setActiveStopId(stop.id)}>
              <View style={styles.routeIndex}><Text style={styles.routeIndexText}>{index + 1}</Text></View>
              <View style={styles.routeContent}>
                <Text style={styles.routeTitle}>{stop.title}</Text>
                <View style={styles.routeChips}>
                  <Chip label={index < previewLimit || hasPaidAudioAccess ? "Open now" : "Purchase required"} tone={index < previewLimit || hasPaidAudioAccess ? "success" : "warn"} />
                  <Chip {...getCoverageMeta(getNarrationCoverage(stop.id))} />
                </View>
                <Text style={styles.routeMeta} numberOfLines={2}>{stop.description}</Text>
                {audioHistoryOnlyUnlocked ? (
                  <PrimaryButton
                    label={narration.stopId === stop.id && narration.status === "playing" ? "Replay Stop History" : "Hear Stop History"}
                    onPress={() => void onPlayStopNarration(stop)}
                  />
                ) : null}
              </View>
            </Pressable>
          ))}
          {visibleStops.length === 0 ? <Text style={styles.routeMeta}>No full-audio stops in this pack yet.</Text> : null}
        </Card>
      ) : null}
    </ScrollView>
  );
}

function createStyles(
  colors: AppPalette,
  type: {
    font: (size: number) => number;
    line: (height: number) => number;
  }
) {
  return StyleSheet.create({
    container: {
      padding: 18,
      gap: 18,
      backgroundColor: colors.background
    },
    heroPanel: {
      borderRadius: 30,
      padding: 22,
      gap: 12,
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.border
    },
    heroEyebrow: {
      color: colors.warn,
      fontSize: type.font(12),
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.2
    },
    heroTitle: {
      color: colors.text,
      fontSize: type.font(34),
      lineHeight: type.line(40),
      fontWeight: "800"
    },
    heroCopy: {
      color: colors.textSoft,
      fontSize: type.font(15),
      lineHeight: type.line(22)
    },
    heroChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    welcomeCard: {
      gap: 6
    },
    welcomeTitle: {
      color: colors.text,
      fontSize: type.font(22),
      fontWeight: "800"
    },
    welcomeCopy: {
      color: colors.textSoft,
      lineHeight: type.line(21),
      fontSize: type.font(14)
    },
    handoffCard: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.dangerSoft,
      gap: 12
    },
    handoffActions: {
      gap: 10
    },
    handoffTitle: {
      color: colors.text,
      fontSize: type.font(26),
      lineHeight: type.line(31),
      fontWeight: "800"
    },
    handoffStep: {
      color: colors.textMuted,
      fontSize: type.font(12),
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1
    },
    handoffCopy: {
      color: colors.textSoft,
      lineHeight: type.line(22),
      fontSize: type.font(14)
    },
    purchaseCopy: {
      color: colors.textSoft,
      lineHeight: type.line(20),
      fontSize: type.font(13)
    },
    sectionHeader: {
      gap: 4
    },
    sectionTitle: {
      color: colors.text,
      fontSize: type.font(22),
      fontWeight: "800"
    },
    sectionMeta: {
      color: colors.textMuted,
      fontSize: type.font(13)
    },
    packList: {
      gap: 14
    },
    packTabs: {
      gap: 10,
      paddingRight: 18
    },
    packTab: {
      width: 196,
      minHeight: 86,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 14,
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border
    },
    packTabActive: {
      borderColor: "#007eff",
      backgroundColor: colors.infoSoft
    },
    packTabTitle: {
      color: colors.text,
      fontSize: type.font(15),
      lineHeight: type.line(20),
      fontWeight: "800"
    },
    packTabTitleActive: {
      color: colors.info
    },
    packDetailCard: {
      backgroundColor: colors.surface,
      borderColor: colors.infoSoft,
      gap: 12
    },
    packCard: {
      borderRadius: 24,
      padding: 20,
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border
    },
    packCardActive: {
      borderColor: "#007eff",
      backgroundColor: colors.surfaceSoft
    },
    packTitle: {
      color: colors.text,
      fontSize: type.font(19),
      fontWeight: "800"
    },
    packTitleActive: {
      color: colors.text
    },
    packMeta: {
      color: colors.textSoft,
      fontSize: type.font(13),
      lineHeight: type.line(18)
    },
    packBody: {
      color: colors.textMuted,
      lineHeight: type.line(21),
      fontSize: type.font(14)
    },
    routeCard: {
      gap: 14
    },
    routeRow: {
      flexDirection: "row",
      gap: 14,
      alignItems: "flex-start"
    },
    routeRowActive: {
      padding: 12,
      borderRadius: 18,
      backgroundColor: colors.surfaceSoft
    },
    routeIndex: {
      width: 30,
      height: 30,
      borderRadius: 999,
      backgroundColor: colors.surfaceSoft,
      alignItems: "center",
      justifyContent: "center"
    },
    routeIndexText: {
      color: colors.text,
      fontWeight: "800",
      fontSize: type.font(13)
    },
    routeContent: {
      flex: 1,
      gap: 6
    },
    routeTitle: {
      color: colors.text,
      fontSize: type.font(16),
      fontWeight: "700"
    },
    routeChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    routeMeta: {
      color: colors.textSoft,
      fontSize: type.font(13),
      lineHeight: type.line(20)
    }
  });
}
