import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const sessionClient = await createServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return { error: NextResponse.json({ message: "Sesión no válida." }, { status: 401 }) };
  const { data: profile } = await sessionClient
    .from("profiles")
    .select("rol,activo")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.rol !== "admin" || profile.activo === false) {
    return { error: NextResponse.json({ message: "No tienes permisos de administrador." }, { status: 403 }) };
  }
  return { user };
}

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { userId } = await context.params;
  const body = (await request.json()) as { active?: boolean };
  if (userId === auth.user.id && body.active === false) {
    return NextResponse.json({ message: "No puedes suspender tu propia cuenta." }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ activo: body.active !== false }).eq("id", userId);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ message: body.active === false ? "Cuenta suspendida." : "Cuenta reactivada." });
}

export async function DELETE(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { userId } = await context.params;
  if (userId === auth.user.id) {
    return NextResponse.json({ message: "No puedes eliminar tu propia cuenta." }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("rol").eq("id", userId).maybeSingle();
  if (target?.rol === "admin") {
    const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("rol", "admin").eq("activo", true);
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ message: "No se puede eliminar el último administrador activo." }, { status: 400 });
    }
  }
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ message: "La cuenta de acceso fue eliminada. El registro comercial permanece disponible." });
}
