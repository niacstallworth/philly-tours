import AsyncStorage from "@react-native-async-storage/async-storage";
import { tours } from "../data/tours";

export type GameProgressSnapshot = {
  openedStopIds: string[];
  completedStopIds: string[];
  narratedStopIds: string[];
  discoveredArStopIds: string[];
  totalXp: number;
  scoreEvents: GameScoreEvent[];
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string | null;
  dailyNarrationCount: number;
  dailyQuestDate: string;
  updatedAt: number;
};

export type GameScoreEvent = {
  id: string;
  label: string;
  xp: number;
  createdAt: number;
};

type GameProgressState = {
  openedStopIds: Set<string>;
  completedStopIds: Set<string>;
  narratedStopIds: Set<string>;
  discoveredArStopIds: Set<string>;
  totalXp: number;
  scoreEvents: GameScoreEvent[];
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string | null;
  dailyNarrationCount: number;
  dailyQuestDate: string;
  updatedAt: number;
};

type GameProgressListener = (snapshot: GameProgressSnapshot) => void;

const GAME_PROGRESS_STORAGE_KEY = "philly_tours_game_progress_v1";
const XP_OPEN_STOP = 10;
const XP_HEAR_NARRATION = 25;
const XP_COMPLETE_STOP = 40;
const XP_DISCOVER_AR = 60;
const listeners = new Set<GameProgressListener>();

let hydrated = false;
let progressState: GameProgressState = {
  openedStopIds: new Set(),
  completedStopIds: new Set(),
  narratedStopIds: new Set(),
  discoveredArStopIds: new Set(),
  totalXp: 0,
  scoreEvents: [],
  currentStreakDays: 0,
  longestStreakDays: 0,
  lastActiveDate: null,
  dailyNarrationCount: 0,
  dailyQuestDate: getTodayKey(),
  updatedAt: Date.now()
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPreviousDayKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() - 1);
  const previousYear = date.getFullYear();
  const previousMonth = String(date.getMonth() + 1).padStart(2, "0");
  const previousDay = String(date.getDate()).padStart(2, "0");
  return `${previousYear}-${previousMonth}-${previousDay}`;
}

const stopIndex = new Map(
  tours.flatMap((tour) =>
    tour.stops.map((stop) => [
      stop.id,
      {
        tourId: tour.id,
        arReady: Boolean(stop.arType && stop.arType !== "none")
      }
    ] as const)
  )
);

function snapshotFromState(): GameProgressSnapshot {
  return {
    openedStopIds: Array.from(progressState.openedStopIds),
    completedStopIds: Array.from(progressState.completedStopIds),
    narratedStopIds: Array.from(progressState.narratedStopIds),
    discoveredArStopIds: Array.from(progressState.discoveredArStopIds),
    totalXp: progressState.totalXp,
    scoreEvents: progressState.scoreEvents.slice(-10),
    currentStreakDays: progressState.currentStreakDays,
    longestStreakDays: progressState.longestStreakDays,
    lastActiveDate: progressState.lastActiveDate,
    dailyNarrationCount: progressState.dailyNarrationCount,
    dailyQuestDate: progressState.dailyQuestDate,
    updatedAt: progressState.updatedAt
  };
}

function toStringSet(value: unknown) {
  return new Set(Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : []);
}

function normalizeScoreEvents(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((entry): entry is GameScoreEvent => {
      const candidate = entry as Partial<GameScoreEvent>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.label === "string" &&
        typeof candidate.xp === "number" &&
        typeof candidate.createdAt === "number"
      );
    })
    .slice(-10);
}

function estimateXpFromProgress(candidate: Partial<GameProgressSnapshot>) {
  const openedCount = Array.isArray(candidate.openedStopIds) ? candidate.openedStopIds.length : 0;
  const narratedCount = Array.isArray(candidate.narratedStopIds) ? candidate.narratedStopIds.length : 0;
  const completedCount = Array.isArray(candidate.completedStopIds) ? candidate.completedStopIds.length : 0;
  const arCount = Array.isArray(candidate.discoveredArStopIds) ? candidate.discoveredArStopIds.length : 0;
  return openedCount * XP_OPEN_STOP + narratedCount * XP_HEAR_NARRATION + completedCount * XP_COMPLETE_STOP + arCount * XP_DISCOVER_AR;
}

