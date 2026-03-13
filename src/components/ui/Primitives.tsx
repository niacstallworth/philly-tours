import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radius } from "../../theme/tokens";

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
};

export function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <Pressable style={[styles.button, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.buttonText}>{label}</Text>
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
    padding: 16,
    gap: 8
  },
  chip: {
    backgroundColor: colors.panelSoft,
    color: colors.textSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "700",
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
    backgroundColor: "#ff8ca8",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: "#2b1021",
    fontWeight: "800"
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18
  }
});
