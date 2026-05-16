import { getSyncServerUrl } from "../config/runtime";
import { getAuthHeaders } from "./auth";

export type DevicePushTokenRecord = {
  id?: number;
  platform?: string;
  provider?: string;
  token?: string;
  app_id?: string | null;
  device_id?: string | null;
  device_name?: string | null;
  app_version?: string | null;
  status?: string;
  last_seen_at?: number;
  created_at?: number;
  updated_at?: number;
};

function toApiError(error: unknown, fallbackMessage: string) {
  const asError = error as Error | undefined;
  const message = (asError?.message || "").toLowerCase();
  if (message.includes("network request failed") || message.includes("failed to fetch")) {
    return new Error(`${fallbackMessage} (sync server unreachable at ${getSyncServerUrl()})`);
  }
  return new Error(asError?.message || fallbackMessage);
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getSyncServerUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(init.headers || {})
      }
    });
  } catch (error) {
    throw toApiError(error, "Unable to reach push token endpoint.");
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(data.error || "Unable to reach push token endpoint.");
  }
  return data;
}

export async function listDevicePushTokens() {
  const data = await requestJson<{ devices?: DevicePushTokenRecord[] }>("/api/push/devices", { method: "GET" });
  return data.devices || [];
}

export async function registerDevicePushToken(payload: {
  token: string;
  platform?: string;
  provider?: string;
  appId?: string;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
}) {
  const data = await requestJson<{ device?: DevicePushTokenRecord }>("/api/push/devices", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.device || null;
}

export async function unregisterDevicePushToken(token: string) {
  const data = await requestJson<{ device?: DevicePushTokenRecord }>("/api/push/devices", {
    method: "DELETE",
    body: JSON.stringify({ token })
  });
  return data.device || null;
}
