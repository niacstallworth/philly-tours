import { Platform } from "react-native";
import { AppMode } from "../screens/OnboardingScreen";

export type AuthenticatedSession = {
  displayName: string;
  email: string;
  mode: AppMode;
  userId: string;
  roles: string[];
  authToken: string;
  authExpiresAt?: number | null;
};

let authToken: string | null = null;

export type OAuthProvider = "google" | "apple";

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

function getClientHeaders(): Record<string, string> {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return {
      "X-Philly-Tours-Native-App": Platform.OS
    };
  }
  return {};
}

export function setAuthToken(token: string | null | undefined) {
  authToken = token?.trim() || null;
}

export function getAuthToken() {
  return authToken;
}

export function getAuthHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

export async function createAuthenticatedSession(payload: {
  displayName: string;
  email: string;
  mode: AppMode;
  password?: string;
  turnstileToken?: string;
}): Promise<AuthenticatedSession> {
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}/api/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getClientHeaders()
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw toApiError(error, "Unable to sign in.");
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    token?: string;
    expiresAt?: number | null;
    session?: {
      displayName: string;
      email: string;
      mode: AppMode;
      userId: string;
      roles?: string[];
    };
  };
  if (!response.ok || !data.token || !data.session) {
    throw new Error(data.error || "Unable to sign in.");
  }

  return {
    ...data.session,
    roles: data.session.roles || [],
    authToken: data.token,
    authExpiresAt: data.expiresAt ?? null
  };
}

export async function createOAuthAuthenticatedSession(payload: {
  accessToken: string;
  provider?: OAuthProvider;
}): Promise<AuthenticatedSession> {
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}/api/auth/oauth-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getClientHeaders()
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw toApiError(error, "Unable to complete provider sign-in.");
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    token?: string;
    expiresAt?: number | null;
    session?: {
      displayName: string;
      email: string;
      mode: AppMode;
      userId: string;
      roles?: string[];
    };
  };
  if (!response.ok || !data.token || !data.session) {
    throw new Error(data.error || "Unable to complete provider sign-in.");
  }

  return {
    ...data.session,
    roles: data.session.roles || [],
    authToken: data.token,
    authExpiresAt: data.expiresAt ?? null
  };
}

export async function validateAuthenticatedSession(token: string): Promise<AuthenticatedSession> {
  let response: Response;
  try {
    response = await fetch(`${getServerUrl()}/api/auth/session`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    throw toApiError(error, "Unable to validate session.");
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    session?: {
      displayName: string;
      email: string;
      mode: AppMode;
      userId: string;
      roles?: string[];
    };
  };
  if (!response.ok || !data.session) {
    throw new Error(data.error || "Unable to validate session.");
  }

  return {
    ...data.session,
    roles: data.session.roles || [],
    authToken: token,
    authExpiresAt: null
  };
}
