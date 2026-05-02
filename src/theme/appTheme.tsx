import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Platform, useColorScheme } from "react-native";

export type ThemeSurface = "default" | "login" | "home" | "map" | "hunt" | "profile" | "builder";
export type ThemePresetId = "rose" | "gold" | "ocean" | "jade";
export type AppAppearanceMode = "system" | "light" | "dark";
export type ResolvedAppearanceMode = "light" | "dark";
export type AppTextScale = "standard" | "large" | "xlarge";

export type ButtonSurfaceTheme = {
  background: string;
  foreground: string;
  shadow: string;
};

export type AppThemeSettings = {
  appearanceMode: AppAppearanceMode;
  textScale: AppTextScale;
  presetId: ThemePresetId;
  buttonThemes: Record<ThemeSurface, ButtonSurfaceTheme>;
};

export type AppPalette = {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceSoft: string;
  surfaceRaised: string;
  accent: string;
  accentDeep: string;
  accentSoft: string;
  olive: string;
  gold: string;
  border: string;
  borderStrong: string;
  text: string;
  textSoft: string;
  textMuted: string;
  inputBackground: string;
  inputBorder: string;
  headerBackground: string;
  headerBorder: string;
  navBackground: string;
  navBorder: string;
  navText: string;
  navTextActive: string;
  shadow: string;
  success: string;
  successSoft: string;
  warn: string;
  warnSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
};

type ThemePreset = {
  id: ThemePresetId;
  label: string;
  description: string;
  accent: ButtonSurfaceTheme;
};

type AppThemeContextValue = {
  settings: AppThemeSettings;
  appearanceMode: AppAppearanceMode;
  resolvedAppearanceMode: ResolvedAppearanceMode;
  textScale: AppTextScale;
  textScaleMultiplier: number;
  colors: AppPalette;
  activePreset: ThemePreset;
  presets: ThemePreset[];
  setAppearanceMode: (appearanceMode: AppAppearanceMode) => Promise<void>;
  setTextScale: (textScale: AppTextScale) => Promise<void>;
  setPreset: (presetId: ThemePresetId) => Promise<void>;
  setSurfaceButtonTheme: (surface: ThemeSurface, theme: ButtonSurfaceTheme) => Promise<void>;
};

const APP_THEME_STORAGE_KEY = "app.theme.settings";
const DEFAULT_APPEARANCE_MODE: AppAppearanceMode = "light";
const DEFAULT_SURFACE: ThemeSurface = "default";
export const headingFontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: undefined
});
const LOGIN_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#1f4e8c",
  foreground: "#fffaf5",
  shadow: "#143766"
};

const HOME_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#1f4e8c",
  foreground: "#fffaf5",
  shadow: "#143766"
};

const MAP_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#0b6e4f",
  foreground: "#fffaf5",
  shadow: "#24303a"
};

const HUNT_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#24303a",
  foreground: "#fffaf5",
  shadow: "#24303a"
};

const PROFILE_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#efc96c",
  foreground: "#2e2410",
  shadow: "#b59039"
};

const THEME_SURFACES: ThemeSurface[] = ["default", "login", "home", "map", "hunt", "profile", "builder"];
const APPEARANCE_MODES: AppAppearanceMode[] = ["system", "light", "dark"];
const TEXT_SCALES: AppTextScale[] = ["standard", "large", "xlarge"];
const TEXT_SCALE_MULTIPLIERS: Record<AppTextScale, number> = {
  standard: 1,
  large: 1.12,
  xlarge: 1.26
};

const lightPalette: AppPalette = {
  background: "#f5f7fb",
  backgroundElevated: "rgba(255,255,255,0.96)",
  surface: "rgba(255,255,255,0.9)",
  surfaceSoft: "#eef2f7",
  surfaceRaised: "rgba(255,255,255,0.96)",
  accent: "#1f4e8c",
  accentDeep: "#143766",
  accentSoft: "#dbe7fb",
  olive: "#0b6e4f",
  gold: "#efc96c",
  border: "rgba(36, 48, 58, 0.1)",
  borderStrong: "rgba(36, 48, 58, 0.16)",
  text: "#24303a",
  textSoft: "#43515f",
  textMuted: "#697583",
  inputBackground: "rgba(255,255,255,0.96)",
  inputBorder: "rgba(36, 48, 58, 0.12)",
  headerBackground: "rgba(255,255,255,0.88)",
  headerBorder: "rgba(36, 48, 58, 0.08)",
  navBackground: "rgba(255,255,255,0.94)",
  navBorder: "rgba(36, 48, 58, 0.08)",
  navText: "#697583",
  navTextActive: "#24303a",
  shadow: "#374351",
  success: "#0b6e4f",
  successSoft: "rgba(11,110,79,0.12)",
  warn: "#b59039",
  warnSoft: "rgba(239,201,108,0.22)",
  danger: "#c45a64",
  dangerSoft: "rgba(196,90,100,0.12)",
  info: "#1f4e8c",
  infoSoft: "rgba(31,78,140,0.14)"
};

