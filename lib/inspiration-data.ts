export type InspirationTheme = {
  slug: string;
  category: 'Bodas' | 'XV años' | 'Cumpleaños' | 'Baby shower' | 'Empresarial';
  title: string;
  subtitle: string;
  couple: string;
  date: string;
  location: string;
  venue: string;
  style: string;
  accent: string;
  dark: string;
  cover: string;
  gallery: string[];
  story: string;
  tags: string[];
};

export const inspirationThemes: InspirationTheme[] = [
  {
    slug: 'boda-luxury-gold',
    category: 'Bodas',
    title: 'Luxury Gold',
    subtitle: 'Elegancia atemporal con detalles dorados',
    couple: 'Andrea & Miguel',
    date: '14 de noviembre de 2026',
    location: 'Mérida, Yucatán',
    venue: 'Hacienda San José',
    style: 'Elegante',
    accent: '#b89557',
    dark: '#191612',
    cover: '/demo/portada-boda.jpg',
    gallery: ['/demo/galeria/foto1.jpg','/demo/galeria/foto2.jpg','/demo/galeria/foto4.jpg','/demo/galeria/foto6.jpg'],
    story: 'Una experiencia inspirada en cenas a la luz de las velas, flores blancas y detalles dorados que hacen sentir cada momento especial.',
    tags: ['Dorado', 'Editorial', 'Clásico'],
  },
  {
    slug: 'boda-romantic-garden',
    category: 'Bodas',
    title: 'Romantic Garden',
    subtitle: 'Flores, naturaleza y una celebración íntima',
    couple: 'Sofía & Daniel',
    date: '22 de mayo de 2027',
    location: 'Valle de Bravo, México',
    venue: 'Jardín del Lago',
    style: 'Romántico',
    accent: '#78907b',
    dark: '#203026',
    cover: '/demo/galeria/foto2.jpg',
    gallery: ['/demo/galeria/foto2.jpg','/demo/galeria/foto5.jpg','/demo/galeria/foto7.jpg','/demo/galeria/foto1.jpg'],
    story: 'Pensada para una boda rodeada de naturaleza, con una paleta suave, texturas orgánicas y una atmósfera cercana.',
    tags: ['Jardín', 'Natural', 'Romántico'],
  },
  {
    slug: 'xv-princess-rose',
    category: 'XV años',
    title: 'Princess Rose',
    subtitle: 'Una noche soñada en rosa y luz',
    couple: 'Valentina',
    date: '8 de agosto de 2027',
    location: 'Cancún, Quintana Roo',
    venue: 'Salón Imperial',
    style: 'Glamour',
    accent: '#c57a98',
    dark: '#3b1f2d',
    cover: '/demo/galeria/foto3.jpg',
    gallery: ['/demo/galeria/foto3.jpg','/demo/galeria/foto6.jpg','/demo/galeria/foto8.jpg','/demo/galeria/foto4.jpg'],
    story: 'Una invitación luminosa y femenina para celebrar una noche inolvidable con detalles de princesa y un toque moderno.',
    tags: ['Rosa', 'Princesa', 'Glamour'],
  },
  {
    slug: 'cumple-dinosaurios',
    category: 'Cumpleaños',
    title: 'Dino Adventure',
    subtitle: 'Una aventura jurásica llena de diversión',
    couple: 'Mateo cumple 6',
    date: '17 de enero de 2027',
    location: 'Playa del Carmen, México',
    venue: 'Jardín Aventura',
    style: 'Divertido',
    accent: '#e8a63c',
    dark: '#17372b',
    cover: '/demo/galeria/foto7.jpg',
    gallery: ['/demo/galeria/foto7.jpg','/demo/galeria/foto5.jpg','/demo/galeria/foto2.jpg','/demo/galeria/foto8.jpg'],
    story: 'Colores vivos, exploración y mucha energía para una fiesta infantil que se siente como una expedición jurásica.',
    tags: ['Dinosaurios', 'Infantil', 'Aventura'],
  },
  {
    slug: 'corporativo-summit',
    category: 'Empresarial',
    title: 'Business Summit',
    subtitle: 'Una experiencia clara, moderna y profesional',
    couple: 'Innovation Summit 2027',
    date: '12 de marzo de 2027',
    location: 'Ciudad de México',
    venue: 'Centro Citibanamex',
    style: 'Corporativo',
    accent: '#4f7bd9',
    dark: '#111a2f',
    cover: '/demo/galeria/foto8.jpg',
    gallery: ['/demo/galeria/foto8.jpg','/demo/galeria/foto4.jpg','/demo/galeria/foto6.jpg','/demo/galeria/foto1.jpg'],
    story: 'Diseñada para lanzamientos, conferencias y encuentros profesionales que requieren una comunicación impecable.',
    tags: ['Moderno', 'Profesional', 'Networking'],
  },
];

export function getInspirationTheme(slug: string) {
  return inspirationThemes.find((theme) => theme.slug === slug);
}
