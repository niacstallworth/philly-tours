const LOCAL_SYNC_SERVER_URL = "http://localhost:4000";
const PRODUCTION_SYNC_SERVER_URL = "https://api.philly-tours.com";

function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

function isLocalHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1" || normalized.endsWith(".local");
}

function isLocalDevRuntime() {
  const devFlag = typeof __DEV__ !== "undefined" && __DEV__;
  if (!devFlag) {
    return false;
  }

  const maybeLocation = globalThis as { location?: { hostname?: string } };
  const hostname = maybeLocation.location?.hostname;
  return !hostname || isLocalHostname(hostname);
}

export function getSyncServerUrl() {
  const configured = (process.env.EXPO_PUBLIC_SYNC_SERVER_URL || "").trim();
  if (configured) {
    return trimTrailingSlashes(configured);
  }

  return isLocalDevRuntime() ? LOCAL_SYNC_SERVER_URL : PRODUCTION_SYNC_SERVER_URL;
}
