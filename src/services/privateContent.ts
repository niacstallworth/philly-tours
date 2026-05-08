import { tours as demoTours } from "../data/tours";
import { narrationScriptMapByStopId } from "../data/narrationScriptMap";
import type { Tour } from "../types";
import { getSyncServerUrl } from "../config/runtime";
import { getAuthHeaders } from "./auth";

export type PrivateTourSummary = {
  id: string;
  slug?: string | null;
  city_id?: string | null;
  title: string;
  summary?: string | null;
  duration_min: number;
  distance_miles: number;
  rating?: number | null;
  required_plan_id?: string | null;
  is_published: boolean;
  sort_order?: number | null;
  cover_image_path?: string | null;
  cover_image_bucket?: string | null;
  cover_image_url?: string | null;
  stop_count?: number | null;
};

export type PrivateTourStop = {
  id: string;
  tour_id: string;
  title: string;
  description?: string | null;
  lat: number;
  lng: number;
  coord_quality?: "verified" | "approximate" | null;
  trigger_radius_m?: number | null;
  vertical_offset_m?: number | null;
  stop_order?: number | null;
  ar_type?: string | null;
  ar_priority?: number | null;
  asset_needed?: string | null;
  estimated_effort?: "low" | "medium" | "high" | null;
  street_view?: unknown;
  scripts?: {
    drive?: string;
    walk?: string;
  };
  mediaAssets?: Array<{
    kind: string;
    variant?: string | null;
    platform?: string | null;
    bucket?: string | null;
    object_path: string;
    url?: string | null;
    mime_type?: string | null;
    is_private?: boolean;
    status?: string | null;
  }>;
};

export type PrivateTourDetail = PrivateTourSummary & {
  is_accessible?: boolean;
  preview_only?: boolean;
  stops: PrivateTourStop[];
};

function toApiError(error: unknown, fallbackMessage: string) {
  const asError = error as Error | undefined;
  const message = (asError?.message || "").toLowerCase();
  if (message.includes("network request failed") || message.includes("failed to fetch")) {
    return new Error(`${fallbackMessage} (sync server unreachable at ${getSyncServerUrl()})`);
  }
  return new Error(asError?.message || fallbackMessage);
}

const privateNarrationScriptsByStopId = new Map<
  string,
  {
    drive?: string;
    walk?: string;
  }
>();

const privateMediaAssetsByStopId = new Map<string, NonNullable<PrivateTourStop["mediaAssets"]>>();

function pickStopMediaUrl(
  stop: PrivateTourStop,
  kind: "audio" | "model" | "image",
  preferredVariants: Array<string | null | undefined>
) {
  const assets = stop.mediaAssets || [];
  for (const preferredVariant of preferredVariants) {
    const matched = assets.find(
      (asset) => asset.kind === kind && (preferredVariant == null ? !asset.variant : asset.variant === preferredVariant) && asset.url
    );
    if (matched?.url) {
      return matched.url;
    }
  }
  return assets.find((asset) => asset.kind === kind && asset.url)?.url || "";
}

function mapDemoToursToSummaries(): PrivateTourSummary[] {
  return demoTours.map((tour, index) => ({
    id: tour.id,
    slug: tour.id,
    city_id: "philly",
    title: tour.title,
    summary: tour.stops[0]?.description || "Public demo route.",
    duration_min: tour.durationMin,
    distance_miles: tour.distanceMiles,
    rating: tour.rating,
    required_plan_id: null,
    is_published: true,
    sort_order: index,
    stop_count: tour.stops.length
  }));
}

