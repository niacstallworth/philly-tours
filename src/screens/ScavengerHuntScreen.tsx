import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import {
  dismissScavengerReveal,
  ensureScavengerHuntCollectorStarted,
  getScavengerHuntSnapshot,
  getScavengerTokenById,
  getTokenDistanceLabel,
  resetScavengerHunt,
  startScavengerHunt,
  subscribeToScavengerHunt,
  type ScavengerHuntSnapshot,
  type ScavengerToken
} from "../services/scavengerHunt";
import { haversineDistanceM } from "../services/geofence";
import { AppPalette, useThemeColors, useTypeScale } from "../theme/appTheme";

const TOUR_ORDER = ["black-inventors-tour", "black-medical-legacy", "masonic-scavenger-hunt"];
const METERS_PER_MILE = 1609.344;

const toneMeta: Record<ScavengerToken["tone"], { label: string; glow: string; ink: string; shell: string }> = {
  inventors: { label: "Inventors AR", glow: "#7dd3fc", ink: "#082f49", shell: "#e0f2fe" },
  medical: { label: "Medical relic", glow: "#86efac", ink: "#052e16", shell: "#dcfce7" },
  masonic: { label: "Masonic secret", glow: "#fcd34d", ink: "#422006", shell: "#fef3c7" }
};

