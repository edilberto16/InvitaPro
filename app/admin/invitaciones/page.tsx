'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { designValue, Evento, formatDate, initials, Invitacion, messageFromError, slugify } from '@/lib/invitapro';

type FormState={evento_id:string;titulo:string;slug:string;modalidad:Invitacion['modalidad'];estado:Invitacion['estado'];plantilla:string;mensaje:string;subtitulo:string;vestimenta:string;programa:string;color_principal:string;musica_url:string;whatsapp:string;fecha_expiracion:string;mostrar_contador:boolean;mostrar_detalles:boolean;mostrar_programa:boolean;mostrar_mapa:boolean;mostrar_rsvp:boolean};
const EMPTY:FormState={evento_id:'',titulo:'',slug:'',modalidad:'simple',estado:'borrador',plantilla:'elegante',mensaje:'Será un honor contar con tu presencia para celebrar este día tan especial.',subtitulo:'Queremos compartir contigo este momento',vestimenta:'Formal',programa:'18:00 | Recepción\n19:00 | Ceremonia\n20:30 | Cena\n22:00 | Celebración',color_principal:'#8f5c38',musica_url:'',whatsapp:'',fecha_expiracion:'',mostrar_contador:true,mostrar_detalles:true,mostrar_programa:true,mostrar_mapa:true,mostrar_rsvp:true};
const MODALITIES=[
  {id:'simple' as const,icon:'🔗',title:'Solo enlace',tag:'Básica',description:'Una invitación pública lista para compartir por WhatsApp.',features:['Invitación digital','Música, mapa y galería','Sin confirmaciones']},
  {id:'rsvp' as const,icon:'✓',title:'RSVP público',tag:'Popular',description:'Los asistentes confirman desde un formulario abierto.',features:['Todo lo de Solo enlace','Confirmación pública','Lista de respuestas']},
  {id:'pases' as const,icon:'★',title:'Pases personalizados',tag:'Premium',description:'Control individual por persona, pareja o familia.',features:['Códigos privados','Cupos de adultos y niños','Mesa y confirmación individual']}
];

