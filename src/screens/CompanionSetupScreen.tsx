import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { connectCompanion, disconnectCompanion, refreshCompanionStatus } from "../services/companion";
import { useCompanionSession } from "../hooks/useCompanionSession";
import { type AppPalette, useTypeScale, useThemeColors } from "../theme/appTheme";

export function CompanionSetupScreen() {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const { status } = useCompanionSession();
  const [busy, setBusy] = React.useState<"pair" | "disconnect" | null>(null);
  const [message, setMessage] = React.useState<string | null>(status.lastError);

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
    }
  });
}
