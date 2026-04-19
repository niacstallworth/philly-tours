import React from "react";
import { ImageBackground, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, type LatLng, type Region } from "react-native-maps";
import type { Tour } from "../../types";
import { AppPalette, useThemeColors, useTypeScale } from "../../theme/appTheme";
import { getStaticMapUrl } from "../../services/maps";

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

const STATIC_MAP_SIZE = {
  width: 900,
  height: 560
};
const STATIC_MAP_TILE_SIZE = 256;
const STATIC_MAP_PADDING_PX = 72;

function clampLatitude(latitude: number) {
  return Math.min(85.05112878, Math.max(-85.05112878, latitude));
}

function latLngToWorld(coordinate: LatLng) {
  const latitude = clampLatitude(coordinate.latitude);
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);
  return {
    x: ((coordinate.longitude + 180) / 360) * STATIC_MAP_TILE_SIZE,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * STATIC_MAP_TILE_SIZE
  };
}

function worldToLatLng(world: { x: number; y: number }): LatLng {
  const longitude = (world.x / STATIC_MAP_TILE_SIZE) * 360 - 180;
  const mercatorY = 0.5 - world.y / STATIC_MAP_TILE_SIZE;
  const latitude = 90 - (360 * Math.atan(Math.exp(-mercatorY * 2 * Math.PI))) / Math.PI;
  return { latitude, longitude };
}

function getStaticMapViewport(coordinates: LatLng[]) {
  if (!coordinates.length) {
    return {
      center: { latitude: 39.9526, longitude: -75.1652 },
      centerWorld: latLngToWorld({ latitude: 39.9526, longitude: -75.1652 }),
      zoom: 12
    };
  }

  const worldCoordinates = coordinates.map(latLngToWorld);
  const minX = Math.min(...worldCoordinates.map((coordinate) => coordinate.x));
  const maxX = Math.max(...worldCoordinates.map((coordinate) => coordinate.x));
  const minY = Math.min(...worldCoordinates.map((coordinate) => coordinate.y));
  const maxY = Math.max(...worldCoordinates.map((coordinate) => coordinate.y));
  const fitWidth = STATIC_MAP_SIZE.width - STATIC_MAP_PADDING_PX * 2;
  const fitHeight = STATIC_MAP_SIZE.height - STATIC_MAP_PADDING_PX * 2;
  const spanX = Math.max(maxX - minX, 0.000001);
  const spanY = Math.max(maxY - minY, 0.000001);
  const zoom = Math.max(
    1,
    Math.min(
      20,
      Math.floor(Math.min(Math.log2(fitWidth / spanX), Math.log2(fitHeight / spanY)))
    )
  );
  const centerWorld = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2
  };

  return {
    center: worldToLatLng(centerWorld),
    centerWorld,
    zoom
  };
}

function clampZoom(zoom: number) {
  return Math.max(1, Math.min(20, zoom));
}

function getStaticMarkerPosition(coordinate: LatLng, viewport: ReturnType<typeof getStaticMapViewport>) {
  const world = latLngToWorld(coordinate);
  const scale = 2 ** viewport.zoom;
  const leftPx = (world.x - viewport.centerWorld.x) * scale + STATIC_MAP_SIZE.width / 2;
  const topPx = (world.y - viewport.centerWorld.y) * scale + STATIC_MAP_SIZE.height / 2;
  const left = Math.min(96, Math.max(4, (leftPx / STATIC_MAP_SIZE.width) * 100));
  const top = Math.min(96, Math.max(4, (topPx / STATIC_MAP_SIZE.height) * 100));
  return { left: `${left}%` as `${number}%`, top: `${top}%` as `${number}%` };
}

export function RoutePreviewMap({ tour, selectedStopId, travelMode = "WALK", onSelectStop }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const mapRef = React.useRef<MapView | null>(null);
  const [androidZoomOffset, setAndroidZoomOffset] = React.useState(0);
  const stopCoordinates = React.useMemo(() => toCoordinates(tour), [tour]);
  const initialRegion = React.useMemo(() => getInitialRegion(stopCoordinates), [stopCoordinates]);
  const staticMapViewport = React.useMemo(() => {
    const viewport = getStaticMapViewport(stopCoordinates);
    return {
      ...viewport,
      zoom: clampZoom(viewport.zoom + androidZoomOffset)
    };
  }, [androidZoomOffset, stopCoordinates]);
  const staticMapUrl = React.useMemo(
    () => getStaticMapUrl(
      stopCoordinates.map((coordinate) => ({ lat: coordinate.latitude, lng: coordinate.longitude })),
      {
        center: { lat: staticMapViewport.center.latitude, lng: staticMapViewport.center.longitude },
        zoom: staticMapViewport.zoom
      }
    ),
    [staticMapViewport, stopCoordinates]
  );
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
    setAndroidZoomOffset(0);
  }, [tour.id]);

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
        {Platform.OS === "android" ? (
          <ImageBackground source={{ uri: staticMapUrl }} style={styles.map} imageStyle={styles.staticMapImage} resizeMode="stretch">
            <View style={styles.staticMapOverlay}>
              {tour.stops.map((stop, index) => {
                const selected = stop.id === selectedStopId;
                return (
                  <Pressable
                    key={stop.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Select stop ${index + 1}. ${stop.title}`}
                    onPress={() => onSelectStop?.(stop.id)}
                    style={[
                      styles.staticMarkerButton,
                      getStaticMarkerPosition({ latitude: stop.lat, longitude: stop.lng }, staticMapViewport)
                    ]}
                  >
                    <View style={[styles.marker, selected && styles.markerSelected]}>
                      <Text style={[styles.markerText, selected && styles.markerTextSelected]}>{index + 1}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.zoomControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Zoom map in"
                onPress={() => setAndroidZoomOffset((offset) => Math.min(offset + 1, 4))}
                style={styles.zoomButton}
              >
                <Text style={styles.zoomButtonText}>+</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset map zoom"
                onPress={() => setAndroidZoomOffset(0)}
                style={styles.zoomButton}
              >
                <Text style={styles.zoomResetText}>{androidZoomOffset === 0 ? "1x" : `${androidZoomOffset + 1}x`}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Zoom map out"
                onPress={() => setAndroidZoomOffset((offset) => Math.max(offset - 1, 0))}
                style={styles.zoomButton}
              >
                <Text style={styles.zoomButtonText}>-</Text>
              </Pressable>
            </View>
          </ImageBackground>
        ) : (
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
        )}
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
    staticMapImage: {
      backgroundColor: colors.surfaceSoft
    },
    staticMapOverlay: {
      ...StyleSheet.absoluteFillObject
    },
    staticMarkerButton: {
      position: "absolute",
      width: 48,
      height: 48,
      marginLeft: -24,
      marginTop: -24,
      alignItems: "center",
      justifyContent: "center"
    },
    zoomControls: {
      position: "absolute",
      right: 12,
      top: 12,
      gap: 6
    },
    zoomButton: {
      width: 34,
      height: 34,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#fffaf5",
      backgroundColor: "rgba(23, 32, 38, 0.88)",
      alignItems: "center",
      justifyContent: "center"
    },
    zoomButtonText: {
      color: "#fffaf5",
      fontSize: type.font(19),
      fontWeight: "900"
    },
    zoomResetText: {
      color: "#fffaf5",
      fontSize: type.font(10),
      fontWeight: "900"
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
