import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useCompleteEnrollmentPayment } from '@/hooks/useCompleteEnrollmentPayment';
import { act, renderHook, waitFor } from '@testing-library/react-native';

const mockCreatePayment = jest.fn<(...args: any[]) => any>();
const mockGetReceiptKeys = jest.fn<(...args: any[]) => any>();

jest.mock('@/redux/features/merchants/merchantApi', () => ({
  useCreateMerchantTransactionPaymentCkoMutation: () => [
    mockCreatePayment,
    { isLoading: false },
  ],
  useLazyGetMerchantReceiptKeysQuery: () => [mockGetReceiptKeys],
}));

const resolvedTrigger = (value: any) => ({
  unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value),
});

const rejectedTrigger = (error: any) => ({
  unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue(error),
});

const makeArgs = () => ({
  merchantId: 'merchant',
  transactionId: 'transaction',
  xsrfKey: 'xsrf',
  getLatestMerchantTransaction: jest.fn<(...args: any[]) => any>().mockResolvedValue({ referenceId: 'LATEST-REF' }),
  onError: jest.fn<(...args: any[]) => any>(),
  onNotice: jest.fn<(...args: any[]) => any>(),
  onSuccess: jest.fn<(...args: any[]) => any>(),
});

describe('useCompleteEnrollmentPayment', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it.each([
    [{ hasAcceptedTerms: true, isPaymentMethodReady: true }, { merchantId: '' }, 'Missing transaction details'],
    [{ hasAcceptedTerms: true, isPaymentMethodReady: false }, {}, 'payment method'],
    [{ hasAcceptedTerms: false, isPaymentMethodReady: true }, {}, 'Terms'],
  ])('blocks invalid submissions %#', async (submission, overrides, message) => {
    const args = { ...makeArgs(), ...overrides };
    const { result } = renderHook(() => useCompleteEnrollmentPayment(args));
    await act(async () => result.current.submitPayment(submission));
    expect(args.onError).toHaveBeenCalledWith(expect.stringContaining(message));
    expect(mockCreatePayment).not.toHaveBeenCalled();
  });

  it('starts redirect verification and completes the receipt flow afterward', async () => {
    const args = makeArgs();
    mockCreatePayment.mockReturnValue(resolvedTrigger({
      httpStatus: 201,
      redirectUrl: 'https://checkout.example.test/receipt/REDIRECT-REF',
    }));
    mockGetReceiptKeys.mockReturnValue(resolvedTrigger({
      accessSignature: 'SIG',
      accessType: 'view',
    }));
    const { result } = renderHook(() => useCompleteEnrollmentPayment(args));

    await act(async () => result.current.submitPayment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));

    expect(args.onNotice).toHaveBeenCalledWith(expect.stringContaining('pending'), 'success');
    expect(result.current.pendingPaymentRedirect).toEqual({
      url: 'https://checkout.example.test/receipt/REDIRECT-REF',
    });
    expect(args.onSuccess).not.toHaveBeenCalled();

    act(() => result.current.handlePaymentRedirectComplete());
    await waitFor(() => expect(args.onSuccess).toHaveBeenCalledWith(expect.objectContaining({
      referenceId: 'REDIRECT-REF',
      receiptAccessSignature: 'SIG',
      receiptAccessType: 'view',
    })));
    expect(result.current.pendingPaymentRedirect).toBeNull();
  });

  it('completes immediately using the latest transaction and receipt keys', async () => {
    const args = makeArgs();
    mockCreatePayment.mockReturnValue(resolvedTrigger({ httpStatus: 201 }));
    mockGetReceiptKeys.mockReturnValue(resolvedTrigger({
      data: { reference_id: 'LATEST-REF', access_signature: 'SIG' },
    }));
    const { result } = renderHook(() => useCompleteEnrollmentPayment(args));

    await act(async () => result.current.submitPayment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));

    expect(args.getLatestMerchantTransaction).toHaveBeenCalled();
    expect(args.onSuccess).toHaveBeenCalledWith(expect.objectContaining({
      referenceId: 'LATEST-REF',
      receiptAccessSignature: 'SIG',
    }));
  });

  it('reports unexpected statuses, missing references, and API failures', async () => {
    const args = makeArgs();
    const { result } = renderHook(() => useCompleteEnrollmentPayment(args));
    mockCreatePayment.mockReturnValueOnce(resolvedTrigger({ httpStatus: 400, message: 'Declined' }));
    await act(async () => result.current.submitPayment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onError).toHaveBeenLastCalledWith('Declined');

    mockCreatePayment.mockReturnValueOnce(resolvedTrigger({ httpStatus: 201 }));
    args.getLatestMerchantTransaction.mockResolvedValueOnce({});
    await act(async () => result.current.submitPayment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onError).toHaveBeenLastCalledWith('Payment completed, but the receipt reference was not returned.');

    mockCreatePayment.mockReturnValueOnce(rejectedTrigger({ data: { message: 'Network unavailable' } }));
    await act(async () => result.current.submitPayment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onError).toHaveBeenLastCalledWith('Network unavailable');
  });

  it('reports missing redirect context and invalid receipt authorization', async () => {
    const args = makeArgs();
    const { result } = renderHook(() => useCompleteEnrollmentPayment(args));
    act(() => result.current.handlePaymentRedirectComplete());
    expect(args.onError).toHaveBeenCalledWith(expect.stringContaining('Missing'));

    mockCreatePayment.mockReturnValue(resolvedTrigger({
      httpStatus: 201,
      referenceId: 'REF',
    }));
    mockGetReceiptKeys.mockReturnValue(resolvedTrigger({ referenceId: 'REF' }));
    await act(async () => result.current.submitPayment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onError).toHaveBeenLastCalledWith('Payment completed, but the receipt reference was not returned.');
  });
});
