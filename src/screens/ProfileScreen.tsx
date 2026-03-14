import React, { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { createCheckoutSession, getEntitlements, getSyncServerUrl } from "../services/payments";

type Props = {
  displayName?: string;
  email?: string;
  mode?: "tourist" | "builder";
  onDeleteProfile?: () => void;
};

WebBrowser.maybeCompleteAuthSession();

export function ProfileScreen({
  displayName = "Founder Demo",
  email = "demo@local.app",
  mode = "builder",
  onDeleteProfile
}: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);
  const [entitlementStatus, setEntitlementStatus] = useState<string>("not_loaded");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
    setStatusMessage(null);
    try {
      const entitlements = await getEntitlements();
      const active = entitlements.find((entry) => entry.status === "active");
      if (active?.plan_id) {
        setActivatedPlan(active.plan_id);
      }
      setEntitlementStatus(active ? `active:${active.plan_id}` : "none");
    } catch (error) {
      setEntitlementStatus("offline");
      setStatusMessage((error as Error).message || "Could not load membership status.");
      if (showAlert) {
        return;
      }
    } finally {
      setLoadingAction(null);
    }
  }

  async function startHostedCheckout(amount = 999, title = "Philly Tours Day Pass") {
    if (entitlementStatus === "offline") {
      setStatusMessage(`Sync server unreachable at ${getSyncServerUrl()}. Start the backend to use checkout.`);
      return;
    }
    setLoadingAction("hosted");
    setStatusMessage(null);
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
      setStatusMessage((error as Error).message || "Please try again.");
    } finally {
      setLoadingAction(null);
    }
  }

  function confirmDeleteProfile() {
    Alert.alert("Delete profile?", "This clears your local profile and active drive session on this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDeleteProfile?.()
      }
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        <View style={styles.chips}>
          <Chip label={activatedPlan ? activatedPlan.toUpperCase() : "FREE"} tone={activatedPlan ? "success" : "warn"} />
          <Chip
            label={
              entitlementStatus === "offline"
                ? "Backend offline"
                : entitlementStatus.startsWith("active:")
                  ? "Membership active"
                  : "No active membership"
            }
            tone={entitlementStatus === "offline" ? "danger" : entitlementStatus.startsWith("active:") ? "success" : "default"}
          />
        </View>
        <Text style={styles.meta}>Status: {entitlementStatus}</Text>
        {statusMessage ? <Text style={styles.warning}>{statusMessage}</Text> : null}
        <PrimaryButton
          disabled={loadingAction !== null || entitlementStatus === "offline"}
          onPress={() => startHostedCheckout(999, "Philly Tours Day Pass")}
          label={entitlementStatus === "offline" ? "Backend Offline" : loadingAction === "hosted" ? "Preparing..." : "Open Hosted Checkout ($9.99)"}
        />
        <PrimaryButton
          disabled={loadingAction !== null}
          onPress={() => refreshEntitlements(true)}
          label={loadingAction === "entitlements" ? "Refreshing..." : "Refresh Membership"}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Billing Surface</Text>
        <Text style={styles.copy}>Hosted checkout keeps the phone app cleaner than embedding a heavy storefront in the touring flow.</Text>
        <Text style={styles.meta}>Sync server: {getSyncServerUrl()}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <Text style={styles.copy}>Saved badges, completed tours, and personalized collections will live here once the public experience is locked.</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Device Profile</Text>
        <Text style={styles.copy}>Delete the local profile on this phone and return to onboarding. This does not cancel purchases already recorded on the backend.</Text>
        <PrimaryButton onPress={confirmDeleteProfile} label="Delete Profile On This Device" />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 18,
    gap: 18,
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
    lineHeight: 36,
    fontWeight: "800"
  },
  heroCopy: {
    color: "#d8c7df",
    lineHeight: 21
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    backgroundColor: "#120a22",
    gap: 12
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
    color: "#b69fbe",
    lineHeight: 20
  },
  warning: {
    color: "#ffc2d0",
    lineHeight: 22
  }
});
