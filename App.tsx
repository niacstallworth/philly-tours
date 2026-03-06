import React, { useMemo, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { BottomNav, TabKey } from "./src/components/BottomNav";
import { ARScreen } from "./src/screens/ARScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const content = useMemo(() => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "map":
        return <MapScreen />;
      case "ar":
        return <ARScreen />;
      case "progress":
        return <ProgressScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>{content}</View>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  content: { flex: 1 }
});
