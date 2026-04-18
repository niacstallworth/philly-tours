import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, type LatLng, type Region } from "react-native-maps";
import type { Tour } from "../../types";
import { AppPalette, useThemeColors, useTypeScale } from "../../theme/appTheme";

type Props = {
  tour: Tour;
  selectedStopId?: string | null;
  travelMode?: "DRIVE" | "WALK";
  onSelectStop?: (stopId: string) => void;
};

function toCoordinates(tour: Tour): LatLng[] {
  return tour.stops
    .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng))
    .map((stop) => ({
      latitude: stop.lat,
      longitude: stop.lng
    }));
}

function getInitialRegion(coordinates: LatLng[]): Region {
  if (!coordinates.length) {
    return {
      latitude: 39.9526,
      longitude: -75.1652,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08
    };
  }

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latitudeDelta = Math.max((maxLat - minLat) * 1.45, 0.018);
  const longitudeDelta = Math.max((maxLng - minLng) * 1.45, 0.018);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta
  };
}

function formatMiles(fallbackMiles?: number) {
  const miles = fallbackMiles;
  if (typeof miles !== "number" || !Number.isFinite(miles)) {
    return "City distance";
  }
  return `${miles < 0.1 ? miles.toFixed(2) : miles.toFixed(1)} mi`;
}

function formatDuration(fallbackMinutes?: number) {
  const minutes = fallbackMinutes;
  if (typeof minutes !== "number" || !Number.isFinite(minutes)) {
    return "Estimated time";
  }
  return `${Math.round(minutes)} min`;
}

export function RoutePreviewMap({ tour, selectedStopId, travelMode = "WALK", onSelectStop }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const mapRef = React.useRef<MapView | null>(null);
  const stopCoordinates = React.useMemo(() => toCoordinates(tour), [tour]);
  const initialRegion = React.useMemo(() => getInitialRegion(stopCoordinates), [stopCoordinates]);
  const [routeMeta, setRouteMeta] = React.useState({
    distanceLabel: formatMiles(tour.distanceMiles),
    durationLabel: formatDuration(tour.durationMin),
    message: "North Broad is the north star. Numbered points show how the story opens outward from the Founders Compass."
  });

  React.useEffect(() => {
    setRouteMeta({
      distanceLabel: formatMiles(tour.distanceMiles),
      durationLabel: formatDuration(tour.durationMin),
      message: "North Broad is the north star. Numbered points show how the story opens outward from the Founders Compass."
    });
  }, [tour.distanceMiles, tour.durationMin]);

  React.useEffect(() => {
    if (!stopCoordinates.length) {
      return;
    }
    const timeoutId = setTimeout(() => {
      mapRef.current?.fitToCoordinates(stopCoordinates, {
        animated: true,
        edgePadding: { top: 54, right: 34, bottom: 54, left: 34 }
      });
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [stopCoordinates]);

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Founders Compass</Text>
          <Text style={styles.title}>North Broad as the north star</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>Compass points</Text>
        </View>
      </View>
      <View style={styles.mapFrame}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsCompass={false}
          showsScale
          showsUserLocation
          showsMyLocationButton
          toolbarEnabled={false}
          mapType={travelMode === "DRIVE" ? "hybrid" : "standard"}
        >
          {tour.stops.map((stop, index) => {
            const selected = stop.id === selectedStopId;
            return (
              <Marker
                key={stop.id}
                coordinate={{ latitude: stop.lat, longitude: stop.lng }}
                title={`${index + 1}. ${stop.title}`}
                description={stop.description.split("|")[0]?.trim() || stop.title}
                onPress={() => onSelectStop?.(stop.id)}
              >
                <View style={[styles.marker, selected && styles.markerSelected]}>
                  <Text style={[styles.markerText, selected && styles.markerTextSelected]}>{index + 1}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerStrong}>{routeMeta.durationLabel} - {routeMeta.distanceLabel}</Text>
        <Text style={styles.footerCopy}>{routeMeta.message}</Text>
      </View>
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
    shell: {
      overflow: "hidden",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised
    },
    header: {
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12
    },
    eyebrow: {
      color: colors.warn,
      fontSize: type.font(11),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1
    },
    title: {
      marginTop: 4,
      color: colors.text,
      fontSize: type.font(20),
      fontWeight: "800"
    },
    statusPill: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.surfaceSoft
    },
    statusPillText: {
      color: colors.text,
      fontSize: type.font(11),
      fontWeight: "800"
    },
    mapFrame: {
      height: 320,
      backgroundColor: colors.surfaceSoft
    },
    map: {
      flex: 1
    },
    marker: {
      width: 30,
      height: 30,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: "#fffaf5",
      backgroundColor: "#172026",
      alignItems: "center",
      justifyContent: "center"
    },
    markerSelected: {
      width: 38,
      height: 38,
      borderWidth: 3,
      borderColor: "#b45b3d",
      backgroundColor: "#f1d1b2"
    },
    markerText: {
      color: "#fffaf5",
      fontSize: type.font(12),
      fontWeight: "800"
    },
    markerTextSelected: {
      color: "#6b3b2f",
      fontSize: type.font(14)
    },
    footer: {
      padding: 16,
      gap: 6
    },
    footerStrong: {
      color: colors.text,
      fontSize: type.font(15),
      fontWeight: "800"
    },
    footerCopy: {
      color: colors.textSoft,
      fontSize: type.font(13),
      lineHeight: type.line(19)
    },
  });
}
