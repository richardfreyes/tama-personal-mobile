import { getLookupEndpoint } from '@/utils/billerForm';
import { describe, expect, it } from '@jest/globals';

describe('getLookupEndpoint', () => {
  const billerId = 42;

  it('returns an endpoint for each known lookup key', () => {
    const keys = [
      'projectName', 'paymentType', 'propertyType', 'salesChannel',
      'paymentOption', 'paymentMode', 'month', 'paymentYear', 'chargeType',
    ];
    keys.forEach((key) => {
      const endpoint = getLookupEndpoint(key, billerId);
      expect(endpoint).toBeDefined();
      expect(typeof endpoint).toBe('string');
    });
  });

  it('returns undefined for unknown keys', () => {
    expect(getLookupEndpoint('unknownKey', billerId)).toBeUndefined();
  });

  it('includes the biller ID in the endpoint path', () => {
    const endpoint = getLookupEndpoint('projectName', billerId);
    expect(endpoint).toContain(String(billerId));
  });
});
