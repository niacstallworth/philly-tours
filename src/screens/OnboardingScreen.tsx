import { createClient } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CloudflareTurnstileChallenge } from "../components/auth/CloudflareTurnstileChallenge";
import {
  AuthenticatedSession,
  createOAuthAuthenticatedSession,
  type OAuthProvider
} from "../services/auth";
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
  onProviderComplete: (session: AuthenticatedSession) => Promise<void>;
};

function getNativeProviderRedirectUrl() {
  const configuredBridge = process.env.EXPO_PUBLIC_NATIVE_OAUTH_BRIDGE_URL?.trim();
  if (configuredBridge) {
    return configuredBridge.replace(/\/+$/, "");
  }
  const syncServerUrl = (process.env.EXPO_PUBLIC_SYNC_SERVER_URL || "https://api.philly-tours.com").trim();
  return `${syncServerUrl.replace(/\/+$/, "")}/auth/provider`;
}

function getNativeProviderReturnUrl() {
  const appScheme = (process.env.EXPO_PUBLIC_APP_SCHEME || "phillyartours").trim() || "phillyartours";
  return `${appScheme}://auth/provider`;
}

function getUrlParams(url: string) {
  const params = new URLSearchParams();
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");

  if (queryIndex >= 0) {
    const query = hashIndex >= 0 ? url.slice(queryIndex + 1, hashIndex) : url.slice(queryIndex + 1);
    new URLSearchParams(query).forEach((value, key) => {
      params.set(key, value);
    });
  }

  if (hashIndex >= 0) {
    new URLSearchParams(url.slice(hashIndex + 1)).forEach((value, key) => {
      params.set(key, value);
    });
  }

  return params;
}

async function waitForNativeProviderReturn(returnUrl: string, timeoutMs = 120000) {
  const normalizedReturnUrl = returnUrl.replace(/\/+$/, "");
  const initialUrl = await Linking.getInitialURL();
  if (initialUrl?.startsWith(normalizedReturnUrl)) {
    return initialUrl;
  }

  return new Promise<string | null>((resolve) => {
    let settled = false;
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (!url.startsWith(normalizedReturnUrl) || settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      subscription.remove();
      resolve(url);
    });

    const timeoutId = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      subscription.remove();
      resolve(null);
    }, timeoutMs);
  });
}

export function OnboardingScreen({ onComplete, onProviderComplete }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = useMemo(() => createStyles(colors, type), [colors, type]);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [providerSubmitting, setProviderSubmitting] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cloudflareSiteKey = process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY?.trim() || "";
  const requiresTurnstile = Platform.OS === "web" && !!cloudflareSiteKey;
  const isNativeProviderFlow = Platform.OS !== "web";

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

  async function submitNativeProvider(provider: OAuthProvider) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || "";
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Supabase Auth is not configured for native provider sign-in.");
      return;
    }

    setProviderSubmitting(provider);
    setError(null);

    try {
      const client = createClient(supabaseUrl.replace(/\/+$/, ""), supabaseAnonKey, {
        auth: {
          flowType: "implicit",
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      });

      const redirectTo = getNativeProviderRedirectUrl();
      const returnUrl = getNativeProviderReturnUrl();
      const { data, error: signInError } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true
        }
      });

      if (signInError) {
        throw signInError;
      }
      if (!data?.url) {
        throw new Error("Provider sign-in did not return a usable redirect URL.");
      }

      const providerReturnUrlPromise = waitForNativeProviderReturn(returnUrl);
      const result = await WebBrowser.openAuthSessionAsync(data.url, returnUrl);
      const callbackUrl =
        (result.type === "success" && result.url ? result.url : null) ||
        (await providerReturnUrlPromise);
      if (!callbackUrl) {
        throw new Error("Sign-in was cancelled before the provider could return to the app.");
      }

      const params = getUrlParams(callbackUrl);
      const returnedError = params.get("error_description") || params.get("error");
      if (returnedError) {
        throw new Error(returnedError);
      }

      let accessToken = params.get("access_token");
      if (!accessToken) {
        const authCode = params.get("code");
        if (!authCode) {
          throw new Error("Provider sign-in did not return a usable session.");
        }
        const { data: exchanged, error: exchangeError } = await client.auth.exchangeCodeForSession(authCode);
        if (exchangeError) {
          throw exchangeError;
        }
        accessToken = exchanged.session?.access_token || null;
      }

      if (!accessToken) {
        throw new Error("Provider sign-in did not return an access token.");
      }

      const nextSession = await createOAuthAuthenticatedSession({
        accessToken,
        provider
      });
      await onProviderComplete(nextSession);
    } catch (caughtError) {
      setError((caughtError as Error).message || "Unable to complete provider sign-in.");
    } finally {
      setProviderSubmitting(null);
    }
  }

  if (isNativeProviderFlow) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroPanel}>
          <Text style={styles.kicker}>Private access</Text>
          <Text style={styles.title}>Continue with Google or Apple.</Text>
          <Text style={styles.subtitle}>
            The Android app uses provider sign-in only. Your session returns to the app automatically after the secure provider check clears.
          </Text>
          <View style={styles.heroChips}>
            <Chip label="Google ready" tone="success" />
            <Chip label="Apple ready" tone="success" />
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={styles.label}>Waiver liability</Text>
          <Text style={styles.modeHint}>
            By entering or using Philly AR Tours, you acknowledge and agree that all tours, routes, scavenger hunts, AR features, maps,
            audio guidance, prompts, and device handoff tools are used at your own risk. Founders Threads, Philly AR Tours, and affiliated
            collaborators disclaim liability for injury, death, accident, property damage, theft, loss, or any claim arising from use or
            misuse of the app, its content, physical travel, navigation, or device interaction.
          </Text>
        </Card>

        <View style={styles.providerColumn}>
          <PrimaryButton
            label={providerSubmitting === "google" ? "Connecting Google..." : "Continue with Google"}
            onPress={() => void submitNativeProvider("google")}
            disabled={!!providerSubmitting}
          />
          <Pressable
            style={[styles.secondaryButton, providerSubmitting && styles.secondaryButtonDisabled]}
            onPress={() => void submitNativeProvider("apple")}
            disabled={!!providerSubmitting}
          >
            <Text style={styles.secondaryButtonText}>
              {providerSubmitting === "apple" ? "Connecting Apple..." : "Continue with Apple"}
            </Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    );
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
        <View style={styles.heroChips}>
          <Chip label="Tourist" tone="success" />
          <Chip label="Public experience" tone="default" />
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
          This sign-in opens the public tour experience on this device.
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
            ? "You’ll complete a Cloudflare security check, then land in the main app shell with Home, Scavenger Hunt, and Profile ready. You can preview the first two stops in each tour for free, then unlock the rest if you want the full collection."
            : "You’ll land in the main app shell with Home, Scavenger Hunt, and Profile ready. You can preview the first two stops in each tour for free, then unlock the rest if you want the full collection."}
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
    providerColumn: {
      gap: 12
    },
    secondaryButton: {
      minHeight: 54,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      paddingVertical: 14
    },
    secondaryButtonDisabled: {
      opacity: 0.5
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: type.font(15),
      fontWeight: "800",
      letterSpacing: 0.3
    }
  });
}
