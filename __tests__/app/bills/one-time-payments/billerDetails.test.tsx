import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import PayBillScreen from '@/app/(app)/bills/one-time-payments/pay/[billingReferenceId]';
import { modalActions } from '@/utils/modalActions';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const mockDispatch = jest.fn<(...args: any[]) => any>();
const mockDeleteBill = jest.fn<(...args: any[]) => any>();
const mockCreateComputation = jest.fn<(...args: any[]) => any>();
const mockDeletePaymentMethod = jest.fn<(...args: any[]) => any>();
const mockResetComputation = jest.fn<(...args: any[]) => any>();
const mockState = { oneTimePayment: { lastCompletedInvoiceReferenceId: null as string | null } };
const mockRouter = { back: jest.fn<(...args: any[]) => any>(), push: jest.fn<(...args: any[]) => any>() };
const mockParams: Record<string, any> = {};
const mockBillerQuery = { data: [] as any[] };
const mockBillQuery = { data: undefined as any, isLoading: false, isError: false, refetch: jest.fn() };
const mockPaymentMethodsQuery = { data: [] as any[] };
const mockComputationState = { isLoading: false, reset: mockResetComputation };

jest.mock('expo-router', () => ({
  router: {
    back: (...args: any[]) => mockRouter.back(...args),
    push: (...args: any[]) => mockRouter.push(...args),
  },
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (callback: any) => {
    const { useEffect } = jest.requireActual<typeof import('react')>('react');
    useEffect(() => callback(), [callback]);
  },
}));
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(mockState),
}));
jest.mock('@/redux/features/biller/billerApi', () => ({
  useGetBillersQuery: () => mockBillerQuery,
}));
jest.mock('@/redux/features/bills/billsApi', () => ({
  useDeleteBillMutation: () => [mockDeleteBill, { isLoading: false }],
}));
jest.mock('@/redux/features/billDetail/billDetailApi', () => ({
  useGetBillDetailQuery: () => mockBillQuery,
}));
jest.mock('@/redux/features/paymentMethods/paymentMethodApi', () => ({
  useDeleteCardPaymentMutation: () => [mockDeletePaymentMethod, { isLoading: false }],
  useGetPaymentMethodsQuery: () => mockPaymentMethodsQuery,
}));
jest.mock('@/redux/features/transactions/transactionApi', () => ({
  useCreateTransactionComputationMutation: () => [mockCreateComputation, mockComputationState],
}));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: function MockGlobalScrollView({ children }: any) {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  function MockNavHeaderComponent({ title, rightNav, variant }: any) {
    const { Pressable, Text, View } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <View>
        <Text>{`Nav:${title}:${variant}`}</Text>
        {rightNav ? (
          <Pressable accessibilityLabel={rightNav.accessibilityLabel} accessibilityRole="button" onPress={rightNav.onPress}>
            <Text>Remove saved biller</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
));
jest.mock('@/components/forms/InputValidationComponent', () => (
  function MockInputValidationComponent({ label, placeholder, value, setValue, errors, field, helperText }: any) {
    const { Text, TextInput, View } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <View>
        <TextInput accessibilityLabel={label ?? placeholder} value={value} onChangeText={setValue} />
        {helperText ? <Text>{helperText}</Text> : null}
        {errors?.[field] ? <Text>{errors[field]}</Text> : null}
      </View>
    );
  }
));
jest.mock('@/components/payments/PaymentMethodsComponent', () => (
  function MockPaymentMethodsComponent({ onAddPaymentMethod, onSelectMethod, selectedMethodId }: any) {
    const { Pressable, Text, View } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <View>
        <Text>{`Selected:${selectedMethodId ?? 'none'}`}</Text>
        {mockPaymentMethodsQuery.data.map((method: any) => (
          <Pressable accessibilityRole="radio" key={method.referenceId} onPress={() => onSelectMethod(method)}>
            <Text>{`Card ${method.referenceId}`}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" onPress={onAddPaymentMethod}><Text>Add Payment Method</Text></Pressable>
      </View>
    );
  }
));

const field = (text: string, value: string) => ({ text, value });
const makeBill = (overrides: Record<string, any> = {}) => ({
  billing_id: 7,
  billing_reference_id: 'bill-1',
  billing_name: 'Filinvest Land',
  merchant_name: 'FLI',
  merchant_id: 55,
  client_notes: '',
  custom_fields: {
    amount: field('Amount Due', '10,000.00'),
    paymentName: field('Payment Name', 'HDMF Refiling Fee'),
    projectName: field('Project Name', '100 West Makati Tower'),
    contractNo: field('Contract Number', '1231232346433246'),
    customerName: field('Full Name', 'Richard'),
  },
  ...overrides,
});
const visa = { referenceId: 'card-1', isPrimary: true, paymentMethodProvider: 'visa', lastFourCardDigits: '4242' };
const mastercard = { referenceId: 'card-2', isPrimary: false, paymentMethodProvider: 'mastercard', lastFourCardDigits: '5555' };

const resolvedTrigger = (value: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockResolvedValue(value) });
const rejectedTrigger = (error: any) => ({ unwrap: jest.fn<(...args: any[]) => any>().mockRejectedValue(error) });
const computationFor = (base: number) => ({
  transactionReferenceId: 'transaction-1',
  invoiceReferenceId: 'invoice-1',
  computation: {
    baseAmount: base, totalAmount: base + 25, totalCurrency: 'PHP', feeAmount: 25, feeCurrency: 'PHP', invoiceReferenceId: 'invoice-1',
  },
});

const amountField = () => screen.getByLabelText('Amount to pay');
const confirm = () => screen.getByRole('button', { name: 'Confirm' });
const isDisabled = (button: ReturnType<typeof confirm>) => Boolean(button.props.accessibilityState?.disabled);

const settleFee = async () => {
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
};

describe('Biller Details', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    Object.assign(mockParams, { billingReferenceId: 'bill-1', merchantName: 'Merchant One' });
    mockBillerQuery.data = [];
    Object.assign(mockBillQuery, { data: makeBill(), isLoading: false, isError: false, refetch: jest.fn() });
    mockPaymentMethodsQuery.data = [visa, mastercard];
    Object.assign(mockComputationState, { isLoading: false, reset: mockResetComputation });
    mockState.oneTimePayment.lastCompletedInvoiceReferenceId = null;
    mockCreateComputation.mockImplementation((payload: any) => resolvedTrigger(computationFor(payload.baseAmount)));
    mockDeleteBill.mockReturnValue(resolvedTrigger({}));
    mockDeletePaymentMethod.mockReturnValue(resolvedTrigger({ message: 'Removed' }));
    Object.keys(modalActions).forEach((key) => delete modalActions[key]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('the biller', () => {
    it('shows the compact header with a remove button', () => {
      render(<PayBillScreen />);

      expect(screen.getByText('Nav:Biller Details:outlined')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Remove saved biller' })).toBeTruthy();
    });

    it('introduces the biller by nickname, payee and contract', () => {
      render(<PayBillScreen />);

      expect(screen.getByText('Filinvest Land')).toBeTruthy();
      expect(screen.getByText('FLI · Contract •••• 3246')).toBeTruthy();
    });

    it('shows where the biller stands when the API says', () => {
      Object.assign(mockBillQuery, { data: makeBill({ due_date: new Date(Date.now() + 2 * 86_400_000).toISOString() }) });
      render(<PayBillScreen />);

      expect(screen.getByTestId('biller-status-due')).toBeTruthy();
    });

    it('leaves the status out when it does not', () => {
      render(<PayBillScreen />);
      expect(screen.queryByTestId(/^biller-status-/)).toBeNull();
    });

    it('lists the four key details, with the rest a tap away', () => {
      render(<PayBillScreen />);

      expect(screen.getByText('Biller Summary')).toBeTruthy();
      expect(screen.getByText('Payment Name')).toBeTruthy();
      expect(screen.getByText('HDMF Refiling Fee')).toBeTruthy();
      expect(screen.getByText('Contract Number')).toBeTruthy();
      expect(screen.queryByText('Bill Name')).toBeNull();
      fireEvent.press(screen.getByRole('button', { name: /Show all details/ }));
      expect(screen.getByText('Bill Name')).toBeTruthy();
    });

    it('shows a skeleton while the biller loads', () => {
      Object.assign(mockBillQuery, { data: undefined, isLoading: true });
      render(<PayBillScreen />);

      expect(screen.getByTestId('bill-payment-skeleton')).toBeTruthy();
      expect(screen.queryByLabelText('Amount to pay')).toBeNull();
    });

    it('says there are no details when the biller cannot be loaded, and still lets the amount be entered', () => {
      Object.assign(mockBillQuery, { data: undefined });
      render(<PayBillScreen />);

      expect(screen.getByText('Empty bill details. Please check back later.')).toBeTruthy();
      expect(screen.queryByText('Biller Summary')).toBeNull();
      expect(amountField()).toBeTruthy();
    });

    it('offers to retry when the biller request fails', () => {
      const refetch = jest.fn();
      Object.assign(mockBillQuery, { data: undefined, isError: true, refetch });
      render(<PayBillScreen />);

      expect(screen.getByText('Unable to load this biller. Please try again later.')).toBeTruthy();
      expect(screen.queryByLabelText('Amount to pay')).toBeNull();
      fireEvent.press(screen.getByRole('button', { name: 'Try loading this biller again' }));
      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('the amount', () => {
    it('is filled in with the amount saved on the biller', () => {
      render(<PayBillScreen />);

      expect(amountField().props.value).toBe('10000.00');
      expect(screen.getByText('Prefilled from your saved biller. You can change it.')).toBeTruthy();
    });

    it('starts empty, and says why, when the biller has no saved amount', () => {
      Object.assign(mockBillQuery, { data: makeBill({ custom_fields: {} }) });
      render(<PayBillScreen />);

      expect(amountField().props.value).toBe('');
      expect(screen.getByText('No amount saved for this biller. Enter the amount on your statement.')).toBeTruthy();
    });

    it('gives way to what the user types, and stays empty if they clear it', () => {
      render(<PayBillScreen />);

      fireEvent.changeText(amountField(), '250');
      expect(amountField().props.value).toBe('250');

      fireEvent.changeText(amountField(), '');
      expect(amountField().props.value).toBe('');
    });

    it('gives way to the amount handed back from adding a card', () => {
      mockParams.amount = '325';
      render(<PayBillScreen />);

      expect(amountField().props.value).toBe('325');
    });

    it('is checked as it is typed', () => {
      render(<PayBillScreen />);

      fireEvent.changeText(amountField(), '1.234');

      expect(screen.getByText('Amount must have at most 2 decimal places.')).toBeTruthy();
    });

    it('is filled in again from the saved amount after a payment has gone through', () => {
      const view = render(<PayBillScreen />);
      fireEvent.changeText(amountField(), '100');

      mockState.oneTimePayment.lastCompletedInvoiceReferenceId = 'invoice-1';
      view.rerender(<PayBillScreen />);

      expect(amountField().props.value).toBe('10000.00');
      expect(mockResetComputation).toHaveBeenCalled();
    });

    it('is cleared after a payment when the biller has no saved amount', () => {
      Object.assign(mockBillQuery, { data: makeBill({ custom_fields: {} }) });
      const view = render(<PayBillScreen />);
      fireEvent.changeText(amountField(), '100');
      expect(amountField().props.value).toBe('100');

      mockState.oneTimePayment.lastCompletedInvoiceReferenceId = 'invoice-1';
      view.rerender(<PayBillScreen />);

      expect(amountField().props.value).toBe('');
    });
  });

  describe('paying with a saved card', () => {
    it('starts on Saved card with the default card chosen', () => {
      render(<PayBillScreen />);

      expect(screen.getByRole('tab', { name: 'Saved card' }).props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));
      expect(screen.getByText('Selected:card-1')).toBeTruthy();
      expect(screen.getByText('Total · Visa •••• 4242')).toBeTruthy();
    });

    it('chooses the first card when none is marked as the default', () => {
      mockPaymentMethodsQuery.data = [{ ...visa, isPrimary: false }, mastercard];
      render(<PayBillScreen />);

      expect(screen.getByText('Selected:card-1')).toBeTruthy();
    });

    it('chooses the card handed back from adding one', () => {
      mockParams.selectedPaymentMethodReferenceId = 'card-2';
      render(<PayBillScreen />);

      expect(screen.getByText('Selected:card-2')).toBeTruthy();
      expect(screen.getByText('Total · Mastercard •••• 5555')).toBeTruthy();
    });

    it('pays with the card the user picks', async () => {
      render(<PayBillScreen />);

      fireEvent.press(screen.getByText('Card card-2'));
      expect(screen.getByText('Selected:card-2')).toBeTruthy();
      expect(screen.getByText('Total · Mastercard •••• 5555')).toBeTruthy();

      await settleFee();
      expect(mockCreateComputation).toHaveBeenLastCalledWith(expect.objectContaining({
        paymentMethodReferenceId: 'card-2',
        billingReferenceId: 'bill-1',
        baseAmount: 10000,
      }));
    });

    it('asks for a card when there are none to pay with', () => {
      mockPaymentMethodsQuery.data = [];
      render(<PayBillScreen />);

      expect(screen.getByText('Select a card')).toBeTruthy();
      expect(isDisabled(confirm())).toBe(true);
    });

    it('asks for an amount before anything else', () => {
      Object.assign(mockBillQuery, { data: makeBill({ custom_fields: {} }) });
      render(<PayBillScreen />);

      expect(screen.getByText('Enter an amount to continue')).toBeTruthy();
      expect(screen.getByText('₱ 0.00')).toBeTruthy();
      expect(isDisabled(confirm())).toBe(true);
    });

    it('does not treat an amount that fails validation as one to pay', () => {
      render(<PayBillScreen />);
      fireEvent.changeText(amountField(), '1.234');

      expect(screen.getByText('Enter an amount to continue')).toBeTruthy();
      expect(isDisabled(confirm())).toBe(true);
      expect(mockCreateComputation).not.toHaveBeenCalled();
    });

    it('works out the fee a second after the amount settles, and only then can be confirmed', async () => {
      render(<PayBillScreen />);

      expect(screen.getByTestId('ActivityIndicator')).toBeTruthy();
      expect(mockCreateComputation).not.toHaveBeenCalled();

      await settleFee();

      expect(mockCreateComputation).toHaveBeenCalledWith({
        paymentMethodReferenceId: 'card-1',
        billingReferenceId: 'bill-1',
        baseAmount: 10000,
        baseCurrency: 'PHP',
        transactionType: 'payment',
        notes: null,
      });
      expect(screen.queryByTestId('ActivityIndicator')).toBeNull();
      expect(isDisabled(confirm())).toBe(false);
    });

    it('shows the fee, and a total that includes it', async () => {
      render(<PayBillScreen />);
      expect(screen.getByText('₱ 10,000.00')).toBeTruthy();

      await settleFee();

      expect(screen.getByText(/You will be charged a service fee of/)).toBeTruthy();
      expect(screen.getByText('₱ 25.00')).toBeTruthy();
      expect(screen.getByText('₱ 10,025.00')).toBeTruthy();
    });

    it('works the fee out again when the amount changes', async () => {
      render(<PayBillScreen />);
      await settleFee();

      fireEvent.changeText(amountField(), '500');
      expect(isDisabled(confirm())).toBe(true);
      await settleFee();

      expect(mockCreateComputation).toHaveBeenLastCalledWith(expect.objectContaining({ baseAmount: 500 }));
      expect(screen.getByText('₱ 525.00')).toBeTruthy();
    });

    it('goes on to confirm the payment with the fee that was worked out', async () => {
      render(<PayBillScreen />);
      await settleFee();

      fireEvent.press(confirm());

      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: '/bills/one-time-payments/pay/confirm-payment',
        params: {
          billingReferenceId: 'bill-1',
          billData: JSON.stringify(makeBill()),
          computationResponse: JSON.stringify(computationFor(10000)),
          invoiceReferenceId: 'invoice-1',
          transactionReferenceId: 'transaction-1',
          paymentMethodProvider: 'visa',
          lastFourCardDigits: '4242',
        },
      });
    });

    it('says when the fee cannot be worked out, and cannot be confirmed', async () => {
      mockCreateComputation.mockReturnValue(rejectedTrigger({ data: { code: 'SOMETHING_ELSE' } }));
      render(<PayBillScreen />);
      await settleFee();

      expect(screen.getByText('Unable to calculate fees')).toBeTruthy();
      expect(screen.getByText(/Unable to calculate fees for this bill/)).toBeTruthy();
      expect(isDisabled(confirm())).toBe(true);
      expect(screen.queryByRole('button', { name: 'Replace card' })).toBeNull();
    });
  });

  describe('when the selected card needs to be added again', () => {
    const revaultError = () => rejectedTrigger({ data: { code: 'CARD_REVAULT_REQUIRED' } });

    beforeEach(() => {
      mockCreateComputation.mockReturnValue(revaultError());
    });

    it('offers to replace the card', async () => {
      render(<PayBillScreen />);
      await settleFee();

      expect(screen.getByText('This card can no longer be used. Please remove it and add it again.')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Replace card' })).toBeTruthy();
    });

    it('removes the card and opens add-card with the return path after confirmation', async () => {
      mockPaymentMethodsQuery.data = [visa];
      render(<PayBillScreen />);
      await settleFee();
      fireEvent.press(screen.getByRole('button', { name: 'Replace card' }));

      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        payload: expect.objectContaining({
          id: 'replaceCard',
          bodyMessage: 'The card ending in 4242 will be removed so you can add it again.',
        }),
      }));
      expect(mockDeletePaymentMethod).not.toHaveBeenCalled();

      await act(async () => {
        modalActions.replaceCard();
      });

      expect(mockDeletePaymentMethod).toHaveBeenCalledWith({ id: 'card-1' });
      expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
        pathname: '/payment-methods/add-card',
        params: expect.objectContaining({
          returnTo: '/bills/one-time-payments/pay/bill-1',
          billingReferenceId: 'bill-1',
          returnAmount: '10000.00',
        }),
      }));
    });

    it('stays on the screen and reports the failure when the card cannot be removed', async () => {
      mockPaymentMethodsQuery.data = [visa];
      mockDeletePaymentMethod.mockReturnValue(rejectedTrigger({ data: { message: 'Card is in use.' } }));
      render(<PayBillScreen />);
      await settleFee();
      fireEvent.press(screen.getByRole('button', { name: 'Replace card' }));

      await act(async () => {
        modalActions.replaceCard();
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        payload: { message: 'Card is in use.', variant: 'error' },
      }));
    });

    it('opens the card details instead of deleting a default card while other cards exist', async () => {
      render(<PayBillScreen />);
      await settleFee();
      fireEvent.press(screen.getByRole('button', { name: 'Replace card' }));

      expect(mockDeletePaymentMethod).not.toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/payment-methods/update-card',
          params: { referenceId: 'card-1', route: '/bills/one-time-payments/pay/bill-1' },
        }),
        expect.anything(),
      );
    });

    it('clears the error once the amount is emptied', async () => {
      render(<PayBillScreen />);
      await settleFee();
      expect(screen.getByRole('button', { name: 'Replace card' })).toBeTruthy();

      fireEvent.changeText(amountField(), '');

      expect(screen.queryByText(/can no longer be used/)).toBeNull();
      expect(screen.queryByRole('button', { name: 'Replace card' })).toBeNull();
    });
  });

  describe('adding a card', () => {
    it('opens the add-and-save flow with a validated return path to Biller Details', () => {
      render(<PayBillScreen />);
      fireEvent.changeText(amountField(), '175');

      fireEvent.press(screen.getByRole('button', { name: 'Add Payment Method' }));

      expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
        pathname: '/payment-methods/add-card',
        params: expect.objectContaining({
          returnTo: '/bills/one-time-payments/pay/bill-1',
          billingReferenceId: 'bill-1',
          returnAmount: '175',
        }),
      }));
    });
  });

  describe('paying with another method', () => {
    const openOtherMethods = () => fireEvent.press(screen.getByRole('tab', { name: 'Other method' }));

    it('only calculates a saved-card fee while Saved card is selected', async () => {
      render(<PayBillScreen />);
      openOtherMethods();
      await settleFee();

      expect(mockCreateComputation).not.toHaveBeenCalled();

      fireEvent.press(screen.getByRole('tab', { name: 'Saved card' }));
      await settleFee();

      expect(mockCreateComputation).toHaveBeenCalledWith(expect.objectContaining({
        paymentMethodReferenceId: 'card-1',
        billingReferenceId: 'bill-1',
        baseAmount: 10000,
      }));
    });

    it('offers a card, PayPal, Philippine banks and QRPH, with nothing chosen', () => {
      render(<PayBillScreen />);
      openOtherMethods();

      expect(screen.getByText('Use this payment method once. It won’t be saved.')).toBeTruthy();
      expect(screen.getAllByRole('radio')).toHaveLength(4);
      expect(screen.getByText('Select a payment method')).toBeTruthy();
      expect(isDisabled(confirm())).toBe(true);
    });

    it('does not offer the saved cards or a fee while on this tab', async () => {
      render(<PayBillScreen />);
      openOtherMethods();
      await settleFee();

      expect(screen.queryByText('Card card-1')).toBeNull();
      expect(screen.queryByText(/You will be charged a service fee/)).toBeNull();
    });

    it('can be confirmed once a method is chosen, with the amount as the total', () => {
      render(<PayBillScreen />);
      openOtherMethods();

      fireEvent.press(screen.getByTestId('one-time-method-paypal'));

      expect(screen.getByText('Total · PayPal')).toBeTruthy();
      expect(screen.getByText('₱ 10,000.00')).toBeTruthy();
      expect(isDisabled(confirm())).toBe(false);
    });

    it('asks for an amount before a method', () => {
      Object.assign(mockBillQuery, { data: makeBill({ custom_fields: {} }) });
      render(<PayBillScreen />);
      openOtherMethods();
      fireEvent.press(screen.getByTestId('one-time-method-paypal'));

      expect(screen.getByText('Enter an amount to continue')).toBeTruthy();
      expect(isDisabled(confirm())).toBe(true);
    });

    it.each([
      ['card', '/payment-methods/form-details', { apiEnv: 'one-time', methodTitle: 'Credit/Debit Card' }],
      ['paypal', '/payment-methods/paypal', { baseAmount: '10000', baseCurrency: 'PHP' }],
      ['bank', '/payment-methods/direct-debit', { returnAmount: '10000' }],
      ['qrph', '/payment-methods/qrph', { baseAmount: '10000', baseCurrency: 'PHP' }],
    ])('goes on to the %s payment flow when confirmed', (method, pathname, params) => {
      render(<PayBillScreen />);
      openOtherMethods();
      fireEvent.press(screen.getByTestId(`one-time-method-${method}`));

      fireEvent.press(confirm());

      expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
        pathname,
        params: expect.objectContaining({ billingReferenceId: 'bill-1', ...params }),
      }));
    });

    it('hands the flow the way back to Biller Details', () => {
      render(<PayBillScreen />);
      openOtherMethods();
      fireEvent.press(screen.getByTestId('one-time-method-paypal'));

      fireEvent.press(confirm());

      expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
        params: expect.objectContaining({ returnTo: '/bills/one-time-payments/pay/bill-1' }),
      }));
    });

    it('goes back to the first choice after a payment has gone through', () => {
      const view = render(<PayBillScreen />);
      openOtherMethods();
      fireEvent.press(screen.getByTestId('one-time-method-paypal'));

      mockState.oneTimePayment.lastCompletedInvoiceReferenceId = 'invoice-1';
      view.rerender(<PayBillScreen />);

      expect(screen.getByRole('tab', { name: 'Saved card' }).props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));
      openOtherMethods();
      expect(screen.getByText('Select a payment method')).toBeTruthy();
    });
  });

  describe('removing the biller', () => {
    it('asks first, naming the biller', () => {
      render(<PayBillScreen />);

      fireEvent.press(screen.getByRole('button', { name: 'Remove saved biller' }));

      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        payload: expect.objectContaining({
          id: 'deleteBiller',
          variant: 'confirm',
          iconType: 'delete',
          headerMessage: 'Remove Filinvest Land?',
          bodyMessage: 'It will no longer appear in Saved billers. Your payment history stays.',
          buttonConfig: { primaryLabel: 'Remove Biller', secondaryLabel: 'Cancel', direction: 'column' },
        }),
      }));
      expect(mockDeleteBill).not.toHaveBeenCalled();
    });

    it('deletes the biller once confirmed, tells the user and goes back to the list', async () => {
      render(<PayBillScreen />);
      fireEvent.press(screen.getByRole('button', { name: 'Remove saved biller' }));

      await act(async () => {
        modalActions.deleteBiller();
      });

      expect(mockDeleteBill).toHaveBeenCalledWith(7);
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        payload: { message: 'Biller "Filinvest Land" deleted successfully.', variant: 'success' },
      }));
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it('stays on the screen and reports the failure when the biller cannot be deleted', async () => {
      mockDeleteBill.mockReturnValue(rejectedTrigger({ data: { message: 'Biller is in use.' } }));
      render(<PayBillScreen />);
      fireEvent.press(screen.getByRole('button', { name: 'Remove saved biller' }));

      await act(async () => {
        modalActions.deleteBiller();
      });

      expect(mockRouter.back).not.toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
        payload: { message: 'Biller is in use.', variant: 'error' },
      }));
    });
  });
});
