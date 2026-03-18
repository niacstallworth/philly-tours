import React, { useEffect, useMemo, useState } from "react";
import { Alert, AppState, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { useNarration } from "../hooks/useNarration";
import { toARSceneManifest } from "../services/arManifest";
import { type ARScenePayload, toARScenePayload } from "../services/ar";
import { getNativeARAdapter } from "../services/native-ar";
import { NativeARStatus } from "../services/native-ar/types";
import { createRealtimeSyncFromEnv } from "../services/realtime";
import { getNarrationCoverage, startNarration, stopNarration, type NarrationCoverage } from "../services/narration";

const adapter = getNativeARAdapter();
const sync = createRealtimeSyncFromEnv();
const SHARED_ROOM_STORAGE_KEY = "ar.sharedRoomName";
const AR_TUNING_STORAGE_KEY = "ar.stopTuningByStopId";
const AR_TUNING_PASS_STORAGE_KEY = "ar.tuningPassByStopId";
const LEGACY_AR_SCREEN_PREFS_STORAGE_KEY = "ar.screenPrefs";
const BUILDER_AR_SCREEN_PREFS_STORAGE_KEY = "ar.builder.screenPrefs";

type Props = {
  initialTourId?: string;
  initialStopId?: string;
};

type LaunchIntent = "solo" | "shared";
type ActionStatus = "idle" | "preparing" | "ready" | "launching" | "launching_shared" | "shared_live" | "live" | "closing" | "error";
type SavedStopTuning = {
  scale: number;
  rotationYDeg: number;
  verticalOffsetM: number;
};
type TuningPassStatus = "untested" | "stable" | "minor_drift" | "needs_retune";
type SavedTuningPassEntry = {
  status: TuningPassStatus;
  notes: string;
  lastUpdatedAt: string;
};
type SavedBuilderARScreenPrefs = {
  activeTourId?: string;
  activeStopId?: string;
  fullAudioFilterEnabled?: boolean;
  buildableFilterEnabled?: boolean;
  approvalFilterEnabled?: boolean;
  showAdvanced?: boolean;
  selectedTourId?: string;
  selectedStopId?: string;
  fullAudioOnly?: boolean;
  buildableOnly?: boolean;
  approvalCandidatesOnly?: boolean;
};

type AssetStatus = "planned" | "in_production" | "ready" | "approved";

function parseDraftNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDraftNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits
  });
}

function isSameTuning(
  left: Pick<SavedStopTuning, "scale" | "rotationYDeg" | "verticalOffsetM"> | null | undefined,
  right: Pick<SavedStopTuning, "scale" | "rotationYDeg" | "verticalOffsetM"> | null | undefined
) {
  if (!left || !right) {
    return false;
  }

  return (
    left.scale === right.scale &&
    left.rotationYDeg === right.rotationYDeg &&
    left.verticalOffsetM === right.verticalOffsetM
  );
}

function clonePayload(payload: ARScenePayload): ARScenePayload {
  return {
    ...payload,
    contentLayers: [...payload.contentLayers],
    productionChecklist: [...payload.productionChecklist]
  };
}

function findStopById(stopId: string | null | undefined) {
  if (!stopId) {
    return null;
  }

  for (const tour of tours) {
    const matchedStop = tour.stops.find((stop) => stop.id === stopId);
    if (matchedStop) {
      return matchedStop;
    }
  }

  return null;
}

function isTuningPassStatus(value: unknown): value is TuningPassStatus {
  return value === "untested" || value === "stable" || value === "minor_drift" || value === "needs_retune";
}

function getTuningPassMeta(status: TuningPassStatus) {
  switch (status) {
    case "stable":
      return {
        label: "Stable",
        tone: "success" as const,
        shortLabel: "stable",
        copy: "This stop felt anchored and ready in the last on-device pass."
      };
    case "minor_drift":
      return {
        label: "Minor drift",
        tone: "warn" as const,
        shortLabel: "drift",
        copy: "This stop mostly worked, but it drifted enough to justify another look."
      };
    case "needs_retune":
      return {
        label: "Needs retune",
        tone: "danger" as const,
        shortLabel: "retune",
        copy: "This stop needs another placement/tuning pass before it feels dependable."
      };
    default:
      return {
        label: "Untested",
        tone: "default" as const,
        shortLabel: "untested",
        copy: "No tuning-pass result has been logged for this stop yet."
      };
  }
}

