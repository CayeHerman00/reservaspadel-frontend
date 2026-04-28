import { normalizeText } from './text.utils';

export function buildUserInitials(name: string, fallback = 'U'): string {
  const initials = normalizeText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');

  return initials || fallback;
}
