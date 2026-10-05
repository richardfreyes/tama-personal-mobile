import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { API_PATHS } from '@/redux/apiPaths';
import { getLookupEndpoint } from '@/utils/billerForm';
import { detectCardProvider, formatLastFourDigits, getCardIcon, getProviderDisplay, } from '@/utils/card';
import { formatApiDate, formatDateDisplay, formatDateForStorage, getStartOfDay, parseDateValue, } from '@/utils/date';
import { getEnrollmentKey } from '@/utils/enrollment';
import { decodeJwt, normalizeBase64Url } from '@/utils/jwt';
import { getBulletLevel, getContactUrl, getDocumentLines, getLineStyle, getLineWeight, getLinkParts, getTableCells, getTableColumnWidth, openContactLink, } from '@/utils/legalDocuments';
import { normalizeLookupOptions } from '@/utils/normalizeLookupOptions';
import { thousandSeparator } from '@/utils/number';
import { getPaymentErrorMessage, isPaymentMethodMismatchError, } from '@/utils/paymentErrors';
import { validatePaymentPreconditions } from '@/utils/paymentValidation';
import { isRecord } from '@/utils/typeGuards';
import { getCvcLength, validateCardNumber, validateCVC, validateExpiryDate, validateField, validateForm, } from '@/utils/validators';
import { Linking } from 'react-native';

jest.mock('@/assets/icons/amex.svg', () => 'Amex');
jest.mock('@/assets/icons/apple-pay.svg', () => 'ApplePay');
jest.mock('@/assets/icons/bdo.svg', () => 'Bdo');
jest.mock('@/assets/icons/bpi.svg', () => 'Bpi');
jest.mock('@/assets/icons/credit-card.svg', () => 'CreditCard');
jest.mock('@/assets/icons/diners-club.svg', () => 'Diners');
jest.mock('@/assets/icons/discover.svg', () => 'Discover');
jest.mock('@/assets/icons/gcash.svg', () => 'GCash');
jest.mock('@/assets/icons/gpay.svg', () => 'GPay');
jest.mock('@/assets/icons/grab-pay.svg', () => 'GrabPay');
jest.mock('@/assets/icons/mastercard.svg', () => 'Mastercard');
jest.mock('@/assets/icons/maya.svg', () => 'Maya');
jest.mock('@/assets/icons/paypal.svg', () => 'Paypal');
jest.mock('@/assets/icons/qrph.svg', () => 'QrPH');
jest.mock('@/assets/icons/sepa.svg', () => 'Sepa');
jest.mock('@/assets/icons/unionbank.svg', () => 'UnionBank');
jest.mock('@/assets/icons/unionpay.svg', () => 'UnionPay');
jest.mock('@/assets/icons/visa.svg', () => 'Visa');

