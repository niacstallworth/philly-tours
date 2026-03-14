export type HandoffMode = "arrive" | "map" | "ar";

export type HandoffTarget = {
  tourId: string;
  stopId: string;
  mode: HandoffMode;
};

export function getHandoffModeMeta(mode: HandoffMode) {
  if (mode === "ar") {
    return {
      ctaLabel: "Open AR Moment",
      chipLabel: "Ready for AR",
      summary: "Step out and open the spatial moment for this stop."
    };
  }
  if (mode === "map") {
    return {
      ctaLabel: "Open Map Context",
      chipLabel: "Map context",
      summary: "Open the stop in map view and continue the route on foot."
    };
  }
  return {
    ctaLabel: "Continue On Foot",
    chipLabel: "On-foot handoff",
    summary: "Step out and continue the story on foot."
  };
}

export function parseHandoffUrl(url: string): HandoffTarget | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  const withoutScheme = trimmed.replace(/^phillyartours:\/\//i, "");
  const parts = withoutScheme.split("/").filter(Boolean);
  if (parts.length < 5) {
    return null;
  }
  if (parts[0] !== "tour" || parts[2] !== "stop") {
    return null;
  }

  const mode = parts[4];
  if (mode !== "arrive" && mode !== "map" && mode !== "ar") {
    return null;
  }

  return {
    tourId: decodeURIComponent(parts[1]),
    stopId: decodeURIComponent(parts[3]),
    mode
  };
}

export function buildHandoffUrl(target: HandoffTarget) {
  return `phillyartours://tour/${encodeURIComponent(target.tourId)}/stop/${encodeURIComponent(target.stopId)}/${target.mode}`;
}
