import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useColorScheme } from "react-native";

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
const LOGIN_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#5b38f5",
  foreground: "#fff8f3",
  shadow: "#5b38f5"
};

const HOME_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#5b38f5",
  foreground: "#fff8f3",
  shadow: "#5b38f5"
};

const MAP_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#6a49ff",
  foreground: "#fff8f3",
  shadow: "#6a49ff"
};

const HUNT_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#23134a",
  foreground: "#fff8f3",
  shadow: "#23134a"
};

const PROFILE_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#5b38f5",
  foreground: "#fff8f3",
  shadow: "#5b38f5"
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
  background: "#f4f7fb",
  backgroundElevated: "#ffffff",
  surface: "#ffffff",
  surfaceSoft: "#eef4fb",
  surfaceRaised: "#f8fbff",
  border: "rgba(15, 23, 42, 0.08)",
  borderStrong: "rgba(15, 23, 42, 0.14)",
  text: "#0f172a",
  textSoft: "#334155",
  textMuted: "#64748b",
  inputBackground: "#f8fbff",
  inputBorder: "rgba(15, 23, 42, 0.12)",
  headerBackground: "#f8fbff",
  headerBorder: "rgba(15, 23, 42, 0.08)",
  navBackground: "rgba(255,255,255,0.96)",
  navBorder: "rgba(15, 23, 42, 0.1)",
  navText: "#64748b",
  navTextActive: "#0f172a",
  shadow: "#0f172a",
  success: "#15803d",
  successSoft: "rgba(21,128,61,0.1)",
  warn: "#b45309",
  warnSoft: "rgba(180,83,9,0.1)",
  danger: "#dc2626",
  dangerSoft: "rgba(220,38,38,0.1)",
  info: "#0284c7",
  infoSoft: "rgba(2,132,199,0.1)"
};

const darkPalette: AppPalette = {
  background: "#060312",
  backgroundElevated: "#130a25",
  surface: "#120a22",
  surfaceSoft: "#1b102d",
  surfaceRaised: "#24112c",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#fff3ea",
  textSoft: "#e6d8e8",
  textMuted: "#b69fbe",
  inputBackground: "#1b102d",
  inputBorder: "rgba(255,255,255,0.08)",
  headerBackground: "#020617",
  headerBorder: "#1f2937",
  navBackground: "rgba(18, 12, 33, 0.94)",
  navBorder: "rgba(226, 184, 135, 0.16)",
  navText: "#bdaecf",
  navTextActive: "#fff6ee",
  shadow: "#000000",
  success: "#8fd7c3",
  successSoft: "rgba(143,215,195,0.18)",
  warn: "#ffbc8a",
  warnSoft: "rgba(255,188,138,0.18)",
  danger: "#ff8ca8",
  dangerSoft: "rgba(255,140,168,0.18)",
  info: "#7dc9ff",
  infoSoft: "rgba(125,201,255,0.18)"
};

export const themePresets: ThemePreset[] = [
  {
    id: "rose",
    label: "Rose Studio",
    description: "Soft gallery pink for the current presentation look.",
    accent: {
      background: "#ff8ca8",
      foreground: "#2b1021",
      shadow: "#ff8ca8"
    }
  },
  {
    id: "gold",
    label: "Old Gold",
    description: "Warmer civic gold for a classic museum tone.",
    accent: {
      background: "#ffbc8a",
      foreground: "#2b1506",
      shadow: "#ffbc8a"
    }
  },
  {
    id: "ocean",
    label: "River Blue",
    description: "Cool blue for a cleaner, more technical feel.",
    accent: {
      background: "#7dc9ff",
      foreground: "#071c2b",
      shadow: "#7dc9ff"
    }
  },
  {
    id: "jade",
    label: "Emerald Glow",
    description: "Fresh green with a quieter builder-lab mood.",
    accent: {
      background: "#8fd7c3",
      foreground: "#0d211b",
      shadow: "#8fd7c3"
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
