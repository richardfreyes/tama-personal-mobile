import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { useInitializeEnrollmentPaymentMethod } from '@/hooks/useInitializeEnrollmentPaymentMethod';
import { act, renderHook, waitFor } from '@testing-library/react-native';

const mockTransactionVault = jest.fn<(...args: any[]) => any>();
const mockEnrollmentVault = jest.fn<(...args: any[]) => any>();
const mockTransactionBin = jest.fn<(...args: any[]) => any>();
const mockEnrollmentBin = jest.fn<(...args: any[]) => any>();
const mockTransaction = jest.fn<(...args: any[]) => any>();
const mockEnrollment = jest.fn<(...args: any[]) => any>();
const mockLoading = {
  transactionVault: false,
  enrollmentVault: false,
  transactionBin: false,
  enrollmentBin: false,
  transaction: false,
  enrollment: false,
};

jest.mock('@/redux/features/merchants/merchantApi', () => ({
  useCreateMerchantTransactionPaymentVaultMutation: () => [
    mockTransactionVault,
    { isLoading: mockLoading.transactionVault },
  ],
  useCreateMerchantEnrollmentPaymentVaultMutation: () => [
    mockEnrollmentVault,
    { isLoading: mockLoading.enrollmentVault },
  ],
  useLazyGetMerchantTransactionPaymentBinQuery: () => [
    mockTransactionBin,
    { isLoading: mockLoading.transactionBin },
  ],
  useLazyGetMerchantEnrollmentPaymentBinQuery: () => [
    mockEnrollmentBin,
    { isLoading: mockLoading.enrollmentBin },
  ],
  useLazyGetMerchantTransactionQuery: () => [
    mockTransaction,
    { data: { kind: 'transaction' }, isLoading: mockLoading.transaction },
  ],
  useLazyGetMerchantEnrollmentQuery: () => [
    mockEnrollment,
    { data: { kind: 'enrollment' }, isLoading: mockLoading.enrollment },
  ],
}));

const resolvedTrigger = (value: any) => ({
  unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value),
});

const rejectedTrigger = (error: any) => ({
  unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue(error),
});

const cardPayload = {
  creditCardNumber: '4111 1111 1111 1111',
  expiryDate: '12/40',
  cardSecurityCode: '123',
  cardholderName: 'Ada Lovelace',
  cardOrigin: 'PH',
  billingStreet: '123 Main',
  billingCity: 'Makati',
  billingState: 'Metro Manila',
  billingCountry: 'Philippines',
  billingCountryCode: 'PH',
  billingPostalCode: '1200',
};

const makeArgs = (overrides = {}) => ({
  merchantId: 'merchant',
  transactionId: 'transaction',
  xsrfKey: 'xsrf',
  cardPayload,
  isEnrollment: false,
  onError: jest.fn<(...args: any[]) => any>(),
  ...overrides,
} as any);

