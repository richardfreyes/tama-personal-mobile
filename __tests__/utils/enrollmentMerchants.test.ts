import { describe, expect, it } from '@jest/globals';
import { getAutoDebitEnabledMerchants, getDisplayableAutoDebitMerchants, isAutoDebitEnabledMerchant } from '../../utils/enrollmentMerchants';

describe('enrollment merchant filters', () => {
  it('matches merchants with supported auto debit flags', () => {
    expect(isAutoDebitEnabledMerchant({ id: '1', isAutoDebitEnabled: true })).toBe(true);
    expect(isAutoDebitEnabledMerchant({ id: '2', is_auto_debit_enabled: true })).toBe(true);
    expect(isAutoDebitEnabledMerchant({ id: '3', autoDebitEnabled: true })).toBe(true);
    expect(isAutoDebitEnabledMerchant({ id: '4', auto_debit_enabled: true })).toBe(true);
  });

  it('matches merchants with enabled payment configs that support auto debit', () => {
    expect(isAutoDebitEnabledMerchant({
      id: '1',
      payments: [{
        channels: [],
        currency: 'PHP',
        fields: [],
        isEnabled: true,
        isAutoDebitEnabled: true,
        mode: 'formula',
      }],
    })).toBe(true);
  });

  it('filters out merchants without an explicit auto debit capability', () => {
    const merchants = [
      { id: '1', name: 'Enabled Merchant', isAutoDebitEnabled: true },
      { id: '2', name: 'Pay Only Merchant', isAutoDebitEnabled: false },
      { id: '3', name: 'Unknown Merchant' },
    ];

    expect(getAutoDebitEnabledMerchants(merchants)).toEqual([
      { id: '1', name: 'Enabled Merchant', isAutoDebitEnabled: true },
    ]);
  });

  it('keeps merchants displayable when the list response has no eligibility metadata', () => {
    const merchants = [
      { id: '1', name: 'Merchant One' },
      { id: '2', name: 'Merchant Two' },
    ];

    expect(getDisplayableAutoDebitMerchants(merchants)).toEqual(merchants);
  });

  it('filters displayable merchants when the list response includes eligibility metadata', () => {
    const merchants = [
      { id: '1', name: 'Enabled Merchant', isAutoDebitEnabled: true },
      { id: '2', name: 'Disabled Merchant', isAutoDebitEnabled: false },
    ];

    expect(getDisplayableAutoDebitMerchants(merchants)).toEqual([
      { id: '1', name: 'Enabled Merchant', isAutoDebitEnabled: true },
    ]);
  });

  it('removes duplicate merchants while preserving the first entry', () => {
    const merchants = [
      { id: '1', name: 'Merchant One' },
      { id: '1', name: 'Merchant One Duplicate' },
      { id: '2', name: 'Merchant Two' },
    ];

    expect(getDisplayableAutoDebitMerchants(merchants)).toEqual([
      { id: '1', name: 'Merchant One' },
      { id: '2', name: 'Merchant Two' },
    ]);
  });
});