export function ScavengerHuntScreen() {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const [snapshot, setSnapshot] = React.useState<ScavengerHuntSnapshot>(() => getScavengerHuntSnapshot());
  const [isResetting, setIsResetting] = React.useState(false);
  const [startingTourId, setStartingTourId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = subscribeToScavengerHunt(setSnapshot);
    void ensureScavengerHuntCollectorStarted();
    return unsubscribe;
  }, []);

  const collected = React.useMemo(() => new Set(snapshot.collectedIds), [snapshot.collectedIds]);
  const startedTours = React.useMemo(() => new Set(snapshot.startedTourIds), [snapshot.startedTourIds]);

  const grouped = React.useMemo(() => {
    const groups = new Map<string, ScavengerToken[]>();
    snapshot.tokens.forEach((token) => {
      const current = groups.get(token.tourId) || [];
      current.push(token);
      groups.set(token.tourId, current);
    });
    return TOUR_ORDER.map((tourId) => {
      const items = [...(groups.get(tourId) || [])].sort((left, right) => {
        const leftCollected = collected.has(left.id);
        const rightCollected = collected.has(right.id);
        if (leftCollected !== rightCollected) {
          return leftCollected ? 1 : -1;
        }
        if (left.gpsReady !== right.gpsReady) {
          return left.gpsReady ? -1 : 1;
        }
        const leftDistance = distanceForToken(left, snapshot.lastPosition);
        const rightDistance = distanceForToken(right, snapshot.lastPosition);
        if (leftDistance === null && rightDistance === null) {
          return left.stopTitle.localeCompare(right.stopTitle);
        }
        if (leftDistance === null) {
          return 1;
        }
        if (rightDistance === null) {
          return -1;
        }
        return leftDistance - rightDistance;
      });
      return [tourId, items] as const;
    }).filter(([, items]) => items.length > 0);
  }, [collected, snapshot.lastPosition, snapshot.tokens]);

  const latestReveal = snapshot.latestRevealId ? getScavengerTokenById(snapshot.latestRevealId) : null;
  const totalCount = snapshot.tokens.filter((token) => token.gpsReady).length;
  const collectedCount = snapshot.tokens.filter((token) => token.gpsReady && collected.has(token.id)).length;
  const activeTokens = React.useMemo(
    () => snapshot.tokens.filter((token) => token.gpsReady && startedTours.has(token.tourId) && !collected.has(token.id)),
    [collected, snapshot.tokens, startedTours]
  );
  const nextTarget = React.useMemo(
    () =>
      [...activeTokens].sort((left, right) => {
        const leftDistance = distanceForToken(left, snapshot.lastPosition);
        const rightDistance = distanceForToken(right, snapshot.lastPosition);
        if (leftDistance === null && rightDistance === null) {
          return left.stopTitle.localeCompare(right.stopTitle);
        }
        if (leftDistance === null) {
          return 1;
        }
        if (rightDistance === null) {
          return -1;
        }
        return leftDistance - rightDistance;
      })[0] || null,
    [activeTokens, snapshot.lastPosition]
  );
  const readyToClaimCount = activeTokens.filter((token) => isWithinClaimRadius(token, snapshot.lastPosition)).length;
  const inactiveTourCount = TOUR_ORDER.filter((tourId) => !startedTours.has(tourId)).length;
  const locationStatusLabel =
    snapshot.permission === "denied"
      ? "Location permission needed"
      : snapshot.collectorActive
        ? "Auto collection on"
        : "Starting GPS";

  async function handleStartHunt(tourId: string) {
    setStartingTourId(tourId);
    try {
      await startScavengerHunt(tourId);
    } finally {
      setStartingTourId(null);
    }
  }

  async function handleReset() {
    setIsResetting(true);
    try {
      await resetScavengerHunt();
    } finally {
      setIsResetting(false);
    }
  }

  async function handleRetryLocation() {
    if (snapshot.permission === "denied") {
      await Linking.openSettings();
      return;
    }
    await ensureScavengerHuntCollectorStarted();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroHaloA} />
        <View style={styles.heroHaloB} />
        <Text style={styles.heroEyebrow}>Scavenger Hunt</Text>
        <Text style={styles.heroTitle}>Collect hidden tokens from Masonic, Medical, and Inventors stops.</Text>
        <Text style={styles.heroCopy}>
          Start a hunt track below, then GPS reveals happen automatically. When you enter a stop radius, the token is claimed and the object appears as a clean collectible reveal.
        </Text>
        <View style={styles.heroChips}>
          <Chip label={`${collectedCount}/${totalCount} claimed`} tone="success" />
          <Chip label={locationStatusLabel} tone={snapshot.permission === "denied" ? "danger" : "warn"} />
          {readyToClaimCount > 0 ? <Chip label={`${readyToClaimCount} nearby now`} tone="success" /> : null}
          <Chip label="Inventors tour is AR-first" tone="default" />
        </View>
      </View>

      {snapshot.permission === "denied" ? (
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Location Needed</Text>
          <Text style={styles.summaryCopy}>
            Hunt reveals use live position. Turn location back on for Philly AR Tours, then come back here and the collector will resume.
          </Text>
          <PrimaryButton label="Open Location Settings" onPress={() => void handleRetryLocation()} surface="hunt" />
        </Card>
      ) : null}

      {nextTarget ? (
        <Card style={styles.revealCard}>
          <Text style={styles.revealEyebrow}>Next Target</Text>
          <Text style={styles.revealTitle}>{nextTarget.stopTitle}</Text>
          <Text style={styles.revealCopy}>
            {isWithinClaimRadius(nextTarget, snapshot.lastPosition)
              ? "You are inside the claim radius now. Stay here for a moment and the token should collect automatically."
              : `${nextTarget.tourTitle} is your closest live token. ${getTokenDistanceLabel(nextTarget, snapshot.lastPosition)}.`}
          </Text>
          <View style={styles.heroChips}>
            <Chip label={toneMeta[nextTarget.tone].label} tone="success" />
            <Chip label={formatRadiusLabel(nextTarget.triggerRadiusM)} tone="warn" />
            <Chip
              label={isWithinClaimRadius(nextTarget, snapshot.lastPosition) ? "In range" : "Move closer"}
              tone={isWithinClaimRadius(nextTarget, snapshot.lastPosition) ? "success" : "default"}
            />
          </View>
        </Card>
      ) : (
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Hunt Readiness</Text>
          <Text style={styles.summaryCopy}>
            {inactiveTourCount > 0
              ? `Start ${inactiveTourCount === 1 ? "the last hunt track" : `${inactiveTourCount} hunt tracks`} to begin collecting nearby tokens.`
              : "Every hunt track is started. Keep moving through eligible stops and tokens will collect automatically."}
          </Text>
        </Card>
      )}

      {latestReveal ? (
        <Card style={styles.revealCard}>
          <Text style={styles.revealEyebrow}>Latest Token</Text>
          <Text style={styles.revealTitle}>{latestReveal.stopTitle}</Text>
          <Text style={styles.revealCopy}>{latestReveal.summary}</Text>
          <View style={styles.heroChips}>
            <Chip label={toneMeta[latestReveal.tone].label} tone="success" />
            <Chip label="Collected automatically" tone="warn" />
          </View>
          <PrimaryButton label="Clear Reveal" onPress={() => void dismissScavengerReveal()} surface="hunt" />
        </Card>
      ) : null}

      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <Text style={styles.summaryCopy}>Start a hunt track first. After that, reach the stop, let GPS confirm it, and the token is added to your collection automatically.</Text>
        <View style={styles.ruleList}>
          <Text style={styles.ruleItem}>1. Inventors, Medical, and Masonic stops are the only eligible token stops.</Text>
          <Text style={styles.ruleItem}>2. Each tour has its own Start Hunt button and progress tracker.</Text>
          <Text style={styles.ruleItem}>3. Stops without reliable coordinates stay visible but cannot auto-collect yet.</Text>
          <Text style={styles.ruleItem}>4. The hunt keeps its progress on this device.</Text>
        </View>
      </Card>

      {grouped.map(([tourId, tokens]) => (
        <View key={tourId} style={styles.group}>
          <View style={styles.groupHeader}>
            <View style={styles.groupHeaderText}>
              <Text style={styles.groupTitle}>{tokens[0]?.tourTitle || tourId}</Text>
              <Text style={styles.groupMeta}>
                {startedTours.has(tourId) ? "Hunt active" : "Not started yet"}
              </Text>
            </View>
            <View style={styles.groupProgress}>
              <Text style={styles.groupProgressCount}>
                {tokens.filter((token) => collected.has(token.id)).length} / {tokens.filter((token) => token.gpsReady).length || tokens.length}
              </Text>
              <Text style={styles.groupProgressLabel}>collected</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(
                    6,
                    ((tokens.filter((token) => token.gpsReady && collected.has(token.id)).length) /
                      Math.max(tokens.filter((token) => token.gpsReady).length, 1)) *
                      100
                  )}%`
                }
              ]}
            />
          </View>
          <PrimaryButton
            label={
              startedTours.has(tourId)
                ? "Hunt Started"
                : startingTourId === tourId
                  ? "Starting..."
                  : "Start Hunt"
            }
            onPress={() => void handleStartHunt(tourId)}
            disabled={startedTours.has(tourId) || startingTourId !== null}
            surface="hunt"
          />
          {tokens.map((token) => {
            const meta = toneMeta[token.tone];
            const isCollected = collected.has(token.id);
            const huntStarted = startedTours.has(token.tourId);
            const inRange = isWithinClaimRadius(token, snapshot.lastPosition);
            return (
              <View
                key={token.id}
                style={[
                  styles.tokenRow,
                  isCollected ? styles.tokenRowCollected : null,
                  inRange && !isCollected ? styles.tokenRowReady : null
                ]}
              >
                <View style={[styles.tokenGlyphWrap, { backgroundColor: meta.shell, shadowColor: meta.glow }]}>
                  <Text style={[styles.tokenGlyph, { color: meta.ink }]}>{token.glyph}</Text>
                </View>
                <View style={styles.tokenContent}>
                  <Text style={styles.tokenTitle}>{token.stopTitle}</Text>
                  <Text style={styles.tokenSummary} numberOfLines={2}>{token.summary}</Text>
                  <View style={styles.tokenMetaRow}>
                    <Chip label={meta.label} tone="default" />
                    <Chip
                      label={
                        isCollected
                          ? "Collected"
                          : inRange
                            ? "Ready to claim"
                          : !huntStarted
                            ? "Start this hunt first"
                            : getTokenDistanceLabel(token, snapshot.lastPosition)
                      }
                      tone={isCollected ? "success" : inRange ? "success" : !huntStarted ? "default" : token.gpsReady ? "warn" : "danger"}
                    />
                    <Chip label={formatRadiusLabel(token.triggerRadiusM)} tone="default" />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Reset Progress</Text>
        <Text style={styles.summaryCopy}>Reset Hunt clears all started hunt tracks and collected token progress on this device.</Text>
        <PrimaryButton
          label={isResetting ? "Resetting..." : "Reset Hunt"}
          onPress={() => void handleReset()}
          disabled={isResetting}
          surface="hunt"
        />
      </Card>
    </ScrollView>
  );
}

function distanceForToken(token: ScavengerToken, position: ScavengerHuntSnapshot["lastPosition"]) {
  if (!position || !token.gpsReady) {
    return null;
  }
  return haversineDistanceM(position.latitude, position.longitude, token.lat, token.lng);
}

function isWithinClaimRadius(token: ScavengerToken, position: ScavengerHuntSnapshot["lastPosition"]) {
  return getTokenDistanceLabel(token, position) === "Ready to claim";
}

function formatRadiusLabel(triggerRadiusM: number) {
  const miles = triggerRadiusM / METERS_PER_MILE;
  if (miles < 0.1) {
    return `${triggerRadiusM} m radius`;
  }
  return `${miles.toFixed(1)} mi radius`;
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
    hero: {
      position: "relative",
      overflow: "hidden",
      borderRadius: 32,
      padding: 26,
      gap: 12,
      backgroundColor: colors.headerBackground,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOpacity: 0.14,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      elevation: 4
    },
    heroHaloA: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 999,
      backgroundColor: "rgba(125, 211, 252, 0.18)",
      top: -24,
      right: -20
    },
    heroHaloB: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 999,
      backgroundColor: "rgba(252, 211, 77, 0.15)",
      bottom: -44,
      left: -32
    },
    heroEyebrow: {
      color: colors.info,
      fontSize: type.font(12),
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.2
    },
    heroTitle: {
      color: colors.text,
      fontSize: type.font(31),
      lineHeight: type.line(36),
      fontWeight: "800",
      maxWidth: 540
    },
    heroCopy: {
      color: colors.textSoft,
      fontSize: type.font(15),
      lineHeight: type.line(22),
      maxWidth: 560
    },
    heroChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    revealCard: {
      gap: 10,
      borderRadius: 28,
      backgroundColor: colors.surfaceRaised
    },
    revealEyebrow: {
      color: colors.warn,
      fontSize: type.font(12),
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.1
    },
    revealTitle: {
      color: colors.text,
      fontSize: type.font(24),
      fontWeight: "800"
    },
    revealCopy: {
      color: colors.textSoft,
      fontSize: type.font(14),
      lineHeight: type.line(21)
    },
    summaryCard: {
      gap: 12,
      backgroundColor: colors.surfaceRaised
    },
    sectionTitle: {
      color: colors.text,
      fontSize: type.font(18),
      fontWeight: "800"
    },
    summaryCopy: {
      color: colors.textSoft,
      fontSize: type.font(14),
      lineHeight: type.line(21)
    },
    ruleList: {
      gap: 8
    },
    ruleItem: {
      color: colors.textSoft,
      fontSize: type.font(13),
      lineHeight: type.line(19)
    },
    group: {
      gap: 12,
      backgroundColor: colors.surfaceRaised,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18
    },
    groupHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12
    },
    groupHeaderText: {
      flex: 1,
      gap: 4
    },
    groupTitle: {
      color: colors.text,
      fontSize: type.font(18),
      fontWeight: "800"
    },
    groupMeta: {
      color: colors.textMuted,
      fontSize: type.font(12),
      fontWeight: "700"
    },
    groupProgress: {
      alignItems: "flex-end",
      gap: 2
    },
    groupProgressCount: {
      color: colors.text,
      fontSize: type.font(16),
      fontWeight: "800"
    },
    groupProgressLabel: {
      color: colors.textMuted,
      fontSize: type.font(11),
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8
    },
    progressTrack: {
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.surfaceSoft,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.info
    },
    tokenRow: {
      flexDirection: "row",
      gap: 14,
      padding: 18,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface
    },
    tokenRowReady: {
      borderColor: colors.success,
      backgroundColor: colors.successSoft
    },
    tokenRowCollected: {
      opacity: 0.72
    },
    tokenGlyphWrap: {
      width: 58,
      height: 58,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      shadowOpacity: 0.22,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4
    },
    tokenGlyph: {
      fontSize: type.font(24),
      fontWeight: "900"
    },
    tokenContent: {
      flex: 1,
      gap: 6
    },
    tokenTitle: {
      color: colors.text,
      fontSize: type.font(16),
      fontWeight: "800"
    },
    tokenSummary: {
      color: colors.textSoft,
      fontSize: type.font(13),
      lineHeight: type.line(19)
    },
    tokenMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    }
  });
}
