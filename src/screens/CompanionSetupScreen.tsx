import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { getCityTours } from "../city-runtime/getCityTours";
import {
  connectCompanion,
  connectMockCompanion,
  disconnectCompanion,
  handleWearableCommand,
  refreshCompanionStatus
} from "../services/companion";
import { getCurrentTourContext } from "../services/tourControl";
import type { WearableStatus } from "../services/wearables";
import { getNativeArStatus, type NativeArStatus } from "../services/nativeAr";
import { getNarrationCoverage } from "../services/narration";
import { useCompanionSession } from "../hooks/useCompanionSession";
import { type AppPalette, useTypeScale, useThemeColors } from "../theme/appTheme";

const tours = getCityTours();

type Props = {
  audioHistoryOnlyUnlocked?: boolean;
  fullAppUnlocked?: boolean;
};

export function CompanionSetupScreen({ audioHistoryOnlyUnlocked = false, fullAppUnlocked = false }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const { status, lastCommandResult } = useCompanionSession();
  const [busy, setBusy] = React.useState<"pair" | "pair-mock" | "disconnect" | "refresh" | "command" | null>(null);
  const [message, setMessage] = React.useState<string | null>(status.lastError);
  const [nativeArStatus, setNativeArStatus] = React.useState<NativeArStatus | null>(null);
  const context = getCurrentTourContext();
  const [selectedTourId, setSelectedTourId] = React.useState<string>(context?.tour.id || tours[0]?.id || "");
  const mockPairingAvailable = status.integrationMode === "native" && status.platformLabel === "iOS";
  const showDevelopmentControls = __DEV__;
  const showMockPairing = showDevelopmentControls && mockPairingAvailable;
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
  const selectedTourAudioCount = React.useMemo(
    () => (selectedTour ? selectedTour.stops.filter((stop) => getNarrationCoverage(stop.id) === "full_audio").length : 0),
    [selectedTour]
  );
  const hasPremiumAudio = audioHistoryOnlyUnlocked || fullAppUnlocked;
  const currentStop = context?.tour && selectedTour && context.tour.id === selectedTour.id ? context.stop : null;
  const nextStop = context?.tour && selectedTour && context.tour.id === selectedTour.id ? context.nextStop : null;
  const routeProgressLabel =
    context?.tour && selectedTour && context.tour.id === selectedTour.id
      ? `Stop ${context.stopIndex + 1} of ${context.tour.stops.length}`
      : selectedTour
        ? `Ready to start at ${selectedTour.stops[0]?.title || "first stop"}`
        : "No route selected";

  React.useEffect(() => {
    void refreshCompanionStatus();
  }, []);

  React.useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    let cancelled = false;
    void getNativeArStatus()
      .then((nextStatus) => {
        if (!cancelled) {
          setNativeArStatus(nextStatus);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNativeArStatus({
            available: false,
            reason: "Native AR status could not be loaded on this device.",
            sessionRunning: false,
            placedModelCount: 0
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (context?.tour?.id) {
      setSelectedTourId(context.tour.id);
    }
  }, [context?.tour?.id]);

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

  async function runArHandoff() {
    if (!context?.tour || !context?.stop) {
      return;
    }

    setBusy("command");
    try {
      const result = await handleWearableCommand({
        type: "open_ar_on_phone",
        tourId: context.tour.id,
        stopId: context.stop.id
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
        <Text style={styles.heroEyebrow}>AR guide</Text>
        <Text style={styles.title}>{Platform.OS === "android" ? "Route audio and AR moments, ready from your phone." : "Route audio, smart glasses, and AR moments, ready from your phone."}</Text>
        <Text style={styles.copy}>
          {Platform.OS === "android"
            ? "Choose a tour, step through stops, and keep narration flowing through your preferred Bluetooth audio."
            : "Keep the tour on screen, send narration to your preferred audio device, and step into AR when a stop is ready."}
        </Text>
        <View style={styles.chips}>
          <Chip label={Platform.OS === "android" ? "Android guide" : "iPhone guide"} tone="default" />
          <Chip label={hasPremiumAudio ? "Premium audio unlocked" : "Audio preview"} tone={hasPremiumAudio ? "success" : "warn"} />
          <Chip label={getIntegrationChipLabel(status)} tone="default" />
          {Platform.OS === "ios" && nativeArStatus ? (
            <Chip label={nativeArStatus.available ? "AR ready" : "AR not available"} tone={nativeArStatus.available ? "success" : "warn"} />
          ) : null}
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Current moment</Text>
        <View style={styles.chips}>
          <Chip label={status.connectionState === "connected" ? "Audio connected" : "Audio ready"} tone={status.connectionState === "connected" ? "success" : "warn"} />
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
                : "Start a route to prepare the next stop, narration, and AR moment."}
            </Text>
          </View>
          <View style={styles.liveSecondary}>
            <View style={styles.liveStatCard}>
              <Text style={styles.label}>Next stop</Text>
              <Text style={styles.value}>{nextStop?.title || "Waiting for route start"}</Text>
            </View>
            <View style={styles.liveStatCard}>
              <Text style={styles.label}>Audio route</Text>
              <Text style={styles.value}>{getAudioRouteLabel(status)}</Text>
            </View>
          </View>
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Choose a route</Text>
        <Text style={styles.copy}>
          Start one route at a time, then move through each stop with audio and AR controls close at hand.
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
              <Pressable key={tour.id} onPress={() => setSelectedTourId(tour.id)} style={[styles.routePackChip, isSelected && styles.routePackChipActive]}>
                <Text style={styles.routePackChipEyebrow}>{tour.stops.length} stops</Text>
                <Text style={styles.routePackChipTitle}>{tour.title}</Text>
                <Text style={styles.routePackChipMeta}>{audioCount} narrated stops</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.featureCallout}>
          <Text style={styles.label}>Route progress</Text>
          <Text style={styles.value}>{routeProgressLabel}</Text>
          <Text style={styles.meta}>
            {context?.tour && selectedTour && context.tour.id === selectedTour.id
              ? `${context.stop?.title || "No active stop"} is active now.`
              : `Opening this pack will start at ${selectedTour?.stops[0]?.title || "the first stop"}.`}
          </Text>
          {!hasPremiumAudio ? (
            <Text style={styles.meta}>
              Audio preview is active. Upgrade in Profile to unlock the full narration experience.
            </Text>
          ) : null}
        </View>
        <PrimaryButton
          label={busy === "command" ? "Starting Route..." : "Start Route"}
          onPress={() => void onStartSelectedTour()}
          disabled={busy !== null || !selectedTour}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Playback controls</Text>
        <Text style={styles.copy}>
          Move through the active route, replay stop audio, and open AR when the current stop is ready.
        </Text>
        <View style={styles.chips}>
          <Chip label={context?.tour?.title || "No active tour"} tone="default" />
          <Chip label={context?.stop?.title || "No active stop"} tone="warn" />
          <Chip label={context?.nextStop?.title || "No next stop"} tone="success" />
        </View>
        <View style={styles.primaryControlRow}>
          <Pressable style={[styles.heroActionButton, !context?.tour || context.stopIndex <= 0 ? styles.commandButtonDisabled : null]} onPress={() => void runCommand("previous_stop")} disabled={busy !== null || !context?.tour || context.stopIndex <= 0}>
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
            style={[styles.commandButton, !context?.tour || !context?.stop ? styles.commandButtonDisabled : null]}
            onPress={() => void runArHandoff()}
            disabled={busy !== null || !context?.tour || !context?.stop}
          >
            <Text style={styles.commandLabel}>Open AR on phone</Text>
          </Pressable>
        </View>
        {lastCommandResult ? (
          <View style={styles.featureCallout}>
            <Text style={styles.label}>Last action</Text>
            <Text style={styles.value}>{lastCommandResult.result.message}</Text>
            <Text style={styles.meta}>
              {new Date(lastCommandResult.recordedAt).toLocaleTimeString()}
            </Text>
          </View>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Audio and glasses</Text>
        <Text style={styles.copy}>{getCompanionIntroCopy(status)}</Text>
        <Text style={styles.copy}>{getCompanionDetailCopy(status)}</Text>
        {Platform.OS === "ios" && nativeArStatus ? <Text style={styles.copy}>{nativeArStatus.reason}</Text> : null}
        <View style={styles.chips}>
          <Chip label={status.connectionState.toUpperCase()} tone={status.connectionState === "connected" ? "success" : "warn"} />
          <Chip label={getIntegrationChipLabel(status)} tone={status.integrationMode === "none" ? "danger" : "success"} />
          <Chip label={status.platformLabel} tone="default" />
        </View>
        <View style={styles.featureCallout}>
          <Text style={styles.label}>Current audio</Text>
          <Text style={styles.value}>{getAudioRouteLabel(status)}</Text>
          <Text style={styles.meta}>
            {status.connectionState === "connected"
              ? "Narration is ready for the current route."
              : "Use your phone speaker, headphones, or supported glasses for narration."}
          </Text>
          {showDevelopmentControls && status.pairedDevice?.isMock ? <Text style={styles.meta}>Mock device mode is active for companion testing on iOS.</Text> : null}
          {showDevelopmentControls && isMockConnected ? <Text style={styles.meta}>Disconnect the mock device before starting real Ray-Ban Meta registration.</Text> : null}
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
        {showMockPairing && !isConnected ? (
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
              {busy === "disconnect" ? "Disconnecting..." : showDevelopmentControls && isMockConnected ? "Disconnect mock" : "Disconnect"}
            </Text>
          </Pressable>
        </View>
        {showDevelopmentControls && lastCommandResult?.result.deepLink ? (
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
    return canReconnect ? "Restore Bluetooth Audio" : "Use Bluetooth Audio";
  }

  if (status.integrationMode === "native") {
    if (status.connectionState === "pairing") {
      return "Continue Glasses Setup";
    }

    if (canReconnect) {
      return "Reconnect Glasses";
    }

    return status.pairedDevice ? "Use Paired Glasses" : "Set Up Smart Glasses";
  }

  return canReconnect ? "Reconnect Audio" : "Set Up Audio";
}

function getIntegrationChipLabel(status: WearableStatus) {
  if (status.integrationMode === "native") {
    return "Smart glasses ready";
  }

  if (status.integrationMode === "manual") {
    return "Bluetooth audio";
  }

  return "Phone audio";
}

function getAudioRouteLabel(status: WearableStatus) {
  if (status.pairedDevice?.isMock && !__DEV__) {
    return "Smart glasses";
  }

  return status.pairedDevice?.displayName || (status.integrationMode === "manual" ? "Bluetooth audio" : "Phone audio");
}

function getCompanionIntroCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "Use the phone for route controls while narration follows your current Bluetooth audio.";
  }

  if (status.integrationMode === "native") {
    return "Your phone can play narration through its current audio output, including Bluetooth headphones and supported glasses.";
  }

  return "Phone-first touring is ready here, with audio, route controls, and AR moments in one place.";
}

function getCompanionDetailCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "Pair any Bluetooth glasses, headset, or speaker in Android settings first, then return here to keep narration on that output.";
  }

  if (status.integrationMode === "native") {
    return "Use your iPhone with headphones or supported glasses for narration, then open AR at stops that include a spatial scene.";
  }

  return "Use the phone app for route planning, narration, and AR.";
}

function getReconnectCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "A previous Bluetooth audio route is available. Restore it to keep narration on that output.";
  }

  return "Previously paired glasses are available. Reconnect when you want narration and route controls there.";
}

function getNativePairingHint(status: WearableStatus) {
  if (status.connectionState === "pairing") {
    return "Finish setup in the glasses app, then return here. If the glasses are already paired there, tap refresh after setup completes.";
  }

  if (status.pairedDevice) {
    return "Your glasses are known to this app. Power them on, then grant camera access when an AR stop asks for it.";
  }

  return "Start setup here, finish it in the glasses app, then return to continue your route.";
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
      backgroundColor: "rgba(91, 56, 245, 0.26)",
      top: -96,
      right: -70
    },
    heroGlowSecondary: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 999,
      backgroundColor: "rgba(125, 201, 255, 0.14)",
      bottom: -100,
      left: -64
    },
    heroEyebrow: {
      color: colors.warn,
      fontSize: type.font(12),
      fontWeight: "700",
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
      fontWeight: "800"
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
      lineHeight: type.line(26)
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
      borderColor: colors.info,
      backgroundColor: colors.surface
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
      fontWeight: "800"
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
      fontWeight: "800"
    },
    meta: {
      color: colors.textMuted,
      fontSize: type.font(12),
      lineHeight: type.line(18)
    }
  });
}
