import * as WebBrowser from "expo-web-browser";
import { Linking, Platform } from "react-native";

const NO_BROWSER_ACTIVITY_MESSAGE = "no matching browser activity found";

export type AuthSessionOpenResult = WebBrowser.WebBrowserAuthSessionResult | { type: "opened" };

function isMissingBrowserActivityError(error: unknown) {
  const message = (error as Error | undefined)?.message?.toLowerCase() || "";
  return message.includes(NO_BROWSER_ACTIVITY_MESSAGE);
}

async function openUrlWithFallback(url: string) {
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error("No browser app is available on this device. Install Chrome or another browser and try again.");
  }
  await Linking.openURL(url);
}

export async function openAuthSessionWithFallback(url: string, returnUrl: string): Promise<AuthSessionOpenResult> {
  try {
    return await WebBrowser.openAuthSessionAsync(url, returnUrl);
  } catch (error) {
    if (Platform.OS === "android" && isMissingBrowserActivityError(error)) {
      await openUrlWithFallback(url);
      return { type: "opened" };
    }
    throw error;
  }
}

export async function openBrowserWithFallback(url: string) {
  try {
    return await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    if (Platform.OS === "android" && isMissingBrowserActivityError(error)) {
      await openUrlWithFallback(url);
      return { type: "opened" as const };
    }
    throw error;
  }
}
