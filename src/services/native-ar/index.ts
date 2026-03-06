import { Platform } from "react-native";
import { AndroidARCoreAdapter } from "./androidArcoreAdapter";
import { IOSARKitAdapter } from "./iosArkitAdapter";
import { UnsupportedARAdapter } from "./unsupportedAdapter";
import { NativeARAdapter } from "./types";

export function getNativeARAdapter(): NativeARAdapter {
  if (Platform.OS === "ios") {
    return new IOSARKitAdapter();
  }

  if (Platform.OS === "android") {
    return new AndroidARCoreAdapter();
  }

  return new UnsupportedARAdapter();
}
