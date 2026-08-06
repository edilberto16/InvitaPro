"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { AccountAvatar, PRESET_AVATARS, presetAvatarValue } from "@/components/account/avatar";

type Props = {
  name: string;
  avatarUrl?: string | null;
  invitationId?: string | null;
  invitationTitle?: string | null;
  onProfileUpdated: (profile: { name: string; avatarUrl: string | null }) => void;
  onEventDeleted: () => void;
};

export default function ProfileMenu({ name, avatarUrl, invitationId, invitationTitle, onProfileUpdated, onEventDeleted }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function saveProfile() {
    const clean = draftName.trim();
    if (!clean) return setError("Escribe tu nombre.");
    setSaving(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return setError("Sesión no válida."); }
    const { error: updateError } = await supabase.from("profiles").update({ nombre: clean }).eq("id", user.id);
    setSaving(false);
    if (updateError) return setError(updateError.message);
    onProfileUpdated({ name: clean, avatarUrl: avatarUrl ?? null });
    setOpen(false);
  }

  async function choosePreset(id: string) {
    setUploading(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return setError("Sesión no válida."); }
    const value = presetAvatarValue(id);
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: value }).eq("id", user.id);
    setUploading(false);
    if (updateError) return setError(updateError.message);
    onProfileUpdated({ name, avatarUrl: value });
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Usa una imagen JPG, PNG o WEBP.");
    if (file.size > 2 * 1024 * 1024) return setError("La imagen debe pesar menos de 2 MB.");
    setUploading(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return setError("Sesión no válida."); }
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;
    const upload = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upload.error) { setUploading(false); return setError(upload.error.message); }
    const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    setUploading(false);
    if (updateError) return setError(updateError.message);
    onProfileUpdated({ name, avatarUrl: publicUrl });
  }

  async function deleteEvent() {
    if (!invitationId) return;
    setDeleting(true); setError("");
    const response = await fetch("/api/account/event", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId }) });
    const result = await response.json().catch(() => ({}));
    setDeleting(false);
    if (!response.ok) return setError(result.message || "No fue posible eliminar la invitación.");
    setDeleteOpen(false); setOpen(false); onEventDeleted();
  }

  return <>
    <button type="button" className="account-avatar-button" onClick={() => { setDraftName(name); setOpen(true); }} aria-label="Abrir mi perfil">
      <AccountAvatar value={avatarUrl} name={name} />
    </button>
    {open && <div className="modal-backdrop account-profile-backdrop" onMouseDown={() => !saving && !uploading && setOpen(false)}>
      <section className="account-profile-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><p className="eyebrow">Mi cuenta</p><h2>Perfil y configuración</h2></div><button type="button" onClick={() => setOpen(false)}>×</button></header>
        <div className="account-profile-avatar-row">
          <div className="account-profile-avatar"><AccountAvatar value={avatarUrl} name={name} /></div>
          <div><strong>Fotografía de perfil</strong><small>JPG, PNG o WEBP · máximo 2 MB</small><button type="button" className="client-secondary" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? "Subiendo…" : "Cambiar fotografía"}</button></div>
          <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} />
        </div>
        <div className="account-avatar-presets">
          <div><strong>Avatares predeterminados</strong><small>Elige uno ahora y cámbialo por tu fotografía cuando quieras.</small></div>
          <div className="account-avatar-preset-grid">
            {PRESET_AVATARS.map((preset) => {
              const selected = avatarUrl === presetAvatarValue(preset.id);
              return <button key={preset.id} type="button" className={selected ? "is-selected" : ""} disabled={uploading} onClick={() => void choosePreset(preset.id)} aria-label={`Usar avatar ${preset.label}`}>
                <AccountAvatar value={presetAvatarValue(preset.id)} name={name} />
                <span>{preset.label}</span>
              </button>;
            })}
          </div>
        </div>
        <label className="account-profile-field"><span>Nombre</span><input value={draftName} onChange={(event) => setDraftName(event.target.value)} /></label>
        {error && <p className="client-error">{error}</p>}
        <footer><button type="button" className="client-secondary" onClick={() => setOpen(false)}>Cancelar</button><button type="button" className="client-primary" disabled={saving} onClick={saveProfile}>{saving ? "Guardando…" : "Guardar perfil"}</button></footer>
        {invitationId && <div className="account-danger-zone"><div><strong>Zona de peligro</strong><p>Elimina esta invitación para liberar la cuenta y comenzar un evento nuevo.</p></div><button type="button" onClick={() => setDeleteOpen(true)}>Eliminar invitación</button></div>}
      </section>
    </div>}
    <ConfirmDialog open={deleteOpen} eyebrow="Zona de peligro" title={`¿Eliminar ${invitationTitle || "esta invitación"}?`} description="Se eliminarán el evento, invitados, confirmaciones, mensajes, fotografías y archivos asociados. Esta acción no se puede deshacer." confirmLabel="Eliminar definitivamente" busy={deleting} onCancel={() => !deleting && setDeleteOpen(false)} onConfirm={deleteEvent} />
  </>;
}
