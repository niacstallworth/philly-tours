export type HandoffMode = "arrive" | "map" | "ar";

export type HandoffTarget = {
  tourId: string;
  stopId: string;
  mode: HandoffMode;
};

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
