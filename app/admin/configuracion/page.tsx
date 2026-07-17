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

type SettingsTab = 'general' | 'marca' | 'whatsapp';

const DEFAULTS: Settings = {
  nombre_comercial: 'InvitaPro',
  correo: '',
  telefono: '',
  zona_horaria: 'America/Mexico_City',
  formato_fecha: 'dd/MM/yyyy',
  nombre_panel: 'InvitaPro',
  logo_url: '',
  favicon_url: '',
  color_principal: '#9b6039',
  color_secundario: '#222033',
  whatsapp: '',
  mensaje_whatsapp: 'Hola {invitado}, te compartimos la invitación de {evento}: {enlace}',
  mensaje_recordatorio: 'Hola {invitado}, te recordamos que el evento {evento} está próximo. Consulta tu invitación aquí: {enlace}',
};

const TABS: Array<{ id: SettingsTab; icon: string; title: string; description: string; tone: string }> = [
  { id: 'general', icon: '⚙', title: 'General', description: 'Datos y preferencias', tone: 'brown' },
  { id: 'marca', icon: '◉', title: 'Marca', description: 'Logo y colores', tone: 'purple' },
  { id: 'whatsapp', icon: '◔', title: 'WhatsApp', description: 'Mensajes predeterminados', tone: 'green' },
];