export default function InvitacionesPage(){const supabase=useMemo(()=>createClient(),[]);const[eventos,setEventos]=useState<Evento[]>([]);const[items,setItems]=useState<Invitacion[]>([]);const[loading,setLoading]=useState(true);const[modal,setModal]=useState(false);const[editing,setEditing]=useState<Invitacion|null>(null);const[deleting,setDeleting]=useState<Invitacion|null>(null);const[form,setForm]=useState<FormState>(EMPTY);const[error,setError]=useState('');const[search,setSearch]=useState('');const[filter,setFilter]=useState('todas');const[saving,setSaving]=useState(false);
async function load(){setLoading(true);const[e,i]=await Promise.all([supabase.from('eventos').select('*, clientes(id,nombre)').order('fecha'),supabase.from('invitaciones').select('*, eventos(id,nombre,tipo,fecha,hora,lugar,direccion,maps_url,cliente_id,clientes(id,nombre))').order('created_at',{ascending:false})]);if(e.error)setError(messageFromError(e.error));else setEventos((e.data??[]) as Evento[]);if(i.error)setError(messageFromError(i.error));else setItems((i.data??[]) as Invitacion[]);setLoading(false)}useEffect(()=>{void load()},[]);
function openNew(){const ev=eventos[0];setEditing(null);setForm({...EMPTY,evento_id:ev?.id??'',titulo:ev?.nombre??'',slug:slugify(ev?.nombre??'')});setError('');setModal(true)}function openEdit(x:Invitacion){const d=x.design_json||{};setEditing(x);setForm({evento_id:x.evento_id,titulo:x.titulo,slug:x.slug,modalidad:x.modalidad,estado:x.estado,plantilla:designValue(x,'plantilla','elegante'),mensaje:designValue(x,'mensaje',''),subtitulo:designValue(x,'subtitulo','Queremos compartir contigo este momento'),vestimenta:designValue(x,'vestimenta','Formal'),programa:designValue(x,'programa','18:00 | Recepción\n19:00 | Ceremonia\n20:30 | Cena\n22:00 | Celebración'),color_principal:x.color_principal??'#8f5c38',musica_url:x.musica_url??'',whatsapp:x.whatsapp??'',fecha_expiracion:x.fecha_expiracion?.slice(0,16)??'',mostrar_contador:d.mostrar_contador!==false,mostrar_detalles:d.mostrar_detalles!==false,mostrar_programa:d.mostrar_programa!==false,mostrar_mapa:d.mostrar_mapa!==false,mostrar_rsvp:d.mostrar_rsvp!==false});setError('');setModal(true)}
async function save(e:FormEvent){e.preventDefault();const slug=slugify(form.slug||form.titulo);if(!form.evento_id)return setError('Selecciona un evento.');if(!form.titulo.trim()||!slug)return setError('Título y enlace son obligatorios.');setSaving(true);const design_json={version:2,componentes:[],plantilla:form.plantilla,mensaje:form.mensaje.trim(),subtitulo:form.subtitulo.trim(),vestimenta:form.vestimenta.trim(),programa:form.programa.trim(),mostrar_contador:form.mostrar_contador,mostrar_detalles:form.mostrar_detalles,mostrar_programa:form.mostrar_programa,mostrar_mapa:form.mostrar_mapa,mostrar_rsvp:form.mostrar_rsvp};const payload={evento_id:form.evento_id,titulo:form.titulo.trim(),slug,modalidad:form.modalidad,estado:form.estado,design_json,color_principal:form.color_principal,musica_url:form.musica_url.trim()||null,whatsapp:form.whatsapp.replace(/\D/g,'')||null,fecha_publicacion:form.estado==='publicada'?(editing?.fecha_publicacion??new Date().toISOString()):null,fecha_expiracion:form.fecha_expiracion?new Date(form.fecha_expiracion).toISOString():null};const r=editing?await supabase.from('invitaciones').update(payload).eq('id',editing.id):await supabase.from('invitaciones').insert(payload);setSaving(false);if(r.error)return setError(messageFromError(r.error));setModal(false);await load()}
async function toggle(x:Invitacion){const estado=x.estado==='publicada'?'pausada':'publicada';const r=await supabase.from('invitaciones').update({estado,fecha_publicacion:estado==='publicada'?(x.fecha_publicacion??new Date().toISOString()):x.fecha_publicacion}).eq('id',x.id);if(r.error)setError(messageFromError(r.error));else await load()}
async function remove(){if(!deleting)return;const r=await supabase.from('invitaciones').delete().eq('id',deleting.id);if(r.error)setError(messageFromError(r.error));setDeleting(null);await load()}
const list=useMemo(()=>items.filter(x=>filter==='todas'||x.estado===filter).filter(x=>[x.titulo,x.slug,x.eventos?.nombre,x.eventos?.clientes?.nombre].join(' ').toLowerCase().includes(search.toLowerCase().trim())),[items,filter,search]);
return <div className="page-stack"><section className="page-heading"><div><p className="eyebrow">Constructor digital</p><h1>Invitaciones</h1><p>Los cambios se publican directamente en Supabase.</p></div><button className="button button-primary" onClick={openNew}>+ Nueva invitación</button></section><section className="stats-grid invitation-stats"><article className="stat-card"><span>Total</span><strong>{items.length}</strong><small>En la nube</small></article><article className="stat-card"><span>Publicadas</span><strong>{items.filter(x=>x.estado==='publicada').length}</strong><small>Enlaces activos</small></article><article className="stat-card"><span>Con RSVP</span><strong>{items.filter(x=>x.modalidad!=='simple').length}</strong><small>Reciben respuestas</small></article><article className="stat-card"><span>Eventos</span><strong>{eventos.length}</strong><small>Disponibles</small></article></section><section className="panel-card"><div className="panel-header events-toolbar"><div><h2>Biblioteca de invitaciones</h2><p>Simple, RSVP o pases personalizados.</p></div><div className="events-filters"><label className="search-field"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar invitación"/></label><select className="status-filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="todas">Todos</option><option value="borrador">Borrador</option><option value="publicada">Publicada</option><option value="pausada">Pausada</option><option value="vencida">Vencida</option></select></div></div>{loading?<div className="dashboard-loading">Cargando invitaciones…</div>:list.length===0?<div className="empty-state compact-empty"><div className="empty-icon">✉</div><h2>Sin invitaciones</h2><p>Crea la primera.</p></div>:<div className="table-wrap"><table className="data-table invitation-table"><thead><tr><th>Invitación</th><th>Evento / cliente</th><th>Modalidad</th><th>Estado</th><th>Enlace</th><th>Acciones</th></tr></thead><tbody>{list.map(x=><tr key={x.id}><td><div className="event-name-cell"><span className="event-avatar" style={{background:x.color_principal??'#8f5c38'}}>{initials(x.titulo)}</span><div><strong>{x.titulo}</strong><span>{designValue(x,'plantilla','elegante')}</span></div></div></td><td><strong>{x.eventos?.nombre||'—'}</strong><span>{x.eventos?.clientes?.nombre||'—'} · {formatDate(x.eventos?.fecha)}</span></td><td>{x.modalidad}</td><td><span className={`invite-status invite-status-${x.estado}`}>{x.estado}</span></td><td><code className="slug-code">/invitacion/{x.slug}</code></td><td><div className="row-actions invitation-actions"><Link className="text-button" href={`/invitacion/${x.slug}${x.modalidad==='pases'?'?preview=1':''}`} target="_blank">Vista previa</Link><button className="text-button" onClick={()=>openEdit(x)}>Editar</button><button className="text-button" onClick={()=>toggle(x)}>{x.estado==='publicada'?'Pausar':'Publicar'}</button><button className="text-button danger" onClick={()=>setDeleting(x)}>Eliminar</button></div></td></tr>)}</tbody></table></div>}</section>{error&&!modal&&<p className="form-error">{error}</p>}
{modal&&<div className="modal-backdrop" onMouseDown={()=>setModal(false)}>
  <section className="modal-card invitation-builder-modal" onMouseDown={e=>e.stopPropagation()}>
    <header className="modal-header invitation-builder-header">
      <div>
        <p className="eyebrow">Constructor comercial</p>
        <h2>{editing?'Editar invitación':'Nueva invitación'}</h2>
        <p>Elige la modalidad y configura la experiencia que recibirá tu cliente.</p>
      </div>
      <button type="button" className="modal-close" aria-label="Cerrar" onClick={()=>setModal(false)}>×</button>
    </header>

    <form className="invitation-builder-form" onSubmit={save}>
      <div className="invitation-builder-scroll">
        <section className="invitation-builder-section">
          <div className="invitation-section-heading">
            <span>1</span>
            <div>
              <strong>Tipo de invitación</strong>
              <small>Selecciona el plan adecuado para este evento.</small>
            </div>
          </div>

          <div className="modality-card-grid">
            {MODALITIES.map(option=>{
              const selected=form.modalidad===option.id;
              return <button
                key={option.id}
                type="button"
                className={`modality-card ${selected?'selected':''}`}
                onClick={()=>setForm({...form,modalidad:option.id})}
                aria-pressed={selected}
              >
                <div className="modality-card-top">
                  <span className="modality-icon">{option.icon}</span>
                  <span className="modality-tag">{option.tag}</span>
                </div>
                <strong>{option.title}</strong>
                <p>{option.description}</p>
                <ul>{option.features.map(feature=><li key={feature}>{feature}</li>)}</ul>
                <span className="modality-select-state">{selected?'✓ Seleccionada':'Seleccionar'}</span>
              </button>
            })}
          </div>
        </section>

        <div className="invitation-builder-layout">
          <div className="invitation-builder-fields">
            <section className="invitation-builder-section">
              <div className="invitation-section-heading">
                <span>2</span>
                <div>
                  <strong>Información principal</strong>
                  <small>Define el evento, nombre y enlace público.</small>
                </div>
              </div>

              <div className="invitation-form-grid">
                <label className="form-field">
                  <span>Evento *</span>
                  <select value={form.evento_id} onChange={e=>{const ev=eventos.find(x=>x.id===e.target.value);setForm({...form,evento_id:e.target.value,titulo:form.titulo||ev?.nombre||'',slug:form.slug||slugify(ev?.nombre||'')})}}>
                    <option value="">Selecciona un evento</option>
                    {eventos.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}
                  </select>
                </label>

                <label className="form-field">
                  <span>Estado</span>
                  <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value as Invitacion['estado']})}>
                    <option value="borrador">Borrador</option>
                    <option value="publicada">Publicada</option>
                    <option value="pausada">Pausada</option>
                    <option value="vencida">Vencida</option>
                  </select>
                </label>

                <label className="form-field full-width">
                  <span>Título *</span>
                  <input value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value,slug:editing?form.slug:slugify(e.target.value)})} placeholder="Ej. XV años de Valeria"/>
                </label>

                <label className="form-field full-width">
                  <span>Enlace personalizado *</span>
                  <div className="slug-input builder-slug-input">
                    <span>/invitacion/</span>
                    <input value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})} placeholder="xv-valeria"/>
                  </div>
                </label>
              </div>
            </section>

            <section className="invitation-builder-section">
              <div className="invitation-section-heading">
                <span>3</span>
                <div>
                  <strong>Diseño y contenido</strong>
                  <small>Personaliza el estilo general de la invitación.</small>
                </div>
              </div>

              <div className="invitation-form-grid">
                <label className="form-field">
                  <span>Plantilla</span>
                  <select value={form.plantilla} onChange={e=>setForm({...form,plantilla:e.target.value})}>
                    <option value="elegante">Elegante</option>
                    <option value="minimalista">Minimalista</option>
                    <option value="floral">Floral</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Color principal</span>
                  <div className="color-field builder-color-field">
                    <input type="color" value={form.color_principal} onChange={e=>setForm({...form,color_principal:e.target.value})}/>
                    <input value={form.color_principal} onChange={e=>setForm({...form,color_principal:e.target.value})}/>
                  </div>
                </label>

                <label className="form-field full-width">
                  <span>Mensaje de bienvenida</span>
                  <textarea rows={3} value={form.mensaje} onChange={e=>setForm({...form,mensaje:e.target.value})}/>
                </label>

                <label className="form-field full-width">
                  <span>Título de introducción</span>
                  <input value={form.subtitulo} onChange={e=>setForm({...form,subtitulo:e.target.value})} placeholder="Queremos compartir contigo este momento"/>
                </label>

                <label className="form-field full-width">
                  <span>Programa del evento</span>
                  <textarea rows={4} value={form.programa} onChange={e=>setForm({...form,programa:e.target.value})} placeholder={'18:00 | Recepción\n19:00 | Ceremonia'}/>
                  <small>Escribe un horario por línea usando: hora | actividad.</small>
                </label>

                <label className="form-field">
                  <span>Código de vestimenta</span>
                  <input value={form.vestimenta} onChange={e=>setForm({...form,vestimenta:e.target.value})}/>
                </label>

                <label className="form-field">
                  <span>WhatsApp del anfitrión</span>
                  <input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="5219991234567"/>
                </label>

                <label className="form-field">
                  <span>Música URL</span>
                  <input type="url" value={form.musica_url} onChange={e=>setForm({...form,musica_url:e.target.value})} placeholder="https://..."/>
                </label>

                <label className="form-field">
                  <span>Fecha de expiración</span>
                  <input type="datetime-local" value={form.fecha_expiracion} onChange={e=>setForm({...form,fecha_expiracion:e.target.value})}/>
                </label>
              </div>

              <div className="block-config-panel">
                <div className="block-config-heading">
                  <strong>Secciones visibles</strong>
                  <span>Activa únicamente lo que necesita esta invitación.</span>
                </div>
                <div className="block-toggle-grid">
                  {[
                    ['mostrar_contador','Cuenta regresiva'],
                    ['mostrar_detalles','Fecha, lugar y vestimenta'],
                    ['mostrar_programa','Programa del evento'],
                    ['mostrar_mapa','Ubicación y contacto'],
                    ['mostrar_rsvp','Confirmación RSVP']
                  ].map(([key,label])=><label className="block-toggle" key={key}>
                    <input
                      type="checkbox"
                      checked={Boolean(form[key as keyof FormState])}
                      disabled={key==='mostrar_rsvp'&&form.modalidad==='simple'}
                      onChange={e=>setForm({...form,[key]:e.target.checked})}
                    />
                    <span><strong>{label}</strong><small>{key==='mostrar_rsvp'&&form.modalidad==='simple'?'No disponible en Solo enlace':'Mostrar en la página pública'}</small></span>
                  </label>)}
                </div>
              </div>

              {form.modalidad==='rsvp'&&<div className="modality-note">
                <span>✓</span>
                <div><strong>RSVP público activado</strong><p>Cualquier persona con el enlace podrá escribir su nombre y confirmar asistencia.</p></div>
              </div>}

              {form.modalidad==='pases'&&<div className="modality-note premium">
                <span>★</span>
                <div><strong>Pases personalizados activados</strong><p>Después de guardar, asigna familias, cupos, códigos y mesas desde el módulo Invitados.</p></div>
              </div>}
            </section>
          </div>

          <aside className="invitation-live-preview">
            <div className="preview-label-row">
              <span>Vista previa</span>
              <small>Celular</small>
            </div>
            <div className="preview-phone">
              <div className="preview-phone-notch"/>
              <div className="preview-cover" style={{background:`linear-gradient(160deg, ${form.color_principal}, #211913)`}}>
                <span className="preview-template">{form.plantilla}</span>
                <div>
                  <small>Estás invitado a</small>
                  <h3>{form.titulo||'Tu evento especial'}</h3>
                  <p><strong>{form.subtitulo||'Queremos compartir contigo este momento'}</strong></p>
                  <p>{form.mensaje||'Será un honor contar con tu presencia.'}</p>
                </div>
              </div>
              <div className="preview-details">
                <div><span>Modalidad</span><strong>{MODALITIES.find(x=>x.id===form.modalidad)?.title}</strong></div>
                <div><span>Vestimenta</span><strong>{form.vestimenta||'Por definir'}</strong></div>
                <div className="preview-link"><span>Enlace</span><code>/invitacion/{form.slug||'tu-evento'}</code></div>
                {form.modalidad!=='simple'&&<button type="button" style={{background:form.color_principal}}>Confirmar asistencia</button>}
              </div>
            </div>
            <p className="preview-help">La vista final incluirá fecha, ubicación, música, galería y demás bloques configurados.</p>
          </aside>
        </div>

        {error&&<p className="form-error">{error}</p>}
      </div>

      <footer className="invitation-builder-footer">
        <div>
          <strong>{MODALITIES.find(x=>x.id===form.modalidad)?.title}</strong>
          <span>{form.estado==='publicada'?'Se publicará al guardar':'Se guardará como '+form.estado}</span>
        </div>
        <div>
          <button type="button" className="button button-ghost" onClick={()=>setModal(false)}>Cancelar</button>
          <button className="button button-primary" disabled={saving}>{saving?'Guardando…':editing?'Guardar cambios':'Crear invitación'}</button>
        </div>
      </footer>
    </form>
  </section>
</div>}

{deleting&&<div className="modal-backdrop delete-backdrop"><section className="delete-modal"><div className="delete-icon">✕</div><div className="delete-heading"><h2>Eliminar invitación</h2><p>{deleting.titulo}</p></div><div className="delete-warning"><strong>Importante</strong><p>Se eliminarán también pases y respuestas asociadas.</p></div><div className="delete-actions"><button className="button button-outline" onClick={()=>setDeleting(null)}>Cancelar</button><button className="button button-danger" onClick={remove}>Sí, eliminar</button></div></section></div>}</div>}
