import * as Location from "expo-location";

export type UserPosition = {
  latitude: number;
  longitude: number;
};

export type UserHeading = {
  magHeadingDeg: number | null;
  trueHeadingDeg: number | null;
  accuracy?: number | null;
};

export type PositionWatcher = {
  remove: () => void;
};

export type HeadingWatcher = {
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

export async function getCurrentHeading(): Promise<UserHeading | null> {
  const heading = await Location.getHeadingAsync();
  const magHeadingDeg = Number.isFinite(heading.magHeading) ? heading.magHeading : null;
  const trueHeadingDeg = Number.isFinite(heading.trueHeading) && heading.trueHeading >= 0 ? heading.trueHeading : null;
  const accuracy = Number.isFinite(heading.accuracy) ? heading.accuracy : null;

  if (magHeadingDeg === null && trueHeadingDeg === null) {
    return null;
  }

  return {
    magHeadingDeg,
    trueHeadingDeg,
    accuracy
  };
}

export async function startHeadingWatch(onHeading: (heading: UserHeading) => void): Promise<HeadingWatcher> {
  const sub = await Location.watchHeadingAsync((heading) => {
    const magHeadingDeg = Number.isFinite(heading.magHeading) ? heading.magHeading : null;
    const trueHeadingDeg = Number.isFinite(heading.trueHeading) && heading.trueHeading >= 0 ? heading.trueHeading : null;
    const accuracy = Number.isFinite(heading.accuracy) ? heading.accuracy : null;

    if (magHeadingDeg === null && trueHeadingDeg === null) {
      return;
    }

    onHeading({
      magHeadingDeg,
      trueHeadingDeg,
      accuracy
    });
  });

  return {
    remove: () => sub.remove()
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
