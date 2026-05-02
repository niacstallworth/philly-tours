import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import {
  connectCompanion,
  connectMockCompanion,
  disconnectCompanion,
  handleWearableCommand,
  refreshCompanionStatus
} from "../services/companion";
import { getArExperienceForStop, getArStopsForTour, launchNativeArForStop } from "../services/arExperience";
import { getCurrentTourContext, setCurrentTourSelection, subscribeToTourSelection } from "../services/tourControl";
import type { WearableStatus } from "../services/wearables";
import { getNativeArStatus, stopNativeArSession, type NativeArStatus } from "../services/nativeAr";
import { getNarrationCoverage } from "../services/narration";
import { useCompanionSession } from "../hooks/useCompanionSession";
import { type AppPalette, headingFontFamily, useTypeScale, useThemeColors } from "../theme/appTheme";

type Props = {
  audioHistoryOnlyUnlocked?: boolean;
  fullAppUnlocked?: boolean;
};

export function CompanionSetupScreen({ audioHistoryOnlyUnlocked = false, fullAppUnlocked = false }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const { status, lastCommandResult } = useCompanionSession();
  const [busy, setBusy] = React.useState<"pair" | "pair-mock" | "disconnect" | "refresh" | "command" | "launch-ar" | "stop-ar" | null>(null);
  const [message, setMessage] = React.useState<string | null>(status.lastError);
  const [nativeArStatus, setNativeArStatus] = React.useState<NativeArStatus | null>(null);
  const [tourContext, setTourContext] = React.useState(() => getCurrentTourContext());
  const [selectedTourId, setSelectedTourId] = React.useState<string>(tourContext?.tour.id || tours[0]?.id || "");
  const [selectedArStopId, setSelectedArStopId] = React.useState<string>(tourContext?.stop.id || "");
  const mockPairingAvailable = status.integrationMode === "native" && status.platformLabel === "iOS";
  const isConnected = status.connectionState === "connected";
  const isMockConnected = isConnected && !!status.pairedDevice?.isMock;
  const isNativeRealFlow = status.integrationMode === "native" && !isMockConnected;
  const canReconnect =
    status.supported &&
    status.pairedDevice != null &&
    status.connectionState !== "connected" &&
    status.connectionState !== "pairing";
  const connectLabel = getConnectLabel(status, canReconnect);
  const selectedTour = React.useMemo(() => tours.find((tour) => tour.id === selectedTourId) || tours[0] || null, [selectedTourId]);
  const arStops = React.useMemo(() => (selectedTour ? getArStopsForTour(selectedTour) : []), [selectedTour]);
  const selectedArStop = React.useMemo(
    () => arStops.find((stop) => stop.id === selectedArStopId) || arStops[0] || null,
    [arStops, selectedArStopId]
  );
  const selectedArExperience = React.useMemo(
    () => (selectedArStop ? getArExperienceForStop(selectedArStop) : null),
    [selectedArStop]
  );
  const selectedTourAudioCount = React.useMemo(
    () => (selectedTour ? selectedTour.stops.filter((stop) => getNarrationCoverage(stop.id) === "full_audio").length : 0),
    [selectedTour]
  );
  const hasPremiumAudio = audioHistoryOnlyUnlocked || fullAppUnlocked;
  const currentStop = tourContext?.tour && selectedTour && tourContext.tour.id === selectedTour.id ? tourContext.stop : null;
  const nextStop = tourContext?.tour && selectedTour && tourContext.tour.id === selectedTour.id ? tourContext.nextStop : null;
  const currentStopExperience = React.useMemo(
    () => (currentStop ? getArExperienceForStop(currentStop) : null),
    [currentStop]
  );
  const routeProgressLabel =
    tourContext?.tour && selectedTour && tourContext.tour.id === selectedTour.id
      ? `Stop ${tourContext.stopIndex + 1} of ${tourContext.tour.stops.length}`
      : selectedTour
        ? `Ready to start at ${selectedTour.stops[0]?.title || "first stop"}`
        : "No route selected";

  const refreshNativeStatus = React.useCallback(async () => {
    if (Platform.OS !== "ios") {
      return;
    }

    try {
      const nextStatus = await getNativeArStatus();
      setNativeArStatus(nextStatus);
    } catch {
      setNativeArStatus({
        available: false,
        reason: "Native AR status could not be loaded on this device.",
        sessionRunning: false,
        placedModelCount: 0
      });
    }
  }, []);

  React.useEffect(() => {
    void refreshCompanionStatus();
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribeToTourSelection((_, context) => {
      setTourContext(context);
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    void refreshNativeStatus();
  }, [refreshNativeStatus]);

  React.useEffect(() => {
    if (tourContext?.tour?.id) {
      setSelectedTourId(tourContext.tour.id);
    }
  }, [tourContext?.tour?.id]);

  React.useEffect(() => {
    if (!selectedTour) {
      return;
    }

    const currentArStopId =
      tourContext?.tour?.id === selectedTour.id && tourContext.stop && arStops.some((stop) => stop.id === tourContext.stop.id)
        ? tourContext.stop.id
        : null;

    if (currentArStopId && currentArStopId !== selectedArStopId) {
      setSelectedArStopId(currentArStopId);
      return;
    }

    if (!arStops.some((stop) => stop.id === selectedArStopId)) {
      setSelectedArStopId(arStops[0]?.id || "");
    }
  }, [arStops, selectedArStopId, selectedTour, tourContext]);

  React.useEffect(() => {
    setMessage(status.lastError ?? status.statusMessage ?? null);
  }, [status.lastError, status.statusMessage]);

  async function onPair() {
    setBusy("pair");
    try {
      await connectCompanion();
      setMessage("Companion connected.");
    } catch (error) {
      setMessage((error as Error).message || "Unable to connect audio companion.");
    } finally {
      setBusy(null);
    }
  }

  async function onPairMock() {
    setBusy("pair-mock");
    try {
      await connectMockCompanion();
      setMessage("Mock Ray-Ban Meta connected.");
    } catch (error) {
      setMessage((error as Error).message || "Unable to pair mock Meta glasses.");
    } finally {
      setBusy(null);
    }
  }

  async function onDisconnect() {
    setBusy("disconnect");
    try {
      await disconnectCompanion();
      setMessage("Companion disconnected.");
    } finally {
      setBusy(null);
    }
  }

  async function onRefresh() {
    setBusy("refresh");
    try {
      const nextStatus = await refreshCompanionStatus();
      setMessage(nextStatus.statusMessage ?? nextStatus.lastError ?? "Companion status refreshed.");
    } finally {
      setBusy(null);
    }
  }

  async function runCommand(type: "get_stop_context" | "repeat_narration" | "pause_narration" | "next_stop" | "previous_stop") {
    setBusy("command");
    try {
      const result = await handleWearableCommand({ type });
      setMessage(result.message);
    } catch (error) {
      setMessage((error as Error).message || "Companion command failed.");
    } finally {
      setBusy(null);
    }
  }

  async function onStartSelectedTour() {
    if (!selectedTour) {
      return;
    }
    setBusy("command");
    try {
      const result = await handleWearableCommand({ type: "start_tour", tourId: selectedTour.id });
      setMessage(result.message);
    } catch (error) {
      setMessage((error as Error).message || "Could not open the selected tour pack.");
    } finally {
      setBusy(null);
    }
  }

  function onChooseTour(tourId: string) {
    setSelectedTourId(tourId);
    const nextTour = tours.find((tour) => tour.id === tourId) || null;
    const nextArStop = nextTour ? getArStopsForTour(nextTour)[0] || nextTour.stops[0] || null : null;
    if (nextArStop) {
      setSelectedArStopId(nextArStop.id);
      setCurrentTourSelection(tourId, nextArStop.id);
    }
  }

  function onChooseArStop(stopId: string) {
    setSelectedArStopId(stopId);
    if (selectedTour) {
      setCurrentTourSelection(selectedTour.id, stopId);
    }
  }

  async function launchArForStop(stopId?: string) {
    if (Platform.OS !== "ios") {
      setMessage("Native AR is only available in the iPhone and iPad app.");
      return;
    }
    if (!nativeArStatus?.available) {
      setMessage(nativeArStatus?.reason || "Native AR is not available on this device.");
      return;
    }

    const targetStop =
      (stopId ? arStops.find((stop) => stop.id === stopId) : null) ||
      (currentStop && getArExperienceForStop(currentStop) ? currentStop : null) ||
      selectedArStop;

    if (!targetStop) {
      setMessage("Pick an AR-ready stop first.");
      return;
    }

    setBusy("launch-ar");
    try {
      if (selectedTour) {
        setCurrentTourSelection(selectedTour.id, targetStop.id);
      }
      const experience = await launchNativeArForStop(targetStop);
      setMessage(
        experience.usesStoryCard
          ? `Opened ${targetStop.title} as an AR story card. Hold the iPad steady for auto-placement.`
          : `Opened ${targetStop.title} in native AR. Hold the iPad steady for auto-placement.`
      );
      await refreshNativeStatus();
    } catch (error) {
      setMessage((error as Error).message || "Could not launch native AR for this stop.");
      await refreshNativeStatus();
    } finally {
      setBusy(null);
    }
  }

  async function stopArSession() {
    if (Platform.OS !== "ios") {
      return;
    }
    setBusy("stop-ar");
    try {
      await stopNativeArSession();
      setMessage("Closed the current AR scene.");
      await refreshNativeStatus();
    } catch (error) {
      setMessage((error as Error).message || "Could not close the AR session.");
    } finally {
      setBusy(null);
    }
  }

  async function runArHandoff() {
    if (!tourContext?.tour || !tourContext?.stop) {
      return;
    }

    if (Platform.OS === "ios" && getArExperienceForStop(tourContext.stop)) {
      await launchArForStop(tourContext.stop.id);
      return;
    }

    setBusy("command");
    try {
      const result = await handleWearableCommand({
        type: "open_ar_on_phone",
        tourId: tourContext.tour.id,
        stopId: tourContext.stop.id
      });
      setMessage(result.message);
    } catch (error) {
      setMessage((error as Error).message || "Companion command failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <View style={styles.heroGlowPrimary} />
        <View style={styles.heroGlowSecondary} />
        <Text style={styles.heroEyebrow}>{Platform.OS === "android" ? "Android companion" : "iPhone companion"}</Text>
        <Text style={styles.title}>{Platform.OS === "android" ? "XR companion for route playback and Bluetooth audio." : "XR companion for route playback, audio, and AR handoff."}</Text>
        <Text style={styles.copy}>
          {Platform.OS === "android"
            ? "Use Android as the route-pack controller: choose a tour, step through stops, and keep narration on Bluetooth glasses or headphones."
            : "Use iPhone as the route-pack controller: keep the tour on screen, route narration to audio devices, and step into native AR when the stop is ready."}
        </Text>
        <View style={styles.chips}>
          <Chip label={Platform.OS === "android" ? "Android first" : "iOS first"} tone="default" />
          <Chip label={hasPremiumAudio ? "Premium audio unlocked" : "Preview audio mode"} tone={hasPremiumAudio ? "success" : "warn"} />
          <Chip label={status.integrationMode === "native" ? "Native companion path" : status.integrationMode === "manual" ? "Bluetooth audio path" : "Phone-only path"} tone="default" />
          {Platform.OS === "ios" && nativeArStatus ? (
            <Chip label={nativeArStatus.available ? "Native AR ready" : "Native AR unavailable"} tone={nativeArStatus.available ? "success" : "warn"} />
          ) : null}
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Launch AR</Text>
        <Text style={styles.copy}>
          Pick an AR-ready stop, then launch it directly on the iPad. If a 3D model is missing, this build will fall back to a spatial story card instead of doing nothing.
        </Text>
        <View style={styles.chips}>
          <Chip label={selectedTour?.title || "No route"} tone="default" />
          <Chip
            label={
              selectedArExperience?.usesStoryCard
                ? "Story card AR"
                : selectedArExperience
                  ? "3D scene AR"
                  : "No AR stop selected"
            }
            tone={selectedArExperience ? "success" : "warn"}
          />
          {Platform.OS === "ios" && nativeArStatus ? (
            <Chip
              label={nativeArStatus.sessionRunning ? `Session live · ${nativeArStatus.placedModelCount} placed` : "Ready to launch"}
              tone={nativeArStatus.sessionRunning ? "success" : nativeArStatus.available ? "default" : "warn"}
            />
          ) : null}
        </View>
        <View style={styles.featureCallout}>
          <Text style={styles.label}>Selected AR stop</Text>
          <Text style={styles.liveTitle}>{selectedArStop?.title || "No AR-ready stop in this route"}</Text>
          <Text style={styles.copy}>
            {selectedArExperience?.manifest.summary || "Choose a route with AR-enabled stops to launch a spatial scene here."}
          </Text>
          <Text style={styles.meta}>
            {selectedArExperience
              ? `${selectedArExperience.manifest.headline} · ${selectedArExperience.manifest.placementNote}`
              : "The Inventors, Medical Legacy, and Sports tours have the best AR coverage in this build."}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routePackRow}>
          {arStops.map((stop) => {
            const experience = getArExperienceForStop(stop);
            const isSelected = stop.id === selectedArStopId;
            return (
              <Pressable key={stop.id} onPress={() => onChooseArStop(stop.id)} style={[styles.arStopChip, isSelected && styles.routePackChipActive]}>
                <Text style={styles.routePackChipEyebrow}>
                  {experience?.usesStoryCard ? "Story card" : "3D scene"}
                </Text>
                <Text style={styles.routePackChipTitle}>{stop.title}</Text>
                <Text style={styles.routePackChipMeta} numberOfLines={2}>
                  {experience?.manifest.headline || "AR stop"}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.secondaryActionRow}>
          <View style={styles.launchButtonFlex}>
            <PrimaryButton
              label={busy === "launch-ar" ? "Opening AR..." : selectedArExperience?.usesStoryCard ? "Open AR Story Card" : "Launch Native AR"}
              onPress={() => void launchArForStop()}
              disabled={busy !== null || !selectedArStop || !nativeArStatus?.available}
            />
          </View>
          <Pressable
            style={[styles.secondaryActionButton, !nativeArStatus?.sessionRunning ? styles.commandButtonDisabled : null]}
            onPress={() => void stopArSession()}
            disabled={busy !== null || !nativeArStatus?.sessionRunning}
          >
            <Text style={styles.secondaryActionLabel}>{busy === "stop-ar" ? "Closing..." : "Close AR"}</Text>
          </Pressable>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Live now</Text>
        <View style={styles.chips}>
          <Chip label={status.connectionState === "connected" ? "Companion connected" : "Companion standby"} tone={status.connectionState === "connected" ? "success" : "warn"} />
          <Chip label={getIntegrationChipLabel(status)} tone={status.integrationMode === "none" ? "danger" : "success"} />
          <Chip label={routeProgressLabel} tone="default" />
        </View>
        <View style={styles.liveShell}>
          <View style={styles.livePrimary}>
            <Text style={styles.label}>Current stop</Text>
            <Text style={styles.liveTitle}>{currentStop?.title || selectedTour?.stops[0]?.title || "No stop loaded"}</Text>
            <Text style={styles.copy}>
              {currentStop
                ? `${currentStop.description.split("|")[0]?.trim() || currentStop.description}`
                : "Load a route pack to make the next stop, narration, and AR handoff feel immediate."}
            </Text>
          </View>
          <View style={styles.liveSecondary}>
            <View style={styles.liveStatCard}>
              <Text style={styles.label}>Next stop</Text>
              <Text style={styles.value}>{nextStop?.title || "Waiting for route start"}</Text>
            </View>
            <View style={styles.liveStatCard}>
              <Text style={styles.label}>Audio route</Text>
              <Text style={styles.value}>{status.pairedDevice?.displayName || (status.integrationMode === "manual" ? "Bluetooth output" : "Phone output")}</Text>
            </View>
          </View>
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Choose route pack</Text>
        <Text style={styles.copy}>
          Load one route pack into the companion flow, then step through stops without hunting through the rest of the app.
        </Text>
        <View style={styles.chips}>
          <Chip label={selectedTour?.title || "No route"} tone="default" />
          <Chip label={selectedTour ? `${selectedTour.stops.length} stops` : "0 stops"} tone="success" />
          <Chip label={selectedTour ? `${selectedTourAudioCount} recorded audio` : "No audio"} tone={selectedTourAudioCount > 0 ? "success" : "warn"} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routePackRow}>
          {tours.map((tour) => {
            const isSelected = tour.id === selectedTourId;
            const audioCount = tour.stops.filter((stop) => getNarrationCoverage(stop.id) === "full_audio").length;
            return (
              <Pressable key={tour.id} onPress={() => onChooseTour(tour.id)} style={[styles.routePackChip, isSelected && styles.routePackChipActive]}>
                <Text style={styles.routePackChipEyebrow}>{tour.stops.length} stops</Text>
                <Text style={styles.routePackChipTitle}>{tour.title}</Text>
                <Text style={styles.routePackChipMeta}>{audioCount} narrated stops</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.featureCallout}>
          <Text style={styles.label}>Companion route state</Text>
          <Text style={styles.value}>{routeProgressLabel}</Text>
          <Text style={styles.meta}>
            {tourContext?.tour && selectedTour && tourContext.tour.id === selectedTour.id
              ? `${tourContext.stop?.title || "No active stop"} is active now.`
              : `Opening this pack will start at ${selectedTour?.stops[0]?.title || "the first stop"}.`}
          </Text>
          {!hasPremiumAudio ? (
            <Text style={styles.meta}>
              Preview audio mode is active. Premium purchase is still required for the full paid narration experience.
            </Text>
          ) : null}
        </View>
        <PrimaryButton
          label={busy === "command" ? "Loading Route..." : Platform.OS === "android" ? "Load Route Pack On Android" : "Load Route Pack On iPhone"}
          onPress={() => void onStartSelectedTour()}
          disabled={busy !== null || !selectedTour}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Playback controls</Text>
        <Text style={styles.copy}>
          Use these controls to move through the active route pack, replay stop audio, and open the current stop directly in AR when it is ready.
        </Text>
        <View style={styles.chips}>
          <Chip label={tourContext?.tour?.title || "No active tour"} tone="default" />
          <Chip label={tourContext?.stop?.title || "No active stop"} tone="warn" />
          <Chip label={tourContext?.nextStop?.title || "No next stop"} tone="success" />
          {currentStopExperience ? <Chip label="AR available here" tone="success" /> : null}
        </View>
        <View style={styles.primaryControlRow}>
          <Pressable style={[styles.heroActionButton, !tourContext?.tour || tourContext.stopIndex <= 0 ? styles.commandButtonDisabled : null]} onPress={() => void runCommand("previous_stop")} disabled={busy !== null || !tourContext?.tour || tourContext.stopIndex <= 0}>
            <Text style={styles.heroActionLabel}>Previous stop</Text>
          </Pressable>
          <Pressable style={[styles.heroActionButton, !selectedTour ? styles.commandButtonDisabled : null]} onPress={() => void onStartSelectedTour()} disabled={busy !== null || !selectedTour}>
            <Text style={styles.heroActionLabel}>Load route</Text>
          </Pressable>
          <Pressable style={styles.heroActionButton} onPress={() => void runCommand("next_stop")} disabled={busy !== null}>
            <Text style={styles.heroActionLabel}>Next stop</Text>
          </Pressable>
        </View>
        <View style={styles.commandGrid}>
          <Pressable style={styles.commandButton} onPress={() => void runCommand("repeat_narration")} disabled={busy !== null}>
            <Text style={styles.commandLabel}>Replay narration</Text>
          </Pressable>
          <Pressable style={styles.commandButton} onPress={() => void runCommand("pause_narration")} disabled={busy !== null}>
            <Text style={styles.commandLabel}>Pause narration</Text>
          </Pressable>
          <Pressable style={styles.commandButton} onPress={() => void runCommand("get_stop_context")} disabled={busy !== null}>
            <Text style={styles.commandLabel}>Show stop context</Text>
          </Pressable>
          <Pressable
            style={[styles.commandButton, !tourContext?.tour || !tourContext?.stop ? styles.commandButtonDisabled : null]}
            onPress={() => void runArHandoff()}
            disabled={busy !== null || !tourContext?.tour || !tourContext?.stop}
          >
            <Text style={styles.commandLabel}>Launch current stop AR</Text>
          </Pressable>
        </View>
        {lastCommandResult ? (
          <View style={styles.featureCallout}>
            <Text style={styles.label}>Latest action</Text>
            <Text style={styles.value}>{lastCommandResult.result.message}</Text>
            <Text style={styles.meta}>
              {new Date(lastCommandResult.recordedAt).toLocaleTimeString()} · {lastCommandResult.commandType}
            </Text>
          </View>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Device connection</Text>
        <Text style={styles.copy}>{getCompanionIntroCopy(status)}</Text>
        <Text style={styles.copy}>{getCompanionDetailCopy(status)}</Text>
        {Platform.OS === "ios" && nativeArStatus ? <Text style={styles.copy}>{nativeArStatus.reason}</Text> : null}
        <View style={styles.chips}>
          <Chip label={status.connectionState.toUpperCase()} tone={status.connectionState === "connected" ? "success" : "warn"} />
          <Chip label={getIntegrationChipLabel(status)} tone={status.integrationMode === "none" ? "danger" : "success"} />
          <Chip label={status.platformLabel} tone="default" />
        </View>
        <View style={styles.featureCallout}>
          <Text style={styles.label}>Paired device</Text>
          <Text style={styles.value}>{status.pairedDevice?.displayName || "No device paired"}</Text>
          <Text style={styles.meta}>
            {status.grantedPermissions.length ? `Permissions: ${status.grantedPermissions.join(", ")}` : "No companion permissions granted yet."}
          </Text>
          {status.pairedDevice?.isMock ? <Text style={styles.meta}>Mock device mode is active for companion testing on iOS.</Text> : null}
          {isMockConnected ? <Text style={styles.meta}>Disconnect the mock device before starting real Ray-Ban Meta registration.</Text> : null}
          {canReconnect ? <Text style={styles.meta}>{getReconnectCopy(status)}</Text> : null}
          {isNativeRealFlow ? <Text style={styles.meta}>{getNativePairingHint(status)}</Text> : null}
        </View>
        {!isConnected ? (
          <PrimaryButton
            label={busy === "pair" ? "Connecting..." : connectLabel}
            onPress={() => void onPair()}
            disabled={busy !== null}
          />
        ) : null}
        {mockPairingAvailable && !isConnected ? (
          <PrimaryButton
            label={busy === "pair-mock" ? "Connecting Mock..." : "Pair Mock Ray-Ban Meta"}
            onPress={() => void onPairMock()}
            disabled={busy !== null}
          />
        ) : null}
        <View style={styles.secondaryActionRow}>
          <Pressable style={styles.secondaryActionButton} onPress={() => void onRefresh()} disabled={busy !== null}>
            <Text style={styles.secondaryActionLabel}>{busy === "refresh" ? "Refreshing..." : "Refresh status"}</Text>
          </Pressable>
          <Pressable style={styles.secondaryActionButton} onPress={() => void onDisconnect()} disabled={busy !== null}>
            <Text style={styles.secondaryActionLabel}>
              {busy === "disconnect" ? "Disconnecting..." : isMockConnected ? "Disconnect mock" : "Disconnect"}
            </Text>
          </Pressable>
        </View>
        {lastCommandResult?.result.deepLink ? (
          <View style={styles.featureCallout}>
            <Text style={styles.label}>Latest handoff link</Text>
            <Text style={styles.meta}>{lastCommandResult.result.deepLink}</Text>
          </View>
        ) : null}
      </Card>
    </ScrollView>
  );
}

function getConnectLabel(status: WearableStatus, canReconnect: boolean) {
  if (status.integrationMode === "manual") {
    return canReconnect ? "Restore Universal Audio Mode" : "Enable Universal Audio Mode";
  }

  if (status.integrationMode === "native") {
    if (status.connectionState === "pairing") {
      return "Continue Ray-Ban Meta Pairing";
    }

    if (canReconnect) {
      return "Reconnect Ray-Ban Meta";
    }

    return status.pairedDevice ? "Activate Ray-Ban Meta Session" : "Start Ray-Ban Meta Registration";
  }

  return canReconnect ? "Reconnect Companion Device" : "Connect Companion Device";
}

function getIntegrationChipLabel(status: WearableStatus) {
  if (status.integrationMode === "native") {
    return "Native DAT";
  }

  if (status.integrationMode === "manual") {
    return "Universal audio mode";
  }

  return "Integration unavailable";
}

function getCompanionIntroCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "Universal audio mode uses the phone for controls while narration follows your current Bluetooth audio route.";
  }

  if (status.integrationMode === "native") {
    return "Your phone can always play narration through its current audio output, including Bluetooth headphones and glasses. Meta setup adds deeper companion controls, stop context, and AR handoff.";
  }

  return "Phone-first touring is available here even when native glasses controls are not.";
}

function getCompanionDetailCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "Pair any Bluetooth glasses, headset, or speaker in Android settings first, then enable this mode to keep narration on that output.";
  }

  if (status.integrationMode === "native") {
    return "Use your iPhone with any Bluetooth audio device for universal narration. Registration, device state, and camera permission are available here when you want the Meta-specific experience.";
  }

  return "Use the phone app for route planning, narration, and handoff.";
}

function getReconnectCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "A remembered Bluetooth audio route was found. Restore it to keep narration on your current audio output.";
  }

  return "A previously known Meta device was found. Reconnect to resume companion access.";
}

function getNativePairingHint(status: WearableStatus) {
  if (status.connectionState === "pairing") {
    return "Finish the Ray-Ban Meta setup in the Meta AI app, then return here. If the glasses are already paired there, tap refresh after the callback completes.";
  }

  if (status.pairedDevice) {
    return "Your Ray-Ban Meta registration is already known to this app. Power on the glasses, open the companion flow, and grant camera access when prompted.";
  }

  return "Start registration here, complete the handoff in the Meta AI app, then come back to this screen to confirm the glasses session is active.";
}

function createStyles(colors: AppPalette, type: ReturnType<typeof useTypeScale>) {
  return StyleSheet.create({
    container: {
      padding: 20,
      gap: 18,
      backgroundColor: colors.background
    },
    heroPanel: {
      position: "relative",
      overflow: "hidden",
      backgroundColor: colors.headerBackground,
      borderRadius: 32,
      padding: 24,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOpacity: 0.14,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 14 },
      elevation: 4
    },
    heroGlowPrimary: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor: "rgba(92, 61, 244, 0.2)",
      top: -96,
      right: -70
    },
    heroGlowSecondary: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 999,
      backgroundColor: "rgba(239, 201, 108, 0.14)",
      bottom: -100,
      left: -64
    },
    heroEyebrow: {
      color: colors.olive,
      fontSize: type.font(12),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2
    },
    card: {
      gap: 12,
      backgroundColor: colors.surfaceRaised
    },
    title: {
      color: colors.text,
      fontSize: type.font(24),
      fontWeight: "800",
      fontFamily: headingFontFamily
    },
    copy: {
      color: colors.textSoft,
      fontSize: type.font(14),
      lineHeight: type.line(22)
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8
    },
    label: {
      color: colors.textMuted,
      fontSize: type.font(12),
      fontWeight: "700",
      textTransform: "uppercase"
    },
    value: {
      color: colors.text,
      fontSize: type.font(15)
    },
    message: {
      color: colors.warn,
      fontSize: type.font(13),
      lineHeight: type.line(20)
    },
    liveShell: {
      gap: 12
    },
    livePrimary: {
      gap: 8
    },
    liveSecondary: {
      gap: 10
    },
    liveTitle: {
      color: colors.text,
      fontSize: type.font(20),
      fontWeight: "800",
      lineHeight: type.line(26),
      fontFamily: headingFontFamily
    },
    liveStatCard: {
      gap: 6,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft
    },
    featureCallout: {
      gap: 8,
      padding: 14,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border
    },
    primaryControlRow: {
      flexDirection: "row",
      gap: 10
    },
    heroActionButton: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      alignItems: "center",
      justifyContent: "center"
    },
    heroActionLabel: {
      color: colors.text,
      fontSize: type.font(14),
      fontWeight: "800"
    },
    commandGrid: {
      gap: 10
    },
    routePackRow: {
      gap: 10,
      paddingVertical: 4
    },
    routePackChip: {
      width: 220,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      gap: 6
    },
    routePackChipActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft
    },
    arStopChip: {
      width: 244,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      gap: 6
    },
    routePackChipEyebrow: {
      color: colors.textMuted,
      fontSize: type.font(11),
      fontWeight: "700",
      textTransform: "uppercase"
    },
    routePackChipTitle: {
      color: colors.text,
      fontSize: type.font(15),
      fontWeight: "800",
      fontFamily: headingFontFamily
    },
    routePackChipMeta: {
      color: colors.textSoft,
      fontSize: type.font(12)
    },
    commandButton: {
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft
    },
    commandButtonDisabled: {
      opacity: 0.45
    },
    commandLabel: {
      color: colors.text,
      fontSize: type.font(14),
      fontWeight: "700"
    },
    commandLog: {
      gap: 8,
      padding: 14,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border
    },
    secondaryActionRow: {
      flexDirection: "row",
      gap: 10
    },
    launchButtonFlex: {
      flex: 1
    },
    secondaryActionButton: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      alignItems: "center",
      justifyContent: "center"
    },
    secondaryActionLabel: {
      color: colors.text,
      fontSize: type.font(13),
      fontWeight: "700"
    },
    sectionTitle: {
      color: colors.text,
      fontSize: type.font(20),
      fontWeight: "800",
      fontFamily: headingFontFamily
    },
    meta: {
      color: colors.textMuted,
      fontSize: type.font(12),
      lineHeight: type.line(18)
    }
  });
}