const darkPalette: AppPalette = {
  background: "#101522",
  backgroundElevated: "rgba(24,35,58,0.92)",
  surface: "rgba(24,35,58,0.92)",
  surfaceSoft: "#18233a",
  surfaceRaised: "#22304c",
  accent: "#4f7fc1",
  accentDeep: "#1f4e8c",
  accentSoft: "rgba(31,78,140,0.24)",
  olive: "#4ca37d",
  gold: "#efc96c",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#f8f6f0",
  textSoft: "#d9deea",
  textMuted: "#a8b2c5",
  inputBackground: "#18233a",
  inputBorder: "rgba(255,255,255,0.1)",
  headerBackground: "rgba(16,21,34,0.96)",
  headerBorder: "rgba(255,255,255,0.08)",
  navBackground: "rgba(16,21,34,0.96)",
  navBorder: "rgba(255,255,255,0.08)",
  navText: "#a8b2c5",
  navTextActive: "#f8f6f0",
  shadow: "#000000",
  success: "#6fc2a0",
  successSoft: "rgba(11,110,79,0.24)",
  warn: "#efc96c",
  warnSoft: "rgba(239,201,108,0.16)",
  danger: "#f08a8a",
  dangerSoft: "rgba(240,138,138,0.16)",
  info: "#4f7fc1",
  infoSoft: "rgba(79,127,193,0.22)"
};

export const themePresets: ThemePreset[] = [
  {
    id: "rose",
    label: "Pennsylvania Blue",
    description: "Civic blue primary for the Philly Tours native app.",
    accent: {
      background: "#1f4e8c",
      foreground: "#fffaf5",
      shadow: "#143766"
    }
  },
  {
    id: "gold",
    label: "Charter Gold",
    description: "Gold CTA variant for civic highlights and map-side actions.",
    accent: {
      background: "#efc96c",
      foreground: "#2e2410",
      shadow: "#b59039"
    }
  },
  {
    id: "ocean",
    label: "Statehouse Blue",
    description: "Deeper Pennsylvania blue for route surfaces and navigation-heavy moments.",
    accent: {
      background: "#243552",
      foreground: "#fffaf5",
      shadow: "#18233a"
    }
  },
  {
    id: "jade",
    label: "Kelly Green",
    description: "Philadelphia Kelly Green accent for AR, route, and heritage cues.",
    accent: {
      background: "#0b6e4f",
      foreground: "#fffaf5",
      shadow: "#24303a"
    }
  }
];

export const THEME_SURFACE_LABELS: Record<Exclude<ThemeSurface, "default">, string> = {
  login: "Login",
  home: "Home",
  map: "Map",
  hunt: "Scavenger Hunt",
  profile: "Profile",
  builder: "Builder"
};

const AppThemeContext = React.createContext<AppThemeContextValue | null>(null);
const ThemeSurfaceContext = React.createContext<ThemeSurface>(DEFAULT_SURFACE);

function cloneButtonTheme(theme: ButtonSurfaceTheme): ButtonSurfaceTheme {
  return {
    background: theme.background,
    foreground: theme.foreground,
    shadow: theme.shadow
  };
}

function getPresetById(presetId: ThemePresetId) {
  return themePresets.find((preset) => preset.id === presetId) ?? themePresets[0];
}

function buildThemeSettings(
  presetId: ThemePresetId,
  appearanceMode: AppAppearanceMode = DEFAULT_APPEARANCE_MODE,
  textScale: AppTextScale = "standard"
): AppThemeSettings {
  const preset = getPresetById(presetId);
  return {
    appearanceMode,
    textScale,
    presetId: preset.id,
    buttonThemes: {
      default: cloneButtonTheme(preset.accent),
      login: cloneButtonTheme(LOGIN_BUTTON_THEME),
      home: cloneButtonTheme(HOME_BUTTON_THEME),
      map: cloneButtonTheme(MAP_BUTTON_THEME),
      hunt: cloneButtonTheme(HUNT_BUTTON_THEME),
      profile: cloneButtonTheme(PROFILE_BUTTON_THEME),
      builder: cloneButtonTheme(preset.accent)
    }
  };
}

function isThemePresetId(value: unknown): value is ThemePresetId {
  return typeof value === "string" && themePresets.some((preset) => preset.id === value);
}

function isAppearanceMode(value: unknown): value is AppAppearanceMode {
  return typeof value === "string" && APPEARANCE_MODES.includes(value as AppAppearanceMode);
}

function isTextScale(value: unknown): value is AppTextScale {
  return typeof value === "string" && TEXT_SCALES.includes(value as AppTextScale);
}

