import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card, Chip, PrimaryButton, SectionTitle } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { useBuildQueueProgress } from "../hooks/useBuildQueueProgress";
import { toARSceneManifest } from "../services/arManifest";
import { toARScenePayload } from "../services/ar";
import { getARReadiness } from "../services/arPlanning";
import { getNativeARAdapter } from "../services/native-ar";
import { NativeARStatus } from "../services/native-ar/types";
import { createRealtimeSyncFromEnv, SyncEvent } from "../services/realtime";

const adapter = getNativeARAdapter();
const sync = createRealtimeSyncFromEnv();

export function ARScreen() {
  const [selectedTourId, setSelectedTourId] = useState<string>(tours[0]?.id || "");
  const selectedTour = useMemo(() => tours.find((t) => t.id === selectedTourId) || tours[0], [selectedTourId]);
  const [showPlannedOnly, setShowPlannedOnly] = useState(true);
  const prioritizedStops = useMemo(() => {
    const sorted = [...selectedTour.stops].sort((left, right) => {
      const leftPriority = left.arPriority ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = right.arPriority ?? Number.MAX_SAFE_INTEGER;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
      return left.title.localeCompare(right.title);
    });

    if (!showPlannedOnly) {
      return sorted;
    }

    const planned = sorted.filter((stop) => typeof stop.arPriority === "number");
    return planned.length ? planned : sorted;
  }, [selectedTour, showPlannedOnly]);
  const payloads = useMemo(() => prioritizedStops.map(toARScenePayload), [prioritizedStops]);
  const [selectedStopId, setSelectedStopId] = useState<string>("");
  const selectedPayload = useMemo(
    () => payloads.find((payload) => payload.stopId === selectedStopId) || payloads[0],
    [payloads, selectedStopId]
  );
  const selectedStop = useMemo(
    () => prioritizedStops.find((stop) => stop.id === selectedStopId) || prioritizedStops[0],
    [prioritizedStops, selectedStopId]
  );
  const selectedReadiness = useMemo(
    () => (selectedStop ? getARReadiness(selectedStop) : null),
    [selectedStop]
  );
  const selectedManifest = useMemo(
    () => (selectedStop ? toARSceneManifest(selectedStop) : null),
    [selectedStop]
  );
  const selectedQuality = useMemo(() => {
    const verified = selectedTour.stops.filter((s) => s.coordQuality === "verified").length;
    const approximate = selectedTour.stops.length - verified;
    return { verified, approximate };
  }, [selectedTour]);
  const plannedCount = useMemo(
    () => selectedTour.stops.filter((stop) => typeof stop.arPriority === "number").length,
    [selectedTour]
  );
  const buildQueue = useBuildQueueProgress();
  const [arStatus, setArStatus] = useState<NativeARStatus | null>(null);
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [joined, setJoined] = useState(false);
  const [roomName, setRoomName] = useState("historic-philly-main");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [roomMembers, setRoomMembers] = useState<string[]>([]);
  const [actionStatus, setActionStatus] = useState<string>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!payloads.length) {
      setSelectedStopId("");
      return;
    }
    setSelectedStopId((prev) => (prev && payloads.some((p) => p.stopId === prev) ? prev : payloads[0].stopId));
  }, [payloads]);

  useEffect(() => {
    const offEvent = sync.onEvent((event) => {
      setEvents((prev) => [...prev, event]);
    });

    const offMembers = sync.onRoomMembers((sessionId, members) => {
      if (sessionId === activeSessionId) {
        setRoomMembers(members);
      }
    });

    return () => {
      offEvent?.();
      offMembers?.();
    };
  }, [activeSessionId]);

  const eventsText = useMemo(
    () => events.slice(-5).map((e) => `${e.type} ${e.objectId}`).join(" | "),
    [events]
  );

  async function refreshStatus() {
    try {
      const status = await adapter.getStatus();
      setArStatus(status);
    } catch {
      // Ignore status refresh failures; action handlers already surface failures.
    }
  }

  async function onCheckAR() {
    setActionStatus("checking_provider");
    setActionError(null);
    try {
      const status = await adapter.getStatus();
      setArStatus(status);
      setActionStatus("ready");
    } catch (error) {
      setActionStatus("error");
      setActionError((error as Error).message || "Could not check AR provider.");
    }
  }

  async function onStartARSession() {
    setActionStatus("starting_session");
    setActionError(null);
    try {
      await adapter.startSession();
      setActionStatus("session_started");
      await refreshStatus();
    } catch (error) {
      setActionStatus("error");
      setActionError((error as Error).message || "Could not start AR session.");
    }
  }

  async function onPlaceFirstModel() {
    setActionStatus("placing_model");
    setActionError(null);
    try {
      if (!selectedPayload) {
        throw new Error("No AR model available for this tour.");
      }

      await adapter.placeModel({
        id: selectedPayload.stopId,
        modelUrl: selectedPayload.modelUrl,
        scale: selectedPayload.scale,
        rotationYDeg: selectedPayload.rotationYDeg
      });
      await refreshStatus();

      if (!activeSessionId) {
        setActionStatus("model_placed_local");
        Alert.alert("Placed locally", "Model was placed, but no shared room is active.");
        return;
      }

      sync.send({
        type: "spawn",
        sessionId: activeSessionId,
        objectId: selectedPayload.stopId,
        modelUrl: selectedPayload.modelUrl
      });
      setActionStatus("model_synced");
    } catch (error) {
      setActionStatus("error");
      setActionError((error as Error).message || "Could not place AR model.");
    }
  }

  async function onStartAndPlaceSelected() {
    setActionStatus("starting_and_placing");
    setActionError(null);
    try {
      await adapter.startSession();
      await refreshStatus();
      await onPlaceFirstModel();
    } catch (error) {
      setActionStatus("error");
      setActionError((error as Error).message || "Could not start and place AR model.");
    }
  }

  function onJoinSession() {
    const room = roomName.trim();
    if (!room) {
      return;
    }

    if (joined) {
      sync.leaveSession();
      setJoined(false);
      setActiveSessionId(null);
      setRoomMembers([]);
      return;
    }

    sync.joinSession(room);
    setJoined(true);
    setActiveSessionId(room);
  }

  async function onStopARSession() {
    setActionStatus("stopping_session");
    setActionError(null);
    try {
      await adapter.stopSession();
      setActionStatus("session_stopped");
      await refreshStatus();
    } catch (error) {
      setActionStatus("error");
      setActionError((error as Error).message || "Could not stop AR session.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionTitle>AR Session and Realtime Sync</SectionTitle>
      <Text style={styles.helper}>Realtime co-tour mode with shared room state and AR placement sync.</Text>
      <Text style={styles.value}>Selected tour: {selectedTour.title}</Text>
      <Text style={styles.value}>AR-planned stops: {plannedCount} / {selectedTour.stops.length}</Text>
      <View style={styles.chips}>
        <Chip label={`Status: ${actionStatus}`} tone={actionStatus.includes("error") ? "danger" : "default"} />
        <Chip label={joined ? "Room joined" : "Room not joined"} tone={joined ? "success" : "warn"} />
        <Chip label={`Verified coords: ${selectedQuality.verified}`} tone={selectedQuality.verified > 0 ? "success" : "warn"} />
        <Chip label={`Approx coords: ${selectedQuality.approximate}`} tone={selectedQuality.approximate > 0 ? "warn" : "default"} />
        <Chip label={showPlannedOnly ? "Showing planned AR only" : "Showing all stops"} tone={showPlannedOnly ? "success" : "default"} />
      </View>
      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      <Card style={styles.statusCard}>
        <Text style={styles.label}>Choose Tour</Text>
        <View style={styles.tourList}>
          {tours.map((tour) => (
            <View key={tour.id} style={styles.tourRow}>
              <Pressable
                onPress={() => setSelectedTourId(tour.id)}
                style={[styles.tourChip, selectedTourId === tour.id && styles.tourChipActive]}
              >
                <Text style={[styles.tourChipText, selectedTourId === tour.id && styles.tourChipTextActive]}>
                  {tour.title}
                </Text>
              </Pressable>
              <Chip
                label={`${tour.stops.filter((s) => s.coordQuality === "verified").length}/${tour.stops.length} verified`}
                tone={tour.stops.some((s) => s.coordQuality === "verified") ? "success" : "warn"}
              />
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.statusCard}>
        <Text style={styles.label}>Choose Stop To Place</Text>
        <PrimaryButton
          label={showPlannedOnly ? "Show All Stops" : "Show Planned AR Stops"}
          onPress={() => setShowPlannedOnly((prev) => !prev)}
        />
        <View style={styles.tourList}>
          {prioritizedStops.map((stop, index) => (
            <Pressable
              key={stop.id}
              onPress={() => setSelectedStopId(stop.id)}
              style={[styles.tourChip, selectedStopId === stop.id && styles.tourChipActive]}
            >
              <Text style={[styles.tourChipText, selectedStopId === stop.id && styles.tourChipTextActive]}>
                {typeof stop.arPriority === "number" ? `P${stop.arPriority}` : `Stop ${index + 1}`} {stop.title}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.value}>Selected stop: {selectedStop?.title || "none"}</Text>
        <Text style={styles.value}>AR type: {selectedStop?.arType || "not assigned"}</Text>
        <Text style={styles.value}>Readiness: {selectedReadiness?.label || "not assigned"}</Text>
        <Text style={styles.value}>
          Pipeline: {selectedStop && typeof selectedStop.arPriority === "number" && buildQueue.loaded ? buildQueue.getStage(selectedStop.id).label : "not tracked"}
        </Text>
        <Text style={styles.value}>Asset needed: {selectedStop?.assetNeeded || "not assigned"}</Text>
        <Text style={styles.value}>Effort: {selectedStop?.estimatedEffort || "not assigned"}</Text>
        {selectedManifest ? (
          <>
            <Text style={styles.label}>Scene Manifest</Text>
            <Text style={styles.value}>Headline: {selectedManifest.headline}</Text>
            <Text style={styles.value}>Era: {selectedManifest.historicalEra}</Text>
            <Text style={styles.value}>Style: {selectedManifest.stylePreset}</Text>
            <Text style={styles.value}>Visual priority: {selectedManifest.visualPriority}</Text>
            <Text style={styles.value}>Placement: {selectedManifest.placementNote}</Text>
            <Text style={styles.value}>
              Providers: plan {selectedManifest.plannedProvider} | fallback {selectedManifest.fallbackProvider} | generated {selectedManifest.generatedProvider}
            </Text>
            <Text style={styles.value}>Concept image: {selectedManifest.conceptImagePath || "none yet"}</Text>
          </>
        ) : null}
      </Card>

      <Card style={styles.statusCard}>
        <Text style={styles.label}>Lobby</Text>
        <TextInput
          value={roomName}
          onChangeText={setRoomName}
          style={styles.input}
          placeholder="Enter room name"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
        />
        <PrimaryButton label={joined ? "Leave Room" : "Join Room"} onPress={onJoinSession} />
        <Text style={styles.value}>Active room: {activeSessionId || "none"}</Text>
        <Text style={styles.value}>You: {sync.getClientId()}</Text>
        <Text style={styles.value}>Members ({roomMembers.length}): {roomMembers.join(", ") || "none"}</Text>
      </Card>

      <View style={styles.controls}>
        <PrimaryButton label="Check AR Provider" onPress={onCheckAR} />
        <PrimaryButton label="Start AR Session" onPress={onStartARSession} />
        <PrimaryButton label="Start + Place Selected Stop" onPress={onStartAndPlaceSelected} />
        <PrimaryButton label="Place and Sync Selected Stop" onPress={onPlaceFirstModel} />
        <PrimaryButton label="Stop AR Session" onPress={onStopARSession} />
      </View>

      <Card style={styles.statusCard}>
        <Text style={styles.label}>AR Provider:</Text>
        <Text style={styles.value}>{arStatus ? arStatus.provider : "unknown"}</Text>
        <Text style={styles.label}>Available:</Text>
        <Text style={styles.value}>{arStatus ? String(arStatus.available) : "unknown"}</Text>
        <Text style={styles.label}>Reason:</Text>
        <Text style={styles.value}>{arStatus?.reason || "n/a"}</Text>
        <Text style={styles.label}>Session Running:</Text>
        <Text style={styles.value}>{arStatus ? String(!!arStatus.sessionRunning) : "unknown"}</Text>
        <Text style={styles.label}>Placed Models:</Text>
        <Text style={styles.value}>{arStatus?.placedModelCount ?? 0}</Text>
        <Text style={styles.label}>Realtime events:</Text>
        <Text style={styles.value}>{eventsText || "none yet"}</Text>
      </Card>

      {payloads.map((payload) => (
        <Card key={payload.stopId} style={styles.card}>
          {(() => {
            const stop = prioritizedStops.find((candidate) => candidate.id === payload.stopId);
            const manifest = stop ? toARSceneManifest(stop) : null;
            return (
              <>
                <Text style={styles.stopLabel}>
                  Stop: {stop?.title || payload.stopId}
                </Text>
                <Text style={styles.value}>Model: {payload.modelUrl}</Text>
                <Text style={styles.value}>Scale: {payload.scale}</Text>
                <Text style={styles.value}>RotationY: {payload.rotationYDeg}</Text>
                <Text style={styles.value}>
                  Priority: {stop?.arPriority ?? "unranked"}
                </Text>
                <Text style={styles.value}>Readiness: {stop ? getARReadiness(stop).label : "not assigned"}</Text>
                <Text style={styles.value}>
                  Pipeline: {stop && typeof stop.arPriority === "number" && buildQueue.loaded ? buildQueue.getStage(stop.id).label : "not tracked"}
                </Text>
                {manifest ? (
                  <>
                    <View style={styles.chips}>
                      <Chip label={manifest.headline} tone="success" />
                      <Chip label={`Provider ${manifest.generatedProvider}`} tone="default" />
                      <Chip label={`Style ${manifest.stylePreset}`} tone="default" />
                    </View>
                    <Text style={styles.value}>Summary: {manifest.summary}</Text>
                    <Text style={styles.value}>Placement: {manifest.placementNote}</Text>
                    <Text style={styles.value}>Layers: {manifest.contentLayers.join(" | ")}</Text>
                    <Text style={styles.value}>Checklist: {manifest.productionChecklist.join(" | ")}</Text>
                    <Text style={styles.value}>Concept: {manifest.conceptImagePath || "none yet"}</Text>
                  </>
                ) : null}
              </>
            );
          })()}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  helper: { color: "#dbeafe", fontSize: 14, lineHeight: 20 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  controls: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    color: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#020617"
  },
  statusCard: { gap: 8 },
  card: { gap: 4 },
  tourList: { gap: 8 },
  tourRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  tourChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0b1220",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tourChipActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#3b82f6"
  },
  tourChipText: { color: "#cbd5e1", fontSize: 12, fontWeight: "700" },
  tourChipTextActive: { color: "#f8fafc" },
  label: { color: "#fbbf24", fontWeight: "800" },
  stopLabel: { color: "#86efac", fontWeight: "700" },
  value: { color: "#f1f5f9", fontWeight: "500" },
  error: { color: "#fca5a5", fontWeight: "600" }
});