describe('useInitializeEnrollmentPaymentMethod', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockLoading).forEach((key) => {
      mockLoading[key as keyof typeof mockLoading] = false;
    });
    mockTransactionBin.mockReturnValue(resolvedTrigger({
      account: { funding: 'credit', country: { code: 'PH' } },
      scheme: { name: 'visa' },
      issuer: { name: 'Bank' },
    }));
    mockEnrollmentBin.mockReturnValue(resolvedTrigger({
      account: { funding: 'credit', country: { code: 'PH' } },
      scheme: { name: 'visa' },
    }));
    mockTransactionVault.mockReturnValue(resolvedTrigger({ httpStatus: 200 }));
    mockEnrollmentVault.mockReturnValue(resolvedTrigger({ httpStatus: 201 }));
    mockTransaction.mockReturnValue(resolvedTrigger({ id: 'transaction' }));
    mockEnrollment.mockReturnValue(resolvedTrigger({ id: 'enrollment' }));
  });

  it('does nothing without card data and exposes no normalized details', () => {
    const args = makeArgs({ cardPayload: null });
    const { result } = renderHook(() => useInitializeEnrollmentPaymentMethod(args));
    expect(result.current.cardDetails).toBeNull();
    expect(result.current.isPaymentMethodReady).toBe(false);
    expect(args.onError).not.toHaveBeenCalled();
    expect(mockTransactionBin).not.toHaveBeenCalled();
  });

  it('reports missing transaction identifiers only once across rerenders', () => {
    const args = makeArgs({ merchantId: '' });
    const { rerender } = renderHook(() => useInitializeEnrollmentPaymentMethod(args));
    expect(args.onError).toHaveBeenCalledWith('Missing transaction details. Please try again.');
    rerender({});
    expect(args.onError).toHaveBeenCalledTimes(1);
  });

  it('rejects card numbers without a usable BIN', () => {
    const args = makeArgs({
      cardPayload: { ...cardPayload, creditCardNumber: '12345' },
    });
    renderHook(() => useInitializeEnrollmentPaymentMethod(args));
    expect(args.onError).toHaveBeenCalledWith('Invalid card number. Please re-enter your card details.');
    expect(mockTransactionBin).not.toHaveBeenCalled();
  });

  it('looks up, vaults, refreshes, and marks a transaction payment method ready', async () => {
    const args = makeArgs();
    const { result } = renderHook(() => useInitializeEnrollmentPaymentMethod(args));
    await waitFor(() => expect(result.current.isPaymentMethodReady).toBe(true));
    expect(mockTransactionBin).toHaveBeenCalledWith({
      merchantCode: 'merchant',
      transactionId: 'transaction',
      xsrfKey: 'xsrf',
      binNumber: '411111',
    });
    expect(mockTransactionVault).toHaveBeenCalledWith(expect.objectContaining({
      merchantCode: 'merchant',
      transactionId: 'transaction',
      body: expect.objectContaining({
        creditCardNumber: '4111111111111111',
        cardholderFirstName: 'Ada',
        cardholderLastName: 'Lovelace',
      }),
    }));
    expect(mockTransaction).toHaveBeenCalled();
    expect(result.current.merchantTransactionData).toEqual({ kind: 'transaction' });
  });

  it('uses enrollment endpoints and can fetch latest enrollment details', async () => {
    const args = makeArgs({ isEnrollment: true, transactionId: 'enrollment' });
    const { result } = renderHook(() => useInitializeEnrollmentPaymentMethod(args));
    await waitFor(() => expect(result.current.isPaymentMethodReady).toBe(true));
    expect(mockEnrollmentBin).toHaveBeenCalled();
    expect(mockEnrollmentVault).toHaveBeenCalledWith(expect.objectContaining({
      enrollmentId: 'enrollment',
    }));
    expect(result.current.merchantTransactionData).toEqual({ kind: 'enrollment' });

    await act(async () => {
      await result.current.getLatestMerchantTransaction();
    });
    expect(mockEnrollment).toHaveBeenLastCalledWith({
      merchantCode: 'merchant',
      enrollmentId: 'enrollment',
      xsrfKey: 'xsrf',
    });
  });

  it('reports unsuccessful vault status and thrown errors without becoming ready', async () => {
    const args = makeArgs();
    mockTransactionVault.mockReturnValueOnce(resolvedTrigger({
      httpStatus: 400,
      message: 'Vault declined',
    }));
    const { result, unmount } = renderHook(() => useInitializeEnrollmentPaymentMethod(args));
    await waitFor(() => expect(args.onError).toHaveBeenCalledWith('Vault declined'));
    expect(result.current.isPaymentMethodReady).toBe(false);
    unmount();

    jest.clearAllMocks();
    mockTransactionBin.mockReturnValueOnce(rejectedTrigger({ data: { message: 'BIN unavailable' } }));
    const errorArgs = makeArgs();
    renderHook(() => useInitializeEnrollmentPaymentMethod(errorArgs));
    await waitFor(() => expect(errorArgs.onError).toHaveBeenCalledWith('BIN unavailable'));
  });

  it('resets readiness and combines all loading flags', async () => {
    const args = makeArgs();
    const { result, rerender } = renderHook(() => useInitializeEnrollmentPaymentMethod(args));
    await waitFor(() => expect(result.current.isPaymentMethodReady).toBe(true));
    act(() => result.current.resetPaymentMethodState());
    expect(result.current.isPaymentMethodReady).toBe(false);

    mockLoading.enrollmentBin = true;
    rerender({});
    expect(result.current.isInitializingPaymentMethod).toBe(true);
  });
});

