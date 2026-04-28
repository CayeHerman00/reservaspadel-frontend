export function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeText(value: string | null | undefined): string {
  return hasText(value) ? value.trim() : '';
}
