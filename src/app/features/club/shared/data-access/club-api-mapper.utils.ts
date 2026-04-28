import { CourtStatus } from '@app/features/club/shared/club.models';
import { hasText, normalizeText } from '@app/shared/utils/text.utils';

export function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function toText(value: unknown, fallback: string): string {
  return typeof value === 'string' && hasText(value) ? normalizeText(value) : fallback;
}

export function toNullableText(value: unknown): string | null {
  return typeof value === 'string' && hasText(value) ? normalizeText(value) : null;
}

export function clampPercentage(value: unknown): number {
  const numericValue = toNumber(value);
  return Math.max(0, Math.min(100, numericValue));
}

export function mapCourtStatus(value: unknown): CourtStatus {
  const normalized = typeof value === 'string' ? normalizeText(value).toUpperCase() : '';

  switch (normalized) {
    case 'DISPONIBLE':
    case 'AVAILABLE':
      return 'AVAILABLE';
    case 'EN_JUEGO':
    case 'IN_PLAY':
      return 'IN_PLAY';
    case 'MANTENIMIENTO':
    case 'MAINTENANCE':
      return 'MAINTENANCE';
    default:
      return 'UNKNOWN';
  }
}
