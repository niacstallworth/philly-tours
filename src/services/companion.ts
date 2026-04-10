import { tours } from "../data/tours";
import { buildHandoffUrl } from "./deepLinks";
import { getNarrationState, startNarration, stopNarration } from "./narration";
import { getCurrentTourContext, openTourStopOnPhone } from "./tourControl";
import {
  disconnectWearable,
  getWearableStatus,
  pairMockWearable,
  pairWearable,
  refreshWearableStatus,
  subscribeToWearableStatus,
  type WearableStatus
} from "./wearables";

export type CompanionCommand =
  | { type: "start_tour"; tourId: string }
  | { type: "previous_stop" }
  | { type: "next_stop" }
  | { type: "repeat_narration" }
  | { type: "pause_narration" }
  | { type: "resume_narration" }
  | { type: "get_stop_context" }
  | { type: "open_ar_on_phone"; tourId: string; stopId: string };

export type CompanionCommandResult = {
  ok: boolean;
  message: string;
  deepLink?: string;
  payload?: Record<string, unknown>;
};

export type CompanionCommandLog = {
  commandType: CompanionCommand["type"];
  result: CompanionCommandResult;
  recordedAt: number;
} | null;

type CompanionCommandListener = (entry: CompanionCommandLog) => void;

const commandListeners = new Set<CompanionCommandListener>();
let lastCommandLog: CompanionCommandLog = null;

function emitCommandResult(command: CompanionCommand, result: CompanionCommandResult) {
  lastCommandLog = {
    commandType: command.type,
    result,
    recordedAt: Date.now()
  };
  commandListeners.forEach((listener) => listener(lastCommandLog));
}

export function getCompanionStatus() {
  return getWearableStatus();
}

export function subscribeToCompanionStatus(listener: (status: WearableStatus) => void) {
  return subscribeToWearableStatus(listener);
}

export async function connectCompanion() {
  return pairWearable();
}

export async function connectMockCompanion() {
  return pairMockWearable();
}

export async function disconnectCompanion() {
  return disconnectWearable();
}

export async function refreshCompanionStatus() {
  return refreshWearableStatus();
}

export function getLastCompanionCommandResult() {
  return lastCommandLog;
}

export function subscribeToCompanionCommands(listener: CompanionCommandListener) {
  commandListeners.add(listener);
  listener(lastCommandLog);
  return () => {
    commandListeners.delete(listener);
  };
}

function getTourById(tourId: string) {
  return tours.find((tour) => tour.id === tourId) || null;
}

function getStopForTour(tourId: string, stopId: string) {
  const tour = getTourById(tourId);
  if (!tour) {
    return { tour: null, stop: null };
  }
  return {
    tour,
    stop: tour.stops.find((candidate) => candidate.id === stopId) || null
  };
}

function runPhoneHandoffPreflight(tourId: string, stopId: string) {
  const { tour, stop } = getStopForTour(tourId, stopId);

  if (!tour) {
    return {
      ok: false as const,
      message: `Tour ${tourId} is no longer available in this build.`
    };
  }

  if (!stop) {
    return {
      ok: false as const,
      message: `Stop ${stopId} is not part of ${tour.title}.`
    };
  }

  return {
    ok: true as const,
    tour,
    stop,
    deepLink: buildHandoffUrl({
      tourId: tour.id,
      stopId: stop.id,
      mode: "map"
    }),
    hasNarration: Boolean(stop.audioUrl),
    hasCoordinates: typeof stop.lat === "number" && typeof stop.lng === "number",
    hasArAssets: Boolean(stop.modelUrl || stop.arType || stop.assetNeeded)
  };
}

