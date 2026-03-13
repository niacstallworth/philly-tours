import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ARScreen } from "../screens/ARScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MapScreen } from "../screens/MapScreen";
import { AppMode } from "../screens/OnboardingScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ProgressScreen } from "../screens/ProgressScreen";

type SessionInfo = {
  displayName: string;
  email: string;
  mode: AppMode;
};

type Props = {
  session: SessionInfo;
};

export function MainTabs({ session }: Props) {
  const [tab, setTab] = React.useState<"Home" | "Map" | "AR" | "Progress" | "Profile">("Home");

  function renderTab() {
    if (tab === "Home") {
      return <HomeScreen displayName={session.displayName} />;
    }
    if (tab === "Map") {
      return <MapScreen />;
    }
    if (tab === "AR") {
      return <ARScreen />;
    }
    if (tab === "Progress") {
      return <ProgressScreen />;
    }
    return <ProfileScreen displayName={session.displayName} mode={session.mode} email={session.email} />;
  }

  const tabs: Array<{ key: "Home" | "Map" | "AR" | "Progress" | "Profile"; label: string }> = [
    { key: "Home", label: "Home" },
    { key: "Map", label: "Map" },
    { key: "AR", label: "AR" },
    { key: "Progress", label: "Progress" },
    { key: "Profile", label: "Profile" }
  ];

  return (
    <View style={styles.root}>
      <View style={styles.content}>{renderTab()}</View>
      <View style={styles.tabShell}>
        <View style={styles.tabBar}>
          {tabs.map((item) => (
            <Pressable key={item.key} onPress={() => setTab(item.key)} style={styles.tabItem}>
              <Text style={[styles.tabText, tab === item.key && styles.tabTextActive]}>{item.label}</Text>
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
    flex: 1,
    backgroundColor: "#060312"
  },
  content: {
    flex: 1
  },
  tabShell: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 8,
    backgroundColor: "#060312"
  },
  tabBar: {
    backgroundColor: "rgba(18, 12, 33, 0.94)",
    borderColor: "rgba(226, 184, 135, 0.16)",
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
    minWidth: 58
  },
  tabText: {
    color: "#bdaecf",
    fontSize: 12,
    fontWeight: "700"
  },
  tabTextActive: {
    color: "#fff6ee"
  },
  activePill: {
    width: 22,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#ff8ca8"
  }
});
