import type React from "react";

export type ThemeCollection = "Wedding" | "XV años" | "Infantil" | "Empresarial" | "Campamentos";
export type ThemeButtonStyle = "solid" | "outline" | "soft";
export type ThemeRadius = "soft" | "rounded" | "square";
export type ThemeMotion = "minimal" | "soft" | "dynamic" | "cinematic";

export type ThemeOverrides = Partial<{
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  headingFont: string;
  bodyFont: string;
}>;

export type ThemeDefinition = {
  id: string;
  name: string;
  collection: ThemeCollection;
  description: string;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  buttonStyle: ThemeButtonStyle;
  radius: ThemeRadius;
  motion: ThemeMotion;
  spacing: { section: string; card: string; };
  shadow: string;
};

export type ThemeStyle = React.CSSProperties & Record<`--${string}`, string | number>;
