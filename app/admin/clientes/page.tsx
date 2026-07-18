'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Cliente, initials, messageFromError } from '@/lib/invitapro';
import { useCurrentUser } from '@/lib/use-current-user';
import { EditActionIcon, TrashActionIcon } from '@/components/admin/action-icons';
import { ActionButton, ActionGroup, EmptyState, StatusBadge } from '@/components/admin/admin-ui';

type ClientForm={nombre:string;empresa:string;telefono:string;correo:string;direccion:string;notas:string;estado:'activo'|'inactivo'};
const EMPTY:ClientForm = { nombre: '', empresa: '', telefono: '', correo: '', direccion: '', notas: '', estado: 'activo' };
function etapaCliente(c: Cliente) {
  return ((c as Cliente & { etapa_comercial?: string | null }).etapa_comercial ?? (c.user_id ? 'cliente' : 'prospecto'));
}

export default function ClientesPage() {
  const supabase = useMemo(() => createClient(), []);
  const { userId } = useCurrentUser();
  const [clientes, setClientes] = useState<Cliente[]>([]); const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState(''); const [modal, setModal] = useState(false); const [editing, setEditing] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState<Cliente | null>(null); const [form, setForm] = useState(EMPTY); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [accessClient, setAccessClient] = useState<Cliente | null>(null);
  const [accessBusy, setAccessBusy] = useState(false);
  const [accessResult, setAccessResult] = useState<{status:string;message:string;email?:string}|null>(null);
  async function load() { setLoading(true); const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false }); if (error) setError(messageFromError(error)); else setClientes((data ?? []) as Cliente[]); setLoading(false); }
  useEffect(() => { void load(); }, []);
  function openNew() { setEditing(null); setForm(EMPTY); setError(''); setModal(true); }
  function openEdit(c: Cliente) { setEditing(c); setForm({ nombre:c.nombre, empresa:c.empresa??'', telefono:c.telefono??'', correo:c.correo??'', direccion:c.direccion??'', notas:c.notas??'', estado:c.estado }); setError(''); setModal(true); }
  async function save(e: FormEvent) { e.preventDefault(); if (!userId) return setError('No hay una sesión válida.'); if (!form.nombre.trim()) return setError('El nombre es obligatorio.'); if (form.correo && !/^\S+@\S+\.\S+$/.test(form.correo)) return setError('Escribe un correo válido.'); setSaving(true); setError(''); const payload={ nombre:form.nombre.trim(), empresa:form.empresa.trim()||null, telefono:form.telefono.trim()||null, correo:form.correo.trim()||null, direccion:form.direccion.trim()||null, notas:form.notas.trim()||null, estado:form.estado };
    const result = editing ? await supabase.from('clientes').update(payload).eq('id', editing.id) : await supabase.from('clientes').insert({ ...payload, owner_id:userId });
    setSaving(false); if (result.error) return setError(messageFromError(result.error)); setModal(false); await load(); }
  async function remove() { if (!deleting) return; const { error } = await supabase.from('clientes').delete().eq('id', deleting.id); if (error) { setError(messageFromError(error)); setDeleting(null); return; } setDeleting(null); await load(); }
  async function activateAccess() {
    if (!accessClient) return;
    if (!accessClient.correo) {
      setAccessResult({ status:'error', message:'Este cliente no tiene correo electrónico. Agrégalo antes de activar el acceso.' });
      return;
    }
    setAccessBusy(true); setAccessResult(null);
    const { data, error } = await supabase.rpc('activar_acceso_cliente', { p_cliente_id: accessClient.id });
    setAccessBusy(false);
    if (error) {
      setAccessResult({ status:'error', message:messageFromError(error) });
      return;
    }
    const result=(data ?? {}) as {status?:string;message?:string;email?:string};
    setAccessResult({status:result.status??'error',message:result.message??'No fue posible activar el acceso.',email:result.email});
    if (result.status==='activated' || result.status==='already_active') await load();
  }
  function openAccess(c: Cliente) {
    setAccessClient(c); setAccessResult(null); setError('');
  }
  const filtered=useMemo(()=>{const q=busqueda.toLowerCase().trim(); return q?clientes.filter(c=>[c.nombre,c.empresa,c.telefono,c.correo].join(' ').toLowerCase().includes(q)):clientes;},[clientes,busqueda]);
  return <div className="page-stack">
    <section className="page-heading"><div><p className="eyebrow">Gestión comercial</p><h1>Clientes</h1><p>Administra la información y el seguimiento de tus clientes.</p></div><button className="button button-primary" onClick={openNew}>+ Nuevo cliente</button></section>
    <section className="stats-grid clients-stats"><article className="stat-card"><span>Total</span><strong>{clientes.length}</strong><small>Registrados</small></article><article className="stat-card"><span>Prospectos</span><strong>{clientes.filter(c=>etapaCliente(c)==='prospecto').length}</strong><small>Registrados desde la web</small></article><article className="stat-card"><span>Con acceso</span><strong>{clientes.filter(c=>c.user_id).length}</strong><small>Mi InvitaPro activo</small></article></section>
    <section className="panel-card"><div className="panel-header client-toolbar"><div><h2>Directorio de clientes</h2><p>Alta, edición y eliminación en tiempo real.</p></div><label className="search-field"><span>⌕</span><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar cliente" /></label></div>
      {loading?<div className="dashboard-loading">Cargando clientes…</div>:filtered.length===0?<EmptyState icon="+" title="Sin clientes" description="Crea el primer registro." />:<div className="table-wrap"><table className="data-table clients-table centered-data-table"><thead><tr><th>Cliente</th><th className="table-center">Teléfono</th><th className="table-center">Correo</th><th className="table-center">Estado</th><th className="table-center">Acciones</th></tr></thead><tbody>{filtered.map(c=><tr key={c.id}><td><div className="client-name-cell"><span className="client-avatar">{initials(c.nombre)}</span><div><strong>{c.nombre}</strong><span>{c.empresa||c.notas||'Sin notas'} · {etapaCliente(c)==='prospecto'?'Prospecto':'Cliente'}</span></div></div></td><td className="table-center">{c.telefono||'—'}</td><td className="table-center">{c.correo||'—'}</td><td className="table-center"><StatusBadge tone={c.estado==='activo'?'success':'neutral'}>{c.estado}</StatusBadge></td><td className="table-center"><ActionGroup><button type="button" className={c.user_id?'button button-ghost':'button button-primary'} style={{padding:'8px 11px',fontSize:12}} onClick={()=>openAccess(c)}>{c.user_id?'Acceso activo':'Dar acceso'}</button><ActionButton tone="edit" icon={<EditActionIcon/>} onClick={()=>openEdit(c)}>Editar</ActionButton><ActionButton tone="delete" icon={<TrashActionIcon/>} onClick={()=>setDeleting(c)}>Eliminar</ActionButton></ActionGroup></td></tr>)}</tbody></table></div>}
    </section>
    {error&&!modal&&<p className="form-error">{error}</p>}
    {modal&&<div className="modal-backdrop" onMouseDown={()=>setModal(false)}><section className="modal-card" onMouseDown={e=>e.stopPropagation()}><header className="modal-header"><div><p className="eyebrow">Cliente</p><h2>{editing?'Editar cliente':'Nuevo cliente'}</h2></div><button className="modal-close" onClick={()=>setModal(false)}>×</button></header><form className="form" onSubmit={save}><div className="grid2"><label>Nombre *<input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></label><label>Empresa<input value={form.empresa} onChange={e=>setForm({...form,empresa:e.target.value})}/></label></div><div className="grid2"><label>Teléfono<input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></label><label>Correo<input type="email" value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})}/></label></div><label>Dirección<input value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})}/></label><label>Notas<textarea rows={3} value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})}/></label><label>Estado<select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value as 'activo'|'inactivo'})}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>{error&&<p className="form-error">{error}</p>}<footer className="modal-actions"><button type="button" className="button button-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving?'Guardando…':'Guardar'}</button></footer></form></section></div>}
    {accessClient&&<div className="modal-backdrop" onMouseDown={()=>setAccessClient(null)}><section className="modal-card" onMouseDown={e=>e.stopPropagation()}><header className="modal-header"><div><p className="eyebrow">Mi InvitaPro</p><h2>{accessClient.user_id?'Acceso del cliente':'Dar acceso al cliente'}</h2></div><button className="modal-close" onClick={()=>setAccessClient(null)}>×</button></header><div className="form">
      <div className="delete-client-summary"><span className="client-avatar">{initials(accessClient.nombre)}</span><div className="delete-client-details"><strong>{accessClient.nombre}</strong><span>{accessClient.correo||'Sin correo registrado'}</span></div></div>
      {accessClient.user_id&&!accessResult?<div className="delete-warning" style={{background:'#effaf3'}}><strong>Acceso activo ✓</strong><p>Este cliente ya tiene una cuenta vinculada y puede entrar a Mi InvitaPro.</p></div>:null}
      {!accessClient.user_id&&!accessResult?<><div className="delete-warning"><strong>¿Cómo funciona?</strong><p>InvitaPro buscará una cuenta registrada con el mismo correo del cliente. Si existe, la vinculará de forma segura y sus eventos aparecerán automáticamente en Mi InvitaPro.</p></div><p style={{fontSize:14,color:'#6b6270'}}>Si todavía no tiene cuenta, pídele que se registre usando exactamente <strong>{accessClient.correo||'su correo registrado'}</strong>.</p></>:null}
      {accessResult&&<div className="delete-warning" style={{background:accessResult.status==='activated'||accessResult.status==='already_active'?'#effaf3':'#fff6e8'}}><strong>{accessResult.status==='activated'?'Acceso activado ✓':accessResult.status==='already_active'?'Acceso ya activo':accessResult.status==='account_not_found'?'Cuenta aún no registrada':'No se pudo activar'}</strong><p>{accessResult.message}</p></div>}
      <footer className="modal-actions"><button type="button" className="button button-ghost" onClick={()=>setAccessClient(null)}>Cerrar</button>{!accessClient.user_id&&<button type="button" className="button button-primary" disabled={accessBusy||!accessClient.correo} onClick={activateAccess}>{accessBusy?'Buscando cuenta…':'Activar Mi InvitaPro'}</button>}</footer>
    </div></section></div>}
    {deleting&&<div className="modal-backdrop delete-backdrop"><section className="delete-modal"><div className="delete-icon">✕</div><div className="delete-heading"><h2>Eliminar cliente</h2><p>Esta acción eliminará el cliente de forma permanente.</p></div><div className="delete-client-summary"><span className="client-avatar delete-avatar">{initials(deleting.nombre)}</span><div className="delete-client-details"><strong>{deleting.nombre}</strong><span>{deleting.correo||deleting.telefono||'Sin contacto'}</span></div></div><div className="delete-warning"><strong>Importante</strong><p>Si tiene eventos relacionados, primero deberás eliminarlos o reasignarlos.</p></div><div className="delete-actions"><button className="button button-outline" onClick={()=>setDeleting(null)}>Cancelar</button><button className="button button-danger" onClick={remove}>Sí, eliminar</button></div></section></div>}
  </div>;
}
