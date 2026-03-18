import React from "react";
import { Alert, AppState, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { useNarration } from "../hooks/useNarration";
import { toARScenePayload, type ARScenePayload } from "../services/ar";
import { toARSceneManifest } from "../services/arManifest";
import { getNativeARAdapter } from "../services/native-ar";
import { type NativeARStatus } from "../services/native-ar/types";
import { getNarrationCoverage, startNarration, stopNarration } from "../services/narration";

const adapter = getNativeARAdapter();

type Props = {
  initialTourId?: string;
  initialStopId?: string;
};

type ActionStatus = "idle" | "preparing" | "ready" | "launching" | "live" | "closing" | "error";

function clonePayload(payload: ARScenePayload): ARScenePayload {
  return {
    ...payload,
    contentLayers: [...payload.contentLayers],
    productionChecklist: [...payload.productionChecklist]
  };
}

function isBuildableAssetStatus(status: string) {
  return status === "in_production" || status === "ready" || status === "approved";
}

export function TouristARScreen({ initialTourId, initialStopId }: Props) {
  const narration = useNarration();
  const [selectedTourId, setSelectedTourId] = React.useState<string>(initialTourId || tours[0]?.id || "");
  const [selectedStopId, setSelectedStopId] = React.useState<string>(initialStopId || "");
  const [actionStatus, setActionStatus] = React.useState<ActionStatus>("idle");
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [arStatus, setArStatus] = React.useState<NativeARStatus | null>(null);
  const [preparedPayload, setPreparedPayload] = React.useState<ARScenePayload | null>(null);
  const [livePayload, setLivePayload] = React.useState<ARScenePayload | null>(null);

  const selectedTour = React.useMemo(() => tours.find((tour) => tour.id === selectedTourId) || tours[0], [selectedTourId]);
  const selectedTourIndex = React.useMemo(
    () => Math.max(0, tours.findIndex((tour) => tour.id === selectedTour.id)),
    [selectedTour.id]
  );
  const availableStops = React.useMemo(() => {
    return selectedTour.stops
      .filter((stop) => typeof stop.arPriority === "number" && isBuildableAssetStatus(toARSceneManifest(stop).assetStatus))
      .sort((left, right) => {
        const leftPriority = left.arPriority ?? Number.MAX_SAFE_INTEGER;
        const rightPriority = right.arPriority ?? Number.MAX_SAFE_INTEGER;
        return leftPriority - rightPriority;
      });
  }, [selectedTour]);
  const selectedStop = React.useMemo(
    () => availableStops.find((stop) => stop.id === selectedStopId) || availableStops[0] || null,
    [availableStops, selectedStopId]
  );
  const selectedStopIndex = React.useMemo(
    () => Math.max(0, availableStops.findIndex((stop) => stop.id === selectedStop?.id)),
    [availableStops, selectedStop?.id]
  );
  const manifest = React.useMemo(() => (selectedStop ? toARSceneManifest(selectedStop) : null), [selectedStop]);
  const payload = React.useMemo(() => (selectedStop ? toARScenePayload(selectedStop) : null), [selectedStop]);

  const unsupportedSimulator =
    arStatus?.provider === "arkit" &&
    arStatus?.available === false &&
    (arStatus?.reason || "").toLowerCase().includes("unsupported");
  const isBusy = actionStatus === "preparing" || actionStatus === "launching" || actionStatus === "closing";
  const isLive = actionStatus === "live";
  const isReadyToLaunch = actionStatus === "ready";
  const hasRunningSession = isLive || Boolean(arStatus?.sessionRunning) || Boolean(livePayload);

  React.useEffect(() => {
    if (initialTourId && tours.some((tour) => tour.id === initialTourId)) {
      setSelectedTourId(initialTourId);
    }
  }, [initialTourId]);

  React.useEffect(() => {
    if (!availableStops.length) {
      setSelectedStopId("");
      return;
    }
    setSelectedStopId((previous) => {
      if (initialStopId && availableStops.some((stop) => stop.id === initialStopId)) {
        return initialStopId;
      }
      return previous && availableStops.some((stop) => stop.id === previous) ? previous : availableStops[0].id;
    });
  }, [availableStops, initialStopId]);

  const refreshStatus = React.useCallback(async () => {
    try {
      const status = await adapter.getStatus();
      setArStatus(status);
      if (!status.sessionRunning && livePayload) {
        setLivePayload(null);
        setPreparedPayload(null);
        setActionStatus("idle");
        setActionError(null);
      }
      return status;
    } catch {
      return null;
    }
  }, [livePayload]);

  React.useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshStatus]);

  React.useEffect(() => {
    if (!hasRunningSession && !isBusy) {
      return;
    }

    const timer = setInterval(() => {
      void refreshStatus();
    }, 1500);

    return () => {
      clearInterval(timer);
    };
  }, [hasRunningSession, isBusy, refreshStatus]);

  async function prepareLaunch() {
    if (isBusy) {
      return;
    }

    setActionStatus("preparing");
    setActionError(null);

    try {
      if (!payload) {
        throw new Error("Choose a stop before starting AR.");
      }

      const status = await refreshStatus();
      if (!status) {
        throw new Error("Could not confirm AR readiness on this device.");
      }
      if (!status.available) {
        throw new Error(status.reason || "AR is not available on this device.");
      }
      if (status.sessionRunning) {
        throw new Error("Close the current AR scene before starting another one.");
      }

      setPreparedPayload(clonePayload(payload));
      setActionStatus("ready");
    } catch (error) {
      setPreparedPayload(null);
      setActionStatus("error");
      setActionError((error as Error).message || "Could not get AR ready.");
    }
  }

  function cancelPreparedLaunch() {
    if (isBusy) {
      return;
    }
    setPreparedPayload(null);
    setActionStatus("idle");
    setActionError(null);
  }

  async function launchPreparedStop() {
    if (isBusy) {
      return;
    }

    setActionStatus("launching");
    setActionError(null);

    try {
      if (!preparedPayload) {
        throw new Error("Start AR first, then enter the scene.");
      }

      const nextPayload = clonePayload(preparedPayload);
      await adapter.startSession();
      await adapter.placeModel({
        id: nextPayload.stopId,
        modelUrl: nextPayload.modelUrl,
        scale: nextPayload.scale,
        rotationYDeg: nextPayload.rotationYDeg,
        verticalOffsetM: nextPayload.verticalOffsetM,
        anchorStyle: nextPayload.anchorStyle,
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
      setLivePayload(nextPayload);
      setPreparedPayload(null);
      setActionStatus("live");
    } catch (error) {
      await refreshStatus();
      setActionStatus("error");
      setActionError((error as Error).message || "Could not open AR.");
    }
  }

  async function closeAR() {
    if (isBusy || !hasRunningSession) {
      return;
    }

    setActionStatus("closing");
    setActionError(null);

    try {
      await adapter.stopSession();
      await refreshStatus();
      setPreparedPayload(null);
      setLivePayload(null);
      setActionStatus("idle");
    } catch (error) {
      await refreshStatus();
      setActionStatus("error");
      setActionError((error as Error).message || "Could not close AR.");
    }
  }

  async function onPlayNarration() {
    if (!selectedStop) {
      return;
    }
    try {
      await startNarration(
        {
          id: selectedStop.id,
          tourId: selectedTour.id,
          title: selectedStop.title,
          lat: selectedStop.lat,
          lng: selectedStop.lng,
          triggerRadiusM: selectedStop.triggerRadiusM,
          audioUrl: selectedStop.audioUrl,
          arrivalSummary: selectedStop.description.split("|")[0]?.trim() || selectedStop.description,
          handoffDeepLink: `phillyartours://tour/${selectedTour.id}/stop/${selectedStop.id}/arrive`
        },
        "walk"
      );
    } catch (error) {
      Alert.alert("Narration unavailable", (error as Error).message || "Could not start narration.");
    }
  }

  async function onStopNarration() {
    await stopNarration();
  }

  function selectRelativeTour(direction: -1 | 1) {
    const nextIndex = selectedTourIndex + direction;
    if (nextIndex < 0 || nextIndex >= tours.length) {
      return;
    }

    setSelectedTourId(tours[nextIndex].id);
  }

  function selectRelativeStop(direction: -1 | 1) {
    const nextIndex = selectedStopIndex + direction;
    if (nextIndex < 0 || nextIndex >= availableStops.length) {
      return;
    }

    setSelectedStopId(availableStops[nextIndex].id);
  }

  const hasNarrationAction = Boolean(selectedStop);
  const storyActionLabel =
    narration.stopId === selectedStop?.id && (narration.status === "playing" || narration.status === "loading") ? "Stop Audio" : "Hear the Story";
  const hasPreviousTour = selectedTourIndex > 0;
  const hasNextTour = selectedTourIndex < tours.length - 1;
  const hasPreviousStop = selectedStopIndex > 0;
  const hasNextStop = selectedStopIndex >= 0 && selectedStopIndex < availableStops.length - 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>AR moments</Text>
        <Text style={styles.heroTitle}>See one Philadelphia story appear in your space.</Text>
        <Text style={styles.heroCopy}>
          Choose a stop, scan the room slowly, and let one carefully placed AR moment come forward.
        </Text>
        <Text style={styles.meta}>For the best result, give the iPad a textured floor or wall and a little room to step back.</Text>
      </View>

      <Card style={styles.panel}>
        <Text style={styles.label}>Pick a story</Text>
        <Text style={styles.meta}>Choose a tour first, then pick one place to bring into the room.</Text>
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Tour</Text>
          <View style={styles.selectionCard}>
            <Text style={styles.selectionEyebrow}>Tour {selectedTourIndex + 1} of {tours.length}</Text>
            <Text style={styles.selectionTitle}>{selectedTour.title}</Text>
            <View style={styles.selectorRow}>
              <StepButton label="Previous Tour" onPress={() => selectRelativeTour(-1)} disabled={!hasPreviousTour} />
              <StepButton label="Next Tour" onPress={() => selectRelativeTour(1)} disabled={!hasNextTour} />
            </View>
          </View>
        </View>
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Stop</Text>
          {availableStops.length ? (
            <View style={styles.selectionCard}>
              <Text style={styles.selectionEyebrow}>Story {selectedStopIndex + 1} of {availableStops.length}</Text>
              <Text style={styles.selectionTitle}>{selectedStop?.title || "Choose a stop"}</Text>
              <View style={styles.selectorRow}>
                <StepButton label="Previous Stop" onPress={() => selectRelativeStop(-1)} disabled={!hasPreviousStop} />
                <StepButton label="Next Stop" onPress={() => selectRelativeStop(1)} disabled={!hasNextStop} />
              </View>
            </View>
          ) : (
            <Text style={styles.meta}>AR moments for this tour are still being prepared. Try another tour for now.</Text>
          )}
        </View>
      </Card>

      {selectedStop && manifest ? (
        <Card style={styles.featureCard}>
          <Text style={styles.featureEyebrow}>{selectedTour.title}</Text>
          <Text style={styles.featureTitle}>{selectedStop.title}</Text>
          <Text style={styles.featureBody}>{manifest.summary}</Text>
          <View style={styles.storyMetaRow}>
            <Text style={styles.storyMetaPill}>{manifest.arType.replaceAll("_", " ")}</Text>
            <Text style={styles.storyMetaPill}>{selectedStop.triggerRadiusM}m away</Text>
          </View>
          <Text style={styles.specLabel}>Before you place it</Text>
          <Text style={styles.specCopy}>{manifest.placementNote}</Text>
          <Text style={styles.meta}>Take a slow step back after placement so the full scene has room to settle.</Text>
          {hasNarrationAction ? (
            <PrimaryButton
              label={storyActionLabel}
              onPress={
                narration.stopId === selectedStop.id && (narration.status === "playing" || narration.status === "loading")
                  ? onStopNarration
                  : onPlayNarration
              }
            />
          ) : null}
        </Card>
      ) : null}

      <Card style={styles.panel}>
        <Text style={styles.label}>Place in AR</Text>
        {isReadyToLaunch ? (
          <View style={styles.preflightPanel}>
            <Text style={styles.preflightTitle}>Ready to place</Text>
            <Text style={styles.meta}>{preparedPayload?.title || selectedStop?.title || "Selected stop"}</Text>
            <Text style={styles.preflightCopy}>
              Move the iPad slowly, frame a textured floor or wall, and give the model enough space before you enter AR.
            </Text>
            <View style={styles.preflightChecklist}>
              <Text style={styles.preflightItem}>1. Point at a surface with visible texture or edges.</Text>
              <Text style={styles.preflightItem}>2. Sweep gently for a second or two so ARKit can settle.</Text>
              <Text style={styles.preflightItem}>3. Enter only when you have enough room for the full building volume.</Text>
            </View>
            <View style={styles.actionStack}>
              <PrimaryButton label="Place in My Space" onPress={launchPreparedStop} disabled={isBusy} />
              <PrimaryButton label="Back" onPress={cancelPreparedLaunch} disabled={isBusy} />
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.meta}>
              {isLive
                ? "This AR scene is already open. Close it before starting another one."
                : "Get the scene ready, scan the room slowly, and place it once the space feels settled."}
            </Text>
            <View style={styles.actionStack}>
              <PrimaryButton label={actionStatus === "preparing" ? "Getting Ready..." : "Get Ready"} onPress={prepareLaunch} disabled={!payload || isBusy || hasRunningSession} />
              {hasRunningSession ? <PrimaryButton label={actionStatus === "closing" ? "Closing..." : "Close Scene"} onPress={closeAR} disabled={isBusy} /> : null}
            </View>
          </>
        )}
        {unsupportedSimulator ? (
          <Text style={styles.metaCallout}>This simulator cannot run ARKit. Use an ARKit-capable iPhone or iPad to see the real scene.</Text>
        ) : null}
        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
      </Card>

      {isLive ? (
        <Card style={styles.livePanel}>
          <Text style={styles.liveEyebrow}>Scene open</Text>
          <Text style={styles.liveTitle}>{livePayload?.title || selectedStop?.title || "AR moment active"}</Text>
          <Text style={styles.liveCopy}>
            Walk slowly around the scene, keep the floor or wall in frame, and give the model a moment to settle into the room.
          </Text>
          <Text style={styles.liveItem}>If it slips, close the scene and try again after a slower scan.</Text>
          <PrimaryButton label="Close Scene" onPress={closeAR} disabled={isBusy} />
        </Card>
      ) : null}
    </ScrollView>
  );
}

type StepButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function StepButton({ label, onPress, disabled }: StepButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.stepButton, disabled && styles.stepButtonDisabled]}>
      <Text style={[styles.stepButtonText, disabled && styles.stepButtonTextDisabled]}>{label}</Text>
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
  sectionBlock: {
    gap: 10
  },
  label: {
    color: "#fff0e4",
    fontSize: 18,
    fontWeight: "800"
  },
  sectionLabel: {
    color: "#ffcfb5",
    fontWeight: "700"
  },
  selectionCard: {
    gap: 12,
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#1a1030",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  selectionEyebrow: {
    color: "#ffbc8a",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9
  },
  selectionTitle: {
    color: "#fff5ed",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800"
  },
  selectorRow: {
    flexDirection: "row",
    gap: 10
  },
  stepButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#25153a",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  stepButtonDisabled: {
    opacity: 0.35
  },
  stepButtonText: {
    color: "#f0dde7",
    fontWeight: "700"
  },
  stepButtonTextDisabled: {
    color: "#8f819e"
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
  storyMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  storyMetaPill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#f2d8c9",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden"
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
    color: "#bdaec7",
    lineHeight: 20
  },
  metaCallout: {
    color: "#ffd8b8",
    lineHeight: 20
  },
  preflightPanel: {
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#1c112f"
  },
  preflightTitle: {
    color: "#fff6ee",
    fontWeight: "800",
    fontSize: 22
  },
  preflightCopy: {
    color: "#f0dde7",
    lineHeight: 21
  },
  preflightChecklist: {
    gap: 6
  },
  preflightItem: {
    color: "#d9cce2",
    lineHeight: 20
  },
  livePanel: {
    backgroundColor: "#2a1731",
    borderColor: "rgba(143, 215, 195, 0.2)",
    gap: 12
  },
  liveEyebrow: {
    color: "#8fd7c3",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9
  },
  liveTitle: {
    color: "#fff8f3",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800"
  },
  liveCopy: {
    color: "#f0dde7",
    lineHeight: 21
  },
  liveItem: {
    color: "#cfeee5",
    lineHeight: 20
  },
  error: {
    color: "#ffb2c8",
    lineHeight: 20,
    fontWeight: "700"
  }
});
