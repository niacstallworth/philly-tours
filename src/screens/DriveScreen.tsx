import React from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { getDriveStops, getDriveTourSummaries } from "../services/driveMode";

type Props = {
  initialTourId?: string;
};

const driveTours = getDriveTourSummaries();

export function DriveScreen({ initialTourId }: Props) {
  const [selectedTourId, setSelectedTourId] = React.useState<string>(initialTourId || driveTours[0]?.id || "");

  React.useEffect(() => {
    if (initialTourId && driveTours.some((tour) => tour.id === initialTourId)) {
      setSelectedTourId(initialTourId);
    }
  }, [initialTourId]);

  const selectedTour = React.useMemo(
    () => driveTours.find((tour) => tour.id === selectedTourId) || driveTours[0],
    [selectedTourId]
  );
  const driveStops = React.useMemo(() => getDriveStops(selectedTour?.id || ""), [selectedTour?.id]);
  const nextStop = driveStops[0];

  async function previewArrivalHandoff() {
    if (!nextStop) {
      return;
    }
    try {
      await Linking.openURL(nextStop.handoffDeepLink);
    } catch (error) {
      Alert.alert("Handoff unavailable", (error as Error).message || "Could not open the handoff link.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>Drive companion</Text>
        <Text style={styles.heroTitle}>Route first. Audio next. Handoff on arrival.</Text>
        <Text style={styles.heroCopy}>
          This is the phone-side version of the future vehicle experience. It stays short, safe, and built around the next stop.
        </Text>
      </View>

      <Card style={styles.panel}>
        <Text style={styles.label}>Tour route</Text>
        <View style={styles.tourWrap}>
          {driveTours.map((tour) => (
            <Text
              key={tour.id}
              onPress={() => setSelectedTourId(tour.id)}
              style={[styles.tourChip, selectedTourId === tour.id && styles.tourChipActive, selectedTourId === tour.id && styles.tourChipTextActive]}
            >
              {tour.title}
            </Text>
          ))}
        </View>
      </Card>

      {selectedTour ? (
        <Card style={styles.featureCard}>
          <Text style={styles.featureEyebrow}>Current drive plan</Text>
          <Text style={styles.featureTitle}>{selectedTour.title}</Text>
          <Text style={styles.featureBody}>
            {selectedTour.durationMin} min | {selectedTour.distanceMiles} mi | {selectedTour.stopCount} stops
          </Text>
          <View style={styles.chips}>
            <Chip label={`Hero stop ${selectedTour.heroStopTitle || "selected"}`} tone="warn" />
            <Chip label="Phone handoff ready" tone="success" />
          </View>
        </Card>
      ) : null}

      {nextStop ? (
        <Card style={styles.panel}>
          <Text style={styles.label}>Next stop</Text>
          <Text style={styles.nextStopTitle}>{nextStop.title}</Text>
          <Text style={styles.copy}>{nextStop.arrivalSummary}</Text>
          <View style={styles.chips}>
            <Chip label={`${nextStop.triggerRadiusM}m arrival radius`} tone="default" />
            <Chip label={nextStop.handoffDeepLink.endsWith("/ar") ? "Continue to AR" : "Continue on foot"} tone="success" />
          </View>
          <Text style={styles.specLabel}>Handoff link</Text>
          <Text style={styles.handoffLink}>{nextStop.handoffDeepLink}</Text>
          <View style={styles.actions}>
            <PrimaryButton label="Start Drive Session" onPress={() => undefined} />
            <PrimaryButton label="Preview Arrival Handoff" onPress={previewArrivalHandoff} />
          </View>
        </Card>
      ) : null}

      <Card style={styles.panel}>
        <Text style={styles.label}>Upcoming stops</Text>
        {driveStops.slice(0, 5).map((stop, index) => (
          <View key={stop.id} style={styles.stopRow}>
            <View style={styles.stopIndexWrap}>
              <Text style={styles.stopIndex}>{index + 1}</Text>
            </View>
            <View style={styles.stopContent}>
              <Text style={styles.stopTitle}>{stop.title}</Text>
              <Text style={styles.copy}>{stop.arrivalSummary}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.label}>Vehicle product rules</Text>
        <Text style={styles.copy}>Use the dashboard to route and narrate. Use the phone to pay, browse deeply, and launch AR on foot.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 16,
    backgroundColor: "#060312"
  },
  heroPanel: {
    backgroundColor: "#130a25",
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 173, 0.16)"
  },
  heroEyebrow: {
    color: "#ff9ab2",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  heroTitle: {
    color: "#fff3ea",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800"
  },
  heroCopy: {
    color: "#d8c7df",
    lineHeight: 21
  },
  panel: {
    backgroundColor: "#120a22",
    gap: 10
  },
  featureCard: {
    backgroundColor: "#2b1530",
    borderColor: "rgba(255, 176, 132, 0.2)",
    gap: 10
  },
  featureEyebrow: {
    color: "#ffbc8a",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9
  },
  featureTitle: {
    color: "#fff8f3",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800"
  },
  featureBody: {
    color: "#f3e8ef",
    lineHeight: 22
  },
  label: {
    color: "#fff0e4",
    fontSize: 18,
    fontWeight: "800"
  },
  tourWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tourChip: {
    backgroundColor: "#1f1233",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    color: "#cab6d2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontWeight: "700",
    overflow: "hidden"
  },
  tourChipActive: {
    backgroundColor: "#ff8ca8",
    borderColor: "#ff8ca8"
  },
  tourChipTextActive: {
    color: "#2b1021"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  nextStopTitle: {
    color: "#fff8f3",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800"
  },
  specLabel: {
    color: "#ffcfb5",
    fontWeight: "700"
  },
  handoffLink: {
    color: "#b9f0df",
    fontWeight: "700"
  },
  actions: {
    gap: 8
  },
  stopRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    paddingVertical: 6
  },
  stopIndexWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#231338",
    alignItems: "center",
    justifyContent: "center"
  },
  stopIndex: {
    color: "#fff3ea",
    fontWeight: "800"
  },
  stopContent: {
    flex: 1,
    gap: 4
  },
  stopTitle: {
    color: "#fff5ee",
    fontWeight: "800"
  },
  copy: {
    color: "#d8c7df",
    lineHeight: 21
  }
});
