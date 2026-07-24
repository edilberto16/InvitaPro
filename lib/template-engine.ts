import type React from 'react';

export type TemplateSectionId =
  | 'hero'
  | 'intro'
  | 'countdown'
  | 'details'
  | 'program'
  | 'gallery'
  | 'history'
  | 'lodging'
  | 'gifts'
  | 'video'
  | 'faq'
  | 'location'
  | 'rsvp';

export type TemplateEngineDefinition = {
  id: string;
  family: 'wedding' | 'xv' | 'infantil' | 'empresarial';
  layout: 'classic' | 'editorial' | 'immersive' | 'playful' | 'business';
  typography: 'serif' | 'editorial' | 'rounded' | 'modern';
  decoration: 'ornamental' | 'botanical' | 'sparkle' | 'geometric' | 'cosmic' | 'none';
  hero: 'framed' | 'full-bleed' | 'split' | 'poster' | 'clean';
  motion: 'soft' | 'cinematic' | 'dynamic' | 'minimal';
  radius: 'soft' | 'rounded' | 'square';
  palette: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  sectionOrder: TemplateSectionId[];
};

export const DEFAULT_TEMPLATE_SECTION_ORDER: TemplateSectionId[] = [
  'hero',
  'intro',
  'countdown',
  'details',
  'program',
  'gallery',
  'history',
  'lodging',
  'gifts',
  'video',
  'faq',
  'location',
  'rsvp',
];

type TemplateEnginePreset = Omit<
  TemplateEngineDefinition,
  'id' | 'sectionOrder' | 'hero' | 'motion' | 'radius'
> & {
  sectionOrder?: TemplateSectionId[];
};

const definitions: Record<string, TemplateEnginePreset> = {
  'elegante-classic': { family:'wedding', layout:'classic', typography:'serif', decoration:'ornamental', palette:{primary:'#9a6845',secondary:'#d8c3aa',background:'#fbf7f1',surface:'#ffffff',text:'#33271f',muted:'#77685c'} },
  'luxury-black': { family:'wedding', layout:'immersive', typography:'serif', decoration:'sparkle', palette:{primary:'#c7a55b',secondary:'#6f5a2e',background:'#0d0d0d',surface:'#171717',text:'#f8f1df',muted:'#b9ad94'} },
  'royal-gold': { family:'wedding', layout:'classic', typography:'serif', decoration:'ornamental', palette:{primary:'#b6924b',secondary:'#234b42',background:'#f7f2e6',surface:'#fffdf7',text:'#26362f',muted:'#6f786f'} },
  'minimal-white': { family:'wedding', layout:'editorial', typography:'modern', decoration:'none', palette:{primary:'#6d625b',secondary:'#d7d2ce',background:'#ffffff',surface:'#f7f7f7',text:'#1f1f1f',muted:'#777777'} },
  'romantic-garden': { family:'wedding', layout:'immersive', typography:'serif', decoration:'botanical', palette:{primary:'#7f9a78',secondary:'#d6c8ad',background:'#f6f4ec',surface:'#fffdf8',text:'#344333',muted:'#758071'} },
  sunset: { family:'wedding', layout:'immersive', typography:'serif', decoration:'ornamental', palette:{primary:'#d37b57',secondary:'#f0b485',background:'#fff4eb',surface:'#ffffff',text:'#5b3328',muted:'#956e61'} },
  vintage: { family:'wedding', layout:'classic', typography:'serif', decoration:'ornamental', palette:{primary:'#8b745c',secondary:'#c3ae8d',background:'#eee5d6',surface:'#f8f1e6',text:'#40362c',muted:'#756a5e'} },
  'modern-editorial': { family:'wedding', layout:'editorial', typography:'editorial', decoration:'geometric', palette:{primary:'#222222',secondary:'#d8d8d8',background:'#f5f5f2',surface:'#ffffff',text:'#151515',muted:'#6c6c6c'} },
  'princess-rose': { family:'xv', layout:'classic', typography:'serif', decoration:'sparkle', palette:{primary:'#c78ca7',secondary:'#f0cddd',background:'#fff4f8',surface:'#ffffff',text:'#593848',muted:'#947181'} },
  'golden-night': { family:'xv', layout:'immersive', typography:'serif', decoration:'sparkle', palette:{primary:'#c2a14b',secondary:'#6b5522',background:'#111426',surface:'#1b1f35',text:'#fff5d1',muted:'#c8bc92'} },
  butterfly: { family:'xv', layout:'immersive', typography:'serif', decoration:'sparkle', palette:{primary:'#b584c4',secondary:'#e6c8ed',background:'#f9f2ff',surface:'#ffffff',text:'#51385c',muted:'#8e7198'} },
  lavender: { family:'xv', layout:'classic', typography:'serif', decoration:'botanical', palette:{primary:'#9178ad',secondary:'#d9cde7',background:'#f7f3fb',surface:'#ffffff',text:'#493d57',muted:'#82748e'} },
  glamour: { family:'xv', layout:'editorial', typography:'editorial', decoration:'sparkle', palette:{primary:'#a96884',secondary:'#e2b7c8',background:'#1b1217',surface:'#2a1a22',text:'#fff0f6',muted:'#c7a9b5'} },
  floral: { family:'xv', layout:'classic', typography:'serif', decoration:'botanical', palette:{primary:'#b76d85',secondary:'#e6bdca',background:'#fff6f8',surface:'#ffffff',text:'#573842',muted:'#96737d'} },
  'luxury-pink': { family:'xv', layout:'immersive', typography:'editorial', decoration:'sparkle', palette:{primary:'#bf648c',secondary:'#e5a2bd',background:'#2a111d',surface:'#3a1727',text:'#fff1f7',muted:'#d6aabc'} },
  safari: { family:'infantil', layout:'playful', typography:'rounded', decoration:'botanical', palette:{primary:'#8a9b55',secondary:'#d2a95c',background:'#fff8e7',surface:'#ffffff',text:'#3e472a',muted:'#78805d'} },
  dinosaurios: { family:'infantil', layout:'playful', typography:'rounded', decoration:'botanical', palette:{primary:'#598a64',secondary:'#b7834a',background:'#eef5e8',surface:'#ffffff',text:'#294431',muted:'#647b68'} },
  unicornio: { family:'infantil', layout:'playful', typography:'rounded', decoration:'sparkle', palette:{primary:'#c889c9',secondary:'#83c7df',background:'#fff5ff',surface:'#ffffff',text:'#5c3b64',muted:'#91749a'} },
  espacial: { family:'infantil', layout:'immersive', typography:'rounded', decoration:'cosmic', palette:{primary:'#5368a8',secondary:'#9d6fca',background:'#090d25',surface:'#151b3b',text:'#f3f4ff',muted:'#a8afd0'} },
  superheroes: { family:'infantil', layout:'playful', typography:'rounded', decoration:'geometric', palette:{primary:'#e22d32',secondary:'#2356b8',background:'#f4f7ff',surface:'#ffffff',text:'#17213c',muted:'#65708b'} },
  corporativo: { family:'empresarial', layout:'business', typography:'modern', decoration:'geometric', palette:{primary:'#335d7a',secondary:'#8ca6b8',background:'#f3f6f8',surface:'#ffffff',text:'#172b38',muted:'#687c88'} },
  lanzamiento: { family:'empresarial', layout:'immersive', typography:'modern', decoration:'geometric', palette:{primary:'#6756a3',secondary:'#9d8ed1',background:'#101020',surface:'#1b1b32',text:'#f5f3ff',muted:'#aaa4c4'} },
  conferencia: { family:'empresarial', layout:'business', typography:'modern', decoration:'geometric', palette:{primary:'#2b6f75',secondary:'#82afb2',background:'#f1f7f7',surface:'#ffffff',text:'#173a3e',muted:'#688286'} },
  networking: { family:'empresarial', layout:'business', typography:'modern', decoration:'geometric', palette:{primary:'#3d708a',secondary:'#85a8ba',background:'#f2f7fa',surface:'#ffffff',text:'#1d3d4d',muted:'#6a818d'} },
};

