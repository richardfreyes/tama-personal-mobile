export const isRecord = (value: any): value is Record<string, any> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);
