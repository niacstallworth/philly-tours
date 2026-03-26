import { buildHandoffUrl, type HandoffTarget } from "./deepLinks";
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
  switch (command.type) {
    case "start_tour":
      return { ok: true, message: `Ready to start tour ${command.tourId} once Meta companion transport is wired.` };
    case "next_stop":
      return { ok: true, message: "Ready to advance to the next stop once companion routing is wired." };
    case "repeat_narration":
      return { ok: true, message: "Ready to repeat narration once wearable audio routing is wired." };
    case "pause_narration":
      return { ok: true, message: "Ready to pause narration once wearable audio routing is wired." };
    case "resume_narration":
      return { ok: true, message: "Ready to resume narration once wearable audio routing is wired." };
    case "get_stop_context":
      return { ok: true, message: "Ready to fetch stop context once companion context requests are wired." };
    case "open_ar_on_phone": {
      const deepLink = buildHandoffUrl({
        tourId: command.tourId,
        stopId: command.stopId,
        mode: "map"
      } satisfies HandoffTarget);
      return {
        ok: true,
        message: "Phone AR handoff prepared.",
        deepLink
      };
    }
    default:
      return { ok: false, message: "Unsupported companion command." };
  }
}