export default function Page() {
  const db = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<SettingsTab>('general');
  const [form, setForm] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    const { data: auth } = await db.auth.getUser();
    if (!auth.user) {
      setError('No fue posible identificar al usuario actual.');
      setLoading(false);
      return;
    }

    const { data, error: loadError } = await db
      .from('configuracion')
      .select('*')
      .eq('owner_id', auth.user.id)
      .maybeSingle();

    if (loadError) setError(messageFromError(loadError));
    else if (data) setForm({ ...DEFAULTS, ...data });
    setLoading(false);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const { data: auth } = await db.auth.getUser();
    if (!auth.user) {
      setError('No fue posible identificar al usuario actual.');
      setSaving(false);
      return;
    }

    const payload = { owner_id: auth.user.id, ...form, updated_at: new Date().toISOString() };
    const { error: saveError } = await db.from('configuracion').upsert(payload, { onConflict: 'owner_id' });
    setSaving(false);

    if (saveError) setError(messageFromError(saveError));
    else setMessage('Configuración actualizada correctamente.');
  }

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  if (loading) return <div className="dashboard-loading">Cargando configuración…</div>;

  return (
    <div className="page-stack settings-page">
      <section className="page-heading settings-page-heading">
        <div>
          <p className="eyebrow">Preferencias</p>
          <h1>Configuración</h1>
          <p>Personaliza los datos generales, la identidad visual y los mensajes de tu negocio.</p>
        </div>
      </section>

      <section className="settings-layout">
        <aside className="settings-tabs" aria-label="Secciones de configuración">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
            >
              <span className={`settings-tab-icon settings-tab-icon-${item.tone}`} aria-hidden="true">{item.icon}</span>
              <span className="settings-tab-copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
            </button>
          ))}
        </aside>

        <form className="panel-card settings-card" onSubmit={save}>
          {tab === 'general' && (
            <>
              <header className="settings-card-header">
                <h2>Información general</h2>
                <p>Datos principales que identifican tu negocio.</p>
              </header>
              <div className="settings-grid">
                <label>
                  Nombre comercial
                  <input value={form.nombre_comercial} onChange={(e) => set('nombre_comercial', e.target.value)} />
                </label>
                <label>
                  Correo de contacto
                  <input type="email" value={form.correo} onChange={(e) => set('correo', e.target.value)} />
                </label>
                <label>
                  Teléfono
                  <input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
                </label>
                <label>
                  Zona horaria
                  <select value={form.zona_horaria} onChange={(e) => set('zona_horaria', e.target.value)}>
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/Cancun">Cancún</option>
                    <option value="America/Merida">Mérida</option>
                    <option value="America/Monterrey">Monterrey</option>
                    <option value="America/Tijuana">Tijuana</option>
                  </select>
                </label>
                <label className="settings-field-full">
                  Formato de fecha
                  <select value={form.formato_fecha} onChange={(e) => set('formato_fecha', e.target.value)}>
                    <option value="dd/MM/yyyy">31/12/2026</option>
                    <option value="MM/dd/yyyy">12/31/2026</option>
                    <option value="yyyy-MM-dd">2026-12-31</option>
                  </select>
                </label>
              </div>
            </>
          )}

          {tab === 'marca' && (
            <>
              <header className="settings-card-header">
                <h2>Identidad visual</h2>
                <p>Define cómo se presenta tu marca dentro de la plataforma.</p>
              </header>
              <div className="brand-settings">
                <div className="settings-grid single">
                  <label>
                    Nombre del panel
                    <input value={form.nombre_panel} onChange={(e) => set('nombre_panel', e.target.value)} />
                  </label>
                  <label>
                    URL del logotipo
                    <input type="url" placeholder="https://..." value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} />
                  </label>
                  <label>
                    URL del favicon
                    <input type="url" placeholder="https://..." value={form.favicon_url} onChange={(e) => set('favicon_url', e.target.value)} />
                  </label>
                  <label>
                    Color principal
                    <span className="color-input">
                      <input type="color" value={form.color_principal} onChange={(e) => set('color_principal', e.target.value)} />
                      <input value={form.color_principal} onChange={(e) => set('color_principal', e.target.value)} />
                    </span>
                  </label>
                  <label>
                    Color secundario
                    <span className="color-input">
                      <input type="color" value={form.color_secundario} onChange={(e) => set('color_secundario', e.target.value)} />
                      <input value={form.color_secundario} onChange={(e) => set('color_secundario', e.target.value)} />
                    </span>
                  </label>
                </div>
                <div
                  className="brand-preview"
                  style={{ background: `linear-gradient(145deg, ${form.color_principal}, ${form.color_secundario})` }}
                >
                  <span>Vista previa</span>
                  {form.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logo_url} alt="Logotipo configurado" />
                  ) : (
                    <div className="brand-preview-mark">{(form.nombre_panel || 'IP').slice(0, 2).toUpperCase()}</div>
                  )}
                  <strong>{form.nombre_panel || 'InvitaPro'}</strong>
                  <small>Panel administrativo</small>
                </div>
              </div>
            </>
          )}

          {tab === 'whatsapp' && (
            <>
              <header className="settings-card-header">
                <h2>Mensajes de WhatsApp</h2>
                <p>Prepara textos reutilizables para invitaciones y recordatorios.</p>
              </header>
              <div className="settings-grid single">
                <label>
                  Número predeterminado
                  <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="5219990000000" />
                  <small>Incluye código de país y lada, solamente números.</small>
                </label>
                <label>
                  Mensaje para compartir
                  <textarea rows={5} value={form.mensaje_whatsapp} onChange={(e) => set('mensaje_whatsapp', e.target.value)} />
                </label>
                <label>
                  Mensaje de recordatorio
                  <textarea rows={5} value={form.mensaje_recordatorio} onChange={(e) => set('mensaje_recordatorio', e.target.value)} />
                </label>
                <div className="variable-chips">
                  <span>Variables disponibles:</span>
                  <code>{'{invitado}'}</code>
                  <code>{'{evento}'}</code>
                  <code>{'{enlace}'}</code>
                </div>
              </div>
            </>
          )}

          {(error || message) && (
            <div className="settings-feedback">
              {error && <p className="form-error">{error}</p>}
              {message && <p className="form-success">{message}</p>}
            </div>
          )}

          <footer className="settings-actions">
            <div className="settings-note"><span aria-hidden="true">i</span><p>Los cambios se aplicarán a las nuevas comunicaciones y preferencias.</p></div>
            <button className="button button-primary settings-save" disabled={saving}>
              <span aria-hidden="true">▣</span>{saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
