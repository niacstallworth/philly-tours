import AsyncStorage from "@react-native-async-storage/async-storage";
import { tours } from "../data/tours";
import { haversineDistanceM } from "./geofence";
import { getCurrentPosition, requestForegroundLocationPermission, startLocationWatch, type PositionWatcher, type UserPosition } from "./location";

const SCAVENGER_STORAGE_KEY = "philly_tours_scavenger_hunt_v1";
const SCAVENGER_STARTED_STORAGE_KEY = "philly_tours_scavenger_hunt_started_v1";
const SCAVENGER_TOUR_IDS = new Set(["masonic-scavenger-hunt", "black-medical-legacy", "black-inventors-tour"]);
const METERS_PER_MILE = 1609.344;

export type ScavengerTone = "inventors" | "medical" | "masonic";
export type ScavengerPermissionState = "unknown" | "granted" | "denied";

export type ScavengerToken = {
  id: string;
  stopId: string;
  tourId: string;
  tourTitle: string;
  stopTitle: string;
  summary: string;
  lat: number;
  lng: number;
  triggerRadiusM: number;
  tone: ScavengerTone;
  glyph: string;
  gpsReady: boolean;
};

export type ScavengerHuntSnapshot = {
  tokens: ScavengerToken[];
  collectedIds: string[];
  startedTourIds: string[];
  latestRevealId: string | null;
  permission: ScavengerPermissionState;
  collectorActive: boolean;
  lastPosition: UserPosition | null;
};

const listeners = new Set<(snapshot: ScavengerHuntSnapshot) => void>();

const tokens: ScavengerToken[] = tours
  .filter((tour) => SCAVENGER_TOUR_IDS.has(tour.id))
  .flatMap((tour) =>
    tour.stops.map((stop) => ({
      id: stop.id,
      stopId: stop.id,
      tourId: tour.id,
      tourTitle: tour.title,
      stopTitle: stop.title,
      summary: stop.description.split("|")[0]?.trim() || stop.description,
      lat: stop.lat,
      lng: stop.lng,
      triggerRadiusM: stop.triggerRadiusM,
      tone: getToneForTour(tour.id),
      glyph: getGlyphForTour(tour.id),
      gpsReady: isGpsReady(stop.lat, stop.lng)
    }))
  );

let collectedIds = new Set<string>();
let startedTourIds = new Set<string>();
let latestRevealId: string | null = null;
let permission: ScavengerPermissionState = "unknown";
let collectorActive = false;
let lastPosition: UserPosition | null = null;
let watcher: PositionWatcher | null = null;
let bootPromise: Promise<void> | null = null;

function isGpsReady(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) > 0.001 && Math.abs(lng) > 0.001;
}

function getToneForTour(tourId: string): ScavengerTone {
  if (tourId === "black-inventors-tour") {
    return "inventors";
  }
  if (tourId === "black-medical-legacy") {
    return "medical";
  }
  return "masonic";
}

function getGlyphForTour(tourId: string) {
  if (tourId === "black-inventors-tour") {
    return "I";
  }
  if (tourId === "black-medical-legacy") {
    return "M";
  }
  return "S";
}

function emit() {
  const snapshot = getScavengerHuntSnapshot();
  listeners.forEach((listener) => listener(snapshot));
}

async function persistCollectedIds() {
  try {
    await AsyncStorage.setItem(SCAVENGER_STORAGE_KEY, JSON.stringify(Array.from(collectedIds)));
  } catch {
    // Keep in-memory progress even if persistence fails.
  }
}

async function persistStartedTourIds() {
  try {
    await AsyncStorage.setItem(SCAVENGER_STARTED_STORAGE_KEY, JSON.stringify(Array.from(startedTourIds)));
  } catch {
    // Keep in-memory progress even if persistence fails.
  }
}

async function boot() {
  if (bootPromise) {
    return bootPromise;
  }
  bootPromise = Promise.all([
    AsyncStorage.getItem(SCAVENGER_STORAGE_KEY),
    AsyncStorage.getItem(SCAVENGER_STARTED_STORAGE_KEY)
  ])
    .then(([collectedRaw, startedRaw]) => {
      if (collectedRaw) {
        const parsed = JSON.parse(collectedRaw) as unknown;
        if (Array.isArray(parsed)) {
          collectedIds = new Set(parsed.filter((value): value is string => typeof value === "string"));
        }
      }
      if (startedRaw) {
        const parsed = JSON.parse(startedRaw) as unknown;
        if (Array.isArray(parsed)) {
          startedTourIds = new Set(
            parsed.filter((value): value is string => typeof value === "string" && SCAVENGER_TOUR_IDS.has(value))
          );
        }
      }
    })
    .catch(() => undefined)
    .finally(() => {
      emit();
    });
  return bootPromise;
}

