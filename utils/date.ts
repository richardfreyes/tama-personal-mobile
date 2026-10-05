import { format, parseISO } from 'date-fns';

export const formatApiDate = (
  isoDateString: string | undefined | null, 
  formatString: string
): string => {
  if (!isoDateString) {
    return '';
  }

  try {
    const date = parseISO(isoDateString);

    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return isoDateString;
  }
};

export const getStartOfDay = (dateString: string): number => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0); 
  return date.getTime();
};

export const formatDateDisplay = (value?: string): string => {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
};

export const formatDateForStorage = (date: Date): string => {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateValue = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
