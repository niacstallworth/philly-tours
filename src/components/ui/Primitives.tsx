import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radius } from "../../theme/tokens";
import { ThemeSurface, useButtonTheme } from "../../theme/appTheme";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ChipProps = {
  label: string;
  tone?: "default" | "success" | "warn" | "danger";
};

export function Chip({ label, tone = "default" }: ChipProps) {
  return <Text style={[styles.chip, tone === "success" && styles.success, tone === "warn" && styles.warn, tone === "danger" && styles.danger]}>{label}</Text>;
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  surface?: ThemeSurface;
};

export function PrimaryButton({ label, onPress, disabled, surface }: PrimaryButtonProps) {
  const buttonTheme = useButtonTheme(surface);
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
      <Text style={[styles.buttonText, { color: buttonTheme.foreground }]}>{label}</Text>
    </Pressable>
  );
}

type SectionTitleProps = {
  children: React.ReactNode;
};

export function SectionTitle({ children }: SectionTitleProps) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 18,
    gap: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  chip: {
    backgroundColor: colors.panelSoft,
    color: colors.textSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
    overflow: "hidden"
  },
  success: {
    backgroundColor: "rgba(143,215,195,0.18)",
    color: "#b9f0df"
  },
  warn: {
    backgroundColor: "rgba(255,188,138,0.18)",
    color: "#ffd8b8"
  },
  danger: {
    backgroundColor: "rgba(255,140,168,0.18)",
    color: "#ffc2d0"
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
    color: colors.text,
    fontWeight: "800",
    fontSize: 18
  }
});
