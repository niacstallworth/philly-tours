import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { tours } from "../data/tours";

export function ProgressScreen() {
  const total = tours[0].stops.length;
  const completed = 1;
  const pct = Math.round((completed / total) * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tour Progress</Text>
      <Text style={styles.text}>{completed} / {total} stops complete ({pct}%)</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.text}>Unlock badges at 100% completion.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },
  text: { color: "#cbd5e1" },
  barTrack: { height: 14, backgroundColor: "#1e293b", borderRadius: 999 },
  barFill: { height: 14, backgroundColor: "#f59e0b", borderRadius: 999 }
});
