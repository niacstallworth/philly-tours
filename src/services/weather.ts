import { getAuthHeaders } from "./auth";

export type CurrentWeather = {
  provider: "google_weather";
  city: string;
  location: {
    lat: number;
    lng: number;
  };
  currentTime: string | null;
  timeZoneId: string;
  isDaytime: boolean;
  condition: string;
  conditionType: string | null;
  iconBaseUri: string | null;
  temperatureF: number | null;
  feelsLikeF: number | null;
  humidityPct: number | null;
  precipitationPct: number | null;
  precipitationType: string | null;
  windMph: number | null;
  windDirection: string | null;
};

export type CurrentWeatherResponse = {
  ok: boolean;
  weather: CurrentWeather;
};

const PHILADELPHIA_CENTER = {
  lat: 39.9526,
  lng: -75.1652
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

export async function getPhiladelphiaCurrentWeather() {
  const query = new URLSearchParams({
    lat: String(PHILADELPHIA_CENTER.lat),
    lng: String(PHILADELPHIA_CENTER.lng),
    unitsSystem: "IMPERIAL",
    languageCode: "en"
  });

  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}/api/weather/current?${query.toString()}`, {
      method: "GET",
      headers: getAuthHeaders()
    });
  } catch (error) {
    throw toApiError(error, "Unable to load Philadelphia weather.");
  }

  const data = (await response.json().catch(() => ({}))) as Partial<CurrentWeatherResponse> & { error?: string };
  if (!response.ok || !data.weather) {
    throw new Error(data.error || "Unable to load Philadelphia weather.");
  }
  return data.weather;
}