export async function handleWearableCommand(command: CompanionCommand): Promise<CompanionCommandResult> {
  const context = getCurrentTourContext();
  let result: CompanionCommandResult;

  switch (command.type) {
    case "start_tour": {
      const targetTour = tours.find((tour) => tour.id === command.tourId);
      const firstStop = targetTour?.stops[0];
      if (!targetTour || !firstStop) {
        result = { ok: false, message: `Tour ${command.tourId} could not be opened.` };
        break;
      }
      const preflight = runPhoneHandoffPreflight(targetTour.id, firstStop.id);
      if (!preflight.ok) {
        result = { ok: false, message: preflight.message };
        break;
      }
      openTourStopOnPhone(targetTour.id, firstStop.id, "map");
      result = {
        ok: true,
        message: `Opened ${targetTour.title} on the phone at ${firstStop.title}.`,
        deepLink: preflight.deepLink,
        payload: {
          stopId: firstStop.id,
          hasNarration: preflight.hasNarration,
          hasCoordinates: preflight.hasCoordinates
        }
      };
      break;
    }
    case "previous_stop": {
      if (!context?.tour || !context?.stop || context.stopIndex <= 0) {
        result = { ok: false, message: "There is no previous stop ready from the current tour context." };
        break;
      }
      const previousStop = context.tour.stops[context.stopIndex - 1];
      const preflight = runPhoneHandoffPreflight(context.tour.id, previousStop.id);
      if (!preflight.ok) {
        result = { ok: false, message: preflight.message };
        break;
      }
      openTourStopOnPhone(context.tour.id, previousStop.id, "map");
      if (preflight.hasNarration) {
        await startNarration({
          id: previousStop.id,
          title: previousStop.title,
          lat: previousStop.lat,
          lng: previousStop.lng,
          triggerRadiusM: previousStop.triggerRadiusM,
          audioUrl: previousStop.audioUrl,
          summary: previousStop.description.split("|")[0]?.trim() || previousStop.description
        });
      }
      result = {
        ok: true,
        message: preflight.hasNarration
          ? `Moved back to ${previousStop.title} and started narration.`
          : `Moved back to ${previousStop.title}. Narration is not ready for this stop yet.`,
        deepLink: preflight.deepLink,
        payload: {
          stopId: previousStop.id,
          hasNarration: preflight.hasNarration,
          hasCoordinates: preflight.hasCoordinates,
          hasArAssets: preflight.hasArAssets
        }
      };
      break;
    }
    case "next_stop": {
      if (!context?.nextStop) {
        result = { ok: false, message: "There is no next stop ready from the current tour context." };
        break;
      }
      const preflight = runPhoneHandoffPreflight(context.tour.id, context.nextStop.id);
      if (!preflight.ok) {
        result = { ok: false, message: preflight.message };
        break;
      }
      openTourStopOnPhone(context.tour.id, context.nextStop.id, "map");
      if (preflight.hasNarration) {
        await startNarration({
          id: context.nextStop.id,
          title: context.nextStop.title,
          lat: context.nextStop.lat,
          lng: context.nextStop.lng,
          triggerRadiusM: context.nextStop.triggerRadiusM,
          audioUrl: context.nextStop.audioUrl,
          summary: context.nextStop.description.split("|")[0]?.trim() || context.nextStop.description
        });
      }
      result = {
        ok: true,
        message: preflight.hasNarration
          ? `Advanced to ${context.nextStop.title} and started narration.`
          : `Advanced to ${context.nextStop.title}. Narration is not ready for this stop yet.`,
        deepLink: preflight.deepLink,
        payload: {
          stopId: context.nextStop.id,
          hasNarration: preflight.hasNarration,
          hasCoordinates: preflight.hasCoordinates,
          hasArAssets: preflight.hasArAssets
        }
      };
      break;
    }
    case "repeat_narration": {
      if (!context?.stop) {
        result = { ok: false, message: "No current stop is selected for narration." };
        break;
      }
      await startNarration({
        id: context.stop.id,
        title: context.stop.title,
        lat: context.stop.lat,
        lng: context.stop.lng,
        triggerRadiusM: context.stop.triggerRadiusM,
        audioUrl: context.stop.audioUrl,
        summary: context.stop.description.split("|")[0]?.trim() || context.stop.description
      });
      result = { ok: true, message: `Replaying narration for ${context.stop.title}.` };
      break;
    }
    case "pause_narration":
      await stopNarration();
      result = { ok: true, message: "Narration stopped." };
      break;
    case "resume_narration": {
      const narration = getNarrationState();
      if (!context?.stop && !narration.stopId) {
        result = { ok: false, message: "No recent stop is available to resume." };
        break;
      }
      const stop = context?.stop;
      if (!stop) {
        result = { ok: false, message: "No stop context is available to resume narration." };
        break;
      }
      await startNarration({
        id: stop.id,
        title: stop.title,
        lat: stop.lat,
        lng: stop.lng,
        triggerRadiusM: stop.triggerRadiusM,
        audioUrl: stop.audioUrl,
        summary: stop.description.split("|")[0]?.trim() || stop.description
      });
      result = { ok: true, message: `Resumed narration for ${stop.title}.` };
      break;
    }
    case "get_stop_context":
      if (!context?.stop) {
        result = { ok: false, message: "No current stop is selected." };
        break;
      }
      result = {
        ok: true,
        message: `${context.stop.title}: ${context.stop.description.split("|")[0]?.trim() || context.stop.description}`,
        payload: {
          tourId: context.tour.id,
          stopId: context.stop.id,
          title: context.stop.title,
          index: context.stopIndex + 1,
          totalStops: context.tour.stops.length
        }
      };
      break;
    case "open_ar_on_phone": {
      const preflight = runPhoneHandoffPreflight(command.tourId, command.stopId);
      if (!preflight.ok) {
        result = { ok: false, message: preflight.message };
        break;
      }

      openTourStopOnPhone(command.tourId, command.stopId, "map");
      result = {
        ok: true,
        message: preflight.hasArAssets
          ? `Phone AR handoff prepared for ${preflight.stop.title}.`
          : `Opened ${preflight.stop.title} on the phone. AR-specific assets are not ready for this stop yet.`,
        deepLink: preflight.deepLink,
        payload: {
          tourId: preflight.tour.id,
          stopId: preflight.stop.id,
          hasNarration: preflight.hasNarration,
          hasCoordinates: preflight.hasCoordinates,
          hasArAssets: preflight.hasArAssets
        }
      };
      break;
    }
    default:
      result = { ok: false, message: "Unsupported companion command." };
  }

  emitCommandResult(command, result);
  return result;
}
