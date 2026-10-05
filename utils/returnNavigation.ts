export function resolveInternalReturnPath(candidate: unknown, fallback: string): string {
  if (typeof candidate !== 'string') return fallback;

  const value = candidate.trim();

  if (value.length === 0) return fallback;
  if (!value.startsWith('/')) return fallback;         
  if (value.startsWith('//')) return fallback;          
  if (value.includes('://')) return fallback;           
  if (value.includes('\\')) return fallback;            
  if (/\s/.test(value)) return fallback;                

  return value;
}
