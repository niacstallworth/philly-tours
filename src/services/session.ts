import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppMode } from "../screens/OnboardingScreen";

const SESSION_KEY = "philly_tours_session_v1";

export type StoredSession = {
  displayName: string;
  email: string;
  mode: AppMode;
  userId: string;
};

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed.email || !parsed.userId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveSession(session: StoredSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
