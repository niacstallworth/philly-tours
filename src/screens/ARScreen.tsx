import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { tours } from "../data/tours";
import { toARScenePayload } from "../services/ar";
import { getNativeARAdapter } from "../services/native-ar";
import { NativeARStatus } from "../services/native-ar/types";
import { createRealtimeSyncFromEnv, SyncEvent } from "../services/realtime";

const adapter = getNativeARAdapter();
const sync = createRealtimeSyncFromEnv();

export function ARScreen() {
  const payloads = tours[0].stops.map(toARScenePayload);
  const [arStatus, setArStatus] = useState<NativeARStatus | null>(null);
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [joined, setJoined] = useState(false);
  const [roomName, setRoomName] = useState("historic-philly-main");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [roomMembers, setRoomMembers] = useState<string[]>([]);

  useEffect(() => {
    const offEvent = sync.onEvent((event) => {
      setEvents((prev) => [...prev, event]);
    });

    const offMembers = sync.onRoomMembers((sessionId, members) => {
      if (sessionId === activeSessionId) {
        setRoomMembers(members);
      }
    });

    return () => {
      offEvent?.();
      offMembers?.();
    };
  }, [activeSessionId]);

  const eventsText = useMemo(
    () => events.slice(-5).map((e) => `${e.type} ${e.objectId}`).join(" | "),
    [events]
  );

  async function onCheckAR() {
    const status = await adapter.getStatus();
    setArStatus(status);
  }

  async function onStartARSession() {
    await adapter.startSession();
  }

  async function onPlaceFirstModel() {
    const first = payloads[0];
    await adapter.placeModel({
      id: first.stopId,
      modelUrl: first.modelUrl,
      scale: first.scale,
      rotationYDeg: first.rotationYDeg
    });

    if (!activeSessionId) {
      return;
    }

    sync.send({
      type: "spawn",
      sessionId: activeSessionId,
      objectId: first.stopId,
      modelUrl: first.modelUrl
    });
  }

  function onJoinSession() {
    const room = roomName.trim();
    if (!room) {
      return;
    }

    if (joined) {
      sync.leaveSession();
      setJoined(false);
      setActiveSessionId(null);
      setRoomMembers([]);
      return;
    }

    sync.joinSession(room);
    setJoined(true);
    setActiveSessionId(room);
  }

  async function onStopARSession() {
    await adapter.stopSession();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AR Session and Realtime Sync</Text>
      <Text style={styles.helper}>Ordered updates: 1 native bridge, 3 lobby UI, 2 location watch.</Text>

      <View style={styles.statusCard}>
        <Text style={styles.label}>Lobby</Text>
        <TextInput
          value={roomName}
          onChangeText={setRoomName}
          style={styles.input}
          placeholder="Enter room name"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
        />
        <Pressable style={styles.button} onPress={onJoinSession}>
          <Text style={styles.buttonText}>{joined ? "Leave Room" : "Join Room"}</Text>
        </Pressable>
        <Text style={styles.value}>Active room: {activeSessionId || "none"}</Text>
        <Text style={styles.value}>You: {sync.getClientId()}</Text>
        <Text style={styles.value}>Members ({roomMembers.length}): {roomMembers.join(", ") || "none"}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={onCheckAR}>
          <Text style={styles.buttonText}>Check AR Provider</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onStartARSession}>
          <Text style={styles.buttonText}>Start AR Session</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onPlaceFirstModel}>
          <Text style={styles.buttonText}>Place and Sync First Model</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onStopARSession}>
          <Text style={styles.buttonText}>Stop AR Session</Text>
        </Pressable>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.label}>AR Provider:</Text>
        <Text style={styles.value}>{arStatus ? arStatus.provider : "unknown"}</Text>
        <Text style={styles.label}>Available:</Text>
        <Text style={styles.value}>{arStatus ? String(arStatus.available) : "unknown"}</Text>
        <Text style={styles.label}>Reason:</Text>
        <Text style={styles.value}>{arStatus?.reason || "n/a"}</Text>
        <Text style={styles.label}>Realtime events:</Text>
        <Text style={styles.value}>{eventsText || "none yet"}</Text>
      </View>

      {payloads.map((p) => (
        <View key={p.stopId} style={styles.card}>
          <Text style={styles.stopLabel}>Stop: {p.stopId}</Text>
          <Text style={styles.value}>Model: {p.modelUrl}</Text>
          <Text style={styles.value}>Scale: {p.scale}</Text>
          <Text style={styles.value}>RotationY: {p.rotationYDeg}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },
  helper: { color: "#94a3b8" },
  controls: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    color: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#020617"
  },
  button: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center"
  },
  buttonText: { color: "#f8fafc", fontWeight: "700" },
  statusCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    padding: 12,
    gap: 8
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    padding: 12,
    gap: 4
  },
  label: { color: "#f59e0b", fontWeight: "700" },
  stopLabel: { color: "#86efac", fontWeight: "700" },
  value: { color: "#cbd5e1" }
});
