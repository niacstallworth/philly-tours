import { getAuthHeaders } from "./auth";

export type LatLngLiteral = {
  lat: number;
  lng: number;
};

export type StaticMapViewport = {
  center: LatLngLiteral;
  zoom: number;
};

export type RoutePreviewStop = LatLngLiteral & {
  title?: string;
};

export type RoutePreviewRequest = {
  stops: RoutePreviewStop[];
  travelMode?: "DRIVE" | "BICYCLE" | "WALK" | "TWO_WHEELER";
  routingPreference?: "TRAFFIC_AWARE" | "TRAFFIC_AWARE_OPTIMAL" | "TRAFFIC_UNAWARE";
  computeAlternativeRoutes?: boolean;
  languageCode?: string;
  regionCode?: string;
};

export type RoutePreviewLeg = {
  startLocation: LatLngLiteral | null;
  endLocation: LatLngLiteral | null;
  distanceMeters: number;
  duration: string;
  staticDuration: string;
  startTitle: string | null;
  endTitle: string | null;
};

export type RoutePreviewSummary = {
  distanceMeters: number;
  duration: string;
  staticDuration: string;
  viewport: unknown;
  polyline: string;
  polylineSegments?: string[];
  legs: RoutePreviewLeg[];
};

export type RoutePreviewResponse = {
  ok: boolean;
  mode: string;
  stopCount: number;
  routeCount: number;
  routes: RoutePreviewSummary[];
  primaryRoute: RoutePreviewSummary | null;
};

export type PlaceSearchRequest = {
  textQuery: string;
  locationBias?: LatLngLiteral;
  radiusMeters?: number;
  includedType?: string;
  maxResultCount?: number;
  languageCode?: string;
  regionCode?: string;
};

export type PlaceDetailsRequest = {
  placeId: string;
  languageCode?: string;
  regionCode?: string;
};

export type GeocodeRequest =
  | {
      address: string;
      placeId?: never;
      location?: never;
      language?: string;
      region?: string;
    }
  | {
      address?: never;
      placeId: string;
      location?: never;
      language?: string;
      region?: string;
    }
  | {
      address?: never;
      placeId?: never;
      location: LatLngLiteral;
      language?: string;
      region?: string;
    };

function getServerUrl() {
  const base = (process.env.EXPO_PUBLIC_SYNC_SERVER_URL || "http://localhost:4000").trim();
  return base.replace(/\/+$/, "");
}

function toApiError(error: unknown, fallbackMessage: string) {
  const asError = error as Error | undefined;
  const message = (asError?.message || "").toLowerCase();
  if (message.includes("network request failed") || message.includes("failed to fetch")) {
    return new Error(`${fallbackMessage} (sync server unreachable at ${getServerUrl()})`);
  }
  return new Error(asError?.message || fallbackMessage);
}

async function postJson<T>(path: string, body: Record<string, unknown>, fallbackMessage: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    throw toApiError(error, fallbackMessage);
  }

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

export async function getRoutePreview(request: RoutePreviewRequest) {
  return postJson<RoutePreviewResponse>("/api/maps/route-preview", request as Record<string, unknown>, "Unable to load route preview.");
}

export function getStaticMapUrl(coordinates: LatLngLiteral[], viewport?: StaticMapViewport) {
  const validCoordinates = coordinates.filter((coordinate) => Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng));
  const query = new URLSearchParams({
    size: "900x560",
    scale: "2",
    maptype: "roadmap",
    v: "android-static-map-v2"
  });

  if (viewport) {
    query.set("center", `${viewport.center.lat},${viewport.center.lng}`);
    query.set("zoom", String(viewport.zoom));
  } else {
    validCoordinates.forEach((coordinate, index) => {
      const label = index < 9 ? `|label:${index + 1}` : "";
      query.append("markers", `size:mid|color:0xb45b3d${label}|${coordinate.lat},${coordinate.lng}`);
    });
  }

  return `${getServerUrl()}/api/maps/static-map?${query.toString()}`;
}

export async function searchPlaces(request: PlaceSearchRequest) {
  return postJson<{ ok: boolean; places: unknown[]; nextPageToken: string | null; searchUri: string | null }>(
    "/api/maps/place-search",
    request as Record<string, unknown>,
    "Unable to search places."
  );
}

export async function getPlaceDetails(request: PlaceDetailsRequest) {
  return postJson<{ ok: boolean; place: unknown }>(
    "/api/maps/place-details",
    request as Record<string, unknown>,
    "Unable to load place details."
  );
}

export async function geocodeLocation(request: GeocodeRequest) {
  return postJson<{
    ok: boolean;
    status: string;
    results: Array<{
      formattedAddress: string;
      placeId: string | null;
      location: LatLngLiteral | null;
      types: string[];
    }>;
  }>("/api/maps/geocode", request as Record<string, unknown>, "Unable to geocode location.");
}
