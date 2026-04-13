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
        <View style={styles.heroGlowPrimary} />
        <View style={styles.heroGlowSecondary} />
        <Text style={styles.heroEyebrow}>Progress</Text>
        <Text style={styles.heroTitle}>A clean sense of momentum, not a gamified wall of stats.</Text>
        <Text style={styles.heroCopy}>Keep progress personal, elegant, and easy to understand at a glance.</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Current Tour</Text>
        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{completed}</Text>
            <Text style={styles.metricLabel}>stops done</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{total - completed}</Text>
            <Text style={styles.metricLabel}>still ahead</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{pct}%</Text>
            <Text style={styles.metricLabel}>route progress</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{tours.length}</Text>
            <Text style={styles.metricLabel}>tour packs</Text>
          </View>
        </View>
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
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#07070d",
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  heroGlowPrimary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(91, 56, 245, 0.24)",
    top: -96,
    right: -70
  },
  heroGlowSecondary: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(255, 188, 138, 0.12)",
    bottom: -90,
    left: -60
  },
  heroEyebrow: { color: "rgba(255,255,255,0.72)", fontSize: type.font(12), fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 },
  heroTitle: { color: "#ffffff", fontSize: type.font(30), lineHeight: type.line(36), fontWeight: "800" },
  heroCopy: { color: "rgba(255,255,255,0.82)", lineHeight: type.line(21), fontSize: type.font(14) },
  card: { gap: 14, backgroundColor: colors.surfaceRaised },
  sectionTitle: { color: colors.text, fontSize: type.font(18), fontWeight: "800" },
  copy: { color: colors.textSoft, fontSize: type.font(14) },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metricCard: {
    minWidth: "47%",
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  metricValue: {
    color: colors.text,
    fontSize: type.font(26),
    fontWeight: "800"
  },
  metricLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: type.font(12),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  barTrack: { height: 16, backgroundColor: colors.surfaceSoft, borderRadius: 999, overflow: "hidden" },
  barFill: { height: 16, backgroundColor: "#4f2df5", borderRadius: 999 }
  });
}
