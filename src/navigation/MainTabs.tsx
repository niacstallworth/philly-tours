import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CompanionSetupScreen } from "../screens/CompanionSetupScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { AppMode } from "../screens/OnboardingScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ScavengerHuntScreen } from "../screens/ScavengerHuntScreen";
import { HandoffTarget } from "../services/deepLinks";
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
  const [tab, setTab] = React.useState<"Home" | "Hunt" | "Profile" | "Companion">("Home");
  const [huntSnapshot, setHuntSnapshot] = React.useState(() => getScavengerHuntSnapshot());

  React.useEffect(() => {
    const unsubscribe = subscribeToScavengerHunt(setHuntSnapshot);
    void ensureScavengerHuntCollectorStarted();
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (!handoffTarget) {
      return;
    }
    setTab("Home");
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
            onOpenPurchase={() => setTab("Profile")}
          />
        </ThemeSurfaceProvider>
      );
    }
    if (tab === "Hunt") {
      return (
        <ThemeSurfaceProvider surface="hunt">
          <ScavengerHuntScreen />
        </ThemeSurfaceProvider>
      );
    }
    if (tab === "Companion") {
      return (
        <ThemeSurfaceProvider surface="profile">
          <CompanionSetupScreen />
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
          onOpenCompanion={() => setTab("Companion")}
        />
      </ThemeSurfaceProvider>
    );
  }

  const tabs: Array<{ key: "Home" | "Hunt" | "Profile"; label: string; glyph: string }> = [
    { key: "Home", label: "Home", glyph: "⌂" },
    { key: "Hunt", label: "Hunt", glyph: "◈" },
    { key: "Profile", label: "Settings", glyph: "⚙" }
  ];

  const revealToken = huntSnapshot.latestRevealId ? getScavengerTokenById(huntSnapshot.latestRevealId) : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topChrome, { backgroundColor: colors.headerBackground, borderColor: colors.headerBorder }]}>
        <View>
          <Text style={[styles.chromeEyebrow, { color: colors.textMuted }]}>Founders Threads</Text>
          <Text style={[styles.chromeTitle, { color: colors.text }]}>Philly AR Tours</Text>
        </View>
        <View style={[styles.chromePill, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
          <Text style={[styles.chromePillText, { color: colors.textSoft }]}>Meta glasses mode off</Text>
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
      <View style={[styles.tabShell, { backgroundColor: colors.background }]}>
        <View style={[styles.tabBar, { backgroundColor: colors.navBackground, borderColor: colors.navBorder, shadowColor: colors.shadow }]}>
          {tabs.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              style={[
                styles.tabItem,
                tab === item.key && styles.tabItemActive,
                { backgroundColor: tab === item.key ? "#5b38f5" : "transparent" }
              ]}
            >
              <Text
                style={[
                  styles.tabGlyph,
                  { color: tab === item.key ? "#fff8f3" : colors.navText, fontSize: type.font(18) }
                ]}
              >
                {item.glyph}
              </Text>
              <Text
                style={[
                  styles.tabText,
                  { color: tab === item.key ? "#fff8f3" : colors.navText, fontSize: type.font(11) }
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

function createStyles(
  colors: ReturnType<typeof useThemeColors>,
  type: ReturnType<typeof useTypeScale>
) {
  return StyleSheet.create({
    root: {
      flex: 1
    },
    topChrome: {
      paddingTop: 18,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
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
      paddingHorizontal: 14,
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
      justifyContent: "space-around",
      alignItems: "center",
      padding: 8,
      borderRadius: 30,
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
