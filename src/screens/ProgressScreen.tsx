import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, Chip } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { AppPalette, useThemeColors, useTypeScale } from "../theme/appTheme";

export function ProgressScreen() {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
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

function createStyles(
  colors: AppPalette,
  type: {
    font: (size: number) => number;
    line: (height: number) => number;
  }
) {
  return StyleSheet.create({
  container: { flex: 1, padding: 18, gap: 16, backgroundColor: colors.background },
  heroPanel: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  heroEyebrow: { color: colors.warn, fontSize: type.font(12), fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 },
  heroTitle: { color: colors.text, fontSize: type.font(30), lineHeight: type.line(36), fontWeight: "800" },
  heroCopy: { color: colors.textSoft, lineHeight: type.line(21), fontSize: type.font(14) },
  card: { gap: 10 },
  sectionTitle: { color: colors.text, fontSize: type.font(18), fontWeight: "800" },
  bigNumber: { color: colors.text, fontSize: type.font(42), fontWeight: "800" },
  copy: { color: colors.textSoft, fontSize: type.font(14) },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  barTrack: { height: 16, backgroundColor: colors.surfaceSoft, borderRadius: 999, overflow: "hidden" },
  barFill: { height: 16, backgroundColor: "#007eff", borderRadius: 999 }
  });
}