export function resolveTemplateEngine(id: string, customPrimary?: string | null): TemplateEngineDefinition {
  const base = definitions[id] || definitions['elegante-classic'];
  const resolvedId = definitions[id] ? id : 'elegante-classic';
  const hero: TemplateEngineDefinition['hero'] =
    base.layout === 'immersive' ? 'full-bleed' :
    base.layout === 'editorial' ? 'split' :
    base.layout === 'playful' ? 'poster' :
    base.layout === 'business' ? 'clean' : 'framed';
  const motion: TemplateEngineDefinition['motion'] =
    base.layout === 'immersive' ? 'cinematic' :
    base.layout === 'playful' ? 'dynamic' :
    base.layout === 'business' || base.layout === 'editorial' ? 'minimal' : 'soft';
  const radius: TemplateEngineDefinition['radius'] =
    base.layout === 'playful' ? 'rounded' :
    base.layout === 'editorial' || base.layout === 'business' ? 'square' : 'soft';

  return {
    ...base,
    id: resolvedId,
    hero,
    motion,
    radius,
    sectionOrder: base.sectionOrder || DEFAULT_TEMPLATE_SECTION_ORDER,
    palette: {
      ...base.palette,
      primary: customPrimary || base.palette.primary,
    },
  };
}

export function templateEngineStyle(definition: TemplateEngineDefinition): React.CSSProperties {
  return {
    '--invite-color': definition.palette.primary,
    '--template-primary': definition.palette.primary,
    '--template-secondary': definition.palette.secondary,
    '--template-background': definition.palette.background,
    '--template-surface': definition.palette.surface,
    '--template-text': definition.palette.text,
    '--template-muted': definition.palette.muted,
    '--template-radius': definition.radius === 'rounded' ? '32px' : definition.radius === 'square' ? '4px' : '18px',
  } as React.CSSProperties;
}


export function normalizeTemplateSectionOrder(value: unknown): TemplateSectionId[] {
  if (!Array.isArray(value)) return [...DEFAULT_TEMPLATE_SECTION_ORDER];
  const allowed = new Set<TemplateSectionId>(DEFAULT_TEMPLATE_SECTION_ORDER);
  const unique = value.filter((item): item is TemplateSectionId =>
    typeof item === 'string' && allowed.has(item as TemplateSectionId)
  ).filter((item, index, list) => list.indexOf(item) === index);
  return [...unique, ...DEFAULT_TEMPLATE_SECTION_ORDER.filter(item => !unique.includes(item))];
}
