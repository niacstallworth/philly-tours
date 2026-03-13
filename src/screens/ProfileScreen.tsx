import React, { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { createCheckoutSession, getEntitlements } from "../services/payments";

type Props = {
  displayName?: string;
  email?: string;
  mode?: "tourist" | "builder";
};

WebBrowser.maybeCompleteAuthSession();

export function ProfileScreen({ displayName = "Founder Demo", email = "demo@local.app", mode = "builder" }: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);
  const [entitlementStatus, setEntitlementStatus] = useState<string>("not_loaded");

  React.useEffect(() => {
    refreshEntitlements(false).catch(() => undefined);
  }, []);

  React.useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("checkout/")) {
        refreshEntitlements(false).catch(() => undefined);
      }
    });
    return () => sub.remove();
  }, []);

  async function refreshEntitlements(showAlert = true) {
    setLoadingAction("entitlements");
    try {
      const entitlements = await getEntitlements();
      const active = entitlements.find((entry) => entry.status === "active");
      if (active?.plan_id) {
        setActivatedPlan(active.plan_id);
      }
      setEntitlementStatus(active ? `active:${active.plan_id}` : "none");
    } catch (error) {
      setEntitlementStatus("offline");
      if (showAlert) {
        Alert.alert("Membership unavailable", (error as Error).message || "Could not load membership status.");
      }
    } finally {
      setLoadingAction(null);
    }
  }

  async function startHostedCheckout(amount = 999, title = "Philly Tours Day Pass") {
    setLoadingAction("hosted");
    try {
      const session = await createCheckoutSession(amount, title);
      if (!session.url) {
        throw new Error("Stripe Checkout URL was not returned.");
      }
      const result = await WebBrowser.openAuthSessionAsync(session.url, "phillyartours://checkout/success");
      if (result.type === "success" || result.type === "dismiss" || result.type === "cancel") {
        refreshEntitlements(false).catch(() => undefined);
      }
    } catch (error) {
      Alert.alert("Checkout failed", (error as Error).message || "Please try again.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>Profile</Text>
        <Text style={styles.heroTitle}>{displayName}</Text>
        <Text style={styles.heroCopy}>{email}</Text>
        <View style={styles.chips}>
          <Chip label={mode === "builder" ? "Creator mode" : "Tour mode"} tone="default" />
          <Chip label={activatedPlan ? activatedPlan.toUpperCase() : "FREE"} tone={activatedPlan ? "success" : "warn"} />
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Membership</Text>
        <Text style={styles.copy}>
          Unlock premium tours and future spatial upgrades with a simple pass instead of cluttering the app with store mechanics.
        </Text>
        <Text style={styles.meta}>Status: {entitlementStatus}</Text>
        <PrimaryButton
          disabled={loadingAction !== null}
          onPress={() => startHostedCheckout(999, "Philly Tours Day Pass")}
          label={loadingAction === "hosted" ? "Preparing..." : "Open Hosted Checkout ($9.99)"}
        />
        <PrimaryButton
          disabled={loadingAction !== null}
          onPress={() => refreshEntitlements(true)}
          label={loadingAction === "entitlements" ? "Refreshing..." : "Refresh Membership"}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <Text style={styles.copy}>Saved badges, completed tours, and personalized collections will live here once the public experience is locked.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    gap: 16,
    backgroundColor: "#060312"
  },
  heroPanel: {
    backgroundColor: "#130a25",
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 173, 0.16)"
  },
  heroEyebrow: {
    color: "#ff9ab2",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  heroTitle: {
    color: "#fff3ea",
    fontSize: 30,
    fontWeight: "800"
  },
  heroCopy: {
    color: "#d8c7df"
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    backgroundColor: "#120a22"
  },
  sectionTitle: {
    color: "#fff0e4",
    fontSize: 18,
    fontWeight: "800"
  },
  copy: {
    color: "#d8c7df",
    lineHeight: 21
  },
  meta: {
    color: "#b69fbe"
  }
});
