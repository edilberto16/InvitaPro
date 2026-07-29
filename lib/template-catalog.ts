export type TemplateCollectionId = 'wedding' | 'xv' | 'infantil' | 'empresarial' | 'campamento';
export type TemplatePlanTier = 'clasico' | 'premium' | 'signature';

export type TemplateDefinition = {
  id: string;
  name: string;
  collection: TemplateCollectionId;
  badge: 'Disponible' | 'Próximamente';
  available: boolean;
  premium: boolean;
  color: string;
  description: string;
  layout: string;
  features: string[];
  familyName?: string;
  variantName?: string;
  signature?: boolean;
  requiredPlan?: TemplatePlanTier;
  searchTerms?: string[];
  previewImage?: string;
  inspirationSlug?: string;
  publicFeatured?: boolean;
};

export const TEMPLATE_COLLECTIONS = [
  { id: 'todas', label: 'Todas' },
  { id: 'wedding', label: 'Bodas' },
  { id: 'xv', label: 'XV años' },
  { id: 'infantil', label: 'Infantil' },
  { id: 'empresarial', label: 'Empresarial' },
  { id: 'campamento', label: 'Campamentos y retiros' },
] as const;

export const TEMPLATE_CATALOG: TemplateDefinition[] = [
  { id:'campamento-bosque', name:'Campamento Bosque', collection:'campamento', badge:'Disponible', available:true, premium:true, familyName:'Campamentos de Fe', variantName:'Bosque y fogata', color:'#2f6b45', description:'Una experiencia juvenil entre pinos, montañas y fogata para campamentos cristianos, retiros y encuentros de iglesia.', layout:'camp-forest', features:['Programa por días','Lista de qué llevar','Registro y transporte'], searchTerms:['cristiano','iglesia','retiro espiritual','jóvenes','jovenes','fogata','montaña','montana','bosque','campamento juvenil','alabanza'], publicFeatured:true },
  { id:'midnight-gold', name:'Midnight Gold', collection:'wedding', badge:'Disponible', available:true, premium:true, signature:true, familyName:'Luxury Night', variantName:'Negro y oro', color:'#d5b46c', description:'Una experiencia nocturna cinematográfica con oro cálido, contrastes profundos y composición de gala.', layout:'midnight', features:['Portada cinematográfica','Detalles dorados','Todos los bloques compatibles'] },
  { id:'midnight-platinum', name:'Midnight Platinum', collection:'wedding', badge:'Disponible', available:true, premium:true, signature:true, familyName:'Luxury Night', variantName:'Negro y plata', color:'#c8ced8', description:'Lujo contemporáneo en negro, plata y reflejos fríos para bodas y eventos de noche.', layout:'midnight', features:['Acabado platino','Galería inmersiva','RSVP premium'] },
  { id:'midnight-sapphire', name:'Midnight Sapphire', collection:'wedding', badge:'Disponible', available:true, premium:true, signature:true, familyName:'Luxury Night', variantName:'Azul zafiro', color:'#6f8fd8', description:'Azul medianoche, destellos de zafiro y una presencia sofisticada para celebraciones exclusivas.', layout:'midnight', features:['Azul profundo','Brillos sutiles','Animación cinematográfica'] },
  { id:'ivory-editorial', name:'Ivory Editorial', collection:'wedding', badge:'Disponible', available:true, premium:true, signature:true, familyName:'Editorial Romance', variantName:'Marfil', color:'#b59b7d', description:'Diseño tipo revista con marfil, tipografía editorial y fotografía protagonista.', layout:'editorial-luxe', features:['Estilo revista','Composición asimétrica','Espacios elegantes'] },
  { id:'blush-editorial', name:'Blush Editorial', collection:'wedding', badge:'Disponible', available:true, premium:true, signature:true, familyName:'Editorial Romance', variantName:'Rosa palo', color:'#c68f9d', description:'Editorial romántica en rosa palo, crema y detalles delicados de alta gama.', layout:'editorial-luxe', features:['Rosa editorial','Historia destacada','Galería de autor'] },
  { id:'terracotta-editorial', name:'Terracotta Editorial', collection:'wedding', badge:'Disponible', available:true, premium:true, signature:true, familyName:'Editorial Romance', variantName:'Terracota', color:'#b66f52', description:'Terracota, arena y una composición orgánica inspirada en bodas destino.', layout:'editorial-luxe', features:['Paleta terracota','Bloques orgánicos','Ubicación destacada'] },
  { id:'royal-amethyst', name:'Royal Amethyst', collection:'xv', badge:'Disponible', available:true, premium:true, signature:true, familyName:'Royal XV', variantName:'Amatista', color:'#9d73c8', description:'Una experiencia real en amatista, plata y luz suave para unos XV inolvidables.', layout:'royal-xv', features:['Corona sutil','Brillo elegante','Apertura de gala'] },
  { id:'royal-rose', name:'Royal Rose', collection:'xv', badge:'Disponible', available:true, premium:true, signature:true, familyName:'Royal XV', variantName:'Rosa imperial', color:'#d17a9e', description:'Rosa imperial, oro rosado y detalles glam para una celebración protagonista.', layout:'royal-xv', features:['Rosa imperial','Detalles glam','Cuenta regresiva premium'] },
  { id:'royal-emerald', name:'Royal Emerald', collection:'xv', badge:'Disponible', available:true, premium:true, signature:true, familyName:'Royal XV', variantName:'Esmeralda', color:'#3f9a7b', description:'Verde esmeralda, oro y profundidad visual para una celebración moderna y majestuosa.', layout:'royal-xv', features:['Esmeralda y oro','Portada majestuosa','Pases y RSVP compatibles'] },
  { id:'elegante-classic', name:'Elegante Classic', collection:'wedding', badge:'Disponible', available:true, premium:false, color:'#9a6845', description:'Clásica, cálida y elegante. Ideal para bodas formales.', layout:'classic', features:['Portada cinematográfica','Cuenta regresiva','Galería y RSVP'] },
  { id:'luxury-black', name:'Luxury Black', collection:'wedding', badge:'Disponible', available:true, premium:true, color:'#c7a55b', description:'Negro profundo, detalles dorados y alto contraste.', layout:'dark', features:['Estética nocturna','Detalles dorados','Navegación elegante'] },
  { id:'royal-gold', name:'Royal Gold', collection:'wedding', badge:'Disponible', available:true, premium:true, color:'#b6924b', description:'Verde esmeralda, oro y detalles de inspiración real.', layout:'royal', features:['Paleta esmeralda','Ornamentos reales','Secciones premium'] },
  { id:'minimal-white', name:'Minimal White', collection:'wedding', badge:'Disponible', available:true, premium:false, color:'#6d625b', description:'Limpia, luminosa y centrada en la fotografía.', layout:'minimal', features:['Diseño editorial','Tipografía limpia','Fotografía protagonista'] },
  { id:'romantic-garden', name:'Romantic Garden', previewImage:'/inspiracion/boda-romantic-garden.webp', inspirationSlug:'boda-romantic-garden', publicFeatured:true, collection:'wedding', badge:'Disponible', available:true, premium:true, color:'#7f9a78', description:'Editorial botánica, navegación flotante y secciones orgánicas.', layout:'garden', features:['Estilo botánico','Navegación flotante','Transiciones suaves'] },
  { id:'sunset', name:'Sunset', collection:'wedding', badge:'Disponible', available:true, premium:false, color:'#d37b57', description:'Atardecer, terracota y una atmósfera cálida.', layout:'sunset', features:['Paleta terracota','Luz cálida','Bloques orgánicos'] },
  { id:'vintage', name:'Vintage', collection:'wedding', badge:'Disponible', available:true, premium:false, color:'#8b745c', description:'Texturas antiguas y composición clásica.', layout:'vintage', features:['Texturas de papel','Marcos clásicos','Detalles nostálgicos'] },
  { id:'modern-editorial', name:'Modern Editorial', collection:'wedding', badge:'Disponible', available:true, premium:true, color:'#222222', description:'Diseño editorial contemporáneo tipo revista.', layout:'editorial', features:['Composición asimétrica','Tipografía editorial','Galería inmersiva'] },
  { id:'princess-rose', name:'Princess Rose', previewImage:'/inspiracion/xv-princess-rose.webp', inspirationSlug:'xv-princess-rose', publicFeatured:true, collection:'xv', badge:'Disponible', available:true, premium:false, color:'#c78ca7', description:'Rosa sofisticado y detalles delicados para XV años.', layout:'princess', features:['Portada delicada','Cuenta regresiva','Sección de corte'] },
  { id:'golden-night', name:'Golden Night', collection:'xv', badge:'Disponible', available:true, premium:true, color:'#c2a14b', description:'Noche, destellos y glamour dorado.', layout:'golden', features:['Fondo nocturno','Destellos dorados','Animación de gala'] },
  { id:'butterfly', name:'Butterfly', collection:'xv', badge:'Disponible', available:true, premium:true, color:'#b584c4', description:'Mariposas, movimiento y una estética mágica.', layout:'butterfly', features:['Mariposas animadas','Tonos lavanda','Transiciones mágicas'] },
  { id:'lavender', name:'Lavender', collection:'xv', badge:'Disponible', available:true, premium:false, color:'#9178ad', description:'Lavanda, transparencias y elegancia juvenil.', layout:'lavender', features:['Capas translúcidas','Paleta lavanda','Galería suave'] },
  { id:'glamour', name:'Glamour', collection:'xv', badge:'Disponible', available:true, premium:true, color:'#a96884', description:'Brillo sutil y composición de gala.', layout:'glamour', features:['Brillos sutiles','Tipografía de gala','Portada premium'] },
  { id:'floral', name:'Floral', collection:'xv', badge:'Disponible', available:true, premium:false, color:'#b76d85', description:'Flores, romanticismo y tonos suaves.', layout:'floral', features:['Detalles florales','Tonos suaves','Secciones románticas'] },
  { id:'luxury-pink', name:'Luxury Pink', collection:'xv', badge:'Disponible', available:true, premium:true, color:'#bf648c', description:'Rosa intenso con una presencia lujosa.', layout:'pink', features:['Rosa profundo','Acabados metálicos','Animaciones premium'] },
  { id:'safari', name:'Safari', collection:'infantil', badge:'Disponible', available:true, premium:false, color:'#8a9b55', description:'Naturaleza, animales y aventura para fiestas infantiles.', layout:'safari', features:['Animales ilustrados','Colores naturales','Secciones divertidas'] },
  { id:'dinosaurios', name:'Dinosaurios', previewImage:'/inspiracion/cumple-dinosaurios.webp', inspirationSlug:'cumple-dinosaurios', publicFeatured:true, collection:'infantil', badge:'Disponible', available:true, premium:false, color:'#598a64', description:'Una aventura jurásica divertida.', layout:'dino', features:['Escenario jurásico','Huella animada','Paleta verde'] },
  { id:'unicornio', name:'Unicornio', collection:'infantil', badge:'Disponible', available:true, premium:false, color:'#c889c9', description:'Colores pastel y fantasía.', layout:'unicorn', features:['Arcoíris pastel','Brillos suaves','Fantasía infantil'] },
  { id:'espacial', name:'Espacial', collection:'infantil', badge:'Disponible', available:true, premium:true, color:'#5368a8', description:'Planetas, estrellas y exploración.', layout:'space', features:['Fondo espacial','Planetas animados','Efectos de profundidad'] },
  { id:'superheroes', name:'Power Heroes', collection:'infantil', badge:'Disponible', available:true, premium:true, color:'#e22d32', description:'Héroes de colores, energía, rayos y acción para cumpleaños.', layout:'hero', features:['Apertura de acción','Colores intensos','Efectos de energía'] },
  { id:'corporativo', name:'Corporativo', collection:'empresarial', badge:'Disponible', available:true, premium:false, color:'#335d7a', description:'Profesional, sobria y clara para eventos de empresa.', layout:'corporate', features:['Agenda ejecutiva','Información clara','Registro de asistentes'] },
  { id:'lanzamiento', name:'Lanzamiento', collection:'empresarial', badge:'Disponible', available:true, premium:true, color:'#6756a3', description:'Presentación de producto con estilo moderno.', layout:'launch', features:['Hero de producto','Llamados a la acción','Contenido multimedia'] },
  { id:'conferencia', name:'Conferencia', collection:'empresarial', badge:'Disponible', available:true, premium:false, color:'#2b6f75', description:'Agenda, ponentes e información ejecutiva.', layout:'conference', features:['Agenda por horarios','Ponentes','Ubicación y registro'] },
  { id:'networking', name:'Networking', collection:'empresarial', badge:'Disponible', available:true, premium:false, color:'#3d708a', description:'Conexiones, comunidad y encuentros profesionales.', layout:'network', features:['Perfiles destacados','Agenda social','Confirmación rápida'] },
];


