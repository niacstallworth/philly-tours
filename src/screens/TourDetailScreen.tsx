import React from "react";
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import type { Stop, Tour } from "../types";
import { useNarration } from "../hooks/useNarration";
import { getNarrationCoverage, getNarrationUiMeta, startNarration, stopNarration, type NarrationCoverage } from "../services/narration";
import { setCurrentTourSelection } from "../services/tourControl";
import { getCommunityRoomPosts, submitCommunityRoomPost, type CommunityRoomPost, type CommunityRoomTheme } from "../services/communityRooms";
import { AppPalette, useThemeColors, useTypeScale } from "../theme/appTheme";
import { RoutePreviewMap } from "../components/maps/RoutePreviewMap";

type Props = {
  tour: Tour;
  audioHistoryOnlyUnlocked?: boolean;
  fullAppUnlocked?: boolean;
  onBack: () => void;
  onOpenPurchase?: () => void;
};

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

function getStopSummary(description: string) {
  return description.split("|")[0]?.trim() || description;
}

function getStopAddress(description: string) {
  const match = description.match(/Location:\s*([^|]+)/i);
  return match?.[1]?.trim() || "Philadelphia, PA";
}

function getNeighborhoodSpan(tour: Tour) {
  const addresses = tour.stops.map((stop) => getStopAddress(stop.description)).filter(Boolean);
  const first = addresses[0] || "Philadelphia, PA";
  const last = addresses[addresses.length - 1];
  return last && last !== first ? `${first} to ${last}` : first;
}

