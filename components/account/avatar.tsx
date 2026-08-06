"use client";

export const PRESET_AVATARS = [
  { id: "celebration", emoji: "🎉", label: "Celebración", background: "linear-gradient(145deg,#7b2952,#c7799f)" },
  { id: "sparkle", emoji: "✨", label: "Brillo", background: "linear-gradient(145deg,#69449a,#b58de0)" },
  { id: "flowers", emoji: "🌸", label: "Floral", background: "linear-gradient(145deg,#b44971,#f3a7bd)" },
  { id: "cake", emoji: "🎂", label: "Cumpleaños", background: "linear-gradient(145deg,#c45b31,#f5a164)" },
  { id: "wedding", emoji: "💍", label: "Boda", background: "linear-gradient(145deg,#8d6e63,#d7b8a8)" },
  { id: "camp", emoji: "🏕️", label: "Campamento", background: "linear-gradient(145deg,#286347,#63a77e)" },
  { id: "star", emoji: "⭐", label: "Estrella", background: "linear-gradient(145deg,#b07a0e,#efc454)" },
  { id: "confetti", emoji: "🎊", label: "Confeti", background: "linear-gradient(145deg,#2b668d,#70b3d9)" },
] as const;

export function presetAvatarValue(id: string) {
  return `preset:${id}`;
}

export function getPresetAvatar(value?: string | null) {
  if (!value?.startsWith("preset:")) return null;
  const id = value.slice("preset:".length);
  return PRESET_AVATARS.find((item) => item.id === id) || null;
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "IP";
}

export function AccountAvatar({ value, name, className = "" }: { value?: string | null; name: string; className?: string }) {
  const preset = getPresetAvatar(value);
  if (preset) {
    return <span className={`preset-avatar ${className}`} style={{ background: preset.background }} role="img" aria-label={preset.label}>{preset.emoji}</span>;
  }
  if (value) return <img className={className} src={value} alt={`Avatar de ${name}`} />;
  return <span className={`initials-avatar ${className}`}>{initials(name)}</span>;
}
