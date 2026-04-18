import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Tour } from "../../types";
import { AppPalette, useThemeColors, useTypeScale } from "../../theme/appTheme";

type Props = {
  tour: Tour;
  selectedStopId?: string | null;
  travelMode?: "DRIVE" | "WALK";
  onSelectStop?: (stopId: string) => void;
};

export function RoutePreviewMap({ tour }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);

  return (
    <View style={styles.shell}>
      <Text style={styles.eyebrow}>Founders Compass</Text>
      <Text style={styles.title}>North Broad as the north star</Text>
      <Text style={styles.copy}>
        Native maps are available in the iOS app. This story opens from the city&apos;s compass point through {tour.stops.length} stops across {tour.distanceMiles} miles.
      </Text>
    </View>
  );
}

function createStyles(
  colors: AppPalette,
  type: {
    font: (size: number) => number;
    line: (height: number) => number;
  }
) {
  return StyleSheet.create({
    shell: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 8,
      backgroundColor: colors.surfaceRaised
    },
    eyebrow: {
      color: colors.warn,
      fontSize: type.font(11),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1
    },
    title: {
      color: colors.text,
      fontSize: type.font(20),
      fontWeight: "800"
    },
    copy: {
      color: colors.textSoft,
      fontSize: type.font(13),
      lineHeight: type.line(19)
    }
  });
}
