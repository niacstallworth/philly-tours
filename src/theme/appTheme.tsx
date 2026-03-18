import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

export type ThemeSurface = "default" | "login" | "home" | "map" | "ar" | "drive" | "profile" | "builder";
export type ThemePresetId = "rose" | "gold" | "ocean" | "jade";

export type ButtonSurfaceTheme = {
  background: string;
  foreground: string;
  shadow: string;
};

export type AppThemeSettings = {
  presetId: ThemePresetId;
  buttonThemes: Record<ThemeSurface, ButtonSurfaceTheme>;
};

type ThemePreset = {
  id: ThemePresetId;
  label: string;
  description: string;
  accent: ButtonSurfaceTheme;
};

type AppThemeContextValue = {
  settings: AppThemeSettings;
  activePreset: ThemePreset;
  presets: ThemePreset[];
  setPreset: (presetId: ThemePresetId) => Promise<void>;
  setSurfaceButtonTheme: (surface: ThemeSurface, theme: ButtonSurfaceTheme) => Promise<void>;
};

const APP_THEME_STORAGE_KEY = "app.theme.settings";
const DEFAULT_SURFACE: ThemeSurface = "default";
const LOGIN_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#007eff",
  foreground: "#f5fbff",
  shadow: "#007eff"
};

const HOME_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#007eff",
  foreground: "#f5fbff",
  shadow: "#007eff"
};

const MAP_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#a835f2",
  foreground: "#fdf7ff",
  shadow: "#a835f2"
};

const AR_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#89f336",
  foreground: "#102405",
  shadow: "#89f336"
};

const DRIVE_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#007eff",
  foreground: "#f5fbff",
  shadow: "#007eff"
};

const PROFILE_BUTTON_THEME: ButtonSurfaceTheme = {
  background: "#ffbf00",
  foreground: "#2a1d00",
  shadow: "#ffbf00"
};

const THEME_SURFACES: ThemeSurface[] = ["default", "login", "home", "map", "ar", "drive", "profile", "builder"];

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
  ar: "AR",
  drive: "Drive",
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

function buildThemeSettings(presetId: ThemePresetId): AppThemeSettings {
  const preset = getPresetById(presetId);
  return {
    presetId: preset.id,
    buttonThemes: {
      default: cloneButtonTheme(preset.accent),
      login: cloneButtonTheme(LOGIN_BUTTON_THEME),
      home: cloneButtonTheme(HOME_BUTTON_THEME),
      map: cloneButtonTheme(MAP_BUTTON_THEME),
      ar: cloneButtonTheme(AR_BUTTON_THEME),
      drive: cloneButtonTheme(DRIVE_BUTTON_THEME),
      profile: cloneButtonTheme(PROFILE_BUTTON_THEME),
      builder: cloneButtonTheme(preset.accent)
    }
  };
}

function isThemePresetId(value: unknown): value is ThemePresetId {
  return typeof value === "string" && themePresets.some((preset) => preset.id === value);
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
    return buildThemeSettings("rose");
  }

  const candidate = value as Partial<AppThemeSettings> & { buttonThemes?: Partial<Record<ThemeSurface, ButtonSurfaceTheme>> };
  const nextSettings = buildThemeSettings(isThemePresetId(candidate.presetId) ? candidate.presetId : "rose");

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
  const [settings, setSettings] = React.useState<AppThemeSettings>(() => buildThemeSettings("rose"));

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
    await persistThemeSettings(buildThemeSettings(presetId));
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

  return (
    <AppThemeContext.Provider
      value={{
        settings,
        activePreset,
        presets: themePresets,
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

export function useButtonTheme(surfaceOverride?: ThemeSurface) {
  const { settings } = useAppTheme();
  const contextSurface = React.useContext(ThemeSurfaceContext);
  const surface = surfaceOverride ?? contextSurface;
  return settings.buttonThemes[surface] ?? settings.buttonThemes.default;
}
