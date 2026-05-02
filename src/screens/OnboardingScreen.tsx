import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CloudflareTurnstileChallenge } from "../components/auth/CloudflareTurnstileChallenge";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { AppPalette, headingFontFamily, useThemeColors, useTypeScale } from "../theme/appTheme";

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
  const requiresTurnstile = !!cloudflareSiteKey;

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
        <View style={styles.heroGlowPrimary} />
        <View style={styles.heroGlowSecondary} />
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
        ) : Platform.OS === "web" ? (
          <Text style={styles.modeHint}>
            Cloudflare Turnstile is not configured for this build. Secure sign-in may fail until the site key is restored.
          </Text>
        ) : null}
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
      position: "relative",
      overflow: "hidden",
      backgroundColor: colors.headerBackground,
      borderRadius: 30,
      padding: 24,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 4
    },
    heroGlowPrimary: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor: "rgba(92,61,244,0.16)",
      top: -94,
      right: -66
    },
    heroGlowSecondary: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 999,
      backgroundColor: "rgba(239,201,108,0.16)",
      bottom: -84,
      left: -54
    },
    kicker: {
      color: colors.olive,
      fontSize: type.font(12),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2
    },
    title: {
      color: colors.text,
      fontSize: type.font(32),
      lineHeight: type.line(38),
      fontWeight: "800",
      fontFamily: headingFontFamily
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
      borderRadius: 18,
      color: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 15
    },
    noteCard: {
      gap: 6
    },
    noteTitle: {
      color: colors.text,
      fontSize: type.font(16),
      fontWeight: "800",
      fontFamily: headingFontFamily
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