describe('core utility behavior', () => {
  describe('biller lookup routing', () => {
    it.each([
      ['projectName', API_PATHS.dashboard.getBillerProjects(42)],
      ['paymentType', API_PATHS.dashboard.getBillerPaymentTypes(42)],
      ['propertyType', API_PATHS.dashboard.getBillerPropertyTypes(42)],
      ['salesChannel', API_PATHS.dashboard.getBillerSalesChannel(42)],
      ['paymentOption', API_PATHS.dashboard.getBillerPaymentOptions(42)],
      ['paymentMode', API_PATHS.dashboard.getBillerPaymentModes(42)],
      ['month', API_PATHS.dashboard.getBillerMonths(42)],
      ['paymentYear', API_PATHS.dashboard.getBillerPaymentYears(42)],
      ['chargeType', API_PATHS.dashboard.getBillerChargeTypes(42)],
    ])('maps %s to its endpoint', (key, endpoint) => {
      expect(getLookupEndpoint(key, 42)).toBe(endpoint);
    });

    it('returns undefined for unsupported fields', () => {
      expect(getLookupEndpoint('unknown', 42)).toBeUndefined();
    });
  });

  describe('card display helpers', () => {
    it.each([
      ['4111 1111 1111 1111', 'visa'],
      ['5555 5555 5555 4444', 'mastercard'],
      ['378282246310005', 'amex'],
      ['6011111111111117', 'discover'],
      ['123', 'unknown'],
    ])('detects %s as %s', (number, provider) => {
      expect(detectCardProvider(number)).toBe(provider);
    });

    it.each([
      'VISA debit',
      'master-card',
      'American Express',
      'discover',
      'diners club',
      'union pay',
      'SEPA',
      'BDO',
      'BPI',
      'UB',
      'PayPal',
      'GCash',
      'GrabPay',
      'Maya',
      'QR PH',
      'Google Pay',
      'Apple Pay',
      'something else',
      null,
    ])('returns a renderable icon for %s', (provider) => {

      expect(getCardIcon(provider).uri).toBe('Visa');
    });

    it('formats provider and last-four fallbacks', () => {
      expect(getProviderDisplay('  VISA ')).toBe('Visa');
      expect(getProviderDisplay('')).toBe('Card');
      expect(formatLastFourDigits(' 1234 ')).toBe('1234');
      expect(formatLastFourDigits(null)).toBe('----');
    });
  });

  describe('date helpers', () => {
    it('formats, stores, and displays valid dates', () => {
      expect(formatApiDate('2026-07-27T12:30:00Z', 'yyyy-MM-dd')).toBe('2026-07-27');
      expect(formatDateDisplay('2026-07-27T12:30:00Z')).toBe('2026-07-27');
      expect(formatDateDisplay('2026-07-27')).toBe('2026-07-27');
      expect(formatDateForStorage(new Date(2026, 6, 7))).toBe('2026-07-07');
      expect(parseDateValue('2026-07-27')).toBeInstanceOf(Date);
    });

    it('returns safe fallbacks for absent or invalid inputs', () => {
      expect(formatApiDate(null, 'yyyy')).toBe('');
      expect(formatDateDisplay()).toBe('');
      expect(parseDateValue()).toBeUndefined();
      expect(parseDateValue('not-a-date')).toBeUndefined();
    });

    it('normalizes a timestamp to local start of day', () => {
      const timestamp = getStartOfDay('2026-07-27T19:23:00');
      const date = new Date(timestamp);
      expect([date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()]).toEqual([0, 0, 0, 0]);
    });
  });

  describe('identifiers, records, and numbers', () => {
    it('uses enrollment identifiers in priority order and has a deterministic fallback', () => {
      expect(getEnrollmentKey({ referenceId: 'ref' } as any, 4)).toBe('ref');
      expect(getEnrollmentKey({ transactionId: 'txn' } as any, 4)).toBe('txn');
      expect(getEnrollmentKey({ externalTransactionId: 'external' } as any, 4)).toBe('external');
      expect(getEnrollmentKey({} as any, 4)).toBe('enrollment-4');
      expect(getEnrollmentKey({} as any)).toBe('enrollment-0');
    });

    it.each([
      [{}, true],
      [{ value: 1 }, true],
      [[], false],
      [null, false],
      ['value', false],
    ])('recognizes plain records', (value, expected) => {
      expect(isRecord(value)).toBe(expected);
    });

    it('formats numeric and comma-separated values with requested decimals', () => {
      expect(thousandSeparator('1,234.5', 2)).toBe((1234.5).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }));
      expect(thousandSeparator('', 0)).toBe('0');
    });
  });

  describe('JWT decoding', () => {
    const toBase64Url = (value: object) => Buffer.from(JSON.stringify(value))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    it('normalizes URL-safe payloads and decodes claims', () => {
      expect(normalizeBase64Url('YWJjZA')).toBe('YWJjZA==');
      expect(normalizeBase64Url('YWJjZA==')).toBe('YWJjZA==');
      const payload = { firstName: 'Ada', username: 'ada@example.com' };
      expect(decodeJwt(`header.${toBase64Url(payload)}.signature`)).toEqual(payload);
    });

    it.each(['', 'only.two', 'a.%%%.c'])('returns null for malformed token %s', (token) => {
      expect(decodeJwt(token)).toBeNull();
    });
  });

  describe('legal-document helpers', () => {
    beforeEach(() => {
      jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
      jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    });

    afterEach(() => { jest.restoreAllMocks(); });

    it('removes blank document lines without stripping leading indentation', () => {
      expect(getDocumentLines('Updated\n\n  • Nested  \nTitle')).toEqual([
        'Updated',
        '  • Nested',
        'Title',
      ]);
    });

    it('classifies headings, list lines, and paragraphs', () => {
      expect(getLineStyle('Updated July 2026', 0)).toBeDefined();
      expect(getLineStyle('TERMS OF USE', 1)).toBeDefined();
      expect(getLineStyle('1. GENERAL', 2)).toBeDefined();
      expect(getLineWeight('TERMS OF USE', 1)).toBe('700');
      expect(getLineWeight('a. Account', 2)).toBe('600');
      expect(getLineWeight('ordinary paragraph.', 2)).toBe('regular');
    });

    it('parses tables, bullets, email, phone, and URL punctuation', () => {
      expect(getTableCells(' Name \t Value \t ')).toEqual(['Name', 'Value']);
      expect(getTableColumnWidth(4, 0)).toBe(120);
      expect(getTableColumnWidth(3, 4)).toBe(180);
      expect(getTableColumnWidth(2, 1)).toBe(620);
      expect(getTableColumnWidth(1, 0)).toBe(180);
      expect(getBulletLevel('    - Deep')).toBe(2);
      expect(getContactUrl('help@example.com')).toBe('mailto:help@example.com');
      expect(getContactUrl('+63 (2) 123-4567')).toBe('tel:+6321234567');
      expect(getContactUrl('https://example.com')).toBe('https://example.com');
      expect(getLinkParts('https://example.com.')).toEqual({
        linkedText: 'https://example.com',
        trailingText: '.',
        url: 'https://example.com',
      });
    });

    it('opens supported links and leaves unsupported links alone', async () => {
      await openContactLink('mailto:help@example.com');
      expect(Linking.openURL).toHaveBeenCalledWith('mailto:help@example.com');

      (Linking.canOpenURL as jest.Mock<(...args: any[]) => any>).mockResolvedValueOnce(false);
      await openContactLink('tel:123');
      expect(Linking.openURL).not.toHaveBeenCalledWith('tel:123');
    });
  });

  describe('lookup normalization', () => {
    it('normalizes arrays of records, primitives, and invalid entries', () => {
      expect(normalizeLookupOptions('field', {
        field: [
          { code: 'A', name: 'Alpha' },
          { id: 2, label: 'Beta' },
          'Gamma',
          null,
          { code: 'missing-name' },
        ],
      })).toEqual([
        { code: 'A', name: 'Alpha' },
        { code: '2', name: 'Beta' },
        { code: 'Gamma', name: 'Gamma' },
      ]);
    });

    it('normalizes project envelopes, keyed objects, scalar values, and absent values', () => {
      expect(normalizeLookupOptions('projectName', {
        projectName: { projects: [{ project_id: 9, project_name: 'Nine' }] },
      })).toEqual([{ code: '9', name: 'Nine' }]);
      expect(normalizeLookupOptions('field', {
        field: { a: 'Alpha', b: { typeCode: 'B', typeName: 'Beta' }, c: null },
      })).toEqual([{ code: 'a', name: 'Alpha' }, { code: 'B', name: 'Beta' }]);
      expect(normalizeLookupOptions('field', { field: 7 })).toEqual([{ code: '7', name: '7' }]);
      expect(normalizeLookupOptions('field')).toEqual([]);
    });
  });

  describe('payment errors and preconditions', () => {
    it.each([
      [{ data: { code: 30021 } }],
      [{ data: { errorCode: 'payment_method_mismatch' } }],
      [{ data: { message: 'Payment_Method_Mismatch happened' } }],
    ])('recognizes payment processor mismatch responses', (error) => {
      expect(isPaymentMethodMismatchError(error)).toBe(true);
      expect(getPaymentErrorMessage(error)).toContain('different payment processor');
    });

    it('uses API messages and fallbacks for other errors', () => {
      expect(getPaymentErrorMessage({ data: { message: 'Declined' } })).toBe('Declined');
      expect(getPaymentErrorMessage({ data: { error: 'Unavailable' } })).toBe('Unavailable');
      expect(getPaymentErrorMessage(null, 'Fallback')).toBe('Fallback');
    });

    it.each([
      [{ merchantId: '', transactionId: 't', isPaymentMethodReady: true, hasAcceptedTerms: true }, 'Missing transaction details'],
      [{ merchantId: 'm', transactionId: '', isPaymentMethodReady: true, hasAcceptedTerms: true }, 'Missing transaction details'],
      [{ merchantId: 'm', transactionId: 't', isPaymentMethodReady: false, hasAcceptedTerms: true }, 'payment method'],
      [{ merchantId: 'm', transactionId: 't', isPaymentMethodReady: true, hasAcceptedTerms: false }, 'Terms'],
    ])('reports failed precondition %#', (input, message) => {
      expect(validatePaymentPreconditions(input as any)).toEqual(expect.stringContaining(message));
    });

    it('allows a ready, accepted payment', () => {
      expect(validatePaymentPreconditions({
        merchantId: 'merchant',
        transactionId: 'transaction',
        isPaymentMethodReady: true,
        hasAcceptedTerms: true,
      })).toBeNull();
    });
  });

  describe('field and card validation', () => {
    it('wraps card-validator results and identifies CVC length', () => {
      expect(validateCardNumber('4111111111111111').isValid).toBe(true);
      expect(validateExpiryDate('12/40').isValid).toBe(true);
      expect(validateCVC('123', 3).isValid).toBe(true);
      expect(getCvcLength('378282246310005')).toBe(4);
    });

    it.each([
      ['email', '', undefined, 'Email is required.'],
      ['email', 'not-an-email', undefined, 'Please enter a valid email address.'],
      ['newEmail', 'USER@example.com', { currentValue: 'user@example.com' }, 'New email cannot be the same as the current email.'],
      ['password', '', undefined, 'Password is required.'],
      ['oldPassword', '', undefined, 'Old password is required.'],
      ['newPassword', '', undefined, 'New password is required.'],
      ['confirmNewPassword', 'other', { passwordToMatch: 'secret' }, 'Passwords do not match.'],
      ['confirmPassword', '', undefined, 'Password is required.'],
      ['firstName', '', undefined, 'First Name is required.'],
      ['lastName', '', undefined, 'Last Name is required.'],
      ['fullName', ' A ', undefined, 'Full Name is required.'],
      ['cardNumber', '', undefined, 'Card Number is required.'],
      ['expiryDate', '', undefined, 'Expiry Date is required.'],
      ['securityCode', '', undefined, 'Security Code is required.'],
      ['streetAddress', '   ', undefined, 'Street Address is required.'],
      ['country', '', undefined, 'Country is required.'],
      ['stateRegion', '', undefined, 'State/Region is required.'],
      ['city', '', undefined, 'City is required.'],
      ['postalCode', ' ', undefined, 'Postal Code is required.'],
      ['Amount', '0', undefined, 'Please enter a valid amount greater than zero.'],
      ['Amount', '10.999', undefined, 'Amount must have at most 2 decimal places.'],
      ['lookup', '', undefined, 'Please select an option.'],
      ['text', ' ', undefined, 'text is required.'],
    ])('validates %s invalid values', (field, value, extra, message) => {
      expect(validateField(field, value, extra)).toBe(message);
    });

    it('accepts valid values and validates every string field in a form', () => {
      expect(validateField('email', 'valid@example.com')).toBe('');
      expect(validateField('Amount', '1,234.50')).toBe('');
      expect(validateForm({ email: '', ignored: 123, city: '' })).toEqual({
        email: 'Email is required.',
        city: 'City is required.',
      });
    });
  });
});
