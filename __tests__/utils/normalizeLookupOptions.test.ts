import { normalizeLookupOptions } from '@/utils/normalizeLookupOptions';
import { describe, expect, it } from '@jest/globals';

describe('normalizeLookupOptions', () => {
  it('returns empty array when rawLookupOptions is undefined', () => {
    expect(normalizeLookupOptions('key')).toEqual([]);
  });

  it('returns empty array when the fieldKey is not in the options', () => {
    expect(normalizeLookupOptions('missing', { other: [] })).toEqual([]);
  });

  describe('array sources', () => {
    it('maps objects with code and name fields', () => {
      const raw = { type: [{ code: 'A', name: 'Alpha' }, { code: 'B', name: 'Beta' }] };
      expect(normalizeLookupOptions('type', raw)).toEqual([
        { code: 'A', name: 'Alpha' },
        { code: 'B', name: 'Beta' },
      ]);
    });

    it('falls back to value, id, and typeCode for code', () => {
      expect(normalizeLookupOptions('k', { k: [{ value: 'v1', name: 'N1' }] })).toEqual([
        { code: 'v1', name: 'N1' },
      ]);
      expect(normalizeLookupOptions('k', { k: [{ id: 'i1', name: 'N2' }] })).toEqual([
        { code: 'i1', name: 'N2' },
      ]);
    });

    it('maps primitive array items as code and name', () => {
      const raw = { opts: ['X', 'Y'] };
      expect(normalizeLookupOptions('opts', raw)).toEqual([
        { code: 'X', name: 'X' },
        { code: 'Y', name: 'Y' },
      ]);
    });

    it('filters out null and undefined items', () => {
      const raw = { k: [null, { name: 'Valid' }, undefined] };
      expect(normalizeLookupOptions('k', raw)).toEqual([
        { code: 'Valid', name: 'Valid' },
      ]);
    });

    it('filters out objects without a name', () => {
      const raw = { k: [{ code: 'C1' }] };
      expect(normalizeLookupOptions('k', raw)).toEqual([]);
    });
  });

  describe('object sources', () => {
    it('handles projectName with nested projects array', () => {
      const raw = {
        projectName: {
          projects: [{ projectId: 'P1', name: 'Project 1' }],
        },
      };
      expect(normalizeLookupOptions('projectName', raw)).toEqual([
        { code: 'P1', name: 'Project 1' },
      ]);
    });

    it('maps keyed objects using the key as fallback code', () => {
      const raw = { field: { k1: { name: 'Item 1' }, k2: { name: 'Item 2' } } };
      const result = normalizeLookupOptions('field', raw);
      expect(result).toEqual([
        { code: 'k1', name: 'Item 1' },
        { code: 'k2', name: 'Item 2' },
      ]);
    });

    it('maps primitive values in an object', () => {
      const raw = { field: { a: 'Apple', b: 'Banana' } };
      expect(normalizeLookupOptions('field', raw)).toEqual([
        { code: 'a', name: 'Apple' },
        { code: 'b', name: 'Banana' },
      ]);
    });

    it('filters out null object values', () => {
      const raw = { field: { a: null, b: 'Valid' } };
      expect(normalizeLookupOptions('field', raw)).toEqual([
        { code: 'b', name: 'Valid' },
      ]);
    });
  });

  it('wraps a scalar source as a single option', () => {
    const raw = { field: 'SingleValue' };
    expect(normalizeLookupOptions('field', raw)).toEqual([
      { code: 'SingleValue', name: 'SingleValue' },
    ]);
  });
});
