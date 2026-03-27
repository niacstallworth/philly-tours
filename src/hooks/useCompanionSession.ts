import React from "react";
import {
  getCompanionStatus,
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
    return () => {
      unsubscribeStatus();
      unsubscribeCommands();
    };
  }, []);

  return {
    status,
    lastCommandResult
  };
}
