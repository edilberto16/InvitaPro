import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next");
  const next = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/login?confirmed=1";

  if (!code) return NextResponse.redirect(`${origin}/login?auth_error=invalid_link`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?auth_error=invalid_link`);

  return NextResponse.redirect(`${origin}${next}`);
}
