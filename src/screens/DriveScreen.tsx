import React from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import {
  DriveSession,
  advanceDriveSession,
  clearDriveSession,
  getCurrentDriveStop,
  getDriveStops,
  getDriveTourSummaries,
  getNextDriveStop,
  loadDriveSession,
  markDriveArrived,
  startDriveSession
} from "../services/driveMode";

type Props = {
  initialTourId?: string;
};

const driveTours = getDriveTourSummaries();

export function DriveScreen({ initialTourId }: Props) {
  const [selectedTourId, setSelectedTourId] = React.useState<string>(initialTourId || driveTours[0]?.id || "");
  const [driveSession, setDriveSession] = React.useState<DriveSession | null>(null);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready">("loading");

  React.useEffect(() => {
    if (initialTourId && driveTours.some((tour) => tour.id === initialTourId)) {
      setSelectedTourId(initialTourId);
    }
  }, [initialTourId]);

  React.useEffect(() => {
    loadDriveSession()
      .then((stored) => {
        if (!stored) {
          return;
        }
        setDriveSession(stored);
        setSelectedTourId(stored.tourId);
      })
      .finally(() => setStatus("ready"));
  }, []);

  const selectedTour = React.useMemo(
    () => driveTours.find((tour) => tour.id === selectedTourId) || driveTours[0],
    [selectedTourId]
  );
  const driveStops = React.useMemo(() => getDriveStops(selectedTour?.id || ""), [selectedTour?.id]);
  const activeSession = driveSession?.tourId === selectedTour?.id ? driveSession : null;
  const currentStop = React.useMemo(() => getCurrentDriveStop(activeSession), [activeSession]);
  const nextStop = React.useMemo(
    () => (activeSession ? getNextDriveStop(activeSession) : driveStops[0] || null),
    [activeSession, driveStops]
  );

  async function previewArrivalHandoff() {
    const targetStop = activeSession ? currentStop : nextStop;
    if (!targetStop) {
      return;
    }
    try {
      await Linking.openURL(targetStop.handoffDeepLink);
    } catch (error) {
      Alert.alert("Handoff unavailable", (error as Error).message || "Could not open the handoff link.");
    }
  }

  async function onStartDriveSession() {
    if (!selectedTour) {
      return;
    }
    try {
      const nextSession = await startDriveSession(selectedTour.id);
      setDriveSession(nextSession);
    } catch (error) {
      Alert.alert("Drive session unavailable", (error as Error).message || "Could not start this drive session.");
    }
  }

  async function onMarkArrived() {
    if (!activeSession) {
      return;
    }
    try {
      const nextSession = await markDriveArrived(activeSession);
      setDriveSession(nextSession);
    } catch (error) {
      Alert.alert("Arrival update failed", (error as Error).message || "Could not update arrival state.");
    }
  }

  async function onAdvanceStop() {
    if (!activeSession) {
      return;
    }
    try {
      const nextSession = await advanceDriveSession(activeSession);
      setDriveSession(nextSession);
      if (!nextSession) {
        Alert.alert("Drive session complete", "You reached the last stop in this drive route.");
      }
    } catch (error) {
      Alert.alert("Advance failed", (error as Error).message || "Could not move to the next stop.");
    }
  }

  async function onClearSession() {
    await clearDriveSession();
    setDriveSession(null);
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
          {driveTours.map((tour) => {
            const isActive = selectedTourId === tour.id;
            const hasSession = driveSession?.tourId === tour.id;
            return (
              <Text
                key={tour.id}
                onPress={() => setSelectedTourId(tour.id)}
                style={[styles.tourChip, isActive && styles.tourChipActive, isActive && styles.tourChipTextActive]}
              >
                {tour.title}{hasSession ? " • live" : ""}
              </Text>
            );
          })}
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
            <Chip label={activeSession ? `Session ${activeSession.mode}` : status === "loading" ? "Loading session" : "Ready to start"} tone="success" />
          </View>
        </Card>
      ) : null}

      {(currentStop || nextStop) ? (
        <Card style={styles.panel}>
          {currentStop ? (
            <>
              <Text style={styles.label}>Current stop</Text>
              <Text style={styles.nextStopTitle}>{currentStop.title}</Text>
              <Text style={styles.copy}>{currentStop.arrivalSummary}</Text>
              <View style={styles.chips}>
                <Chip label={activeSession?.mode === "arrived" ? "Arrived" : "Driving now"} tone="success" />
                <Chip label={currentStop.handoffDeepLink.endsWith("/ar") ? "AR handoff" : "On-foot handoff"} tone="warn" />
              </View>
              <Text style={styles.specLabel}>Handoff link</Text>
              <Text style={styles.handoffLink}>{currentStop.handoffDeepLink}</Text>
            </>
          ) : null}

          {nextStop ? (
            <>
              <Text style={styles.label}>{currentStop ? "Up next" : "Next stop"}</Text>
              <Text style={styles.nextStopTitle}>{nextStop.title}</Text>
              <Text style={styles.copy}>{nextStop.arrivalSummary}</Text>
              <View style={styles.chips}>
                <Chip label={`${nextStop.triggerRadiusM}m arrival radius`} tone="default" />
                <Chip label={nextStop.handoffDeepLink.endsWith("/ar") ? "Continue to AR" : "Continue on foot"} tone="success" />
              </View>
            </>
          ) : null}

          <View style={styles.actions}>
            {!activeSession ? <PrimaryButton label="Start Drive Session" onPress={onStartDriveSession} /> : null}
            {activeSession && activeSession.mode !== "arrived" ? (
              <PrimaryButton label="Mark Arrived" onPress={onMarkArrived} />
            ) : null}
            {activeSession ? <PrimaryButton label="Preview Arrival Handoff" onPress={previewArrivalHandoff} /> : null}
            {activeSession ? <PrimaryButton label="Advance To Next Stop" onPress={onAdvanceStop} /> : null}
            {activeSession ? <PrimaryButton label="Clear Drive Session" onPress={onClearSession} /> : null}
          </View>
        </Card>
      ) : null}

      <Card style={styles.panel}>
        <Text style={styles.label}>Upcoming stops</Text>
        {driveStops.slice(0, 5).map((stop, index) => {
          const isCurrent = currentStop?.id === stop.id;
          const isNext = nextStop?.id === stop.id;
          return (
            <View key={stop.id} style={styles.stopRow}>
              <View style={[styles.stopIndexWrap, isCurrent && styles.stopIndexWrapCurrent, isNext && styles.stopIndexWrapNext]}>
                <Text style={styles.stopIndex}>{index + 1}</Text>
              </View>
              <View style={styles.stopContent}>
                <Text style={styles.stopTitle}>
                  {stop.title}
                  {isCurrent ? " • current" : isNext ? " • next" : ""}
                </Text>
                <Text style={styles.copy}>{stop.arrivalSummary}</Text>
              </View>
            </View>
          );
        })}
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
  stopIndexWrapCurrent: {
    backgroundColor: "#ff8ca8"
  },
  stopIndexWrapNext: {
    backgroundColor: "#8fd7c3"
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
