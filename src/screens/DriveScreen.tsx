import React from "react";
import { useNarration } from "../hooks/useNarration";
import { getNarrationCoverage, startNarration, stopNarration, type NarrationCoverage } from "../services/narration";
import { Alert, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { useDriveSession } from "../hooks/useDriveSession";
import { useCompanionSession } from "../hooks/useCompanionSession";
import { getHandoffModeMeta, parseHandoffUrl } from "../services/deepLinks";
import { getGlassesDisplayStatus, hideCompassOverlay, showCompassOverlay, updateCompassOverlay, type GlassesDisplayStatus } from "../services/glassesDisplay";
import { triggerHandoffTarget } from "../services/handoffBus";
import { haversineDistanceM } from "../services/geofence";
import {
  getCurrentHeading,
  getCurrentPosition,
  requestForegroundLocationPermission,
  startHeadingWatch,
  startLocationWatch,
  type PositionWatcher,
  type UserHeading,
  type UserPosition
} from "../services/location";
import { useAppTheme, type AppPalette } from "../theme/appTheme";
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
const FOUNDERS_COMPASS_ANCHOR = {
  lat: 39.953405220467,
  lng: -75.163235969318
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
  const opener = leadStops.length ? `${leadStops.join(" and ")} begin near the Founders Compass.` : "A story-led Philadelphia route.";
  return durationMin >= 90
    ? `${opener} North Broad stays the north star as ${stopCount} stops open across ${distanceMiles} miles.`
    : `${opener} Follow ${stopCount} compass points across ${distanceMiles} miles.`;
}

function getFullAudioStopCount(tourId: string) {
  return getDriveStops(tourId).filter((stop) => getNarrationCoverage(stop.id) === "full_audio").length;
}

function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360;
}

function getHeadingDegrees(heading: UserHeading | null) {
  if (!heading) {
    return null;
  }
  return typeof heading.trueHeadingDeg === "number" ? heading.trueHeadingDeg : heading.magHeadingDeg;
}

function getCardinalDirection(degrees: number | null) {
  if (degrees === null) {
    return "Waiting";
  }
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(normalizeDegrees(degrees) / 45) % directions.length];
}

