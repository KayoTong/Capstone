import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "default" | "day" | "night" | "forest" | "ocean";

const themeKey = "beforeigo_themeMode";

export type { ThemeMode };

export type ThemePalette = {
  background: string;
  surface: string;
  text: string;
  subText: string;
  border: string;
  accent: string;
  card: string;
};

const getTheme = (mode: ThemeMode): ThemePalette => {
  switch (mode) {
    case "default":
      return {
        background: "#6B7A74",
        surface: "#12231A",
        text: "#FFFFFF",
        subText: "#95A5A6",
        border: "#2C3A36",
        accent: "#2ECC71",
        card: "#08100C",
      };
    case "day":
      return {
        background: "#FFFFFF",
        surface: "#FFFFFF",
        text: "#12231A",
        subText: "#5D7B66",
        border: "#D8E8D9",
        accent: "#2ECC71",
        card: "#FAFCFB",
      };
    case "night":
      return {
        background: "#10161A",
        surface: "#0B1115",
        text: "#F6F9FB",
        subText: "#8FA9AF",
        border: "#1B2630",
        accent: "#2ECC71",
        card: "#081014",
      };
    case "forest":
      return {
        background: "#C8E6C9",
        surface: "#D4EDDA",
        text: "#153F2B",
        subText: "#4F7B5B",
        border: "#A3CFBB",
        accent: "#2ECC71",
        card: "#DCEEDC",
      };
    case "ocean":
      return {
        background: "#AED6F1",
        surface: "#D6EAF8",
        text: "#103650",
        subText: "#5A7D99",
        border: "#A9CCE3",
        accent: "#33A6E8",
        card: "#D6EAF8",
      };
  }
};

type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  theme: ThemePalette;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("default");

  useEffect(() => {
    AsyncStorage.getItem(themeKey).then((stored) => {
      if (
        stored === "default" ||
        stored === "day" ||
        stored === "night" ||
        stored === "forest" ||
        stored === "ocean"
      ) {
        setThemeModeState(stored);
      }
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(themeKey, mode).catch((error) => {
      console.warn("Failed to save theme mode", error);
    });
  };

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
