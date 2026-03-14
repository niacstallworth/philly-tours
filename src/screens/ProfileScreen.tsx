import React, { useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import {
  createCheckoutSession,
  DeletionRequestRecord,
  fulfillDeletionRequest,
  getEntitlements,
  getSyncServerUrl,
  listDeletionRequests,
  requestBackendDeletion
} from "../services/payments";

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionRequestedAt, setDeletionRequestedAt] = useState<number | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [adminRequests, setAdminRequests] = useState<DeletionRequestRecord[]>([]);

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

  async function submitDeletionRequest() {
    if (entitlementStatus === "offline") {
      setStatusMessage(`Sync server unreachable at ${getSyncServerUrl()}. Start the backend to submit a deletion request.`);
      return;
    }
    setLoadingAction("deletion-request");
    setStatusMessage(null);
    try {
      const result = await requestBackendDeletion({
        email,
        displayName,
        reason: deletionReason.trim() || undefined
      });
      setDeletionRequestedAt(result.requestedAt);
      setDeletionReason("");
      setStatusMessage("Deletion request recorded. An admin still needs to purge your backend records.");
    } catch (error) {
      setStatusMessage((error as Error).message || "Could not submit deletion request.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function refreshAdminDeletionRequests() {
    if (!adminKey.trim()) {
      setStatusMessage("Enter ADMIN_API_KEY to review deletion requests.");
      return;
    }
    setLoadingAction("admin-requests");
    setStatusMessage(null);
    try {
      const requests = await listDeletionRequests(adminKey.trim(), email || displayName || "builder");
      setAdminRequests(requests);
    } catch (error) {
      setStatusMessage((error as Error).message || "Could not load deletion requests.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function fulfillDeletionRequestFromQueue(requestId: number) {
    if (!adminKey.trim()) {
      setStatusMessage("Enter ADMIN_API_KEY before fulfilling deletion requests.");
      return;
    }
    setLoadingAction(`fulfill:${requestId}`);
    setStatusMessage(null);
    try {
      await fulfillDeletionRequest(requestId, adminKey.trim(), email || displayName || "builder");
      setStatusMessage(`Deletion request ${requestId} fulfilled. Backend records were purged.`);
      const requests = await listDeletionRequests(adminKey.trim(), email || displayName || "builder");
      setAdminRequests(requests);
    } catch (error) {
      setStatusMessage((error as Error).message || "Could not fulfill deletion request.");
    } finally {
      setLoadingAction(null);
    }
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
        <Text style={styles.sectionTitle}>Privacy Request</Text>
        <Text style={styles.copy}>Request backend deletion of your membership, purchase, and receipt records. An admin must fulfill the request before backend data is purged.</Text>
        <TextInput
          value={deletionReason}
          onChangeText={setDeletionReason}
          placeholder="Reason for deletion request (optional)"
          placeholderTextColor="#8e7d99"
          style={[styles.input, styles.multilineInput]}
          multiline
        />
        {deletionRequestedAt ? <Text style={styles.meta}>Latest request: {new Date(deletionRequestedAt).toLocaleString()}</Text> : null}
        <PrimaryButton
          disabled={loadingAction !== null || entitlementStatus === "offline"}
          onPress={submitDeletionRequest}
          label={
            entitlementStatus === "offline"
              ? "Backend Offline"
              : loadingAction === "deletion-request"
                ? "Submitting..."
                : "Request Backend Data Deletion"
          }
        />
      </Card>

      {mode === "builder" ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Deletion Queue</Text>
          <Text style={styles.copy}>Internal only. Review requested deletions and purge backend records after user confirmation.</Text>
          <TextInput
            value={adminKey}
            onChangeText={setAdminKey}
            placeholder="ADMIN_API_KEY"
            placeholderTextColor="#8e7d99"
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />
          <PrimaryButton
            disabled={loadingAction !== null}
            onPress={refreshAdminDeletionRequests}
            label={loadingAction === "admin-requests" ? "Loading..." : "Load Deletion Requests"}
          />
          {adminRequests.length === 0 ? (
            <Text style={styles.meta}>No loaded deletion requests yet.</Text>
          ) : (
            <View style={styles.adminQueue}>
              {adminRequests.map((request) => (
                <View key={request.id} style={styles.adminRequestRow}>
                  <Text style={styles.adminRequestTitle}>{request.display_name || request.email || request.user_id}</Text>
                  <Text style={styles.meta}>User: {request.user_id}</Text>
                  <Text style={styles.meta}>Status: {request.status}</Text>
                  {request.reason ? <Text style={styles.copy}>Reason: {request.reason}</Text> : null}
                  <Text style={styles.meta}>Requested: {new Date(request.requested_at).toLocaleString()}</Text>
                  {request.status === "fulfilled" ? (
                    <Text style={styles.meta}>
                      Fulfilled by {request.resolved_by || "admin"}
                      {request.resolved_at ? ` on ${new Date(request.resolved_at).toLocaleString()}` : ""}
                    </Text>
                  ) : (
                    <PrimaryButton
                      disabled={loadingAction !== null}
                      onPress={() => fulfillDeletionRequestFromQueue(request.id)}
                      label={loadingAction === `fulfill:${request.id}` ? "Purging..." : "Fulfill & Purge User Data"}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </Card>
      ) : null}
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
  },
  input: {
    backgroundColor: "#1b102d",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 16,
    color: "#fff3ea",
    paddingHorizontal: 12,
    paddingVertical: 13
  },
  multilineInput: {
    minHeight: 92,
    textAlignVertical: "top"
  },
  adminQueue: {
    gap: 12
  },
  adminRequestRow: {
    gap: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#1a102e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)"
  },
  adminRequestTitle: {
    color: "#fff0e4",
    fontSize: 16,
    fontWeight: "800"
  }
});
