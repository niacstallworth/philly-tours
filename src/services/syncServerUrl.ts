import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

const DEFAULT_SYNC_SERVER_URL = "http://localhost:4000";

function normalizeBaseUrl(value: string | null | undefined) {
  return (value || "").trim().replace(/\/+$/, "");
}

function extractHost(value: string | null | undefined) {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    return url.hostname || null;
  } catch {
    const withoutScheme = trimmed.replace(/^[a-z]+:\/\//i, "");
    const hostPort = withoutScheme.split("/")[0] || "";
    const host = hostPort.split(":")[0] || "";
    return host || null;
  }
}

function getBundlerHost() {
  const sourceCode = NativeModules.SourceCode as { scriptURL?: string } | undefined;
  const constants = Constants as typeof Constants & {
    expoGoConfig?: { debuggerHost?: string; hostUri?: string };
    manifest?: { debuggerHost?: string; hostUri?: string };
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string; hostUri?: string } } };
  };

  const hostCandidates = [
    sourceCode?.scriptURL,
    constants.expoGoConfig?.debuggerHost,
    constants.expoGoConfig?.hostUri,
    constants.manifest2?.extra?.expoGo?.debuggerHost,
    constants.manifest2?.extra?.expoGo?.hostUri,
    constants.manifest?.debuggerHost,
    constants.manifest?.hostUri
  ];

  for (const candidate of hostCandidates) {
    const host = extractHost(candidate);
    if (host) {
      return host;
    }
  }

  return null;
}

function getNativeDevFallbackUrl() {
  if (Platform.OS === "web") {
    return null;
  }

  const host = getBundlerHost();
  if (!host) {
    return null;
  }

  return `http://${host}:4000`;
}

export function getSyncServerUrl() {
  const configured = normalizeBaseUrl(process.env.EXPO_PUBLIC_SYNC_SERVER_URL);
  if (configured) {
    return configured;
  }

  const inferred = normalizeBaseUrl(getNativeDevFallbackUrl());
  if (inferred) {
    return inferred;
  }

  return DEFAULT_SYNC_SERVER_URL;
}
