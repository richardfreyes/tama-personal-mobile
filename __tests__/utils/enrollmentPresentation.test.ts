import { describe, expect, it } from '@jest/globals';
import type { Enrollment } from '../../types/enrollment';
import {
  buildEnrollmentDetailsViewModel,
  buildEnrollmentDetailSections,
  formatEnrollmentCurrency,
  formatEnrollmentPhone,
  getEnrollmentMonthlyAmount,
  getEnrollmentMerchantCode,
  getEnrollmentNextDebitDate,
  getEnrollmentPaymentMethod,
  getEnrollmentReferenceId,
  getEnrollmentStatusLabel,
  getEnrollmentTitle,
} from '../../utils/enrollmentPresentation';

describe('enrollment presentation', () => {
  const enrollment: Enrollment = {
    referenceId: 'ENR-001',
    propertyName: 'Acqua Private Residences',
    merchantName: 'Aqwire Homes',
    merchantCode: 'AQWIRE',
    unitNumber: 'Unit 1804',
    customerName: 'Jane Customer',
    customerEmail: 'jane@example.com',
    status: 'pending_approval',
    baseAmount: 1234.56,
    baseCurrency: 'PHP',
    nextDebitDate: '2026-03-15T00:00:00.000Z',
    paymentMethodBrand: 'MASTERCARD',
    tokenizedCardNumber: '************4444',
    enrollmentStartDate: '2026-01-15T00:00:00.000Z',
    enrollmentEndDate: '2026-12-15T00:00:00.000Z',
    customFields: {
      parkingSlot: 'P-18',
      clientNotes: 'Debit after the fifteenth.',
    },
    history: [
      { status: 'created', date: '2026-01-10T08:30:00.000Z' },
    ],
    createdDate: '2026-01-10T08:30:00.000Z',
  };

  it('builds the compact summary from the best available fields', () => {
    expect(getEnrollmentTitle(enrollment)).toBe('Acqua Private Residences');
    expect(getEnrollmentReferenceId(enrollment)).toBe('ENR-001');
    expect(getEnrollmentMerchantCode(enrollment)).toBe('AQWIRE');
    expect(getEnrollmentMonthlyAmount(enrollment)).toBe('PHP 1,234.56');
    expect(getEnrollmentNextDebitDate(enrollment)).toBe('Mar 15, 2026');
    expect(getEnrollmentPaymentMethod(enrollment)).toEqual({
      provider: 'Mastercard',
      lastFour: '4444',
      display: 'Mastercard ending in 4444',
    });
    expect(getEnrollmentStatusLabel(enrollment.status)).toBe('Pending Approval');
  });

  it('does not use merchant information as the list title', () => {
    expect(getEnrollmentTitle({ merchantName: 'Hidden Merchant' })).toBe('Auto Debit Enrollment');
  });

  it('does not use the payment type as the list title', () => {
    expect(getEnrollmentTitle({ paymentTypeName: 'Monthly Amortization' })).toBe('Auto Debit Enrollment');
  });

  it('normalizes alternate reference ID and merchant code fields', () => {
    expect(getEnrollmentReferenceId({ reference_id: 'ENR-ALT-001' })).toBe('ENR-ALT-001');
    expect(getEnrollmentMerchantCode({ merchant_code: 'ALT-MERCHANT' })).toBe('ALT-MERCHANT');
  });

  it('maps supported API statuses to customer-friendly labels', () => {
    expect(getEnrollmentStatusLabel('ONGOING')).toBe('Active');
    expect(getEnrollmentStatusLabel('COMPLETED')).toBe('Completed');
    expect(getEnrollmentStatusLabel('CANCELLED')).toBe('Cancelled');
    expect(getEnrollmentStatusLabel('EXPIRED')).toBe('Expired');
    expect(getEnrollmentStatusLabel('PENDING')).toBe('Pending');
  });

  it('groups every non-empty field for the details screen', () => {
    const sections = buildEnrollmentDetailSections(enrollment);
    const sectionNames = sections.map((section) => section.title);
    const values = sections.flatMap((section) => section.fields.map((field) => field.value));

    expect(sectionNames).toEqual(expect.arrayContaining([
      'Enrollment Information',
      'Payment Information',
      'Property Information',
      'Schedule',
      'Billing Information',
      'History',
      'Additional Information',
    ]));
    expect(values).toEqual(expect.arrayContaining([
      'ENR-001',
      'Aqwire Homes',
      'Unit 1804',
      'Jane Customer',
      'jane@example.com',
      'P-18',
      'Debit after the fifteenth.',
      'created',
    ]));
  });

  it('builds a customer-safe details model and formats customer-facing values', () => {
    const details = buildEnrollmentDetailsViewModel({
      adminNotes: 'Do not display',
      baseAmount: 13000,
      baseCurrency: 'PHP',
      completedPayments: 0,
      customerEmail: 'richard@reyes.com',
      customerId: 'internal-id',
      customerMobileNo: '+639770884111',
      customerName: 'Richard',
      enrollmentLastPaymentAmount: 0,
      enrollmentLastPaymentDate: null,
      enrollmentMonths: 12,
      enrollmentPeriod: 'monthly',
      enrollmentStartDate: '2026-07-21T00:00:00+08:00',
      enrollmentType: 'fixed',
      merchantName: 'Camella Homes',
      methodBrand: 'VISA',
      methodCardNumber: '4242424242424242',
      methodExpiry: '12/27',
      methodType: 'credit_card',
      paymentTypeName: 'Monthly Amortization',
      referenceId: 'QW-E-F4LKN66E',
      status: 'ONGOING',
    });

    expect(details.statusLabel).toBe('Active');
    expect(details.monthlyAmount).toBe('₱13,000.00');
    expect(details.estimatedTotal).toBe('₱156,000.00');
    expect(details.completedPayments).toBe(0);
    expect(details.progress).toBe(0);
    expect(details.lastPayment).toBe('No payments yet');
    expect(details.paymentMethod).toEqual(expect.objectContaining({
      cardType: 'Visa',
      expiry: 'Dec 2027',
      maskedCard: '•••• 4242',
      paymentMethodType: 'Credit card',
    }));
    expect(JSON.stringify(details)).not.toContain('internal-id');
    expect(JSON.stringify(details)).not.toContain('Do not display');
  });

  it('reflects a paid enrollment in the payment progress bar', () => {
    const details = buildEnrollmentDetailsViewModel({
      baseAmount: 12000,
      baseCurrency: 'PHP',
      completedPayments: 1,
      enrollmentLastPaymentDate: '2026-07-27T14:00:00+08:00',
      enrollmentMonths: 12,
      enrollmentType: 'fixed',
      referenceId: 'QW-E-6CEATOX6',
      status: 'ONGOING',
    });

    expect(details.completedPayments).toBe(1);
    expect(details.totalPayments).toBe(12);
    expect(details.progress).toBeCloseTo(1 / 12);
  });

  it('shows the last payment record once a payment has been made', () => {
    const details = buildEnrollmentDetailsViewModel({
      baseAmount: 12000,
      baseCurrency: 'PHP',
      completedPayments: 3,
      enrollmentLastPaymentAmount: 12000,
      enrollmentLastPaymentDate: '2026-08-04T13:24:54+08:00',
      enrollmentMonths: 12,
      enrollmentType: 'fixed',
      status: 'ONGOING',
    });

    expect(details.lastPayment).toContain('₱12,000.00');
    expect(details.lastPayment).toContain('August 4, 2026');
    expect(details.lastPaymentRecord).toBe('August 4, 2026');
  });

  it('shows full progress once every scheduled payment is paid', () => {
    const details = buildEnrollmentDetailsViewModel({
      completedPayments: 12,
      enrollmentMonths: 12,
      status: 'COMPLETED',
    });

    expect(details.completedPayments).toBe(12);
    expect(details.progress).toBe(1);
  });

  it('does not report progress when the backend omits the completedPayments field', () => {
    // The progress bar has a hard dependency on the backend completedPayments
    // count (GET /enrollments). If the backend does not surface it, the bar must
    // not fabricate progress from an existing last-payment date alone.
    const details = buildEnrollmentDetailsViewModel({
      enrollmentLastPaymentDate: '2026-07-27T14:00:00+08:00',
      enrollmentMonths: 12,
      status: 'ONGOING',
    });

    expect(details.completedPayments).toBeNull();
    expect(details.progress).toBeNull();
  });

  it('does not calculate an estimated total without an explicit fixed-price rule', () => {
    const details = buildEnrollmentDetailsViewModel({
      baseAmount: 13000,
      baseCurrency: 'PHP',
      enrollmentMonths: 12,
    });

    expect(details.estimatedTotal).toBeNull();
  });

  it('formats currency and Philippine phone numbers consistently', () => {
    expect(formatEnrollmentCurrency(13000, 'PHP')).toBe('₱13,000.00');
    expect(formatEnrollmentPhone('+639770884111')).toBe('+63 977 088 4111');
  });
});
