export type CommercialPlanKey='clasico'|'premium'|'signature';
export type CommercialPlan={
  id:string;
  clave:CommercialPlanKey;
  nombre:string;
  descripcion:string;
  precio_mxn:number;
  activo:boolean;
  orden:number;
  limite_invitados:number|null;
  limite_galeria:number|null;
  permite_musica:boolean;
  permite_rsvp:boolean;
  permite_plantillas_premium:boolean;
  permite_signature:boolean;
};

export const DEFAULT_COMMERCIAL_PLANS:CommercialPlan[]=[
  {id:'default-clasico',clave:'clasico',nombre:'Clásico',descripcion:'Invitación esencial para publicar y compartir.',precio_mxn:399,activo:true,orden:1,limite_invitados:80,limite_galeria:6,permite_musica:false,permite_rsvp:true,permite_plantillas_premium:false,permite_signature:false},
  {id:'default-premium',clave:'premium',nombre:'Premium',descripcion:'Experiencia completa con multimedia y mayor personalización.',precio_mxn:599,activo:true,orden:2,limite_invitados:200,limite_galeria:12,permite_musica:true,permite_rsvp:true,permite_plantillas_premium:true,permite_signature:false},
  {id:'default-signature',clave:'signature',nombre:'Signature',descripcion:'Diseños exclusivos y funciones especiales.',precio_mxn:899,activo:true,orden:3,limite_invitados:null,limite_galeria:30,permite_musica:true,permite_rsvp:true,permite_plantillas_premium:true,permite_signature:true},
];

export function moneyMXN(value:number){return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(value)}
export function planByKey(plans:CommercialPlan[],key:string){return plans.find(p=>p.clave===key)||DEFAULT_COMMERCIAL_PLANS.find(p=>p.clave===key)||DEFAULT_COMMERCIAL_PLANS[0]}


export function commercialPlanBenefits(plan:CommercialPlan):string[]{
  const guests=plan.limite_invitados===null?'Invitados ilimitados':`Hasta ${plan.limite_invitados} invitados`;
  const gallery=plan.limite_galeria===null?'Álbum y galería sin límite':`Álbum y galería de hasta ${plan.limite_galeria} fotografías`;

  if(plan.clave==='signature'){
    return [
      guests,
      'Todo lo incluido en Premium',
      gallery,
      'Pases personalizados y códigos individuales',
      'Check-in para control de acceso',
      'Diseños Signature y soporte prioritario',
    ];
  }

  if(plan.clave==='premium'){
    return [
      guests,
      'Confirmaciones RSVP y Centro de Mensajes',
      'Importación CSV y envío asistido por WhatsApp',
      gallery,
      'Música, plantillas y temas Premium',
    ];
  }

  return [
    guests,
    'Confirmaciones RSVP públicas',
    gallery,
    'Ubicación, itinerario y cuenta regresiva',
    'Plantillas estándar · sin música Premium',
  ];
}

export function commercialPlanLabel(plan:CommercialPlan):string{
  return `${plan.nombre} · ${moneyMXN(plan.precio_mxn)}`;
}

export function normalizeCommercialPlanKey(value:unknown):CommercialPlanKey|null{
  return value==='clasico'||value==='premium'||value==='signature'?value:null;
}

export function resolveInvitationCommercialPlanKey(design:unknown,fallback:CommercialPlanKey='clasico'):CommercialPlanKey{
  const source=design&&typeof design==='object'?design as Record<string,unknown>:{};
  const direct=normalizeCommercialPlanKey(source.commercial_plan_key);
  if(direct)return direct;
  const activation=normalizeCommercialPlanKey(source.activation_plan);
  if(activation)return activation;
  const snapshot=source.activation_plan_snapshot&&typeof source.activation_plan_snapshot==='object'
    ? source.activation_plan_snapshot as Record<string,unknown>
    : null;
  const snapshotPlan=normalizeCommercialPlanKey(snapshot?.plan);
  if(snapshotPlan)return snapshotPlan;
  return normalizeCommercialPlanKey(source.plan)||fallback;
}