function buildTourNarrative(tour: Tour) {
  const leadStops = tour.stops.slice(0, 3).map((stop) => stop.title);
  if (!leadStops.length) {
    return "North Broad is the north star of the Founders Compass. Start near that center and let the city open outward.";
  }
  return `North Broad is the north star of the Founders Compass. Begin at ${leadStops[0]}, then let the story radiate through ${leadStops.slice(1).join(", ")}.`;
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

export function TourDetailScreen({
  tour,
  audioHistoryOnlyUnlocked = false,
  fullAppUnlocked = false,
  onBack,
  onOpenPurchase
}: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const narration = useNarration();
  const [selectedStopId, setSelectedStopId] = React.useState(tour.stops[0]?.id || "");
  const [roomPosts, setRoomPosts] = React.useState<CommunityRoomPost[]>([]);
  const [reflectionBody, setReflectionBody] = React.useState("");
  const [reflectionTheme, setReflectionTheme] = React.useState<CommunityRoomTheme>("reflection");
  const [submittingReflection, setSubmittingReflection] = React.useState(false);
  const [roomMessage, setRoomMessage] = React.useState<string | null>(null);
  const selectedStop = tour.stops.find((stop) => stop.id === selectedStopId) || tour.stops[0] || null;
  const selectedStopIndex = selectedStop ? tour.stops.findIndex((stop) => stop.id === selectedStop.id) : -1;
  const fullAudioCount = tour.stops.filter((stop) => getNarrationCoverage(stop.id) === "full_audio").length;
  const hasPaidAudioAccess = audioHistoryOnlyUnlocked || fullAppUnlocked;
  const previewLimit = 2;
  const selectedStopLocked = selectedStopIndex >= previewLimit && !hasPaidAudioAccess;
  const mediaUrl = buildTourCardMediaUrl(tour.cardMedia?.src);
  const narrationMeta = selectedStop ? getNarrationUiMeta(selectedStop.id) : null;

  React.useEffect(() => {
    setSelectedStopId(tour.stops[0]?.id || "");
  }, [tour.id, tour.stops]);

  React.useEffect(() => {
    setCurrentTourSelection(tour.id, selectedStop?.id || tour.stops[0]?.id || null);
  }, [selectedStop?.id, tour.id, tour.stops]);

  React.useEffect(() => {
    let mounted = true;
    if (!selectedStop?.id) {
      setRoomPosts([]);
      return;
    }
    getCommunityRoomPosts(selectedStop.id)
      .then((posts) => {
        if (mounted) {
          setRoomPosts(posts);
          setRoomMessage(null);
        }
      })
      .catch(() => {
        if (mounted) {
          setRoomPosts([]);
          setRoomMessage("Community room is unavailable right now.");
        }
      });
    return () => {
      mounted = false;
    };
  }, [selectedStop?.id]);

  async function playSelectedStop() {
    if (!selectedStop) {
      return;
    }
    if (selectedStopLocked) {
      onOpenPurchase?.();
      return;
    }
    try {
      await startNarration({
        id: selectedStop.id,
        title: selectedStop.title,
        lat: selectedStop.lat,
        lng: selectedStop.lng,
        triggerRadiusM: selectedStop.triggerRadiusM,
        audioUrl: selectedStop.audioUrl,
        summary: getStopSummary(selectedStop.description)
      });
    } catch (error) {
      Alert.alert("Narration unavailable", (error as Error).message || "Could not start narration.");
    }
  }

  async function openSelectedStopInMaps() {
    if (!selectedStop) {
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${selectedStop.lat},${selectedStop.lng}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Could not open maps", url);
    }
  }

  function selectStop(stop: Stop) {
    setSelectedStopId(stop.id);
  }

  async function submitReflection() {
    if (!selectedStop) {
      return;
    }
    setSubmittingReflection(true);
    setRoomMessage(null);
    try {
      const nextPost = await submitCommunityRoomPost({
        tourId: tour.id,
        stopId: selectedStop.id,
        body: reflectionBody,
        theme: reflectionTheme
      });
      setRoomPosts((current) => [nextPost, ...current]);
      setReflectionBody("");
      setRoomMessage("Reflection saved for review. Approved voices can appear here and in AR cards later.");
    } catch (error) {
      setRoomMessage((error as Error).message || "Could not save this reflection.");
    } finally {
      setSubmittingReflection(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to tour cards</Text>
      </Pressable>

      <View style={styles.heroPanel}>
        {mediaUrl ? <Image source={{ uri: mediaUrl }} style={styles.heroImage} resizeMode="cover" /> : null}
        <View style={styles.heroScrim} />
        <View style={styles.heroCopyWrap}>
          <Text style={styles.heroEyebrow}>Tour pack page</Text>
          <Text style={styles.heroTitle}>{tour.title}</Text>
          <Text style={styles.heroCopy}>{buildTourNarrative(tour)}</Text>
          <View style={styles.chips}>
            <Chip label={`${tour.durationMin} min`} tone="default" />
            <Chip label={`${tour.distanceMiles} mi`} tone="default" />
            <Chip label={`${tour.stops.length} story stops`} tone="success" />
            <Chip label={`${tour.rating} rating`} tone="warn" />
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tour.durationMin}</Text>
          <Text style={styles.statLabel}>estimated minutes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tour.distanceMiles}</Text>
          <Text style={styles.statLabel}>route miles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tour.stops.length}</Text>
          <Text style={styles.statLabel}>story stops</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{fullAudioCount}</Text>
          <Text style={styles.statLabel}>full audio stops</Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Founders Compass</Text>
        <Text style={styles.sectionTitle}>North Broad is the north star</Text>
        <Text style={styles.copy}>
          Each tour begins from the city&apos;s compass point and opens outward, so the stop list feels like Philadelphia unfolding instead of a spreadsheet.
        </Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>City arc</Text>
            <Text style={styles.summaryValue}>{getNeighborhoodSpan(tour)}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Compass start</Text>
            <Text style={styles.summaryValue}>{tour.stops[0]?.title || "First listed stop"}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Story flow</Text>
            <Text style={styles.summaryValue}>{buildTourNarrative(tour)}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Outward path</Text>
            <Text style={styles.summaryValue}>{tour.stops.length > 1 ? `${tour.stops.length} compass points` : "One compass point"}</Text>
          </View>
        </View>
      </Card>

      <RoutePreviewMap
        tour={tour}
        selectedStopId={selectedStop?.id}
        travelMode="WALK"
        onSelectStop={setSelectedStopId}
      />

      {selectedStop ? (
        <Card style={styles.selectedStopCard}>
          <Text style={styles.sectionEyebrow}>Selected stop audio</Text>
          <Text style={styles.selectedStopStep}>Stop {selectedStopIndex + 1} of {tour.stops.length}</Text>
          <Text style={styles.selectedStopTitle}>{selectedStop.title}</Text>
          <Text style={styles.selectedStopAddress}>{getStopAddress(selectedStop.description)}</Text>
          <Text style={styles.copy}>{getStopSummary(selectedStop.description)}</Text>
          <View style={styles.chips}>
            <Chip label={selectedStopLocked ? "Purchase required" : "Open now"} tone={selectedStopLocked ? "warn" : "success"} />
            <Chip {...getCoverageMeta(getNarrationCoverage(selectedStop.id))} />
            {narration.stopId === selectedStop.id ? (
              <Chip label={narration.status === "playing" ? "Narration live" : narration.status} tone="default" />
            ) : null}
          </View>
          {selectedStopLocked ? (
            <Text style={styles.lockCopy}>The first two stops are free. Purchase full app content to hear the rest of this tour.</Text>
          ) : null}
          <View style={styles.actions}>
            <PrimaryButton
              label={
                selectedStopLocked
                  ? "Purchase Full App Content"
                  : narration.stopId === selectedStop.id && narration.status === "playing"
                    ? narrationMeta?.activeLabel || "Replay Narration"
                    : narrationMeta?.idleLabel || "Hear Narration"
              }
              onPress={() => void playSelectedStop()}
            />
            {narration.stopId === selectedStop.id && (narration.status === "playing" || narration.status === "loading") ? (
              <PrimaryButton label={narrationMeta?.stopLabel || "Stop Narration"} onPress={() => void stopNarration()} />
            ) : null}
            <PrimaryButton label="Open Stop In Maps" onPress={() => void openSelectedStopInMaps()} />
          </View>
        </Card>
      ) : null}

      {selectedStop ? (
        <Card style={styles.communityCard}>
          <Text style={styles.sectionEyebrow}>AR Community Room</Text>
          <Text style={styles.sectionTitle}>Voices From This Place</Text>
          <Text style={styles.copy}>
            Approved memories and reflections can become spatial story cards for this stop. New submissions stay pending until reviewed.
          </Text>
          <View style={styles.chips}>
            <Chip label={`${roomPosts.filter((post) => post.status === "approved").length} approved`} tone="success" />
            <Chip label={`${roomPosts.filter((post) => post.status === "pending").length} pending`} tone="warn" />
            <Chip label="AR cards ready later" tone="default" />
          </View>
          <View style={styles.roomPostList}>
            {roomPosts.length ? (
              roomPosts.slice(0, 4).map((post) => (
                <View key={post.id} style={[styles.roomPostCard, post.status === "pending" && styles.roomPostPending]}>
                  <View style={styles.roomPostHeader}>
                    <Text style={styles.roomPostAuthor}>{post.authorName}</Text>
                    <Chip label={post.status === "approved" ? post.theme : "Pending review"} tone={post.status === "approved" ? "success" : "warn"} />
                  </View>
                  <Text style={styles.roomPostBody}>{post.body}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.copy}>No voices have been added to this room yet. Leave the first reflection for review.</Text>
            )}
          </View>
          <View style={styles.themePicker}>
            {(["reflection", "memory", "family", "question", "archive"] as CommunityRoomTheme[]).map((theme) => (
              <Pressable
                key={theme}
                onPress={() => setReflectionTheme(theme)}
                style={[styles.themeChip, reflectionTheme === theme && styles.themeChipActive]}
              >
                <Text style={[styles.themeChipText, reflectionTheme === theme && styles.themeChipTextActive]}>{theme}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={reflectionBody}
            onChangeText={setReflectionBody}
            placeholder="This place matters because..."
            placeholderTextColor={colors.textMuted}
            style={styles.roomInput}
            multiline
          />
          {roomMessage ? <Text style={styles.roomMessage}>{roomMessage}</Text> : null}
          <PrimaryButton
            label={submittingReflection ? "Saving Reflection..." : "Submit Reflection For Review"}
            onPress={() => void submitReflection()}
            disabled={submittingReflection}
          />
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Compass points</Text>
        <Text style={styles.sectionTitle}>Follow the city outward</Text>
        <Text style={styles.copy}>
          The stops are arranged from the Founders Compass near North Broad toward the farthest edge of the story.
        </Text>
        {tour.stops.map((stop, index) => {
          const isSelected = stop.id === selectedStop?.id;
          const locked = index >= previewLimit && !hasPaidAudioAccess;
          return (
            <Pressable key={stop.id} style={[styles.stopRow, isSelected && styles.stopRowActive]} onPress={() => selectStop(stop)}>
              <View style={styles.stopIndex}>
                <Text style={styles.stopIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.stopContent}>
                <Text style={styles.stopTitle}>{stop.title}</Text>
                <Text style={styles.stopAddress}>{getStopAddress(stop.description)}</Text>
                <Text style={styles.stopSummary} numberOfLines={2}>{getStopSummary(stop.description)}</Text>
                <View style={styles.chips}>
                  <Chip label={isSelected ? "Viewing" : locked ? "Purchase required" : "Open"} tone={isSelected || !locked ? "success" : "warn"} />
                  <Chip {...getCoverageMeta(getNarrationCoverage(stop.id))} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </Card>
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
      paddingBottom: 118,
      gap: 18,
      backgroundColor: colors.background
    },
    backButton: {
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.surface
    },
    backButtonText: {
      color: colors.text,
      fontSize: type.font(13),
      fontWeight: "800"
    },
    heroPanel: {
      position: "relative",
      overflow: "hidden",
      minHeight: 360,
      borderRadius: 28,
      backgroundColor: colors.headerBackground,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "flex-end"
    },
    heroImage: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: "100%",
      height: "100%"
    },
    heroScrim: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "rgba(5, 6, 12, 0.38)"
    },
    heroCopyWrap: {
      position: "relative",
      zIndex: 1,
      padding: 22,
      gap: 10
    },
    heroEyebrow: {
      color: "rgba(255,255,255,0.78)",
      fontSize: type.font(12),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2
    },
    heroTitle: {
      color: "#ffffff",
      fontSize: type.font(34),
      lineHeight: type.line(39),
      fontWeight: "800"
    },
    heroCopy: {
      color: "rgba(255,255,255,0.86)",
      fontSize: type.font(15),
      lineHeight: type.line(22)
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10
    },
    statCard: {
      minWidth: "47%",
      flexGrow: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 14,
      backgroundColor: colors.surface
    },
    statValue: {
      color: colors.text,
      fontSize: type.font(28),
      fontWeight: "800"
    },
    statLabel: {
      marginTop: 4,
      color: colors.textMuted,
      fontSize: type.font(11),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8
    },
    card: {
      gap: 12,
      backgroundColor: colors.surfaceRaised
    },
    sectionEyebrow: {
      color: colors.warn,
      fontSize: type.font(12),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.1
    },
    sectionTitle: {
      color: colors.text,
      fontSize: type.font(22),
      fontWeight: "800"
    },
    copy: {
      color: colors.textSoft,
      fontSize: type.font(14),
      lineHeight: type.line(21)
    },
    summaryGrid: {
      gap: 10
    },
    summaryCell: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      backgroundColor: colors.surface
    },
    summaryLabel: {
      color: colors.textMuted,
      fontSize: type.font(11),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8
    },
    summaryValue: {
      marginTop: 6,
      color: colors.text,
      fontSize: type.font(14),
      lineHeight: type.line(20),
      fontWeight: "700"
    },
    selectedStopCard: {
      gap: 12,
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.infoSoft
    },
    selectedStopStep: {
      color: colors.textMuted,
      fontSize: type.font(12),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1
    },
    selectedStopTitle: {
      color: colors.text,
      fontSize: type.font(26),
      lineHeight: type.line(31),
      fontWeight: "800"
    },
    selectedStopAddress: {
      color: colors.warn,
      fontSize: type.font(13),
      lineHeight: type.line(18),
      fontWeight: "700"
    },
    lockCopy: {
      color: colors.textSoft,
      fontSize: type.font(13),
      lineHeight: type.line(19)
    },
    actions: {
      gap: 10
    },
    communityCard: {
      gap: 12,
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.warnSoft
    },
    roomPostList: {
      gap: 10
    },
    roomPostCard: {
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor: colors.surface,
      padding: 14
    },
    roomPostPending: {
      borderColor: colors.warn,
      backgroundColor: colors.warnSoft
    },
    roomPostHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10
    },
    roomPostAuthor: {
      flex: 1,
      color: colors.text,
      fontSize: type.font(14),
      fontWeight: "800"
    },
    roomPostBody: {
      color: colors.textSoft,
      fontSize: type.font(14),
      lineHeight: type.line(20)
    },
    themePicker: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    themeChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8
    },
    themeChipActive: {
      borderColor: colors.warn,
      backgroundColor: colors.warnSoft
    },
    themeChipText: {
      color: colors.textSoft,
      fontSize: type.font(12),
      fontWeight: "800",
      textTransform: "capitalize"
    },
    themeChipTextActive: {
      color: colors.warn
    },
    roomInput: {
      minHeight: 92,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 18,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 13,
      textAlignVertical: "top",
      fontSize: type.font(14),
      lineHeight: type.line(20)
    },
    roomMessage: {
      color: colors.info,
      fontSize: type.font(13),
      lineHeight: type.line(18),
      fontWeight: "700"
    },
    stopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingVertical: 10
    },
    stopRowActive: {
      padding: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft
    },
    stopIndex: {
      width: 32,
      height: 32,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceSoft
    },
    stopIndexText: {
      color: colors.text,
      fontSize: type.font(13),
      fontWeight: "800"
    },
    stopContent: {
      flex: 1,
      gap: 6
    },
    stopTitle: {
      color: colors.text,
      fontSize: type.font(16),
      fontWeight: "800"
    },
    stopAddress: {
      color: colors.warn,
      fontSize: type.font(12),
      fontWeight: "700"
    },
    stopSummary: {
      color: colors.textSoft,
      fontSize: type.font(13),
      lineHeight: type.line(19)
    }
  });
}
