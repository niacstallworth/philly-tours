export const STYLE_PRESET_VALUES = new Set([
  "",
  "architectural",
  "cinematic",
  "editorial",
  "museum_card",
  "documentary"
]);

export const VISUAL_PRIORITY_VALUES = new Set([
  "",
  "facade_accuracy",
  "historical_accuracy",
  "atmosphere",
  "readability",
  "silhouette"
]);

function inferStylePreset(arType) {
  switch ((arType || "").trim()) {
    case "before_after_overlay":
    case "object_on_plinth":
    case "animated_diagram":
      return "architectural";
    case "portal_reconstruction":
    case "historical_figure_presence":
      return "cinematic";
    case "floating_story_card":
      return "editorial";
    case "route_ghost":
      return "museum_card";
    default:
      return "documentary";
  }
}

function inferVisualPriority(arType) {
  switch ((arType || "").trim()) {
    case "before_after_overlay":
      return "facade_accuracy";
    case "object_on_plinth":
    case "animated_diagram":
      return "historical_accuracy";
    case "portal_reconstruction":
      return "atmosphere";
    case "historical_figure_presence":
      return "silhouette";
    case "floating_story_card":
    case "route_ghost":
      return "readability";
    default:
      return "historical_accuracy";
  }
}

export function resolveStylePreset(record) {
  return (record.stylePreset || "").trim() || inferStylePreset(record.arType);
}

export function resolveVisualPriority(record) {
  return (record.visualPriority || "").trim() || inferVisualPriority(record.arType);
}
