import type { Metadata } from 'next';
import './globals.css';
import './client-portal.css';

export const metadata: Metadata = {
  title: {
    default: 'InvitaPro | Invitaciones digitales que sorprenden',
    template: '%s | InvitaPro',
  },
  description: 'Crea invitaciones digitales personalizadas con RSVP, música, galería, ubicación, pases y administración de invitados.',
  keywords: ['invitaciones digitales', 'invitaciones de boda', 'RSVP', 'invitaciones XV años', 'eventos'],
  openGraph: {
    title: 'InvitaPro | Invitaciones digitales que sorprenden',
    description: 'Diseña, comparte y administra tus eventos desde un solo lugar.',
    type: 'website',
    locale: 'es_MX',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