function normalizeSnapshot(value: unknown): GameProgressState {
  if (!value || typeof value !== "object") {
    return progressState;
  }
  const candidate = value as Partial<GameProgressSnapshot>;
  return {
    openedStopIds: toStringSet(candidate.openedStopIds),
    completedStopIds: toStringSet(candidate.completedStopIds),
    narratedStopIds: toStringSet(candidate.narratedStopIds),
    discoveredArStopIds: toStringSet(candidate.discoveredArStopIds),
    totalXp: typeof candidate.totalXp === "number" ? candidate.totalXp : estimateXpFromProgress(candidate),
    scoreEvents: normalizeScoreEvents(candidate.scoreEvents),
    currentStreakDays: typeof candidate.currentStreakDays === "number" ? candidate.currentStreakDays : 0,
    longestStreakDays: typeof candidate.longestStreakDays === "number" ? candidate.longestStreakDays : 0,
    lastActiveDate: typeof candidate.lastActiveDate === "string" ? candidate.lastActiveDate : null,
    dailyNarrationCount: typeof candidate.dailyNarrationCount === "number" ? candidate.dailyNarrationCount : 0,
    dailyQuestDate: typeof candidate.dailyQuestDate === "string" ? candidate.dailyQuestDate : getTodayKey(),
    updatedAt: typeof candidate.updatedAt === "number" ? candidate.updatedAt : Date.now()
  };
}

function touchStreak() {
  const today = getTodayKey();
  if (progressState.lastActiveDate === today) {
    return;
  }
  const yesterday = getPreviousDayKey(today);
  progressState.currentStreakDays = progressState.lastActiveDate === yesterday ? progressState.currentStreakDays + 1 : 1;
  progressState.longestStreakDays = Math.max(progressState.longestStreakDays, progressState.currentStreakDays);
  progressState.lastActiveDate = today;
}

function awardXp(id: string, xp: number, label: string) {
  if (progressState.scoreEvents.some((event) => event.id === id)) {
    return false;
  }
  progressState.totalXp += xp;
  progressState.scoreEvents = [
    ...progressState.scoreEvents,
    {
      id,
      xp,
      label,
      createdAt: Date.now()
    }
  ].slice(-10);
  return true;
}

function incrementDailyNarrationCount() {
  const today = getTodayKey();
  if (progressState.dailyQuestDate !== today) {
    progressState.dailyQuestDate = today;
    progressState.dailyNarrationCount = 0;
  }
  progressState.dailyNarrationCount += 1;
}

function emit() {
  const snapshot = snapshotFromState();
  listeners.forEach((listener) => listener(snapshot));
}

async function persist() {
  try {
    await AsyncStorage.setItem(GAME_PROGRESS_STORAGE_KEY, JSON.stringify(snapshotFromState()));
  } catch {
    // Progress is nice-to-have; keep in-memory state if storage is unavailable.
  }
}

export async function hydrateGameProgress() {
  if (hydrated) {
    return snapshotFromState();
  }
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(GAME_PROGRESS_STORAGE_KEY);
    if (raw) {
      progressState = normalizeSnapshot(JSON.parse(raw));
      emit();
    }
  } catch {
    // Keep defaults if stored progress cannot be read.
  }
  return snapshotFromState();
}

export function getGameProgressSnapshot() {
  void hydrateGameProgress();
  return snapshotFromState();
}

export function subscribeToGameProgress(listener: GameProgressListener) {
  listeners.add(listener);
  listener(snapshotFromState());
  void hydrateGameProgress();
  return () => {
    listeners.delete(listener);
  };
}

function updateProgress(mutator: () => boolean) {
  const changed = mutator();
  if (!changed) {
    return;
  }
  progressState.updatedAt = Date.now();
  touchStreak();
  emit();
  void persist();
}

