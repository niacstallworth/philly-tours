import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { radius } from "../../theme/tokens";
import { ThemeSurface, useButtonTheme, useThemeColors, useTypeScale } from "../../theme/appTheme";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

type ChipProps = {
  label: string;
  tone?: "default" | "success" | "warn" | "danger";
};

export function Chip({ label, tone = "default" }: ChipProps) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const toneStyle =
    tone === "success"
      ? { backgroundColor: colors.successSoft, color: colors.success }
      : tone === "warn"
        ? { backgroundColor: colors.warnSoft, color: colors.warn }
        : tone === "danger"
          ? { backgroundColor: colors.dangerSoft, color: colors.danger }
          : { backgroundColor: colors.surfaceSoft, color: colors.textSoft };

  return <Text style={[styles.chip, toneStyle, { fontSize: type.font(11) }]}>{label}</Text>;
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  surface?: ThemeSurface;
};

export function PrimaryButton({ label, onPress, disabled, surface }: PrimaryButtonProps) {
  const buttonTheme = useButtonTheme(surface);
  const type = useTypeScale();
  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: buttonTheme.background,
          shadowColor: buttonTheme.shadow
        },
        disabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: buttonTheme.foreground, fontSize: type.font(15) }]}>{label}</Text>
    </Pressable>
  );
}

type SectionTitleProps = {
  children: React.ReactNode;
};

export function SectionTitle({ children }: SectionTitleProps) {
  const colors = useThemeColors();
  const type = useTypeScale();
  return <Text style={[styles.sectionTitle, { color: colors.text, fontSize: type.font(18) }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    gap: 12,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 4
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: "700",
    letterSpacing: 0.3,
    overflow: "hidden"
  },
  button: {
    borderRadius: 18,
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    fontWeight: "800",
    letterSpacing: 0.3
  },
  sectionTitle: {
    fontWeight: "800",
  }
});
