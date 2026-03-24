import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { AppPalette, useThemeColors, useTypeScale } from "../theme/appTheme";

export type AppMode = "tourist" | "builder";

export type OnboardingPayload = {
  displayName: string;
  email: string;
  mode: AppMode;
  password?: string;
};

type Props = {
  onComplete: (payload: OnboardingPayload) => Promise<string | null>;
};

export function OnboardingScreen({ onComplete }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = useMemo(() => createStyles(colors, type), [colors, type]);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AppMode>("tourist");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => {
    const hasName = displayName.trim().length >= 2;
    const hasEmail = email.trim().includes("@") && email.trim().includes(".");
    const hasPassword = mode === "tourist" || password.trim().length >= 8;
    return hasName && hasEmail && hasPassword;
  }, [displayName, email, mode, password]);

  async function submit() {
    if (!canContinue) {
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await onComplete({
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      mode,
      ...(mode === "builder" ? { password: password.trim() } : {})
    });
    if (result) {
      setError(result);
    }
    setSubmitting(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Welcome</Text>
        <Text style={styles.title}>Set up your Founders Threads profile.</Text>
        <Text style={styles.subtitle}>Keep this lightweight. Choose a name, add your email, and enter the touring experience with two free preview stops in every tour pack.</Text>
        <View style={styles.heroChips}>
          <Chip label="Elegant city tours" tone="default" />
          <Chip label="Story-first stops" tone="success" />
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.label}>Experience</Text>
        <View style={styles.modeRow}>
          {(["tourist", "builder"] as AppMode[]).map((option) => {
            const selected = option === mode;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  setMode(option);
                  setError(null);
                }}
                style={[styles.modeChip, selected && styles.modeChipActive]}
              >
                <Text style={[styles.modeChipText, selected && styles.modeChipTextActive]}>
                  {option === "tourist" ? "Tourist" : "Builder"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Display name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Founder Name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {mode === "builder" ? (
          <>
            <Text style={styles.label}>Builder password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter builder password"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />
          </>
        ) : null}

        <Text style={styles.modeHint}>
          {mode === "builder"
            ? "Builder mode now requires a server-authenticated session."
            : "This sign-in opens the public tour experience on this device."}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      <Card style={styles.noteCard}>
        <Text style={styles.noteTitle}>What happens next</Text>
        <Text style={styles.noteCopy}>
          You’ll land in the main app shell with Home, Scavenger Hunt, and Profile ready. You can preview the first two stops in each tour for free, then unlock the rest if you want the full collection.
        </Text>
      </Card>

      <PrimaryButton
        label={submitting ? "Signing in..." : mode === "builder" ? "Enter Builder Mode" : "Enter App"}
        onPress={() => void submit()}
        disabled={!canContinue || submitting}
      />
    </ScrollView>
  );
}

function createStyles(
  colors: AppPalette,
  type: {
    font: (size: number) => number;
    line: (height: number) => number;
  }
) {
  return StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 18,
    justifyContent: "center",
    gap: 18
  },
  heroPanel: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  kicker: {
    color: colors.info,
    fontSize: type.font(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  title: {
    color: colors.text,
    fontSize: type.font(32),
    lineHeight: type.line(38),
    fontWeight: "800"
  },
  subtitle: {
    color: colors.textSoft,
    lineHeight: type.line(22),
    fontSize: type.font(15)
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  modeChip: {
    minWidth: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft
  },
  modeChipActive: {
    borderColor: "#007eff",
    backgroundColor: colors.infoSoft
  },
  modeChipText: {
    color: colors.textSoft,
    fontWeight: "700",
    textAlign: "center",
    fontSize: type.font(14)
  },
  modeChipTextActive: {
    color: colors.text
  },
  card: {
    gap: 10
  },
  label: {
    color: colors.text,
    fontSize: type.font(15),
    fontWeight: "700"
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 16,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 13
  },
  noteCard: {
    gap: 6
  },
  noteTitle: {
    color: colors.text,
    fontSize: type.font(16),
    fontWeight: "800"
  },
  noteCopy: {
    color: colors.textSoft,
    lineHeight: type.line(21),
    fontSize: type.font(14)
  },
  error: {
    color: colors.danger,
    lineHeight: type.line(20),
    fontSize: type.font(13)
  },
  modeHint: {
    color: colors.textSoft,
    lineHeight: type.line(20),
    fontSize: type.font(13)
  }
  });
}
