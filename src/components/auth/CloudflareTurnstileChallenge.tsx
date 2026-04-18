import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { AppPalette, useThemeColors, useTypeScale } from "../../theme/appTheme";

type Props = {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
};

function getChallengeBaseUrl() {
  const appBase = (process.env.EXPO_PUBLIC_SYNC_SERVER_URL || "http://localhost:4000").trim();
  return appBase.replace(/\/+$/, "");
}

function buildChallengeUrl(siteKey: string) {
  const url = new URL(`${getChallengeBaseUrl()}/api/turnstile/challenge`);
  url.searchParams.set("siteKey", siteKey);
  return url.toString();
}

export function CloudflareTurnstileChallenge({ siteKey, onTokenChange }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = useMemo(() => createStyles(colors, type), [colors, type]);
  const webViewRef = useRef<WebView | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const challengeUrl = useMemo(() => buildChallengeUrl(siteKey), [siteKey]);
  const challengeHeight = Platform.OS === "web" ? 86 : 220;

  useEffect(() => {
    onTokenChange(null);
  }, [siteKey, onTokenChange]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Cloudflare security check</Text>
      <View style={styles.frame}>
        {!ready ? (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color={colors.info} />
            <Text style={styles.hint}>Preparing secure sign-in challenge…</Text>
          </View>
        ) : null}
        <WebView
          ref={(instance) => {
            webViewRef.current = instance;
          }}
          source={{ uri: challengeUrl }}
          style={[styles.webview, { height: challengeHeight }]}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          setSupportMultipleWindows={false}
          onLoadEnd={() => setReady(true)}
          onError={() => {
            setError("Cloudflare verification page could not load. Please try again.");
            onTokenChange(null);
          }}
          onHttpError={() => {
            setError("Cloudflare verification page returned an error. Please try again.");
            onTokenChange(null);
          }}
          onMessage={(event) => {
            try {
              const payload = JSON.parse(event.nativeEvent.data || "{}");
              if (payload.type === "token" && payload.token) {
                setError(null);
                onTokenChange(String(payload.token));
              } else if (payload.type === "expired") {
                onTokenChange(null);
              } else if (payload.type === "error") {
                const code = payload.code ? ` (${String(payload.code)})` : "";
                setError(`Cloudflare verification could not load${code}. Please try again.`);
                onTokenChange(null);
              }
            } catch {
              setError("Cloudflare verification returned an unreadable response.");
              onTokenChange(null);
            }
          }}
        />
      </View>
      <Text style={styles.hint}>Complete this Cloudflare challenge before entering the app.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    wrap: {
      gap: 10
    },
    label: {
      color: colors.text,
      fontSize: type.font(15),
      fontWeight: "700"
    },
    frame: {
      minHeight: 220,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.inputBackground
    },
    loading: {
      position: "absolute",
      inset: 0,
      zIndex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 8
    },
    webview: {
      backgroundColor: "transparent"
    },
    hint: {
      color: colors.textSoft,
      lineHeight: type.line(20),
      fontSize: type.font(13)
    },
    error: {
      color: colors.danger,
      lineHeight: type.line(20),
      fontSize: type.font(13)
    }
  });
}
