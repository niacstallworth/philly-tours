import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { useDriveSession } from "../hooks/useDriveSession";
import { useNarration } from "../hooks/useNarration";
import { getHandoffModeMeta, parseHandoffUrl } from "../services/deepLinks";
import { triggerHandoffTarget } from "../services/handoffBus";
import { advanceDriveSession, getCurrentDriveStop, markDriveArrived } from "../services/driveMode";
import { getTriggeredStops, haversineDistanceM } from "../services/geofence";
import {
  getCurrentPosition,
  requestForegroundLocationPermission,
  startLocationWatch,
  UserPosition
} from "../services/location";
import { getNarrationCoverage, startNarration, stopNarration, type NarrationCoverage } from "../services/narration";

type StopWithTour = (typeof tours)[number]["stops"][number] & {
  tourId: string;
  tourTitle: string;
  color: string;
};

const TOUR_COLORS = ["#ff8ca8", "#ffbc8a", "#ffd36b", "#8fd7c3", "#7dc9ff", "#b79cff"];

type Props = {
  initialFocusedTourId?: string;
  highlightedStopId?: string;
};

export function MapScreen({ initialFocusedTourId, highlightedStopId }: Props) {
  const mapRef = useRef<MapView | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [watching, setWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleTourIds, setVisibleTourIds] = useState<Set<string>>(() => new Set([initialFocusedTourId || tours[0]?.id || ""]));
  const [focusedTourId, setFocusedTourId] = useState<string>(initialFocusedTourId || tours[0]?.id || "");
  const { driveSession, setDriveSession } = useDriveSession();
  const narration = useNarration();
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const watchRef = useRef<{ remove: () => void } | null>(null);
  const autoArrivedStopIdRef = useRef<string | null>(null);

  const tourColorById = useMemo(() => {
    const map = new Map<string, string>();
    tours.forEach((tour, index) => map.set(tour.id, TOUR_COLORS[index % TOUR_COLORS.length]));
    return map;
  }, []);

  const visibleTours = useMemo(() => tours.filter((tour) => visibleTourIds.has(tour.id)), [visibleTourIds]);
  const focusedTour = useMemo(() => tours.find((tour) => tour.id === focusedTourId) || tours[0], [focusedTourId]);
  const visibleStops = useMemo<StopWithTour[]>(() => {
    return visibleTours.flatMap((tour) =>
      tour.stops.map((stop) => ({
        ...stop,
        tourId: tour.id,
        tourTitle: tour.title,
        color: tourColorById.get(tour.id) || "#7dc9ff"
      }))
    );
  }, [tourColorById, visibleTours]);
  const currentDriveStop = useMemo(() => getCurrentDriveStop(driveSession), [driveSession]);
  const highlightedStop = useMemo(
    () => {
      const preferredStopId = highlightedStopId || currentDriveStop?.id;
      return visibleStops.find((stop) => stop.id === preferredStopId) || null;
    },
    [currentDriveStop?.id, highlightedStopId, visibleStops]
  );

  useEffect(() => {
    if (initialFocusedTourId && tours.some((tour) => tour.id === initialFocusedTourId)) {
      setFocusedTourId(initialFocusedTourId);
      setVisibleTourIds(new Set([initialFocusedTourId]));
    }
  }, [initialFocusedTourId]);

  useEffect(() => {
    if (!initialFocusedTourId && driveSession?.tourId && tours.some((tour) => tour.id === driveSession.tourId)) {
      setFocusedTourId(driveSession.tourId);
      setVisibleTourIds(new Set([driveSession.tourId]));
    }
  }, [driveSession?.tourId, initialFocusedTourId]);

  useEffect(() => {
    return () => {
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, []);

  const triggeredIds = useMemo(() => {
    if (!userPosition) {
      return new Set<string>();
    }
    return new Set(getTriggeredStops(userPosition.latitude, userPosition.longitude, visibleStops).map((stop) => stop.id));
  }, [userPosition, visibleStops]);
  const currentDriveStopInRange = useMemo(() => {
    if (!currentDriveStop) {
      return false;
    }
    return triggeredIds.has(currentDriveStop.id);
  }, [currentDriveStop, triggeredIds]);
  const currentDriveHandoffMeta = useMemo(
    () => (currentDriveStop ? getHandoffModeMeta(currentDriveStop.handoffDeepLink.endsWith("/ar") ? "ar" : "arrive") : null),
    [currentDriveStop]
  );

  useEffect(() => {
    if (!driveSession || driveSession.mode !== "drive" || !currentDriveStop || !currentDriveStopInRange) {
      return;
    }
    if (autoArrivedStopIdRef.current === currentDriveStop.id) {
      return;
    }

    autoArrivedStopIdRef.current = currentDriveStop.id;
    markDriveArrived(driveSession)
      .then((nextSession) => {
        setDriveSession(nextSession);
      })
      .catch(() => {
        autoArrivedStopIdRef.current = null;
      });
  }, [currentDriveStop, currentDriveStopInRange, driveSession, setDriveSession]);

  const nearest = useMemo(() => {
    if (!userPosition || visibleStops.length === 0) {
      return null;
    }
    return visibleStops
      .map((stop) => ({ stop, distance: haversineDistanceM(userPosition.latitude, userPosition.longitude, stop.lat, stop.lng) }))
      .sort((left, right) => left.distance - right.distance)[0] || null;
  }, [userPosition, visibleStops]);

  const seedRegion = useMemo<Region>(() => {
    const seedStop = focusedTour?.stops[0] || { lat: 39.9526, lng: -75.1652 };
    return {
      latitude: userPosition?.latitude || seedStop.lat,
      longitude: userPosition?.longitude || seedStop.lng,
      latitudeDelta: 0.07,
      longitudeDelta: 0.07
    };
  }, [focusedTour, userPosition]);

  useEffect(() => {
    if (!mapRegion) {
      setMapRegion(seedRegion);
    }
  }, [mapRegion, seedRegion]);

  async function onEnableLocation() {
    setError(null);
    try {
      const granted = await requestForegroundLocationPermission();
      setPermissionGranted(granted);
      if (!granted) {
        setError("Location permission denied.");
        return;
      }
      const current = await getCurrentPosition();
      setUserPosition(current);
      setMapRegion({ latitude: current.latitude, longitude: current.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 });
      if (!watchRef.current) {
        watchRef.current = await startLocationWatch(
          (position) => setUserPosition(position),
          (message) => setError(message)
        );
        setWatching(true);
      }
    } catch {
      setError("Could not fetch location.");
    }
  }

  function onStopWatch() {
    watchRef.current?.remove();
    watchRef.current = null;
    setWatching(false);
  }

  function chooseTour(tourId: string) {
    setFocusedTourId(tourId);
    setVisibleTourIds(new Set([tourId]));
  }

  async function onMarkDriveArrived() {
    if (!driveSession) {
      return;
    }
    try {
      const nextSession = await markDriveArrived(driveSession);
      setDriveSession(nextSession);
    } catch (error) {
      Alert.alert("Arrival update failed", (error as Error).message || "Could not update arrival state.");
    }
  }

  async function onAdvanceDriveStop() {
    if (!driveSession) {
      return;
    }
    try {
      const nextSession = await advanceDriveSession(driveSession);
      setDriveSession(nextSession);
      if (!nextSession) {
        Alert.alert("Drive session complete", "You reached the last stop in this route.");
      }
    } catch (error) {
      Alert.alert("Advance failed", (error as Error).message || "Could not advance to the next stop.");
    }
  }

  async function onPreviewArrivalHandoff() {
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
    if (!highlightedStop) {
      return;
    }
    try {
      await startNarration({
        id: highlightedStop.id,
        tourId: highlightedStop.tourId,
        title: highlightedStop.title,
        lat: highlightedStop.lat,
        lng: highlightedStop.lng,
        triggerRadiusM: highlightedStop.triggerRadiusM,
        audioUrl: highlightedStop.audioUrl,
        arrivalSummary: highlightedStop.description.split("|")[0]?.trim() || highlightedStop.description,
        handoffDeepLink: `phillyartours://tour/${highlightedStop.tourId}/stop/${highlightedStop.id}/arrive`
      }, "walk");
    } catch (error) {
      Alert.alert("Narration unavailable", (error as Error).message || "Could not start narration.");
    }
  }

  async function onPlayCurrentDriveNarration() {
    if (!currentDriveStop) {
      return;
    }
    try {
      await startNarration(currentDriveStop, driveSession?.mode === "arrived" ? "walk" : "drive");
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>Map</Text>
        <Text style={styles.heroTitle}>Clean routes. Clear stops. One tour pack in focus.</Text>
        <Text style={styles.heroCopy}>
          This map should feel like a stylish guide, not a GIS console. Keep one pack active and let the city do the rest.
        </Text>
      </View>

      <Card style={styles.panel}>
        <Text style={styles.label}>Tour packs</Text>
        <View style={styles.packWrap}>
          {tours.map((tour) => (
            <Pressable
              key={tour.id}
              onPress={() => chooseTour(tour.id)}
              style={[styles.packChip, focusedTourId === tour.id && styles.packChipActive]}
            >
              <View style={[styles.colorDot, { backgroundColor: tourColorById.get(tour.id) || "#7dc9ff" }]} />
              <Text style={[styles.packText, focusedTourId === tour.id && styles.packTextActive]}>{tour.title}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.panel}>
        <View style={styles.actionsRow}>
          <PrimaryButton label={watching ? "Refresh Location" : "Enable Location"} onPress={onEnableLocation} />
          <PrimaryButton label="Stop" onPress={onStopWatch} />
        </View>
        <View style={styles.chips}>
          <Chip label={permissionGranted ? "Location on" : permissionGranted === false ? "Location denied" : "Location off"} tone={permissionGranted ? "success" : permissionGranted === false ? "danger" : "default"} />
          <Chip label={watching ? "Live tracking" : "Static view"} tone={watching ? "success" : "default"} />
          {nearest ? <Chip label={`Nearest ${nearest.stop.title}`} tone="warn" /> : null}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      {highlightedStop ? (
        <Card style={styles.panel}>
          <Text style={styles.label}>Vehicle handoff target</Text>
          <Text style={styles.copy}>{highlightedStop.title}</Text>
          <Text style={styles.copy}>{highlightedStop.description.split("|")[0]?.trim()}</Text>
          <View style={styles.chips}>
            <Chip
              label={
                narration.stopId === highlightedStop.id && narration.status === "playing"
                  ? "Audio live"
                  : "Walk narration"
              }
              tone="warn"
            />
          </View>
          <View style={styles.actionsRow}>
            <PrimaryButton
              label={narration.stopId === highlightedStop.id && narration.status === "playing" ? "Replay Stop Audio" : "Play Stop Audio"}
              onPress={onPlayHighlightedNarration}
            />
            {narration.stopId === highlightedStop.id && (narration.status === "playing" || narration.status === "loading") ? (
              <PrimaryButton label="Stop Audio" onPress={onStopNarration} />
            ) : null}
          </View>
        </Card>
      ) : null}

      {currentDriveStop ? (
        <Card style={styles.panel}>
          <Text style={styles.label}>Active route stop</Text>
          <Text style={styles.copy}>{currentDriveStop.title}</Text>
          {driveSession?.mode === "arrived" && currentDriveHandoffMeta ? (
            <Text style={styles.arrivalCopy}>{currentDriveHandoffMeta.summary}</Text>
          ) : null}
          <View style={styles.chips}>
            <Chip label={driveSession?.mode === "arrived" ? "Arrived" : currentDriveStopInRange ? "In range now" : "Not in range"} tone={currentDriveStopInRange || driveSession?.mode === "arrived" ? "success" : "default"} />
            <Chip label={driveSession?.mode === "arrived" && currentDriveHandoffMeta ? currentDriveHandoffMeta.chipLabel : `${currentDriveStop.triggerRadiusM}m trigger`} tone="warn" />
            <Chip
              label={
                narration.stopId === currentDriveStop.id && narration.status === "playing"
                  ? "Audio live"
                  : driveSession?.mode === "arrived"
                    ? "Walk narration"
                    : "Drive narration"
              }
              tone="warn"
            />
          </View>
          <View style={styles.actionsRow}>
            <PrimaryButton
              label={driveSession?.mode === "arrived" ? "Advance To Next Stop" : "Mark Arrived At Stop"}
              onPress={driveSession?.mode === "arrived" ? onAdvanceDriveStop : onMarkDriveArrived}
              disabled={!currentDriveStopInRange && driveSession?.mode !== "arrived"}
            />
            <PrimaryButton
              label={narration.stopId === currentDriveStop.id && narration.status === "playing" ? "Replay Audio" : "Play Audio"}
              onPress={onPlayCurrentDriveNarration}
            />
            {narration.stopId === currentDriveStop.id && (narration.status === "playing" || narration.status === "loading") ? (
              <PrimaryButton label="Stop Audio" onPress={onStopNarration} />
            ) : null}
            {driveSession?.mode === "arrived" && currentDriveHandoffMeta ? (
              <PrimaryButton label={currentDriveHandoffMeta.ctaLabel} onPress={onPreviewArrivalHandoff} />
            ) : null}
          </View>
        </Card>
      ) : null}

      <MapView
        ref={(ref) => {
          mapRef.current = ref;
        }}
        style={styles.map}
        initialRegion={seedRegion}
        onRegionChangeComplete={(next) => setMapRegion(next)}
      >
        {userPosition ? (
          <Marker coordinate={{ latitude: userPosition.latitude, longitude: userPosition.longitude }} title="You" pinColor="#8fd7c3" />
        ) : null}
        {visibleStops.map((stop) => (
          <React.Fragment key={stop.id}>
            <Marker
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              title={stop.title}
              description={stop.tourTitle}
              pinColor={stop.color}
            />
            <Circle
              center={{ latitude: stop.lat, longitude: stop.lng }}
              radius={stop.triggerRadiusM}
              strokeWidth={1}
              strokeColor={triggeredIds.has(stop.id) ? "rgba(255, 140, 168, 0.9)" : `${stop.color}99`}
              fillColor={triggeredIds.has(stop.id) ? "rgba(255, 140, 168, 0.18)" : `${stop.color}20`}
            />
          </React.Fragment>
        ))}
      </MapView>

      <Card style={styles.panel}>
        <Text style={styles.label}>{focusedTour.title}</Text>
        <Text style={styles.copy}>{focusedTour.durationMin} min | {focusedTour.distanceMiles} mi | {focusedTour.stops.length} stops</Text>
        {focusedTour.stops.slice(0, 6).map((stop, index) => (
          <View key={stop.id} style={styles.stopRow}>
            <Text style={styles.stopIndex}>{index + 1}</Text>
            <View style={styles.stopCopyWrap}>
              <Text style={styles.stopTitle}>{stop.title}</Text>
              <View style={styles.stopChips}>
                <Chip {...getCoverageMeta(getNarrationCoverage(stop.id))} />
              </View>
              <Text style={styles.copy}>{triggeredIds.has(stop.id) ? "In range now" : stop.description}</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, gap: 16, backgroundColor: "#060312" },
  heroPanel: {
    backgroundColor: "#130a25",
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 173, 0.16)"
  },
  heroEyebrow: { color: "#ff9ab2", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 },
  heroTitle: { color: "#fff3ea", fontSize: 30, lineHeight: 36, fontWeight: "800" },
  heroCopy: { color: "#d8c7df", lineHeight: 21 },
  panel: { backgroundColor: "#120a22", gap: 12 },
  label: { color: "#fff0e4", fontSize: 18, fontWeight: "800" },
  packWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  packChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1f1233",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  packChipActive: { backgroundColor: "#ff8ca8", borderColor: "#ff8ca8" },
  colorDot: { width: 10, height: 10, borderRadius: 999 },
  packText: { color: "#cab6d2", fontWeight: "700" },
  packTextActive: { color: "#2b1021" },
  actionsRow: { gap: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  error: { color: "#ffadb7", fontWeight: "600" },
  map: { height: 420, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  copy: { color: "#d8c7df", lineHeight: 22 },
  arrivalCopy: { color: "#f0dde7", lineHeight: 21 },
  stopRow: { flexDirection: "row", gap: 12, paddingVertical: 8, alignItems: "flex-start" },
  stopIndex: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#ffbc8a",
    color: "#2b1021",
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "800"
  },
  stopCopyWrap: { flex: 1, gap: 4 },
  stopChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stopTitle: { color: "#fff3ea", fontWeight: "700", fontSize: 16 }
});
