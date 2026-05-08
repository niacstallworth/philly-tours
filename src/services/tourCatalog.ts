import { tours as demoTours } from "../data/tours";
import type { Tour } from "../types";
import { fetchPrivateTourCatalog, fetchPrivateTourDetail, mapPrivateTourDetailToRuntimeTour, resetPrivateContentRegistries } from "./privateContent";

type TourCatalogListener = () => void;

const listeners = new Set<TourCatalogListener>();

let runtimeTours: Tour[] = demoTours;
let loadingPromise: Promise<Tour[]> | null = null;
let lastError: string | null = null;
let hasAttemptedRemoteLoad = false;

function emit() {
  listeners.forEach((listener) => listener());
}

export function getTours() {
  return runtimeTours;
}

export function getTourById(tourId: string | null | undefined) {
  if (!tourId) {
    return null;
  }
  return runtimeTours.find((tour) => tour.id === tourId) || null;
}

export function getTourCatalogError() {
  return lastError;
}

export function hasLoadedPrivateTourCatalog() {
  return hasAttemptedRemoteLoad;
}

export function subscribeToTourCatalog(listener: TourCatalogListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function refreshTourCatalog(options: { force?: boolean } = {}) {
  if (loadingPromise && !options.force) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    hasAttemptedRemoteLoad = true;
    try {
      const summaries = await fetchPrivateTourCatalog();
      resetPrivateContentRegistries();
      const details = await Promise.all(
        summaries.map(async (summary) => {
          const detail = await fetchPrivateTourDetail(summary.id);
          return detail ? mapPrivateTourDetailToRuntimeTour(detail) : null;
        })
      );
      const nextTours = details.filter((tour): tour is Tour => Boolean(tour));
      runtimeTours = nextTours.length ? nextTours : demoTours;
      lastError = null;
      emit();
      return runtimeTours;
    } catch (error) {
      runtimeTours = runtimeTours.length ? runtimeTours : demoTours;
      lastError = (error as Error).message || "Unable to refresh private tour catalog.";
      emit();
      return runtimeTours;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}