const COLLECTION_SEARCH_ALIASES: Record<TemplateCollectionId, string[]> = {
  wedding: ['boda', 'bodas', 'wedding', 'matrimonio'],
  xv: ['xv', 'xv años', 'quinceañera', 'quinceanera', '15 años'],
  infantil: ['infantil', 'cumpleaños', 'cumpleanos', 'niños', 'ninos'],
  empresarial: ['empresarial', 'corporativo', 'empresa', 'conferencia'],
  campamento: ['campamento', 'campamentos', 'retiro', 'retiros', 'cristiano', 'iglesia', 'jóvenes', 'jovenes', 'bosque', 'montaña', 'montana'],
};

function normalizeSearchValue(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getTemplateSearchText(template: TemplateDefinition) {
  return normalizeSearchValue([
    template.id,
    template.name,
    template.familyName,
    template.variantName,
    template.description,
    template.layout,
    template.features.join(' '),
    template.searchTerms?.join(' '),
    COLLECTION_SEARCH_ALIASES[template.collection].join(' '),
    templatePlanLabel(template),
    template.signature ? 'signature lujo luxury' : '',
    template.premium ? 'premium' : 'clasico standard',
  ].join(' '));
}

export function matchesTemplateSearch(template: TemplateDefinition, query: string) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return true;
  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => getTemplateSearchText(template).includes(term));
}

