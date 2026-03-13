export type Stop = {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  coordQuality?: "verified" | "approximate";
  triggerRadiusM: number;
  modelUrl: string;
  audioUrl: string;
  verticalOffsetM?: number;
  arType?:
    | "hero"
    | "light"
    | "none"
    | "portal_reconstruction"
    | "object_on_plinth"
    | "floating_story_card"
    | "before_after_overlay"
    | "historical_figure_presence"
    | "animated_diagram"
    | "route_ghost"
    | "puzzle_reveal";
  arPriority?: number;
  assetNeeded?: string;
  estimatedEffort?: "low" | "medium" | "high";
};

export type Tour = {
  id: string;
  title: string;
  durationMin: number;
  distanceMiles: number;
  rating: number;
  heroPlanningNote?: string;
  stops: Stop[];
};
