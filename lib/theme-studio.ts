import type React from 'react';

export type ThemeStudioDefinition = {
  id: string;
  name: string;
  collection: 'Wedding' | 'XV años' | 'Infantil' | 'Empresarial';
  description: string;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  headingFont: string;
  bodyFont: string;
  buttonStyle: 'solid' | 'outline' | 'soft';
  radius: 'soft' | 'rounded' | 'square';
};

export const THEME_STUDIO_THEMES: ThemeStudioDefinition[] = [
  {id:'elegant-classic',name:'Elegant Classic',collection:'Wedding',description:'Marfil, café cálido y serif editorial.',palette:{primary:'#9a6845',secondary:'#d8c3aa',background:'#fbf7f1',surface:'#ffffff',text:'#33271f',muted:'#77685c'},headingFont:'Georgia, "Times New Roman", serif',bodyFont:'Inter, Arial, sans-serif',buttonStyle:'solid',radius:'soft'},
  {id:'luxury-black',name:'Luxury Black',collection:'Wedding',description:'Negro profundo con acentos dorados.',palette:{primary:'#c7a55b',secondary:'#6f5a2e',background:'#0d0d0d',surface:'#171717',text:'#f8f1df',muted:'#b9ad94'},headingFont:'Georgia, "Times New Roman", serif',bodyFont:'Inter, Arial, sans-serif',buttonStyle:'outline',radius:'square'},
  {id:'romantic-garden',name:'Romantic Garden',collection:'Wedding',description:'Verdes botánicos y tonos naturales.',palette:{primary:'#7f9a78',secondary:'#d6c8ad',background:'#f6f4ec',surface:'#fffdf8',text:'#344333',muted:'#758071'},headingFont:'Georgia, "Times New Roman", serif',bodyFont:'Inter, Arial, sans-serif',buttonStyle:'soft',radius:'rounded'},
  {id:'princess-rose',name:'Princess Rose',collection:'XV años',description:'Rosa elegante con acabado delicado.',palette:{primary:'#c78ca7',secondary:'#f0cddd',background:'#fff4f8',surface:'#ffffff',text:'#593848',muted:'#947181'},headingFont:'Georgia, "Times New Roman", serif',bodyFont:'Inter, Arial, sans-serif',buttonStyle:'solid',radius:'rounded'},
  {id:'golden-night',name:'Golden Night',collection:'XV años',description:'Azul noche y destellos dorados.',palette:{primary:'#c2a14b',secondary:'#6b5522',background:'#111426',surface:'#1b1f35',text:'#fff5d1',muted:'#c8bc92'},headingFont:'Georgia, "Times New Roman", serif',bodyFont:'Inter, Arial, sans-serif',buttonStyle:'outline',radius:'soft'},
  {id:'dinosaurios',name:'Dinosaurios',collection:'Infantil',description:'Verde aventura con formas divertidas.',palette:{primary:'#598a64',secondary:'#b7834a',background:'#eef5e8',surface:'#ffffff',text:'#294431',muted:'#647b68'},headingFont:'"Trebuchet MS", Arial, sans-serif',bodyFont:'Inter, Arial, sans-serif',buttonStyle:'solid',radius:'rounded'},
  {id:'espacial',name:'Espacial',collection:'Infantil',description:'Universo oscuro con acentos violetas.',palette:{primary:'#7185e4',secondary:'#9d6fca',background:'#090d25',surface:'#151b3b',text:'#f3f4ff',muted:'#a8afd0'},headingFont:'"Trebuchet MS", Arial, sans-serif',bodyFont:'Inter, Arial, sans-serif',buttonStyle:'soft',radius:'rounded'},
  {id:'corporate-blue',name:'Corporate Blue',collection:'Empresarial',description:'Azul profesional, limpio y moderno.',palette:{primary:'#335d7a',secondary:'#8ca6b8',background:'#f3f6f8',surface:'#ffffff',text:'#172b38',muted:'#687c88'},headingFont:'Inter, Arial, sans-serif',bodyFont:'Inter, Arial, sans-serif',buttonStyle:'solid',radius:'square'},
];

export function resolveThemeStudio(value: unknown): ThemeStudioDefinition {
  const id = typeof value === 'string' ? value : '';
  return THEME_STUDIO_THEMES.find(theme => theme.id === id) || THEME_STUDIO_THEMES[0];
}

export function themeStudioStyle(theme: ThemeStudioDefinition): React.CSSProperties {
  return {
    '--invite-color': theme.palette.primary,
    '--template-primary': theme.palette.primary,
    '--template-secondary': theme.palette.secondary,
    '--template-background': theme.palette.background,
    '--template-surface': theme.palette.surface,
    '--template-text': theme.palette.text,
    '--template-muted': theme.palette.muted,
    '--template-radius': theme.radius === 'rounded' ? '32px' : theme.radius === 'square' ? '4px' : '18px',
    '--theme-heading-font': theme.headingFont,
    '--theme-body-font': theme.bodyFont,
  } as React.CSSProperties;
}
