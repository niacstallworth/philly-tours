import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { connectCompanion, disconnectCompanion, handleWearableCommand, refreshCompanionStatus } from "../services/companion";
import { getCurrentTourContext } from "../services/tourControl";
import type { WearableStatus } from "../services/wearables";
import { useCompanionSession } from "../hooks/useCompanionSession";
import { type AppPalette, useTypeScale, useThemeColors } from "../theme/appTheme";

export function CompanionSetupScreen() {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const { status, lastCommandResult } = useCompanionSession();
  const [busy, setBusy] = React.useState<"pair" | "disconnect" | "refresh" | "command" | null>(null);
  const [message, setMessage] = React.useState<string | null>(status.lastError);
  const context = getCurrentTourContext();
  const canReconnect =
    status.supported &&
    status.pairedDevice != null &&
    status.connectionState !== "connected" &&
    status.connectionState !== "pairing";
  const connectLabel = getConnectLabel(status, canReconnect);

  React.useEffect(() => {
    void refreshCompanionStatus();
  }, []);

  React.useEffect(() => {
    setMessage(status.lastError ?? status.statusMessage ?? null);
  }, [status.lastError, status.statusMessage]);

  async function onPair() {
    setBusy("pair");
    try {
      await connectCompanion();
      setMessage("Companion connected.");
    } catch (error) {
      setMessage((error as Error).message || "Unable to pair Meta glasses.");
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

  async function runCommand(type: "get_stop_context" | "repeat_narration" | "pause_narration" | "next_stop") {
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
        <Text style={styles.heroEyebrow}>AR companion</Text>
        <Text style={styles.title}>Meta glasses and phone handoff in one control surface.</Text>
        <Text style={styles.copy}>
          Manage glasses connection, audio routing, and handoff controls from one place.
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.title}>Meta Glasses Companion</Text>
        <Text style={styles.copy}>{getCompanionIntroCopy(status)}</Text>
        <Text style={styles.copy}>{getCompanionDetailCopy(status)}</Text>
        <View style={styles.chips}>
          <Chip label={status.connectionState.toUpperCase()} tone={status.connectionState === "connected" ? "success" : "warn"} />
          <Chip label={getIntegrationChipLabel(status)} tone={status.integrationMode === "none" ? "danger" : "success"} />
          <Chip label={status.platformLabel} tone="default" />
        </View>
        <Text style={styles.label}>Paired device</Text>
        <Text style={styles.value}>{status.pairedDevice?.displayName || "No device paired"}</Text>
        <Text style={styles.label}>Permissions</Text>
        <Text style={styles.value}>{status.grantedPermissions.length ? status.grantedPermissions.join(", ") : "None granted"}</Text>
        {canReconnect ? <Text style={styles.meta}>{getReconnectCopy(status)}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <PrimaryButton
          label={busy === "pair" ? "Connecting..." : connectLabel}
          onPress={() => void onPair()}
          disabled={busy !== null}
        />
        <PrimaryButton
          label={busy === "refresh" ? "Refreshing..." : "Refresh Companion Status"}
          onPress={() => void onRefresh()}
          disabled={busy !== null}
        />
        <PrimaryButton
          label={busy === "disconnect" ? "Disconnecting..." : "Remove Meta Registration"}
          onPress={() => void onDisconnect()}
          disabled={busy !== null}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Companion Command Test</Text>
        <Text style={styles.copy}>
          Use these controls to test stop context, narration controls, and AR handoff.
        </Text>
        <View style={styles.chips}>
          <Chip label={context?.tour?.title || "No active tour"} tone="default" />
          <Chip label={context?.stop?.title || "No active stop"} tone="warn" />
        </View>
        <View style={styles.commandGrid}>
          <Pressable style={styles.commandButton} onPress={() => void runCommand("get_stop_context")} disabled={busy !== null}>
            <Text style={styles.commandLabel}>Get Stop Context</Text>
          </Pressable>
          <Pressable style={styles.commandButton} onPress={() => void runCommand("repeat_narration")} disabled={busy !== null}>
            <Text style={styles.commandLabel}>Repeat Narration</Text>
          </Pressable>
          <Pressable style={styles.commandButton} onPress={() => void runCommand("pause_narration")} disabled={busy !== null}>
            <Text style={styles.commandLabel}>Pause Narration</Text>
          </Pressable>
          <Pressable style={styles.commandButton} onPress={() => void runCommand("next_stop")} disabled={busy !== null}>
            <Text style={styles.commandLabel}>Next Stop</Text>
          </Pressable>
          <Pressable
            style={[styles.commandButton, !context?.tour || !context?.stop ? styles.commandButtonDisabled : null]}
            onPress={() => void runArHandoff()}
            disabled={busy !== null || !context?.tour || !context?.stop}
          >
            <Text style={styles.commandLabel}>Open AR On Phone</Text>
          </Pressable>
        </View>
        {lastCommandResult ? (
          <View style={styles.commandLog}>
            <Text style={styles.label}>Last command</Text>
            <Text style={styles.value}>{lastCommandResult.commandType}</Text>
            <Text style={styles.meta}>
              {new Date(lastCommandResult.recordedAt).toLocaleTimeString()} · {lastCommandResult.result.ok ? "ok" : "failed"}
            </Text>
            <Text style={styles.copy}>{lastCommandResult.result.message}</Text>
            {lastCommandResult.result.deepLink ? <Text style={styles.meta}>{lastCommandResult.result.deepLink}</Text> : null}
          </View>
        ) : null}
      </Card>
    </ScrollView>
  );
}

function getConnectLabel(status: WearableStatus, canReconnect: boolean) {
  if (status.integrationMode === "manual") {
    return canReconnect ? "Restore Meta Glasses Audio Mode" : "Enable Meta Glasses Audio Mode";
  }

  return canReconnect ? "Reconnect Meta Glasses" : "Connect Meta Glasses";
}

function getIntegrationChipLabel(status: WearableStatus) {
  if (status.integrationMode === "native") {
    return "Native DAT";
  }

  if (status.integrationMode === "manual") {
    return "Bluetooth audio mode";
  }

  return "Integration unavailable";
}

function getCompanionIntroCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "Manual Meta glasses mode uses the phone for controls and Bluetooth for audio output.";
  }

  if (status.integrationMode === "native") {
    return "Set up Meta glasses for narration, stop context, and AR handoff.";
  }

  return "Meta glasses controls are not available on this platform yet.";
}

function getCompanionDetailCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "Pair the glasses in Android Bluetooth settings first, then enable companion mode here.";
  }

  if (status.integrationMode === "native") {
    return "Registration, device state, and camera permission are available here.";
  }

  return "Use the phone app for route planning, narration, and handoff.";
}

function getReconnectCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "A remembered Meta glasses audio session was found. Restore it to keep narration on your current audio output.";
  }

  return "A previously known Meta device was found. Reconnect to resume companion access.";
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
    commandGrid: {
      gap: 10
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
    meta: {
      color: colors.textMuted,
      fontSize: type.font(12),
      lineHeight: type.line(18)
    }
  });
}
