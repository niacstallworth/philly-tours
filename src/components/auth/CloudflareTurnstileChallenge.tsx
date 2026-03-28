import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { AppPalette, useThemeColors, useTypeScale } from "../../theme/appTheme";

type Props = {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
};

function buildTurnstileHtml(siteKey: string) {
  const escapedSiteKey = JSON.stringify(siteKey);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body {
        min-height: 74px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #turnstile {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    </style>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
  </head>
  <body>
    <div id="turnstile"></div>
    <script>
      function send(payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }

      function mount() {
        if (!window.turnstile) {
          window.setTimeout(mount, 80);
          return;
        }

        window.turnstile.render("#turnstile", {
          sitekey: ${escapedSiteKey},
          theme: "light",
          callback: function(token) {
            send({ type: "token", token: token });
          },
          "expired-callback": function() {
            send({ type: "expired" });
          },
          "timeout-callback": function() {
            send({ type: "expired" });
          },
          "error-callback": function() {
            send({ type: "error" });
          }
        });
      }

      mount();
    </script>
  </body>
</html>`;
}

export function CloudflareTurnstileChallenge({ siteKey, onTokenChange }: Props) {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = useMemo(() => createStyles(colors, type), [colors, type]);
  const webViewRef = useRef<WebView | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          source={{ html: buildTurnstileHtml(siteKey) }}
          style={styles.webview}
          originWhitelist={["*"]}
          javaScriptEnabled
          onLoadEnd={() => setReady(true)}
          onMessage={(event) => {
            try {
              const payload = JSON.parse(event.nativeEvent.data || "{}");
              if (payload.type === "token" && payload.token) {
                setError(null);
                onTokenChange(String(payload.token));
              } else if (payload.type === "expired") {
                onTokenChange(null);
              } else if (payload.type === "error") {
                setError("Cloudflare verification could not load. Please try again.");
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
      minHeight: 86,
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
      height: 86,
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
