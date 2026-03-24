import { Platform } from "react-native";

export type UpgradePlanId = "plus" | "pro";

type UpgradeProductConfig = {
  planId: UpgradePlanId;
  productId: string;
  label: string;
};

function env(name: string) {
  switch (name) {
    case "EXPO_PUBLIC_IAP_PLUS_IOS":
      return process.env.EXPO_PUBLIC_IAP_PLUS_IOS?.trim();
    case "EXPO_PUBLIC_IAP_PRO_IOS":
      return process.env.EXPO_PUBLIC_IAP_PRO_IOS?.trim();
    case "EXPO_PUBLIC_IAP_PLUS_ANDROID":
      return process.env.EXPO_PUBLIC_IAP_PLUS_ANDROID?.trim();
    case "EXPO_PUBLIC_IAP_PRO_ANDROID":
      return process.env.EXPO_PUBLIC_IAP_PRO_ANDROID?.trim();
    default:
      return undefined;
  }
}

const iosPlus = env("EXPO_PUBLIC_IAP_PLUS_IOS") || "com.founders.phillyartours.plus";
const iosPro = env("EXPO_PUBLIC_IAP_PRO_IOS") || "com.founders.phillyartours.pro";
const androidPlus = env("EXPO_PUBLIC_IAP_PLUS_ANDROID") || "com.founders.phillyartours.plus";
const androidPro = env("EXPO_PUBLIC_IAP_PRO_ANDROID") || "com.founders.phillyartours.pro";

const IOS_UPGRADES: UpgradeProductConfig[] = [
  { planId: "plus", productId: iosPlus, label: "Plus Upgrade" },
  { planId: "pro", productId: iosPro, label: "Pro Upgrade" }
];

const ANDROID_UPGRADES: UpgradeProductConfig[] = [
  { planId: "plus", productId: androidPlus, label: "Plus Upgrade" },
  { planId: "pro", productId: androidPro, label: "Pro Upgrade" }
];

export function getUpgradeProducts() {
  return Platform.OS === "ios" ? IOS_UPGRADES : ANDROID_UPGRADES;
}

export function findUpgradeByPlan(planId: UpgradePlanId) {
  return getUpgradeProducts().find((item) => item.planId === planId) || null;
}
