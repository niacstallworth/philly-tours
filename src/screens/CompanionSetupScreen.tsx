import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { connectCompanion, disconnectCompanion, handleWearableCommand, refreshCompanionStatus } from "../services/companion";
import { getCurrentTourContext } from "../services/tourControl";
import { useCompanionSession } from "../hooks/useCompanionSession";
import { type AppPalette, useTypeScale, useThemeColors } from "../theme/appTheme";

export function CompanionSetupScreen() {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const { status, lastCommandResult } = useCompanionSession();
  const [busy, setBusy] = React.useState<"pair" | "disconnect" | "command" | null>(null);
  const [message, setMessage] = React.useState<string | null>(status.lastError);
  const context = getCurrentTourContext();

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
      <Card style={styles.card}>
        <Text style={styles.title}>Meta Glasses Companion</Text>
        <Text style={styles.copy}>
          This is the setup surface for the Meta wearables companion flow. The production target is hands-free narration,
          contextual stop requests, and phone AR handoff.
        </Text>
        <Text style={styles.copy}>
          The current iOS DAT build exposes registration, device state, and camera permission. Microphone and glasses-audio routing still need a later integration pass.
        </Text>
        <View style={styles.chips}>
          <Chip label={status.connectionState.toUpperCase()} tone={status.connectionState === "connected" ? "success" : "warn"} />
          <Chip label={status.supported ? "SDK Ready" : "SDK Missing"} tone={status.supported ? "success" : "danger"} />
        </View>
        <Text style={styles.label}>Paired device</Text>
        <Text style={styles.value}>{status.pairedDevice?.displayName || "No device paired"}</Text>
        <Text style={styles.label}>Permissions</Text>
        <Text style={styles.value}>{status.grantedPermissions.length ? status.grantedPermissions.join(", ") : "None granted"}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <PrimaryButton
          label={busy === "pair" ? "Connecting..." : "Connect Meta Glasses"}
          onPress={() => void onPair()}
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
          Use these buttons as a phone-side proxy for the glasses command loop while pairing and narration routing are being refined.
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

function createStyles(colors: AppPalette, type: ReturnType<typeof useTypeScale>) {
  return StyleSheet.create({
    container: {
      padding: 20,
      gap: 16
    },
    card: {
      gap: 12
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
      paddingVertical: 12,
      borderRadius: 16,
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
      backgroundColor: colors.surfaceSoft,
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
