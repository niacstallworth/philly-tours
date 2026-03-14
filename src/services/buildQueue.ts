import AsyncStorage from "@react-native-async-storage/async-storage";

const BUILD_QUEUE_ASSET_COMPLETE_KEY = "philly_tours_build_queue_asset_complete_v1";
const BUILD_QUEUE_SCENE_BUILT_KEY = "philly_tours_build_queue_scene_built_v1";
const BUILD_QUEUE_QA_COMPLETE_KEY = "philly_tours_build_queue_qa_complete_v1";

export async function loadCompletedAssetIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(BUILD_QUEUE_ASSET_COMPLETE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export async function saveCompletedAssetIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(BUILD_QUEUE_ASSET_COMPLETE_KEY, JSON.stringify(ids));
}

export async function loadBuiltSceneIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(BUILD_QUEUE_SCENE_BUILT_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export async function saveBuiltSceneIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(BUILD_QUEUE_SCENE_BUILT_KEY, JSON.stringify(ids));
}

export async function loadQACompleteIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(BUILD_QUEUE_QA_COMPLETE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export async function saveQACompleteIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(BUILD_QUEUE_QA_COMPLETE_KEY, JSON.stringify(ids));
}
