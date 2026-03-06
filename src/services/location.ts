import * as Location from "expo-location";

export type UserPosition = {
  latitude: number;
  longitude: number;
};

export type PositionWatcher = {
  remove: () => void;
};

export async function requestForegroundLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentPosition(): Promise<UserPosition> {
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };
}

export async function startLocationWatch(
  onPosition: (position: UserPosition) => void,
  onError?: (message: string) => void
): Promise<PositionWatcher> {
  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 5,
      timeInterval: 3000
    },
    (position) => {
      onPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    }
  );

  return {
    remove: () => sub.remove()
  };
}