describe('useInitializeEnrollmentPaymentMethod enrollment 3DS hand-off', () => {
  const VERIFY_URL = 'https://maya.test/3ds';

  const setup = async (overrides = {}) => {
    const args = makeArgs({ isEnrollment: true, ...overrides });
    const hook = renderHook(() => useInitializeEnrollmentPaymentMethod(args));
    await waitFor(() => expect(mockEnrollmentVault).toHaveBeenCalled());
    return { args, ...hook };
  };

  beforeEach(() => {
    mockEnrollmentBin.mockReturnValue(resolvedTrigger({
      account: { funding: 'credit', country: { code: 'PH' } },
      scheme: { name: 'visa' },
    }));
    mockEnrollment.mockReturnValue(resolvedTrigger({ id: 'enrollment' }));
    mockEnrollmentVault.mockReturnValue(resolvedTrigger({
      httpStatus: 202, verificationRequired: true, redirect: VERIFY_URL,
    }));
  });

  it('holds the card back and exposes the 3DS url while verification is pending', async () => {
    const { result, args } = await setup();

    await waitFor(() => expect(result.current.cardVerificationUrl).toBe(VERIFY_URL));
    expect(result.current.isPaymentMethodReady).toBe(false);
    expect(args.onError).not.toHaveBeenCalled();
  });

  it('is ready only after verification succeeds and the enrollment is refreshed', async () => {
    const { result } = await setup();
    await waitFor(() => expect(result.current.cardVerificationUrl).toBe(VERIFY_URL));
    mockEnrollment.mockClear();

    await act(async () => { await result.current.handleCardVerificationSuccess(); });

    expect(mockEnrollment).toHaveBeenCalledTimes(1);
    expect(result.current.cardVerificationUrl).toBeNull();
    expect(result.current.isPaymentMethodReady).toBe(true);
  });

  it('does not enroll when the verification result is delivered twice', async () => {
    const { result } = await setup();
    await waitFor(() => expect(result.current.cardVerificationUrl).toBe(VERIFY_URL));
    mockEnrollment.mockClear();

    await act(async () => {
      await result.current.handleCardVerificationSuccess();
      await result.current.handleCardVerificationSuccess();
    });

    expect(mockEnrollment).toHaveBeenCalledTimes(1);
  });

  it('resets and reports a declined card', async () => {
    const { result, args } = await setup();
    await waitFor(() => expect(result.current.cardVerificationUrl).toBe(VERIFY_URL));

    act(() => { result.current.handleCardVerificationFailure('Your card was declined.'); });

    expect(args.onError).toHaveBeenCalledWith('Your card was declined.');
    expect(result.current.cardVerificationUrl).toBeNull();
    expect(result.current.isPaymentMethodReady).toBe(false);
  });

  it('treats closing the 3DS page before it finishes as a failure', async () => {
    const { result, args } = await setup();
    await waitFor(() => expect(result.current.cardVerificationUrl).toBe(VERIFY_URL));

    act(() => { result.current.handleCardVerificationDismissed(); });

    expect(args.onError).toHaveBeenCalledTimes(1);
    expect(result.current.isPaymentMethodReady).toBe(false);
  });

  it('ignores the dismiss that follows a successful verification', async () => {
    const { result, args } = await setup();
    await waitFor(() => expect(result.current.cardVerificationUrl).toBe(VERIFY_URL));

    await act(async () => { await result.current.handleCardVerificationSuccess(); });
    act(() => { result.current.handleCardVerificationDismissed(); });

    expect(args.onError).not.toHaveBeenCalled();
    expect(result.current.isPaymentMethodReady).toBe(true);
  });

  it('is ready straight away when Maya needs no 3DS', async () => {
    mockEnrollmentVault.mockReturnValue(resolvedTrigger({ httpStatus: 200 }));

    const { result } = await setup();

    await waitFor(() => expect(result.current.isPaymentMethodReady).toBe(true));
    expect(result.current.cardVerificationUrl).toBeNull();
  });

  it('never opens a 3DS page for a one-time transaction', async () => {
    mockTransactionVault.mockReturnValue(resolvedTrigger({ httpStatus: 200, verificationRequired: true, redirect: VERIFY_URL }));
    const args = makeArgs({ isEnrollment: false });
    const { result } = renderHook(() => useInitializeEnrollmentPaymentMethod(args));

    await waitFor(() => expect(result.current.isPaymentMethodReady).toBe(true));
    expect(result.current.cardVerificationUrl).toBeNull();
  });
});
