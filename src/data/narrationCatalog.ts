export type NarrationVariant = "drive" | "walk";

export type NarrationCatalogEntry = {
  drive?: string;
  walk?: string;
};

export const narrationCatalogByStopId: Record<string, NarrationCatalogEntry> = {
  "black-american-legacy-and-quaker-heritage-johnson-house": {
    drive: "/audio/johnson-house-drive.mp3",
    walk: "/audio/johnson-house-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-mother-bethel-ame-church": {
    drive: "/audio/mother-bethel-ame-church-drive.mp3",
    walk: "/audio/mother-bethel-ame-church-walk.mp3",
  },
  "black-american-legacy-and-quaker-heritage-president-s-house-liberty-bell-center": {
    drive: "/audio/presidents-house-liberty-bell-center-drive.mp3",
    walk: "/audio/presidents-house-liberty-bell-center-walk.mp3",
  },
  "black-american-sports-the-palestra": {
    drive: "/audio/the-palestra-drive.mp3",
    walk: "/audio/the-palestra-walk.mp3",
  },
  "rainbow-girls-philadelphia-masonic-temple": {
    drive: "/audio/masonic-temple-drive.mp3",
    walk: "/audio/masonic-temple-walk.mp3",
  },
};