async function collectToken(tokenId: string) {
  if (collectedIds.has(tokenId)) {
    return false;
  }
  collectedIds = new Set(collectedIds).add(tokenId);
  latestRevealId = tokenId;
  await persistCollectedIds();
  emit();
  return true;
}

async function collectNearbyTokens(position: UserPosition) {
  lastPosition = position;
  let changed = false;
  for (const token of tokens) {
    if (!token.gpsReady || collectedIds.has(token.id) || !startedTourIds.has(token.tourId)) {
      continue;
    }
    const distance = haversineDistanceM(position.latitude, position.longitude, token.lat, token.lng);
    if (distance <= token.triggerRadiusM) {
      const didCollect = await collectToken(token.id);
      changed = changed || didCollect;
    }
  }
  if (!changed) {
    emit();
  }
}

export function getScavengerTokens() {
  return tokens;
}

export function getScavengerTokenById(tokenId: string) {
  return tokens.find((token) => token.id === tokenId) || null;
}

export function getScavengerHuntSnapshot(): ScavengerHuntSnapshot {
  return {
    tokens,
    collectedIds: Array.from(collectedIds),
    startedTourIds: Array.from(startedTourIds),
    latestRevealId,
    permission,
    collectorActive,
    lastPosition
  };
}

export async function startScavengerHunt(tourId: string) {
  await boot();
  if (!SCAVENGER_TOUR_IDS.has(tourId)) {
    return getScavengerHuntSnapshot();
  }
  if (!startedTourIds.has(tourId)) {
    startedTourIds = new Set(startedTourIds).add(tourId);
    await persistStartedTourIds();
  }

  if (collectorActive && lastPosition) {
    await collectNearbyTokens(lastPosition);
  }
  emit();
  return getScavengerHuntSnapshot();
}

export async function ensureScavengerHuntCollectorStarted() {
  await boot();
  if (collectorActive) {
    return getScavengerHuntSnapshot();
  }

  const granted = await requestForegroundLocationPermission();
  permission = granted ? "granted" : "denied";
  emit();
  if (!granted) {
    return getScavengerHuntSnapshot();
  }

  collectorActive = true;
  emit();

  try {
    const current = await getCurrentPosition();
    await collectNearbyTokens(current);
  } catch {
    // Ignore an initial location miss and let the watcher continue.
  }

  watcher = await startLocationWatch(
    (position) => {
      void collectNearbyTokens(position);
    },
    () => undefined
  );

  return getScavengerHuntSnapshot();
}

export function subscribeToScavengerHunt(listener: (snapshot: ScavengerHuntSnapshot) => void) {
  listeners.add(listener);
  listener(getScavengerHuntSnapshot());
  return () => {
    listeners.delete(listener);
  };
}

export async function dismissScavengerReveal() {
  latestRevealId = null;
  emit();
}

export async function resetScavengerHunt() {
  collectedIds = new Set<string>();
  startedTourIds = new Set<string>();
  latestRevealId = null;
  await Promise.all([
    AsyncStorage.removeItem(SCAVENGER_STORAGE_KEY).catch(() => undefined),
    AsyncStorage.removeItem(SCAVENGER_STARTED_STORAGE_KEY).catch(() => undefined)
  ]);
  emit();
}

export function getTokenDistanceLabel(token: ScavengerToken, position: UserPosition | null) {
  if (!token.gpsReady) {
    return "Coordinates pending";
  }
  if (!position) {
    return "Distance available once location is on";
  }
  const distance = haversineDistanceM(position.latitude, position.longitude, token.lat, token.lng);
  if (distance <= token.triggerRadiusM) {
    return "Ready to claim";
  }
  if (distance < 160) {
    return `${Math.round(distance)} m away`;
  }
  const miles = distance / METERS_PER_MILE;
  if (miles < 1) {
    return `${miles.toFixed(2)} mi away`;
  }
  return `${miles.toFixed(1)} mi away`;
}
