import { tours } from "../data/tours";
import type { HandoffMode } from "./deepLinks";
import { triggerHandoffTarget } from "./handoffBus";
import { recordStopOpened } from "./gameProgress";

type TourSelection = {
  tourId: string | null;
  stopId: string | null;
};

let currentSelection: TourSelection = {
  tourId: tours[0]?.id || null,
  stopId: tours[0]?.stops[0]?.id || null
};

export function setCurrentTourSelection(tourId: string | null, stopId: string | null) {
  currentSelection = { tourId, stopId };
  recordStopOpened(stopId);
}

export function getCurrentTourSelection() {
  return currentSelection;
}

export function getCurrentTourContext() {
  const selectedTour =
    tours.find((tour) => tour.id === currentSelection.tourId) ||
    tours.find((tour) => tour.stops.some((stop) => stop.id === currentSelection.stopId)) ||
    tours[0] ||
    null;

  if (!selectedTour) {
    return null;
  }

  const selectedStop =
    selectedTour.stops.find((stop) => stop.id === currentSelection.stopId) ||
    selectedTour.stops[0] ||
    null;

  if (!selectedStop) {
    return null;
  }

  const stopIndex = selectedTour.stops.findIndex((stop) => stop.id === selectedStop.id);
  const nextStop = stopIndex >= 0 ? selectedTour.stops[stopIndex + 1] || null : null;

  return {
    tour: selectedTour,
    stop: selectedStop,
    stopIndex,
    nextStop
  };
}

export function openTourStopOnPhone(tourId: string, stopId: string, mode: HandoffMode = "map") {
  setCurrentTourSelection(tourId, stopId);
  triggerHandoffTarget({
    tourId,
    stopId,
    mode
  });
}
