import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { MainTabs } from "./src/navigation/MainTabs";
import { AppMode, OnboardingPayload, OnboardingScreen } from "./src/screens/OnboardingScreen";
import { HandoffTarget, parseHandoffUrl } from "./src/services/deepLinks";
import { setApiUserId } from "./src/services/payments";
import { clearSession, loadSession, saveSession } from "./src/services/session";

type AppSession = {
  displayName: string;
  email: string;
  mode: AppMode;
  userId: string;
};

function toUserId(email: string) {
  return email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "demo-user";
}

export default function App() {
  const isExpoGo = Constants.appOwnership === "expo";
  const publishableKey =
    ((globalThis as any)?.process?.env?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY as string | undefined) ||
    "";
  const [session, setSession] = useState<AppSession | null>(null);
  const [booting, setBooting] = useState(true);
  const [handoffTarget, setHandoffTarget] = useState<HandoffTarget | null>(null);

  useEffect(() => {
    loadSession()
      .then((stored) => {
        if (!stored) {
          return;
        }
        setApiUserId(stored.userId);
        setSession(stored);
      })
      .finally(() => setBooting(false));
  }, []);

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
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const parsed = parseHandoffUrl(url);
      if (parsed) {
        setHandoffTarget(parsed);
      }
    });
    return () => subscription.remove();
  }, []);

  function completeOnboarding(payload: OnboardingPayload) {
    const userId = toUserId(payload.email);
    const nextSession = { ...payload, userId };
    setApiUserId(userId);
    setSession(nextSession);
    saveSession(nextSession).catch(() => undefined);
  }

  function signOut() {
    setSession(null);
    setApiUserId("demo-user");
    clearSession().catch(() => undefined);
  }

  const appBody = (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      {booting ? (
        <View style={styles.boot}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.bootText}>Loading profile...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {session && (
            <View style={styles.header}>
              <View>
                <Text style={styles.headerName}>{session.displayName}</Text>
                <Text style={styles.headerMeta}>{session.mode === "builder" ? "Builder Mode" : "Tourist Mode"}</Text>
              </View>
              <Pressable style={styles.signOutButton} onPress={signOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </Pressable>
            </View>
          )}
          {!session ? (
            <OnboardingScreen onComplete={completeOnboarding} />
          ) : (
            <MainTabs session={session} handoffTarget={handoffTarget} />
          )}
        </View>
      )}
    </SafeAreaView>
  );

  if (isExpoGo) {
    return appBody;
  }

  const { StripeProvider } = require("@stripe/stripe-react-native") as typeof import("@stripe/stripe-react-native");
  return (
    <StripeProvider publishableKey={publishableKey} merchantIdentifier="merchant.com.founders.phillyartours">
      {appBody}
    </StripeProvider>
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
