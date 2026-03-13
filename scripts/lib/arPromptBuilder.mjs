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

function defaultEra(record) {
  const title = (record.stopTitle || "").toLowerCase();
  if (title.includes("president's house") || title.includes("johnson house") || title.includes("mother bethel")) {
    return "18th to 19th century Philadelphia";
  }
  if (title.includes("frazier") || title.includes("palestra") || title.includes("overbrook")) {
    return "20th century Philadelphia";
  }
  return "historic Philadelphia";
}

function styleInstruction(stylePreset) {
  switch (stylePreset) {
    case "architectural":
      return "Prioritize architectural fidelity, straight lines, facade detail, masonry, windows, signage, and historically believable materials.";
    case "cinematic":
      return "Use atmospheric lighting, layered depth, strong focal composition, and dramatic but historically respectful staging.";
    case "editorial":
      return "Use clean editorial composition, readable foreground subject placement, and uncluttered negative space suitable for mobile AR cards.";
    case "museum_card":
      return "Use clear iconographic composition, restrained palette, and legible educational framing suitable for interpretive overlays.";
    case "documentary":
      return "Use documentary realism with accurate environmental context and restrained stylization.";
    default:
      return "";
  }
}

function priorityInstruction(priority) {
  switch (priority) {
    case "facade_accuracy":
      return "Emphasize exact building frontage, proportions, street-facing detail, and before/after alignment potential.";
    case "historical_accuracy":
      return "Emphasize historically grounded objects, clothing, signage, and environment details over fantasy styling.";
    case "atmosphere":
      return "Emphasize mood, depth, period atmosphere, and immersive scene presence.";
    case "readability":
      return "Emphasize clarity, readable composition, simple silhouettes, and reduced background clutter.";
    case "silhouette":
      return "Emphasize strong human silhouette, respectful figure staging, and recognizable pose over facial close-up detail.";
    default:
      return "";
  }
}

function providerInstruction(provider) {
  switch (provider) {
    case "stability":
      return "Optimize for high-detail environment rendering, facade structure, and crisp surface detail.";
    case "replicate":
      return "Optimize for atmospheric storytelling, cinematic scene composition, and emotionally strong historical reconstruction.";
    case "fal":
      return "Optimize for speed, simplicity, clean composition, and lightweight concept coverage.";
    default:
      return "";
  }
}

export function resolveStylePreset(record) {
  return (record.stylePreset || "").trim() || inferStylePreset(record.arType);
}

export function resolveVisualPriority(record) {
  return (record.visualPriority || "").trim() || inferVisualPriority(record.arType);
}

export function buildProviderPrompt(record, provider, explicitPrompt) {
  const arTypeLabel = (record.arType || "ar scene").replaceAll("_", " ");
  const assetBrief = (record.assetNeeded || "historic Philadelphia storytelling scene").trim();
  const basePrompt =
    (explicitPrompt || "").trim() ||
    `Concept art for a mobile augmented reality ${arTypeLabel} experience at ${record.stopTitle} in Philadelphia. Show ${assetBrief}.`;
  const era = (record.historicalEra || "").trim() || defaultEra(record);
  const stylePreset = resolveStylePreset(record);
  const visualPriority = resolveVisualPriority(record);
  const notes = (record.notes || "").trim();
  const negativePrompt = (record.negativePrompt || "").trim();

  const parts = [
    basePrompt,
    `Historical era focus: ${era}.`,
    styleInstruction(stylePreset),
    priorityInstruction(visualPriority),
    providerInstruction(provider),
    notes ? `Production notes: ${notes}.` : "",
    negativePrompt ? `Avoid: ${negativePrompt}.` : "",
    "Historically grounded. Strong composition for an AR tour app."
  ].filter(Boolean);

  return parts.join(" ");
}
