import { describe, expect, it } from '@jest/globals';
import type { Biller } from '@/redux/features/biller/billerTypes';
import { filterBillersByName, getBillerLetter, groupBillersByLetter, sortBillersByName, } from '@/utils/billerDirectory';

const makeBiller = (merchant_name: string, merchant_id = 1): Biller => ({
  address_one: '',
  address_three: '',
  address_two: '',
  created_at: '',
  is_active: true,
  is_public: true,
  merchant_code: merchant_name.toLowerCase(),
  merchant_id,
  merchant_logo_url: '',
  merchant_name,
  merchant_status: 'active',
  merchant_timezone: 'Asia/Manila',
  updated_at: '',
});

const names = (billers: Biller[]) => billers.map((biller) => biller.merchant_name);

describe('sortBillersByName', () => {
  it('sorts A–Z ignoring case, with numbers first, without touching the original list', () => {
    const billers = [makeBiller('megaworld'), makeBiller('Avida Land'), makeBiller('724Care'), makeBiller('AboitizLand')];

    expect(names(sortBillersByName(billers))).toEqual(['724Care', 'AboitizLand', 'Avida Land', 'megaworld']);
    expect(names(billers)).toEqual(['megaworld', 'Avida Land', '724Care', 'AboitizLand']);
  });
});

describe('filterBillersByName', () => {
  const billers = [makeBiller('Avida Land'), makeBiller('Megaworld'), makeBiller('Ayala Land Premier')];

  it('keeps billers whose name contains the query, ignoring case and surrounding spaces', () => {
    expect(names(filterBillersByName(billers, '  LAND '))).toEqual(['Avida Land', 'Ayala Land Premier']);
  });

  it('matches accented names from an unaccented query', () => {
    expect(names(filterBillersByName([makeBiller('Éclair')], 'eclair'))).toEqual(['Éclair']);
  });

  it('returns everything for an empty or blank query', () => {
    expect(filterBillersByName(billers, '')).toBe(billers);
    expect(filterBillersByName(billers, '   ')).toBe(billers);
  });

  it('returns nothing when no name matches', () => {
    expect(filterBillersByName(billers, 'Vertis North')).toEqual([]);
  });
});

describe('getBillerLetter', () => {
  it('uses the upper-cased first letter, folding accents', () => {
    expect(getBillerLetter('avida')).toBe('A');
    expect(getBillerLetter('  Megaworld')).toBe('M');
    expect(getBillerLetter('Éclair')).toBe('E');
  });

  it('groups digits and symbols under "#"', () => {
    expect(getBillerLetter('724Care')).toBe('#');
    expect(getBillerLetter('(Test) Biller')).toBe('#');
    expect(getBillerLetter('')).toBe('#');
  });
});

describe('groupBillersByLetter', () => {
  it('groups consecutive billers by first letter in the order given', () => {
    const groups = groupBillersByLetter(sortBillersByName([
      makeBiller('Megaworld'), makeBiller('724Care'), makeBiller('Avida Land'), makeBiller('AboitizLand'), makeBiller('SMDC'),
    ]));

    expect(groups.map((group) => group.letter)).toEqual(['#', 'A', 'M', 'S']);
    expect(names(groups[1].billers)).toEqual(['AboitizLand', 'Avida Land']);
  });

  it('returns no groups for no billers', () => {
    expect(groupBillersByLetter([])).toEqual([]);
  });
});
