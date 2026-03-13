import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { toARSceneManifest } from "../services/arManifest";
import { toARScenePayload } from "../services/ar";
import { getNativeARAdapter } from "../services/native-ar";
import { NativeARStatus } from "../services/native-ar/types";
import { createRealtimeSyncFromEnv } from "../services/realtime";

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
  const [joined, setJoined] = useState(false);

  const selectedTour = useMemo(() => tours.find((tour) => tour.id === selectedTourId) || tours[0], [selectedTourId]);
  const arStops = useMemo(() => {
    const planned = selectedTour.stops.filter((stop) => typeof stop.arPriority === "number");
    return (planned.length ? planned : selectedTour.stops).sort((left, right) => {
      const leftPriority = left.arPriority ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = right.arPriority ?? Number.MAX_SAFE_INTEGER;
      return leftPriority - rightPriority;
    });
  }, [selectedTour]);
  const selectedStop = useMemo(
    () => arStops.find((stop) => stop.id === selectedStopId) || arStops[0],
    [arStops, selectedStopId]
  );
  const manifest = useMemo(() => (selectedStop ? toARSceneManifest(selectedStop) : null), [selectedStop]);
  const payload = useMemo(() => (selectedStop ? toARScenePayload(selectedStop) : null), [selectedStop]);
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
    if (!arStops.length) {
      setSelectedStopId("");
      return;
    }
    setSelectedStopId((prev) => {
      if (initialStopId && arStops.some((stop) => stop.id === initialStopId)) {
        return initialStopId;
      }
      return prev && arStops.some((stop) => stop.id === prev) ? prev : arStops[0].id;
    });
  }, [arStops, initialStopId]);

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
      await adapter.startSession();
      await adapter.placeModel({
        id: payload.stopId,
        modelUrl: payload.modelUrl,
        scale: payload.scale,
        rotationYDeg: payload.rotationYDeg,
        verticalOffsetM: payload.verticalOffsetM,
        fallbackType: payload.fallbackType,
        title: payload.title,
        subtitle: payload.subtitle,
        headline: payload.headline,
        summary: payload.summary,
        placementNote: payload.placementNote,
        conceptImagePath: payload.conceptImagePath,
        plannedProvider: payload.plannedProvider,
        generatedProvider: payload.generatedProvider,
        contentLayers: payload.contentLayers,
        productionChecklist: payload.productionChecklist
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
            objectId: payload.stopId,
            modelUrl: payload.modelUrl
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
        <Text style={styles.label}>Choose AR stop</Text>
        <View style={styles.choiceWrap}>
          {arStops.map((stop, index) => (
            <PrimaryChoice
              key={stop.id}
              active={selectedStopId === stop.id}
              label={`${typeof stop.arPriority === "number" ? `P${stop.arPriority}` : `Stop ${index + 1}`} ${stop.title}`}
              onPress={() => setSelectedStopId(stop.id)}
            />
          ))}
        </View>
      </Card>

      {selectedStop && manifest ? (
        <Card style={styles.featureCard}>
          <Text style={styles.featureEyebrow}>{selectedTour.title}</Text>
          <Text style={styles.featureTitle}>{selectedStop.title}</Text>
          <Text style={styles.featureBody}>{manifest.summary}</Text>
          <View style={styles.chips}>
            <Chip label={manifest.arType.replaceAll("_", " ")} tone="warn" />
            <Chip label={`${selectedStop.triggerRadiusM}m reveal radius`} tone="default" />
          </View>
          <Text style={styles.specLabel}>Placement</Text>
          <Text style={styles.specCopy}>{manifest.placementNote}</Text>
          <Text style={styles.specLabel}>Tuning</Text>
          <Text style={styles.specCopy}>
            Scale {payload?.scale ?? 1} | Rotation {payload?.rotationYDeg ?? 180}deg | Vertical offset{" "}
            {payload?.verticalOffsetM ?? 0}m
          </Text>
          <Text style={styles.specLabel}>Scene layers</Text>
          <Text style={styles.specCopy}>{manifest.contentLayers.slice(0, 3).join(" | ")}</Text>
        </Card>
      ) : null}

      <Card style={styles.panel}>
        <Text style={styles.label}>Launch</Text>
        <View style={styles.actionStack}>
          <PrimaryButton label="Launch AR Moment" onPress={() => launchStop(false)} />
          <PrimaryButton label="Launch Shared AR Moment" onPress={() => launchStop(true)} />
          <PrimaryButton label="Close AR" onPress={closeAR} />
        </View>
        <Text style={styles.meta}>State: {actionStatus}</Text>
        <Text style={styles.meta}>Provider: {arStatus?.provider || "unknown"}</Text>
        {unsupportedSimulator ? (
          <Text style={styles.meta}>
            This simulator cannot run ARKit. Use an ARKit-capable iPhone or iPad to validate the real 3D scene.
          </Text>
        ) : null}
        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.label}>Shared room</Text>
        <TextInput
          value={roomName}
          onChangeText={setRoomName}
          style={styles.input}
          placeholder="historic-philly-main"
          placeholderTextColor="#8e7d99"
          autoCapitalize="none"
        />
        <Text style={styles.meta}>Only use shared mode if you’re co-viewing the same stop.</Text>
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
    <Text onPress={onPress} style={[styles.choiceChip, active && styles.choiceChipActive, active && styles.choiceChipTextActive]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 16,
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
    backgroundColor: "#120a22"
  },
  label: {
    color: "#fff0e4",
    fontSize: 18,
    fontWeight: "800"
  },
  choiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  choiceChip: {
    backgroundColor: "#1f1233",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    color: "#cab6d2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontWeight: "700",
    overflow: "hidden"
  },
  choiceChipActive: {
    backgroundColor: "#ff8ca8",
    borderColor: "#ff8ca8"
  },
  choiceChipTextActive: {
    color: "#2b1021"
  },
  featureCard: {
    backgroundColor: "#2b1530",
    borderColor: "rgba(255, 176, 132, 0.2)",
    gap: 10
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
    gap: 8
  },
  meta: {
    color: "#b69fbe"
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
  }
});
