import { Audio, InterruptionModeIOS, type AVPlaybackStatus } from "expo-av";
import * as Speech from "expo-speech";
import type { DriveStop } from "./driveMode";

type NarrationSource = "audio" | "speech" | "none";
export type NarrationStatus = "idle" | "loading" | "playing" | "stopped" | "error";

export type NarrationState = {
  status: NarrationStatus;
  source: NarrationSource;
  stopId: string | null;
  stopTitle: string | null;
  message: string;
};

type NarrationListener = (state: NarrationState) => void;

const listeners = new Set<NarrationListener>();

let sound: Audio.Sound | null = null;
let currentState: NarrationState = {
  status: "idle",
  source: "none",
  stopId: null,
  stopTitle: null,
  message: "Narration is ready."
};

function emit(next: Partial<NarrationState>) {
  currentState = { ...currentState, ...next };
  listeners.forEach((listener) => listener(currentState));
}

function getSpeechScript(stop: DriveStop) {
  return `${stop.title}. ${stop.arrivalSummary}. Continue on foot when you are ready.`;
}

function resolveAudioUri(audioUrl: string) {
  if (!audioUrl) {
    return null;
  }
  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
    return audioUrl;
  }
  return null;
}

async function configureAudioMode() {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    shouldDuckAndroid: true
  });
}

async function releaseSound() {
  if (!sound) {
    return;
  }
  const activeSound = sound;
  sound = null;
  try {
    await activeSound.unloadAsync();
  } catch {
    // Ignore stale unload errors.
  }
}

function onPlaybackStatus(stop: DriveStop, status: AVPlaybackStatus) {
  if (!status.isLoaded) {
    if (status.error) {
      emit({
        status: "error",
        source: "audio",
        stopId: stop.id,
        stopTitle: stop.title,
        message: "Narration file could not be played."
      });
    }
    return;
  }

  if (status.didJustFinish) {
    emit({
      status: "stopped",
      source: "audio",
      stopId: stop.id,
      stopTitle: stop.title,
      message: "Narration finished."
    });
    void releaseSound();
    return;
  }

  emit({
    status: status.isPlaying ? "playing" : "stopped",
    source: "audio",
    stopId: stop.id,
    stopTitle: stop.title,
    message: status.isPlaying ? "Playing recorded narration." : "Recorded narration ready."
  });
}

export async function startNarration(stop: DriveStop) {
  await stopNarration();
  emit({
    status: "loading",
    stopId: stop.id,
    stopTitle: stop.title,
    message: "Preparing narration..."
  });

  const audioUri = resolveAudioUri(stop.audioUrl);
  if (audioUri) {
    try {
      await configureAudioMode();
      const { sound: nextSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        (status) => onPlaybackStatus(stop, status)
      );
      sound = nextSound;
      emit({
        status: "playing",
        source: "audio",
        stopId: stop.id,
        stopTitle: stop.title,
        message: "Playing recorded narration."
      });
      return;
    } catch {
      await releaseSound();
    }
  }

  try {
    Speech.stop();
    const speechScript = getSpeechScript(stop);
    emit({
      status: "playing",
      source: "speech",
      stopId: stop.id,
      stopTitle: stop.title,
      message: "Speaking live stop preview."
    });
    Speech.speak(speechScript, {
      rate: 0.95,
      pitch: 1.0,
      onDone: () => {
        emit({
          status: "stopped",
          source: "speech",
          stopId: stop.id,
          stopTitle: stop.title,
          message: "Narration finished."
        });
      },
      onStopped: () => {
        emit({
          status: "stopped",
          source: "speech",
          stopId: stop.id,
          stopTitle: stop.title,
          message: "Narration stopped."
        });
      },
      onError: () => {
        emit({
          status: "error",
          source: "speech",
          stopId: stop.id,
          stopTitle: stop.title,
          message: "Speech preview failed on this device."
        });
      }
    });
  } catch {
    emit({
      status: "error",
      source: "none",
      stopId: stop.id,
      stopTitle: stop.title,
      message: "Narration unavailable right now."
    });
  }
}

export async function stopNarration() {
  Speech.stop();
  await releaseSound();
  emit({
    status: "stopped",
    source: currentState.source === "none" ? "none" : currentState.source,
    message: "Narration stopped."
  });
}

export function getNarrationState() {
  return currentState;
}

export function subscribeToNarration(listener: NarrationListener) {
  listeners.add(listener);
  listener(currentState);
  return () => listeners.delete(listener);
}
