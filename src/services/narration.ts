import { Audio, InterruptionModeIOS, type AVPlaybackStatus } from "expo-av";
import * as Speech from "expo-speech";
import { narrationAudioMap } from "../data/narrationAudioMap";
import { narrationCatalogByStopId, type NarrationVariant } from "../data/narrationCatalog";
import { narrationScriptMapByStopId } from "../data/narrationScriptMap";
import type { DriveStop } from "./driveMode";

type NarrationSource = "audio" | "speech" | "none";
export type NarrationStatus = "idle" | "loading" | "playing" | "stopped" | "error";
export type NarrationCoverage = "full_audio" | "partial_audio" | "script_only" | "basic";

export type NarrationState = {
  status: NarrationStatus;
  source: NarrationSource;
  stopId: string | null;
  stopTitle: string | null;
  message: string;
};

type NarrationListener = (state: NarrationState) => void;
type StartNarrationOptions = {
  preferSpeech?: boolean;
};

const listeners = new Set<NarrationListener>();

let sound: Audio.Sound | null = null;
let preferredSpeechVoiceId: string | null | undefined;
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

export function getNarrationCoverage(stopId: string): NarrationCoverage {
  const audioEntry = narrationCatalogByStopId[stopId];
  const scriptEntry = narrationScriptMapByStopId[stopId];

  if (audioEntry?.drive && audioEntry?.walk) {
    return "full_audio";
  }
  if (audioEntry?.drive || audioEntry?.walk) {
    return "partial_audio";
  }
  if (scriptEntry?.drive || scriptEntry?.walk) {
    return "script_only";
  }
  return "basic";
}

function getSpeechScript(stop: DriveStop, variant: NarrationVariant) {
  const fromCatalog = narrationScriptMapByStopId[stop.id]?.[variant];
  if (fromCatalog) {
    return fromCatalog;
  }
  if (variant === "drive") {
    return `${stop.title}. ${stop.arrivalSummary}. Slow down as you approach and prepare to continue on foot when it is safe.`;
  }
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

function resolveAudioAsset(audioUrl: string) {
  if (!audioUrl) {
    return null;
  }
  return narrationAudioMap[audioUrl as keyof typeof narrationAudioMap] || null;
}

function resolveNarrationPath(stop: DriveStop, variant: NarrationVariant) {
  const fromCatalog = narrationCatalogByStopId[stop.id]?.[variant];
  return fromCatalog || stop.audioUrl;
}

async function resolvePreferredSpeechVoiceId() {
  if (preferredSpeechVoiceId !== undefined) {
    return preferredSpeechVoiceId;
  }

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const amyVoice =
      voices.find((voice) => /(^|[^a-z])amy([^a-z]|$)/i.test(voice.name || "")) ||
      voices.find((voice) => /(^|[^a-z])amy([^a-z]|$)/i.test(voice.identifier || ""));

    if (amyVoice?.identifier) {
      preferredSpeechVoiceId = amyVoice.identifier;
      return preferredSpeechVoiceId;
    }

    const britishVoice =
      voices.find((voice) => voice.language?.toLowerCase() === "en-gb") ||
      voices.find((voice) => voice.language?.toLowerCase().startsWith("en-gb"));

    preferredSpeechVoiceId = britishVoice?.identifier || null;
    return preferredSpeechVoiceId;
  } catch {
    preferredSpeechVoiceId = null;
    return preferredSpeechVoiceId;
  }
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

export async function startNarration(
  stop: DriveStop,
  variant: NarrationVariant = "walk",
  options: StartNarrationOptions = {}
) {
  await stopNarration();
  emit({
    status: "loading",
    stopId: stop.id,
    stopTitle: stop.title,
    message: "Preparing narration..."
  });

  const preferredPath = resolveNarrationPath(stop, variant);
  const audioUri = options.preferSpeech ? null : resolveAudioUri(preferredPath);
  const audioAsset = options.preferSpeech ? null : resolveAudioAsset(preferredPath);
  if (audioUri || audioAsset) {
    try {
      await configureAudioMode();
      const playbackSource = audioUri ? { uri: audioUri } : audioAsset;
      if (!playbackSource) {
        throw new Error("No playback source available.");
      }
      const { sound: nextSound } = await Audio.Sound.createAsync(
        playbackSource,
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
    const speechScript = getSpeechScript(stop, variant);
    const voice = await resolvePreferredSpeechVoiceId();
    emit({
      status: "playing",
      source: "speech",
      stopId: stop.id,
      stopTitle: stop.title,
      message: options.preferSpeech ? "Speaking current script text." : "Speaking live stop preview."
    });
    Speech.speak(speechScript, {
      rate: 0.95,
      pitch: 1.0,
      language: "en-GB",
      voice: voice || undefined,
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