function getBearingToPoint(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

function getTurnLabel(delta: number | null) {
  if (delta === null) {
    return "Hold the phone level to wake the compass.";
  }
  const normalized = ((delta + 540) % 360) - 180;
  const magnitude = Math.abs(normalized);
  if (magnitude < 12) {
    return "You are facing the next compass point.";
  }
  return `Turn ${normalized > 0 ? "right" : "left"} ${Math.round(magnitude)} deg toward the next point.`;
}

function getDistanceLabel(distanceMeters: number | null) {
  if (distanceMeters === null) {
    return "Location pending";
  }
  if (distanceMeters < 160) {
    return `${Math.round(distanceMeters)} m away`;
  }
  const miles = distanceMeters / 1609.344;
  return miles < 1 ? `${miles.toFixed(2)} mi away` : `${miles.toFixed(1)} mi away`;
}

function buildAppleMapsDirectionsUrl(stop: { lat: number; lng: number; title: string }) {
  return `http://maps.apple.com/?daddr=${stop.lat},${stop.lng}&q=${encodeURIComponent(stop.title)}&dirflg=w`;
}

function buildGoogleMapsDirectionsUrl(stop: { lat: number; lng: number }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=walking`;
}

function buildGoogleMapsAppUrl(stop: { lat: number; lng: number }) {
  return Platform.OS === "android"
    ? `google.navigation:q=${stop.lat},${stop.lng}&mode=w`
    : `comgooglemaps://?daddr=${stop.lat},${stop.lng}&directionsmode=walking`;
}

export function DriveScreen({ initialTourId }: Props) {
  const { colors, resolvedAppearanceMode } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors, resolvedAppearanceMode === "dark"), [colors, resolvedAppearanceMode]);
  const [selectedTourId, setSelectedTourId] = React.useState<string>(initialTourId || driveTours[0]?.id || "");
  const [fullAudioOnly, setFullAudioOnly] = React.useState(false);
  const [heading, setHeading] = React.useState<UserHeading | null>(null);
  const [headingError, setHeadingError] = React.useState<string | null>(null);
  const [userPosition, setUserPosition] = React.useState<UserPosition | null>(null);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [autoAdvanceNote, setAutoAdvanceNote] = React.useState<string | null>(null);
  const [displayStatus, setDisplayStatus] = React.useState<GlassesDisplayStatus | null>(null);
  const { driveSession, setDriveSession, loading } = useDriveSession();
  const { status: companionStatus } = useCompanionSession();
  const narration = useNarration();
  const autoNarratedStopIdRef = React.useRef<string | null>(null);
  const autoAdvancedStopIdsRef = React.useRef<Set<string>>(new Set());

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

  React.useEffect(() => {
    autoAdvancedStopIdsRef.current = new Set();
    setAutoAdvanceNote(null);
  }, [selectedTourId]);

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
  const headingDegrees = getHeadingDegrees(heading);
  const normalizedHeading = headingDegrees === null ? null : normalizeDegrees(headingDegrees);
  const targetStop = currentStop || nextStop || driveStops[0] || null;
  const bearingOrigin = userPosition ? { lat: userPosition.latitude, lng: userPosition.longitude } : FOUNDERS_COMPASS_ANCHOR;
  const targetBearing = targetStop ? getBearingToPoint(bearingOrigin, { lat: targetStop.lat, lng: targetStop.lng }) : null;
  const distanceToTarget = userPosition && targetStop ? haversineDistanceM(userPosition.latitude, userPosition.longitude, targetStop.lat, targetStop.lng) : null;
  const targetDelta = normalizedHeading === null || targetBearing === null ? null : targetBearing - normalizedHeading;
  const needleRotation = normalizedHeading === null ? 0 : -normalizedHeading;
  const targetRotation = targetBearing === null || normalizedHeading === null ? 0 : targetBearing - normalizedHeading;
  const turnInstruction = getTurnLabel(targetDelta);
  const glassesPayload = React.useMemo(
    () => ({
      headingDeg: normalizedHeading,
      targetBearingDeg: targetBearing,
      targetDeltaDeg: targetDelta,
      nextStopTitle: targetStop?.title || null,
      instruction: targetStop ? `${turnInstruction} Next: ${targetStop.title}.` : "Choose a compass path to point the needle at the next stop.",
      companionConnected: companionStatus.connectionState === "connected"
    }),
    [companionStatus.connectionState, normalizedHeading, targetBearing, targetDelta, targetStop?.title, turnInstruction]
  );

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

  React.useEffect(() => {
    let mounted = true;
    let watcher: { remove: () => void } | null = null;

    getCurrentHeading()
      .then((nextHeading) => {
        if (mounted) {
          setHeading(nextHeading);
        }
      })
      .catch((error) => {
        if (mounted) {
          setHeadingError((error as Error).message || "Compass is not available yet.");
        }
      });

    startHeadingWatch((nextHeading) => {
      if (mounted) {
        setHeading(nextHeading);
        setHeadingError(null);
      }
    })
      .then((nextWatcher) => {
        watcher = nextWatcher;
      })
      .catch((error) => {
        if (mounted) {
          setHeadingError((error as Error).message || "Compass is not available yet.");
        }
      });

    return () => {
      mounted = false;
      watcher?.remove();
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    let watcher: PositionWatcher | null = null;

    async function startCompassLocationWatch() {
      const granted = await requestForegroundLocationPermission();
      if (!mounted) {
        return;
      }
      if (!granted) {
        setLocationError("Location permission is needed for automatic compass advance.");
        return;
      }

      try {
        const current = await getCurrentPosition();
        if (mounted) {
          setUserPosition(current);
          setLocationError(null);
        }
      } catch (error) {
        if (mounted) {
          setLocationError((error as Error).message || "Live location is not available yet.");
        }
      }

      watcher = await startLocationWatch(
        (position) => {
          if (mounted) {
            setUserPosition(position);
            setLocationError(null);
          }
        },
        (message) => {
          if (mounted) {
            setLocationError(message);
          }
        }
      );
    }

    startCompassLocationWatch().catch((error) => {
      if (mounted) {
        setLocationError((error as Error).message || "Live location is not available yet.");
      }
    });

    return () => {
      mounted = false;
      watcher?.remove();
    };
  }, []);

  React.useEffect(() => {
    if (!selectedTour || !targetStop || distanceToTarget === null || distanceToTarget > targetStop.triggerRadiusM) {
      return;
    }

    const advanceKey = `${selectedTour.id}:${targetStop.id}`;
    if (autoAdvancedStopIdsRef.current.has(advanceKey)) {
      return;
    }
    autoAdvancedStopIdsRef.current.add(advanceKey);

    let cancelled = false;
    async function advanceCompassTarget() {
      try {
        startNarration(targetStop, "drive").catch(() => undefined);

        if (activeSession) {
          const nextSession = await advanceDriveSession(activeSession);
          if (cancelled) {
            return;
          }
          setDriveSession(nextSession);
          setAutoAdvanceNote(
            nextSession
              ? `Reached ${targetStop.title}. Compass advanced to the next point.`
              : `Reached ${targetStop.title}. This compass path is complete.`
          );
          return;
        }

        const startedSession = await startDriveSession(selectedTour.id);
        const nextSession = startedSession.currentStopId === targetStop.id ? await advanceDriveSession(startedSession) : startedSession;
        if (cancelled) {
          return;
        }
        setDriveSession(nextSession);
        setAutoAdvanceNote(
          nextSession
            ? `Reached ${targetStop.title}. Compass advanced to the next point.`
            : `Reached ${targetStop.title}. This compass path is complete.`
        );
      } catch (error) {
        if (!cancelled) {
          setLocationError((error as Error).message || "Could not auto-advance this compass point.");
        }
      }
    }

    advanceCompassTarget();

    return () => {
      cancelled = true;
    };
  }, [activeSession, distanceToTarget, selectedTour, setDriveSession, targetStop]);

  React.useEffect(() => {
    let mounted = true;
    getGlassesDisplayStatus()
      .then((status) => {
        if (mounted) {
          setDisplayStatus(status);
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
      void hideCompassOverlay();
    };
  }, []);

  React.useEffect(() => {
    if (displayStatus?.mode !== "native_overlay") {
      return;
    }
    updateCompassOverlay(glassesPayload)
      .then(setDisplayStatus)
      .catch(() => undefined);
  }, [displayStatus?.mode, glassesPayload]);

  React.useEffect(() => {
    if (displayStatus?.mode === "native_overlay") {
      return;
    }
    showCompassOverlay(glassesPayload)
      .then(setDisplayStatus)
      .catch(() => undefined);
  }, [displayStatus?.mode, glassesPayload.nextStopTitle]);

  async function previewArrivalHandoff() {
    const targetStop = activeSession ? currentStop : nextStop;
    if (!targetStop) {
      return;
    }
    const parsed = parseHandoffUrl(targetStop.handoffDeepLink);
    if (!parsed) {
      Alert.alert("Stop unavailable", "Could not open this stop yet.");
      return;
    }
    triggerHandoffTarget(parsed);
  }

  async function openDirections(provider: "native" | "google" = "native") {
    if (!targetStop) {
      Alert.alert("No compass point selected", "Choose a compass path before opening turn-by-turn directions.");
      return;
    }

    const nativeUrl = Platform.OS === "ios" ? buildAppleMapsDirectionsUrl(targetStop) : buildGoogleMapsAppUrl(targetStop);
    const googleAppUrl = buildGoogleMapsAppUrl(targetStop);
    const googleWebUrl = buildGoogleMapsDirectionsUrl(targetStop);
    const preferredUrl = provider === "google" ? googleAppUrl : nativeUrl;
    const fallbackUrl = provider === "google" || Platform.OS !== "ios" ? googleWebUrl : googleAppUrl;

    try {
      if (await Linking.canOpenURL(preferredUrl)) {
        await Linking.openURL(preferredUrl);
        return;
      }
      if (await Linking.canOpenURL(fallbackUrl)) {
        await Linking.openURL(fallbackUrl);
        return;
      }
      await Linking.openURL(googleWebUrl);
    } catch (error) {
      Alert.alert("Navigation unavailable", (error as Error).message || "Could not open directions for this compass point.");
    }
  }

  function onNavigateToNextPoint() {
    if (!targetStop) {
      Alert.alert("No compass point selected", "Choose a compass path before opening turn-by-turn directions.");
      return;
    }

    if (Platform.OS === "ios") {
      Alert.alert(`Navigate to ${targetStop.title}`, "Open turn-by-turn directions in a maps app.", [
        { text: "Apple Maps", onPress: () => void openDirections("native") },
        { text: "Google Maps", onPress: () => void openDirections("google") },
        { text: "Cancel", style: "cancel" }
      ]);
      return;
    }

    void openDirections("native");
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
        <Text style={styles.heroEyebrow}>Founders Compass</Text>
        <Text style={styles.heroTitle}>A live compass for the phone and glasses path.</Text>
        <Text style={styles.heroCopy}>
          North Broad is the north star. Hold the device level and the needle moves as you turn toward the next compass point.
        </Text>
      </View>

      <Card style={styles.compassCard}>
        <View style={styles.compassHeader}>
          <View style={styles.compassHeaderText}>
            <Text style={styles.label}>Live bearing</Text>
            <Text style={styles.compassTitle}>{normalizedHeading === null ? "Finding north" : `${Math.round(normalizedHeading)} deg ${getCardinalDirection(normalizedHeading)}`}</Text>
          </View>
          <View style={styles.compassStatus}>
            <Text style={styles.compassStatusText}>
              {displayStatus?.mode === "native_overlay"
                ? "Glasses overlay live"
                : displayStatus?.mode === "notification_only"
                  ? "Glasses notifications"
                  : companionStatus.connectionState === "connected"
                    ? "Glasses audio linked"
                    : "Phone compass live"}
            </Text>
          </View>
        </View>
        <View style={styles.compassDial}>
          <Text style={[styles.compassDirection, styles.compassNorth]}>N</Text>
          <Text style={[styles.compassDirection, styles.compassEast]}>E</Text>
          <Text style={[styles.compassDirection, styles.compassSouth]}>S</Text>
          <Text style={[styles.compassDirection, styles.compassWest]}>W</Text>
          <View style={[styles.compassNeedle, { transform: [{ rotate: `${needleRotation}deg` }] }]}>
            <View style={styles.compassNeedleNorth} />
            <View style={styles.compassNeedleSouth} />
          </View>
          {targetStop ? (
            <View style={[styles.targetNeedle, { transform: [{ rotate: `${targetRotation}deg` }] }]}>
              <View style={styles.targetNeedleTip} />
            </View>
          ) : null}
          <View style={styles.compassCenter}>
            <Text style={styles.compassCenterText}>{getCardinalDirection(normalizedHeading)}</Text>
          </View>
        </View>
        <Text style={styles.compassCopy}>
          {glassesPayload.instruction}
        </Text>
        {headingError ? <Text style={styles.compassError}>{headingError}</Text> : null}
        {locationError ? <Text style={styles.compassError}>{locationError}</Text> : null}
        {autoAdvanceNote ? <Text style={styles.compassDisplayNote}>{autoAdvanceNote}</Text> : null}
        {displayStatus?.message ? <Text style={styles.compassDisplayNote}>{displayStatus.message}</Text> : null}
        <View style={styles.chips}>
          <Chip label={targetBearing === null ? "No target yet" : `Target ${Math.round(targetBearing)} deg`} tone="warn" />
          <Chip
            label={distanceToTarget !== null && targetStop && distanceToTarget <= targetStop.triggerRadiusM ? "Inside arrival zone" : getDistanceLabel(distanceToTarget)}
            tone={distanceToTarget !== null && targetStop && distanceToTarget <= targetStop.triggerRadiusM ? "success" : "default"}
          />
          <Chip label={heading?.accuracy == null ? "Accuracy pending" : `Accuracy ${Math.round(heading.accuracy)}`} tone="default" />
          <Chip
            label={
              displayStatus?.mode === "native_overlay"
                ? "Native overlay"
                : displayStatus?.mode === "notification_only"
                  ? "Notification bridge"
                  : "Phone screen active"
            }
            tone={displayStatus?.supported ? "success" : "default"}
          />
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="Navigate to Next Point" onPress={onNavigateToNextPoint} disabled={!targetStop} />
        </View>
      </Card>

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
                    <Chip label={tour.heroStopTitle ? `First compass point: ${tour.heroStopTitle}` : "Start compass path"} tone="warn" />
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
          <Text style={styles.featureEyebrow}>Selected compass path</Text>
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
                <Chip label={currentHandoffMeta?.chipLabel || "Continue on foot"} tone="warn" />
                <Chip {...getCoverageMeta(getNarrationCoverage(currentStop.id))} />
              </View>
              {activeSession?.mode === "arrived" && currentHandoffMeta ? <Text style={styles.arrivalCallout}>{currentHandoffMeta.summary}</Text> : null}
              {__DEV__ ? (
                <>
                  <Text style={styles.specLabel}>Deep link</Text>
                  <Text style={styles.handoffLink}>{currentStop.handoffDeepLink}</Text>
                </>
              ) : null}
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

function createStyles(colors: AppPalette, isDark: boolean) {
  return StyleSheet.create({
  container: {
    padding: 18,
    gap: 18,
    backgroundColor: colors.background
  },
  heroPanel: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: isDark ? colors.backgroundElevated : "#ffffff",
    borderRadius: 32,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: isDark ? "rgba(255, 191, 173, 0.16)" : colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: isDark ? 0.18 : 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5
  },
  heroGlowPrimary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: isDark ? "rgba(91, 56, 245, 0.24)" : "rgba(106, 73, 255, 0.09)",
    top: -92,
    right: -74
  },
  heroGlowSecondary: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: isDark ? "rgba(255, 188, 138, 0.12)" : "rgba(255, 188, 138, 0.16)",
    bottom: -90,
    left: -58
  },
  heroEyebrow: {
    color: isDark ? "#ff9ab2" : colors.warn,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  heroTitle: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800"
  },
  heroCopy: {
    color: colors.textSoft,
    lineHeight: 21
  },
  panel: {
    backgroundColor: colors.surface,
    gap: 14
  },
  compassCard: {
    backgroundColor: colors.surface,
    gap: 16,
    borderColor: isDark ? "rgba(125, 211, 252, 0.22)" : colors.borderStrong
  },
  compassHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  compassHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  compassTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800"
  },
  compassStatus: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.infoSoft
  },
  compassStatusText: {
    color: colors.info,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  compassDial: {
    alignSelf: "center",
    width: 248,
    height: 248,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: isDark ? "rgba(186, 230, 253, 0.34)" : colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised
  },
  compassDirection: {
    position: "absolute",
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800"
  },
  compassNorth: { top: 14 },
  compassEast: { right: 16 },
  compassSouth: { bottom: 14 },
  compassWest: { left: 16 },
  compassNeedle: {
    position: "absolute",
    width: 22,
    height: 176,
    alignItems: "center"
  },
  compassNeedleNorth: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 88,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.warn
  },
  compassNeedleSouth: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 82,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: isDark ? "rgba(255,255,255,0.26)" : "rgba(15,23,42,0.18)"
  },
  targetNeedle: {
    position: "absolute",
    width: 16,
    height: 196,
    alignItems: "center"
  },
  targetNeedleTip: {
    width: 12,
    height: 42,
    borderRadius: 999,
    backgroundColor: colors.info
  },
  compassCenter: {
    width: 74,
    height: 74,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  compassCenterText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  compassCopy: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21
  },
  compassError: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19
  },
  compassDisplayNote: {
    color: colors.info,
    fontSize: 12,
    lineHeight: 18
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
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    shadowColor: colors.shadow,
    shadowOpacity: isDark ? 0.14 : 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  routeCatalogCardActive: {
    borderColor: isDark ? "rgba(125, 99, 255, 0.44)" : "rgba(92, 69, 255, 0.24)",
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
    color: colors.textSoft,
    lineHeight: 20
  },
  narrationCard: {
    marginTop: 8,
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 26
  },
  featureCard: {
    backgroundColor: isDark ? "#2b1530" : "#fff7ed",
    borderColor: isDark ? "rgba(255, 176, 132, 0.2)" : "rgba(180,83,9,0.16)",
    gap: 12,
    borderRadius: 30
  },
  featureEyebrow: {
    color: colors.warn,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9
  },
  featureTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800"
  },
  featureBody: {
    color: colors.textSoft,
    lineHeight: 22
  },
  label: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  tourWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  tourChip: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: "hidden",
    minWidth: 170
  },
  tourChipActive: {
    backgroundColor: isDark ? "rgba(91, 56, 245, 0.24)" : "rgba(91, 56, 245, 0.1)",
    borderColor: "#7d63ff"
  },
  tourChipEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  tourChipEyebrowActive: {
    color: isDark ? "#cfc3ff" : "#5b38f5"
  },
  tourChipText: {
    color: colors.textSoft,
    fontWeight: "700"
  },
  tourChipTextActive: {
    color: colors.text
  },
  tourChipMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  tourChipMetaActive: {
    color: colors.textSoft
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  nextStopTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800"
  },
  arrivalCallout: {
    color: colors.textSoft,
    lineHeight: 21
  },
  specLabel: {
    color: colors.warn,
    fontWeight: "700"
  },
  handoffLink: {
    color: colors.success,
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
      backgroundColor: colors.surfaceSoft
  },
  stopIndexWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center"
  },
  stopIndexWrapCurrent: {
    backgroundColor: colors.warn
  },
  stopIndexWrapNext: {
    backgroundColor: colors.success
  },
  stopIndex: {
    color: isDark ? "#fff3ea" : colors.text,
    fontWeight: "800"
  },
  stopContent: {
    flex: 1,
    gap: 4
  },
  stopTitle: {
    color: colors.text,
    fontWeight: "800"
  },
  copy: {
    color: colors.textSoft,
    lineHeight: 21
  }
  });
}
