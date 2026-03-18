import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card, Chip, PrimaryButton } from "../components/ui/Primitives";
import { validateBuilderCredentials } from "../services/builderAccess";

export type AppMode = "tourist" | "builder";

export type OnboardingPayload = {
  displayName: string;
  email: string;
  mode: AppMode;
};

type Props = {
  onComplete: (payload: OnboardingPayload) => void;
};

export function OnboardingScreen({ onComplete }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<AppMode>("tourist");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const canContinue = useMemo(() => {
    const hasName = displayName.trim().length >= 2;
    const hasEmail = email.trim().includes("@") && email.trim().includes(".");
    const hasPassword = password.trim().length >= 1;
    return hasName && hasEmail && (mode === "tourist" || hasPassword);
  }, [displayName, email, mode, password]);

  function submit() {
    if (!canContinue) {
      return;
    }
    if (mode === "builder") {
      const result = validateBuilderCredentials(email, password);
      if (!result.ok) {
        setAuthError(result.error);
        return;
      }
    }
    setAuthError(null);
    onComplete({
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      mode
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <Text style={styles.kicker}>Welcome</Text>
        <Text style={styles.title}>Set up your Founders Threads profile.</Text>
        <Text style={styles.subtitle}>Keep this lightweight. Choose a name, add your email, and enter the touring experience.</Text>
        <View style={styles.heroChips}>
          <Chip label="Elegant city tours" tone="default" />
          <Chip label="Selective AR moments" tone="success" />
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.label}>Display name</Text>
        <TextInput
          value={displayName}
          onChangeText={(next) => {
            setDisplayName(next);
            if (authError) {
              setAuthError(null);
            }
          }}
          placeholder="Founder Name"
          placeholderTextColor="#8e7d99"
          style={styles.input}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={(next) => {
            setEmail(next);
            if (authError) {
              setAuthError(null);
            }
          }}
          placeholder="you@example.com"
          placeholderTextColor="#8e7d99"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mode</Text>
        <View style={styles.modeRow}>
          <ModeOption
            active={mode === "tourist"}
            title="Tour"
            detail="For public-facing touring and playback."
            onPress={() => {
              setMode("tourist");
              setAuthError(null);
            }}
          />
          <ModeOption
            active={mode === "builder"}
            title="Builder"
            detail="For content setup and internal review."
            onPress={() => {
              setMode("builder");
              setAuthError(null);
            }}
          />
        </View>

        {mode === "builder" ? (
          <>
            <Text style={styles.label}>Builder password</Text>
            <TextInput
              value={password}
              onChangeText={(next) => {
                setPassword(next);
                if (authError) {
                  setAuthError(null);
                }
              }}
              placeholder="Admin password"
              placeholderTextColor="#8e7d99"
              style={styles.input}
              autoCapitalize="none"
              secureTextEntry
            />
            <Text style={styles.modeHint}>Builder mode is limited to admin emails listed in the local builder access CSV.</Text>
          </>
        ) : null}

        {authError ? <Text style={styles.error}>{authError}</Text> : null}
      </Card>

      <Card style={styles.noteCard}>
        <Text style={styles.noteTitle}>What happens next</Text>
        <Text style={styles.noteCopy}>
          You’ll land in the main app shell with Home, Map, AR, Drive, and Profile ready. This profile stays local to the device for now.
        </Text>
      </Card>

      <PrimaryButton label="Enter App" onPress={submit} disabled={!canContinue} />
    </ScrollView>
  );
}

type ModeOptionProps = {
  active: boolean;
  title: string;
  detail: string;
  onPress: () => void;
};

function ModeOption({ active, title, detail, onPress }: ModeOptionProps) {
  return (
    <Pressable onPress={onPress} style={[styles.modeButton, active && styles.modeButtonActive]}>
      <Text style={[styles.modeTitle, active && styles.modeTitleActive]}>{title}</Text>
      <Text style={[styles.modeDetail, active && styles.modeDetailActive]}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#060312",
    padding: 18,
    justifyContent: "center",
    gap: 18
  },
  heroPanel: {
    backgroundColor: "#130a25",
    borderRadius: 30,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 191, 173, 0.16)"
  },
  kicker: {
    color: "#ff9ab2",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  title: {
    color: "#fff3ea",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800"
  },
  subtitle: {
    color: "#d8c7df",
    lineHeight: 22
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  card: {
    backgroundColor: "#120a22",
    gap: 10
  },
  label: {
    color: "#fff0e4",
    fontWeight: "700"
  },
  input: {
    backgroundColor: "#1b102d",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 16,
    color: "#fff3ea",
    paddingHorizontal: 12,
    paddingVertical: 13
  },
  modeRow: {
    gap: 10
  },
  modeButton: {
    borderRadius: 18,
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#1b102d",
    gap: 6
  },
  modeButtonActive: {
    backgroundColor: "#2a1330",
    borderColor: "rgba(255, 140, 168, 0.5)"
  },
  modeTitle: {
    color: "#f4e6f0",
    fontWeight: "700"
  },
  modeTitleActive: {
    color: "#fff7f1"
  },
  modeDetail: {
    color: "#bdaec7",
    lineHeight: 20
  },
  modeDetailActive: {
    color: "#ead7e2"
  },
  noteCard: {
    backgroundColor: "#1a102e",
    gap: 6
  },
  noteTitle: {
    color: "#fff7f1",
    fontWeight: "800"
  },
  noteCopy: {
    color: "#d0bed7",
    lineHeight: 21
  },
  modeHint: {
    color: "#d9cce2",
    lineHeight: 20
  },
  error: {
    color: "#ffb2c8",
    lineHeight: 20,
    fontWeight: "700"
  }
});
