import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.row}>User: Founder Demo</Text>
      <Text style={styles.row}>Tours completed: 0</Text>
      <Text style={styles.row}>Badges: 0</Text>
      <Text style={styles.note}>Next step: add auth via Supabase/Firebase and sync progress.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },
  row: { color: "#cbd5e1" },
  note: { color: "#94a3b8", marginTop: 8 }
});
