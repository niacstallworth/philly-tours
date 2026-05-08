export type NarrationVariant = "drive" | "walk";

export type NarrationCatalogEntry = {
  drive?: string;
  walk?: string;
};

export const narrationCatalogByStopId: Record<string, NarrationCatalogEntry> = {
  "founders-demo-route-welcome-plaza": {
    drive: "",
    walk: ""
  },
  "founders-demo-route-story-corner": {
    drive: "",
    walk: ""
  },
  "founders-demo-route-compass-garden": {
    drive: "",
    walk: ""
  },
  "founders-demo-route-finish-arch": {
    drive: "",
    walk: ""
  }
};
