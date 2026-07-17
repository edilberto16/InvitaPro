import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const common = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function InvitationIcon(props: IconProps) {
  return <svg {...common} {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
}
export function PeopleIcon(props: IconProps) {
  return <svg {...common} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
export function CheckCircleIcon(props: IconProps) {
  return <svg {...common} {...props}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>;
}
export function ClientIcon(props: IconProps) {
  return <svg {...common} {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
}
export function CalendarIcon(props: IconProps) {
  return <svg {...common} {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>;
}
export function TicketIcon(props: IconProps) {
  return <svg {...common} {...props}><path d="M2 9a3 3 0 0 0 0 6v4h20v-4a3 3 0 0 0 0-6V5H2Z"/><path d="M13 5v2M13 10v2M13 15v2"/></svg>;
}
export function ArrowRightIcon(props: IconProps) {
  return <svg {...common} {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
}
export function EyeIcon(props: IconProps) {
  return <svg {...common} {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
}
