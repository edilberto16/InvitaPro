"use client";
import Link from "next/link";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {useParams,useSearchParams} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {TEMPLATE_CATALOG,TEMPLATE_COLLECTIONS,canUseTemplate,getTemplateById,getTemplateFamilyVariants,getTemplateRequiredPlan,normalizeTemplatePlan,templatePlanLabel,type TemplatePlanTier} from "@/lib/template-catalog";
import TemplatePreviewArtwork from "@/components/templates/template-preview-artwork";
import MediaLibraryPicker from "@/components/media/media-library-picker";
import {CommercialPlan,DEFAULT_COMMERCIAL_PLANS,moneyMXN,planByKey,resolveInvitationCommercialPlanKey} from "@/lib/commercial-plans";
import { invitationModalityLabel, modalityCapabilities, normalizeInvitationModality } from "@/lib/invitation-modality";
import {DEFAULT_TEMPLATE_SECTION_ORDER,normalizeTemplateSectionOrder,type TemplateSectionId} from "@/lib/template-engine";

type Invite={
 id:string;evento_id:string;titulo:string;slug:string;estado:string;modalidad:string;
 template_key:string|null;design_json:Record<string,unknown>|null;color_principal:string|null;
 musica_url:string|null;whatsapp:string|null;
 eventos:{id:string;nombre:string;tipo:string;fecha:string;hora:string|null;lugar:string|null;direccion:string|null;maps_url:string|null}|null;
};

const SECTIONS=[
 {id:"portada",label:"Portada",desc:"Título, mensaje y primera impresión",icon:"✦"},
 {id:"fecha",label:"Fecha y cuenta regresiva",desc:"Fecha, hora y expectativa",icon:"◷"},
 {id:"ubicacion",label:"Ubicación",desc:"Lugar, dirección y mapa",icon:"⌖"},
 {id:"galeria",label:"Galería",desc:"Fotografías y recuerdos",icon:"▧"},
 {id:"musica",label:"Música",desc:"Canción de la celebración",icon:"♫"},
 {id:"programa",label:"Itinerario",desc:"Horarios y actividades",icon:"☷"},
 {id:"vestimenta",label:"Dress code",desc:"Código de vestimenta",icon:"◇"},
 {id:"historia",label:"Nuestra historia",desc:"Cuenta cómo comenzó todo",icon:"♡"},
 {id:"hospedaje",label:"Hospedaje",desc:"Hoteles y recomendaciones",icon:"⌂"},
 {id:"regalos",label:"Mesa de regalos",desc:"Opciones y recomendaciones",icon:"♢"},
 {id:"video",label:"Video",desc:"Mensaje o recuerdo especial",icon:"▶"},
 {id:"faq",label:"Preguntas frecuentes",desc:"Resuelve dudas de tus invitados",icon:"?"},
 {id:"personas",label:"Personas especiales",desc:"Padrinos, damas, corte y familia",icon:"♙"},
 {id:"hashtag",label:"Hashtag y redes",desc:"Conecta el evento con redes sociales",icon:"#"},
 {id:"deseos",label:"Buzón de deseos",desc:"Mensajes especiales de tus invitados",icon:"💌"},
 {id:"album",label:"Álbum colaborativo QR",desc:"Tus invitados suben recuerdos",icon:"▧"},
 {id:"rsvp",label:"Confirmación RSVP",desc:"Asistencia de invitados",icon:"✓"},
] as const;


const BLOCKS:Record<TemplateSectionId,{label:string;desc:string;icon:string;locked?:boolean}>={
 hero:{label:"Portada",desc:"Primera impresión de tu invitación",icon:"✦",locked:true},
 intro:{label:"Introducción",desc:"Mensaje de bienvenida",icon:"❦"},
 countdown:{label:"Cuenta regresiva",desc:"Días, horas y minutos para el evento",icon:"◷"},
 details:{label:"Detalles del evento",desc:"Fecha, lugar y código de vestimenta",icon:"◇"},
 program:{label:"Itinerario",desc:"Horarios y actividades",icon:"☷"},
 gallery:{label:"Galería",desc:"Fotografías y recuerdos",icon:"▧"},
 history:{label:"Nuestra historia",desc:"Una sección narrativa para contar su historia",icon:"♡"},
 lodging:{label:"Hospedaje",desc:"Hoteles, tarifas y recomendaciones para invitados",icon:"⌂"},
 gifts:{label:"Mesa de regalos",desc:"Regalos, transferencias o lluvia de sobres",icon:"♢"},
 video:{label:"Video",desc:"Video especial, bienvenida o recuerdo",icon:"▶"},
 faq:{label:"Preguntas frecuentes",desc:"Respuestas rápidas para tus invitados",icon:"?"},
 special_people:{label:"Personas especiales",desc:"Padrinos, damas, corte, familia o equipo",icon:"♙"},
 hashtag:{label:"Hashtag y redes",desc:"Hashtag oficial e indicaciones para compartir",icon:"#"},
 wishes:{label:"Buzón de deseos",desc:"Recibe mensajes especiales de tus invitados",icon:"💌"},
 album:{label:"Álbum colaborativo QR",desc:"Los invitados pueden subir fotografías del evento",icon:"▧"},
 location:{label:"Ubicación",desc:"Dirección, mapa y cómo llegar",icon:"⌖"},
 rsvp:{label:"Confirmación RSVP",desc:"Respuesta de asistencia de invitados",icon:"✓"},
};

const EDITOR_TO_BLOCK:Partial<Record<string,TemplateSectionId>>={fecha:"countdown",ubicacion:"location",galeria:"gallery",programa:"program",vestimenta:"details",historia:"history",hospedaje:"lodging",regalos:"gifts",video:"video",faq:"faq",personas:"special_people",hashtag:"hashtag",deseos:"wishes",album:"album",rsvp:"rsvp"};
const BLOCK_TO_EDITOR:Partial<Record<TemplateSectionId,string>>={countdown:"fecha",location:"ubicacion",gallery:"galeria",program:"programa",details:"vestimenta",history:"historia",lodging:"hospedaje",gifts:"regalos",video:"video",faq:"faq",special_people:"personas",hashtag:"hashtag",wishes:"deseos",album:"album",rsvp:"rsvp"};

const EDITOR_BLOCKS:Partial<Record<string,TemplateSectionId[]>>={
 portada:["hero"],fecha:["countdown"],ubicacion:["location"],galeria:["gallery"],programa:["program"],vestimenta:["details"],historia:["history"],hospedaje:["lodging"],regalos:["gifts"],video:["video"],faq:["faq"],personas:["special_people"],hashtag:["hashtag"],deseos:["wishes"],album:["album"],rsvp:["rsvp"]
};

type BlockVariantMap=Partial<Record<TemplateSectionId,string>>;
const BLOCK_VARIANTS:Partial<Record<TemplateSectionId,{value:string;label:string}[]>>={
 gallery:[{value:"grid",label:"Cuadrícula"},{value:"editorial",label:"Editorial"},{value:"carousel",label:"Carrusel"}],
 program:[{value:"timeline",label:"Línea de tiempo"},{value:"cards",label:"Tarjetas"},{value:"compact",label:"Compacto"}],
 history:[{value:"classic",label:"Clásica"},{value:"quote",label:"Editorial"},{value:"split",label:"Dividida"}],
 location:[{value:"card",label:"Tarjeta"},{value:"full",label:"Destacada"},{value:"minimal",label:"Minimal"}],
 rsvp:[{value:"card",label:"Tarjeta"},{value:"featured",label:"Destacada"},{value:"minimal",label:"Minimal"}],
};


type StudioSnapshot={
 title:string;message:string;subtitle:string;color:string;music:string;whatsapp:string;program:string;dress:string;historyTitle:string;historyText:string;lodging:string;gift:string;videoUrl:string;faqText:string;specialPeople:string;hashtag:string;socialText:string;wishesTitle:string;wishesText:string;albumTitle:string;albumText:string;rsvpText:string;cover:string;gallery:string[];date:string;time:string;venue:string;address:string;mapsUrl:string;visibility:Record<string,boolean>;sectionOrder:TemplateSectionId[];blockVisibility:Record<TemplateSectionId,boolean>;blockVariants:BlockVariantMap;
};

type BlockCategory="todos"|"evento"|"multimedia"|"invitados"|"premium";
const BLOCK_CATEGORY:Record<TemplateSectionId,BlockCategory>={
 hero:"evento",intro:"evento",countdown:"evento",details:"evento",program:"evento",gallery:"multimedia",
 history:"evento",lodging:"evento",gifts:"evento",video:"multimedia",faq:"invitados",special_people:"evento",
 hashtag:"multimedia",wishes:"invitados",album:"premium",location:"evento",rsvp:"invitados"
};

function collectionForTipo(tipo:string){
 const t=tipo.toLowerCase();
 if(t.includes("xv"))return "xv";
 if(t.includes("boda"))return "wedding";
 if(t.includes("empres"))return "empresarial";
 return "infantil";
}

