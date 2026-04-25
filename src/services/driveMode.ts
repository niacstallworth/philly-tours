import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCityTours } from "../city-runtime/getCityTours";

const tours = getCityTours();

const DRIVE_SESSION_KEY = "philly_tours_drive_session_v1";
const driveSessionListeners = new Set<(session: DriveSession | null) => void>();

export type DriveTourSummary = {
  id: string;
  title: string;
  durationMin: number;
  distanceMiles: number;
  stopCount: number;
  heroStopTitle?: string;
};

export type DriveStop = {
  id: string;
  tourId: string;
  title: string;
  lat: number;
  lng: number;
  triggerRadiusM: number;
  audioUrl: string;
  arrivalSummary: string;
  handoffDeepLink: string;
};

export type DriveSession = {
  tourId: string;
  currentStopId: string;
  startedAt: number;
  mode: "drive" | "arrived" | "handoff";
};

function notifyDriveSessionListeners(session: DriveSession | null) {
  driveSessionListeners.forEach((listener) => listener(session));
}

function summarizeStopDescription(description: string) {
  return description.split("|")[0]?.trim() || "Arrive and continue on foot.";
}

export function buildTourHandoffLink(tourId: string, stopId: string, mode: "arrive" | "map" | "ar" = "arrive") {
  return `phillyartours://tour/${tourId}/stop/${stopId}/${mode}`;
}

export function getDriveTourSummaries(): DriveTourSummary[] {
  return tours.map((tour) => ({
    id: tour.id,
    title: tour.title,
    durationMin: tour.durationMin,
    distanceMiles: tour.distanceMiles,
    stopCount: tour.stops.length,
    heroStopTitle: tour.stops[0]?.title
  }));
}

export function getDriveStops(tourId: string): DriveStop[] {
  const tour = tours.find((entry) => entry.id === tourId);
  if (!tour) {
    return [];
  }

  return tour.stops.map((stop) => ({
    id: stop.id,
    tourId: tour.id,
    title: stop.title,
    lat: stop.lat,
    lng: stop.lng,
    triggerRadiusM: stop.triggerRadiusM,
    audioUrl: stop.audioUrl,
    arrivalSummary: summarizeStopDescription(stop.description),
    handoffDeepLink: buildTourHandoffLink(tour.id, stop.id, stop.arPriority ? "ar" : "arrive")
  }));
}

export function createDriveSession(tourId: string, currentStopId: string, mode: DriveSession["mode"]): DriveSession {
  return {
    tourId,
    currentStopId,
    startedAt: Date.now(),
    mode
  };
}

export function getDriveStopIndex(tourId: string, stopId: string) {
  return getDriveStops(tourId).findIndex((stop) => stop.id === stopId);
}

export function getCurrentDriveStop(session: DriveSession | null) {
  if (!session) {
    return null;
  }
  return getDriveStops(session.tourId).find((stop) => stop.id === session.currentStopId) || null;
}

export function getNextDriveStop(session: DriveSession | null) {
  if (!session) {
    return null;
  }
  const stops = getDriveStops(session.tourId);
  const currentIndex = stops.findIndex((stop) => stop.id === session.currentStopId);
  if (currentIndex < 0) {
    return stops[0] || null;
  }
  return stops[currentIndex + 1] || null;
}

export async function loadDriveSession(): Promise<DriveSession | null> {
  try {
    const raw = await AsyncStorage.getItem(DRIVE_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as DriveSession;
    if (!parsed.tourId || !parsed.currentStopId || !parsed.mode) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveDriveSession(session: DriveSession): Promise<void> {
  await AsyncStorage.setItem(DRIVE_SESSION_KEY, JSON.stringify(session));
  notifyDriveSessionListeners(session);
}

export async function clearDriveSession(): Promise<void> {
  await AsyncStorage.removeItem(DRIVE_SESSION_KEY);
  notifyDriveSessionListeners(null);
}

export function subscribeToDriveSession(listener: (session: DriveSession | null) => void) {
  driveSessionListeners.add(listener);
  return () => {
    driveSessionListeners.delete(listener);
  };
}

export async function startDriveSession(tourId: string) {
  const firstStop = getDriveStops(tourId)[0];
  if (!firstStop) {
    throw new Error("This tour has no drivable stops.");
  }
  const session = createDriveSession(tourId, firstStop.id, "drive");
  await saveDriveSession(session);
  return session;
}

export async function markDriveArrived(session: DriveSession) {
  const next = { ...session, mode: "arrived" as const };
  await saveDriveSession(next);
  return next;
}

export async function advanceDriveSession(session: DriveSession) {
  const nextStop = getNextDriveStop(session);
  if (!nextStop) {
    await clearDriveSession();
    return null;
  }
  const nextSession: DriveSession = {
    ...session,
    currentStopId: nextStop.id,
    mode: "drive"
  };
  await saveDriveSession(nextSession);
  return nextSession;
}
