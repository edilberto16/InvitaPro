import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(request: Request) {
  const sessionClient = await createServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ message: "Sesión no válida." }, { status: 401 });
  const { invitationId } = (await request.json()) as { invitationId?: string };
  if (!invitationId) return NextResponse.json({ message: "Falta la invitación." }, { status: 400 });

  const admin = createAdminClient();
  const { data: invitation, error: invitationError } = await admin
    .from("invitaciones")
    .select("id,evento_id,eventos!inner(id,cliente_id,clientes!inner(user_id))")
    .eq("id", invitationId)
    .maybeSingle();
  if (invitationError || !invitation) {
    return NextResponse.json({ message: "No se encontró la invitación." }, { status: 404 });
  }
  const invitationRow = invitation as unknown as { id: string; evento_id: string; eventos: { id: string; cliente_id: string; clientes: { user_id: string | null } | { user_id: string | null }[] } | { id: string; cliente_id: string; clientes: { user_id: string | null } | { user_id: string | null }[] }[] };
  const eventRelation = Array.isArray(invitationRow.eventos) ? invitationRow.eventos[0] : invitationRow.eventos;
  const clientRelation = eventRelation && (Array.isArray(eventRelation.clientes) ? eventRelation.clientes[0] : eventRelation.clientes);
  if (!clientRelation || clientRelation.user_id !== user.id) {
    return NextResponse.json({ message: "No tienes permiso para eliminar esta invitación." }, { status: 403 });
  }

  const [{ data: albumRows }, { data: mediaRows }] = await Promise.all([
    admin.from("album_colaborativo_fotos").select("storage_path").eq("invitacion_id", invitationId),
    admin.from("media").select("bucket,path").eq("evento_id", invitationRow.evento_id),
  ]);
  const albumPaths = (albumRows ?? []).map((row) => row.storage_path).filter(Boolean);
  if (albumPaths.length) await admin.storage.from("guest-album").remove(albumPaths);
  const grouped = new Map<string, string[]>();
  for (const item of mediaRows ?? []) {
    if (!item.bucket || !item.path) continue;
    grouped.set(item.bucket, [...(grouped.get(item.bucket) ?? []), item.path]);
  }
  for (const [bucket, paths] of grouped) await admin.storage.from(bucket).remove(paths);

  const { error: deleteError } = await admin.from("eventos").delete().eq("id", invitationRow.evento_id);
  if (deleteError) return NextResponse.json({ message: deleteError.message }, { status: 400 });
  return NextResponse.json({ message: "La invitación y sus datos asociados fueron eliminados." });
}
