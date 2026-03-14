import { Stop } from "../types";

export type ARReadiness = {
  key: "not_planned" | "planned" | "asset_needed" | "ready";
  label: string;
  tone: "default" | "success" | "warn";
};

export function getARReadiness(stop: Pick<Stop, "arPriority" | "arType" | "assetNeeded" | "estimatedEffort">): ARReadiness {
  if (typeof stop.arPriority !== "number") {
    return {
      key: "not_planned",
      label: "Non-AR",
      tone: "default"
    };
  }

  if (!stop.arType || !stop.estimatedEffort) {
    return {
      key: "planned",
      label: "Planned",
      tone: "warn"
    };
  }

  if (stop.assetNeeded?.trim()) {
    return {
      key: "asset_needed",
      label: "Assets needed",
      tone: "warn"
    };
  }

  return {
    key: "ready",
    label: "Ready to build",
    tone: "success"
  };
}
