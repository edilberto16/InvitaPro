'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { messageFromError } from '@/lib/invitapro';

type Settings = {
  nombre_comercial: string;
  correo: string;
  telefono: string;
  zona_horaria: string;
  formato_fecha: string;
  nombre_panel: string;
  logo_url: string;
  favicon_url: string;
  color_principal: string;
  color_secundario: string;
  whatsapp: string;
  mensaje_whatsapp: string;
  mensaje_recordatorio: string;
};

const DEFAULTS: Settings = {
  nombre_comercial: 'InvitaPro', correo: '', telefono: '', zona_horaria: 'America/Mexico_City', formato_fecha: 'dd/MM/yyyy',
  nombre_panel: 'InvitaPro', logo_url: '', favicon_url: '', color_principal: '#6d5dfc', color_secundario: '#111827', whatsapp: '',
  mensaje_whatsapp: 'Hola {invitado}, te compartimos la invitación de {evento}: {enlace}',
  mensaje_recordatorio: 'Hola {invitado}, te recordamos que el evento {evento} está próximo. Consulta tu invitación aquí: {enlace}'
};

export default function Page() {
  const db = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<'general'|'marca'|'whatsapp'>('general');
  const [form, setForm] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true); setError('');
    const { data: auth } = await db.auth.getUser();
    if (!auth.user) { setError('No fue posible identificar al usuario actual.'); setLoading(false); return; }
    const { data, error } = await db.from('configuracion').select('*').eq('owner_id', auth.user.id).maybeSingle();
    if (error) setError(messageFromError(error));
    else if (data) setForm({ ...DEFAULTS, ...data });
    setLoading(false);
  }

  async function save(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(''); setMessage('');
    const { data: auth } = await db.auth.getUser();
    if (!auth.user) { setError('No fue posible identificar al usuario actual.'); setSaving(false); return; }
    const payload = { owner_id: auth.user.id, ...form, updated_at: new Date().toISOString() };
    const { error } = await db.from('configuracion').upsert(payload, { onConflict: 'owner_id' });
    setSaving(false);
    if (error) setError(messageFromError(error));
    else setMessage('Configuración actualizada correctamente.');
  }

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setForm(v => ({ ...v, [key]: value }));

  if (loading) return <div className="dashboard-loading">Cargando configuración…</div>;

  return <div className="page-stack">
    <section className="page-heading"><div><p className="eyebrow">Preferencias</p><h1>Configuración</h1><p>Personaliza los datos generales, la identidad visual y los mensajes de tu negocio.</p></div></section>
    <section className="settings-layout">
      <aside className="settings-tabs">
        <button className={tab==='general'?'active':''} onClick={()=>setTab('general')}><strong>General</strong><span>Datos y preferencias</span></button>
        <button className={tab==='marca'?'active':''} onClick={()=>setTab('marca')}><strong>Marca</strong><span>Logo y colores</span></button>
        <button className={tab==='whatsapp'?'active':''} onClick={()=>setTab('whatsapp')}><strong>WhatsApp</strong><span>Mensajes predeterminados</span></button>
      </aside>
      <form className="panel-card settings-card form" onSubmit={save}>
        {tab==='general'&&<><div className="panel-header"><div><h2>Información general</h2><p>Datos principales que identifican tu negocio.</p></div></div><div className="grid2"><label>Nombre comercial<input value={form.nombre_comercial} onChange={e=>set('nombre_comercial',e.target.value)}/></label><label>Correo de contacto<input type="email" value={form.correo} onChange={e=>set('correo',e.target.value)}/></label></div><div className="grid2"><label>Teléfono<input value={form.telefono} onChange={e=>set('telefono',e.target.value)}/></label><label>Zona horaria<select value={form.zona_horaria} onChange={e=>set('zona_horaria',e.target.value)}><option value="America/Mexico_City">Ciudad de México</option><option value="America/Cancun">Cancún</option><option value="America/Merida">Mérida</option><option value="America/Monterrey">Monterrey</option><option value="America/Tijuana">Tijuana</option></select></label></div><label>Formato de fecha<select value={form.formato_fecha} onChange={e=>set('formato_fecha',e.target.value)}><option value="dd/MM/yyyy">31/12/2026</option><option value="MM/dd/yyyy">12/31/2026</option><option value="yyyy-MM-dd">2026-12-31</option></select></label></>}
        {tab==='marca'&&<><div className="panel-header"><div><h2>Identidad visual</h2><p>Define cómo se presenta tu marca dentro de la plataforma.</p></div></div><div className="grid2"><label>Nombre del panel<input value={form.nombre_panel} onChange={e=>set('nombre_panel',e.target.value)}/></label><label>URL del logotipo<input type="url" placeholder="https://..." value={form.logo_url} onChange={e=>set('logo_url',e.target.value)}/></label></div><label>URL del favicon<input type="url" placeholder="https://..." value={form.favicon_url} onChange={e=>set('favicon_url',e.target.value)}/></label><div className="grid2"><label>Color principal<div className="color-field"><input type="color" value={form.color_principal} onChange={e=>set('color_principal',e.target.value)}/><input value={form.color_principal} onChange={e=>set('color_principal',e.target.value)}/></div></label><label>Color secundario<div className="color-field"><input type="color" value={form.color_secundario} onChange={e=>set('color_secundario',e.target.value)}/><input value={form.color_secundario} onChange={e=>set('color_secundario',e.target.value)}/></div></label></div><div className="brand-preview" style={{'--preview-primary':form.color_principal,'--preview-secondary':form.color_secundario} as React.CSSProperties}><div className="brand-preview-logo">{form.logo_url?<img src={form.logo_url} alt="Logo"/>:<span>{(form.nombre_panel||'IP').slice(0,2).toUpperCase()}</span>}</div><div><small>Vista previa</small><strong>{form.nombre_panel||'InvitaPro'}</strong><p>Panel administrativo</p></div></div></>}
        {tab==='whatsapp'&&<><div className="panel-header"><div><h2>Mensajes de WhatsApp</h2><p>Prepara textos reutilizables para invitaciones y recordatorios.</p></div></div><label>Número predeterminado<input value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)} placeholder="5219990000000"/><small>Incluye código de país y lada, solamente números.</small></label><label>Mensaje para compartir<textarea rows={5} value={form.mensaje_whatsapp} onChange={e=>set('mensaje_whatsapp',e.target.value)}/></label><label>Mensaje de recordatorio<textarea rows={5} value={form.mensaje_recordatorio} onChange={e=>set('mensaje_recordatorio',e.target.value)}/></label><div className="variable-help"><strong>Variables disponibles</strong><span><code>{'{invitado}'}</code><code>{'{evento}'}</code><code>{'{enlace}'}</code></span></div></>}
        {error&&<p className="form-error">{error}</p>}{message&&<p className="form-success">{message}</p>}
        <footer className="settings-actions"><span>Los cambios se aplicarán a las nuevas comunicaciones y preferencias.</span><button className="button button-primary" disabled={saving}>{saving?'Guardando…':'Guardar cambios'}</button></footer>
      </form>
    </section>
  </div>;
}
