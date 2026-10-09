import { BILLER_DIRECTORY_OTHER_LETTER } from '@/constants/billerDirectory';
import type { Biller } from '@/redux/features/biller/billerTypes';
import type { BillerDirectoryGroup } from '@/types/bill';

const getBillerName = (biller: Pick<Biller, 'merchant_name'>): string => biller.merchant_name ?? '';

type NameGetter<T> = (item: T) => string;

export const foldSearchText = (value: string): string => (
  value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
);

export const sortBillersByName = <T = Biller>(
  billers: T[],
  getName: NameGetter<T> = getBillerName as NameGetter<T>,
): T[] => [...billers].sort(
  (a, b) => getName(a).localeCompare(getName(b), 'en', { sensitivity: 'base' }),
);

export const filterBillersByName = <T = Biller>(
  billers: T[],
  query: string,
  getName: NameGetter<T> = getBillerName as NameGetter<T>,
): T[] => {
  const term = foldSearchText(query);
  return term ? billers.filter((biller) => foldSearchText(getName(biller)).includes(term)) : billers;
};

export const getBillerLetter = (name: string): string => {
  const first = foldSearchText(name).charAt(0);
  return /[a-z]/.test(first) ? first.toUpperCase() : BILLER_DIRECTORY_OTHER_LETTER;
};

export const groupBillersByLetter = <T = Biller>(
  billers: T[],
  getName: NameGetter<T> = getBillerName as NameGetter<T>,
): BillerDirectoryGroup<T>[] => {
  const groups = new Map<string, T[]>();

  billers.forEach((biller) => {
    const letter = getBillerLetter(getName(biller));
    const group = groups.get(letter);
    if (group) {
      group.push(biller);
    } else {
      groups.set(letter, [biller]);
    }
  });

  return Array.from(groups, ([letter, groupBillers]) => ({ letter, billers: groupBillers }));
};
