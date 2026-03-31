import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { MainTabs } from "./src/navigation/MainTabs";
import { createAuthenticatedSession, setAuthToken, validateAuthenticatedSession } from "./src/services/auth";
import { AppMode, OnboardingPayload, OnboardingScreen } from "./src/screens/OnboardingScreen";
import { HandoffTarget, parseHandoffUrl } from "./src/services/deepLinks";
import { subscribeToHandoffTarget } from "./src/services/handoffBus";
import { getEntitlements, setApiUserId } from "./src/services/payments";
import { clearSession, loadSession, saveSession } from "./src/services/session";
import { AppThemeProvider, ThemeSurfaceProvider, useAppTheme, useTypeScale } from "./src/theme/appTheme";

type AppSession = {
  displayName: string;
  email: string;
  mode: AppMode;
  userId: string;
  roles?: string[];
  authToken?: string | null;
  authExpiresAt?: number | null;
};

export default function App() {
  const isExpoGo = Constants.appOwnership === "expo";
  const publishableKey =
    ((globalThis as any)?.process?.env?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY as string | undefined) ||
    "";
  const [session, setSession] = useState<AppSession | null>(null);
  const [booting, setBooting] = useState(true);
  const [handoffTarget, setHandoffTarget] = useState<HandoffTarget | null>(null);
  const [audioHistoryOnlyUnlocked, setAudioHistoryOnlyUnlocked] = useState(false);
  const [fullAppUnlocked, setFullAppUnlocked] = useState(false);

  async function refreshEntitlements() {
    if (!session) {
      setAudioHistoryOnlyUnlocked(false);
      setFullAppUnlocked(false);
      return;
    }
    try {
      const entitlements = await getEntitlements();
      setAudioHistoryOnlyUnlocked(
        entitlements.some((entry) => entry.status === "active" && entry.plan_id === "audio_history_only")
      );
      setFullAppUnlocked(
        entitlements.some((entry) => entry.status === "active" && entry.plan_id !== "audio_history_only")
      );
    } catch {
      setAudioHistoryOnlyUnlocked(false);
      setFullAppUnlocked(false);
    }
  }

  useEffect(() => {
    loadSession()
      .then((stored) => {
        if (!stored) {
          return;
        }
        if (stored.mode !== "tourist") {
          setAuthToken(null);
          setApiUserId("demo-user");
          return clearSession();
        }
        setApiUserId(stored.userId);
        setAuthToken(stored.authToken);
        if (!stored.authToken) {
          return createAuthenticatedSession({
            displayName: stored.displayName,
            email: stored.email,
            mode: "tourist"
          })
            .then((nextSession) => {
              setAuthToken(nextSession.authToken);
              setApiUserId(nextSession.userId);
              setSession(nextSession);
              return saveSession(nextSession);
            })
            .catch(() => {
              setAuthToken(null);
              setApiUserId("demo-user");
              return clearSession();
            });
        }
        return validateAuthenticatedSession(stored.authToken)
          .then((validated) => {
            setApiUserId(validated.userId);
            setAuthToken(validated.authToken);
            setSession(validated);
            return saveSession(validated);
          })
          .catch(() => {
            setAuthToken(null);
            setApiUserId("demo-user");
            return clearSession();
          });
      })
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    refreshEntitlements().catch(() => undefined);
  }, [session?.userId]);

  useEffect(() => {
    async function hydrateInitialLink() {
      const initialUrl = await Linking.getInitialURL();
      if (!initialUrl) {
        return;
      }
      const parsed = parseHandoffUrl(initialUrl);
      if (parsed) {
        setHandoffTarget(parsed);
      }
    }

    hydrateInitialLink().catch(() => undefined);
    const linkSubscription = Linking.addEventListener("url", ({ url }) => {
      const parsed = parseHandoffUrl(url);
      if (parsed) {
        setHandoffTarget(parsed);
      }
      if (url.includes("checkout/")) {
        refreshEntitlements().catch(() => undefined);
      }
    });
    const handoffSubscription = subscribeToHandoffTarget((target) => {
      if (target) {
        setHandoffTarget(target);
      }
    });
    return () => {
      linkSubscription.remove();
      handoffSubscription();
    };
  }, []);

  async function completeOnboarding(payload: OnboardingPayload) {
    try {
      const nextSession = await createAuthenticatedSession(payload);
      setAuthToken(nextSession.authToken);
      setApiUserId(nextSession.userId);
      setSession(nextSession);
      await saveSession(nextSession);
      return null;
    } catch (error) {
      return (error as Error).message || "Unable to sign in.";
    }
  }

  function signOut() {
    setSession(null);
    setAuthToken(null);
    setApiUserId("demo-user");
    clearSession().catch(() => undefined);
  }

  function deleteProfile() {
    setSession(null);
    setHandoffTarget(null);
    setAuthToken(null);
    setApiUserId("demo-user");
    clearSession().catch(() => undefined);
  }

  const appBody = (
    <AppThemeProvider>
      <AppShell
        booting={booting}
        session={session}
        handoffTarget={handoffTarget}
        audioHistoryOnlyUnlocked={audioHistoryOnlyUnlocked}
        fullAppUnlocked={fullAppUnlocked}
        onRefreshEntitlements={refreshEntitlements}
        onComplete={completeOnboarding}
        onDeleteProfile={deleteProfile}
        onSignOut={signOut}
      />
    </AppThemeProvider>
  );

  if (isExpoGo || Platform.OS === "web") {
    return appBody;
  }

  const { StripeProvider } = require("@stripe/stripe-react-native") as typeof import("@stripe/stripe-react-native");
  return (
    <StripeProvider publishableKey={publishableKey} merchantIdentifier="merchant.com.founders.phillyartours">
      {appBody}
    </StripeProvider>
  );
}

