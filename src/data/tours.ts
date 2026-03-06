import { Tour } from "../types";

export const tours: Tour[] = [
  {
    id: "historic-philly",
    title: "Historic Philadelphia AR Walk",
    durationMin: 90,
    distanceMiles: 2.1,
    rating: 4.8,
    stops: [
      {
        id: "liberty-bell",
        title: "Liberty Bell",
        description: "See a reconstructed 1776 Liberty Bell in AR.",
        lat: 39.9496,
        lng: -75.1503,
        triggerRadiusM: 40,
        modelUrl: "/models/liberty-bell.glb",
        audioUrl: "/audio/liberty-bell.mp3"
      },
      {
        id: "independence-hall",
        title: "Independence Hall",
        description: "Time-travel scene of the Constitutional Convention.",
        lat: 39.9489,
        lng: -75.1500,
        triggerRadiusM: 40,
        modelUrl: "/models/independence-hall.glb",
        audioUrl: "/audio/independence-hall.mp3"
      },
      {
        id: "betsy-ross-house",
        title: "Betsy Ross House",
        description: "AR story on the early U.S. flag era.",
        lat: 39.9522,
        lng: -75.1446,
        triggerRadiusM: 40,
        modelUrl: "/models/betsy-ross-house.glb",
        audioUrl: "/audio/betsy-ross-house.mp3"
      }
    ]
  }
];
