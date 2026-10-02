import { describe, expect, it } from '@jest/globals';
import type { Enrollment } from '../../types/enrollment';
import { getUpcomingBillsForMonth } from '../../utils/upcomingBills';

const NOW = new Date('2026-07-13T08:00:00.000Z');

describe('getUpcomingBillsForMonth', () => {
  it('keeps only remaining current-month bills, sorts them, and derives timing statuses', () => {
    const enrollments: Enrollment[] = [
      {
        referenceId: 'upcoming',
        propertyName: 'Upcoming Property',
        baseAmount: 3000,
        baseCurrency: 'PHP',
        nextDebitDate: '2026-07-25T00:00:00.000Z',
      },
      {
        referenceId: 'overdue',
        merchantName: 'Overdue Merchant',
        baseAmount: 1000,
        baseCurrency: 'PHP',
        nextDebitDate: '2026-07-10T00:00:00.000Z',
      },
      {
        referenceId: 'due-soon',
        merchantName: 'Due Soon Merchant',
        projectName: 'Due Soon Project',
        baseAmount: 2000,
        baseCurrency: 'PHP',
        nextDebitDate: '2026-07-15T00:00:00.000Z',
      },
      {
        referenceId: 'next-month',
        nextDebitDate: '2026-08-01T00:00:00.000Z',
      },
    ];

    const bills = getUpcomingBillsForMonth(enrollments, NOW);

    expect(bills.map((bill) => bill.enrollment.referenceId)).toEqual(['due-soon', 'upcoming']);
    expect(bills.map((bill) => bill.status)).toEqual(['Due Soon', 'Upcoming']);
    expect(bills[0].title).toBe('Due Soon Project');
    expect(bills[0].merchantName).toBe('Due Soon Merchant');
    expect(bills[0].daysRemainingLabel).toBe('2 days remaining');
    expect(bills[0].isNearestUpcoming).toBe(false);
  });

  it('supports nested upcoming bill records while preserving the parent enrollment', () => {
    const enrollment: Enrollment = {
      referenceId: 'ENR-NESTED',
      propertyName: 'Nested Property',
      baseCurrency: 'PHP',
      nextDebitDate: '2026-07-05T00:00:00.000Z',
      upcomingBills: [
        { id: 'bill-1', amountDue: 1750, dueDate: '2026-07-18T00:00:00.000Z' },
        { id: 'bill-2', amountDue: 1800, dueDate: '2026-08-18T00:00:00.000Z' },
      ],
    };

    const bills = getUpcomingBillsForMonth([enrollment], NOW);

    expect(bills).toHaveLength(1);
    expect(bills[0].amount).toBe('PHP 1,750.00');
    expect(bills[0].dueDateLabel).toBe('Jul 18, 2026');
    expect(bills[0].title).toBe('Nested Property');
    expect(bills[0].enrollment).toBe(enrollment);
  });

  it('keeps every bill in the nearest future month, including bills sharing a date', () => {
    const enrollments: Enrollment[] = [
      {
        referenceId: 'later',
        baseAmount: 90,
        baseCurrency: 'USD',
        nextDebitDate: '2026-09-01T00:00:00.000Z',
      },
      {
        referenceId: 'nearest',
        baseAmount: 80,
        baseCurrency: 'USD',
        nextDebitDate: '2026-08-01T00:00:00.000Z',
      },
      {
        referenceId: 'same-month',
        baseAmount: 85,
        baseCurrency: 'USD',
        nextDebitDate: '2026-08-27T00:00:00.000Z',
      },
      {
        referenceId: 'same-date',
        baseAmount: 86,
        baseCurrency: 'USD',
        nextDebitDate: '2026-08-27T00:00:00.000Z',
      },
      {
        referenceId: 'past',
        baseAmount: 70,
        baseCurrency: 'USD',
        nextDebitDate: '2026-07-01T00:00:00.000Z',
      },
    ];

    const bills = getUpcomingBillsForMonth(enrollments, NOW);

    expect(bills.map((bill) => bill.enrollment.referenceId)).toEqual([
      'nearest',
      'same-month',
      'same-date',
    ]);
    expect(bills.map((bill) => bill.dueDateLabel)).toEqual([
      'Aug 01, 2026',
      'Aug 27, 2026',
      'Aug 27, 2026',
    ]);
    expect(bills.every((bill) => bill.isNearestUpcoming)).toBe(true);
  });

  it('returns no bills for empty or invalid debit-date results', () => {
    const enrollments: Enrollment[] = [
      { referenceId: 'missing', nextDebitDate: null },
      { referenceId: 'invalid', nextDebitDate: 'not-a-date' },
      {
        referenceId: 'invalid-nested',
        upcomingBills: [{ id: 'invalid-bill', dueDate: 'still-not-a-date' }],
      },
    ];

    expect(getUpcomingBillsForMonth([], NOW)).toEqual([]);
    expect(getUpcomingBillsForMonth(enrollments, NOW)).toEqual([]);
  });
});