export function getTemplateById(id: string) {
  return TEMPLATE_CATALOG.find((template) => template.id === id);
}

export function getAvailableTemplateById(id: string) {
  return TEMPLATE_CATALOG.find((template) => template.id === id && template.available);
}

export function getAvailableTemplates(collection?: TemplateCollectionId) {
  return TEMPLATE_CATALOG.filter((template) => template.available && (!collection || template.collection === collection));
}

export function getPublicFeaturedTemplates() {
  return TEMPLATE_CATALOG.filter((template) => template.available && template.publicFeatured);
}


export function getTemplateFamilyVariants(templateOrId: TemplateDefinition | string) {
  const template = typeof templateOrId === 'string' ? getTemplateById(templateOrId) : templateOrId;
  if (!template) return [];
  if (!template.familyName) return [template];
  return TEMPLATE_CATALOG.filter((item) => item.available && item.familyName === template.familyName);
}

export function isSignatureFamily(template: TemplateDefinition) {
  return Boolean(template.signature && template.familyName);
}

export function getTemplateRequiredPlan(template: TemplateDefinition): TemplatePlanTier {
  if (template.requiredPlan) return template.requiredPlan;
  if (template.signature) return 'signature';
  if (template.premium) return 'premium';
  return 'clasico';
}

const PLAN_LEVEL: Record<TemplatePlanTier, number> = {
  clasico: 0,
  premium: 1,
  signature: 2,
};

export function normalizeTemplatePlan(value: unknown): TemplatePlanTier {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'signature') return 'signature';
  if (normalized === 'premium') return 'premium';
  return 'clasico';
}

export function canUseTemplate(template: TemplateDefinition, plan: TemplatePlanTier) {
  return PLAN_LEVEL[normalizeTemplatePlan(plan)] >= PLAN_LEVEL[getTemplateRequiredPlan(template)];
}

export function templatePlanLabel(template: TemplateDefinition) {
  const required = getTemplateRequiredPlan(template);
  return required === 'signature' ? 'Signature' : required === 'premium' ? 'Premium' : 'Clásico';
}
