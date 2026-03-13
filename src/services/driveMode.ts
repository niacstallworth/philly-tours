import { tours } from "../data/tours";

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
