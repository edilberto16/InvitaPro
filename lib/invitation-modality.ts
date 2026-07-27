import type { CommercialPlan } from './commercial-plans';

export type InvitationModality = 'simple' | 'rsvp' | 'pases';

export type ModalityCapabilities = {
  publicLink: boolean;
  publicRsvp: boolean;
  personalizedPasses: boolean;
  csvImport: boolean;
  individualSharing: boolean;
  checkin: boolean;
};

const CAPABILITIES: Record<InvitationModality, ModalityCapabilities> = {
  simple: {
    publicLink: true,
    publicRsvp: false,
    personalizedPasses: false,
    csvImport: false,
    individualSharing: false,
    checkin: false,
  },
  rsvp: {
    publicLink: true,
    publicRsvp: true,
    personalizedPasses: false,
    csvImport: false,
    individualSharing: false,
    checkin: false,
  },
  pases: {
    publicLink: true,
    publicRsvp: true,
    personalizedPasses: true,
    csvImport: true,
    individualSharing: true,
    checkin: true,
  },
};

export function normalizeInvitationModality(value: unknown): InvitationModality {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'rsvp' || normalized === 'autoservicio') return 'rsvp';
  if (normalized === 'pases' || normalized === 'codigo' || normalized === 'código') return 'pases';
  return 'simple';
}

export function modalityCapabilities(value: unknown): ModalityCapabilities {
  return CAPABILITIES[normalizeInvitationModality(value)];
}

export function invitationModalityLabel(value: unknown): string {
  const modality = normalizeInvitationModality(value);
  if (modality === 'rsvp') return 'RSVP público';
  if (modality === 'pases') return 'Pases personalizados';
  return 'Solo enlace';
}

export function canUseInvitationModality(plan: CommercialPlan, value: unknown): boolean {
  const modality = normalizeInvitationModality(value);
  if (modality === 'simple') return true;
  if (modality === 'rsvp') return plan.permite_rsvp;
  return plan.permite_rsvp && plan.clave !== 'clasico';
}

export function minimumPlanForModality(value: unknown): 'clasico' | 'premium' {
  return normalizeInvitationModality(value) === 'pases' ? 'premium' : 'clasico';
}
