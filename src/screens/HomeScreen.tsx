import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { tours } from "../data/tours";

export function HomeScreen() {
  const tour = tours[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Philly AR Tours</Text>
      <Text style={styles.subtitle}>Mobile-first app for iOS/Android launch</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{tour.title}</Text>
        <Text style={styles.meta}>Rating {tour.rating} | {tour.durationMin} min | {tour.distanceMiles} mi</Text>
        <Text style={styles.copy}>Start here, then walk to each stop for geofenced AR experiences.</Text>
      </View>

      {tour.stops.map((stop, idx) => (
        <View key={stop.id} style={styles.listItem}>
          <Text style={styles.stopIndex}>Stop {idx + 1}</Text>
          <Text style={styles.stopTitle}>{stop.title}</Text>
          <Text style={styles.stopDesc}>{stop.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f8fafc"
  },
  subtitle: {
    color: "#cbd5e1"
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    gap: 8
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700"
  },
  meta: {
    color: "#cbd5e1"
  },
  copy: {
    color: "#94a3b8"
  },
  listItem: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4
  },
  stopIndex: {
    color: "#f59e0b",
    fontWeight: "700"
  },
  stopTitle: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 16
  },
  stopDesc: {
    color: "#cbd5e1"
  }
});
