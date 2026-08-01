import type React from "react";
import type { ThemeDefinition, ThemeOverrides } from "@/lib/themes/theme-types";
import { THEME_REGISTRY } from "@/lib/themes/theme-registry";
import { normalizeThemeOverrides, resolveTheme, themeToStyle } from "@/lib/themes/theme-engine";

export type ThemeStudioOverrides = ThemeOverrides;
export type ThemeStudioDefinition = ThemeDefinition & { headingFont: string; bodyFont: string };

export const THEME_STUDIO_THEMES: ThemeStudioDefinition[] = THEME_REGISTRY.map((theme) => ({
  ...theme,
  headingFont: theme.typography.heading,
  bodyFont: theme.typography.body,
}));

export function resolveThemeStudio(value: unknown): ThemeStudioDefinition {
  const theme = resolveTheme(value);
  return { ...theme, headingFont: theme.typography.heading, bodyFont: theme.typography.body };
}

export const normalizeThemeStudioOverrides = normalizeThemeOverrides;

export function applyThemeStudioOverrides(theme: ThemeStudioDefinition, value: unknown): ThemeStudioDefinition {
  const resolved = resolveTheme(theme.id, value);
  return { ...resolved, headingFont: resolved.typography.heading, bodyFont: resolved.typography.body };
}

export function themeStudioStyle(theme: ThemeStudioDefinition): React.CSSProperties {
  return themeToStyle(theme) as React.CSSProperties;
}
