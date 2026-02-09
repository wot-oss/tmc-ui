export default function capitalizeFirstChar(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function normalizeString(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');
}

export function normalizeRelativePathSegment(value: string): string {
  // remove leading slashes so it stays relative when used with new URL()
  return value.replace(/^\/+/, '');
}

export function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}
