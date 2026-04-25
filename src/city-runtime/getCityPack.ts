import { getActiveCity } from "./getActiveCity";
import { getCityPackById } from "./registry";

export function getCityPack() {
  return getCityPackById(getActiveCity());
}
