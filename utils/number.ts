export const thousandSeparator = (value: string | number, decimals: number = 0): string => {
  const number = typeof value === 'string' ? parseFloat(value.replace(/,/g, '') || "0") : value;
  return number.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};
