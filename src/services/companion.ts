import { tours } from "../data/tours";
import { getNarrationState, startNarration, stopNarration } from "./narration";
import { getCurrentTourContext, openTourStopOnPhone } from "./tourControl";
import {
  disconnectWearable,
  getWearableStatus,
  pairWearable,
  refreshWearableStatus,
  subscribeToWearableStatus,
  type WearableStatus
} from "./wearables";

export type CompanionCommand =
  | { type: "start_tour"; tourId: string }
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
      openTourStopOnPhone(targetTour.id, firstStop.id, "map");
      result = {
        ok: true,
        message: `Opened ${targetTour.title} on the phone.`,
        deepLink: `phillyartours://tour/${encodeURIComponent(targetTour.id)}/stop/${encodeURIComponent(firstStop.id)}/map`
      };
      break;
    }
    case "next_stop": {
      if (!context?.nextStop) {
        result = { ok: false, message: "There is no next stop ready from the current tour context." };
        break;
      }
      openTourStopOnPhone(context.tour.id, context.nextStop.id, "map");
      await startNarration({
        id: context.nextStop.id,
        title: context.nextStop.title,
        lat: context.nextStop.lat,
        lng: context.nextStop.lng,
        triggerRadiusM: context.nextStop.triggerRadiusM,
        audioUrl: context.nextStop.audioUrl,
        summary: context.nextStop.description.split("|")[0]?.trim() || context.nextStop.description
      });
      result = {
        ok: true,
        message: `Advanced to ${context.nextStop.title}.`,
        deepLink: `phillyartours://tour/${encodeURIComponent(context.tour.id)}/stop/${encodeURIComponent(context.nextStop.id)}/map`
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
      openTourStopOnPhone(command.tourId, command.stopId, "map");
      result = {
        ok: true,
        message: "Phone AR handoff prepared.",
        deepLink: `phillyartours://tour/${encodeURIComponent(command.tourId)}/stop/${encodeURIComponent(command.stopId)}/map`
      };
      break;
    }
    default:
      result = { ok: false, message: "Unsupported companion command." };
  }

  emitCommandResult(command, result);
  return result;
}
