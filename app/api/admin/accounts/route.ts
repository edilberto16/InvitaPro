import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_ROLES = new Set(["admin", "administrador", "super_admin"]);

export async function GET() {
  const sessionClient = await createServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ message: "Sesión no válida." }, { status: 401 });
  const { data: profile } = await sessionClient.from("profiles").select("rol,activo").eq("id", user.id).maybeSingle();
  if (!ADMIN_ROLES.has(profile?.rol ?? "") || profile?.activo === false) return NextResponse.json({ message: "No tienes permisos de administrador." }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return NextResponse.json({ message: "No fue posible consultar Supabase Auth." }, { status: 400 });
  const ids = data.users.map((item) => item.id);
  const [{ data: clients }, { data: profiles }] = await Promise.all([
    ids.length ? admin.from("clientes").select("id,nombre,correo,user_id").in("user_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? admin.from("profiles").select("id,rol,activo").in("id", ids) : Promise.resolve({ data: [] }),
  ]);
  const linked = new Map((clients ?? []).map((client) => [client.user_id, client]));
  const profileMap = new Map((profiles ?? []).map((item) => [item.id, item]));
  return NextResponse.json({ users: data.users.map((item) => ({
    id: item.id,
    email: item.email ?? "",
    created_at: item.created_at,
    last_sign_in_at: item.last_sign_in_at,
    email_confirmed_at: item.email_confirmed_at,
    client: linked.get(item.id) ?? null,
    role: profileMap.get(item.id)?.rol ?? null,
    active: profileMap.get(item.id)?.activo !== false,
    is_current_admin: item.id === user.id,
  })) });
}
