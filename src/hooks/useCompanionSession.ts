import React from "react";
import {
  getCompanionStatus,
  subscribeToCompanionStatus,
  type CompanionCommand,
  type CompanionCommandResult
} from "../services/companion";
import type { WearableStatus } from "../services/wearables";

export function useCompanionSession() {
  const [status, setStatus] = React.useState<WearableStatus>(() => getCompanionStatus());
  const [lastCommandResult, setLastCommandResult] = React.useState<CompanionCommandResult | null>(null);

  React.useEffect(() => subscribeToCompanionStatus(setStatus), []);

  function recordCommandResult(command: CompanionCommand, result: CompanionCommandResult) {
    setLastCommandResult({
      ...result,
      message: `[${command.type}] ${result.message}`
    });
  }

  return {
    status,
    lastCommandResult,
    recordCommandResult
  };
}
