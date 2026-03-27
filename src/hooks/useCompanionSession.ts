import React from "react";
import { AppState } from "react-native";
import {
  getCompanionStatus,
  refreshCompanionStatus,
  getLastCompanionCommandResult,
  subscribeToCompanionStatus,
  subscribeToCompanionCommands,
  type CompanionCommandLog
} from "../services/companion";
import type { WearableStatus } from "../services/wearables";

export function useCompanionSession() {
  const [status, setStatus] = React.useState<WearableStatus>(() => getCompanionStatus());
  const [lastCommandResult, setLastCommandResult] = React.useState<CompanionCommandLog>(() => getLastCompanionCommandResult());

  React.useEffect(() => {
    const unsubscribeStatus = subscribeToCompanionStatus(setStatus);
    const unsubscribeCommands = subscribeToCompanionCommands(setLastCommandResult);
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        refreshCompanionStatus().catch(() => undefined);
      }
    });
    return () => {
      unsubscribeStatus();
      unsubscribeCommands();
      appStateSubscription.remove();
    };
  }, []);

  return {
    status,
    lastCommandResult
  };
}
