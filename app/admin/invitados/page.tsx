'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ShareInvitationModal from '@/components/share-invitation-modal';
import { initials, Invitacion, Invitado, messageFromError, randomCode } from '@/lib/invitapro';
type GuestForm={invitacion_id:string;nombre:string;telefono:string;correo:string;adultos_permitidos:number;ninos_permitidos:number;mesa:string;codigo:string;estado:Invitado['estado'];notas:string};
const EMPTY:GuestForm={invitacion_id:'',nombre:'',telefono:'',correo:'',adultos_permitidos:1,ninos_permitidos:0,mesa:'',codigo:'',estado:'pendiente',notas:''};
export default function InvitadosPage(){const supabase=useMemo(()=>createClient(),[]);const[inv,setInv]=useState<Invitacion[]>([]);const[items,setItems]=useState<Invitado[]>([]);const[loading,setLoading]=useState(true);const[modal,setModal]=useState(false);const[editing,setEditing]=useState<Invitado|null>(null);const[deleting,setDeleting]=useState<Invitado|null>(null);const[form,setForm]=useState(EMPTY);const[error,setError]=useState('');const[search,setSearch]=useState('');const[filter,setFilter]=useState('todas');const[saving,setSaving]=useState(false);const[sharing,setSharing]=useState<Invitado|null>(null);
async function load(){setLoading(true);const[a,b]=await Promise.all([supabase.from('invitaciones').select('*').eq('modalidad','pases').order('titulo'),supabase.from('invitados').select('*, invitaciones(id,titulo,slug,estado)').order('created_at',{ascending:false})]);if(a.error)setError(messageFromError(a.error));else setInv((a.data??[]) as Invitacion[]);if(b.error)setError(messageFromError(b.error));else setItems((b.data??[]) as Invitado[]);setLoading(false)}useEffect(()=>{void load()},[]);
function openNew(){setEditing(null);setForm({...EMPTY,invitacion_id:inv[0]?.id??'',codigo:randomCode()});setError('');setModal(true)}function openEdit(x:Invitado){setEditing(x);setForm({invitacion_id:x.invitacion_id,nombre:x.nombre,telefono:x.telefono??'',correo:x.correo??'',adultos_permitidos:x.adultos_permitidos,ninos_permitidos:x.ninos_permitidos,mesa:x.mesa??'',codigo:x.codigo,estado:x.estado,notas:x.notas??''});setError('');setModal(true)}
async function save(e:FormEvent){e.preventDefault();if(!form.invitacion_id||!form.nombre.trim())return setError('Invitación y nombre son obligatorios.');if(form.adultos_permitidos+form.ninos_permitidos<1)return setError('Asigna al menos un lugar.');setSaving(true);const payload={...form,nombre:form.nombre.trim(),telefono:form.telefono.trim()||null,correo:form.correo.trim()||null,mesa:form.mesa.trim()||null,codigo:form.codigo.trim().toUpperCase(),notas:form.notas.trim()||null};const r=editing?await supabase.from('invitados').update(payload).eq('id',editing.id):await supabase.from('invitados').insert(payload);setSaving(false);if(r.error)return setError(messageFromError(r.error));setModal(false);await load()}
async function remove(){if(!deleting)return;const r=await supabase.from('invitados').delete().eq('id',deleting.id);if(r.error)setError(messageFromError(r.error));setDeleting(null);await load()}
const list=useMemo(()=>items.filter(x=>filter==='todas'||x.estado===filter).filter(x=>[x.nombre,x.codigo,x.telefono,x.invitaciones?.titulo].join(' ').toLowerCase().includes(search.toLowerCase().trim())),[items,filter,search]);const passes=items.reduce((s,x)=>s+x.adultos_permitidos+x.ninos_permitidos,0);
return <div className="page-stack"><section className="page-heading"><div><p className="eyebrow">Control de acceso</p><h1>Invitados y pases</h1><p>Administra los invitados y sus pases personalizados.</p></div><button className="button button-primary" onClick={openNew}>+ Nuevo invitado</button></section><section className="stats-grid guest-stats"><article className="stat-card"><span>Registros</span><strong>{items.length}</strong><small>Familias o invitados</small></article><article className="stat-card"><span>Pases asignados</span><strong>{passes}</strong><small>Adultos y niños</small></article><article className="stat-card"><span>Confirmados</span><strong>{items.filter(x=>x.estado==='confirmado').length}</strong><small>Respondieron sí</small></article><article className="stat-card"><span>Pendientes</span><strong>{items.filter(x=>x.estado==='pendiente').length}</strong><small>Sin respuesta</small></article></section><section className="panel-card"><div className="panel-header events-toolbar"><div><h2>Lista de invitados</h2><p>Genera enlaces privados.</p></div><div className="events-filters"><label className="search-field"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar invitado o código"/></label><select className="status-filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="todas">Todos</option><option value="pendiente">Pendiente</option><option value="confirmado">Confirmado</option><option value="no_asistira">No asistirá</option></select></div></div>{loading?<div className="dashboard-loading">Cargando invitados…</div>:list.length===0?<div className="empty-state compact-empty"><div className="empty-icon">♚</div><h2>Sin invitados</h2><p>Necesitas una invitación con modalidad pases.</p></div>:<div className="table-wrap"><table className="data-table"><thead><tr><th>Invitado</th><th>Invitación</th><th>Pases</th><th>Mesa</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{list.map(x=><tr key={x.id}><td><div className="client-name-cell"><span className="client-avatar">{initials(x.nombre)}</span><div><strong>{x.nombre}</strong><span>{x.codigo}</span></div></div></td><td>{x.invitaciones?.titulo||'—'}</td><td>{x.adultos_permitidos} adultos · {x.ninos_permitidos} niños</td><td>{x.mesa||'—'}</td><td><span className={`badge ${x.estado==='confirmado'?'badge-success':'badge-neutral'}`}>{x.estado}</span></td><td><div className="row-actions guest-row-actions"><Link className="text-button" target="_blank" href={`/invitacion/${x.invitaciones?.slug}/${x.codigo}`}>Vista previa</Link><button className="text-button share-action" onClick={()=>setSharing(x)}>Compartir</button><button className="text-button" onClick={()=>openEdit(x)}>Editar</button><button className="text-button danger" onClick={()=>setDeleting(x)}>Eliminar</button></div></td></tr>)}</tbody></table></div>}</section>{error&&!modal&&<p className="form-error">{error}</p>}
{modal&&<div className="modal-backdrop" onMouseDown={()=>setModal(false)}>
  <section className="modal-card guest-form-modal" onMouseDown={e=>e.stopPropagation()}>
    <header className="modal-header">
      <div>
        <p className="eyebrow">Pase personalizado</p>
        <h2>{editing?'Editar invitado':'Nuevo invitado'}</h2>
        <p>Asigna los datos de contacto, lugares disponibles y código privado del pase.</p>
      </div>
      <button type="button" className="modal-close" aria-label="Cerrar" onClick={()=>setModal(false)}>×</button>
    </header>

    <form className="guest-form-redesign" onSubmit={save}>
      <div className="guest-form-scroll">
        <section className="guest-form-section">
          <div className="guest-form-section-title">
            <span>1</span>
            <div>
              <strong>Datos del invitado</strong>
              <small>Selecciona la invitación e identifica a la persona, pareja o familia.</small>
            </div>
          </div>

          <div className="guest-form-grid">
            <label className="form-field" style={{gridColumn:'1 / -1'}}>
              <span>Invitación *</span>
              <select value={form.invitacion_id} onChange={e=>setForm({...form,invitacion_id:e.target.value})}>
                <option value="">Selecciona una invitación</option>
                {inv.map(x=><option key={x.id} value={x.id}>{x.titulo} · {x.estado}</option>)}
              </select>
            </label>

            <label className="form-field" style={{gridColumn:'1 / -1'}}>
              <span>Nombre o familia *</span>
              <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej. Familia López García"/>
            </label>

            <label className="form-field">
              <span>Teléfono</span>
              <input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})} placeholder="999 123 4567"/>
            </label>

            <label className="form-field">
              <span>Correo electrónico</span>
              <input type="email" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})} placeholder="familia@ejemplo.com"/>
            </label>
          </div>
        </section>

        <section className="guest-form-section">
          <div className="guest-form-section-title">
            <span>2</span>
            <div>
              <strong>Lugares y organización</strong>
              <small>Define cuántos lugares incluye el pase y la mesa asignada.</small>
            </div>
          </div>

          <div className="guest-form-grid guest-form-grid-compact">
            <label className="form-field">
              <span>Adultos</span>
              <input type="number" min="0" value={form.adultos_permitidos} onChange={e=>setForm({...form,adultos_permitidos:Number(e.target.value)})}/>
            </label>
            <label className="form-field">
              <span>Niños</span>
              <input type="number" min="0" value={form.ninos_permitidos} onChange={e=>setForm({...form,ninos_permitidos:Number(e.target.value)})}/>
            </label>
            <label className="form-field">
              <span>Mesa</span>
              <input value={form.mesa} onChange={e=>setForm({...form,mesa:e.target.value})} placeholder="Ej. Mesa 8"/>
            </label>
            <label className="form-field">
              <span>Estado</span>
              <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value as Invitado['estado']})}>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="no_asistira">No asistirá</option>
              </select>
            </label>
          </div>
        </section>

        <section className="guest-form-section">
          <div className="guest-form-section-title">
            <span>3</span>
            <div>
              <strong>Acceso personalizado</strong>
              <small>El código formará parte del enlace privado del invitado.</small>
            </div>
          </div>

          <div className="guest-form-grid">
            <label className="form-field" style={{gridColumn:'1 / -1'}}>
              <span>Código del pase *</span>
              <div className="code-generator">
                <input value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value.toUpperCase()})}/>
                <button type="button" className="button button-outline" onClick={()=>setForm({...form,codigo:randomCode()})}>Generar otro</button>
              </div>
              <small>Evita nombres, teléfonos u otros datos personales.</small>
            </label>

            <label className="form-field" style={{gridColumn:'1 / -1'}}>
              <span>Notas internas</span>
              <textarea rows={3} value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} placeholder="Preferencias, parentesco o indicaciones especiales…"/>
            </label>
          </div>
        </section>

        {error&&<p className="form-error">{error}</p>}
      </div>

      <footer className="guest-form-footer">
        <button type="button" className="button button-ghost" onClick={()=>setModal(false)}>Cancelar</button>
        <button className="button button-primary" disabled={saving}>{saving?'Guardando…':editing?'Guardar cambios':'Crear pase'}</button>
      </footer>
    </form>
  </section>
</div>}
{sharing&&<ShareInvitationModal
  open={Boolean(sharing)}
  onClose={()=>setSharing(null)}
  title={sharing.invitaciones?.titulo||'Invitación'}
  recipient={sharing.nombre}
  phone={sharing.telefono}
  path={`/invitacion/${sharing.invitaciones?.slug}/${sharing.codigo}`}
  personalized
/>}
{deleting&&<div className="modal-backdrop delete-backdrop"><section className="delete-modal"><div className="delete-icon">✕</div><div className="delete-heading"><h2>Eliminar pase</h2><p>{deleting.nombre}</p></div><div className="delete-warning"><strong>Importante</strong><p>También se eliminará su confirmación.</p></div><div className="delete-actions"><button className="button button-outline" onClick={()=>setDeleting(null)}>Cancelar</button><button className="button button-danger" onClick={remove}>Sí, eliminar</button></div></section></div>}</div>}
