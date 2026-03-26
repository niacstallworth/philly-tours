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

export async function handleWearableCommand(command: CompanionCommand): Promise<CompanionCommandResult> {
  const context = getCurrentTourContext();

  switch (command.type) {
    case "start_tour": {
      const targetTour = tours.find((tour) => tour.id === command.tourId);
      const firstStop = targetTour?.stops[0];
      if (!targetTour || !firstStop) {
        return { ok: false, message: `Tour ${command.tourId} could not be opened.` };
      }
      openTourStopOnPhone(targetTour.id, firstStop.id, "map");
      return {
        ok: true,
        message: `Opened ${targetTour.title} on the phone.`,
        deepLink: `phillyartours://tour/${encodeURIComponent(targetTour.id)}/stop/${encodeURIComponent(firstStop.id)}/map`
      };
    }
    case "next_stop": {
      if (!context?.nextStop) {
        return { ok: false, message: "There is no next stop ready from the current tour context." };
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
      return {
        ok: true,
        message: `Advanced to ${context.nextStop.title}.`,
        deepLink: `phillyartours://tour/${encodeURIComponent(context.tour.id)}/stop/${encodeURIComponent(context.nextStop.id)}/map`
      };
    }
    case "repeat_narration": {
      if (!context?.stop) {
        return { ok: false, message: "No current stop is selected for narration." };
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
      return { ok: true, message: `Replaying narration for ${context.stop.title}.` };
    }
    case "pause_narration":
      await stopNarration();
      return { ok: true, message: "Narration stopped." };
    case "resume_narration": {
      const narration = getNarrationState();
      if (!context?.stop && !narration.stopId) {
        return { ok: false, message: "No recent stop is available to resume." };
      }
      const stop = context?.stop;
      if (!stop) {
        return { ok: false, message: "No stop context is available to resume narration." };
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
      return { ok: true, message: `Resumed narration for ${stop.title}.` };
    }
    case "get_stop_context":
      if (!context?.stop) {
        return { ok: false, message: "No current stop is selected." };
      }
      return {
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
    case "open_ar_on_phone": {
      openTourStopOnPhone(command.tourId, command.stopId, "map");
      return {
        ok: true,
        message: "Phone AR handoff prepared.",
        deepLink: `phillyartours://tour/${encodeURIComponent(command.tourId)}/stop/${encodeURIComponent(command.stopId)}/map`
      };
    }
    default:
      return { ok: false, message: "Unsupported companion command." };
  }
}
