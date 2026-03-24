import React, { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
import { AppAppearanceMode, AppPalette, AppTextScale, THEME_SURFACE_LABELS, useAppTheme, useTypeScale } from "../theme/appTheme";

type Props = {
  displayName?: string;
  email?: string;
  mode?: "tourist" | "builder";
  audioHistoryOnlyUnlocked?: boolean;
  fullAppUnlocked?: boolean;
  onRefreshEntitlements?: () => Promise<void>;
  onDeleteProfile?: () => void;
};

WebBrowser.maybeCompleteAuthSession();

export function ProfileScreen({
  displayName = "Founder Demo",
  email = "demo@local.app",
  mode = "builder",
  audioHistoryOnlyUnlocked = false,
  fullAppUnlocked = false,
  onRefreshEntitlements,
  onDeleteProfile
}: Props) {
  const { activePreset, presets, setPreset, settings, appearanceMode, setAppearanceMode, textScale, setTextScale, colors } = useAppTheme();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);
  const [entitlementStatus, setEntitlementStatus] = useState<string>("not_loaded");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionRequestedAt, setDeletionRequestedAt] = useState<number | null>(null);
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

  async function refreshAdminDeletionRequests() {
    setLoadingAction("admin-requests");
    setStatusMessage(null);
    try {
      const requests = await listDeletionRequests();
      setAdminRequests(requests);
    } catch (error) {
      setStatusMessage((error as Error).message || "Could not load deletion requests.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function fulfillDeletionRequestFromQueue(requestId: number) {
    setLoadingAction(`fulfill:${requestId}`);
    setStatusMessage(null);
    try {
      await fulfillDeletionRequest(requestId);
      setStatusMessage(`Deletion request ${requestId} fulfilled. Backend records were purged.`);
      const requests = await listDeletionRequests();
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

      {mode === "builder" ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Text style={styles.copy}>Choose whether the app follows the device setting or stays manually light or dark.</Text>
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
      ) : (
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
      )}

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

      {mode === "builder" ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Theme Studio</Text>
          <Text style={styles.copy}>
            Builder only. This sets the shared button palette across the app now, while the page-by-page color map is ready for the next tuning pass.
          </Text>
          <View style={styles.chips}>
            <Chip label={`Current ${activePreset.label}`} tone="success" />
          </View>
          <View style={styles.themePresetGrid}>
            {presets.map((preset) => {
              const selected = preset.id === activePreset.id;
              return (
                <Pressable
                  key={preset.id}
                  onPress={() => void setPreset(preset.id)}
                  style={[styles.themePresetCard, selected && styles.themePresetCardActive]}
                >
                  <View style={styles.themePresetHeader}>
                    <View style={[styles.themeSwatch, { backgroundColor: preset.accent.background }]} />
                    <Text style={styles.themePresetTitle}>{preset.label}</Text>
                  </View>
                  <Text style={styles.meta}>{preset.description}</Text>
                  <Text style={[styles.themePresetStatus, selected && styles.themePresetStatusActive]}>
                    {selected ? "Active now" : "Use this palette"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.themePreviewGrid}>
            {Object.entries(THEME_SURFACE_LABELS).map(([surface, label]) => (
              <View key={surface} style={styles.themePreviewItem}>
                <View style={[styles.themePreviewSwatch, { backgroundColor: settings.buttonThemes[surface as keyof typeof THEME_SURFACE_LABELS].background }]} />
                <Text style={styles.themePreviewLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Membership</Text>
        <Text style={styles.copy}>
          Unlock premium tours and future upgrades with a simple pass instead of cluttering the app with store mechanics.
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
          disabled={loadingAction !== null || fullAppUnlocked}
          onPress={() => startHostedCheckout(999, "Philly Tours Day Pass", "full_app")}
          label={fullAppUnlocked ? "Full Membership Unlocked" : loadingAction === "hosted" ? "Preparing..." : "Checkout ($9.99)"}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Audio History Only</Text>
        <Text style={styles.copy}>
          This option is available for guests who are unable to travel but still have a willingness to learn Philadelphia Founders history through the narrated stops.
        </Text>
        <Text style={styles.meta}>
          Purchase audio history only to listen through the tour stories from home, without needing to physically complete the route.
        </Text>
        {audioHistoryOnlyUnlocked ? (
          <View style={styles.chips}>
            <Chip label="Audio history unlocked" tone="success" />
            <Chip label="All stops available" tone="default" />
          </View>
        ) : null}
        <PrimaryButton
          disabled={loadingAction !== null || audioHistoryOnlyUnlocked}
          onPress={() => startHostedCheckout(999, "Philly Tours Audio History Only", "audio_history_only")}
          label={audioHistoryOnlyUnlocked ? "Audio History Unlocked" : loadingAction === "hosted" ? "Preparing..." : "Purchase Audio History Only"}
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

      {mode === "builder" ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Deletion Queue</Text>
          <Text style={styles.copy}>Internal only. Review requested deletions and purge backend records after user confirmation. This queue now uses your authenticated builder/admin session.</Text>
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
                  <Text style={styles.adminRequestTitle}>
                    {request.display_name || request.email || request.user_id}
                  </Text>
                  <Text style={styles.meta}>User: {request.user_id}</Text>
                  <Text style={styles.meta}>Status: {request.status}</Text>
                  {request.reason ? <Text style={styles.copy}>Reason: {request.reason}</Text> : null}
                  <Text style={styles.meta}>Requested: {new Date(request.requested_at).toLocaleString()}</Text>
                  {request.status === "fulfilled" ? (
                    <Text style={styles.meta}>
                      Fulfilled by {request.resolved_by || "admin"}{request.resolved_at ? ` on ${new Date(request.resolved_at).toLocaleString()}` : ""}
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
    backgroundColor: colors.backgroundElevated,
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border
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
    gap: 12
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft
  },
  appearanceChipActive: {
    borderColor: "#007eff",
    backgroundColor: colors.infoSoft
  },
  appearanceChipText: {
    color: colors.textSoft,
    fontWeight: "700",
    textAlign: "center",
    fontSize: type.font(14)
  },
  appearanceChipTextActive: {
    color: colors.info
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
