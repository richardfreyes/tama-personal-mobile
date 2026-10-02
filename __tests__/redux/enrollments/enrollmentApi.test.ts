import { describe, expect, it, jest } from '@jest/globals';
import { fetchAllEnrollments, transformEnrollmentsResponse } from '@/redux/features/enrollments/enrollmentApi';
import { getUpcomingBillsForMonth } from '@/utils/upcomingBills';

jest.mock('@react-native-async-storage/async-storage', () => (
  {
    __esModule: true,
    default: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
  }
));

describe('enrollmentApi', () => {
  it('transforms enrollments response into list pagination shape', () => {
    const response = {
      enrollments: [
        {
          referenceId: 'ENR-001',
          transactionId: 'txn-001',
          externalTransactionId: 'ext-001',
          merchantName: 'Aqwire Homes',
          customerName: 'Jane Customer',
          status: 'active',
          baseAmount: 1234.56,
          baseCurrency: 'PHP',
        },
      ],
      pagination: {
        limit: 10,
        offset: 0,
        total: 1,
      },
    };

    expect(transformEnrollmentsResponse(response, {
      page: 0,
      count: 10,
      searchQuery: '',
    })).toEqual({
      items: response.enrollments,
      totalCount: 1,
      currentPage: 0,
      limit: 10,
      offset: 0,
    });
  });

  it('fetches beyond the first 10 enrollments, deduplicates pages, and exposes the true nearest bill', async () => {
    const firstPage = Array.from({ length: 10 }, (_, index) => ({
      referenceId: `ENR-${index}`,
      baseAmount: 100 + index,
      baseCurrency: 'PHP',
      nextDebitDate: '2026-09-05T00:00:00.000Z',
    }));
    const nearestEnrollment = {
      referenceId: 'ENR-NEAREST',
      baseAmount: 2300,
      baseCurrency: 'PHP',
      nextDebitDate: '2026-08-23T00:00:00.000Z',
    };
    const baseQuery = jest.fn<(...args: any[]) => any>()
      .mockResolvedValueOnce({
        data: {
          enrollments: firstPage,
          pagination: { limit: 10, offset: 0, total: 12 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          enrollments: [firstPage[9], nearestEnrollment],
          pagination: { limit: 10, offset: 10, total: 12 },
        },
      });

    const result = await fetchAllEnrollments(baseQuery);

    expect(baseQuery).toHaveBeenCalledTimes(2);
    expect(baseQuery).toHaveBeenNthCalledWith(1, 'enrollments?page=0&count=10&searchQuery=');
    expect(baseQuery).toHaveBeenNthCalledWith(2, 'enrollments?page=1&count=10&searchQuery=');
    expect(result.data?.items).toHaveLength(11);
    expect(result.data?.items.filter((item) => item.referenceId === 'ENR-9')).toHaveLength(1);

    const bills = getUpcomingBillsForMonth(
      result.data?.items ?? [],
      new Date('2026-07-13T08:00:00.000Z'),
    );
    expect(bills.map((bill) => bill.enrollment.referenceId)).toEqual(['ENR-NEAREST']);
  });

  it('uses the response limit and terminates when the API repeats an offset', async () => {
    const firstPage = [
      { referenceId: 'ENR-1' },
      { referenceId: 'ENR-2' },
    ];
    const baseQuery = jest.fn<(...args: any[]) => any>()
      .mockResolvedValueOnce({
        data: {
          enrollments: firstPage,
          pagination: { limit: 2, offset: 0, total: 6 },
        },
      })
      .mockResolvedValueOnce({
        data: {
          enrollments: firstPage,
          pagination: { limit: 2, offset: 0, total: 6 },
        },
      });

    const result = await fetchAllEnrollments(baseQuery);

    expect(baseQuery).toHaveBeenCalledTimes(2);
    expect(baseQuery).toHaveBeenNthCalledWith(2, 'enrollments?page=1&count=2&searchQuery=');
    expect(result.data?.items).toEqual(firstPage);
  });

  it('does not request another page after the reported total is loaded', async () => {
    const baseQuery = jest.fn<(...args: any[]) => any>().mockResolvedValue({
      data: {
        enrollments: [{ referenceId: 'ENR-ONLY' }],
        pagination: { limit: 10, offset: 0, total: 1 },
      },
    });

    await fetchAllEnrollments(baseQuery);

    expect(baseQuery).toHaveBeenCalledTimes(1);
  });
});
