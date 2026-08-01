"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { DEFAULT_TEMPLATE_SECTION_ORDER, type TemplateSectionId } from "@/lib/template-engine";
import type { StudioState } from "@/lib/studio/studio-types";

const DEFAULT_VISIBILITY: Record<string, boolean> = {
  portada: true,
  fecha: true,
  ubicacion: true,
  galeria: true,
  musica: true,
  programa: true,
  vestimenta: true,
  historia: true,
  hospedaje: true,
  regalos: true,
  video: true,
  faq: true,
  personas: true,
  hashtag: true,
  deseos: true,
  album: true,
  rsvp: true,
};

const DEFAULT_BLOCK_VISIBILITY: Record<TemplateSectionId, boolean> = {
  hero: true,
  intro: true,
  countdown: true,
  details: true,
  program: true,
  gallery: true,
  history: false,
  lodging: false,
  gifts: false,
  video: false,
  faq: false,
  special_people: false,
  hashtag: false,
  wishes: false,
  album: false,
  location: true,
  rsvp: true,
};

export function createInitialStudioState(): StudioState {
  return {
    title: "",
    message: "",
    subtitle: "",
    color: "#72264f",
    music: "",
    whatsapp: "",
    program: "",
    dress: "Formal",
    historyTitle: "Nuestra historia",
    historyText: "",
    lodging: "",
    gift: "",
    videoUrl: "",
    faqText: "",
    specialPeople: "",
    hashtag: "",
    socialText: "Comparte tus mejores momentos con nosotros",
    wishesTitle: "Déjanos un mensaje",
    wishesText: "Tus palabras también serán parte de este día.",
    albumTitle: "Comparte tus recuerdos",
    albumText: "Sube las fotografías que captures durante nuestra celebración.",
    rsvpText: "Confirma tu asistencia",
    cover: "",
    gallery: [],
    date: "",
    time: "",
    venue: "",
    address: "",
    mapsUrl: "",
    visibility: { ...DEFAULT_VISIBILITY },
    sectionOrder: [...DEFAULT_TEMPLATE_SECTION_ORDER],
    blockVisibility: { ...DEFAULT_BLOCK_VISIBILITY },
    blockVariants: {},
    sectionSettings: {},
    themeId: "elegant-classic",
    themeOverrides: {},
  };
}

type StudioSetters = {
  [K in keyof StudioState as `set${Capitalize<string & K>}`]: Dispatch<SetStateAction<StudioState[K]>>;
};

export function useStudioState() {
  const [state, setState] = useState<StudioState>(createInitialStudioState);

  const setters = useMemo(() => {
    const setField = <K extends keyof StudioState>(key: K): Dispatch<SetStateAction<StudioState[K]>> =>
      (value: SetStateAction<StudioState[K]>) => {
        setState((current: StudioState) => ({
          ...current,
          [key]: typeof value === "function"
            ? (value as (previous: StudioState[K]) => StudioState[K])(current[key])
            : value,
        }));
      };

    return {
      setTitle: setField("title"),
      setMessage: setField("message"),
      setSubtitle: setField("subtitle"),
      setColor: setField("color"),
      setMusic: setField("music"),
      setWhatsapp: setField("whatsapp"),
      setProgram: setField("program"),
      setDress: setField("dress"),
      setHistoryTitle: setField("historyTitle"),
      setHistoryText: setField("historyText"),
      setLodging: setField("lodging"),
      setGift: setField("gift"),
      setVideoUrl: setField("videoUrl"),
      setFaqText: setField("faqText"),
      setSpecialPeople: setField("specialPeople"),
      setHashtag: setField("hashtag"),
      setSocialText: setField("socialText"),
      setWishesTitle: setField("wishesTitle"),
      setWishesText: setField("wishesText"),
      setAlbumTitle: setField("albumTitle"),
      setAlbumText: setField("albumText"),
      setRsvpText: setField("rsvpText"),
      setCover: setField("cover"),
      setGallery: setField("gallery"),
      setDate: setField("date"),
      setTime: setField("time"),
      setVenue: setField("venue"),
      setAddress: setField("address"),
      setMapsUrl: setField("mapsUrl"),
      setVisibility: setField("visibility"),
      setSectionOrder: setField("sectionOrder"),
      setBlockVisibility: setField("blockVisibility"),
      setBlockVariants: setField("blockVariants"),
      setSectionSettings: setField("sectionSettings"),
      setThemeId: setField("themeId"),
      setThemeOverrides: setField("themeOverrides"),
    } satisfies StudioSetters;
  }, []);

  return { state, setState, ...setters };
}
