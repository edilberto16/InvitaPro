export type CampTemplateProfile = {
  verse: string;
  verseReference: string;
  tagline: string;
  equipment: { icon: string; label: string }[];
  defaultProgram: string[];
  defaultFaq: string[];
  atmosphere: 'forest' | 'fire' | 'mountain' | 'sunrise' | 'stars' | 'trail' | 'revival';
};

const COMMON_EQUIPMENT = [
  { icon: '🎒', label: 'Mochila' },
  { icon: '📖', label: 'Biblia' },
  { icon: '🔦', label: 'Linterna' },
  { icon: '🧥', label: 'Chamarra' },
  { icon: '🥾', label: 'Calzado cómodo' },
  { icon: '💧', label: 'Botella de agua' },
];

export const CAMP_TEMPLATE_PROFILES: Record<string, CampTemplateProfile> = {
  'campamento-bosque': {
    verse: 'Esfuérzate y sé valiente; no temas ni desmayes, porque el Señor tu Dios estará contigo dondequiera que vayas.',
    verseReference: 'Josué 1:9',
    tagline: 'Fe, amistad y aventura entre los pinos.',
    equipment: COMMON_EQUIPMENT,
    defaultProgram: ['Viernes 18:00 | Registro y bienvenida', 'Viernes 21:00 | Fogata y alabanza', 'Sábado 08:00 | Devocional', 'Sábado 16:00 | Actividades por equipos', 'Domingo 11:00 | Cierre y envío'],
    defaultFaq: ['¿Qué debo llevar? | Biblia, ropa cómoda, chamarra y artículos personales.', '¿Habrá transporte? | Consulta las rutas disponibles con el organizador.', '¿Pueden asistir menores? | Sí, con autorización de madre, padre o tutor.'],
    atmosphere: 'forest',
  },
  'noche-de-fogata': {
    verse: '¿No ardía nuestro corazón en nosotros, mientras nos hablaba en el camino?',
    verseReference: 'Lucas 24:32',
    tagline: 'Una noche para adorar, compartir y volver a encender la fe.',
    equipment: COMMON_EQUIPMENT,
    defaultProgram: ['19:00 | Bienvenida', '20:00 | Cena y convivencia', '21:30 | Fogata y testimonios', '22:30 | Alabanza', '23:30 | Oración de cierre'],
    defaultFaq: ['¿La actividad es al aire libre? | Sí, lleva ropa abrigadora.', '¿Puedo llevar instrumento? | Confírmalo previamente con el equipo de alabanza.', '¿Habrá alimentos? | Sí, revisa con el organizador qué incluye tu registro.'],
    atmosphere: 'fire',
  },
  'retiro-en-la-montana': {
    verse: 'Alzaré mis ojos a los montes; ¿de dónde vendrá mi socorro? Mi socorro viene del Señor.',
    verseReference: 'Salmos 121:1-2',
    tagline: 'Haz una pausa, respira y vuelve a escuchar su voz.',
    equipment: COMMON_EQUIPMENT,
    defaultProgram: ['Viernes 17:00 | Llegada y hospedaje', 'Sábado 07:30 | Oración en la montaña', 'Sábado 10:00 | Sesión principal', 'Sábado 16:00 | Tiempo de reflexión', 'Domingo 10:00 | Plenaria y cierre'],
    defaultFaq: ['¿Cuál es el clima? | Lleva prendas para cambios de temperatura.', '¿Incluye hospedaje? | Consulta el paquete seleccionado.', '¿Hay señal telefónica? | Puede ser limitada en algunas zonas.'],
    atmosphere: 'mountain',
  },
  'amanecer-con-dios': {
    verse: 'Por la misericordia del Señor no hemos sido consumidos, porque nunca decayeron sus misericordias; nuevas son cada mañana.',
    verseReference: 'Lamentaciones 3:22-23',
    tagline: 'Un nuevo día, una nueva oportunidad y una fe renovada.',
    equipment: COMMON_EQUIPMENT,
    defaultProgram: ['06:30 | Recepción', '07:00 | Adoración al amanecer', '08:00 | Devocional', '09:00 | Desayuno y convivencia', '10:30 | Actividad familiar'],
    defaultFaq: ['¿Debo llegar antes del amanecer? | Sí, recomendamos llegar 30 minutos antes.', '¿Es un evento familiar? | Sí, está pensado para todas las edades.', '¿Habrá desayuno? | Consulta los detalles incluidos en tu registro.'],
    atmosphere: 'sunrise',
  },
  'bajo-las-estrellas': {
    verse: 'Los cielos cuentan la gloria de Dios, y el firmamento anuncia la obra de sus manos.',
    verseReference: 'Salmos 19:1',
    tagline: 'Una noche inmersiva para mirar al cielo y adorar al Creador.',
    equipment: COMMON_EQUIPMENT,
    defaultProgram: ['19:30 | Apertura', '20:30 | Cena', '21:30 | Noche de adoración', '23:00 | Reflexión bajo las estrellas', '00:00 | Cierre'],
    defaultFaq: ['¿Se realizará aunque haga frío? | Sí, lleva ropa térmica y cobija.', '¿Puedo llevar telescopio? | Sí, será bienvenido.', '¿Hay espacio para acampar? | Confirma disponibilidad con el organizador.'],
    atmosphere: 'stars',
  },
  'senderos-de-fe': {
    verse: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.',
    verseReference: 'Salmos 119:105',
    tagline: 'Cada paso puede convertirse en una experiencia de crecimiento.',
    equipment: COMMON_EQUIPMENT,
    defaultProgram: ['08:00 | Punto de encuentro', '09:00 | Inicio del sendero', '11:00 | Estación de reflexión', '13:00 | Almuerzo', '15:00 | Círculo de cierre'],
    defaultFaq: ['¿Qué dificultad tiene la ruta? | Consulta el nivel indicado por los organizadores.', '¿Necesito condición física? | Se recomienda poder caminar durante varias horas.', '¿Qué calzado debo usar? | Botas o tenis con buena tracción.'],
    atmosphere: 'trail',
  },
  aviva: {
    verse: 'Aviva tu obra en medio de los tiempos, en medio de los tiempos hazla conocer.',
    verseReference: 'Habacuc 3:2',
    tagline: 'Juventud, propósito y una generación encendida.',
    equipment: COMMON_EQUIPMENT,
    defaultProgram: ['16:00 | Apertura de puertas', '17:00 | Banda invitada', '18:30 | Mensaje principal', '20:00 | Alabanza', '21:30 | Oración y envío'],
    defaultFaq: ['¿Habrá acceso por registro? | Sí, presenta tu confirmación al ingresar.', '¿Puedo asistir con mi grupo juvenil? | Sí, contacta al organizador para registro grupal.', '¿Habrá transporte? | Revisa las rutas disponibles en la información del evento.'],
    atmosphere: 'revival',
  },
};

export function getCampTemplateProfile(templateId: string) {
  return CAMP_TEMPLATE_PROFILES[templateId] ?? null;
}