export function recordStopOpened(stopId: string | null | undefined) {
  if (!stopId || !stopIndex.has(stopId)) {
    return;
  }
  updateProgress(() => {
    const beforeOpened = progressState.openedStopIds.size;
    const beforeAr = progressState.discoveredArStopIds.size;
    const beforeXp = progressState.totalXp;
    progressState.openedStopIds.add(stopId);
    if (beforeOpened !== progressState.openedStopIds.size) {
      awardXp(`open:${stopId}`, XP_OPEN_STOP, "Opened a stop");
    }
    if (stopIndex.get(stopId)?.arReady) {
      progressState.discoveredArStopIds.add(stopId);
      if (beforeAr !== progressState.discoveredArStopIds.size) {
        awardXp(`ar:${stopId}`, XP_DISCOVER_AR, "Discovered an AR stop");
      }
    }
    return beforeOpened !== progressState.openedStopIds.size || beforeAr !== progressState.discoveredArStopIds.size || beforeXp !== progressState.totalXp;
  });
}

export function recordNarrationStarted(stopId: string | null | undefined) {
  if (!stopId || !stopIndex.has(stopId)) {
    return;
  }
  updateProgress(() => {
    const beforeNarrated = progressState.narratedStopIds.size;
    const beforeOpened = progressState.openedStopIds.size;
    const beforeDailyCount = progressState.dailyNarrationCount;
    const beforeAr = progressState.discoveredArStopIds.size;
    const beforeXp = progressState.totalXp;
    progressState.openedStopIds.add(stopId);
    if (beforeOpened !== progressState.openedStopIds.size) {
      awardXp(`open:${stopId}`, XP_OPEN_STOP, "Opened a stop");
    }
    progressState.narratedStopIds.add(stopId);
    if (beforeNarrated !== progressState.narratedStopIds.size) {
      awardXp(`narration:${stopId}`, XP_HEAR_NARRATION, "Heard a story");
    }
    if (stopIndex.get(stopId)?.arReady) {
      progressState.discoveredArStopIds.add(stopId);
      if (beforeAr !== progressState.discoveredArStopIds.size) {
        awardXp(`ar:${stopId}`, XP_DISCOVER_AR, "Discovered an AR stop");
      }
    }
    incrementDailyNarrationCount();
    return (
      beforeNarrated !== progressState.narratedStopIds.size ||
      beforeOpened !== progressState.openedStopIds.size ||
      beforeDailyCount !== progressState.dailyNarrationCount ||
      beforeAr !== progressState.discoveredArStopIds.size ||
      beforeXp !== progressState.totalXp
    );
  });
}

export function recordStopCompleted(stopId: string | null | undefined) {
  if (!stopId || !stopIndex.has(stopId)) {
    return;
  }
  updateProgress(() => {
    const beforeCompleted = progressState.completedStopIds.size;
    const beforeAr = progressState.discoveredArStopIds.size;
    const beforeXp = progressState.totalXp;
    progressState.openedStopIds.add(stopId);
    progressState.narratedStopIds.add(stopId);
    progressState.completedStopIds.add(stopId);
    if (beforeCompleted !== progressState.completedStopIds.size) {
      awardXp(`complete:${stopId}`, XP_COMPLETE_STOP, "Completed a stop");
    }
    if (stopIndex.get(stopId)?.arReady) {
      progressState.discoveredArStopIds.add(stopId);
      if (beforeAr !== progressState.discoveredArStopIds.size) {
        awardXp(`ar:${stopId}`, XP_DISCOVER_AR, "Discovered an AR stop");
      }
    }
    return beforeCompleted !== progressState.completedStopIds.size || beforeAr !== progressState.discoveredArStopIds.size || beforeXp !== progressState.totalXp;
  });
}

export async function clearGameProgress() {
  progressState = {
    openedStopIds: new Set(),
    completedStopIds: new Set(),
    narratedStopIds: new Set(),
    discoveredArStopIds: new Set(),
    totalXp: 0,
    scoreEvents: [],
    currentStreakDays: 0,
    longestStreakDays: 0,
    lastActiveDate: null,
    dailyNarrationCount: 0,
    dailyQuestDate: getTodayKey(),
    updatedAt: Date.now()
  };
  emit();
  await AsyncStorage.removeItem(GAME_PROGRESS_STORAGE_KEY);
}
