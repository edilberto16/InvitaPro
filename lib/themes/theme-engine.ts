import type { ThemeDefinition, ThemeOverrides, ThemeStyle } from "@/lib/themes/theme-types";
import { getThemeById } from "@/lib/themes/theme-registry";

const HEX = /^#[0-9a-f]{6}$/i;

export function normalizeThemeOverrides(value: unknown): ThemeOverrides {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  const output: ThemeOverrides = {};
  for (const key of ["primary", "secondary", "background", "surface", "text", "muted"] as const) {
    const current = input[key];
    if (typeof current === "string" && HEX.test(current)) output[key] = current;
  }
  if (typeof input.headingFont === "string" && input.headingFont.trim()) output.headingFont = input.headingFont;
  if (typeof input.bodyFont === "string" && input.bodyFont.trim()) output.bodyFont = input.bodyFont;
  return output;
}

export function resolveTheme(id: unknown, overrides?: unknown): ThemeDefinition {
  const base = getThemeById(typeof id === "string" ? id : undefined);
  const custom = normalizeThemeOverrides(overrides);
  return {
    ...base,
    palette: {
      ...base.palette,
      primary: custom.primary || base.palette.primary,
      secondary: custom.secondary || base.palette.secondary,
      background: custom.background || base.palette.background,
      surface: custom.surface || base.palette.surface,
      text: custom.text || base.palette.text,
      muted: custom.muted || base.palette.muted,
    },
    typography: {
      heading: custom.headingFont || base.typography.heading,
      body: custom.bodyFont || base.typography.body,
    },
  };
}

export function themeToStyle(theme: ThemeDefinition): ThemeStyle {
  return {
    "--invite-color": theme.palette.primary,
    "--template-primary": theme.palette.primary,
    "--template-secondary": theme.palette.secondary,
    "--template-background": theme.palette.background,
    "--template-surface": theme.palette.surface,
    "--template-text": theme.palette.text,
    "--template-muted": theme.palette.muted,
    "--template-radius": theme.radius === "rounded" ? "32px" : theme.radius === "square" ? "4px" : "18px",
    "--theme-heading-font": theme.typography.heading,
    "--theme-body-font": theme.typography.body,
    "--theme-section-spacing": theme.spacing.section,
    "--theme-card-padding": theme.spacing.card,
    "--theme-shadow": theme.shadow,
  };
}

export function defaultThemeIdForTemplate(templateId: string | null | undefined): string {
  if (!templateId) return "elegant-classic";
  if (templateId.includes("campamento") || templateId.includes("senderos") || templateId.includes("aviva")) return "campamento-bosque";
  if (templateId.includes("fogata")) return "campamento-fogata";
  if (templateId.includes("luxury") || templateId.includes("midnight")) return "luxury-black";
  if (templateId.includes("golden")) return "golden-night";
  if (templateId.includes("princess") || templateId.includes("rose")) return "princess-rose";
  if (templateId.includes("dinosaur")) return "dinosaurios";
  if (templateId.includes("espacial")) return "espacial";
  if (templateId.includes("corpor")) return "corporate-blue";
  if (templateId.includes("garden") || templateId.includes("floral")) return "romantic-garden";
  if (templateId.includes("editorial") || templateId.includes("minimal")) return "editorial-ivory";
  return "elegant-classic";
}
