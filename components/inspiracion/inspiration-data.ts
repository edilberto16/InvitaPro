export type InspirationItem = {
  slug: string;
  category: 'Bodas' | 'XV años' | 'Cumpleaños' | 'Baby shower' | 'Empresarial';
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  tags: string[];
  names: string;
  date: string;
  venue: string;
  story: string;
  theme: 'luxury' | 'garden' | 'princess' | 'dino' | 'baby' | 'corporate';
  ceremonyLabel: string;
  primaryAction: string;
};

export const inspirationItems: InspirationItem[] = [
  {
    slug: 'boda-luxury-gold', category: 'Bodas', title: 'Luxury Gold', eyebrow: 'Elegante',
    description: 'Elegancia atemporal con detalles dorados.', image: '/inspiracion/boda-luxury-gold.webp',
    tags: ['Dorado', 'Editorial', 'Clásico'], names: 'Mariana & Alejandro', date: '25 · Agosto · 2027',
    venue: 'Hacienda San Gabriel', story: 'Una celebración elegante inspirada en luz cálida, flores blancas y pequeños detalles dorados.',
    theme: 'luxury', ceremonyLabel: 'Nuestra boda', primaryAction: 'Descubrir la celebración'
  },
  {
    slug: 'boda-romantic-garden', category: 'Bodas', title: 'Romantic Garden', eyebrow: 'Romántico',
    description: 'Flores, naturaleza y una celebración íntima.', image: '/inspiracion/boda-romantic-garden.webp',
    tags: ['Jardín', 'Natural', 'Romántico'], names: 'Camila & Mateo', date: '12 · Abril · 2027',
    venue: 'Jardín Las Magnolias', story: 'Una boda al aire libre con flores suaves, vegetación abundante y una atmósfera íntima.',
    theme: 'garden', ceremonyLabel: 'Celebramos nuestro amor', primaryAction: 'Entrar al jardín'
  },
  {
    slug: 'xv-princess-rose', category: 'XV años', title: 'Princess Rose', eyebrow: 'Glamour',
    description: 'Una noche soñada en rosa y luz.', image: '/inspiracion/xv-princess-rose.webp',
    tags: ['Rosa', 'Princesa', 'Glamour'], names: 'Valentina', date: '18 · Septiembre · 2027',
    venue: 'Salón Imperial', story: 'Una experiencia de XV años con destellos, flores rosas y una entrada digna de una noche inolvidable.',
    theme: 'princess', ceremonyLabel: 'Mis XV años', primaryAction: 'Comenzar la noche mágica'
  },
  {
    slug: 'cumple-dinosaurios', category: 'Cumpleaños', title: 'Dino Adventure', eyebrow: 'Aventura',
    description: 'Una expedición jurásica para celebrar en grande.', image: '/inspiracion/cumple-dinosaurios.webp',
    tags: ['Dinosaurios', 'Infantil', 'Aventura'], names: 'Mateo cumple 6', date: '7 · Marzo · 2027',
    venue: 'Parque Aventura', story: 'Una fiesta llena de dinosaurios amigables, vegetación tropical y sorpresas para pequeños exploradores.',
    theme: 'dino', ceremonyLabel: 'Expedición de cumpleaños', primaryAction: 'Entrar a la aventura'
  },
  {
    slug: 'baby-teddy-clouds', category: 'Baby shower', title: 'Teddy Clouds', eyebrow: 'Dulce',
    description: 'Nubes, estrellas y una bienvenida muy especial.', image: '/inspiracion/baby-teddy-clouds.webp',
    tags: ['Teddy', 'Nubes', 'Tierno'], names: 'Baby Emilia', date: '9 · Mayo · 2027',
    venue: 'Terraza Cielo', story: 'Una celebración tierna con ositos, nubes y estrellas para dar la bienvenida a una nueva historia.',
    theme: 'baby', ceremonyLabel: 'Una dulce espera', primaryAction: 'Abrir la bienvenida'
  },
  {
    slug: 'corporativo-summit', category: 'Empresarial', title: 'Future Summit', eyebrow: 'Innovación',
    description: 'Una experiencia moderna para conectar ideas.', image: '/inspiracion/corporativo-summit.webp',
    tags: ['Tecnología', 'Networking', 'Premium'], names: 'Future Summit 2027', date: '20 · Noviembre · 2027',
    venue: 'Centro de Convenciones', story: 'Una invitación corporativa clara, moderna y enfocada en agenda, ponentes y registro de asistentes.',
    theme: 'corporate', ceremonyLabel: 'Ideas que transforman', primaryAction: 'Ver agenda del summit'
  },
];

export const categories = ['Todos', 'Bodas', 'XV años', 'Cumpleaños', 'Baby shower', 'Empresarial'] as const;

export function getInspiration(slug: string) {
  return inspirationItems.find((item) => item.slug === slug);
}
