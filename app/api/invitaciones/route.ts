import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  if (!data.titulo || !data.fecha_evento) {
    return NextResponse.json({ message: 'Faltan datos obligatorios.' }, { status: 400 });
  }

  // En la siguiente etapa, aquí se insertará el registro en Supabase.
  return NextResponse.json({
    message: `La invitación “${data.titulo}” fue validada correctamente.`,
    data
  });
}
