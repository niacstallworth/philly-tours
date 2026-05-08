import React from "react";
import { getTourCatalogError, getTours, refreshTourCatalog, subscribeToTourCatalog } from "../services/tourCatalog";

export function useTourCatalog() {
  const [tours, setTours] = React.useState(() => getTours());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(() => getTourCatalogError());

  React.useEffect(() => {
    return subscribeToTourCatalog(() => {
      setTours(getTours());
      setError(getTourCatalogError());
    });
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refreshTourCatalog()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      await refreshTourCatalog({ force: true });
    } finally {
      setLoading(false);
      setError(getTourCatalogError());
    }
  }, []);

  return {
    tours,
    loading,
    error,
    refresh
  };
}
