'use client';
import { FormEvent,ReactNode,useEffect,useMemo,useRef,useState } from 'react';import { useParams } from 'next/navigation';import { createClient } from '@/lib/supabase/client';import { normalizeTemplateSectionOrder,resolveTemplateEngine,TemplateSectionId,templateEngineStyle } from '@/lib/template-engine';import { applyThemeStudioOverrides,resolveThemeStudio,themeStudioStyle } from '@/lib/theme-studio';
type PublicData={invitacion:{id:string;titulo:string;slug:string;modalidad:'simple'|'rsvp'|'pases';design_json:Record<string,unknown>;color_principal:string|null;musica_url:string|null;whatsapp:string|null;fecha_expiracion:string|null};evento:{nombre:string;tipo:string;fecha:string;hora:string|null;zona_horaria:string;lugar:string|null;direccion:string|null;maps_url:string|null};invitado:null};
function longDate(v:string){return new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${v}T00:00:00Z`))}
export default function PublicInvite(){const params=useParams<{slug:string}>();const supabase=useMemo(()=>createClient(),[]);const[data,setData]=useState<PublicData|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState('');const[name,setName]=useState('');const[phone,setPhone]=useState('');const[attendance,setAttendance]=useState(true);const[adults,setAdults]=useState(1);const[children,setChildren]=useState(0);const[message,setMessage]=useState('');const[sent,setSent]=useState(false);const[countdown,setCountdown]=useState({days:'--',hours:'--',minutes:'--',ended:false,invalid:false});const[previewMode,setPreviewMode]=useState(false);const[reviewMode,setReviewMode]=useState(false);const[opened,setOpened]=useState(false);const[audioPlaying,setAudioPlaying]=useState(false);const audioRef=useRef<HTMLAudioElement|null>(null);
useEffect(()=>{let active=true;async function load(){const query=new URLSearchParams(window.location.search);const preview=query.get('preview')==='1';const reviewToken=query.get('review');setPreviewMode(preview||Boolean(reviewToken));setReviewMode(Boolean(reviewToken));if(reviewToken){const{data:reviewData,error:reviewError}=await supabase.rpc('obtener_invitacion_revision',{p_token:reviewToken});if(!active)return;if(reviewError||!reviewData){setError('El enlace de revisión no está disponible o fue desactivado.');setLoading(false);return}setData(reviewData as PublicData);setLoading(false);return}if(preview){const{data:userData}=await supabase.auth.getUser();if(!userData.user){if(active){setError('Inicia sesión para abrir la vista previa administrativa.');setLoading(false)}return}const{data:row,error}=await supabase.from('invitaciones').select('id,titulo,slug,modalidad,design_json,color_principal,musica_url,whatsapp,fecha_expiracion,eventos(nombre,tipo,fecha,hora,zona_horaria,lugar,direccion,maps_url)').eq('slug',params.slug).maybeSingle();if(!active)return;if(error||!row||!row.eventos){setError('No fue posible cargar la vista previa.');setLoading(false);return}const evento=Array.isArray(row.eventos)?row.eventos[0]:row.eventos;if(!evento){setError('El evento relacionado no está disponible.');setLoading(false);return}setData({invitacion:{id:row.id,titulo:row.titulo,slug:row.slug,modalidad:row.modalidad,design_json:row.design_json||{},color_principal:row.color_principal,musica_url:row.musica_url,whatsapp:row.whatsapp,fecha_expiracion:row.fecha_expiracion},evento,invitado:null} as PublicData);setLoading(false);return}const{data,error}=await supabase.rpc('obtener_invitacion_publica',{p_slug:params.slug,p_codigo:null});if(!active)return;if(error||!data)setError('La invitación no existe o no está publicada.');else setData(data as PublicData);setLoading(false)}void load();return()=>{active=false}},[params.slug]);useEffect(()=>{if(!data)return;const datePart=data.evento.fecha;const timePart=(data.evento.hora||'00:00').slice(0,5);const target=new Date(`${datePart}T${timePart}:00`).getTime();if(!Number.isFinite(target)){setCountdown({days:'--',hours:'--',minutes:'--',ended:false,invalid:true});return}const tick=()=>{const d=target-Date.now();if(d<=0){setCountdown({days:'00',hours:'00',minutes:'00',ended:true,invalid:false});return}setCountdown({days:String(Math.floor(d/86400000)).padStart(2,'0'),hours:String(Math.floor((d/3600000)%24)).padStart(2,'0'),minutes:String(Math.floor((d/60000)%60)).padStart(2,'0'),ended:false,invalid:false})};tick();const id=setInterval(tick,60000);return()=>clearInterval(id)},[data]);useEffect(()=>{if(!data)return;const enabled=data.invitacion.design_json?.pantalla_bienvenida!==false;if(enabled&&!opened){const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}}},[data,opened]);
async function openInvitation(){
  setOpened(true);
  const audio=audioRef.current;
  if(audio){
    try{await audio.play()}catch{setAudioPlaying(false)}
  }
}
async function submit(e:FormEvent){e.preventDefault();setError('');const r=await supabase.rpc('registrar_confirmacion',{p_slug:params.slug,p_asistira:attendance,p_adultos:attendance?adults:0,p_ninos:attendance?children:0,p_nombre:name,p_telefono:phone||null,p_mensaje:message||null,p_codigo:null});if(r.error)setError(r.error.message);else setSent(true)}
if(loading)return <main className="public-invite-loading">Preparando invitación…</main>;
if(!data)return <main className="public-invite-error"><h1>Invitación no disponible</h1><p>{error}</p></main>;

const design=data.invitacion.design_json||{};
const plantilla=String(design.plantilla||'elegante-classic');const templateEngine=resolveTemplateEngine(plantilla,data.invitacion.color_principal);const studioTheme=applyThemeStudioOverrides(resolveThemeStudio(design.theme_id),design.theme_overrides);const inviteStyle={...templateEngineStyle(templateEngine),...themeStudioStyle(studioTheme)};
const intro=String(design.mensaje||'Será un honor contar con tu presencia.');
const subtitle=String(design.subtitulo||'Queremos compartir contigo este momento');
const dress=String(design.vestimenta||'Libre');
const showIntro=design.mostrar_intro!==false;
const showCountdown=design.mostrar_contador!==false;
const showDetails=design.mostrar_detalles!==false;
const showProgram=design.mostrar_programa!==false;
const showGallery=design.mostrar_galeria!==false;
const showMap=design.mostrar_mapa!==false;
const showRsvp=design.mostrar_rsvp!==false;
const program=String(design.programa||'').split('\n').map(x=>x.trim()).filter(Boolean).map((line,index)=>{
  const [time,...rest]=line.split('|');
  return {id:index,time:time?.trim()||'',title:rest.join('|').trim()||time?.trim()||''};
});
const coverUrl=typeof design.portada_url==='string'?design.portada_url:'';
const coverEffect=typeof design.portada_efecto==='string'?design.portada_efecto:'cinematic-zoom';
const welcomeEnabled=design.pantalla_bienvenida!==false;
const welcomeButton=typeof design.texto_bienvenida==='string'&&design.texto_bienvenida.trim()?design.texto_bienvenida:'Abrir invitación';
const galleryUrls=Array.isArray(design.galeria_urls)?design.galeria_urls.filter((url):url is string=>typeof url==='string'):[];
const eventType=data.evento.tipo||'Evento especial';
const calendarStart=`${data.evento.fecha.replaceAll('-','')}T${(data.evento.hora||'00:00').slice(0,5).replace(':','')}00`;
const calendarEnd=`${data.evento.fecha.replaceAll('-','')}T${String(Number((data.evento.hora||'00:00').slice(0,2))+2).padStart(2,'0')}${(data.evento.hora||'00:00').slice(3,5)}00`;
const sectionOrder=normalizeTemplateSectionOrder(design.section_order);
const rawSectionSettings=design.section_settings&&typeof design.section_settings==='object'?design.section_settings as Record<string,Record<string,unknown>>:{};
const sectionSetting=(id:TemplateSectionId,key:'eyebrow'|'title'|'description'|'buttonLabel'|'alignment',fallback:string)=>{const value=rawSectionSettings[id]?.[key];return typeof value==='string'&&value.trim()?value:fallback};
const calendarUrl=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.invitacion.titulo)}&dates=${calendarStart}/${calendarEnd}&details=${encodeURIComponent(intro)}&location=${encodeURIComponent([data.evento.lugar,data.evento.direccion].filter(Boolean).join(', '))}`;

return <main data-theme-studio={studioTheme.id} data-button-style={studioTheme.buttonStyle} data-template={templateEngine.id} data-family={templateEngine.family} data-layout={templateEngine.layout} data-typography={templateEngine.typography} data-decoration={templateEngine.decoration} data-hero={templateEngine.hero} data-motion={templateEngine.motion} data-radius={templateEngine.radius} className={`premium-public-invite template-engine theme-${templateEngine.id} layout-${templateEngine.layout} typography-${templateEngine.typography} decoration-${templateEngine.decoration} hero-${templateEngine.hero} motion-${templateEngine.motion} radius-${templateEngine.radius} ${opened||!welcomeEnabled?'invitation-opened':'invitation-locked'}`} style={inviteStyle}>
  {previewMode&&<div className={`admin-preview-banner ${reviewMode?'client-review-banner':''}`}><strong>{reviewMode?'Revisión privada del cliente':'Vista previa administrativa'}</strong><span>{reviewMode?'Esta invitación todavía no está publicada. El enlace puede ser desactivado por el administrador.':data.invitacion.modalidad==='pases'?'Los invitados abrirán un enlace personalizado con su código.':'Esta vista no está publicada para invitados.'}</span></div>}
  {welcomeEnabled&&!opened&&<section className={`invitation-opening-screen effect-${coverEffect}`}>
    <div className="opening-screen-background" style={coverUrl?{backgroundImage:`url("${coverUrl}")`}:undefined}/>
    <div className="opening-screen-shade"/>
    <div className="opening-screen-content">
      <span className="opening-screen-kicker">Invitación especial</span>
      <p>Tenemos el honor de invitarte a</p>
      <h1>{data.invitacion.titulo}</h1>
      <small>{longDate(data.evento.fecha)}</small>
      <button type="button" onClick={()=>void openInvitation()}>
        <span>♫</span>{welcomeButton}
      </button>
      {data.invitacion.musica_url&&<em>La música iniciará al abrir</em>}
    </div>
  </section>}
  {data.invitacion.musica_url&&<>
    <audio ref={audioRef} src={data.invitacion.musica_url} loop preload="metadata" onPlay={()=>setAudioPlaying(true)} onPause={()=>setAudioPlaying(false)}/>
    <button className={`premium-music-button ${audioPlaying?'playing':''}`} type="button" onClick={()=>{const audio=audioRef.current;if(!audio)return;if(audio.paused)void audio.play();else audio.pause()}} aria-label={audioPlaying?'Pausar música':'Reproducir música'}>
      <span>{audioPlaying?'Ⅱ':'♫'}</span><small>{audioPlaying?'Pausar':'Música'}</small>
    </button>
  </>}
  {plantilla==='romantic-garden'&&<nav className="garden-floating-nav" aria-label="Navegación de la invitación">
    <a href="#inicio">Inicio</a>
    <a href="#detalles">Detalles</a>
    {showProgram&&program.length>0&&<a href="#programa">Itinerario</a>}
    {showGallery&&galleryUrls.length>0&&<a href="#galeria">Galería</a>}
    {showMap&&<a href="#ubicacion">Ubicación</a>}
    {data.invitacion.modalidad==='rsvp'&&showRsvp&&<a href="#rsvp">RSVP</a>}
  </nav>}

  {sectionOrder.map(sectionId=>{
    const sections:Record<TemplateSectionId,ReactNode>={
      hero:<section id="inicio" className={`premium-hero ${coverUrl?'has-cover':''} cover-effect-${coverEffect}`}>
        {coverUrl&&<div className="premium-hero-background" style={{backgroundImage:`url("${coverUrl}")`}}/>}
        <div className="premium-hero-overlay"/><div className="premium-hero-decoration decoration-one"/><div className="premium-hero-decoration decoration-two"/>
        <div className="premium-hero-content"><span className="premium-kicker">{eventType}</span><p className="premium-invite-label">{sectionSetting('hero','eyebrow','Tenemos el honor de invitarte a')}</p><h1>{data.invitacion.titulo}</h1><div className="premium-hero-date"><span>{longDate(data.evento.fecha)}</span><i/><span>{(data.evento.hora||'Hora por confirmar').slice(0,5)}</span></div><a href="#detalles" className="premium-scroll-link">{sectionSetting('hero','buttonLabel','Descubre los detalles')} <span>↓</span></a></div>
      </section>,
      intro:showIntro?<section className="premium-intro-block" id="detalles"><div className="garden-botanical-separator" aria-hidden="true"><span>❦</span></div><span className="premium-ornament">✦</span><p className="premium-small-title">{sectionSetting('intro','eyebrow','Estás cordialmente invitado')}</p><h2>{sectionSetting('intro','title',subtitle)}</h2><p className="premium-copy">{sectionSetting('intro','description',intro)}</p>{plantilla==='romantic-garden'&&<a className="garden-calendar-button" href={calendarUrl} target="_blank" rel="noreferrer">{sectionSetting('intro','buttonLabel','Agregar a mi calendario')}</a>}</section>:null,
      countdown:showCountdown?<section className="premium-countdown-section"><p className="premium-small-title">{sectionSetting('countdown','eyebrow','Faltan')}</p>{countdown.invalid?<div className="premium-date-pending">Fecha por confirmar</div>:countdown.ended?<div className="premium-date-pending">¡Hoy es el gran día!</div>:<div className="premium-countdown-grid"><article><strong>{countdown.days}</strong><span>Días</span></article><article><strong>{countdown.hours}</strong><span>Horas</span></article><article><strong>{countdown.minutes}</strong><span>Minutos</span></article></div>}</section>:null,
      details:showDetails?<section className="premium-details-section"><div className="premium-section-heading"><p className="premium-small-title">{sectionSetting('details','eyebrow','Información')}</p><h2>{sectionSetting('details','title','Todo lo que necesitas saber')}</h2></div><div className="premium-detail-grid"><article><span className="premium-detail-icon">01</span><small>Fecha y hora</small><strong>{longDate(data.evento.fecha)}</strong><p>{data.evento.hora?.slice(0,5)||'Hora por confirmar'}</p></article><article><span className="premium-detail-icon">02</span><small>Lugar</small><strong>{data.evento.lugar||'Por confirmar'}</strong><p>{data.evento.direccion||'Dirección por confirmar'}</p></article><article><span className="premium-detail-icon">03</span><small>Código de vestimenta</small><strong>{dress}</strong><p>Gracias por acompañarnos</p></article></div></section>:null,
      program:showProgram&&program.length>0?<section id="programa" className="premium-program-section"><div className="premium-section-heading light"><p className="premium-small-title">{sectionSetting('program','eyebrow','Itinerario')}</p><h2>{sectionSetting('program','title','Programa del evento')}</h2></div><div className="premium-timeline">{program.map(item=><article key={item.id}><time>{item.time}</time><span/><strong>{item.title}</strong></article>)}</div></section>:null,
      gallery:showGallery&&galleryUrls.length>0?<section id="galeria" className="premium-gallery-section"><div className="premium-section-heading"><p className="premium-small-title">{sectionSetting('gallery','eyebrow','Recuerdos')}</p><h2>{sectionSetting('gallery','title','Nuestra galería')}</h2><p>{sectionSetting('gallery','description','Algunos momentos que queremos compartir contigo.')}</p></div><div className={`premium-gallery-grid gallery-count-${Math.min(galleryUrls.length,6)}`}>{galleryUrls.map((url,index)=><figure key={url} className={`gallery-item gallery-item-${index+1}`}><img src={url} alt={`Fotografía ${index+1} de ${data.invitacion.titulo}`} loading="lazy"/></figure>)}</div></section>:null,
      location:showMap?<section id="ubicacion" className="premium-location-section"><div className="premium-location-card"><p className="premium-small-title">{sectionSetting('location','eyebrow','Ubicación')}</p><h2>{data.evento.lugar||'Lugar por confirmar'}</h2><p>{data.evento.direccion||'La dirección se publicará próximamente.'}</p><div className="premium-location-actions">{data.evento.maps_url&&<a href={data.evento.maps_url} target="_blank">{sectionSetting('location','buttonLabel','Cómo llegar')}</a>}{data.invitacion.whatsapp&&<a className="secondary" href={`https://wa.me/${data.invitacion.whatsapp}`} target="_blank">Contactar anfitrión</a>}</div></div></section>:null,
      rsvp:data.invitacion.modalidad==='rsvp'&&showRsvp?<section id="rsvp" className="premium-rsvp-section"><div className="premium-rsvp-card"><p className="premium-small-title">{sectionSetting('rsvp','eyebrow','RSVP')}</p><h2>{sectionSetting('rsvp','title','¿Nos acompañas?')}</h2><p>{sectionSetting('rsvp','description','Agradecemos confirmar tu asistencia.')}</p>{sent?<div className="rsvp-success">✓ Tu respuesta se guardó correctamente.</div>:<form className="rsvp-public-form" onSubmit={submit}><label className="rsvp-message-field"><span>Nombre *</span><input value={name} onChange={e=>setName(e.target.value)} required/></label><label className="rsvp-message-field"><span>Teléfono</span><input value={phone} onChange={e=>setPhone(e.target.value)}/></label><div className="rsvp-choice-grid"><button type="button" className={`rsvp-choice ${attendance?'selected':''}`} onClick={()=>setAttendance(true)}>✓ <strong>Sí, asistiré</strong></button><button type="button" className={`rsvp-choice decline ${!attendance?'selected':''}`} onClick={()=>setAttendance(false)}>× <strong>No podré asistir</strong></button></div>{attendance&&<div className="rsvp-attendee-grid"><label><span>Adultos</span><input type="number" min="0" value={adults} onChange={e=>setAdults(Number(e.target.value))}/></label><label><span>Niños</span><input type="number" min="0" value={children} onChange={e=>setChildren(Number(e.target.value))}/></label></div>}<label className="rsvp-message-field"><span>Mensaje</span><textarea rows={3} value={message} onChange={e=>setMessage(e.target.value)}/></label>{error&&<p className="form-error">{error}</p>}<button className="rsvp-submit">{sectionSetting('rsvp','buttonLabel','Enviar confirmación')}</button></form>}</div></section>:null
    };
    return <div className={`invitation-section-slot section-align-${sectionSetting(sectionId,'alignment','center')}`} data-section={sectionId} key={sectionId}>{sections[sectionId]}</div>;
  })}

  <footer className="premium-footer">
    <span>Gracias por ser parte de este momento</span>
    <strong>{data.invitacion.titulo}</strong>
    <small>Creado con InvitaPro</small>
  </footer>
</main>}
