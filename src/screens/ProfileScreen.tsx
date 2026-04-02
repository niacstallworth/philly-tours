import React, { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { useCompanionSession } from "../hooks/useCompanionSession";
import { connectCompanion, refreshCompanionStatus } from "../services/companion";
import type { WearableStatus } from "../services/wearables";
import {
  createCheckoutSession,
  getEntitlements,
  getSyncServerUrl,
  requestBackendDeletion
} from "../services/payments";
import { AppAppearanceMode, AppPalette, AppTextScale, useAppTheme, useTypeScale } from "../theme/appTheme";

type Props = {
  displayName?: string;
  email?: string;
  audioHistoryOnlyUnlocked?: boolean;
  fullAppUnlocked?: boolean;
  onRefreshEntitlements?: () => Promise<void>;
  onDeleteProfile?: () => void;
  onOpenCompanion?: () => void;
};

WebBrowser.maybeCompleteAuthSession();

export function ProfileScreen({
  displayName = "Founder Demo",
  email = "demo@local.app",
  audioHistoryOnlyUnlocked = false,
  fullAppUnlocked = false,
  onRefreshEntitlements,
  onDeleteProfile,
  onOpenCompanion
}: Props) {
  const { appearanceMode, setAppearanceMode, textScale, setTextScale, colors } = useAppTheme();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const { status: companionStatus, lastCommandResult } = useCompanionSession();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);
  const [entitlementStatus, setEntitlementStatus] = useState<string>("not_loaded");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionRequestedAt, setDeletionRequestedAt] = useState<number | null>(null);

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

  const canReconnectCompanion =
    companionStatus.supported &&
    companionStatus.pairedDevice != null &&
    companionStatus.connectionState !== "connected" &&
    companionStatus.connectionState !== "pairing";

  async function reconnectCompanionFromProfile() {
    setLoadingAction("companion-reconnect");
    setStatusMessage(null);
    try {
      const nextStatus = await connectCompanion();
      setStatusMessage(nextStatus.statusMessage ?? "Companion connected.");
    } catch (error) {
      setStatusMessage((error as Error).message || "Could not reconnect companion.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function refreshCompanionFromProfile() {
    setLoadingAction("companion-refresh");
    setStatusMessage(null);
    try {
      const nextStatus = await refreshCompanionStatus();
      setStatusMessage(nextStatus.statusMessage ?? nextStatus.lastError ?? "Companion status refreshed.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function refreshEntitlements(showAlert = true) {
    setLoadingAction("entitlements");
    setStatusMessage(null);
    try {
      const entitlements = await getEntitlements();
      const active =
        entitlements.find((entry) => entry.status === "active" && entry.plan_id === "full_app") ||
        entitlements.find((entry) => entry.status === "active" && entry.plan_id === "audio_history_only") ||
        entitlements.find((entry) => entry.status === "active");
      if (active?.plan_id) {
        setActivatedPlan(active.plan_id);
      } else {
        setActivatedPlan(null);
      }
      setEntitlementStatus(active ? `active:${active.plan_id}` : "none");
      await onRefreshEntitlements?.();
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

  async function startHostedCheckout(amount = 999, title = "Philly Tours Day Pass", planId?: string) {
    setLoadingAction("hosted");
    setStatusMessage(null);
    try {
      const session = await createCheckoutSession(amount, title, planId);
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
    Alert.alert("Delete profile?", "This clears your local profile and saved hunt progress on this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDeleteProfile?.()
      }
    ]);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>Profile</Text>
        <Text style={styles.heroTitle}>{displayName}</Text>
        <Text style={styles.heroCopy}>{email}</Text>
        <View style={styles.chips}>
          <Chip label="Tour mode" tone="default" />
          <Chip label={activatedPlan ? activatedPlan.toUpperCase() : "FREE"} tone={activatedPlan ? "success" : "warn"} />
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Text style={styles.copy}>Follow the device theme or choose a fixed look for this app.</Text>
        <View style={styles.appearanceRow}>
          {(["system", "light", "dark"] as AppAppearanceMode[]).map((option) => {
            const selected = option === appearanceMode;
            return (
              <Pressable
                key={option}
                onPress={() => void setAppearanceMode(option)}
                style={[styles.appearanceChip, selected && styles.appearanceChipActive]}
              >
                <Text style={[styles.appearanceChipText, selected && styles.appearanceChipTextActive]}>
                  {option === "system" ? "Use Device" : option === "light" ? "Light" : "Dark"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Text Size</Text>
        <Text style={styles.copy}>Choose a reading size that feels comfortable on this device.</Text>
        <View style={styles.appearanceRow}>
          {(["standard", "large", "xlarge"] as AppTextScale[]).map((option) => {
            const selected = option === textScale;
            return (
              <Pressable
                key={option}
                onPress={() => void setTextScale(option)}
                style={[styles.appearanceChip, selected && styles.appearanceChipActive]}
              >
                <Text style={[styles.appearanceChipText, selected && styles.appearanceChipTextActive]}>
                  {option === "standard" ? "Standard" : option === "large" ? "Large" : "Extra Large"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Meta Glasses Companion</Text>
        <Text style={styles.copy}>
          {getProfileCompanionCopy(companionStatus)}
        </Text>
        <View style={styles.chips}>
          <Chip
            label={companionStatus.connectionState === "connected" ? "Connected" : companionStatus.connectionState.replace(/_/g, " ")}
            tone={companionStatus.connectionState === "connected" ? "success" : companionStatus.connectionState === "error" ? "danger" : "warn"}
          />
          <Chip label={companionStatus.pairedDevice?.displayName || "No paired glasses"} tone="default" />
          <Chip label={getProfileIntegrationLabel(companionStatus)} tone={companionStatus.integrationMode === "none" ? "danger" : "success"} />
        </View>
        <Text style={styles.meta}>
          {companionStatus.statusMessage || companionStatus.lastError || "Open companion setup to manage glasses connection and status."}
        </Text>
        {canReconnectCompanion ? (
          <Text style={styles.meta}>{getProfileReconnectCopy(companionStatus)}</Text>
        ) : null}
        {lastCommandResult ? (
          <>
            <Text style={styles.meta}>
              Last command: {lastCommandResult.commandType} · {lastCommandResult.result.ok ? "ok" : "failed"}
            </Text>
            <Text style={styles.meta}>{lastCommandResult.result.message}</Text>
          </>
        ) : null}
        {canReconnectCompanion ? (
          <PrimaryButton
            onPress={() => void reconnectCompanionFromProfile()}
            disabled={loadingAction !== null}
            label={loadingAction === "companion-reconnect" ? "Reconnecting..." : getProfileReconnectLabel(companionStatus)}
          />
        ) : null}
        <PrimaryButton
          onPress={() => void refreshCompanionFromProfile()}
          disabled={loadingAction !== null}
          label={loadingAction === "companion-refresh" ? "Refreshing..." : "Refresh Companion Status"}
        />
        <PrimaryButton onPress={onOpenCompanion || (() => undefined)} disabled={!onOpenCompanion} label="Open Companion Setup" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Membership</Text>
        <Text style={styles.copy}>
          Unlock premium tours and full audio history with one membership.
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
        <Text style={styles.meta}>Full audio history is included with membership.</Text>
        <Text style={styles.meta}>Status: {entitlementStatus}</Text>
        {statusMessage ? <Text style={styles.warning}>{statusMessage}</Text> : null}
        <PrimaryButton
          disabled={loadingAction !== null || fullAppUnlocked}
          onPress={() => startHostedCheckout(999, "Philly Tours Day Pass", "full_app")}
          label={fullAppUnlocked ? "Full Membership Unlocked" : loadingAction === "hosted" ? "Preparing..." : "Checkout ($9.99)"}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Device Profile</Text>
        <Text style={styles.copy}>Delete the local profile on this phone and return to onboarding. This does not cancel purchases already recorded on the backend.</Text>
        <PrimaryButton onPress={confirmDeleteProfile} label="Delete Profile On This Device" />
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

    </ScrollView>
  );
}

function getProfileIntegrationLabel(status: WearableStatus) {
  if (status.integrationMode === "native") {
    return "Native DAT";
  }

  if (status.integrationMode === "manual") {
    return "Bluetooth audio mode";
  }

  return "Unavailable";
}

function getProfileCompanionCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "Pair Meta glasses over Bluetooth to route narration and use phone-based tour controls.";
  }

  if (status.integrationMode === "native") {
    return "Pair Meta glasses, confirm registration, and check camera access.";
  }

  return "Meta glasses controls are not available on this device yet.";
}

function getProfileReconnectCopy(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "A remembered Meta glasses audio route is available. Restore it to keep narration on the paired Bluetooth glasses.";
  }

  return "A remembered Meta device is available. Reconnect to restore companion access.";
}

function getProfileReconnectLabel(status: WearableStatus) {
  if (status.integrationMode === "manual") {
    return "Restore Meta Glasses Audio Mode";
  }

  return "Reconnect Meta Glasses";
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
    padding: 18,
    gap: 18,
    backgroundColor: colors.background
  },
  heroPanel: {
    backgroundColor: colors.headerBackground,
    borderRadius: 32,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 4
  },
  heroEyebrow: {
    color: colors.warn,
    fontSize: type.font(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  heroTitle: {
    color: colors.text,
    fontSize: type.font(30),
    lineHeight: type.line(36),
    fontWeight: "800"
  },
  heroCopy: {
    color: colors.textSoft,
    lineHeight: type.line(21)
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    gap: 12,
    backgroundColor: colors.surfaceRaised
  },
  sectionTitle: {
    color: colors.text,
    fontSize: type.font(18),
    fontWeight: "800"
  },
  copy: {
    color: colors.textSoft,
    lineHeight: type.line(21)
  },
  meta: {
    color: colors.textMuted,
    lineHeight: type.line(20)
  },
  warning: {
    color: colors.danger,
    lineHeight: type.line(22)
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
  appearanceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  appearanceChip: {
    minWidth: 94,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft
  },
  appearanceChipActive: {
    borderColor: "#7d63ff",
    backgroundColor: "rgba(91, 56, 245, 0.18)"
  },
  appearanceChipText: {
    color: colors.textSoft,
    fontWeight: "700",
    textAlign: "center",
    fontSize: type.font(14)
  },
  appearanceChipTextActive: {
    color: "#cfc3ff"
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
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  adminRequestTitle: {
    color: colors.text,
    fontSize: type.font(16),
    fontWeight: "800"
  },
  themePresetGrid: {
    gap: 10
  },
  themePresetCard: {
    gap: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  themePresetCardActive: {
    borderColor: colors.borderStrong
  },
  themePresetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  themeSwatch: {
    width: 18,
    height: 18,
    borderRadius: 999
  },
  themePresetTitle: {
    color: colors.text,
    fontSize: type.font(15),
    fontWeight: "800"
  },
  themePresetStatus: {
    color: colors.textMuted,
    fontWeight: "700"
  },
  themePresetStatusActive: {
    color: colors.success
  },
  themePreviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  themePreviewItem: {
    minWidth: 72,
    gap: 6
  },
  themePreviewSwatch: {
    width: "100%",
    height: 10,
    borderRadius: 999
  },
  themePreviewLabel: {
    color: colors.textMuted,
    fontSize: type.font(12),
    fontWeight: "700"
  }
  });
}
