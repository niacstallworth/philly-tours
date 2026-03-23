import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  const [tab, setTab] = React.useState<"Home" | "Hunt" | "Profile">("Home");
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
    return (
      <ThemeSurfaceProvider surface="profile">
        <ProfileScreen
          displayName={session.displayName}
          mode={session.mode}
          email={session.email}
          audioHistoryOnlyUnlocked={audioHistoryOnlyUnlocked}
          fullAppUnlocked={fullAppUnlocked}
          onRefreshEntitlements={onRefreshEntitlements}
          onDeleteProfile={onDeleteProfile}
        />
      </ThemeSurfaceProvider>
    );
  }

  const tabs: Array<{ key: "Home" | "Hunt" | "Profile"; label: string }> = [
    { key: "Home", label: "Home" },
    { key: "Hunt", label: "Scavenger Hunt" },
    { key: "Profile", label: "Profile" }
  ];

  const revealToken = huntSnapshot.latestRevealId ? getScavengerTokenById(huntSnapshot.latestRevealId) : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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
        <View style={[styles.tabBar, { backgroundColor: colors.navBackground, borderColor: colors.navBorder }]}>
          {tabs.map((item) => (
            <Pressable key={item.key} onPress={() => setTab(item.key)} style={styles.tabItem}>
              <Text
                style={[
                  styles.tabText,
                  { color: tab === item.key ? colors.navTextActive : colors.navText, fontSize: type.font(12) }
                ]}
              >
                {item.label}
              </Text>
              {tab === item.key ? <View style={styles.activePill} /> : null}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
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
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  revealTitle: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: "800"
  },
  revealCopy: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18
  },
  tabBar: {
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 28
  },
  tabItem: {
    alignItems: "center",
    gap: 6,
    minWidth: 58,
    flex: 1
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700"
  },
  activePill: {
    width: 22,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#007eff"
  }
});
