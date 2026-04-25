import { DEFAULT_CITY_ID, isSupportedCityId, type SupportedCityId } from "./registry";

export function getActiveCity(): SupportedCityId {
  const raw = String(process.env.EXPO_PUBLIC_CITY || DEFAULT_CITY_ID).trim().toLowerCase();
  return isSupportedCityId(raw) ? raw : DEFAULT_CITY_ID;
}
