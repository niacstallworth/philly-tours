import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { registerDevicePushToken, unregisterDevicePushToken } from "./pushDevices";

function getAppVersion() {
  return Constants.expoConfig?.version || Constants.nativeAppVersion || undefined;
}

function getAppId() {
  return Constants.expoConfig?.android?.package || Constants.expoConfig?.ios?.bundleIdentifier || undefined;
}

async function getDeviceToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  let permissionStatus = currentPermissions.status;
  if (permissionStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    permissionStatus = requested.status;
  }

  if (permissionStatus !== "granted") {
    return null;
  }

  const token = await Notifications.getDevicePushTokenAsync();
  return token.data?.trim() || null;
}

export async function registerCurrentDevicePushToken(userId: string) {
  const token = await getDeviceToken();
  if (!token) {
    return null;
  }

  const record = await registerDevicePushToken({
    token,
    platform: Platform.OS,
    provider: "fcm",
    appId: getAppId(),
    appVersion: getAppVersion()
  });
  return record;
}

export async function clearCurrentDevicePushToken() {
  const token = await Notifications.getDevicePushTokenAsync().then((result) => result.data?.trim() || null).catch(() => null);
  if (!token) {
    return null;
  }
  return unregisterDevicePushToken(token);
}