function mapDemoTourToDetail(tourId: string): PrivateTourDetail | null {
  const tour = demoTours.find((entry) => entry.id === tourId);
  if (!tour) {
    return null;
  }

  return {
    id: tour.id,
    slug: tour.id,
    city_id: "philly",
    title: tour.title,
    summary: tour.stops[0]?.description || "Public demo route.",
    duration_min: tour.durationMin,
    distance_miles: tour.distanceMiles,
    rating: tour.rating,
    required_plan_id: null,
    is_published: true,
    sort_order: 0,
    stop_count: tour.stops.length,
    stops: tour.stops.map((stop, index) => ({
      id: stop.id,
      tour_id: tour.id,
      title: stop.title,
      description: stop.description,
      lat: stop.lat,
      lng: stop.lng,
      coord_quality: stop.coordQuality || "approximate",
      trigger_radius_m: stop.triggerRadiusM,
      vertical_offset_m: stop.verticalOffsetM ?? null,
      stop_order: index,
      ar_type: stop.arType || null,
      ar_priority: stop.arPriority ?? null,
      asset_needed: stop.assetNeeded || null,
      estimated_effort: stop.estimatedEffort || null,
      scripts: narrationScriptMapByStopId[stop.id] || {},
      mediaAssets: []
    }))
  };
}

export async function fetchPrivateTourCatalog() {
  let response: Response;
  try {
    response = await fetch(`${getSyncServerUrl()}/api/content/catalog`, {
      method: "GET",
      headers: {
        ...getAuthHeaders()
      }
    });
  } catch (error) {
    throw toApiError(error, "Unable to load private tour catalog.");
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    tours?: PrivateTourSummary[];
  };

  if (!response.ok) {
    throw new Error(data.error || "Unable to load private tour catalog.");
  }

  return (data.tours && data.tours.length ? data.tours : mapDemoToursToSummaries());
}

export async function fetchPrivateTourDetail(tourId: string) {
  let response: Response;
  try {
    response = await fetch(`${getSyncServerUrl()}/api/content/tours/${encodeURIComponent(tourId)}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders()
      }
    });
  } catch (error) {
    throw toApiError(error, "Unable to load private tour detail.");
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    tour?: PrivateTourDetail | null;
  };

  if (response.status === 404) {
    return mapDemoTourToDetail(tourId);
  }

  if (!response.ok) {
    throw new Error(data.error || "Unable to load private tour detail.");
  }

  return data.tour || mapDemoTourToDetail(tourId);
}

export function resetPrivateContentRegistries() {
  privateNarrationScriptsByStopId.clear();
  privateMediaAssetsByStopId.clear();
}

export function getPrivateNarrationScripts(stopId: string) {
  return privateNarrationScriptsByStopId.get(stopId) || null;
}

export function getPrivateMediaAssets(stopId: string) {
  return privateMediaAssetsByStopId.get(stopId) || [];
}

export function mapPrivateTourDetailToRuntimeTour(detail: PrivateTourDetail): Tour {
  for (const stop of detail.stops || []) {
    privateNarrationScriptsByStopId.set(stop.id, stop.scripts || {});
    privateMediaAssetsByStopId.set(stop.id, stop.mediaAssets || []);
  }
  return {
    id: detail.id,
    title: detail.title,
    durationMin: detail.duration_min,
    distanceMiles: Number(detail.distance_miles || 0),
    rating: Number(detail.rating || 0),
    requiredPlanId: detail.required_plan_id || null,
    isAccessible: Boolean(detail.is_accessible),
    previewOnly: Boolean(detail.preview_only),
    cardMedia: detail.cover_image_url
      ? {
          type: "image",
          src: detail.cover_image_url,
          alt: `${detail.title} cover`
        }
      : undefined,
    stops: (detail.stops || []).map((stop) => ({
      id: stop.id,
      title: stop.title,
      description: stop.description || "",
      lat: Number(stop.lat || 0),
      lng: Number(stop.lng || 0),
      coordQuality: stop.coord_quality || "approximate",
      triggerRadiusM: Number(stop.trigger_radius_m || 35),
      modelUrl: pickStopMediaUrl(stop, "model", ["hero", "default", null]),
      audioUrl: pickStopMediaUrl(stop, "audio", ["walk", "default", "drive", null]),
      verticalOffsetM: stop.vertical_offset_m == null ? undefined : Number(stop.vertical_offset_m),
      arType: stop.ar_type ? (stop.ar_type as Tour["stops"][number]["arType"]) : undefined,
      arPriority: stop.ar_priority == null ? undefined : Number(stop.ar_priority),
      assetNeeded: stop.asset_needed || undefined,
      estimatedEffort: stop.estimated_effort || undefined
    }))
  };
}
