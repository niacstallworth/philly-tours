import React from "react";
import { AppState } from "react-native";
import { getNarrationState, subscribeToNarration, type NarrationState } from "../services/narration";

export function useNarration() {
  const [narration, setNarration] = React.useState<NarrationState>(getNarrationState());

  React.useEffect(() => {
    const unsubscribe = subscribeToNarration(setNarration);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setNarration(getNarrationState());
      }
    });

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  return narration;
}
