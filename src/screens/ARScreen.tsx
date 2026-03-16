import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { useNarration } from "../hooks/useNarration";
import { toARSceneManifest } from "../services/arManifest";
import { toARScenePayload } from "../services/ar";
import { getNativeARAdapter } from "../services/native-ar";
import { NativeARStatus } from "../services/native-ar/types";
import { createRealtimeSyncFromEnv } from "../services/realtime";
import { getNarrationCoverage, startNarration, stopNarration, type NarrationCoverage } from "../services/narration";

const adapter = getNativeARAdapter();
const sync = createRealtimeSyncFromEnv();

type Props = {
  initialTourId?: string;
  initialStopId?: string;
};

export function ARScreen({ initialTourId, initialStopId }: Props) {
  const [selectedTourId, setSelectedTourId] = useState<string>(initialTourId || tours[0]?.id || "");
  const [selectedStopId, setSelectedStopId] = useState<string>(initialStopId || "");
  const [roomName, setRoomName] = useState("historic-philly-main");
  const [actionStatus, setActionStatus] = useState<string>("idle");
  const [actionError, setActionError] = useState<string | null>(null);
  const [arStatus, setArStatus] = useState<NativeARStatus | null>(null);
  const narration = useNarration();
  const [joined, setJoined] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fullAudioOnly, setFullAudioOnly] = useState(false);
  const [scaleDraft, setScaleDraft] = useState("1");
  const [rotationDraft, setRotationDraft] = useState("180");
  const [verticalOffsetDraft, setVerticalOffsetDraft] = useState("0");

  const selectedTour = useMemo(() => tours.find((tour) => tour.id === selectedTourId) || tours[0], [selectedTourId]);
  const arStops = useMemo(() => {
    const planned = selectedTour.stops.filter((stop) => typeof stop.arPriority === "number");
    return (planned.length ? planned : selectedTour.stops).sort((left, right) => {
      const leftPriority = left.arPriority ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = right.arPriority ?? Number.MAX_SAFE_INTEGER;
      return leftPriority - rightPriority;
    });
  }, [selectedTour]);
  const visibleArStops = useMemo(
    () => (fullAudioOnly ? arStops.filter((stop) => getNarrationCoverage(stop.id) === "full_audio") : arStops),
    [arStops, fullAudioOnly]
  );
  const selectedStop = useMemo(
    () => visibleArStops.find((stop) => stop.id === selectedStopId) || visibleArStops[0],
    [selectedStopId, visibleArStops]
  );
  const manifest = useMemo(() => (selectedStop ? toARSceneManifest(selectedStop) : null), [selectedStop]);
  const payload = useMemo(() => (selectedStop ? toARScenePayload(selectedStop) : null), [selectedStop]);
  const tunedPayload = useMemo(() => {
    if (!payload) {
      return null;
    }

    function parseNumber(value: string, fallback: number) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    return {
      ...payload,
      scale: Math.max(0.01, parseNumber(scaleDraft, payload.scale)),
      rotationYDeg: parseNumber(rotationDraft, payload.rotationYDeg),
      verticalOffsetM: parseNumber(verticalOffsetDraft, payload.verticalOffsetM)
    };
  }, [payload, rotationDraft, scaleDraft, verticalOffsetDraft]);
  const unsupportedSimulator =
    arStatus?.provider === "arkit" &&
    arStatus?.available === false &&
    (arStatus?.reason || "").toLowerCase().includes("unsupported");

  useEffect(() => {
    if (initialTourId && tours.some((tour) => tour.id === initialTourId)) {
      setSelectedTourId(initialTourId);
    }
  }, [initialTourId]);

  useEffect(() => {
    if (!visibleArStops.length) {
      setSelectedStopId("");
      return;
    }
    setSelectedStopId((prev) => {
      if (initialStopId && visibleArStops.some((stop) => stop.id === initialStopId)) {
        return initialStopId;
      }
      return prev && visibleArStops.some((stop) => stop.id === prev) ? prev : visibleArStops[0].id;
    });
  }, [initialStopId, visibleArStops]);

  useEffect(() => {
    if (!payload) {
      return;
    }
    setScaleDraft(String(payload.scale));
    setRotationDraft(String(payload.rotationYDeg));
    setVerticalOffsetDraft(String(payload.verticalOffsetM ?? 0));
  }, [payload?.stopId]);

  async function refreshStatus() {
    try {
      const status = await adapter.getStatus();
      setArStatus(status);
    } catch {
      // no-op
    }
  }

  async function launchStop(shared: boolean) {
    setActionStatus(shared ? "launching_shared" : "launching");
    setActionError(null);
    try {
      if (!payload) {
        throw new Error("No AR stop is selected.");
      }
      const nextPayload = tunedPayload || payload;
      await adapter.startSession();
      await adapter.placeModel({
        id: nextPayload.stopId,
        modelUrl: nextPayload.modelUrl,
        scale: nextPayload.scale,
        rotationYDeg: nextPayload.rotationYDeg,
        verticalOffsetM: nextPayload.verticalOffsetM,
        fallbackType: nextPayload.fallbackType,
        title: nextPayload.title,
        subtitle: nextPayload.subtitle,
        headline: nextPayload.headline,
        summary: nextPayload.summary,
        placementNote: nextPayload.placementNote,
        contentLayers: nextPayload.contentLayers,
        productionChecklist: nextPayload.productionChecklist
      });
      await refreshStatus();

      if (shared) {
        const room = roomName.trim();
        if (!joined && room) {
          sync.joinSession(room);
          setJoined(true);
        }
        if (room) {
          sync.send({
            type: "spawn",
            sessionId: room,
            objectId: nextPayload.stopId,
            modelUrl: nextPayload.modelUrl
          });
        }
      }
      setActionStatus(shared ? "shared_live" : "live");
    } catch (error) {
      setActionStatus("error");
      setActionError((error as Error).message || "Could not launch this AR scene.");
    }
  }

  async function closeAR() {
    setActionStatus("closing");
    setActionError(null);
    try {
      await adapter.stopSession();
      await refreshStatus();
      setActionStatus("idle");
    } catch (error) {
      setActionStatus("error");
      setActionError((error as Error).message || "Could not close AR.");
    }
  }

  async function onPlayNarration() {
    if (!selectedStop) {
      return;
    }
    try {
      await startNarration({
        id: selectedStop.id,
        tourId: selectedTour.id,
        title: selectedStop.title,
        lat: selectedStop.lat,
        lng: selectedStop.lng,
        triggerRadiusM: selectedStop.triggerRadiusM,
        audioUrl: selectedStop.audioUrl,
        arrivalSummary: selectedStop.description.split("|")[0]?.trim() || selectedStop.description,
        handoffDeepLink: `phillyartours://tour/${selectedTour.id}/stop/${selectedStop.id}/arrive`
      }, "walk");
    } catch (error) {
      Alert.alert("Narration unavailable", (error as Error).message || "Could not start narration.");
    }
  }

  async function onStopNarration() {
    await stopNarration();
  }

  function resetTuningDrafts() {
    if (!payload) {
      return;
    }
    setScaleDraft(String(payload.scale));
    setRotationDraft(String(payload.rotationYDeg));
    setVerticalOffsetDraft(String(payload.verticalOffsetM ?? 0));
  }

  async function copyTuningSnapshot() {
    if (!selectedStop || !tunedPayload) {
      return;
    }
    const snapshot = `${selectedStop.title} [${selectedStop.id}]: scale ${tunedPayload.scale}, rotationYDeg ${tunedPayload.rotationYDeg}, verticalOffsetM ${tunedPayload.verticalOffsetM}`;
    await Clipboard.setStringAsync(snapshot);
    Alert.alert("Tuning copied", snapshot);
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
        <Text style={styles.heroEyebrow}>AR moments</Text>
        <Text style={styles.heroTitle}>A small-screen AR experience should feel precise, not crowded.</Text>
        <Text style={styles.heroCopy}>
          Launch one clean spatial object or story moment at a time. Keep the user’s eye focused on the site itself.
        </Text>
      </View>

      <Card style={styles.panel}>
        <Text style={styles.label}>Choose tour</Text>
        <View style={styles.choiceWrap}>
          {tours.map((tour) => (
            <PrimaryChoice
              key={tour.id}
              active={selectedTourId === tour.id}
              label={tour.title}
              onPress={() => setSelectedTourId(tour.id)}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.panel}>
        <View style={styles.selectionHeader}>
          <Text style={styles.label}>Choose AR stop</Text>
          <PrimaryButton label={fullAudioOnly ? "Showing Full Audio" : "Showing All Stops"} onPress={() => setFullAudioOnly((value) => !value)} />
        </View>
        <View style={styles.choiceWrap}>
          {visibleArStops.map((stop, index) => (
            <PrimaryChoice
              key={stop.id}
              active={selectedStopId === stop.id}
              label={`${typeof stop.arPriority === "number" ? `P${stop.arPriority}` : `Stop ${index + 1}`} ${stop.title} · ${getCoverageMeta(getNarrationCoverage(stop.id)).label}`}
              onPress={() => setSelectedStopId(stop.id)}
            />
          ))}
        </View>
        {fullAudioOnly && visibleArStops.length === 0 ? <Text style={styles.meta}>No full-audio AR stops in this pack yet.</Text> : null}
      </Card>

      {selectedStop && manifest ? (
        <Card style={styles.featureCard}>
          <Text style={styles.featureEyebrow}>{selectedTour.title}</Text>
          <Text style={styles.featureTitle}>{selectedStop.title}</Text>
          <Text style={styles.featureBody}>{manifest.summary}</Text>
          <View style={styles.chips}>
            <Chip label={manifest.arType.replaceAll("_", " ")} tone="warn" />
            <Chip label={`${selectedStop.triggerRadiusM}m reveal radius`} tone="default" />
            <Chip
              label={narration.stopId === selectedStop.id && narration.status === "playing" ? "Audio live" : "Walk narration"}
              tone="warn"
            />
            <Chip {...getCoverageMeta(getNarrationCoverage(selectedStop.id))} />
          </View>
          <Text style={styles.specLabel}>Placement</Text>
          <Text style={styles.specCopy}>{manifest.placementNote}</Text>
          <Text style={styles.specLabel}>Scene layers</Text>
          <Text style={styles.specCopy}>{manifest.contentLayers.slice(0, 3).join(" | ")}</Text>
          <View style={styles.actionStack}>
            <PrimaryButton
              label={narration.stopId === selectedStop.id && narration.status === "playing" ? "Replay Stop Audio" : "Play Stop Audio"}
              onPress={onPlayNarration}
            />
            {narration.stopId === selectedStop.id && (narration.status === "playing" || narration.status === "loading") ? (
              <PrimaryButton label="Stop Audio" onPress={onStopNarration} />
            ) : null}
          </View>
        </Card>
      ) : null}

      <Card style={styles.panel}>
        <Text style={styles.label}>Launch</Text>
        <View style={styles.actionStack}>
          <PrimaryButton label="Launch AR Moment" onPress={() => launchStop(false)} />
          <PrimaryButton label="Close AR" onPress={closeAR} />
        </View>
        <View style={styles.chips}>
          <Chip label={`State ${actionStatus.replaceAll("_", " ")}`} tone={actionStatus === "error" ? "danger" : actionStatus.includes("live") ? "success" : "default"} />
          <Chip label={`Provider ${arStatus?.provider || "unknown"}`} tone="default" />
        </View>
        {unsupportedSimulator ? (
          <Text style={styles.metaCallout}>
            This simulator cannot run ARKit. Use an ARKit-capable iPhone or iPad to validate the real 3D scene.
          </Text>
        ) : null}
        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
      </Card>

      <Card style={styles.panel}>
        <Pressable onPress={() => setShowAdvanced((value) => !value)} style={styles.advancedToggle}>
          <Text style={styles.label}>Advanced</Text>
          <Text style={styles.advancedToggleText}>{showAdvanced ? "Hide" : "Show"}</Text>
        </Pressable>
        {showAdvanced ? (
          <View style={styles.advancedStack}>
            <Text style={styles.specLabel}>Scene tuning</Text>
            <Text style={styles.specCopy}>
              Base: scale {payload?.scale ?? 1} | rotation {payload?.rotationYDeg ?? 180}deg | vertical offset{" "}
              {payload?.verticalOffsetM ?? 0}m
            </Text>
            <Text style={styles.specCopy}>
              Launching with: scale {tunedPayload?.scale ?? 1} | rotation {tunedPayload?.rotationYDeg ?? 180}deg |
              vertical offset {tunedPayload?.verticalOffsetM ?? 0}m
            </Text>
            <View style={styles.tuningGrid}>
              <View style={styles.tuningField}>
                <Text style={styles.tuningLabel}>Scale</Text>
                <TextInput
                  value={scaleDraft}
                  onChangeText={setScaleDraft}
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor="#8e7d99"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.tuningField}>
                <Text style={styles.tuningLabel}>Rotation Y</Text>
                <TextInput
                  value={rotationDraft}
                  onChangeText={setRotationDraft}
                  style={styles.input}
                  placeholder="180"
                  placeholderTextColor="#8e7d99"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.tuningField}>
                <Text style={styles.tuningLabel}>Vertical Offset</Text>
                <TextInput
                  value={verticalOffsetDraft}
                  onChangeText={setVerticalOffsetDraft}
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#8e7d99"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.actionStack}>
              <PrimaryButton label="Reset Tuning" onPress={resetTuningDrafts} />
              <PrimaryButton label="Copy Tuning Snapshot" onPress={copyTuningSnapshot} />
            </View>
            <Text style={styles.specLabel}>Shared room</Text>
            <TextInput
              value={roomName}
              onChangeText={setRoomName}
              style={styles.input}
              placeholder="historic-philly-main"
              placeholderTextColor="#8e7d99"
              autoCapitalize="none"
            />
            <PrimaryButton label="Launch Shared AR Moment" onPress={() => launchStop(true)} />
            <Text style={styles.meta}>Only use shared mode if you’re co-viewing the same stop.</Text>
          </View>
        ) : (
          <Text style={styles.meta}>Shared mode and tuning live here when you need them.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

type PrimaryChoiceProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

function PrimaryChoice({ active, label, onPress }: PrimaryChoiceProps) {
  return (
    <Pressable onPress={onPress} style={[styles.choiceChip, active && styles.choiceChipActive]}>
      <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{label}</Text>
    </Pressable>
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
  label: {
    color: "#fff0e4",
    fontSize: 18,
    fontWeight: "800"
  },
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  choiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  choiceChip: {
    backgroundColor: "#1f1233",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden"
  },
  choiceChipActive: {
    backgroundColor: "#ff8ca8",
    borderColor: "#ff8ca8"
  },
  choiceChipText: {
    color: "#cab6d2",
    fontWeight: "700"
  },
  choiceChipTextActive: {
    color: "#2b1021"
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
    lineHeight: 23
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  specLabel: {
    color: "#ffcfb5",
    fontWeight: "700"
  },
  specCopy: {
    color: "#d8c7df",
    lineHeight: 21
  },
  actionStack: {
    gap: 10
  },
  meta: {
    color: "#b69fbe",
    lineHeight: 20
  },
  metaCallout: {
    color: "#f0dde7",
    lineHeight: 21
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    color: "#fff3ea",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#1b102d"
  },
  error: {
    color: "#ffadb7",
    fontWeight: "600"
  },
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  advancedToggleText: {
    color: "#ffbc8a",
    fontWeight: "700"
  },
  advancedStack: {
    gap: 10
  },
  tuningGrid: {
    gap: 12
  },
  tuningField: {
    gap: 6
  },
  tuningLabel: {
    color: "#d4c8d8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase"
  }
});
