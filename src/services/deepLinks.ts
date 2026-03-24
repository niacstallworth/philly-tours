export type HandoffMode = "arrive" | "map";

export type HandoffTarget = {
  tourId: string;
  stopId: string;
  mode: HandoffMode;
};

export function getHandoffModeMeta(mode: HandoffMode) {
  if (mode === "map") {
    return {
      ctaLabel: "Open Tour Stop",
      chipLabel: "Stop context",
      summary: "Open the stop in the main tour view and continue the story there."
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
    mode: mode === "ar" ? "map" : mode
  };
}

export function buildHandoffUrl(target: HandoffTarget) {
  return `phillyartours://tour/${encodeURIComponent(target.tourId)}/stop/${encodeURIComponent(target.stopId)}/${target.mode}`;
}
