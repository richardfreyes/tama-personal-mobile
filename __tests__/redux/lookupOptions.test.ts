import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { API_PATHS } from '@/redux/apiPaths';
import { fetchLookupOptions } from '@/redux/features/lookupOptions/lookupOptions';

const field = (key: string, location?: string) => ({
  fieldType: 'lookup',
  key,
  lookupReference: location ? { location } : undefined,
});

describe('fetchLookupOptions', () => {
  const api = {} as any;
  const extra = {} as any;

  beforeEach(() => { jest.clearAllMocks(); });

  it('fetches all supported app lookups and ignores non-lookup fields', async () => {
    const baseQuery = jest.fn<(...args: any[]) => any>((endpoint) => Promise.resolve({
      data: { endpoint },
    }));
    const formConfig = [
      field('projectName'),
      field('paymentType'),
      field('propertyType'),
      field('salesChannel'),
      field('paymentOption'),
      field('paymentMode'),
      field('month'),
      field('paymentYear'),
      field('chargeType'),
      field('custom', '/custom'),
      { fieldType: 'text', key: 'ignored' },
    ] as any;

    const result = await fetchLookupOptions({
      id: 9,
      formConfig,
      source: 'app',
      baseQuery,
      api,
      extra,
    });

    expect(baseQuery.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      API_PATHS.dashboard.getBillerProjects(9),
      API_PATHS.dashboard.getBillerPaymentTypes(9),
      API_PATHS.dashboard.getBillerPropertyTypes(9),
      API_PATHS.dashboard.getBillerSalesChannel(9),
      API_PATHS.dashboard.getBillerPaymentOptions(9),
      API_PATHS.dashboard.getBillerPaymentModes(9),
      API_PATHS.dashboard.getBillerMonths(9),
      API_PATHS.dashboard.getBillerPaymentYears(9),
      API_PATHS.dashboard.getBillerChargeTypes(9),
      '/custom',
    ]);
    expect((result as any).data.custom).toEqual({ endpoint: '/custom' });
  });

  it('routes enrollment lookups through merchant endpoints', async () => {
    const baseQuery = jest.fn<(...args: any[]) => any>((endpoint) => Promise.resolve({ data: endpoint }));
    await fetchLookupOptions({
      id: 'MERCHANT',
      formConfig: [
        field('projectName'),
        field('paymentType'),
        field('paymentMode'),
        field('custom', '/enrollment-custom'),
      ] as any,
      source: 'enrollment',
      baseQuery,
      api,
      extra,
    });
    expect(baseQuery.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      API_PATHS.merchant.getProjects('MERCHANT'),
      API_PATHS.merchant.getPaymentTypes('MERCHANT'),
      API_PATHS.merchant.getMerchantById('MERCHANT'),
      '/enrollment-custom',
    ]);
  });

  it.each([
    ['payee', 'serviceTypes'],
    ['serviceType', 'serviceTypes'],
    ['paymentType', 'otherPaymentTypes'],
  ])('resolves self lookup %s from biller config %s', async (key, location) => {
    const options = [{ code: 'FLI', name: 'Filinvest Land' }];
    const baseQuery = jest.fn<(...args: any[]) => any>().mockResolvedValue({ data: options });
    const result = await fetchLookupOptions({
      id: 55,
      formConfig: [{ ...field(key), lookupReference: { source: 'self', location } }] as any,
      source: 'app',
      baseQuery,
      api,
      extra,
    });

    expect(baseQuery).toHaveBeenCalledTimes(1);
    expect(baseQuery).toHaveBeenCalledWith(`biller/55/config/${location}`, api, extra);
    expect(result).toEqual({ data: { [key]: options } });
  });

  it('omits fields without endpoints and individual failed lookups', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const baseQuery = jest.fn<(...args: any[]) => any>()
      .mockResolvedValueOnce({ error: { status: 404 } })
      .mockResolvedValueOnce({ data: ['ok'] });
    const result = await fetchLookupOptions({
      id: 1,
      formConfig: [
        field('custom-without-location'),
        field('projectName'),
        field('paymentType'),
      ] as any,
      source: 'app',
      baseQuery,
      api,
      extra,
    });
    expect(result).toEqual({ data: { paymentType: ['ok'] } });
    expect(consoleError).toHaveBeenCalledWith(
      'Error fetching lookup options for projectName:',
      { status: 404 },
    );
    consoleError.mockRestore();
  });

  it('returns a normalized 500 error when lookup execution throws', async () => {
    const result = await fetchLookupOptions({
      id: 1,
      formConfig: [field('projectName')] as any,
      source: 'app',
      baseQuery: jest.fn<(...args: any[]) => any>().mockRejectedValue(new Error('boom')),
      api,
      extra,
    });
    expect(result).toEqual({
      error: {
        status: 500,
        data: 'Failed to fetch lookup options due to an internal error.',
      },
    });
  });
});
