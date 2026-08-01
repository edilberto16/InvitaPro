import type { TemplateSectionId } from "@/lib/template-engine";
import type { StudioBlockVariantMap } from "@/lib/studio/block-registry";
import type { ThemeOverrides } from "@/lib/themes/theme-types";

export type StudioSectionSettings = {
  alignment?: "left" | "center" | "right";
  animation?: "inherit" | "none" | "fade" | "slide-up" | "zoom";
  spacing?: "compact" | "normal" | "airy";
  surface?: "inherit" | "transparent" | "soft" | "card";
};

export type StudioSectionSettingsMap = Partial<Record<TemplateSectionId, StudioSectionSettings>>;

export type StudioState = {
  title: string;
  message: string;
  subtitle: string;
  color: string;
  music: string;
  whatsapp: string;
  program: string;
  dress: string;
  historyTitle: string;
  historyText: string;
  lodging: string;
  gift: string;
  videoUrl: string;
  faqText: string;
  specialPeople: string;
  hashtag: string;
  socialText: string;
  wishesTitle: string;
  wishesText: string;
  albumTitle: string;
  albumText: string;
  rsvpText: string;
  cover: string;
  gallery: string[];
  date: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  visibility: Record<string, boolean>;
  sectionOrder: TemplateSectionId[];
  blockVisibility: Record<TemplateSectionId, boolean>;
  blockVariants: StudioBlockVariantMap;
  sectionSettings: StudioSectionSettingsMap;
  themeId: string;
  themeOverrides: ThemeOverrides;
};

export type StudioSnapshot = StudioState;
