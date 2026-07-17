export type TemplateCollectionId = 'wedding' | 'xv' | 'infantil' | 'empresarial';

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
};

export const TEMPLATE_COLLECTIONS = [
  { id: 'todas', label: 'Todas' },
  { id: 'wedding', label: 'Bodas' },
  { id: 'xv', label: 'XV años' },
  { id: 'infantil', label: 'Infantil' },
  { id: 'empresarial', label: 'Empresarial' },
] as const;

export const TEMPLATE_CATALOG: TemplateDefinition[] = [
  { id:'elegante-classic', name:'Elegante Classic', collection:'wedding', badge:'Disponible', available:true, premium:false, color:'#9a6845', description:'Clásica, cálida y elegante. Ideal para bodas formales.', layout:'classic', features:['Portada cinematográfica','Cuenta regresiva','Galería y RSVP'] },
  { id:'luxury-black', name:'Luxury Black', collection:'wedding', badge:'Disponible', available:true, premium:true, color:'#c7a55b', description:'Negro profundo, detalles dorados y alto contraste.', layout:'dark', features:['Estética nocturna','Detalles dorados','Navegación elegante'] },
  { id:'royal-gold', name:'Royal Gold', collection:'wedding', badge:'Próximamente', available:false, premium:true, color:'#b6924b', description:'Verde esmeralda, oro y detalles de inspiración real.', layout:'royal', features:['Paleta esmeralda','Ornamentos reales','Secciones premium'] },
  { id:'minimal-white', name:'Minimal White', collection:'wedding', badge:'Próximamente', available:false, premium:false, color:'#6d625b', description:'Limpia, luminosa y centrada en la fotografía.', layout:'minimal', features:['Diseño editorial','Tipografía limpia','Fotografía protagonista'] },
  { id:'romantic-garden', name:'Romantic Garden', collection:'wedding', badge:'Disponible', available:true, premium:true, color:'#7f9a78', description:'Editorial botánica, navegación flotante y secciones orgánicas.', layout:'garden', features:['Estilo botánico','Navegación flotante','Transiciones suaves'] },
  { id:'sunset', name:'Sunset', collection:'wedding', badge:'Próximamente', available:false, premium:false, color:'#d37b57', description:'Atardecer, terracota y una atmósfera cálida.', layout:'sunset', features:['Paleta terracota','Luz cálida','Bloques orgánicos'] },
  { id:'vintage', name:'Vintage', collection:'wedding', badge:'Próximamente', available:false, premium:false, color:'#8b745c', description:'Texturas antiguas y composición clásica.', layout:'vintage', features:['Texturas de papel','Marcos clásicos','Detalles nostálgicos'] },
  { id:'modern-editorial', name:'Modern Editorial', collection:'wedding', badge:'Próximamente', available:false, premium:true, color:'#222222', description:'Diseño editorial contemporáneo tipo revista.', layout:'editorial', features:['Composición asimétrica','Tipografía editorial','Galería inmersiva'] },
  { id:'princess-rose', name:'Princess Rose', collection:'xv', badge:'Disponible', available:true, premium:false, color:'#c78ca7', description:'Rosa sofisticado y detalles delicados para XV años.', layout:'princess', features:['Portada delicada','Cuenta regresiva','Sección de corte'] },
  { id:'golden-night', name:'Golden Night', collection:'xv', badge:'Próximamente', available:false, premium:true, color:'#c2a14b', description:'Noche, destellos y glamour dorado.', layout:'golden', features:['Fondo nocturno','Destellos dorados','Animación de gala'] },
  { id:'butterfly', name:'Butterfly', collection:'xv', badge:'Próximamente', available:false, premium:true, color:'#b584c4', description:'Mariposas, movimiento y una estética mágica.', layout:'butterfly', features:['Mariposas animadas','Tonos lavanda','Transiciones mágicas'] },
  { id:'lavender', name:'Lavender', collection:'xv', badge:'Próximamente', available:false, premium:false, color:'#9178ad', description:'Lavanda, transparencias y elegancia juvenil.', layout:'lavender', features:['Capas translúcidas','Paleta lavanda','Galería suave'] },
  { id:'glamour', name:'Glamour', collection:'xv', badge:'Próximamente', available:false, premium:true, color:'#a96884', description:'Brillo sutil y composición de gala.', layout:'glamour', features:['Brillos sutiles','Tipografía de gala','Portada premium'] },
  { id:'floral', name:'Floral', collection:'xv', badge:'Próximamente', available:false, premium:false, color:'#b76d85', description:'Flores, romanticismo y tonos suaves.', layout:'floral', features:['Detalles florales','Tonos suaves','Secciones románticas'] },
  { id:'luxury-pink', name:'Luxury Pink', collection:'xv', badge:'Próximamente', available:false, premium:true, color:'#bf648c', description:'Rosa intenso con una presencia lujosa.', layout:'pink', features:['Rosa profundo','Acabados metálicos','Animaciones premium'] },
  { id:'safari', name:'Safari', collection:'infantil', badge:'Disponible', available:true, premium:false, color:'#8a9b55', description:'Naturaleza, animales y aventura para fiestas infantiles.', layout:'safari', features:['Animales ilustrados','Colores naturales','Secciones divertidas'] },
  { id:'dinosaurios', name:'Dinosaurios', collection:'infantil', badge:'Próximamente', available:false, premium:false, color:'#598a64', description:'Una aventura jurásica divertida.', layout:'dino', features:['Escenario jurásico','Huella animada','Paleta verde'] },
  { id:'unicornio', name:'Unicornio', collection:'infantil', badge:'Próximamente', available:false, premium:false, color:'#c889c9', description:'Colores pastel y fantasía.', layout:'unicorn', features:['Arcoíris pastel','Brillos suaves','Fantasía infantil'] },
  { id:'espacial', name:'Espacial', collection:'infantil', badge:'Próximamente', available:false, premium:true, color:'#5368a8', description:'Planetas, estrellas y exploración.', layout:'space', features:['Fondo espacial','Planetas animados','Efectos de profundidad'] },
  { id:'superheroes', name:'Power Heroes', collection:'infantil', badge:'Disponible', available:true, premium:true, color:'#e22d32', description:'Héroes de colores, energía, rayos y acción para cumpleaños.', layout:'hero', features:['Apertura de acción','Colores intensos','Efectos de energía'] },
  { id:'corporativo', name:'Corporativo', collection:'empresarial', badge:'Disponible', available:true, premium:false, color:'#335d7a', description:'Profesional, sobria y clara para eventos de empresa.', layout:'corporate', features:['Agenda ejecutiva','Información clara','Registro de asistentes'] },
  { id:'lanzamiento', name:'Lanzamiento', collection:'empresarial', badge:'Próximamente', available:false, premium:true, color:'#6756a3', description:'Presentación de producto con estilo moderno.', layout:'launch', features:['Hero de producto','Llamados a la acción','Contenido multimedia'] },
  { id:'conferencia', name:'Conferencia', collection:'empresarial', badge:'Próximamente', available:false, premium:false, color:'#2b6f75', description:'Agenda, ponentes e información ejecutiva.', layout:'conference', features:['Agenda por horarios','Ponentes','Ubicación y registro'] },
  { id:'networking', name:'Networking', collection:'empresarial', badge:'Próximamente', available:false, premium:false, color:'#3d708a', description:'Conexiones, comunidad y encuentros profesionales.', layout:'network', features:['Perfiles destacados','Agenda social','Confirmación rápida'] },
];

export function getTemplateById(id: string) {
  return TEMPLATE_CATALOG.find((template) => template.id === id);
}
