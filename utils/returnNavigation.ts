export function resolveInternalReturnPath(candidate: unknown, fallback: string): string {
  if (typeof candidate !== 'string') return fallback;

  const value = candidate.trim();

  if (value.length === 0) return fallback;
  if (!value.startsWith('/')) return fallback;        // must be an app-absolute path
  if (value.startsWith('//')) return fallback;         // protocol-relative -> external
  if (value.includes('://')) return fallback;          // absolute URL with a scheme
  if (value.includes('\\')) return fallback;           // backslash tricks
  if (/\s/.test(value)) return fallback;               // whitespace is never a valid route

  return value;
}
