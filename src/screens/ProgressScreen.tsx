import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, Chip } from "../components/ui/Primitives";
import { tours } from "../data/tours";

export function ProgressScreen() {
  const total = tours[0].stops.length;
  const completed = 1;
  const pct = Math.round((completed / total) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>Progress</Text>
        <Text style={styles.heroTitle}>A clean sense of momentum, not a gamified wall of stats.</Text>
        <Text style={styles.heroCopy}>Keep progress personal, elegant, and easy to understand at a glance.</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Current Tour</Text>
        <Text style={styles.bigNumber}>{completed} / {total}</Text>
        <Text style={styles.copy}>Stops completed</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.chips}>
          <Chip label={`${pct}% complete`} tone="success" />
          <Chip label="Badges coming soon" tone="warn" />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, gap: 16, backgroundColor: "#060312" },
  heroPanel: {
    backgroundColor: "#130a25",
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 173, 0.16)"
  },
  heroEyebrow: { color: "#ff9ab2", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 },
  heroTitle: { color: "#fff3ea", fontSize: 30, lineHeight: 36, fontWeight: "800" },
  heroCopy: { color: "#d8c7df", lineHeight: 21 },
  card: { backgroundColor: "#120a22", gap: 10 },
  sectionTitle: { color: "#fff0e4", fontSize: 18, fontWeight: "800" },
  bigNumber: { color: "#fff7f1", fontSize: 42, fontWeight: "800" },
  copy: { color: "#d8c7df" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  barTrack: { height: 16, backgroundColor: "#241337", borderRadius: 999, overflow: "hidden" },
  barFill: { height: 16, backgroundColor: "#ff8ca8", borderRadius: 999 }
});