type AppShellProps = {
  booting: boolean;
  session: AppSession | null;
  handoffTarget: HandoffTarget | null;
  audioHistoryOnlyUnlocked: boolean;
  fullAppUnlocked: boolean;
  onRefreshEntitlements: () => Promise<void>;
  onComplete: (payload: OnboardingPayload) => Promise<string | null>;
  onDeleteProfile: () => void;
  onSignOut: () => void;
};

function AppShell({ booting, session, handoffTarget, audioHistoryOnlyUnlocked, fullAppUnlocked, onRefreshEntitlements, onComplete, onDeleteProfile, onSignOut }: AppShellProps) {
  const { colors, resolvedAppearanceMode } = useAppTheme();
  const type = useTypeScale();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.headerBackground }]}>
      <StatusBar barStyle={resolvedAppearanceMode === "light" ? "dark-content" : "light-content"} />
      {booting ? (
        <View style={styles.boot}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={[styles.bootText, { color: colors.textSoft, fontSize: type.font(15) }]}>Loading profile...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {session && (
            <View style={[styles.header, { borderBottomColor: colors.headerBorder, backgroundColor: colors.headerBackground }]}>
              <View>
                <Text style={[styles.headerName, { color: colors.text, fontSize: type.font(16) }]}>{session.displayName}</Text>
                <Text style={[styles.headerMeta, { color: colors.textMuted, fontSize: type.font(12) }]}>Tourist Mode</Text>
              </View>
              <Pressable style={[styles.signOutButton, { borderColor: colors.borderStrong }]} onPress={onSignOut}>
                <Text style={[styles.signOutText, { color: colors.textSoft, fontSize: type.font(12) }]}>Sign Out</Text>
              </Pressable>
            </View>
          )}
          {!session ? (
            <ThemeSurfaceProvider surface="login">
              <OnboardingScreen onComplete={onComplete} />
            </ThemeSurfaceProvider>
          ) : (
            <MainTabs
              session={session}
              handoffTarget={handoffTarget}
              audioHistoryOnlyUnlocked={audioHistoryOnlyUnlocked}
              fullAppUnlocked={fullAppUnlocked}
              onRefreshEntitlements={onRefreshEntitlements}
              onDeleteProfile={onDeleteProfile}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  boot: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  bootText: { color: "#cbd5e1", fontWeight: "600" },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    backgroundColor: "#020617",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerName: { color: "#f8fafc", fontWeight: "800", fontSize: 16 },
  headerMeta: { color: "#94a3b8", fontSize: 12 },
  signOutButton: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  signOutText: { color: "#e2e8f0", fontWeight: "700", fontSize: 12 },
  content: { flex: 1 }
});