function isButtonSurfaceTheme(value: unknown): value is ButtonSurfaceTheme {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<ButtonSurfaceTheme>;
  return typeof candidate.background === "string" && typeof candidate.foreground === "string" && typeof candidate.shadow === "string";
}

function normalizeThemeSettings(value: unknown): AppThemeSettings {
  if (!value || typeof value !== "object") {
    return buildThemeSettings("rose", DEFAULT_APPEARANCE_MODE, "standard");
  }

  const candidate = value as Partial<AppThemeSettings> & { buttonThemes?: Partial<Record<ThemeSurface, ButtonSurfaceTheme>> };
  const nextSettings = buildThemeSettings(
    isThemePresetId(candidate.presetId) ? candidate.presetId : "rose",
    isAppearanceMode(candidate.appearanceMode) ? candidate.appearanceMode : DEFAULT_APPEARANCE_MODE,
    isTextScale(candidate.textScale) ? candidate.textScale : "standard"
  );

  if (!candidate.buttonThemes || typeof candidate.buttonThemes !== "object") {
    return nextSettings;
  }

  for (const surface of THEME_SURFACES) {
    const nextTheme = candidate.buttonThemes[surface];
    if (isButtonSurfaceTheme(nextTheme)) {
      nextSettings.buttonThemes[surface] = cloneButtonTheme(nextTheme);
    }
  }

  return nextSettings;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useColorScheme();
  const [settings, setSettings] = React.useState<AppThemeSettings>(() => buildThemeSettings("rose", DEFAULT_APPEARANCE_MODE, "standard"));

  React.useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(APP_THEME_STORAGE_KEY)
      .then((raw) => {
        if (!raw || !isMounted) {
          return;
        }
        setSettings(normalizeThemeSettings(JSON.parse(raw)));
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  async function persistThemeSettings(nextSettings: AppThemeSettings) {
    setSettings(nextSettings);
    try {
      await AsyncStorage.setItem(APP_THEME_STORAGE_KEY, JSON.stringify(nextSettings));
    } catch {
      // Keep the in-memory theme even if persistence fails.
    }
  }

  async function setPreset(presetId: ThemePresetId) {
    await persistThemeSettings(buildThemeSettings(presetId, settings.appearanceMode, settings.textScale));
  }

  async function setAppearanceMode(appearanceMode: AppAppearanceMode) {
    await persistThemeSettings({
      ...settings,
      appearanceMode
    });
  }

  async function setTextScale(textScale: AppTextScale) {
    await persistThemeSettings({
      ...settings,
      textScale
    });
  }

  async function setSurfaceButtonTheme(surface: ThemeSurface, theme: ButtonSurfaceTheme) {
    await persistThemeSettings({
      ...settings,
      buttonThemes: {
        ...settings.buttonThemes,
        [surface]: cloneButtonTheme(theme)
      }
    });
  }

  const activePreset = getPresetById(settings.presetId);
  const resolvedAppearanceMode: ResolvedAppearanceMode =
    settings.appearanceMode === "system" ? (deviceColorScheme === "light" ? "light" : "dark") : settings.appearanceMode;
  const colors = resolvedAppearanceMode === "light" ? lightPalette : darkPalette;
  const textScaleMultiplier = TEXT_SCALE_MULTIPLIERS[settings.textScale] ?? 1;

  return (
    <AppThemeContext.Provider
      value={{
        settings,
        appearanceMode: settings.appearanceMode,
        resolvedAppearanceMode,
        textScale: settings.textScale,
        textScaleMultiplier,
        colors,
        activePreset,
        presets: themePresets,
        setAppearanceMode,
        setTextScale,
        setPreset,
        setSurfaceButtonTheme
      }}
    >
      {children}
    </AppThemeContext.Provider>
  );
}

export function ThemeSurfaceProvider({ surface, children }: { surface: ThemeSurface; children: React.ReactNode }) {
  return <ThemeSurfaceContext.Provider value={surface}>{children}</ThemeSurfaceContext.Provider>;
}

export function useAppTheme() {
  const context = React.useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider.");
  }
  return context;
}

export function useThemeColors() {
  return useAppTheme().colors;
}

export function useTextScaleMultiplier() {
  return useAppTheme().textScaleMultiplier;
}

export function useTypeScale() {
  const multiplier = useTextScaleMultiplier();

  return React.useMemo(
    () => ({
      multiplier,
      font: (size: number) => Math.round(size * multiplier),
      line: (height: number) => Math.round(height * multiplier)
    }),
    [multiplier]
  );
}

export function useButtonTheme(surfaceOverride?: ThemeSurface) {
  const { settings } = useAppTheme();
  const contextSurface = React.useContext(ThemeSurfaceContext);
  const surface = surfaceOverride ?? contextSurface;
  return settings.buttonThemes[surface] ?? settings.buttonThemes.default;
}
