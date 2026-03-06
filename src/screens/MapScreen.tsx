import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { tours } from "../data/tours";
import { getTriggeredStops, haversineDistanceM } from "../services/geofence";
import {
  getCurrentPosition,
  requestForegroundLocationPermission,
  startLocationWatch,
  UserPosition
} from "../services/location";

export function MapScreen() {
  const stops = tours[0].stops;
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [watching, setWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoTriggers, setAutoTriggers] = useState<string[]>([]);

  const watchRef = useRef<{ remove: () => void } | null>(null);
  const enteredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, []);

  const triggeredIds = useMemo(() => {
    if (!userPosition) {
      return new Set<string>();
    }

    return new Set(
      getTriggeredStops(userPosition.latitude, userPosition.longitude, stops).map((s) => s.id)
    );
  }, [stops, userPosition]);

  useEffect(() => {
    if (!userPosition) {
      return;
    }

    const newlyEntered: string[] = [];
    for (const stop of stops) {
      const inRange =
        haversineDistanceM(userPosition.latitude, userPosition.longitude, stop.lat, stop.lng) <=
        stop.triggerRadiusM;

      if (inRange && !enteredRef.current.has(stop.id)) {
        enteredRef.current.add(stop.id);
        newlyEntered.push(stop.title);
      }

      if (!inRange && enteredRef.current.has(stop.id)) {
        enteredRef.current.delete(stop.id);
      }
    }

    if (newlyEntered.length > 0) {
      setAutoTriggers((prev) => [...newlyEntered, ...prev].slice(0, 8));
    }
  }, [stops, userPosition]);

  const nearest = useMemo(() => {
    if (!userPosition) {
      return null;
    }

    return stops
      .map((stop) => ({
        stop,
        distance: haversineDistanceM(
          userPosition.latitude,
          userPosition.longitude,
          stop.lat,
          stop.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance)[0] ?? null;
  }, [stops, userPosition]);

  const region = useMemo(() => {
    if (userPosition) {
      return {
        latitude: userPosition.latitude,
        longitude: userPosition.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      };
    }

    return {
      latitude: stops[0].lat,
      longitude: stops[0].lng,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03
    };
  }, [stops, userPosition]);

  async function onEnableLocation() {
    setError(null);

    try {
      const granted = await requestForegroundLocationPermission();
      setPermissionGranted(granted);

      if (!granted) {
        setError("Location permission denied.");
        return;
      }

      const current = await getCurrentPosition();
      setUserPosition(current);

      if (!watchRef.current) {
        watchRef.current = await startLocationWatch(
          (position) => {
            setUserPosition(position);
          },
          (message) => setError(message)
        );
        setWatching(true);
      }
    } catch (_e) {
      setError("Could not fetch location. Check device location settings.");
    }
  }

  function onStopWatch() {
    watchRef.current?.remove();
    watchRef.current = null;
    setWatching(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Map and Geofence Zones</Text>
      <Text style={styles.helper}>Step 2 complete: continuous location watch + automatic stop entry triggers.</Text>

      <View style={styles.row}>
        <Pressable style={styles.button} onPress={onEnableLocation}>
          <Text style={styles.buttonText}>{watching ? "Refresh Location" : "Enable Location + Start Watch"}</Text>
        </Pressable>
        <Pressable style={styles.buttonSecondary} onPress={onStopWatch}>
          <Text style={styles.buttonText}>Stop Watch</Text>
        </Pressable>
      </View>

      <Text style={styles.meta}>
        Permission: {permissionGranted === null ? "not requested" : permissionGranted ? "granted" : "denied"}
      </Text>
      <Text style={styles.meta}>Watch: {watching ? "active" : "inactive"}</Text>
      <Text style={styles.meta}>
        User: {userPosition ? `${userPosition.latitude.toFixed(5)}, ${userPosition.longitude.toFixed(5)}` : "unknown"}
      </Text>
      <Text style={styles.meta}>
        Nearest: {nearest ? `${nearest.stop.title} (${Math.round(nearest.distance)}m)` : "n/a"}
      </Text>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <MapView style={styles.map} initialRegion={region} region={region}>
        {userPosition && (
          <Marker
            coordinate={{ latitude: userPosition.latitude, longitude: userPosition.longitude }}
            title="You"
            pinColor="#22c55e"
          />
        )}

        {stops.map((stop) => (
          <React.Fragment key={stop.id}>
            <Marker
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              title={stop.title}
              description={stop.description}
              pinColor={triggeredIds.has(stop.id) ? "#f59e0b" : "#60a5fa"}
            />
            <Circle
              center={{ latitude: stop.lat, longitude: stop.lng }}
              radius={stop.triggerRadiusM}
              strokeWidth={1}
              strokeColor={triggeredIds.has(stop.id) ? "rgba(245,158,11,0.9)" : "rgba(96,165,250,0.9)"}
              fillColor={triggeredIds.has(stop.id) ? "rgba(245,158,11,0.2)" : "rgba(96,165,250,0.14)"}
            />
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.stopCard}>
        <Text style={styles.name}>Auto-trigger log</Text>
        {autoTriggers.length === 0 ? (
          <Text style={styles.latLng}>No stop entries yet.</Text>
        ) : (
          autoTriggers.map((name, idx) => (
            <Text key={`${name}-${idx}`} style={styles.status}>
              Entered: {name}
            </Text>
          ))
        )}
      </View>

      {stops.map((stop) => (
        <View style={styles.stopCard} key={stop.id}>
          <Text style={styles.name}>{stop.title}</Text>
          <Text style={styles.latLng}>Lat {stop.lat} | Lng {stop.lng}</Text>
          <Text style={styles.radius}>Auto-trigger radius: {stop.triggerRadiusM}m</Text>
          <Text style={styles.status}>
            Status: {triggeredIds.has(stop.id) ? "In range - trigger now" : "Out of range"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },
  helper: { color: "#94a3b8" },
  row: { flexDirection: "row", gap: 8 },
  button: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center"
  },
  buttonSecondary: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center"
  },
  buttonText: { color: "#f8fafc", fontWeight: "700" },
  meta: { color: "#cbd5e1" },
  error: { color: "#f87171" },
  map: {
    height: 320,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155"
  },
  stopCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    padding: 12,
    gap: 4
  },
  name: { color: "#f8fafc", fontWeight: "700" },
  latLng: { color: "#cbd5e1" },
  radius: { color: "#f59e0b" },
  status: { color: "#86efac", fontWeight: "600" }
});
