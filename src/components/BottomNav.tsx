import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type TabKey = "home" | "map" | "ar" | "progress" | "profile";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "home", label: "Home" },
  { key: "map", label: "Map" },
  { key: "ar", label: "AR" },
  { key: "progress", label: "Progress" },
  { key: "profile", label: "Profile" }
];

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={[styles.item, active === tab.key && styles.activeItem]}
        >
          <Text style={[styles.text, active === tab.key && styles.activeText]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#111827",
    borderTopWidth: 1,
    borderTopColor: "#1f2937"
  },
  item: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8
  },
  activeItem: {
    backgroundColor: "#1e293b"
  },
  text: {
    color: "#94a3b8",
    fontWeight: "600"
  },
  activeText: {
    color: "#f8fafc"
  }
});