export default function StudioPage(){
 const params=useParams<{id:string}>();
 const searchParams=useSearchParams();
 const supabase=useMemo(()=>createClient(),[]);
 const [invite,setInvite]=useState<Invite|null>(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [publishingChanges,setPublishingChanges]=useState(false);
 const [saveError,setSaveError]=useState(false);
 const [saved,setSaved]=useState("");
 const [error,setError]=useState("");
 const [active,setActive]=useState("portada");
 const [showTemplates,setShowTemplates]=useState(false);
 const [templateFilter,setTemplateFilter]=useState<"recommended"|"todas"|"wedding"|"xv"|"infantil"|"empresarial">("recommended");
 const [pendingTemplate,setPendingTemplate]=useState<string|null>(null);
 const [applyingTemplate,setApplyingTemplate]=useState(false);
 const [templateNotice,setTemplateNotice]=useState("");
 const processedTemplateQueryRef=useRef<string|null>(null);
 const [showPublish,setShowPublish]=useState(false);
 const [selectedPlan,setSelectedPlan]=useState<"clasico"|"premium"|"signature">("clasico");
 const [requestingActivation,setRequestingActivation]=useState(false);
 const [activationIssues,setActivationIssues]=useState<string[]>([]);
 const [commercialPlans,setCommercialPlans]=useState<CommercialPlan[]>(DEFAULT_COMMERCIAL_PLANS);
 const [title,setTitle]=useState("");
 const [message,setMessage]=useState("");
 const [subtitle,setSubtitle]=useState("");
 const [color,setColor]=useState("#72264f");
 const [music,setMusic]=useState("");
 const [whatsapp,setWhatsapp]=useState("");
 const [program,setProgram]=useState("");
 const [dress,setDress]=useState("Formal");
 const [historyTitle,setHistoryTitle]=useState("Nuestra historia");
 const [historyText,setHistoryText]=useState("");
 const [lodging,setLodging]=useState("");
 const [gift,setGift]=useState("");
 const [videoUrl,setVideoUrl]=useState("");
 const [faqText,setFaqText]=useState("");
 const [specialPeople,setSpecialPeople]=useState("");
 const [hashtag,setHashtag]=useState("");
 const [socialText,setSocialText]=useState("Comparte tus mejores momentos con nosotros");
 const [wishesTitle,setWishesTitle]=useState("Déjanos un mensaje");
 const [wishesText,setWishesText]=useState("Tus palabras también serán parte de este día.");
 const [albumTitle,setAlbumTitle]=useState("Comparte tus recuerdos");
 const [albumText,setAlbumText]=useState("Sube las fotografías que captures durante nuestra celebración.");
 const [rsvpText,setRsvpText]=useState("Confirma tu asistencia");
 const [cover,setCover]=useState("");
 const [gallery,setGallery]=useState<string[]>([]);
 const [date,setDate]=useState("");
 const [time,setTime]=useState("");
 const [venue,setVenue]=useState("");
 const [address,setAddress]=useState("");
 const [mapsUrl,setMapsUrl]=useState("");
 const [mediaPicker,setMediaPicker]=useState<null|"cover"|"gallery"|"music">(null);
 const [visibility,setVisibility]=useState<Record<string,boolean>>({
  portada:true,fecha:true,ubicacion:true,galeria:true,musica:true,programa:true,vestimenta:true,historia:true,hospedaje:true,regalos:true,video:true,faq:true,personas:true,hashtag:true,deseos:true,album:true,rsvp:true
 });
 const [sectionOrder,setSectionOrder]=useState<TemplateSectionId[]>([...DEFAULT_TEMPLATE_SECTION_ORDER]);
 const [blockVisibility,setBlockVisibility]=useState<Record<TemplateSectionId,boolean>>({hero:true,intro:true,countdown:true,details:true,program:true,gallery:true,history:false,lodging:false,gifts:false,video:false,faq:false,special_people:false,hashtag:false,wishes:false,album:false,location:true,rsvp:true});
 const [draggedBlock,setDraggedBlock]=useState<TemplateSectionId|null>(null);
 const [showAddSection,setShowAddSection]=useState(false);
 const [blockCategory,setBlockCategory]=useState<BlockCategory>("todos");
 const [previewDevice,setPreviewDevice]=useState<"mobile"|"tablet"|"desktop">("mobile");
 const [previewRevision,setPreviewRevision]=useState(0);
 const [selectedPreviewSection,setSelectedPreviewSection]=useState<TemplateSectionId|null>(null);
 const [blockVariants,setBlockVariants]=useState<BlockVariantMap>({});
 const previewRef=useRef<HTMLIFrameElement|null>(null);
 const [historyIndex,setHistoryIndex]=useState(-1);
 const [historyLength,setHistoryLength]=useState(0);
 const historyRef=useRef<StudioSnapshot[]>([]);
 const historyIndexRef=useRef(-1);
 const applyingHistoryRef=useRef(false);
 const initializedRef=useRef(false);
 const savedSignatureRef=useRef("");
 const currentSignatureRef=useRef("");
 const savingRef=useRef(false);

 const currentSnapshot=useMemo<StudioSnapshot>(()=>({title,message,subtitle,color,music,whatsapp,program,dress,historyTitle,historyText,lodging,gift,videoUrl,faqText,specialPeople,hashtag,socialText,wishesTitle,wishesText,albumTitle,albumText,rsvpText,cover,gallery,date,time,venue,address,mapsUrl,visibility,sectionOrder,blockVisibility,blockVariants}),[title,message,subtitle,color,music,whatsapp,program,dress,historyTitle,historyText,lodging,gift,videoUrl,faqText,specialPeople,hashtag,socialText,wishesTitle,wishesText,albumTitle,albumText,rsvpText,cover,gallery,date,time,venue,address,mapsUrl,visibility,sectionOrder,blockVisibility,blockVariants]);
 const currentSignature=useMemo(()=>JSON.stringify(currentSnapshot),[currentSnapshot]);
 currentSignatureRef.current=currentSignature;
 const hasUnsavedChanges=initializedRef.current&&currentSignature!==savedSignatureRef.current;
 const publishedSignature=typeof invite?.design_json?.published_signature==="string"?invite.design_json.published_signature:"";
 const hasUnpublishedChanges=invite?.estado==="publicada"&&currentSignature!==publishedSignature;

 const applySnapshot=useCallback((snapshot:StudioSnapshot)=>{
  applyingHistoryRef.current=true;
  setTitle(snapshot.title);setMessage(snapshot.message);setSubtitle(snapshot.subtitle);setColor(snapshot.color);setMusic(snapshot.music);setWhatsapp(snapshot.whatsapp);setProgram(snapshot.program);setDress(snapshot.dress);setHistoryTitle(snapshot.historyTitle);setHistoryText(snapshot.historyText);setLodging(snapshot.lodging);setGift(snapshot.gift);setVideoUrl(snapshot.videoUrl);setFaqText(snapshot.faqText);setSpecialPeople(snapshot.specialPeople);setHashtag(snapshot.hashtag);setSocialText(snapshot.socialText);setWishesTitle(snapshot.wishesTitle);setWishesText(snapshot.wishesText);setAlbumTitle(snapshot.albumTitle);setAlbumText(snapshot.albumText);setRsvpText(snapshot.rsvpText);setCover(snapshot.cover);setGallery([...snapshot.gallery]);setDate(snapshot.date);setTime(snapshot.time);setVenue(snapshot.venue);setAddress(snapshot.address);setMapsUrl(snapshot.mapsUrl);setVisibility({...snapshot.visibility});setSectionOrder([...snapshot.sectionOrder]);setBlockVisibility({...snapshot.blockVisibility});setBlockVariants({...snapshot.blockVariants});
  window.setTimeout(()=>{applyingHistoryRef.current=false},0);
 },[]);
 function undo(){const next=historyIndexRef.current-1;if(next<0)return;historyIndexRef.current=next;setHistoryIndex(next);applySnapshot(historyRef.current[next]);setSaved("Cambio deshecho");}
 function redo(){const next=historyIndexRef.current+1;if(next>=historyRef.current.length)return;historyIndexRef.current=next;setHistoryIndex(next);applySnapshot(historyRef.current[next]);setSaved("Cambio rehecho");}

 useEffect(()=>{
  if(!initializedRef.current||applyingHistoryRef.current)return;
  const timer=window.setTimeout(()=>{
   const current=historyRef.current[historyIndexRef.current];
   if(current&&JSON.stringify(current)===currentSignature)return;
   const nextHistory=historyRef.current.slice(0,historyIndexRef.current+1);
   nextHistory.push(JSON.parse(currentSignature) as StudioSnapshot);
   if(nextHistory.length>50)nextHistory.shift();
   historyRef.current=nextHistory;historyIndexRef.current=nextHistory.length-1;setHistoryIndex(historyIndexRef.current);setHistoryLength(nextHistory.length);
  },300);
  return()=>window.clearTimeout(timer);
 },[currentSignature]);
 useEffect(()=>{
  const beforeUnload=(event:BeforeUnloadEvent)=>{if(!hasUnsavedChanges||saving)return;event.preventDefault();event.returnValue=""};
  window.addEventListener("beforeunload",beforeUnload);return()=>window.removeEventListener("beforeunload",beforeUnload);
 },[hasUnsavedChanges,saving]);
 useEffect(()=>{
  if(!invite||!initializedRef.current||!hasUnsavedChanges||savingRef.current||applyingHistoryRef.current)return;
  const timer=window.setTimeout(()=>{void save({silent:true})},1800);
  return()=>window.clearTimeout(timer);
 },[currentSignature,invite?.id]);
 useEffect(()=>{
  const keyboard=(event:KeyboardEvent)=>{if(!(event.ctrlKey||event.metaKey))return;if(event.key.toLowerCase()!=="z")return;event.preventDefault();if(event.shiftKey)redo();else undo()};
  window.addEventListener("keydown",keyboard);return()=>window.removeEventListener("keydown",keyboard);
 },[historyIndex,historyLength]);
 useEffect(()=>{const sectionId=EDITOR_TO_BLOCK[active];if(sectionId)setSelectedPreviewSection(sectionId)},[active]);

 const sendPreviewState=useCallback(()=>{
  const frame=previewRef.current?.contentWindow;
  if(!frame)return;
  frame.postMessage({
   type:"invitapro:set-composer-state",
   order:sectionOrder,
   visibility:blockVisibility,
   variants:blockVariants,
   selectedSection:selectedPreviewSection,
   draft:{
    title,
    color,
    music,
    whatsapp,
    event:{fecha:date,hora:time||null,lugar:venue,direccion:address,maps_url:mapsUrl},
    designJson:{mensaje:message,subtitulo:subtitle,programa:program,vestimenta:dress,historia_titulo:historyTitle,historia_texto:historyText,hospedaje:lodging,regalos:gift,video_url:videoUrl,faq:faqText,personas_especiales:specialPeople,hashtag,hashtag_texto:socialText,deseos_titulo:wishesTitle,deseos_texto:wishesText,album_titulo:albumTitle,album_texto:albumText,rsvp_text:rsvpText,portada_url:cover,galeria_urls:gallery,section_visibility:visibility,section_order:sectionOrder,block_variants:blockVariants,mostrar_intro:blockVisibility.intro,mostrar_galeria:blockVisibility.gallery,mostrar_historia:blockVisibility.history,mostrar_hospedaje:blockVisibility.lodging,mostrar_regalos:blockVisibility.gifts,mostrar_video:blockVisibility.video,mostrar_faq:blockVisibility.faq,mostrar_personas_especiales:blockVisibility.special_people,mostrar_hashtag:blockVisibility.hashtag,mostrar_deseos:blockVisibility.wishes,mostrar_album:blockVisibility.album,mostrar_programa:blockVisibility.program,mostrar_mapa:blockVisibility.location,mostrar_rsvp:blockVisibility.rsvp,mostrar_contador:blockVisibility.countdown,mostrar_detalles:blockVisibility.details}
   }
  },window.location.origin);
 },[sectionOrder,blockVisibility,blockVariants,selectedPreviewSection,title,color,music,whatsapp,date,time,venue,address,mapsUrl,message,subtitle,program,dress,historyTitle,historyText,lodging,gift,videoUrl,faqText,specialPeople,hashtag,socialText,wishesTitle,wishesText,albumTitle,albumText,rsvpText,cover,gallery,visibility]);

 useEffect(()=>{
  function handlePreviewMessage(event:MessageEvent){
   if(event.origin!==window.location.origin)return;
   const payload=event.data as {type?:string;sectionId?:TemplateSectionId;sourceId?:TemplateSectionId;targetId?:TemplateSectionId;order?:TemplateSectionId[];direction?:"up"|"down";variant?:string};
   if(payload?.type==="invitapro:preview-ready"){sendPreviewState();return;}
   if(payload?.type==="invitapro:select-section"&&payload.sectionId){
    setSelectedPreviewSection(payload.sectionId);
    const editorId=BLOCK_TO_EDITOR[payload.sectionId]||"estructura";
    setActive(editorId);
    return;
   }
   if(payload?.type==="invitapro:toggle-section"&&payload.sectionId&&payload.sectionId!=="hero"){
    setBlockVisibility(current=>({...current,[payload.sectionId!]:!current[payload.sectionId!]}));
    setSaved("Visibilidad actualizada · guarda los cambios");
    return;
   }
   if(payload?.type==="invitapro:move-section"&&payload.sectionId&&payload.direction){
    setSectionOrder(current=>{
     const index=current.indexOf(payload.sectionId!);
     const target=payload.direction==="up"?index-1:index+1;
     if(index<=0&&payload.direction==="up"||index<0||target<1||target>=current.length)return current;
     const next=[...current];[next[index],next[target]]=[next[target],next[index]];return next;
    });
    setSaved("Orden actualizado · guarda los cambios");
    return;
   }
   if(payload?.type==="invitapro:set-variant"&&payload.sectionId&&payload.variant){
    setBlockVariants(current=>({...current,[payload.sectionId!]:payload.variant!}));
    setSaved("Variante actualizada · guarda los cambios");
    return;
   }
   if(payload?.type==="invitapro:reorder-sections"&&payload.sourceId&&payload.targetId){
    if(payload.sourceId==="hero"||payload.targetId==="hero")return;
    setSectionOrder(current=>{
     if(Array.isArray(payload.order))return normalizeTemplateSectionOrder(payload.order);
     const sourceIndex=current.indexOf(payload.sourceId!);
     const targetIndex=current.indexOf(payload.targetId!);
     if(sourceIndex<0||targetIndex<0)return current;
     const next=[...current];
     const [moved]=next.splice(sourceIndex,1);
     next.splice(targetIndex,0,moved);
     return next;
    });
    setSaved("Orden actualizado · guarda los cambios");
   }
  }
  window.addEventListener("message",handlePreviewMessage);
  return()=>window.removeEventListener("message",handlePreviewMessage);
 },[sendPreviewState]);
 useEffect(()=>{sendPreviewState()},[sendPreviewState,previewRevision]);

 async function load(){
  setLoading(true);setError("");
  const {data,error}=await supabase.from("invitaciones")
    .select("id,evento_id,titulo,slug,estado,modalidad,template_key,design_json,color_principal,musica_url,whatsapp,eventos(id,nombre,tipo,fecha,hora,lugar,direccion,maps_url)")
    .eq("id",params.id).maybeSingle();
  if(error||!data){setError(error?.message||"No encontramos esta invitación.");setLoading(false);return;}
  const i=data as unknown as Invite; const d=i.design_json||{};
  setInvite(i);setSelectedPlan(resolveInvitationCommercialPlanKey(d));setTitle(i.titulo);setMessage(typeof d.mensaje==="string"?d.mensaje:"");setSubtitle(typeof d.subtitulo==="string"?d.subtitulo:"Queremos compartir contigo este momento");
  setColor(i.color_principal||getTemplateById(i.template_key||"")?.color||"#72264f");setMusic(i.musica_url||"");setWhatsapp(i.whatsapp||"");
  setProgram(typeof d.programa==="string"?d.programa:"");setDress(typeof d.vestimenta==="string"?d.vestimenta:"Formal");
  setHistoryTitle(typeof d.historia_titulo==="string"?d.historia_titulo:"Nuestra historia");setHistoryText(typeof d.historia_texto==="string"?d.historia_texto:"");
  setLodging(typeof d.hospedaje==="string"?d.hospedaje:"");setGift(typeof d.regalos==="string"?d.regalos:"");setVideoUrl(typeof d.video_url==="string"?d.video_url:"");setFaqText(typeof d.faq==="string"?d.faq:"");
  setSpecialPeople(typeof d.personas_especiales==="string"?d.personas_especiales:"");setHashtag(typeof d.hashtag==="string"?d.hashtag:"");setSocialText(typeof d.hashtag_texto==="string"?d.hashtag_texto:"Comparte tus mejores momentos con nosotros");
  setWishesTitle(typeof d.deseos_titulo==="string"?d.deseos_titulo:"Déjanos un mensaje");setWishesText(typeof d.deseos_texto==="string"?d.deseos_texto:"Tus palabras también serán parte de este día.");
  setAlbumTitle(typeof d.album_titulo==="string"?d.album_titulo:"Comparte tus recuerdos");setAlbumText(typeof d.album_texto==="string"?d.album_texto:"Sube las fotografías que captures durante nuestra celebración.");
  setRsvpText(typeof d.rsvp_text==="string"?d.rsvp_text:"Confirma tu asistencia");
  setCover(typeof d.portada_url==="string"?d.portada_url:"");setGallery(Array.isArray(d.galeria_urls)?d.galeria_urls.filter((x):x is string=>typeof x==="string"):[]);
  setDate(i.eventos?.fecha||"");setTime(i.eventos?.hora?.slice(0,5)||"");setVenue(i.eventos?.lugar||"");setAddress(i.eventos?.direccion||"");setMapsUrl(i.eventos?.maps_url||"");
  setVisibility(v=>({...v,...(typeof d.section_visibility==="object"&&d.section_visibility?d.section_visibility as Record<string,boolean>:{})}));
  setSectionOrder(normalizeTemplateSectionOrder(d.section_order));
  setBlockVariants(typeof d.block_variants==="object"&&d.block_variants?d.block_variants as BlockVariantMap:{});
  setBlockVisibility({
   hero:true,
   intro:d.mostrar_intro!==false,
   countdown:d.mostrar_contador!==false,
   details:d.mostrar_detalles!==false,
   program:d.mostrar_programa!==false,
   gallery:d.mostrar_galeria!==false,
   history:d.mostrar_historia===true,
   lodging:d.mostrar_hospedaje===true,
   gifts:d.mostrar_regalos===true,
   video:d.mostrar_video===true,
   faq:d.mostrar_faq===true,
   special_people:d.mostrar_personas_especiales===true,
   hashtag:d.mostrar_hashtag===true,
   wishes:d.mostrar_deseos===true,
   album:d.mostrar_album===true,
   location:d.mostrar_mapa!==false,
   rsvp:d.mostrar_rsvp!==false,
  });
  window.setTimeout(()=>{
   const snapshot:StudioSnapshot={title:i.titulo,message:typeof d.mensaje==="string"?d.mensaje:"",subtitle:typeof d.subtitulo==="string"?d.subtitulo:"Queremos compartir contigo este momento",color:i.color_principal||getTemplateById(i.template_key||"")?.color||"#72264f",music:i.musica_url||"",whatsapp:i.whatsapp||"",program:typeof d.programa==="string"?d.programa:"",dress:typeof d.vestimenta==="string"?d.vestimenta:"Formal",historyTitle:typeof d.historia_titulo==="string"?d.historia_titulo:"Nuestra historia",historyText:typeof d.historia_texto==="string"?d.historia_texto:"",lodging:typeof d.hospedaje==="string"?d.hospedaje:"",gift:typeof d.regalos==="string"?d.regalos:"",videoUrl:typeof d.video_url==="string"?d.video_url:"",faqText:typeof d.faq==="string"?d.faq:"",specialPeople:typeof d.personas_especiales==="string"?d.personas_especiales:"",hashtag:typeof d.hashtag==="string"?d.hashtag:"",socialText:typeof d.hashtag_texto==="string"?d.hashtag_texto:"Comparte tus mejores momentos con nosotros",wishesTitle:typeof d.deseos_titulo==="string"?d.deseos_titulo:"Déjanos un mensaje",wishesText:typeof d.deseos_texto==="string"?d.deseos_texto:"Tus palabras también serán parte de este día.",albumTitle:typeof d.album_titulo==="string"?d.album_titulo:"Comparte tus recuerdos",albumText:typeof d.album_texto==="string"?d.album_texto:"Sube las fotografías que captures durante nuestra celebración.",rsvpText:typeof d.rsvp_text==="string"?d.rsvp_text:"Confirma tu asistencia",cover:typeof d.portada_url==="string"?d.portada_url:"",gallery:Array.isArray(d.galeria_urls)?d.galeria_urls.filter((x):x is string=>typeof x==="string"):[],date:i.eventos?.fecha||"",time:i.eventos?.hora?.slice(0,5)||"",venue:i.eventos?.lugar||"",address:i.eventos?.direccion||"",mapsUrl:i.eventos?.maps_url||"",visibility:{...visibility,...(typeof d.section_visibility==="object"&&d.section_visibility?d.section_visibility as Record<string,boolean>:{})},sectionOrder:normalizeTemplateSectionOrder(d.section_order),blockVisibility:{hero:true,intro:d.mostrar_intro!==false,countdown:d.mostrar_contador!==false,details:d.mostrar_detalles!==false,program:d.mostrar_programa!==false,gallery:d.mostrar_galeria!==false,history:d.mostrar_historia===true,lodging:d.mostrar_hospedaje===true,gifts:d.mostrar_regalos===true,video:d.mostrar_video===true,faq:d.mostrar_faq===true,special_people:d.mostrar_personas_especiales===true,hashtag:d.mostrar_hashtag===true,wishes:d.mostrar_deseos===true,album:d.mostrar_album===true,location:d.mostrar_mapa!==false,rsvp:normalizeInvitationModality(i.modalidad)!=="simple"&&d.mostrar_rsvp!==false},blockVariants:typeof d.block_variants==="object"&&d.block_variants?d.block_variants as BlockVariantMap:{}};
   const signature=JSON.stringify(snapshot);historyRef.current=[snapshot];historyIndexRef.current=0;setHistoryIndex(0);setHistoryLength(1);savedSignatureRef.current=signature;initializedRef.current=true;
  },0);
  setLoading(false);
 }
 useEffect(()=>{void load()},[params.id]);
 useEffect(()=>{void (async()=>{const{data}=await supabase.from("planes_comerciales").select("*").eq("activo",true).order("orden");if(data?.length)setCommercialPlans(data as CommercialPlan[])})()},[]);

 function buildDraftPayload(){
  if(!invite)return null;
  const current=invite.design_json||{};
  return {
   invitation:{
    titulo:title.trim()||invite.titulo,
    color_principal:color,
    musica_url:music.trim()||null,
    whatsapp:whatsapp.trim()||null,
    design_json:{...current,mensaje:message,subtitulo:subtitle,programa:program,vestimenta:dress,historia_titulo:historyTitle,historia_texto:historyText,hospedaje:lodging,regalos:gift,video_url:videoUrl,faq:faqText,personas_especiales:specialPeople,hashtag,hashtag_texto:socialText,deseos_titulo:wishesTitle,deseos_texto:wishesText,album_titulo:albumTitle,album_texto:albumText,rsvp_text:rsvpText,portada_url:cover,galeria_urls:gallery,section_visibility:visibility,section_order:sectionOrder,block_variants:blockVariants,mostrar_intro:blockVisibility.intro,mostrar_galeria:blockVisibility.gallery,mostrar_historia:blockVisibility.history,mostrar_hospedaje:blockVisibility.lodging,mostrar_regalos:blockVisibility.gifts,mostrar_video:blockVisibility.video,mostrar_faq:blockVisibility.faq,mostrar_personas_especiales:blockVisibility.special_people,mostrar_hashtag:blockVisibility.hashtag,mostrar_deseos:blockVisibility.wishes,mostrar_album:blockVisibility.album,mostrar_programa:blockVisibility.program,mostrar_mapa:blockVisibility.location,mostrar_rsvp:blockVisibility.rsvp,mostrar_contador:blockVisibility.countdown,mostrar_detalles:blockVisibility.details,studio_version:"2.15.0",plantilla:invite.template_key||current.plantilla,draft_saved_at:new Date().toISOString()}
   },
   event:{fecha:date,hora:time||null,lugar:venue.trim()||null,direccion:address.trim()||null,maps_url:mapsUrl.trim()||null}
  };
 }

 async function save(options:{silent?:boolean}={}){
  if(!invite||savingRef.current)return false;
  const built=buildDraftPayload();if(!built)return false;
  const signatureAtStart=currentSignatureRef.current;
  savingRef.current=true;setSaving(true);setSaveError(false);setError("");
  if(!options.silent)setSaved("");
  const [{error:inviteError},{error:eventError}]=await Promise.all([
   supabase.from("invitaciones").update(built.invitation).eq("id",invite.id),
   supabase.from("eventos").update(built.event).eq("id",invite.evento_id)
  ]);
  savingRef.current=false;setSaving(false);
  const saveFailure=inviteError||eventError;
  if(saveFailure){setSaveError(true);setError(saveFailure.message);setSaved("Error al guardar");return false;}
  const updatedEvent=invite.eventos?{...invite.eventos,...built.event}:invite.eventos;
  if(currentSignatureRef.current===signatureAtStart)savedSignatureRef.current=signatureAtStart;
  setSaved(options.silent?"Autoguardado ✓":"Guardado ✓");
  setInvite(current=>current?{...current,...built.invitation,eventos:updatedEvent}:current);
  if(!options.silent)setPreviewRevision(value=>value+1);
  window.setTimeout(()=>setSaved(""),2200);
  return true;
 }

 async function publishChanges(){
  if(!invite||publishingChanges)return;
  setPublishingChanges(true);setError("");
  const savedOk=hasUnsavedChanges?await save({silent:true}):true;
  if(!savedOk){setPublishingChanges(false);return;}
  const built=buildDraftPayload();if(!built){setPublishingChanges(false);return;}
  const publishedAt=new Date().toISOString();
  const publishedSnapshot={
   titulo:built.invitation.titulo,
   color_principal:built.invitation.color_principal,
   musica_url:built.invitation.musica_url,
   whatsapp:built.invitation.whatsapp,
   template_key:invite.template_key,
   design_json:{...(built.invitation.design_json as Record<string,unknown>),published_snapshot:undefined,published_event:undefined,published_signature:undefined}
  };
  const nextDesign={...(built.invitation.design_json as Record<string,unknown>),published_snapshot:publishedSnapshot,published_event:built.event,published_signature:currentSignatureRef.current,published_at:publishedAt};
  const {error}=await supabase.from("invitaciones").update({design_json:nextDesign}).eq("id",invite.id);
  setPublishingChanges(false);
  if(error){setSaveError(true);setError(error.message);setSaved("Error al publicar");return;}
  setInvite(current=>current?{...current,design_json:nextDesign}:current);
  setSaved("Cambios publicados ✓");
  window.setTimeout(()=>setSaved(""),2600);
 }

 async function applyTemplate(id:string){
  if(!invite)return;
  const t=getTemplateById(id); if(!t)return;
  setApplyingTemplate(true);setError("");
  const current=invite.design_json||{};
  const {error}=await supabase.from("invitaciones").update({
    template_key:id,
    color_principal:t.color,
    design_json:{...current,plantilla:id,template_engine:id,template_collection:t.collection}
  }).eq("id",invite.id);
  setApplyingTemplate(false);
  if(error){setError(error.message);return;}
  setInvite({...invite,template_key:id,color_principal:t.color,design_json:{...current,plantilla:id,template_engine:id,template_collection:t.collection}});
  setColor(t.color);setPendingTemplate(null);setShowTemplates(false);setTemplateNotice(`✓ ${t.name} aplicada`);
  setSaved("Plantilla actualizada ✓");
  window.setTimeout(()=>setTemplateNotice(""),2800);
 }

 useEffect(()=>{
  if(!invite)return;
  const requested=searchParams.get("applyTemplate");
  if(!requested||processedTemplateQueryRef.current===requested)return;
  processedTemplateQueryRef.current=requested;
  const template=getTemplateById(requested);
  if(!template){setTemplateNotice("No encontramos la plantilla seleccionada.");return;}
  const invitationPlanKey=normalizeTemplatePlan(resolveInvitationCommercialPlanKey(invite.design_json,selectedPlan)) as TemplatePlanTier;
  if(!canUseTemplate(template,invitationPlanKey)){
   setTemplateNotice(`🔒 ${template.name} requiere el plan ${templatePlanLabel(template)}.`);
   return;
  }
  if(invite.template_key===requested){
   setTemplateNotice(`✓ ${template.name} ya es tu plantilla actual.`);
   return;
  }
  setPendingTemplate(requested);
 },[invite,searchParams,selectedPlan]);

 function requestTemplateChange(id:string){
  if(!invite)return;
  const t=getTemplateById(id); if(!t)return;
  if(!canUseTemplate(t,currentPlanKey)){
    setTemplateNotice(`🔒 ${t.name} requiere el plan ${templatePlanLabel(t)}.`);
    window.setTimeout(()=>setTemplateNotice(""),3200);
    return;
  }
  setPendingTemplate(id);
 }
 function moveBlock(sectionId:TemplateSectionId,direction:-1|1){
  setSectionOrder(current=>{const index=current.indexOf(sectionId);const target=index+direction;if(index<0||target<0||target>=current.length)return current;const next=[...current];[next[index],next[target]]=[next[target],next[index]];return next;});
 }
 function reorderBlock(sourceId:TemplateSectionId,targetId:TemplateSectionId){
  if(sourceId===targetId)return;
  setSectionOrder(current=>{
   const sourceIndex=current.indexOf(sourceId);
   const targetIndex=current.indexOf(targetId);
   if(sourceIndex<0||targetIndex<0)return current;
   const next=[...current];
   const [moved]=next.splice(sourceIndex,1);
   next.splice(targetIndex,0,moved);
   return next;
  });
 }
 function addBlock(sectionId:TemplateSectionId){
  if(sectionId==="rsvp"&&!modalityFeatures.publicRsvp)return;
  setBlockVisibility(current=>({...current,[sectionId]:true}));
  const editorId=BLOCK_TO_EDITOR[sectionId];
  if(editorId)setVisibility(current=>({...current,[editorId]:true}));
  setShowAddSection(false);
 }
 function toggleBlock(sectionId:TemplateSectionId){
  if(BLOCKS[sectionId].locked||(sectionId==="rsvp"&&!modalityFeatures.publicRsvp))return;
  const next=!blockVisibility[sectionId];
  setBlockVisibility(current=>({...current,[sectionId]:next}));
  const editorId=BLOCK_TO_EDITOR[sectionId];
  if(editorId)setVisibility(current=>({...current,[editorId]:next}));
 }
 function setEditorVisibility(sectionId:string,next:boolean){
  setVisibility(current=>({...current,[sectionId]:next}));
  const blockId=EDITOR_TO_BLOCK[sectionId];
  if(blockId)setBlockVisibility(current=>({...current,[blockId]:next}));
 }
 async function requestActivation(){
  if(!invite)return;
  setRequestingActivation(true);setError("");setActivationIssues([]);

  const selected=planByKey(commercialPlans,selectedPlan);
  const issues:string[]=[];
  const currentTemplate=getTemplateById(invite.template_key||"");

  if(!title.trim())issues.push("Agrega el nombre del evento.");
  if(!date)issues.push("Define la fecha del evento.");
  if(!invite.template_key)issues.push("Selecciona una plantilla.");

  if(selected.limite_galeria!==null&&gallery.length>selected.limite_galeria){
    issues.push(`El plan ${selected.nombre} permite hasta ${selected.limite_galeria} fotos en la galería. Actualmente tienes ${gallery.length}.`);
  }
  if(!selected.permite_musica&&music.trim()){
    issues.push(`El plan ${selected.nombre} no incluye música. Elimina la música o elige un plan superior.`);
  }
  if(!selected.permite_rsvp&&normalizeInvitationModality(invite.modalidad)!=="simple"){
    issues.push(`El plan ${selected.nombre} no incluye RSVP/pases para esta modalidad.`);
  }
  if(currentTemplate){
    const requiredPlan=getTemplateRequiredPlan(currentTemplate);
    if(requiredPlan==="signature"&&!selected.permite_signature){
      issues.push(`La plantilla "${currentTemplate.name}" requiere el plan Signature.`);
    }else if(requiredPlan==="premium"&&!selected.permite_plantillas_premium){
      issues.push(`La plantilla "${currentTemplate.name}" requiere Premium o Signature.`);
    }
  }

  if(selected.limite_invitados!==null){
    const {data:guestRows,error:guestError}=await supabase
      .from("invitados")
      .select("adultos_permitidos,ninos_permitidos")
      .eq("invitacion_id",invite.id);
    if(guestError){
      setRequestingActivation(false);
      setError(guestError.message);
      return;
    }
    const allowedPeople=(guestRows??[]).reduce((sum,row)=>sum+Number(row.adultos_permitidos||0)+Number(row.ninos_permitidos||0),0);
    if(allowedPeople>selected.limite_invitados){
      issues.push(`El plan ${selected.nombre} permite hasta ${selected.limite_invitados} invitados/pases y actualmente tienes ${allowedPeople}.`);
    }
  }

  if(issues.length){
    setActivationIssues(issues);
    setRequestingActivation(false);
    return;
  }

  const current=invite.design_json||{};
  const activationSnapshot={
    plan:selectedPlan,
    plan_name:selected.nombre,
    price:selected.precio_mxn,
    limits:{
      invitados:selected.limite_invitados,
      galeria:selected.limite_galeria,
      musica:selected.permite_musica,
      rsvp:selected.permite_rsvp,
      premium:selected.permite_plantillas_premium,
      signature:selected.permite_signature
    }
  };
  const nextDesign={
    ...current,
    activation_plan:selectedPlan,
    activation_plan_name:selected.nombre,
    activation_price_snapshot:selected.precio_mxn,
    activation_plan_snapshot:activationSnapshot,
    activation_requested_at:new Date().toISOString(),
    activation_source:"autoservicio"
  };
  const {error}=await supabase.from("invitaciones").update({
    estado:"pendiente_activacion",
    design_json:nextDesign
  }).eq("id",invite.id);
  setRequestingActivation(false);
  if(error){setError(error.message);return;}
  setInvite({...invite,estado:"pendiente_activacion",design_json:nextDesign});
  setShowPublish(false);setSaved("Solicitud enviada ✓");
 }
 if(loading)return <main className="studio-page"><div className="client-loading">Abriendo InvitaPro Studio…</div></main>;
 if(!invite)return <main className="studio-page"><div className="client-empty"><h2>No pudimos abrir la invitación</h2><p>{error}</p><Link className="client-primary" href="/mi-cuenta">Volver</Link></div></main>;

 const template=getTemplateById(invite.template_key||"");
 const currentPlanKey=normalizeTemplatePlan(resolveInvitationCommercialPlanKey(invite.design_json,selectedPlan)) as TemplatePlanTier;
 const currentPlanName=currentPlanKey==="signature"?"Signature":currentPlanKey==="premium"?"Premium":"Clásico";
 const currentModality=normalizeInvitationModality(invite.modalidad);
 const modalityFeatures=modalityCapabilities(currentModality);
 const collection=collectionForTipo(invite.eventos?.tipo||"");
 const allAvailableTemplates=TEMPLATE_CATALOG.filter(t=>t.available);
 const templates=templateFilter==="recommended"
   ? allAvailableTemplates.filter(t=>t.collection===collection)
   : templateFilter==="todas"
     ? allAvailableTemplates
     : allAvailableTemplates.filter(t=>t.collection===templateFilter);
 const enabled=Object.values(visibility).filter(Boolean).length;
 const progress=Math.round((enabled/SECTIONS.length)*70 + (title?10:0)+(invite.eventos?.fecha?10:0)+(message?10:0));
 const activeEditorSections=SECTIONS.filter(section=>{
  if(section.id==="rsvp"&&!modalityFeatures.publicRsvp)return false;
  if(section.id==="musica")return true;
  const blocks=EDITOR_BLOCKS[section.id];
  return !blocks||blocks.some(blockId=>blockVisibility[blockId]);
 });
 const editorSectionVisible=(sectionId:string)=>{
  const blocks=EDITOR_BLOCKS[sectionId];
  if(blocks?.length)return blocks.some(blockId=>blockVisibility[blockId])&&(visibility[sectionId]??true);
  return visibility[sectionId]??true;
 };

 return <main className="studio-page">{templateNotice&&<div className="studio-template-toast">{templateNotice}</div>}
  <header className="studio-topbar">
   <div className="studio-topbar-left"><Link href="/mi-cuenta" className="self-brand"><span>IP</span><strong>InvitaPro</strong></Link><span className="studio-divider"/><div><strong>{invite.titulo}</strong><small className={saveError?"studio-save-error":saving?"studio-save-saving":hasUnsavedChanges?"studio-save-pending":"studio-save-ok"}>{saved||(saveError?"Error al guardar":saving?"Guardando…":hasUnsavedChanges?"Cambios pendientes":"Borrador guardado")}</small></div></div>
   <div className="studio-topbar-actions"><div className="studio-history-actions"><button className="client-secondary" onClick={undo} disabled={historyIndex<=0||saving} title="Deshacer (Ctrl+Z)">↶</button><button className="client-secondary" onClick={redo} disabled={historyIndex<0||historyIndex>=historyLength-1||saving} title="Rehacer (Ctrl+Shift+Z)">↷</button></div><Link className="client-secondary" href="/mi-cuenta/biblioteca">Biblioteca</Link><button className="client-secondary" onClick={()=>{setTemplateFilter("recommended");setShowTemplates(true)}}>Cambiar plantilla</button><Link className="client-secondary" target="_blank" href={`/invitacion/${invite.slug}?preview=1`}>Vista previa</Link><button className="client-primary" onClick={()=>void save()} disabled={saving||!hasUnsavedChanges}>{saving?"Guardando…":hasUnsavedChanges?"Guardar ahora":"Borrador guardado"}</button>{invite.estado==="borrador"&&<button className="studio-publish-button" onClick={()=>{setActivationIssues([]);setShowPublish(true)}}>Publicar invitación</button>}{invite.estado==="pendiente_activacion"&&<span className="studio-activation-badge">⏳ Pendiente de activación</span>}{invite.estado==="publicada"&&<><button className="studio-publish-button" disabled={publishingChanges||!hasUnpublishedChanges} onClick={()=>void publishChanges()}>{publishingChanges?"Publicando…":hasUnpublishedChanges?"Publicar cambios":"Publicado"}</button><Link className="studio-live-button" target="_blank" href={`/invitacion/${invite.slug}`}>✓ Ver publicada</Link></>}</div>
  </header>

  <div className="studio-workspace">
   <aside className="studio-sidebar">
    <div className="studio-progress"><div><span>Tu invitación</span><strong>{Math.min(progress,100)}%</strong></div><i><b style={{width:`${Math.min(progress,100)}%`}}/></i><small>Completa las secciones antes de publicar.</small></div>
    <div className="studio-modality-summary"><small>MODALIDAD</small><strong>{invitationModalityLabel(currentModality)}</strong><span>{modalityFeatures.personalizedPasses?"Pases, RSVP y check-in":modalityFeatures.publicRsvp?"Confirmación pública":"Enlace público sin confirmaciones"}</span></div>
    <div className="studio-template-summary" onClick={()=>{setTemplateFilter("recommended");setShowTemplates(true)}} role="button" tabIndex={0}><div style={{background:`linear-gradient(145deg,${template?.color||color},#251b22)`}}><span>{template?templatePlanLabel(template):"Plantilla"}</span><strong>{template?.name||invite.template_key||"Sin plantilla"}</strong></div><button>Cambiar diseño</button></div>
    <nav className="studio-section-list"><button className={active==="estructura"?"active studio-structure-entry":"studio-structure-entry"} onClick={()=>setActive("estructura")}><span>☰</span><div><strong>Estructura</strong><small>Ordena y muestra tus bloques</small></div><em className="on">{sectionOrder.filter(id=>blockVisibility[id]).length}/{sectionOrder.length}</em></button>{activeEditorSections.map(s=>{const isVisible=editorSectionVisible(s.id);return <button key={s.id} className={active===s.id?"active":""} onClick={()=>setActive(s.id)}><span>{s.icon}</span><div><strong>{s.label}</strong><small>{s.desc}</small></div><em className={isVisible?"on":"off"}>{isVisible?"Visible":"Oculto"}</em></button>})}</nav>
   </aside>

   <section className="studio-editor">
    <div className="studio-editor-heading"><div><p className="eyebrow">InvitaPro Studio</p><h1>{active==="estructura"?"Estructura de la invitación":SECTIONS.find(s=>s.id===active)?.label}</h1><p>{active==="estructura"?"Organiza el recorrido de tus invitados y decide qué bloques se mostrarán.":SECTIONS.find(s=>s.id===active)?.desc}</p></div>{active!=="estructura"&&<label className="studio-visibility"><input type="checkbox" checked={visibility[active]??true} onChange={e=>setEditorVisibility(active,e.target.checked)}/><span>Mostrar sección</span></label>}</div>

    {active==="estructura"&&<div className="studio-block-builder">
      <div className="studio-block-builder-head"><div><strong>Bloques de tu invitación</strong><small>Arrastra los bloques para cambiar su orden. También puedes ocultarlos y volver a agregarlos cuando quieras.</small></div><span>{sectionOrder.filter(id=>blockVisibility[id]).length} activos</span></div>

      <div className="studio-block-list">{sectionOrder.filter(sectionId=>blockVisibility[sectionId]||BLOCKS[sectionId].locked).map((sectionId,index,visibleOrder)=>{const meta=BLOCKS[sectionId];const enabled=blockVisibility[sectionId];return <article
        key={sectionId}
        className={`studio-block-row ${enabled?"enabled":"disabled"} ${draggedBlock===sectionId?"dragging":""}`}
        draggable={!meta.locked}
        onDragStart={e=>{if(meta.locked){e.preventDefault();return;}setDraggedBlock(sectionId);e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",sectionId)}}
        onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move"}}
        onDrop={e=>{e.preventDefault();const source=(draggedBlock||e.dataTransfer.getData("text/plain")) as TemplateSectionId;if(source)reorderBlock(source,sectionId);setDraggedBlock(null)}}
        onDragEnd={()=>setDraggedBlock(null)}
       ><span className={`studio-block-handle ${meta.locked?"locked":""}`} title={meta.locked?"La portada permanece al inicio":"Arrastra para reordenar"}>{meta.locked?"◆":"⋮⋮"}</span><span className="studio-block-icon">{meta.icon}</span><div className="studio-block-copy"><strong>{meta.label}</strong><small>{meta.desc}</small></div><div className="studio-block-order"><button type="button" disabled={index===0||meta.locked} onClick={()=>moveBlock(sectionId,-1)} aria-label={`Subir ${meta.label}`}>↑</button><button type="button" disabled={index===visibleOrder.length-1||meta.locked} onClick={()=>moveBlock(sectionId,1)} aria-label={`Bajar ${meta.label}`}>↓</button></div><button type="button" className={`studio-block-toggle ${enabled?"active":""}`} disabled={meta.locked} onClick={()=>toggleBlock(sectionId)}>{meta.locked?"Siempre visible":enabled?"Visible":"Oculta"}</button></article>})}</div>

      <div className="studio-add-section">
       <button type="button" className="studio-add-section-button" onClick={()=>setShowAddSection(v=>!v)}><span>＋</span><div><strong>Biblioteca de bloques</strong><small>Agrega nuevas experiencias a tu invitación.</small></div><em>{showAddSection?"Cerrar":"Explorar"}</em></button>
       {showAddSection&&<div className="studio-block-library">
        <div className="studio-block-library-head"><div><strong>Agregar una sección</strong><small>Elige un bloque y personalízalo después desde el menú del Studio.</small></div><span>{sectionOrder.filter(id=>!blockVisibility[id]&&!BLOCKS[id].locked).length} disponibles</span></div>
        <div className="studio-block-library-tabs">
         {([["todos","Todas"],["evento","Evento"],["multimedia","Multimedia"],["invitados","Invitados"],["premium","Premium"]] as const).map(([id,label])=><button key={id} type="button" className={blockCategory===id?"active":""} onClick={()=>setBlockCategory(id)}>{label}</button>)}
        </div>
        <div className="studio-block-library-grid">
        {sectionOrder.filter(id=>!blockVisibility[id]&&!BLOCKS[id].locked&&(blockCategory==="todos"||BLOCK_CATEGORY[id]===blockCategory)).length===0
         ? <div className="studio-add-empty"><strong>No hay bloques disponibles aquí</strong><span>Prueba otra categoría o desactiva una sección para volver a agregarla.</span></div>
         : sectionOrder.filter(id=>!blockVisibility[id]&&!BLOCKS[id].locked&&(blockCategory==="todos"||BLOCK_CATEGORY[id]===blockCategory)).map(sectionId=>{const meta=BLOCKS[sectionId];const premium=BLOCK_CATEGORY[sectionId]==="premium";return <button key={sectionId} type="button" className="studio-block-library-card" onClick={()=>addBlock(sectionId)}><span className="studio-block-library-icon">{meta.icon}</span><div><span className="studio-block-library-badge">{premium?"PREMIUM":BLOCK_CATEGORY[sectionId].toUpperCase()}</span><strong>{meta.label}</strong><small>{meta.desc}</small></div><em>＋ Agregar</em></button>})}
        </div>
       </div>}
      </div>

      <div className="studio-block-tip"><span>✦</span><div><strong>Block Builder v2.11.1</strong><p>Ya puedes reordenar por drag &amp; drop y recuperar secciones ocultas desde “Agregar sección”. El contenido se conserva aunque ocultes un bloque.</p></div></div>
    </div>}
    {active==="portada"&&<div className="studio-fields">
      <label>Título principal<input value={title} onChange={e=>setTitle(e.target.value)}/></label>
      <label>Introducción<input value={subtitle} onChange={e=>setSubtitle(e.target.value)}/></label>
      <label className="full">Mensaje de bienvenida<textarea rows={5} value={message} onChange={e=>setMessage(e.target.value)}/></label>
      <label>Color principal<div className="studio-color"><input type="color" value={color} onChange={e=>setColor(e.target.value)}/><input value={color} onChange={e=>setColor(e.target.value)}/></div></label><div className="studio-cover-field full"><div><strong>Imagen de portada</strong><small>Usa una fotografía vertical o panorámica de buena calidad.</small></div>{cover?<div className="studio-cover-preview"><img src={cover} alt="Portada"/><button type="button" onClick={()=>setCover("")}>Quitar</button></div>:null}<button type="button" className="client-secondary" onClick={()=>setMediaPicker("cover")}>{cover?"Cambiar portada":"Elegir de Biblioteca"}</button></div>
    </div>}
    {active==="fecha"&&<div className="studio-fields"><label>Fecha<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Hora<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label><div className="studio-note full">◷ La cuenta regresiva usa esta fecha y hora automáticamente.</div></div>}
    {active==="ubicacion"&&<div className="studio-fields"><label>Lugar<input value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Salón, jardín, iglesia…"/></label><label>Dirección<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Dirección completa"/></label><label className="full">Google Maps<input value={mapsUrl} onChange={e=>setMapsUrl(e.target.value)} placeholder="https://maps.google.com/..."/></label></div>}
    {active==="galeria"&&<div className="studio-media-section"><div className="studio-media-toolbar"><div><h3>Galería de fotografías</h3><p>Sube o selecciona hasta 8 fotografías. Las nuevas imágenes también quedarán guardadas en tu Biblioteca.</p></div><div className="studio-inline-actions"><button className="client-primary" onClick={()=>setMediaPicker("gallery")}>+ Agregar fotografías</button><Link className="client-secondary" href="/mi-cuenta/biblioteca">Abrir Biblioteca</Link></div></div>{gallery.length?<div className="studio-gallery-grid">{gallery.map((url,index)=><figure key={url}><img src={url} alt={`Foto ${index+1}`}/><button onClick={()=>setGallery(gallery.filter(x=>x!==url))}>×</button></figure>)}</div>:<div className="studio-upload-placeholder"><span>▧</span><h3>Aún no hay fotografías</h3><p>Pulsa “Agregar fotografías” para subirlas desde tu computadora o elegir imágenes ya guardadas.</p><button type="button" className="client-primary" onClick={()=>setMediaPicker("gallery")}>+ Subir fotografías</button></div>}</div>}
    {active==="musica"&&<div className="studio-fields"><label className="full">Música<input value={music} onChange={e=>setMusic(e.target.value)} placeholder="Selecciona desde Biblioteca o pega una URL"/></label><div className="studio-inline-actions full"><button className="client-secondary" type="button" onClick={()=>setMediaPicker("music")}>Elegir de Biblioteca</button>{music&&<audio controls src={music}/>}</div><div className="studio-note full">♫ La música iniciará después de que el invitado abra la invitación.</div></div>}
    {active==="programa"&&<div className="studio-fields"><label className="full">Itinerario<textarea rows={8} value={program} onChange={e=>setProgram(e.target.value)} placeholder={"18:00 | Recepción\n19:00 | Ceremonia\n20:30 | Cena"}/><small>Una actividad por línea: hora | actividad</small></label></div>}
    {active==="vestimenta"&&<div className="studio-fields"><label className="full">Código de vestimenta<input value={dress} onChange={e=>setDress(e.target.value)} placeholder="Formal, cóctel, casual…"/></label></div>}
    {active==="historia"&&<div className="studio-fields"><label className="full">Título de la historia<input value={historyTitle} onChange={e=>setHistoryTitle(e.target.value)} placeholder="Nuestra historia"/></label><label className="full">Historia<textarea rows={8} value={historyText} onChange={e=>setHistoryText(e.target.value)} placeholder="Cuéntales cómo comenzó todo, un recuerdo especial o lo que significa este día para ustedes."/></label><div className="studio-note full">♡ Este bloque aparecerá únicamente cuando lo actives desde Estructura.</div></div>}
    {active==="hospedaje"&&<div className="studio-fields"><label className="full">Hospedaje y recomendaciones<textarea rows={8} value={lodging} onChange={e=>setLodging(e.target.value)} placeholder={"Hotel Vista Mar | Código INVITAPRO | +52 998 000 0000\nHotel Centro | A 5 min del evento"}/><small>Una recomendación por línea. Puedes usar “|” para separar nombre, detalle y contacto.</small></label></div>}
    {active==="regalos"&&<div className="studio-fields"><label className="full">Información de regalos<textarea rows={6} value={gift} onChange={e=>setGift(e.target.value)} placeholder="Mesa de regalos, transferencia, lluvia de sobres…"/></label></div>}
    {active==="video"&&<div className="studio-fields"><label className="full">URL del video<input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."/></label><div className="studio-note full">▶ Puedes usar YouTube, Vimeo o una URL directa de video. En la siguiente fase conectaremos también la Biblioteca Multimedia.</div></div>}
    {active==="faq"&&<div className="studio-fields"><label className="full">Preguntas frecuentes<textarea rows={10} value={faqText} onChange={e=>setFaqText(e.target.value)} placeholder={"¿Puedo llevar niños? | Sí, el evento es familiar.\n¿Hay estacionamiento? | Sí, contamos con valet parking."}/><small>Una pregunta por línea usando: pregunta | respuesta</small></label></div>}
    {active==="personas"&&<div className="studio-fields"><label className="full">Personas especiales<textarea rows={9} value={specialPeople} onChange={e=>setSpecialPeople(e.target.value)} placeholder={"Padrinos | Ana & Carlos\nDamas de honor | Sofía, Mariana y Renata\nPadres | Laura & Miguel"}/><small>Una línea por grupo usando: título | nombres.</small></label></div>}
    {active==="hashtag"&&<div className="studio-fields"><label className="full">Hashtag oficial<input value={hashtag} onChange={e=>setHashtag(e.target.value.replace(/\s/g,""))} placeholder="#AndreaYLuis2026"/></label><label className="full">Texto para tus invitados<input value={socialText} onChange={e=>setSocialText(e.target.value)} placeholder="Comparte tus mejores momentos con nosotros"/></label></div>}
    {active==="deseos"&&<div className="studio-fields"><label className="full">Título del buzón<input value={wishesTitle} onChange={e=>setWishesTitle(e.target.value)} placeholder="Déjanos un mensaje"/></label><label className="full">Introducción<textarea rows={4} value={wishesText} onChange={e=>setWishesText(e.target.value)} placeholder="Tus palabras también serán parte de este día."/></label><div className="studio-note full">💌 Los mensajes se guardan de forma independiente en Supabase y no se publican automáticamente en la invitación.</div></div>}
    {active==="album"&&<div className="studio-fields"><label className="full">Título del álbum<input value={albumTitle} onChange={e=>setAlbumTitle(e.target.value)} placeholder="Comparte tus recuerdos"/></label><label className="full">Texto para tus invitados<textarea rows={4} value={albumText} onChange={e=>setAlbumText(e.target.value)} placeholder="Sube las fotografías que captures durante nuestra celebración."/></label><div className="studio-note full">▧ Las fotografías de invitados se almacenan en un bucket privado separado de la Biblioteca del cliente.</div></div>}
    {active==="rsvp"&&<div className="studio-fields"><label className="full">Texto para confirmar asistencia<input value={rsvpText} onChange={e=>setRsvpText(e.target.value)}/></label><label className="full">WhatsApp de contacto<input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="529981234567"/></label></div>}
    {EDITOR_TO_BLOCK[active]&&BLOCK_VARIANTS[EDITOR_TO_BLOCK[active]!]?.length?<div className="studio-variant-panel"><div><strong>Diseño de la sección</strong><small>Elige cómo se presenta este bloque.</small></div><div className="studio-variant-options">{BLOCK_VARIANTS[EDITOR_TO_BLOCK[active]!]!.map(option=><button key={option.value} className={(blockVariants[EDITOR_TO_BLOCK[active]! ]||BLOCK_VARIANTS[EDITOR_TO_BLOCK[active]! ]![0].value)===option.value?"active":""} onClick={()=>setBlockVariants(current=>({...current,[EDITOR_TO_BLOCK[active]!]:option.value}))}>{option.label}</button>)}</div></div>:null}
    {error&&<p className="form-error">{error}</p>}
   </section>

   <aside className={`studio-preview studio-preview-${previewDevice}`}>
    <div className="studio-preview-head"><div><strong>Vista previa real</strong><small>Haz clic para editar o arrastra para reordenar</small></div><div className="studio-preview-devices"><button className={previewDevice==="mobile"?"active":""} onClick={()=>setPreviewDevice("mobile")} title="Celular">▯</button><button className={previewDevice==="tablet"?"active":""} onClick={()=>setPreviewDevice("tablet")} title="Tableta">▭</button><button className={previewDevice==="desktop"?"active":""} onClick={()=>setPreviewDevice("desktop")} title="Escritorio">▰</button></div></div>
    <div className="studio-live-preview-shell">
     <iframe ref={previewRef} key={previewRevision} title="Vista previa real de la invitación" src={`/invitacion/${invite.slug}?preview=1&studio=1&v=${previewRevision}`}/>
    </div>
    <div className="studio-preview-status"><span>●</span><p>Arrastra cualquier bloque excepto la portada. Los cambios se guardan automáticamente como borrador. En invitaciones publicadas usa “Publicar cambios” para actualizar el enlace público.</p></div>
   </aside>
  </div>

  {showPublish&&<div className="modal-backdrop activation-backdrop" onMouseDown={()=>!requestingActivation&&setShowPublish(false)}><section className="activation-modal" onMouseDown={e=>e.stopPropagation()}>
   <header><div><p className="eyebrow">Lista para el siguiente paso</p><h2>Publicar tu invitación</h2><p>Revisa lo esencial y elige cómo quieres activar tu invitación.</p></div><button onClick={()=>setShowPublish(false)}>×</button></header>
   <div className="activation-readiness"><h3>Validación antes de publicar</h3><div className="activation-checks"><span className={title.trim()?"ok":"missing"}>{title.trim()?"✓":"!"} Nombre del evento</span><span className={date?"ok":"missing"}>{date?"✓":"!"} Fecha</span><span className={invite.template_key?"ok":"missing"}>{invite.template_key?"✓":"!"} Plantilla</span><span className={venue.trim()?"ok":"optional"}>{venue.trim()?"✓":"○"} Ubicación</span><span className={message.trim()?"ok":"optional"}>{message.trim()?"✓":"○"} Mensaje</span><span className={cover?"ok":"optional"}>{cover?"✓":"○"} Portada personalizada</span></div><small>Los elementos marcados con ! son obligatorios. Los demás pueden completarse antes de la activación.</small></div>
   <div className="activation-plans">{commercialPlans.filter(p=>p.activo).map(plan=><button key={plan.clave} className={`${selectedPlan===plan.clave?"selected":""} ${plan.clave==="premium"?"featured":""}`.trim()} onClick={()=>{setSelectedPlan(plan.clave);setActivationIssues([])}}><span>{plan.nombre.toUpperCase()}</span><strong>{moneyMXN(plan.precio_mxn)}</strong><small>{plan.descripcion}</small><small>{plan.limite_invitados===null?"Invitados ilimitados":`Hasta ${plan.limite_invitados} invitados`} · {plan.limite_galeria===null?"Galería ilimitada":`${plan.limite_galeria} fotos`}</small><small>{plan.permite_musica?"✓ Música":"— Sin música"} · {plan.permite_plantillas_premium?"✓ Premium":"— Plantillas estándar"}</small>{plan.clave==="premium"&&<em>Recomendado</em>}</button>)}</div>
   <div className="activation-summary"><div><small>EVENTO</small><strong>{title||invite.titulo}</strong><span>{date||"Fecha por definir"} · {venue||"Ubicación por definir"}</span></div><div><small>PLAN SELECCIONADO</small><strong>{planByKey(commercialPlans,selectedPlan).nombre}</strong><span>{moneyMXN(planByKey(commercialPlans,selectedPlan).precio_mxn)} · Activación manual</span></div></div>
   {activationIssues.length>0&&<div className="activation-plan-issues"><strong>Revisa tu plan antes de continuar:</strong>{activationIssues.map(issue=><span key={issue}>• {issue}</span>)}</div>}
   <footer><button className="client-secondary" disabled={requestingActivation} onClick={()=>setShowPublish(false)}>Seguir editando</button><button className="client-primary activation-submit" disabled={requestingActivation||!title.trim()||!date||!invite.template_key} onClick={()=>void requestActivation()}>{requestingActivation?"Enviando…":"Solicitar activación →"}</button></footer>
   <p className="activation-note">No se realizará ningún cobro automático todavía. InvitaPro confirmará la activación antes de publicar el enlace definitivo.</p>
  </section></div>}
  <MediaLibraryPicker open={mediaPicker==="cover"} eventId={invite.evento_id} kind="imagen" selectedUrls={cover?[cover]:[]} onClose={()=>setMediaPicker(null)} onSelect={urls=>setCover(urls[0]||"")}/>
  <MediaLibraryPicker open={mediaPicker==="gallery"} eventId={invite.evento_id} kind="imagen" multiple maxSelected={8} selectedUrls={gallery} onClose={()=>setMediaPicker(null)} onSelect={urls=>setGallery(urls)}/>
  <MediaLibraryPicker open={mediaPicker==="music"} eventId={invite.evento_id} kind="audio" selectedUrls={music?[music]:[]} onClose={()=>setMediaPicker(null)} onSelect={urls=>setMusic(urls[0]||"")}/>
  {showTemplates&&<div className="modal-backdrop" onMouseDown={()=>setShowTemplates(false)}>
   <section className="studio-template-modal studio-template-modal-global" onMouseDown={e=>e.stopPropagation()}>
    <header>
      <div><p className="eyebrow">Catálogo unificado</p><h2>Cambiar plantilla</h2><p>Plan actual: <strong>{currentPlanName}</strong>. Puedes explorar todo el catálogo; los diseños superiores se muestran bloqueados.</p></div>
      <button onClick={()=>setShowTemplates(false)}>×</button>
    </header>

    <div className="template-category-tabs">
      <button className={templateFilter==="recommended"?"active":""} onClick={()=>setTemplateFilter("recommended")}>Recomendadas</button>
      <button className={templateFilter==="todas"?"active":""} onClick={()=>setTemplateFilter("todas")}>Todas</button>
      <button className={templateFilter==="wedding"?"active":""} onClick={()=>setTemplateFilter("wedding")}>Bodas</button>
      <button className={templateFilter==="xv"?"active":""} onClick={()=>setTemplateFilter("xv")}>XV años</button>
      <button className={templateFilter==="infantil"?"active":""} onClick={()=>setTemplateFilter("infantil")}>Cumpleaños</button>
      <button className={templateFilter==="empresarial"?"active":""} onClick={()=>setTemplateFilter("empresarial")}>Empresarial</button>
    </div>

    <div className="template-filter-summary">
      <span>{templateFilter==="recommended"?"Recomendadas para tu evento":templateFilter==="todas"?"Todas las plantillas":TEMPLATE_COLLECTIONS.find(c=>c.id===templateFilter)?.label}</span>
      <strong>{templates.length} diseño{templates.length===1?"":"s"}</strong>
    </div>

    <div className="studio-template-grid">
      {templates.map(t=>{const allowed=canUseTemplate(t,currentPlanKey);return <article key={t.id} className={`studio-global-template-card ${invite.template_key===t.id?"selected":""} ${allowed?"":"template-locked"}`}>
        <div className="studio-global-template-art">
          <TemplatePreviewArtwork template={t}/>
          <div className="studio-template-badges"><small>{t.familyName||TEMPLATE_COLLECTIONS.find(c=>c.id===t.collection)?.label}</small><small>{templatePlanLabel(t)}</small></div>
          {!allowed&&<div className="template-lock-overlay"><strong>🔒 Requiere {templatePlanLabel(t)}</strong><span>Tu plan actual es {currentPlanName}</span></div>}
        </div>
        <div className="studio-global-template-info">
          <div><h3>{t.name}</h3>{t.variantName&&<small className="studio-template-variant">{t.variantName}</small>}<p>{t.description}</p></div>
          <div className="studio-global-template-actions">
            <Link className="client-secondary" target="_blank" href={`/preview/plantilla?tipo=${t.collection}&plantilla=${t.id}&origen=cliente&context=change&eventId=${encodeURIComponent(invite.id)}&returnTo=${encodeURIComponent(`/mi-cuenta/studio/${invite.id}`)}`}>Vista previa</Link>
            {invite.template_key===t.id
              ? <span className="template-current-label">✓ Plantilla actual</span>
              : allowed
                ? <button className="client-primary" onClick={()=>requestTemplateChange(t.id)}>Aplicar plantilla</button>
                : <button className="client-secondary template-upgrade-button" type="button" onClick={()=>{setSelectedPlan(getTemplateRequiredPlan(t));setShowTemplates(false);setShowPublish(true)}}>Mejorar plan</button>}
          </div>
        </div>
      </article>})}
    </div>
   </section>
  </div>}{pendingTemplate&&(()=>{const selected=getTemplateById(pendingTemplate);const currentCollection=collectionForTipo(invite.eventos?.tipo||"");const sourceLabel=selected?TEMPLATE_COLLECTIONS.find(c=>c.id===selected.collection)?.label:"";const different=selected?.collection!==currentCollection;const familyVariants=selected?getTemplateFamilyVariants(selected):[];return selected?<div className="modal-backdrop template-confirm-backdrop" onMouseDown={()=>!applyingTemplate&&setPendingTemplate(null)}>
    <section className="template-confirm-modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="template-confirm-preview" style={{background:`linear-gradient(145deg,${selected.color},#21171d)`}}>
        <span>{sourceLabel}</span><strong>{selected.name}</strong>{selected.premium&&<small>Premium</small>}
      </div>
      <div className="template-confirm-copy">
        <p className="eyebrow">Cambiar diseño</p>
        <h2>¿Aplicar {selected.name}?</h2>
        {different&&<p className="template-category-warning">Esta plantilla fue diseñada originalmente para <strong>{sourceLabel}</strong>, pero puedes usarla en tu evento.</p>}
        <p>Tu contenido actual se conservará. Solo cambiaremos la identidad visual y la composición compatible con la nueva plantilla.</p>
        <div className="template-preserve-grid">
          <span>✓ Nombre y textos</span><span>✓ Fecha y hora</span><span>✓ Portada y galería</span><span>✓ Música</span><span>✓ Ubicación</span><span>✓ Itinerario</span><span>✓ Dress code</span><span>✓ RSVP</span>
        </div>
        {familyVariants.length>1&&<div className="template-confirm-variants"><small>Variantes de {selected.familyName}</small><div>{familyVariants.map(variant=><button type="button" key={variant.id} className={variant.id===selected.id?"active":""} onClick={()=>setPendingTemplate(variant.id)}><i style={{background:variant.color}}/><span>{variant.variantName||variant.name}</span></button>)}</div></div>}
      </div>
      <footer className="template-confirm-actions">
        <button className="client-secondary" disabled={applyingTemplate} onClick={()=>setPendingTemplate(null)}>Cancelar</button>
        <button className="client-primary" disabled={applyingTemplate} onClick={()=>void applyTemplate(selected.id)}>{applyingTemplate?"Aplicando…":`Aplicar ${selected.name}`}</button>
      </footer>
    </section>
  </div>:null})()} </main>
}