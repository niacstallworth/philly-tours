import React from "react";
import { AppState } from "react-native";
import { loadDriveSession, subscribeToDriveSession, type DriveSession } from "../services/driveMode";

export function useDriveSession() {
  const [driveSession, setDriveSession] = React.useState<DriveSession | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refreshDriveSession = React.useCallback(async () => {
    const stored = await loadDriveSession();
    setDriveSession(stored);
    setLoading(false);
    return stored;
  }, []);

  React.useEffect(() => {
    refreshDriveSession().catch(() => setLoading(false));
  }, [refreshDriveSession]);

  React.useEffect(() => {
    const unsubscribe = subscribeToDriveSession((session) => {
      setDriveSession(session);
      setLoading(false);
    });

    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshDriveSession().catch(() => undefined);
      }
    });

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, [refreshDriveSession]);

  return {
    driveSession,
    setDriveSession,
    loading,
    refreshDriveSession
  };
}
