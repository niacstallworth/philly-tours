export type Stop = {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  triggerRadiusM: number;
  modelUrl: string;
  audioUrl: string;
};

export type Tour = {
  id: string;
  title: string;
  durationMin: number;
  distanceMiles: number;
  rating: number;
  stops: Stop[];
};
