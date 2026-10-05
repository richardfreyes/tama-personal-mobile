import { BILLER_DIRECTORY_OTHER_LETTER } from '@/constants/billerDirectory';
import type { Biller } from '@/redux/features/biller/billerTypes';
import type { BillerDirectoryGroup } from '@/types/bill';

const getBillerName = (biller: Pick<Biller, 'merchant_name'>): string => biller.merchant_name ?? '';

export const foldSearchText = (value: string): string => (
  value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
);

export const sortBillersByName = (billers: Biller[]): Biller[] => [...billers].sort(
  (a, b) => getBillerName(a).localeCompare(getBillerName(b), 'en', { sensitivity: 'base' }),
);

export const filterBillersByName = (billers: Biller[], query: string): Biller[] => {
  const term = foldSearchText(query);
  return term ? billers.filter((biller) => foldSearchText(getBillerName(biller)).includes(term)) : billers;
};

export const getBillerLetter = (name: string): string => {
  const first = foldSearchText(name).charAt(0);
  return /[a-z]/.test(first) ? first.toUpperCase() : BILLER_DIRECTORY_OTHER_LETTER;
};

export const groupBillersByLetter = (billers: Biller[]): BillerDirectoryGroup[] => {
  const groups = new Map<string, Biller[]>();

  billers.forEach((biller) => {
    const letter = getBillerLetter(getBillerName(biller));
    const group = groups.get(letter);
    if (group) {
      group.push(biller);
    } else {
      groups.set(letter, [biller]);
    }
  });

  return Array.from(groups, ([letter, groupBillers]) => ({ letter, billers: groupBillers }));
};
