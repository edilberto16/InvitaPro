import Link from 'next/link';

type LogoProps = {
  href?: string;
  compact?: boolean;
};

export function InvitaProLogo({ href = '/', compact = false }: LogoProps) {
  const content = (
    <span className="marketing-logo" aria-label="InvitaPro">
      <span className="marketing-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <path d="M9 13.5 24 5l15 8.5v21L24 43 9 34.5v-21Z" />
          <path d="m17 23 5 5 10-11" />
        </svg>
      </span>
      {!compact && (
        <span className="marketing-logo-copy">
          <strong>InvitaPro</strong>
          <small>Momentos que conectan</small>
        </span>
      )}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