function formatPassTimestamp(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getAssetStatusMeta(status: AssetStatus) {
  switch (status) {
    case "approved":
      return {
        label: "Approved",
        shortLabel: "approved",
        tone: "success" as const,
        copy: "This stop has a reviewed runtime asset and is ready for dependable on-device testing."
      };
    case "ready":
      return {
        label: "Ready",
        shortLabel: "ready",
        tone: "success" as const,
        copy: "This stop has runtime assets staged and is ready for hands-on AR validation."
      };
    case "in_production":
      return {
        label: "In production",
        shortLabel: "in production",
        tone: "warn" as const,
        copy: "This stop has active asset work in flight, but the final runtime export is not staged yet."
      };
    default:
      return {
        label: "Planned",
        shortLabel: "planned",
        tone: "default" as const,
        copy: "This stop is still pipeline-planned. The runtime asset may not exist yet."
      };
  }
}

function isBuildableAssetStatus(status: AssetStatus) {
  return status === "in_production" || status === "ready" || status === "approved";
}

function shellQuote(value: string) {
  return JSON.stringify(value);
}

function sanitizeClipboardField(value: string | null | undefined) {
  return String(value || "")
    .replace(/[\t\r\n]+/g, " ")
    .trim();
}

export function BuilderARScreen({ initialTourId, initialStopId }: Props) {
  const [activeTourId, setActiveTourId] = useState<string>(initialTourId || tours[0]?.id || "");
  const [activeStopId, setActiveStopId] = useState<string>(initialStopId || "");
  const [roomName, setRoomName] = useState("historic-philly-main");
  const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");
  const [actionError, setActionError] = useState<string | null>(null);
  const [arStatus, setArStatus] = useState<NativeARStatus | null>(null);
  const [preparedPayload, setPreparedPayload] = useState<ARScenePayload | null>(null);
  const [livePayload, setLivePayload] = useState<ARScenePayload | null>(null);
  const [savedTuningByStopId, setSavedTuningByStopId] = useState<Record<string, SavedStopTuning>>({});
  const [hasLoadedSavedTuning, setHasLoadedSavedTuning] = useState(false);
  const [tuningPassByStopId, setTuningPassByStopId] = useState<Record<string, SavedTuningPassEntry>>({});
  const [hasLoadedTuningPass, setHasLoadedTuningPass] = useState(false);
  const [hasLoadedScreenPrefs, setHasLoadedScreenPrefs] = useState(false);
  const narration = useNarration();
  const [joinedRoomName, setJoinedRoomName] = useState<string | null>(null);
  const [joinedRoomMemberCount, setJoinedRoomMemberCount] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fullAudioFilterEnabled, setFullAudioFilterEnabled] = useState(false);
  const [buildableFilterEnabled, setBuildableFilterEnabled] = useState(false);
  const [approvalFilterEnabled, setApprovalFilterEnabled] = useState(false);
  const [launchIntent, setLaunchIntent] = useState<LaunchIntent>("solo");
  const [scaleDraft, setScaleDraft] = useState("1");
  const [rotationDraft, setRotationDraft] = useState("180");
  const [verticalOffsetDraft, setVerticalOffsetDraft] = useState("0");
  const [tuningPassNotesDraft, setTuningPassNotesDraft] = useState("");

  const selectedTour = useMemo(() => tours.find((tour) => tour.id === activeTourId) || tours[0], [activeTourId]);
  const arStops = useMemo(() => {
    const planned = selectedTour.stops.filter((stop) => typeof stop.arPriority === "number");
    return (planned.length ? planned : selectedTour.stops).sort((left, right) => {
      const leftPriority = left.arPriority ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = right.arPriority ?? Number.MAX_SAFE_INTEGER;
      return leftPriority - rightPriority;
    });
  }, [selectedTour]);
  const assetStatusByStopId = useMemo(() => {
    return new Map(arStops.map((stop) => [stop.id, toARSceneManifest(stop).assetStatus]));
  }, [arStops]);
  const approvalCandidateStopIds = useMemo(() => {
    return new Set(
      arStops
        .filter((stop) => {
          const status = assetStatusByStopId.get(stop.id) || "planned";
          const passStatus = tuningPassByStopId[stop.id]?.status;
          return status !== "approved" && isBuildableAssetStatus(status) && passStatus === "stable";
        })
        .map((stop) => stop.id)
    );
  }, [arStops, assetStatusByStopId, tuningPassByStopId]);
  const approvalCandidateStops = useMemo(
    () => arStops.filter((stop) => approvalCandidateStopIds.has(stop.id)),
    [approvalCandidateStopIds, arStops]
  );
  const filteredArStops = useMemo(
    () =>
      arStops.filter((stop) => {
        if (fullAudioFilterEnabled && getNarrationCoverage(stop.id) !== "full_audio") {
          return false;
        }

        if (buildableFilterEnabled && !isBuildableAssetStatus(assetStatusByStopId.get(stop.id) || "planned")) {
          return false;
        }

        if (approvalFilterEnabled && !approvalCandidateStopIds.has(stop.id)) {
          return false;
        }

        return true;
      }),
    [approvalCandidateStopIds, approvalFilterEnabled, arStops, assetStatusByStopId, buildableFilterEnabled, fullAudioFilterEnabled]
  );
  const selectedStopIndex = useMemo(
    () => filteredArStops.findIndex((stop) => stop.id === activeStopId),
    [activeStopId, filteredArStops]
  );
  const selectedStop = useMemo(
    () => filteredArStops.find((stop) => stop.id === activeStopId) || filteredArStops[0],
    [activeStopId, filteredArStops]
  );
  const preparedStop = useMemo(() => findStopById(preparedPayload?.stopId), [preparedPayload?.stopId]);
  const liveStop = useMemo(() => findStopById(livePayload?.stopId), [livePayload?.stopId]);
  const manifest = useMemo(() => (selectedStop ? toARSceneManifest(selectedStop) : null), [selectedStop]);
  const payload = useMemo(() => (selectedStop ? toARScenePayload(selectedStop) : null), [selectedStop]);
  const selectedStopAssetStatusMeta = getAssetStatusMeta(manifest?.assetStatus || "planned");
  const savedStopTuning = selectedStop ? savedTuningByStopId[selectedStop.id] : undefined;
  const selectedStopPassEntry = selectedStop ? tuningPassByStopId[selectedStop.id] : undefined;
  const selectedStopPassMeta = getTuningPassMeta(selectedStopPassEntry?.status || "untested");
  const scaleDraftNumber = parseDraftNumber(scaleDraft);
  const rotationDraftNumber = parseDraftNumber(rotationDraft);
  const verticalOffsetDraftNumber = parseDraftNumber(verticalOffsetDraft);
  const tuningInputError = !scaleDraft.trim()
    ? "Scale is required."
    : scaleDraftNumber === null
      ? "Scale must be a valid number."
      : scaleDraftNumber <= 0
        ? "Scale must be greater than 0."
        : !rotationDraft.trim()
          ? "Rotation Y is required."
          : rotationDraftNumber === null
            ? "Rotation Y must be a valid number."
            : !verticalOffsetDraft.trim()
              ? "Vertical offset is required."
              : verticalOffsetDraftNumber === null
                ? "Vertical offset must be a valid number."
                : null;
  const hasInvalidTuningInputs = Boolean(tuningInputError);
  const tunedPayload = useMemo(() => {
    if (
      !payload ||
      scaleDraftNumber === null ||
      rotationDraftNumber === null ||
      verticalOffsetDraftNumber === null ||
      scaleDraftNumber <= 0
    ) {
      return null;
    }

    return {
      ...payload,
      scale: Math.max(0.01, scaleDraftNumber),
      rotationYDeg: rotationDraftNumber,
      verticalOffsetM: verticalOffsetDraftNumber
    };
  }, [payload, rotationDraftNumber, scaleDraftNumber, verticalOffsetDraftNumber]);
  const defaultStopTuning = payload
    ? {
        scale: payload.scale,
        rotationYDeg: payload.rotationYDeg,
        verticalOffsetM: payload.verticalOffsetM
      }
    : null;
  const tuningDraft = tunedPayload
    ? {
        scale: tunedPayload.scale,
        rotationYDeg: tunedPayload.rotationYDeg,
        verticalOffsetM: tunedPayload.verticalOffsetM
      }
    : null;
  const tuningBaseline = savedStopTuning || defaultStopTuning;
  const tuningDirty = Boolean(tuningDraft && tuningBaseline && !isSameTuning(tuningDraft, tuningBaseline));
  const tuningMatchesSavedPreset = Boolean(savedStopTuning && tuningDraft && isSameTuning(tuningDraft, savedStopTuning));
  const tuningMatchesDefault = Boolean(defaultStopTuning && tuningDraft && isSameTuning(tuningDraft, defaultStopTuning));
  const tuningStatusLabel = tuningDirty ? "Draft changed" : savedStopTuning ? "Preset applied" : "Default values";
  const tuningStatusTone = tuningDirty ? "warn" : savedStopTuning ? "success" : "default";
  const tuningStatusCopy = tuningDirty
    ? savedStopTuning
      ? "Draft differs from the saved preset for this stop. Save it if this version feels better on-device."
      : "Draft differs from the default scene values for this stop. Save it once the placement feels right."
    : tuningMatchesSavedPreset
      ? "Draft matches the saved preset for this stop."
      : tuningMatchesDefault
        ? "Draft matches the default scene values for this stop."
        : "Draft is ready for testing.";
  const unsupportedSimulator =
    arStatus?.provider === "arkit" &&
    arStatus?.available === false &&
    (arStatus?.reason || "").toLowerCase().includes("unsupported");
  const isBusy =
    actionStatus === "preparing" ||
    actionStatus === "launching" ||
    actionStatus === "launching_shared" ||
    actionStatus === "closing";
  const isLive = actionStatus === "live" || actionStatus === "shared_live";
  const isReadyToLaunch = actionStatus === "ready";
  const hasRunningSession = isLive || Boolean(arStatus?.sessionRunning) || Boolean(livePayload);
  const selectionLocked = isBusy || isReadyToLaunch || hasRunningSession;
  const actionTone = actionStatus === "error" ? "danger" : isLive ? "success" : isReadyToLaunch ? "warn" : "default";
  const providerCopy = arStatus?.reason || "Check AR availability on a physical device before entering the scene.";
  const prepareButtonLabel = actionStatus === "preparing" ? "Preparing AR..." : "Prepare AR Moment";
  const closeButtonLabel = actionStatus === "closing" ? "Closing AR..." : "Close AR";
  const launchButtonLabel = launchIntent === "shared" ? "Enter Shared AR Now" : "Enter AR Now";
  const readyTitle = launchIntent === "shared" ? "Shared launch ready" : "Ready to enter AR";
  const readyStopTitle = preparedPayload?.title || preparedStop?.title || selectedStop?.title || "Selected AR moment";
  const statusButtonLabel = isBusy ? "Refreshing..." : "Refresh Device Status";
  const sessionChipLabel = `Session ${arStatus?.sessionRunning ? "running" : "idle"}`;
  const placedChipLabel = `${arStatus?.placedModelCount ?? 0} model${(arStatus?.placedModelCount ?? 0) === 1 ? "" : "s"} placed`;
  const activeSharedRoomName = launchIntent === "shared" ? roomName.trim() || null : joinedRoomName;
  const sharedRoomChipLabel = activeSharedRoomName ? `Room ${activeSharedRoomName}` : "Shared room pending";
  const sharedMembersChipLabel = `${joinedRoomMemberCount} viewer${joinedRoomMemberCount === 1 ? "" : "s"}`;
  const sharedPresenceCopy =
    joinedRoomMemberCount > 1
      ? "Another viewer is connected to this room now."
      : "Waiting for another device to join this room.";
  const selectionLockCopy = isReadyToLaunch
    ? "Tour, stop, and tuning controls are locked until you enter AR or go back."
    : hasRunningSession
      ? "Tour, stop, and tuning controls are locked while this AR moment is live."
      : "Controls are temporarily locked while AR is preparing or closing.";
  const hasPreviousStop = selectedStopIndex > 0;
  const hasNextStop = selectedStopIndex >= 0 && selectedStopIndex < filteredArStops.length - 1;
  const nextBuildableStopIndex = useMemo(() => {
    if (!filteredArStops.length || selectedStopIndex < 0) {
      return -1;
    }

    for (let offset = 1; offset <= filteredArStops.length; offset += 1) {
      const candidateIndex = (selectedStopIndex + offset) % filteredArStops.length;
      const status = assetStatusByStopId.get(filteredArStops[candidateIndex].id) || "planned";
      if (isBuildableAssetStatus(status)) {
        return candidateIndex;
      }
    }

    return -1;
  }, [assetStatusByStopId, filteredArStops, selectedStopIndex]);
  const hasNextBuildableStop = nextBuildableStopIndex >= 0;
  const nextApprovalCandidateStopIndex = useMemo(() => {
    if (!filteredArStops.length || selectedStopIndex < 0) {
      return -1;
    }

    for (let offset = 1; offset <= filteredArStops.length; offset += 1) {
      const candidateIndex = (selectedStopIndex + offset) % filteredArStops.length;
      const candidateStop = filteredArStops[candidateIndex];
      const status = assetStatusByStopId.get(candidateStop.id) || "planned";
      const passStatus = tuningPassByStopId[candidateStop.id]?.status;
      if (status !== "approved" && isBuildableAssetStatus(status) && passStatus === "stable") {
        return candidateIndex;
      }
    }

    return -1;
  }, [assetStatusByStopId, filteredArStops, selectedStopIndex, tuningPassByStopId]);
  const hasNextApprovalCandidateStop = nextApprovalCandidateStopIndex >= 0;
  const nextUntunedStopIndex = useMemo(() => {
    if (!filteredArStops.length || selectedStopIndex < 0) {
      return -1;
    }

    for (let offset = 1; offset <= filteredArStops.length; offset += 1) {
      const candidateIndex = (selectedStopIndex + offset) % filteredArStops.length;
      if (!savedTuningByStopId[filteredArStops[candidateIndex].id]) {
        return candidateIndex;
      }
    }

    return -1;
  }, [filteredArStops, savedTuningByStopId, selectedStopIndex]);
  const hasNextUntunedStop = nextUntunedStopIndex >= 0;
  const nextNeedsReviewStopIndex = useMemo(() => {
    if (!filteredArStops.length || selectedStopIndex < 0) {
      return -1;
    }

    for (let offset = 1; offset <= filteredArStops.length; offset += 1) {
      const candidateIndex = (selectedStopIndex + offset) % filteredArStops.length;
      const status = tuningPassByStopId[filteredArStops[candidateIndex].id]?.status;
      if (status !== "stable") {
        return candidateIndex;
      }
    }

    return -1;
  }, [filteredArStops, selectedStopIndex, tuningPassByStopId]);
  const hasNextNeedsReviewStop = nextNeedsReviewStopIndex >= 0;
  const tuningPassSummary = useMemo(() => {
    const summary = {
      stable: 0,
      minor_drift: 0,
      needs_retune: 0,
      untested: 0
    };

    for (const stop of filteredArStops) {
      const status = tuningPassByStopId[stop.id]?.status || "untested";
      summary[status] += 1;
    }

    return summary;
  }, [filteredArStops, tuningPassByStopId]);
  const runtimeReadinessSummary = useMemo(() => {
    const summary: Record<AssetStatus, number> = {
      planned: 0,
      in_production: 0,
      ready: 0,
      approved: 0
    };

    for (const stop of arStops) {
      const status = assetStatusByStopId.get(stop.id) || "planned";
      summary[status] += 1;
    }

    return summary;
  }, [arStops, assetStatusByStopId]);
  const approvalCandidateCount = approvalCandidateStopIds.size;
  const buildableNeedsReviewCount = useMemo(() => {
    return arStops.filter((stop) => {
      const status = assetStatusByStopId.get(stop.id) || "planned";
      if (!isBuildableAssetStatus(status) || status === "approved") {
        return false;
      }

      return tuningPassByStopId[stop.id]?.status !== "stable";
    }).length;
  }, [arStops, assetStatusByStopId, tuningPassByStopId]);
  const launchBlockedByAssetStatus = manifest?.assetStatus === "planned";
  const launchGuardCopy = launchBlockedByAssetStatus
    ? "This stop is still pipeline-planned, so launch is disabled until it reaches in production, ready, or approved."
    : null;
  const isApprovalCandidate = Boolean(
    selectedStop &&
      manifest &&
      manifest.assetStatus !== "approved" &&
      isBuildableAssetStatus(manifest.assetStatus) &&
      selectedStopPassEntry?.status === "stable"
  );

  const leaveSharedRoom = React.useCallback(() => {
    sync.leaveSession();
    setJoinedRoomName(null);
    setJoinedRoomMemberCount(0);
  }, []);

  useEffect(() => {
    if (initialTourId && tours.some((tour) => tour.id === initialTourId)) {
      setActiveTourId(initialTourId);
    }
  }, [initialTourId]);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedScreenPrefs() {
      try {
        const raw =
          (await AsyncStorage.getItem(BUILDER_AR_SCREEN_PREFS_STORAGE_KEY)) ||
          (await AsyncStorage.getItem(LEGACY_AR_SCREEN_PREFS_STORAGE_KEY));
        if (cancelled || !raw) {
          return;
        }

        const parsed = JSON.parse(raw) as SavedBuilderARScreenPrefs | null;
        if (!parsed || typeof parsed !== "object") {
          return;
        }

        const nextTourId = parsed.activeTourId || parsed.selectedTourId;
        const nextStopId = parsed.activeStopId || parsed.selectedStopId;
        const nextFullAudioFilterEnabled = parsed.fullAudioFilterEnabled ?? parsed.fullAudioOnly;
        const nextBuildableFilterEnabled = parsed.buildableFilterEnabled ?? parsed.buildableOnly;
        const nextApprovalFilterEnabled = parsed.approvalFilterEnabled ?? parsed.approvalCandidatesOnly;

        if (!initialTourId && nextTourId && tours.some((tour) => tour.id === nextTourId)) {
          setActiveTourId(nextTourId);
        }

        if (!initialStopId && typeof nextStopId === "string") {
          setActiveStopId(nextStopId);
        }

        if (typeof nextFullAudioFilterEnabled === "boolean") {
          setFullAudioFilterEnabled(nextFullAudioFilterEnabled);
        }

        if (typeof nextBuildableFilterEnabled === "boolean") {
          setBuildableFilterEnabled(nextBuildableFilterEnabled);
        }

        if (typeof nextApprovalFilterEnabled === "boolean") {
          setApprovalFilterEnabled(nextApprovalFilterEnabled);
        }

        if (typeof parsed.showAdvanced === "boolean") {
          setShowAdvanced(parsed.showAdvanced);
        }
      } catch {
        // Screen prefs are a convenience only.
      } finally {
        if (!cancelled) {
          setHasLoadedScreenPrefs(true);
        }
      }
    }

    void loadSavedScreenPrefs();

    return () => {
      cancelled = true;
    };
  }, [initialStopId, initialTourId]);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedTuning() {
      try {
        const raw = await AsyncStorage.getItem(AR_TUNING_STORAGE_KEY);
        if (cancelled || !raw) {
          return;
        }

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
          return;
        }

        const nextSavedTuningByStopId: Record<string, SavedStopTuning> = {};
        for (const [stopId, value] of Object.entries(parsed)) {
          if (!value || typeof value !== "object") {
            continue;
          }

          const scale = Number((value as SavedStopTuning).scale);
          const rotationYDeg = Number((value as SavedStopTuning).rotationYDeg);
          const verticalOffsetM = Number((value as SavedStopTuning).verticalOffsetM);
          if (!Number.isFinite(scale) || !Number.isFinite(rotationYDeg) || !Number.isFinite(verticalOffsetM)) {
            continue;
          }

          nextSavedTuningByStopId[stopId] = {
            scale,
            rotationYDeg,
            verticalOffsetM
          };
        }

        if (!cancelled) {
          setSavedTuningByStopId(nextSavedTuningByStopId);
        }
      } catch {
        // Saved tuning is optional workflow polish.
      } finally {
        if (!cancelled) {
          setHasLoadedSavedTuning(true);
        }
      }
    }

    void loadSavedTuning();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTuningPass() {
      try {
        const raw = await AsyncStorage.getItem(AR_TUNING_PASS_STORAGE_KEY);
        if (cancelled || !raw) {
          return;
        }

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
          return;
        }

        const nextTuningPassByStopId: Record<string, SavedTuningPassEntry> = {};
        for (const [stopId, value] of Object.entries(parsed)) {
          if (!value || typeof value !== "object") {
            continue;
          }

          const status = (value as SavedTuningPassEntry).status;
          const notes = typeof (value as SavedTuningPassEntry).notes === "string" ? (value as SavedTuningPassEntry).notes : "";
          const lastUpdatedAt =
            typeof (value as SavedTuningPassEntry).lastUpdatedAt === "string" ? (value as SavedTuningPassEntry).lastUpdatedAt : "";
          if (!isTuningPassStatus(status)) {
            continue;
          }

          nextTuningPassByStopId[stopId] = {
            status,
            notes,
            lastUpdatedAt
          };
        }

        if (!cancelled) {
          setTuningPassByStopId(nextTuningPassByStopId);
        }
      } catch {
        // Tuning pass state is optional workflow polish.
      } finally {
        if (!cancelled) {
          setHasLoadedTuningPass(true);
        }
      }
    }

    void loadTuningPass();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSharedRoomName() {
      try {
        const storedRoomName = await AsyncStorage.getItem(SHARED_ROOM_STORAGE_KEY);
        if (!cancelled && storedRoomName?.trim()) {
          setRoomName(storedRoomName.trim());
        }
      } catch {
        // Shared room persistence is a convenience only.
      }
    }

    void loadSharedRoomName();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!filteredArStops.length) {
      setActiveStopId("");
      return;
    }
    setActiveStopId((prev) => {
      if (initialStopId && filteredArStops.some((stop) => stop.id === initialStopId)) {
        return initialStopId;
      }
      return prev && filteredArStops.some((stop) => stop.id === prev) ? prev : filteredArStops[0].id;
    });
  }, [filteredArStops, initialStopId]);

  useEffect(() => {
    if (!payload) {
      return;
    }

    const nextScale = savedStopTuning?.scale ?? payload.scale;
    const nextRotationYDeg = savedStopTuning?.rotationYDeg ?? payload.rotationYDeg;
    const nextVerticalOffsetM = savedStopTuning?.verticalOffsetM ?? payload.verticalOffsetM ?? 0;

    setScaleDraft(String(nextScale));
    setRotationDraft(String(nextRotationYDeg));
    setVerticalOffsetDraft(String(nextVerticalOffsetM));
  }, [payload?.stopId, payload?.scale, payload?.rotationYDeg, payload?.verticalOffsetM, savedStopTuning]);

  useEffect(() => {
    setTuningPassNotesDraft(selectedStopPassEntry?.notes || "");
  }, [selectedStop?.id, selectedStopPassEntry?.notes]);

  useEffect(() => {
    if (!hasLoadedSavedTuning) {
      return;
    }

    async function persistSavedTuning() {
      try {
        const savedStopIds = Object.keys(savedTuningByStopId);
        if (!savedStopIds.length) {
          await AsyncStorage.removeItem(AR_TUNING_STORAGE_KEY);
          return;
        }

        await AsyncStorage.setItem(AR_TUNING_STORAGE_KEY, JSON.stringify(savedTuningByStopId));
      } catch {
        // Saved tuning is optional workflow polish.
      }
    }

    void persistSavedTuning();
  }, [hasLoadedSavedTuning, savedTuningByStopId]);

  useEffect(() => {
    if (!hasLoadedTuningPass) {
      return;
    }

    async function persistTuningPass() {
      try {
        const savedStopIds = Object.keys(tuningPassByStopId);
        if (!savedStopIds.length) {
          await AsyncStorage.removeItem(AR_TUNING_PASS_STORAGE_KEY);
          return;
        }

        await AsyncStorage.setItem(AR_TUNING_PASS_STORAGE_KEY, JSON.stringify(tuningPassByStopId));
      } catch {
        // Tuning pass state is optional workflow polish.
      }
    }

    void persistTuningPass();
  }, [hasLoadedTuningPass, tuningPassByStopId]);

  useEffect(() => {
    if (!hasLoadedScreenPrefs) {
      return;
    }

    async function persistScreenPrefs() {
      try {
        const nextPrefs: SavedBuilderARScreenPrefs = {
          activeTourId,
          activeStopId,
          fullAudioFilterEnabled,
          buildableFilterEnabled,
          approvalFilterEnabled,
          showAdvanced
        };

        await AsyncStorage.setItem(BUILDER_AR_SCREEN_PREFS_STORAGE_KEY, JSON.stringify(nextPrefs));
        await AsyncStorage.removeItem(LEGACY_AR_SCREEN_PREFS_STORAGE_KEY);
      } catch {
        // Screen prefs are a convenience only.
      }
    }

    void persistScreenPrefs();
  }, [
    activeStopId,
    activeTourId,
    approvalFilterEnabled,
    buildableFilterEnabled,
    fullAudioFilterEnabled,
    hasLoadedScreenPrefs,
    showAdvanced
  ]);

  useEffect(() => {
    const nextRoomName = roomName.trim();

    async function persistSharedRoomName() {
      try {
        if (!nextRoomName) {
          await AsyncStorage.removeItem(SHARED_ROOM_STORAGE_KEY);
          return;
        }

        await AsyncStorage.setItem(SHARED_ROOM_STORAGE_KEY, nextRoomName);
      } catch {
        // Shared room persistence is a convenience only.
      }
    }

    void persistSharedRoomName();
  }, [roomName]);

  const refreshStatus = React.useCallback(async () => {
    try {
      const status = await adapter.getStatus();
      setArStatus(status);
      if (!status.sessionRunning && livePayload) {
        if (launchIntent === "shared") {
          leaveSharedRoom();
        }
        setLivePayload(null);
        setLaunchIntent("solo");
        setActionStatus("idle");
        setActionError(null);
      }
      return status;
    } catch {
      return null;
    }
  }, [launchIntent, leaveSharedRoom, livePayload]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshStatus();
      }
    });

    return () => {
      appStateSubscription.remove();
    };
  }, [refreshStatus]);

  useEffect(() => {
    if (!hasRunningSession && !isBusy) {
      return;
    }

    const timer = setInterval(() => {
      void refreshStatus();
    }, 1500);

    return () => {
      clearInterval(timer);
    };
  }, [hasRunningSession, isBusy, refreshStatus]);

  useEffect(() => {
    if (!joinedRoomName) {
      setJoinedRoomMemberCount(0);
      return;
    }

    const unsubscribe = sync.onRoomMembers((sessionId, members) => {
      if (sessionId === joinedRoomName) {
        setJoinedRoomMemberCount(members.length);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [joinedRoomName]);

  useEffect(() => {
    return () => {
      sync.leaveSession();
      sync.disconnect();
    };
  }, []);

  async function prepareLaunch(shared: boolean) {
    if (isBusy) {
      return;
    }

    setLaunchIntent(shared ? "shared" : "solo");
    setActionStatus("preparing");
    setActionError(null);

    try {
      if (!payload) {
        throw new Error("No AR stop is selected.");
      }
      if (shared && !roomName.trim()) {
        throw new Error("Shared mode needs a room name before you prepare the launch.");
      }

      const status = await refreshStatus();
      if (!status) {
        throw new Error("Could not confirm AR readiness on this device.");
      }

      if (!status.available) {
        throw new Error(status.reason || "AR is not available on this device.");
      }

      if (status.sessionRunning) {
        throw new Error("Close the current AR moment before launching another stop.");
      }

      const nextPayload = clonePayload(tunedPayload || payload);
      setPreparedPayload(nextPayload);
      setActionStatus("ready");
    } catch (error) {
      setPreparedPayload(null);
      setActionStatus("error");
      setActionError((error as Error).message || "Could not prepare this AR scene.");
    }
  }

  function cancelPreparedLaunch() {
    if (isBusy) {
      return;
    }

    setActionStatus("idle");
    setActionError(null);
    setPreparedPayload(null);
    setLaunchIntent("solo");
  }

  async function launchPreparedStop() {
    if (isBusy) {
      return;
    }

    const shared = launchIntent === "shared";
    setActionStatus(shared ? "launching_shared" : "launching");
    setActionError(null);
    try {
      if (!preparedPayload) {
        throw new Error("Prepare an AR moment before entering the scene.");
      }
      const nextPayload = clonePayload(preparedPayload);
      await adapter.startSession();
      await adapter.placeModel({
        id: nextPayload.stopId,
        modelUrl: nextPayload.modelUrl,
        scale: nextPayload.scale,
        rotationYDeg: nextPayload.rotationYDeg,
        verticalOffsetM: nextPayload.verticalOffsetM,
        fallbackType: nextPayload.fallbackType,
        title: nextPayload.title,
        subtitle: nextPayload.subtitle,
        headline: nextPayload.headline,
        summary: nextPayload.summary,
        placementNote: nextPayload.placementNote,
        contentLayers: nextPayload.contentLayers,
        productionChecklist: nextPayload.productionChecklist
      });
      await refreshStatus();

      if (shared) {
        const room = roomName.trim();
        if (!room) {
          throw new Error("Shared mode needs a room name before you enter AR.");
        }
        if (joinedRoomName && joinedRoomName !== room) {
          sync.leaveSession();
          setJoinedRoomName(null);
        }
        if (joinedRoomName !== room) {
          sync.joinSession(room);
          setJoinedRoomName(room);
        }
        sync.send({
          type: "spawn",
          sessionId: room,
          objectId: nextPayload.stopId,
          modelUrl: nextPayload.modelUrl
        });
      }
      setLivePayload(nextPayload);
      setPreparedPayload(null);
      setActionStatus(shared ? "shared_live" : "live");
    } catch (error) {
      await refreshStatus();
      setActionStatus("error");
      setActionError((error as Error).message || "Could not launch this AR scene.");
    }
  }

  async function closeAR() {
    if (isBusy || !hasRunningSession) {
      return;
    }

    setActionStatus("closing");
    setActionError(null);
    try {
      await adapter.stopSession();
      await refreshStatus();
      leaveSharedRoom();
      setPreparedPayload(null);
      setLivePayload(null);
      setLaunchIntent("solo");
      setActionStatus("idle");
    } catch (error) {
      await refreshStatus();
      setActionStatus("error");
      setActionError((error as Error).message || "Could not close AR.");
    }
  }

  async function onPlayNarration() {
    if (!selectedStop) {
      return;
    }
    try {
      await startNarration({
        id: selectedStop.id,
        tourId: selectedTour.id,
        title: selectedStop.title,
        lat: selectedStop.lat,
        lng: selectedStop.lng,
        triggerRadiusM: selectedStop.triggerRadiusM,
        audioUrl: selectedStop.audioUrl,
        arrivalSummary: selectedStop.description.split("|")[0]?.trim() || selectedStop.description,
        handoffDeepLink: `phillyartours://tour/${selectedTour.id}/stop/${selectedStop.id}/arrive`
      }, "walk");
    } catch (error) {
      Alert.alert("Narration unavailable", (error as Error).message || "Could not start narration.");
    }
  }

  async function onPlayScriptNarration() {
    if (!selectedStop) {
      return;
    }
    try {
      await startNarration(
        {
          id: selectedStop.id,
          tourId: selectedTour.id,
          title: selectedStop.title,
          lat: selectedStop.lat,
          lng: selectedStop.lng,
          triggerRadiusM: selectedStop.triggerRadiusM,
          audioUrl: selectedStop.audioUrl,
          arrivalSummary: selectedStop.description.split("|")[0]?.trim() || selectedStop.description,
          handoffDeepLink: `phillyartours://tour/${selectedTour.id}/stop/${selectedStop.id}/arrive`
        },
        "walk",
        { preferSpeech: true }
      );
    } catch (error) {
      Alert.alert("Script preview unavailable", (error as Error).message || "Could not speak the current script text.");
    }
  }

  async function onStopNarration() {
    await stopNarration();
  }

  function selectRelativeStop(direction: -1 | 1) {
    if (selectionLocked || selectedStopIndex < 0) {
      return;
    }

    const nextIndex = selectedStopIndex + direction;
    if (nextIndex < 0 || nextIndex >= filteredArStops.length) {
      return;
    }

    setActiveStopId(filteredArStops[nextIndex].id);
  }

  function jumpToNextUntunedStop() {
    if (selectionLocked || nextUntunedStopIndex < 0) {
      return;
    }

    setActiveStopId(filteredArStops[nextUntunedStopIndex].id);
  }

  function jumpToNextBuildableStop() {
    if (selectionLocked || nextBuildableStopIndex < 0) {
      return;
    }

    setActiveStopId(filteredArStops[nextBuildableStopIndex].id);
  }

  function jumpToNextApprovalCandidateStop() {
    if (selectionLocked || nextApprovalCandidateStopIndex < 0) {
      return;
    }

    setActiveStopId(filteredArStops[nextApprovalCandidateStopIndex].id);
  }

  function jumpToNextNeedsReviewStop() {
    if (selectionLocked || nextNeedsReviewStopIndex < 0) {
      return;
    }

    setActiveStopId(filteredArStops[nextNeedsReviewStopIndex].id);
  }

  function nudgeTuningDraft(field: "scale" | "rotationYDeg" | "verticalOffsetM", delta: number) {
    if (!payload || selectionLocked) {
      return;
    }

    if (field === "scale") {
      const currentValue = scaleDraftNumber ?? savedStopTuning?.scale ?? payload.scale;
      const nextValue = Math.max(0.01, currentValue + delta);
      setScaleDraft(formatDraftNumber(nextValue, 2));
      return;
    }

    if (field === "rotationYDeg") {
      const currentValue = rotationDraftNumber ?? savedStopTuning?.rotationYDeg ?? payload.rotationYDeg;
      setRotationDraft(formatDraftNumber(currentValue + delta, 0));
      return;
    }

    const currentValue = verticalOffsetDraftNumber ?? savedStopTuning?.verticalOffsetM ?? payload.verticalOffsetM ?? 0;
    setVerticalOffsetDraft(formatDraftNumber(currentValue + delta, 2));
  }

  function resetTuningDrafts() {
    if (!payload) {
      return;
    }

    const nextScale = savedStopTuning?.scale ?? payload.scale;
    const nextRotationYDeg = savedStopTuning?.rotationYDeg ?? payload.rotationYDeg;
    const nextVerticalOffsetM = savedStopTuning?.verticalOffsetM ?? payload.verticalOffsetM ?? 0;

    setScaleDraft(String(nextScale));
    setRotationDraft(String(nextRotationYDeg));
    setVerticalOffsetDraft(String(nextVerticalOffsetM));
  }

  function saveCurrentTuningPreset() {
    if (!tunedPayload) {
      return;
    }

    const nextSavedTuning: SavedStopTuning = {
      scale: tunedPayload.scale,
      rotationYDeg: tunedPayload.rotationYDeg,
      verticalOffsetM: tunedPayload.verticalOffsetM
    };

    setSavedTuningByStopId((current) => ({
      ...current,
      [tunedPayload.stopId]: nextSavedTuning
    }));

    Alert.alert(
      "Tuning saved",
      `${tunedPayload.title} will reopen with scale ${nextSavedTuning.scale}, rotation ${nextSavedTuning.rotationYDeg}deg, and offset ${nextSavedTuning.verticalOffsetM}m.`
    );
  }

  function clearSavedTuningPreset() {
    if (!selectedStop || !payload) {
      return;
    }

    setSavedTuningByStopId((current) => {
      if (!current[selectedStop.id]) {
        return current;
      }

      const next = { ...current };
      delete next[selectedStop.id];
      return next;
    });

    setScaleDraft(String(payload.scale));
    setRotationDraft(String(payload.rotationYDeg));
    setVerticalOffsetDraft(String(payload.verticalOffsetM ?? 0));

    Alert.alert("Saved tuning cleared", `${selectedStop.title} is back to its default scene values.`);
  }

  function saveTuningPassEntry(status: TuningPassStatus) {
    if (!selectedStop) {
      return;
    }

    setTuningPassByStopId((current) => ({
      ...current,
      [selectedStop.id]: {
        status,
        notes: tuningPassNotesDraft.trim(),
        lastUpdatedAt: new Date().toISOString()
      }
    }));
  }

  function saveTuningPassNotesOnly() {
    if (!selectedStop) {
      return;
    }

    setTuningPassByStopId((current) => ({
      ...current,
      [selectedStop.id]: {
        status: current[selectedStop.id]?.status || "untested",
        notes: tuningPassNotesDraft.trim(),
        lastUpdatedAt: new Date().toISOString()
      }
    }));
  }

  function clearTuningPassEntry() {
    if (!selectedStop) {
      return;
    }

    setTuningPassByStopId((current) => {
      if (!current[selectedStop.id]) {
        return current;
      }

      const next = { ...current };
      delete next[selectedStop.id];
      return next;
    });
    setTuningPassNotesDraft("");
  }

  async function copyApprovalCommand() {
    if (!selectedStop || !manifest) {
      return;
    }

    if (!isApprovalCandidate) {
      const reason =
        manifest.assetStatus === "approved"
          ? "This stop is already approved."
          : manifest.assetStatus === "planned"
            ? "This stop is still planned. Move it to in production or ready first."
            : "Mark this stop stable in the tuning pass before approving it.";
      Alert.alert("Not ready to approve", reason);
      return;
    }

    const note = selectedStopPassEntry?.notes?.trim() || "Stable on iPad after device pass.";
    const command = `npm run ar:catalog:approve -- --stop-id ${selectedStop.id} --note ${shellQuote(note)}`;
    await Clipboard.setStringAsync(command);
    Alert.alert("Approval command copied", command);
  }

  async function copyApprovalQueue() {
    if (!approvalCandidateStops.length) {
      Alert.alert("No approval candidates", "Mark a buildable stop stable during the tuning pass to create an approval queue.");
      return;
    }

    const lines = [
      `AR approval queue (${approvalCandidateStops.length} candidate${approvalCandidateStops.length === 1 ? "" : "s"})`,
      ""
    ];

    for (const stop of approvalCandidateStops) {
      const note = tuningPassByStopId[stop.id]?.notes?.trim() || "Stable on iPad after device pass.";
      lines.push(`${stop.title} [${stop.id}]`);
      lines.push(`npm run ar:catalog:approve -- --stop-id ${stop.id} --note ${shellQuote(note)}`);
      lines.push("");
    }

    const queue = lines.join("\n").trim();
    await Clipboard.setStringAsync(queue);
    Alert.alert("Approval queue copied", queue);
  }

  function buildDeviceReviewReportText() {
    const lines = [
      "AR_DEVICE_REVIEW_V1",
      `tourId\t${selectedTour.id}`,
      `tourTitle\t${sanitizeClipboardField(selectedTour.title)}`,
      `generatedAt\t${new Date().toISOString()}`,
      "stopId\tstopTitle\tassetStatus\tpassStatus\tnotes"
    ];

    for (const stop of arStops) {
      const passEntry = tuningPassByStopId[stop.id];
      const passStatus = passEntry?.status || "untested";
      const assetStatus = assetStatusByStopId.get(stop.id) || "planned";
      lines.push(
        [
          stop.id,
          sanitizeClipboardField(stop.title),
          assetStatus,
          passStatus,
          sanitizeClipboardField(passEntry?.notes)
        ].join("\t")
      );
    }

    return lines.join("\n");
  }

  async function copyDeviceReviewReport() {
    const report = buildDeviceReviewReportText();
    await Clipboard.setStringAsync(report);
    Alert.alert("Device review report copied", `Copied ${arStops.length} AR stops from ${selectedTour.title}.`);
  }

  function buildTuningSnapshotText() {
    const snapshotPayload = livePayload || preparedPayload || tunedPayload;
    const snapshotStop = liveStop || preparedStop || selectedStop;
    if (!snapshotPayload || !snapshotStop) {
      return "";
    }
    const snapshotPassEntry = tuningPassByStopId[snapshotStop.id];
    const snapshotPassMeta = getTuningPassMeta(snapshotPassEntry?.status || "untested");
    const snapshotLines = [
      `${snapshotStop.title} [${snapshotStop.id}]`,
      `asset-status ${getAssetStatusMeta(toARSceneManifest(snapshotStop).assetStatus).label}`,
      `scale ${snapshotPayload.scale}, rotationYDeg ${snapshotPayload.rotationYDeg}, verticalOffsetM ${snapshotPayload.verticalOffsetM}`,
      `tuning-pass ${snapshotPassMeta.label}`
    ];
    if (snapshotPassEntry?.notes?.trim()) {
      snapshotLines.push(`notes ${snapshotPassEntry.notes.trim()}`);
    }
    return snapshotLines.join("\n");
  }

  async function copyTuningSnapshot() {
    const snapshot = buildTuningSnapshotText();
    if (!snapshot) {
      return;
    }
    await Clipboard.setStringAsync(snapshot);
    Alert.alert("Tuning copied", snapshot);
  }

  function buildSessionCloseoutText() {
    const tuningSnapshot = buildTuningSnapshotText();
    const reviewReport = buildDeviceReviewReportText();
    const selectedCloseoutStop = liveStop || preparedStop || selectedStop;

    const lines = [
      "AR_SESSION_CLOSEOUT_V1",
      `tourId\t${selectedTour.id}`,
      `tourTitle\t${sanitizeClipboardField(selectedTour.title)}`,
      `generatedAt\t${new Date().toISOString()}`,
      `selectedStopId\t${selectedCloseoutStop?.id || ""}`,
      `selectedStopTitle\t${sanitizeClipboardField(selectedCloseoutStop?.title)}`,
      `hasTuningSnapshot\t${tuningSnapshot ? "yes" : "no"}`,
      "--- TUNING SNAPSHOT ---",
      tuningSnapshot || "NONE",
      "--- DEVICE REVIEW ---",
      reviewReport
    ];

    return lines.join("\n");
  }

  async function copySessionCloseout() {
    const closeout = buildSessionCloseoutText();
    await Clipboard.setStringAsync(closeout);
    const selectedCloseoutStop = liveStop || preparedStop || selectedStop;
    Alert.alert(
      "Session closeout copied",
      `${selectedTour.title}: ${arStops.length} stop review${selectedCloseoutStop ? ` + ${selectedCloseoutStop.title} tuning snapshot` : ""}.`
    );
  }

  function getCoverageMeta(coverage: NarrationCoverage) {
    switch (coverage) {
      case "full_audio":
        return { label: "Full audio", tone: "success" as const };
      case "partial_audio":
        return { label: "Partial audio", tone: "warn" as const };
      case "script_only":
        return { label: "Script voice", tone: "default" as const };
      default:
        return { label: "Basic voice", tone: "default" as const };
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>Builder AR</Text>
        <Text style={styles.heroTitle}>Tune one AR stop at a time without cluttering the public experience.</Text>
        <Text style={styles.heroCopy}>
          This workspace is for placement passes, runtime checks, and approval prep. The tourist-facing AR tab stays separate and much simpler.
        </Text>
        <Text style={styles.meta}>Builder-only tour, stop, and filter preferences stay on this device.</Text>
      </View>

      <Card style={styles.panel}>
        <Text style={styles.label}>Choose tour</Text>
        {selectionLocked ? <Text style={styles.meta}>{selectionLockCopy}</Text> : null}
        <View style={styles.choiceWrap}>
          {tours.map((tour) => (
            <PrimaryChoice
              key={tour.id}
              active={activeTourId === tour.id}
              label={tour.title}
              disabled={selectionLocked}
              onPress={() => setActiveTourId(tour.id)}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.panel}>
        <View style={styles.selectionHeader}>
          <Text style={styles.label}>Choose AR stop</Text>
          <View style={styles.selectionHeaderActions}>
            <PrimaryButton
              label={fullAudioFilterEnabled ? "Showing Full Audio" : "Showing All Stops"}
              onPress={() => setFullAudioFilterEnabled((value) => !value)}
              disabled={selectionLocked}
            />
            <PrimaryButton
              label={buildableFilterEnabled ? "Showing Buildable" : "Showing Planned + Buildable"}
              onPress={() => setBuildableFilterEnabled((value) => !value)}
              disabled={selectionLocked}
            />
            <PrimaryButton
              label={approvalFilterEnabled ? "Showing Approval Candidates" : "Showing All Review States"}
              onPress={() => setApprovalFilterEnabled((value) => !value)}
              disabled={selectionLocked}
            />
          </View>
        </View>
        {selectionLocked ? <Text style={styles.meta}>{selectionLockCopy}</Text> : null}
        <View style={styles.chips}>
          <Chip label={`${runtimeReadinessSummary.approved} approved`} tone="success" />
          <Chip label={`${runtimeReadinessSummary.ready} ready`} tone="success" />
          <Chip label={`${runtimeReadinessSummary.in_production} in production`} tone="warn" />
          <Chip label={`${runtimeReadinessSummary.planned} planned`} tone="default" />
          <Chip label={`${approvalCandidateCount} approval candidate${approvalCandidateCount === 1 ? "" : "s"}`} tone="success" />
        </View>
        <View style={styles.choiceWrap}>
          {filteredArStops.map((stop, index) => (
            <PrimaryChoice
              key={stop.id}
              active={activeStopId === stop.id}
              label={`${typeof stop.arPriority === "number" ? `P${stop.arPriority}` : `Stop ${index + 1}`} ${stop.title} · ${getAssetStatusMeta(assetStatusByStopId.get(stop.id) || "planned").shortLabel} · ${getCoverageMeta(getNarrationCoverage(stop.id)).label}${savedTuningByStopId[stop.id] ? " · tuned" : ""}${tuningPassByStopId[stop.id] ? ` · ${getTuningPassMeta(tuningPassByStopId[stop.id].status).shortLabel}` : ""}`}
              disabled={selectionLocked}
              onPress={() => setActiveStopId(stop.id)}
            />
          ))}
        </View>
        {filteredArStops.length ? (
          <View style={styles.actionStack}>
            <Text style={styles.meta}>
              {selectedStopIndex >= 0 ? `Stop ${selectedStopIndex + 1} of ${filteredArStops.length}` : `${filteredArStops.length} AR stops available`}
            </Text>
            <View style={styles.actionStack}>
              <PrimaryButton label="Previous Stop" onPress={() => selectRelativeStop(-1)} disabled={selectionLocked || !hasPreviousStop} />
              <PrimaryButton label="Next Stop" onPress={() => selectRelativeStop(1)} disabled={selectionLocked || !hasNextStop} />
              <PrimaryButton
                label="Next Buildable Stop"
                onPress={jumpToNextBuildableStop}
                disabled={selectionLocked || !hasNextBuildableStop}
              />
              <PrimaryButton
                label="Next Approval Candidate"
                onPress={jumpToNextApprovalCandidateStop}
                disabled={selectionLocked || !hasNextApprovalCandidateStop}
              />
              <PrimaryButton
                label="Next Untuned Stop"
                onPress={jumpToNextUntunedStop}
                disabled={selectionLocked || !hasNextUntunedStop}
              />
              <PrimaryButton
                label="Next Needs Review"
                onPress={jumpToNextNeedsReviewStop}
                disabled={selectionLocked || !hasNextNeedsReviewStop}
              />
            </View>
          </View>
        ) : null}
        {fullAudioFilterEnabled && filteredArStops.length === 0 ? <Text style={styles.meta}>No full-audio AR stops in this pack yet.</Text> : null}
        {buildableFilterEnabled && filteredArStops.length === 0 ? <Text style={styles.meta}>No buildable AR stops in this pack yet.</Text> : null}
        {approvalFilterEnabled && filteredArStops.length === 0 ? (
          <Text style={styles.meta}>No approval candidates yet. Mark a buildable stop stable during the tuning pass to surface it here.</Text>
        ) : null}
        {!buildableFilterEnabled && selectedStop && launchBlockedByAssetStatus ? (
          <Text style={styles.meta}>This stop is still planned. Use `Next Buildable Stop` or the buildable filter for iPad validation.</Text>
        ) : null}
      </Card>

      {selectedStop && manifest ? (
        <Card style={styles.featureCard}>
          <Text style={styles.featureEyebrow}>{selectedTour.title}</Text>
          <Text style={styles.featureTitle}>{selectedStop.title}</Text>
          <Text style={styles.featureBody}>{manifest.summary}</Text>
          <View style={styles.chips}>
            <Chip label={manifest.arType.replaceAll("_", " ")} tone="warn" />
            <Chip label={selectedStopAssetStatusMeta.label} tone={selectedStopAssetStatusMeta.tone} />
            <Chip label={`${selectedStop.triggerRadiusM}m reveal radius`} tone="default" />
            <Chip
              label={narration.stopId === selectedStop.id && narration.status === "playing" ? "Audio live" : "Walk narration"}
              tone="warn"
            />
            <Chip {...getCoverageMeta(getNarrationCoverage(selectedStop.id))} />
            {savedStopTuning ? <Chip label="Saved tuning" tone="success" /> : null}
            {tuningDirty ? <Chip label="Draft changed" tone="warn" /> : null}
            <Chip label={selectedStopPassMeta.label} tone={selectedStopPassMeta.tone} />
            {isApprovalCandidate ? <Chip label="Approval candidate" tone="success" /> : null}
          </View>
          <Text style={styles.specLabel}>Placement</Text>
          <Text style={styles.specCopy}>{manifest.placementNote}</Text>
          <Text style={styles.specLabel}>Runtime readiness</Text>
          <Text style={styles.specCopy}>{selectedStopAssetStatusMeta.copy}</Text>
          <Text style={styles.specLabel}>Scene layers</Text>
          <Text style={styles.specCopy}>{manifest.contentLayers.slice(0, 3).join(" | ")}</Text>
          <Text style={styles.meta}>{selectedStopPassMeta.copy}</Text>
          <Text style={styles.meta}>
            Builder testing tip: use recorded audio to hear the shipped MP3, or use script voice to hear the current text in the narration catalog.
          </Text>
          <View style={styles.actionStack}>
            <PrimaryButton
              label={narration.stopId === selectedStop.id && narration.status === "playing" ? "Replay Stop Audio" : "Play Stop Audio"}
              onPress={onPlayNarration}
            />
            <PrimaryButton label="Play Script Voice" onPress={onPlayScriptNarration} />
            {narration.stopId === selectedStop.id && (narration.status === "playing" || narration.status === "loading") ? (
              <PrimaryButton label="Stop Narration" onPress={onStopNarration} />
            ) : null}
          </View>
        </Card>
      ) : null}

      <Card style={styles.panel}>
        <Text style={styles.label}>Tuning pass</Text>
        <Text style={styles.meta}>
          Log what the iPad actually did for each stop so we can tell stable placements apart from drift problems before we go back to mesh generation.
        </Text>
        <View style={styles.chips}>
          <Chip label={`${tuningPassSummary.stable} stable`} tone="success" />
          <Chip label={`${tuningPassSummary.minor_drift} minor drift`} tone="warn" />
          <Chip label={`${tuningPassSummary.needs_retune} needs retune`} tone="danger" />
          <Chip label={`${tuningPassSummary.untested} untested`} tone="default" />
        </View>
        <Text style={styles.specLabel}>Selected stop status</Text>
        <View style={styles.chips}>
          <Chip label={selectedStopPassMeta.label} tone={selectedStopPassMeta.tone} />
          {selectedStopPassEntry?.lastUpdatedAt ? (
            <Chip label={`Updated ${formatPassTimestamp(selectedStopPassEntry.lastUpdatedAt)}`} tone="default" />
          ) : null}
        </View>
        <Text style={styles.meta}>{selectedStopPassMeta.copy}</Text>
        {isApprovalCandidate ? (
          <Text style={styles.meta}>This stop is stable on-device and buildable in the pipeline, so it is ready for a manual approval command.</Text>
        ) : null}
        <Text style={styles.tuningLabel}>Pass notes</Text>
        <TextInput
          value={tuningPassNotesDraft}
          onChangeText={setTuningPassNotesDraft}
          style={[styles.input, styles.notesInput]}
          placeholder="Example: Held well on floor after a slow scan, but window-side lighting made it wobble."
          placeholderTextColor="#8e7d99"
          editable={!isBusy}
          multiline
          textAlignVertical="top"
        />
        <View style={styles.choiceWrap}>
          <PrimaryChoice active={selectedStopPassEntry?.status === "stable"} label="Mark Stable" onPress={() => saveTuningPassEntry("stable")} disabled={isBusy} />
          <PrimaryChoice
            active={selectedStopPassEntry?.status === "minor_drift"}
            label="Mark Minor Drift"
            onPress={() => saveTuningPassEntry("minor_drift")}
            disabled={isBusy}
          />
          <PrimaryChoice
            active={selectedStopPassEntry?.status === "needs_retune"}
            label="Mark Needs Retune"
            onPress={() => saveTuningPassEntry("needs_retune")}
            disabled={isBusy}
          />
        </View>
        <View style={styles.actionStack}>
          <PrimaryButton label="Save Pass Note" onPress={saveTuningPassNotesOnly} disabled={isBusy || !selectedStop} />
          <PrimaryButton label="Copy Tuning Snapshot" onPress={copyTuningSnapshot} disabled={!selectedStop} />
          <PrimaryButton label="Copy Approve Command" onPress={copyApprovalCommand} disabled={!selectedStop} />
          <PrimaryButton label="Clear Pass Mark" onPress={clearTuningPassEntry} disabled={isBusy || !selectedStopPassEntry} />
        </View>
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.label}>Approval queue</Text>
        <Text style={styles.meta}>
          Stable, buildable stops can move straight from device validation into terminal approval without manual hunting.
        </Text>
        <View style={styles.chips}>
          <Chip label={`${approvalCandidateCount} candidates`} tone="success" />
          <Chip label={`${buildableNeedsReviewCount} buildable need review`} tone="warn" />
          <Chip label={`${runtimeReadinessSummary.approved} already approved`} tone="default" />
        </View>
        {approvalCandidateStops.length ? (
          <View style={styles.choiceWrap}>
            {approvalCandidateStops.slice(0, 6).map((stop) => (
              <Chip key={stop.id} label={stop.title} tone="success" />
            ))}
            {approvalCandidateStops.length > 6 ? <Chip label={`+${approvalCandidateStops.length - 6} more`} tone="default" /> : null}
          </View>
        ) : (
          <Text style={styles.meta}>No approval candidates yet. Stable + buildable is the unlock condition here.</Text>
        )}
        <View style={styles.actionStack}>
          <PrimaryButton label="Copy Approval Queue" onPress={copyApprovalQueue} />
          <PrimaryButton label="Copy Device Review Report" onPress={copyDeviceReviewReport} />
          <PrimaryButton label="Copy Session Closeout" onPress={copySessionCloseout} />
          <PrimaryButton
            label="Next Approval Candidate"
            onPress={jumpToNextApprovalCandidateStop}
            disabled={selectionLocked || !hasNextApprovalCandidateStop}
          />
        </View>
      </Card>

      <Card style={styles.panel}>
        <Text style={styles.label}>Launch</Text>
        {isReadyToLaunch ? (
          <View style={styles.preflightPanel}>
            <Text style={styles.preflightTitle}>{readyTitle}</Text>
            <Chip label={`Locked stop ${readyStopTitle}`} tone="warn" />
            <Text style={styles.preflightCopy}>
              Move the iPad slowly, frame a textured floor or wall, and give the model enough space before you enter AR.
            </Text>
            <View style={styles.preflightChecklist}>
              <Text style={styles.preflightItem}>1. Point at a surface with visible texture or edges.</Text>
              <Text style={styles.preflightItem}>2. Sweep gently for a second or two so ARKit can settle.</Text>
              <Text style={styles.preflightItem}>3. Enter only when you have enough room for the full building volume.</Text>
            </View>
            <Text style={styles.meta}>This launch is locked to the prepared stop until you enter AR or go back.</Text>
            <View style={styles.actionStack}>
              <PrimaryButton label={launchButtonLabel} onPress={launchPreparedStop} disabled={isBusy} />
              <PrimaryButton label="Back to Setup" onPress={cancelPreparedLaunch} disabled={isBusy} />
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.meta}>
              {isLive
                ? "This AR moment is already live. Close it before launching another stop."
                : "Prepare the stop first so AR only starts once the device and scene are both ready."}
            </Text>
            <View style={styles.actionStack}>
              <PrimaryButton
                label={prepareButtonLabel}
                onPress={() => prepareLaunch(false)}
                disabled={!payload || isBusy || hasRunningSession || hasInvalidTuningInputs || launchBlockedByAssetStatus}
              />
              {hasRunningSession ? (
                <PrimaryButton label={closeButtonLabel} onPress={closeAR} disabled={!hasRunningSession || isBusy} />
              ) : null}
            </View>
          </>
        )}
        <View style={styles.chips}>
          <Chip label={`State ${actionStatus.replaceAll("_", " ")}`} tone={actionTone} />
          <Chip label={`Provider ${arStatus?.provider || "unknown"}`} tone="default" />
          <Chip label={sessionChipLabel} tone={arStatus?.sessionRunning ? "success" : "default"} />
          <Chip label={placedChipLabel} tone={arStatus?.placedModelCount ? "warn" : "default"} />
          {isReadyToLaunch ? <Chip label={`Mode ${launchIntent}`} tone="warn" /> : null}
          {launchIntent === "shared" ? <Chip label={sharedRoomChipLabel} tone="warn" /> : null}
        </View>
        <Text style={styles.meta}>{providerCopy}</Text>
        {manifest?.assetStatus === "planned" ? (
          <Text style={styles.metaCallout}>
            This stop is still marked planned in the asset pipeline, so runtime model availability may still be incomplete.
          </Text>
        ) : null}
        {launchGuardCopy ? <Text style={styles.meta}>{launchGuardCopy}</Text> : null}
        <PrimaryButton label={statusButtonLabel} onPress={() => void refreshStatus()} disabled={isBusy} />
        {unsupportedSimulator ? (
          <Text style={styles.metaCallout}>
            This simulator cannot run ARKit. Use an ARKit-capable iPhone or iPad to validate the real 3D scene.
          </Text>
        ) : null}
        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
      </Card>

      {isLive ? (
        <Card style={styles.livePanel}>
          <Text style={styles.liveEyebrow}>Live scene</Text>
          <Text style={styles.liveTitle}>{liveStop?.title || livePayload?.title || "AR moment active"}</Text>
          <Text style={styles.liveCopy}>
            Walk a slow half-circle around the model, keep the floor or wall in frame, and grab a tuning snapshot before you leave if the scale or height feels off.
          </Text>
          <View style={styles.chips}>
            <Chip label={launchIntent === "shared" ? "Shared live" : "Solo live"} tone="success" />
            {liveStop ? <Chip label={`Stop ${liveStop.id}`} tone="default" /> : null}
            {launchIntent === "shared" ? <Chip label={sharedRoomChipLabel} tone="warn" /> : null}
            {launchIntent === "shared" ? (
              <Chip label={sharedMembersChipLabel} tone={joinedRoomMemberCount > 1 ? "success" : "default"} />
            ) : null}
          </View>
          {launchIntent === "shared" ? <Text style={styles.meta}>{sharedPresenceCopy}</Text> : null}
          <View style={styles.liveChecklist}>
            <Text style={styles.liveItem}>1. Keep textured surfaces in view while you move.</Text>
            <Text style={styles.liveItem}>2. If the object drifts, close AR and relaunch after a slower scan.</Text>
            <Text style={styles.liveItem}>3. Mark the stop stable or drifting before you close this scene.</Text>
            <Text style={styles.liveItem}>4. Copy the tuning snapshot now if scale, height, or rotation need adjustment.</Text>
          </View>
          <View style={styles.choiceWrap}>
            <PrimaryChoice active={selectedStopPassEntry?.status === "stable"} label="Stable" onPress={() => saveTuningPassEntry("stable")} disabled={isBusy} />
            <PrimaryChoice
              active={selectedStopPassEntry?.status === "minor_drift"}
              label="Minor Drift"
              onPress={() => saveTuningPassEntry("minor_drift")}
              disabled={isBusy}
            />
            <PrimaryChoice
              active={selectedStopPassEntry?.status === "needs_retune"}
              label="Needs Retune"
              onPress={() => saveTuningPassEntry("needs_retune")}
              disabled={isBusy}
            />
          </View>
          <View style={styles.actionStack}>
            <PrimaryButton label="Copy Tuning Snapshot" onPress={() => void copyTuningSnapshot()} />
            <PrimaryButton label={closeButtonLabel} onPress={() => void closeAR()} disabled={isBusy} />
          </View>
        </Card>
      ) : null}

      <Card style={styles.panel}>
        <Pressable onPress={() => setShowAdvanced((value) => !value)} style={styles.advancedToggle}>
          <Text style={styles.label}>Advanced</Text>
          <Text style={styles.advancedToggleText}>{showAdvanced ? "Hide" : "Show"}</Text>
        </Pressable>
        {showAdvanced ? (
          <View style={styles.advancedStack}>
            <Text style={styles.specLabel}>Scene tuning</Text>
            <Text style={styles.specCopy}>
              Base: scale {payload?.scale ?? 1} | rotation {payload?.rotationYDeg ?? 180}deg | vertical offset{" "}
              {payload?.verticalOffsetM ?? 0}m
            </Text>
            <Text style={styles.specCopy}>
              {savedStopTuning
                ? `Saved preset: scale ${savedStopTuning.scale} | rotation ${savedStopTuning.rotationYDeg}deg | vertical offset ${savedStopTuning.verticalOffsetM}m`
                : "Saved preset: none yet for this stop."}
            </Text>
            <Text style={styles.specCopy}>
              Launching with: scale {tunedPayload?.scale ?? 1} | rotation {tunedPayload?.rotationYDeg ?? 180}deg |
              vertical offset {tunedPayload?.verticalOffsetM ?? 0}m
            </Text>
            <View style={styles.chips}>
              <Chip label={tuningStatusLabel} tone={tuningStatusTone} />
            </View>
            <Text style={styles.meta}>{tuningStatusCopy}</Text>
            {tuningInputError ? <Text style={styles.error}>{tuningInputError}</Text> : null}
            <View style={styles.tuningGrid}>
              <View style={styles.tuningField}>
                <Text style={styles.tuningLabel}>Scale</Text>
                <TextInput
                  value={scaleDraft}
                  onChangeText={setScaleDraft}
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor="#8e7d99"
                  keyboardType="decimal-pad"
                  editable={!selectionLocked}
                />
                <View style={styles.tuningNudges}>
                  <PrimaryChoice label="-0.05" onPress={() => nudgeTuningDraft("scale", -0.05)} disabled={selectionLocked} active={false} />
                  <PrimaryChoice label="+0.05" onPress={() => nudgeTuningDraft("scale", 0.05)} disabled={selectionLocked} active={false} />
                </View>
              </View>
              <View style={styles.tuningField}>
                <Text style={styles.tuningLabel}>Rotation Y</Text>
                <TextInput
                  value={rotationDraft}
                  onChangeText={setRotationDraft}
                  style={styles.input}
                  placeholder="180"
                  placeholderTextColor="#8e7d99"
                  keyboardType="decimal-pad"
                  editable={!selectionLocked}
                />
                <View style={styles.tuningNudges}>
                  <PrimaryChoice label="-15deg" onPress={() => nudgeTuningDraft("rotationYDeg", -15)} disabled={selectionLocked} active={false} />
                  <PrimaryChoice label="+15deg" onPress={() => nudgeTuningDraft("rotationYDeg", 15)} disabled={selectionLocked} active={false} />
                </View>
              </View>
              <View style={styles.tuningField}>
                <Text style={styles.tuningLabel}>Vertical Offset</Text>
                <TextInput
                  value={verticalOffsetDraft}
                  onChangeText={setVerticalOffsetDraft}
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#8e7d99"
                  keyboardType="decimal-pad"
                  editable={!selectionLocked}
                />
                <View style={styles.tuningNudges}>
                  <PrimaryChoice label="-0.1m" onPress={() => nudgeTuningDraft("verticalOffsetM", -0.1)} disabled={selectionLocked} active={false} />
                  <PrimaryChoice label="+0.1m" onPress={() => nudgeTuningDraft("verticalOffsetM", 0.1)} disabled={selectionLocked} active={false} />
                </View>
              </View>
            </View>
            {selectionLocked ? <Text style={styles.meta}>{selectionLockCopy}</Text> : null}
            <View style={styles.actionStack}>
              <PrimaryButton label={savedStopTuning ? "Revert to Saved Tuning" : "Reset to Default"} onPress={resetTuningDrafts} disabled={selectionLocked} />
              <PrimaryButton
                label="Save Tuning for Stop"
                onPress={saveCurrentTuningPreset}
                disabled={!tunedPayload || selectionLocked || !tuningDirty || hasInvalidTuningInputs}
              />
            </View>
            <View style={styles.actionStack}>
              <PrimaryButton label="Copy Tuning Snapshot" onPress={copyTuningSnapshot} />
              <PrimaryButton label="Clear Saved Tuning" onPress={clearSavedTuningPreset} disabled={!savedStopTuning || selectionLocked} />
            </View>
            <Text style={styles.specLabel}>Shared room</Text>
            <TextInput
              value={roomName}
              onChangeText={setRoomName}
              style={styles.input}
              placeholder="historic-philly-main"
              placeholderTextColor="#8e7d99"
              autoCapitalize="none"
              editable={!selectionLocked}
            />
            <PrimaryButton
              label={actionStatus === "preparing" && launchIntent === "shared" ? "Preparing Shared AR..." : "Prepare Shared AR Moment"}
              onPress={() => prepareLaunch(true)}
              disabled={!payload || isBusy || hasRunningSession || hasInvalidTuningInputs || launchBlockedByAssetStatus}
            />
            <Text style={styles.meta}>
              Only use shared mode if you’re co-viewing the same stop. Once live, this screen will show the active room and viewer count.
            </Text>
          </View>
        ) : (
          <Text style={styles.meta}>Shared mode and tuning live here when you need them.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

type PrimaryChoiceProps = {
  active: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

function PrimaryChoice({ active, disabled, label, onPress }: PrimaryChoiceProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.choiceChip, active && styles.choiceChipActive, disabled && styles.choiceChipDisabled]}>
      <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive, disabled && styles.choiceChipTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 18,
    backgroundColor: "#060312"
  },
  heroPanel: {
    backgroundColor: "#130a25",
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 173, 0.16)"
  },
  heroEyebrow: {
    color: "#ff9ab2",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  heroTitle: {
    color: "#fff3ea",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800"
  },
  heroCopy: {
    color: "#d8c7df",
    lineHeight: 21
  },
  panel: {
    backgroundColor: "#120a22",
    gap: 12
  },
  label: {
    color: "#fff0e4",
    fontSize: 18,
    fontWeight: "800"
  },
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12
  },
  selectionHeaderActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8
  },
  choiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  choiceChip: {
    backgroundColor: "#1f1233",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden"
  },
  choiceChipActive: {
    backgroundColor: "#007eff",
    borderColor: "#007eff"
  },
  choiceChipDisabled: {
    opacity: 0.45
  },
  choiceChipText: {
    color: "#cab6d2",
    fontWeight: "700"
  },
  choiceChipTextActive: {
    color: "#f5fbff"
  },
  choiceChipTextDisabled: {
    color: "#9f8fa9"
  },
  featureCard: {
    backgroundColor: "#2b1530",
    borderColor: "rgba(255, 176, 132, 0.2)",
    gap: 12
  },
  featureEyebrow: {
    color: "#ffbc8a",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9
  },
  featureTitle: {
    color: "#fff8f3",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800"
  },
  featureBody: {
    color: "#f3e8ef",
    lineHeight: 23
  },
  livePanel: {
    backgroundColor: "#2a1731",
    borderColor: "rgba(143, 215, 195, 0.2)",
    gap: 12
  },
  liveEyebrow: {
    color: "#8fd7c3",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9
  },
  liveTitle: {
    color: "#fff8f3",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800"
  },
  liveCopy: {
    color: "#f0dde7",
    lineHeight: 21
  },
  liveChecklist: {
    gap: 6
  },
  liveItem: {
    color: "#cfeee5",
    lineHeight: 20
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  specLabel: {
    color: "#ffcfb5",
    fontWeight: "700"
  },
  specCopy: {
    color: "#d8c7df",
    lineHeight: 21
  },
  actionStack: {
    gap: 10
  },
  preflightPanel: {
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 188, 138, 0.2)",
    backgroundColor: "rgba(255, 188, 138, 0.08)",
    borderRadius: 22,
    padding: 16
  },
  preflightTitle: {
    color: "#fff4ea",
    fontSize: 20,
    fontWeight: "800"
  },
  preflightCopy: {
    color: "#f0dde7",
    lineHeight: 21
  },
  preflightChecklist: {
    gap: 6
  },
  preflightItem: {
    color: "#ffd8b8",
    lineHeight: 20
  },
  meta: {
    color: "#b69fbe",
    lineHeight: 20
  },
  metaCallout: {
    color: "#f0dde7",
    lineHeight: 21
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    color: "#fff3ea",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#1b102d"
  },
  notesInput: {
    minHeight: 96
  },
  error: {
    color: "#ffadb7",
    fontWeight: "600"
  },
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  advancedToggleText: {
    color: "#ffbc8a",
    fontWeight: "700"
  },
  advancedStack: {
    gap: 10
  },
  tuningGrid: {
    gap: 12
  },
  tuningField: {
    gap: 6
  },
  tuningNudges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tuningLabel: {
    color: "#d4c8d8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase"
  }
});
