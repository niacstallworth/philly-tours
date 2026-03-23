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
    borderRadius: radius.xl,
    padding: 18,
    gap: 10,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
    fontWeight: "700",
    letterSpacing: 0.2,
    overflow: "hidden"
  },
  button: {
    borderRadius: 16,
    minHeight: 50,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    fontWeight: "800",
    letterSpacing: 0.2
  },
  sectionTitle: {
    fontWeight: "800",
  }
});
