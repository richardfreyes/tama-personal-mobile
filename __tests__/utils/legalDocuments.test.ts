import { getBulletLevel, getContactUrl, getDocumentLines, getLinkParts, getTableCells, getTableColumnWidth } from '@/utils/legalDocuments';
import { describe, expect, it } from '@jest/globals';

describe('getDocumentLines', () => {
  it('splits content into non-empty trimmed lines', () => {
    const content = 'Line one  \n\nLine two\n  \nLine three';
    expect(getDocumentLines(content)).toEqual(['Line one', 'Line two', 'Line three']);
  });

  it('returns empty array for blank content', () => {
    expect(getDocumentLines('\n\n  \n')).toEqual([]);
  });
});

describe('getTableCells', () => {
  it('splits tab-delimited lines and trims cells', () => {
    expect(getTableCells('A\tB\tC')).toEqual(['A', 'B', 'C']);
  });

  it('filters out empty cells', () => {
    expect(getTableCells('A\t\tC')).toEqual(['A', 'C']);
  });
});

describe('getTableColumnWidth', () => {
  it('returns predefined widths for 4-column tables', () => {
    expect(getTableColumnWidth(4, 0)).toBe(120);
    expect(getTableColumnWidth(4, 3)).toBe(190);
  });

  it('returns predefined widths for 3-column tables', () => {
    expect(getTableColumnWidth(3, 1)).toBe(280);
  });

  it('returns predefined widths for 2-column tables', () => {
    expect(getTableColumnWidth(2, 0)).toBe(130);
    expect(getTableColumnWidth(2, 1)).toBe(620);
  });

  it('returns default 180 for out-of-range or other column counts', () => {
    expect(getTableColumnWidth(5, 0)).toBe(180);
    expect(getTableColumnWidth(4, 10)).toBe(170);
  });
});

describe('getBulletLevel', () => {
  it('returns 0 for top-level bullets', () => {
    expect(getBulletLevel('- Item')).toBe(0);
  });

  it('returns 1 for indented bullets', () => {
    expect(getBulletLevel('  - Sub item')).toBe(1);
  });

  it('caps at level 2', () => {
    expect(getBulletLevel('      - Deep item')).toBe(2);
  });

  it('returns 0 for non-bullet lines', () => {
    expect(getBulletLevel('Regular text')).toBe(0);
  });
});

describe('getContactUrl', () => {
  it('returns HTTP URLs as-is', () => {
    expect(getContactUrl('https://example.com')).toBe('https://example.com');
    expect(getContactUrl('http://example.com')).toBe('http://example.com');
  });

  it('wraps email addresses with mailto:', () => {
    expect(getContactUrl('support@test.com')).toBe('mailto:support@test.com');
  });

  it('wraps phone numbers with tel:', () => {
    expect(getContactUrl('+1 (555) 123-4567')).toBe('tel:+15551234567');
  });
});

describe('getLinkParts', () => {
  it('strips trailing punctuation from URLs', () => {
    const result = getLinkParts('https://example.com.');
    expect(result.linkedText).toBe('https://example.com');
    expect(result.trailingText).toBe('.');
  });

  it('handles URLs without trailing punctuation', () => {
    const result = getLinkParts('https://example.com/path');
    expect(result.linkedText).toBe('https://example.com/path');
    expect(result.trailingText).toBe('');
  });

  it('returns email addresses as-is with mailto url', () => {
    const result = getLinkParts('user@example.com');
    expect(result.linkedText).toBe('user@example.com');
    expect(result.url).toBe('mailto:user@example.com');
  });
});
