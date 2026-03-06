import { Stop } from "../types";

const EARTH_RADIUS_M = 6371000;

export function haversineDistanceM(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function getTriggeredStops(
  userLat: number,
  userLng: number,
  stops: Stop[]
): Stop[] {
  return stops.filter((stop) => {
    const d = haversineDistanceM(userLat, userLng, stop.lat, stop.lng);
    return d <= stop.triggerRadiusM;
  });
}
