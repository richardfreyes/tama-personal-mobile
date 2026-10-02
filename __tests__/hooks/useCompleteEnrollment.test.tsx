import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useCompleteEnrollment } from '@/hooks/useCompleteEnrollment';
import { act, renderHook } from '@testing-library/react-native';

const mockCreateEnrollment = jest.fn<(...args: any[]) => any>();

jest.mock('@/redux/features/merchants/merchantApi', () => ({
  useCreateMerchantEnrollmentEnrollMutation: () => [
    mockCreateEnrollment,
    { isLoading: false },
  ],
}));

const resolvedTrigger = (value: any) => ({
  unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value),
});

const rejectedTrigger = (error: any) => ({
  unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue(error),
});

const makeArgs = () => ({
  merchantId: 'merchant',
  transactionId: 'enrollment',
  xsrfKey: 'xsrf',
  getLatestMerchantTransaction: jest.fn<(...args: any[]) => any>().mockResolvedValue({ referenceId: 'LATEST-REF', status: 'ONGOING' }),
  onError: jest.fn<(...args: any[]) => any>(),
  onNotice: jest.fn<(...args: any[]) => any>(),
  onSuccess: jest.fn<(...args: any[]) => any>(),
});

describe('useCompleteEnrollment', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('blocks invalid submissions before calling the API', async () => {
    const args = { ...makeArgs(), merchantId: '' };
    const { result } = renderHook(() => useCompleteEnrollment(args));
    await act(async () => result.current.submitEnrollment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onError).toHaveBeenCalledWith(expect.stringContaining('Missing transaction details'));
    expect(mockCreateEnrollment).not.toHaveBeenCalled();
  });

  it('opens verification and completes success only for a successful callback', async () => {
    const args = makeArgs();
    mockCreateEnrollment.mockReturnValue(resolvedTrigger({
      httpStatus: 201,
      verification_url: 'https://verify.example.test/receipt/ENR-REF',
      accessSignature: 'SIG',
      accessType: 'view',
      message: 'Verify enrollment',
    }));
    const { result } = renderHook(() => useCompleteEnrollment(args));
    await act(async () => result.current.submitEnrollment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onNotice).toHaveBeenCalledWith('Verify enrollment', 'success');
    expect(result.current.pendingVerification).toEqual({
      url: 'https://verify.example.test/receipt/ENR-REF',
      accessSignature: 'SIG',
      accessType: 'view',
    });

    await act(async () => { await result.current.handleVerificationComplete({ outcome: 'cancelled' } as any); });
    expect(args.onSuccess).not.toHaveBeenCalled();

    await act(async () => result.current.submitEnrollment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    await act(async () => { await result.current.handleVerificationComplete({ outcome: 'success' } as any); });
    expect(args.onSuccess).toHaveBeenCalledWith(expect.objectContaining({
      referenceId: 'LATEST-REF',
      receiptAccessSignature: 'SIG',
    }));
    expect(result.current.pendingVerification).toBeNull();
  });

  it('completes immediately and resolves a missing reference from latest data', async () => {
    const args = makeArgs();
    mockCreateEnrollment.mockReturnValue(resolvedTrigger({
      httpStatus: 201,
      accessSignature: 'SIG',
    }));
    const { result } = renderHook(() => useCompleteEnrollment(args));
    await act(async () => result.current.submitEnrollment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.getLatestMerchantTransaction).toHaveBeenCalled();
    expect(args.onSuccess).toHaveBeenCalledWith(expect.objectContaining({
      referenceId: 'LATEST-REF',
      receiptAccessSignature: 'SIG',
      receiptAccessType: 'view',
    }));
  });

  it('reports incomplete success responses, unexpected statuses, and thrown API errors', async () => {
    const args = makeArgs();
    const { result } = renderHook(() => useCompleteEnrollment(args));

    mockCreateEnrollment.mockReturnValueOnce(resolvedTrigger({ httpStatus: 201 }));
    args.getLatestMerchantTransaction.mockResolvedValueOnce({ status: 'ONGOING' });
    await act(async () => result.current.submitEnrollment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onError).toHaveBeenLastCalledWith('Enrollment completed, but the receipt reference was not returned.');

    mockCreateEnrollment.mockReturnValueOnce(resolvedTrigger({
      httpStatus: 201,
      referenceId: 'REF',
    }));
    await act(async () => result.current.submitEnrollment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onError).toHaveBeenLastCalledWith('Enrollment completed, but receipt authorization was not returned.');

    mockCreateEnrollment.mockReturnValueOnce(resolvedTrigger({ httpStatus: 409, message: 'Already enrolled' }));
    await act(async () => result.current.submitEnrollment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onError).toHaveBeenLastCalledWith('Already enrolled');

    mockCreateEnrollment.mockReturnValueOnce(rejectedTrigger({ data: { error: 'Unavailable' } }));
    await act(async () => result.current.submitEnrollment({
      hasAcceptedTerms: true,
      isPaymentMethodReady: true,
    }));
    expect(args.onError).toHaveBeenLastCalledWith('Unavailable');
  });

  it('reports a successful callback that has no pending context', async () => {
    const args = makeArgs();
    const { result } = renderHook(() => useCompleteEnrollment(args));
    await act(async () => { await result.current.handleVerificationComplete({ outcome: 'success' } as any); });
    expect(args.onError).toHaveBeenCalledWith(expect.stringContaining('Missing'));
  });
});
