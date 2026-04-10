import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import { handleWearableCommand } from "./companion";
import { getNarrationState, subscribeToNarration, type NarrationState } from "./narration";

type MediaButtonsModule = {
  activateSession(): Promise<void>;
  deactivateSession(): Promise<void>;
  updatePlaybackState(state: "playing" | "paused" | "stopped"): Promise<void>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
};

type MediaButtonCommandEvent = {
  type?: "next_stop" | "pause_narration" | "resume_narration";
};

const nativeMediaButtonsModule: MediaButtonsModule | null =
  Platform.OS === "android" && "PhillyMediaButtons" in NativeModules
    ? (NativeModules.PhillyMediaButtons as MediaButtonsModule)
    : null;

const mediaButtonsEmitter = nativeMediaButtonsModule ? new NativeEventEmitter(nativeMediaButtonsModule) : null;

let didStartMediaButtons = false;
let unsubscribeNarration: (() => void) | null = null;
let commandSubscription: { remove: () => void } | null = null;

function getPlaybackStateName(narration: NarrationState): "playing" | "paused" | "stopped" {
  if (narration.status === "playing" || narration.status === "loading") {
    return "playing";
  }

  if (narration.status === "stopped") {
    return "paused";
  }

  return "stopped";
}

async function syncPlaybackState(narration: NarrationState) {
  if (!nativeMediaButtonsModule) {
    return;
  }

  try {
    await nativeMediaButtonsModule.updatePlaybackState(getPlaybackStateName(narration));
  } catch {
    // Ignore media button sync failures to keep narration independent.
  }
}

async function onMediaButtonCommand(event: MediaButtonCommandEvent) {
  const type = event.type;
  if (!type) {
    return;
  }

  try {
    await handleWearableCommand({ type });
  } catch {
    // Ignore command failures from headset controls.
  }
}

export async function ensureMediaButtonsStarted() {
  if (!nativeMediaButtonsModule || didStartMediaButtons) {
    return;
  }

  didStartMediaButtons = true;

  try {
    await nativeMediaButtonsModule.activateSession();
    await syncPlaybackState(getNarrationState());
  } catch {
    // Keep Android narration working even if media buttons are unavailable.
  }

  commandSubscription = mediaButtonsEmitter?.addListener("phillyMediaButtonCommand", onMediaButtonCommand) ?? null;
  unsubscribeNarration = subscribeToNarration((narration) => {
    void syncPlaybackState(narration);
  });
}

export async function stopMediaButtons() {
  if (!nativeMediaButtonsModule || !didStartMediaButtons) {
    return;
  }

  didStartMediaButtons = false;
  unsubscribeNarration?.();
  unsubscribeNarration = null;
  commandSubscription?.remove();
  commandSubscription = null;

  try {
    await nativeMediaButtonsModule.deactivateSession();
  } catch {
    // Ignore shutdown failures.
  }
}
