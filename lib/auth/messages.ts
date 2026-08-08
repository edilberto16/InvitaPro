export function authMessage(error: unknown, fallback = "No fue posible completar la operación.") {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (/invalid login credentials/i.test(raw)) return "El correo o la contraseña no son correctos. Verifica tus datos e inténtalo nuevamente.";
  if (/email not confirmed/i.test(raw)) return "Tu correo todavía no ha sido confirmado. Revisa tu bandeja de entrada o reenvía el correo de confirmación.";
  if (/email rate limit exceeded|rate limit/i.test(raw)) return "Supabase alcanzó temporalmente el límite de correos. Espera unos minutos antes de intentarlo nuevamente.";
  if (/user already registered|already been registered/i.test(raw)) return "Ya existe una cuenta registrada con ese correo. Inicia sesión o recupera tu contraseña.";
  if (/password should be at least|password.*characters/i.test(raw)) return "La contraseña debe tener al menos 8 caracteres.";
  if (/same password|different from the old password/i.test(raw)) return "La nueva contraseña debe ser diferente de la contraseña actual.";
  if (/otp expired|token.*expired|expired/i.test(raw)) return "El enlace ya expiró. Solicita uno nuevo e inténtalo otra vez.";
  if (/invalid.*token|invalid.*otp/i.test(raw)) return "El enlace no es válido o ya fue utilizado. Solicita uno nuevo.";
  if (/network|fetch failed|failed to fetch/i.test(raw)) return "No fue posible conectar con el servicio de autenticación. Revisa tu conexión e inténtalo nuevamente.";
  return raw || fallback;
}
