import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CompanionSetupScreen } from "../screens/CompanionSetupScreen";
import { DriveScreen } from "../screens/DriveScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { useCompanionSession } from "../hooks/useCompanionSession";
import { AppMode } from "../screens/OnboardingScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { HandoffTarget } from "../services/deepLinks";
import { ensureMediaButtonsStarted, stopMediaButtons } from "../services/mediaButtons";
import { dismissScavengerReveal, ensureScavengerHuntCollectorStarted, getScavengerHuntSnapshot, getScavengerTokenById, subscribeToScavengerHunt } from "../services/scavengerHunt";
import { ThemeSurfaceProvider, useThemeColors, useTypeScale } from "../theme/appTheme";

type SessionInfo = {
  displayName: string;
  email: string;
  mode: AppMode;
};

type Props = {
  session: SessionInfo;
  handoffTarget?: HandoffTarget | null;
  audioHistoryOnlyUnlocked: boolean;
  fullAppUnlocked: boolean;
  onRefreshEntitlements: () => Promise<void>;
  onDeleteProfile: () => void;
};

export function MainTabs({ session, handoffTarget, audioHistoryOnlyUnlocked, fullAppUnlocked, onRefreshEntitlements, onDeleteProfile }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const [tab, setTab] = React.useState<"Home" | "AR" | "Board" | "Settings" | "Compass">("Home");
  const [huntSnapshot, setHuntSnapshot] = React.useState(() => getScavengerHuntSnapshot());
  const { status: companionStatus } = useCompanionSession();

  React.useEffect(() => {
    const unsubscribe = subscribeToScavengerHunt(setHuntSnapshot);
    void ensureScavengerHuntCollectorStarted();
    void ensureMediaButtonsStarted();
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    return () => {
      void stopMediaButtons();
    };
  }, []);

  React.useEffect(() => {
    if (!handoffTarget) {
      return;
    }
    setTab("Compass");
  }, [handoffTarget]);

  function renderTab() {
    if (tab === "Home") {
      return (
        <ThemeSurfaceProvider surface="home">
          <HomeScreen
            displayName={session.displayName}
            initialSelectedTourId={handoffTarget?.tourId}
            highlightedStopId={handoffTarget?.stopId}
            audioHistoryOnlyUnlocked={audioHistoryOnlyUnlocked}
            fullAppUnlocked={fullAppUnlocked}
            onOpenPurchase={() => setTab("Settings")}
          />
        </ThemeSurfaceProvider>
      );
    }
    if (tab === "Compass") {
      return (
        <ThemeSurfaceProvider surface="map">
          <DriveScreen initialTourId={handoffTarget?.tourId} />
        </ThemeSurfaceProvider>
      );
    }
    if (tab === "AR") {
      return (
        <ThemeSurfaceProvider surface="map">
          <CompanionSetupScreen
            audioHistoryOnlyUnlocked={audioHistoryOnlyUnlocked}
            fullAppUnlocked={fullAppUnlocked}
          />
        </ThemeSurfaceProvider>
      );
    }
    if (tab === "Board") {
      return (
        <ThemeSurfaceProvider surface="home">
          <ProgressScreen />
        </ThemeSurfaceProvider>
      );
    }
    if (tab === "Settings") {
      return (
        <ThemeSurfaceProvider surface="profile">
          <ProfileScreen
            displayName={session.displayName}
            email={session.email}
            audioHistoryOnlyUnlocked={audioHistoryOnlyUnlocked}
            fullAppUnlocked={fullAppUnlocked}
            onRefreshEntitlements={onRefreshEntitlements}
            onDeleteProfile={onDeleteProfile}
            onOpenCompanion={() => setTab("AR")}
          />
        </ThemeSurfaceProvider>
      );
    }
    return (
      <ThemeSurfaceProvider surface="profile">
        <ProfileScreen
          displayName={session.displayName}
          email={session.email}
          audioHistoryOnlyUnlocked={audioHistoryOnlyUnlocked}
          fullAppUnlocked={fullAppUnlocked}
          onRefreshEntitlements={onRefreshEntitlements}
          onDeleteProfile={onDeleteProfile}
          onOpenCompanion={() => setTab("AR")}
        />
      </ThemeSurfaceProvider>
    );
  }

  const tabs: Array<{ key: "Home" | "AR" | "Board" | "Settings" | "Compass"; label: string; glyph: string }> = [
    { key: "Home", label: "Home", glyph: "⌂" },
    { key: "AR", label: "AR", glyph: "◌" },
    { key: "Board", label: "Board", glyph: "◔" },
    { key: "Settings", label: "Settings", glyph: "⚙" },
    { key: "Compass", label: "Compass", glyph: "⌖" }
  ];

  const revealToken = huntSnapshot.latestRevealId ? getScavengerTokenById(huntSnapshot.latestRevealId) : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.topChromeWrap}>
        <View style={[styles.topChrome, { backgroundColor: "#07070d", borderColor: "rgba(255,255,255,0.08)" }]}>
          <View>
            <Text style={[styles.chromeEyebrow, { color: "rgba(255,255,255,0.62)" }]}>Founders Threads</Text>
            <Text style={[styles.chromeTitle, { color: "#ffffff" }]}>Philly AR Tours</Text>
          </View>
          <View style={[styles.chromePill, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }]}>
            <Text style={[styles.chromePillText, { color: "#f3f4f6" }]}>{getChromeCompanionLabel(companionStatus.integrationMode, companionStatus.connectionState)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>{renderTab()}</View>
      {revealToken ? (
        <Pressable style={[styles.revealShell, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]} onPress={() => void dismissScavengerReveal()}>
          <Text style={[styles.revealEyebrow, { color: colors.info }]}>Token Collected</Text>
          <Text style={[styles.revealTitle, { color: colors.text }]}>{revealToken.stopTitle}</Text>
          <Text style={[styles.revealCopy, { color: colors.textSoft }]} numberOfLines={2}>
            {revealToken.summary}
          </Text>
        </Pressable>
      ) : null}
      <View style={[styles.tabShell, { backgroundColor: "transparent" }]}>
        <View style={[styles.tabBar, { backgroundColor: "rgba(255,255,255,0.96)", borderColor: "rgba(15, 23, 42, 0.08)", shadowColor: colors.shadow }]}>
          {tabs.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              style={[
                styles.tabItem,
                tab === item.key && styles.tabItemActive,
                { backgroundColor: tab === item.key ? "#4f2df5" : "transparent" }
              ]}
            >
              <Text
                style={[
                  styles.tabGlyph,
                  { color: tab === item.key ? "#fff8f3" : "#64748b", fontSize: type.font(18) }
                ]}
              >
                {item.glyph}
              </Text>
              <Text
                style={[
                  styles.tabText,
                  { color: tab === item.key ? "#fff8f3" : "#64748b", fontSize: type.font(11) }
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function getChromeCompanionLabel(integrationMode: "native" | "manual" | "none", connectionState: string) {
  if (integrationMode === "manual") {
    return connectionState === "connected" ? "Universal audio on" : "Universal audio ready";
  }

  if (integrationMode === "native") {
    return connectionState === "connected" ? "Meta companion on" : "Meta companion ready";
  }

  return "Phone audio mode";
}

function createStyles(
  colors: ReturnType<typeof useThemeColors>,
  type: ReturnType<typeof useTypeScale>
) {
  return StyleSheet.create({
    root: {
      flex: 1
    },
    topChromeWrap: {
      paddingHorizontal: 12,
      paddingTop: 10
    },
    topChrome: {
      paddingTop: 14,
      paddingHorizontal: 18,
      paddingBottom: 14,
      borderWidth: 1,
      borderRadius: 24,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 12
    },
    chromeEyebrow: {
      fontSize: type.font(12),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.8
    },
    chromeTitle: {
      marginTop: 4,
      fontSize: type.font(20),
      lineHeight: type.line(24),
      fontWeight: "800"
    },
    chromePill: {
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    chromePillText: {
      fontSize: type.font(12),
      fontWeight: "700"
    },
    content: {
      flex: 1
    },
    tabShell: {
      paddingHorizontal: 12,
      paddingBottom: 14,
      paddingTop: 8
    },
    revealShell: {
      position: "absolute",
      right: 16,
      left: 16,
      bottom: 104,
      zIndex: 20,
      borderWidth: 1,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 16,
      shadowOpacity: 0.2,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6
    },
    revealEyebrow: {
      fontSize: type.font(11),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.1
    },
    revealTitle: {
      marginTop: 6,
      fontSize: type.font(17),
      fontWeight: "800"
    },
    revealCopy: {
      marginTop: 6,
      fontSize: type.font(13),
      lineHeight: type.line(18)
    },
    tabBar: {
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 8,
      borderRadius: 24,
      shadowOpacity: 0.14,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8
    },
    tabItem: {
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      minWidth: 58,
      flex: 1,
      borderRadius: 22,
      paddingVertical: 10,
      paddingHorizontal: 8
    },
    tabItemActive: {
      shadowColor: "#5b38f5",
      shadowOpacity: 0.24,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4
    },
    tabGlyph: {
      fontWeight: "800"
    },
    tabText: {
      fontWeight: "800",
      letterSpacing: 0.2
    }
  });
}
