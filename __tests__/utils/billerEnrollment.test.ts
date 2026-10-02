import { resolveBillerEnrollmentMetadata } from '@/utils/billerEnrollment';
import { describe, expect, it } from '@jest/globals';

describe('resolveBillerEnrollmentMetadata', () => {
  it('uses the selected RPMC project and applies the legacy duplicated payment prefix', () => {
    expect(resolveBillerEnrollmentMetadata({
      merchantCode: 'rpmc',
      merchantId: 97,
      projectId: '1857',
      paymentType: 'RPMC_TOTAL_BILLING',
    })).toEqual({
      projectId: 1857,
      paymentTypeCode: 'RPMC_RPMC_TOTAL_BILLING',
    });
  });

  it('namespaces a raw Rockwell Land payment-type code once', () => {
    expect(resolveBillerEnrollmentMetadata({
      merchantCode: 'rockwellland',
      merchantId: 92,
      projectId: '1404',
      paymentType: 'DP',
    })).toEqual({
      projectId: 1404,
      paymentTypeCode: 'ROCKWELLLAND_DP',
    });
  });

  it('keeps the legacy fallback for forms without project or payment-type selections', () => {
    expect(resolveBillerEnrollmentMetadata({
      merchantCode: 'merchant',
      merchantId: 10,
    })).toEqual({
      projectId: 10,
      paymentTypeCode: 'MERCHANT_One Time Payment',
    });
  });
});
