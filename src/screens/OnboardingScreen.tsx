import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CloudflareTurnstileChallenge } from "../components/auth/CloudflareTurnstileChallenge";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { AppPalette, useThemeColors, useTypeScale } from "../theme/appTheme";

WebBrowser.maybeCompleteAuthSession();

export type AppMode = "tourist";

export type OnboardingPayload = {
  displayName: string;
  email: string;
  mode: AppMode;
  turnstileToken?: string;
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cloudflareSiteKey = process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY?.trim() || "";
  const requiresTurnstile = Platform.OS === "web" && !!cloudflareSiteKey;

  const canContinue = useMemo(() => {
    const hasName = displayName.trim().length >= 2;
    const hasEmail = email.trim().includes("@") && email.trim().includes(".");
    const passesChallenge = !requiresTurnstile || !!turnstileToken;
    return hasName && hasEmail && passesChallenge;
  }, [displayName, email, requiresTurnstile, turnstileToken]);

  async function submit() {
    if (!canContinue) {
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await onComplete({
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      mode: "tourist",
      turnstileToken: turnstileToken || undefined
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
        <Text style={styles.title}>Set up your Philly Tours profile.</Text>
        <Text style={styles.subtitle}>Choose a name, add your email, and continue into the app.</Text>
        <View style={styles.heroChips}>
          <Chip label="Elegant city tours" tone="default" />
          <Chip label="Story-first stops" tone="success" />
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.label}>Experience</Text>
        <View style={styles.heroChips}>
          <Chip label="Tourist" tone="success" />
          <Chip label="Tour access" tone="default" />
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

        <Text style={styles.modeHint}>
          This device profile gets you into the app on this device.
        </Text>
        {requiresTurnstile ? (
          <CloudflareTurnstileChallenge siteKey={cloudflareSiteKey} onTokenChange={setTurnstileToken} />
        ) : (
          <Text style={styles.modeHint}>
            Cloudflare Turnstile is not configured yet for this build, so secure challenge mode is currently bypassed.
          </Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      <Card style={styles.noteCard}>
        <Text style={styles.noteTitle}>What happens next</Text>
        <Text style={styles.noteCopy}>
          {requiresTurnstile
            ? "Complete the security check, then continue into the app."
            : "Continue into the app."}
        </Text>
      </Card>

      <PrimaryButton
        label={submitting ? "Signing in..." : "Enter App"}
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
    },
  });
}
