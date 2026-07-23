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
