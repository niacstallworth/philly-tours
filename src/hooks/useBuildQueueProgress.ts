import React from "react";
import {
  loadBuiltSceneIds,
  loadCompletedAssetIds,
  loadQACompleteIds
} from "../services/buildQueue";
import { tours } from "../data/tours";

export type BuildPipelineStage = {
  key: "planned" | "assets_complete" | "scene_built" | "qa_complete";
  label: string;
  tone: "default" | "success" | "warn";
};

export function getBuildPipelineStage(
  stopId: string,
  assetCompleteIds: Set<string>,
  sceneBuiltIds: Set<string>,
  qaCompleteIds: Set<string>
): BuildPipelineStage {
  if (qaCompleteIds.has(stopId)) {
    return { key: "qa_complete", label: "QA complete", tone: "success" };
  }
  if (sceneBuiltIds.has(stopId)) {
    return { key: "scene_built", label: "Scene built", tone: "success" };
  }
  if (assetCompleteIds.has(stopId)) {
    return { key: "assets_complete", label: "Assets complete", tone: "success" };
  }
  return { key: "planned", label: "Planned", tone: "warn" };
}

export function useBuildQueueProgress() {
  const [assetCompleteIds, setAssetCompleteIds] = React.useState<Set<string>>(() => new Set());
  const [sceneBuiltIds, setSceneBuiltIds] = React.useState<Set<string>>(() => new Set());
  const [qaCompleteIds, setQACompleteIds] = React.useState<Set<string>>(() => new Set());
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const [assetIds, builtIds, qaIds] = await Promise.all([
        loadCompletedAssetIds(),
        loadBuiltSceneIds(),
        loadQACompleteIds()
      ]);
      if (cancelled) {
        return;
      }
      setAssetCompleteIds(new Set(assetIds));
      setSceneBuiltIds(new Set(builtIds));
      setQACompleteIds(new Set(qaIds));
      setLoaded(true);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const getStage = React.useCallback(
    (stopId: string) => getBuildPipelineStage(stopId, assetCompleteIds, sceneBuiltIds, qaCompleteIds),
    [assetCompleteIds, sceneBuiltIds, qaCompleteIds]
  );

  const perTourProgress = React.useMemo(() => {
    return tours.map((tour) => {
      const plannedStops = tour.stops.filter((stop) => typeof stop.arPriority === "number");
      const totals = plannedStops.reduce(
        (acc, stop) => {
          const stage = getBuildPipelineStage(stop.id, assetCompleteIds, sceneBuiltIds, qaCompleteIds);
          if (stage.key === "assets_complete") {
            acc.assetsComplete += 1;
          }
          if (stage.key === "scene_built" || stage.key === "qa_complete") {
            acc.sceneBuilt += 1;
          }
          if (stage.key === "qa_complete") {
            acc.qaComplete += 1;
          }
          return acc;
        },
        {
          planned: plannedStops.length,
          assetsComplete: 0,
          sceneBuilt: 0,
          qaComplete: 0
        }
      );

      return {
        tourId: tour.id,
        tourTitle: tour.title,
        ...totals
      };
    });
  }, [assetCompleteIds, qaCompleteIds, sceneBuiltIds]);

  return {
    loaded,
    assetCompleteIds,
    sceneBuiltIds,
    qaCompleteIds,
    getStage,
    perTourProgress
  };
}
