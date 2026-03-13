export const IMAGE_PROVIDER_VALUES = new Set(["fal", "stability", "replicate"]);

export function inferImageProviderFromArType(arType) {
  switch ((arType || "").trim()) {
    case "before_after_overlay":
    case "object_on_plinth":
    case "animated_diagram":
      return "stability";
    case "portal_reconstruction":
    case "historical_figure_presence":
      return "replicate";
    case "floating_story_card":
    case "route_ghost":
      return "fal";
    default:
      return "fal";
  }
}

export function resolveImageProvider(record) {
  const explicit = (record.imageProvider || "").trim();
  if (explicit) {
    return explicit;
  }
  return inferImageProviderFromArType(record.arType);
}
