import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { loadDriveSession, type DriveSession } from "../services/driveMode";

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

  useFocusEffect(
    React.useCallback(() => {
      refreshDriveSession().catch(() => undefined);
    }, [refreshDriveSession])
  );

  return {
    driveSession,
    setDriveSession,
    loading,
    refreshDriveSession
  };
}
