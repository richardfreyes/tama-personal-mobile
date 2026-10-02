import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { BillPaymentSkeleton, InlineLoadingIndicator } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import PaymentMethodCardComponent from '@/components/payments/PaymentMethodsComponent';
import PaymentSourceSelector from '@/components/payments/PaymentSourceSelector';
import { ERRORS } from '@/constants';
import { COMMON } from '@/constants/common';
import { PAYMENT_SOURCE_OPTIONS } from '@/constants/paymentOptions';
import { useGetBillDetailQuery } from '@/redux/features/billDetail/billDetailApi';
import { useDeleteBillMutation } from '@/redux/features/bills/billsApi';
import { showModal } from '@/redux/features/modal/modalSlice';
import { selectLastCompletedInvoiceReferenceId } from '@/redux/features/oneTimePayment/oneTimePaymentSlice';
import { useGetPaymentMethodsQuery } from '@/redux/features/paymentMethods/paymentMethodApi';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useCreateTransactionComputationMutation } from '@/redux/features/transactions/transactionApi';
import { TransactionComputationResponse } from '@/redux/features/transactions/transactionTypes';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { billingReferenceIdStyles as styles } from '@/styles/app/bills/one-time-payments/pay/billingReferenceId';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { formatMoney, normalizeCurrencyInput, parseCurrencyInput } from '@/utils/format';
import { modalActions } from '@/utils/modalActions';
import { validateField } from '@/utils/validators';
import { router, useFocusEffect, useLocalSearchParams, type Route } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

const PayBillScreen = () => {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();
  const billingReferenceId = params.billingReferenceId as string;
  const merchantName = params.merchantName;
  const preselectedReferenceId = typeof params.selectedPaymentMethodReferenceId === 'string' ? params.selectedPaymentMethodReferenceId : undefined;
  const returnedAmount = typeof params.amount === 'string' ? params.amount : undefined;
  const { data: paymentMethodData } = useGetPaymentMethodsQuery();
  const isPaymentMethodsEmpty = !paymentMethodData || paymentMethodData.length === 0;
  const { data: billData, isLoading: billDetailIsLoading } = useGetBillDetailQuery(billingReferenceId);
  const [deleteBill] = useDeleteBillMutation();
  const isBillDataEmpty = !billData;
  const primaryMethod = paymentMethodData?.find(method => method.isPrimary === true);
  const preselectedMethod = preselectedReferenceId ? paymentMethodData?.find(method => method.referenceId === preselectedReferenceId) : undefined;
  const selectedMethod = preselectedMethod ?? primaryMethod ?? paymentMethodData?.[0];
  const selectedReferenceId = selectedMethod?.referenceId;
  const [createTransactionComputation, { isLoading: isComputationLoading, reset: resetComputation }] = useCreateTransactionComputationMutation();
  const [amount, setAmount] = useState(''); 
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [resolvedComputation, setResolvedComputation] = useState<{ key: string; response: TransactionComputationResponse } | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | number | null>(null);
  const [computationErr, setComputationErr] = useState(false);
  const [cardNeedsReAdd, setCardNeedsReAdd] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'saved' | 'new-card'>('saved');
  const currentComputationKey = JSON.stringify([billingReferenceId, selectedReferenceId, parseCurrencyInput(amount), notes]);
  const computationResponse = resolvedComputation?.key === currentComputationKey ? resolvedComputation.response : null;
  const currentComputation = computationResponse?.computation ?? null;

  const seededAmountRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setComputationErr(false);
      return () => {
        setAmount('');
        setErrors({});
        setTouched({});
        setNotes('');
        setResolvedComputation(null);
      };
    }, [])
  );

  // Start the next payment from a clean form once a payment has succeeded.
  const lastCompletedInvoiceReferenceId = useAppSelector(selectLastCompletedInvoiceReferenceId);
  const handledCompletedInvoiceRef = useRef(lastCompletedInvoiceReferenceId);
  useEffect(() => {
    if (handledCompletedInvoiceRef.current === lastCompletedInvoiceReferenceId) return;
    handledCompletedInvoiceRef.current = lastCompletedInvoiceReferenceId;
    setAmount('');
    setErrors({});
    setTouched({});
    setNotes('');
    setResolvedComputation(null);
    setComputationErr(false);
    setPaymentOption('saved');
    resetComputation();
  }, [lastCompletedInvoiceReferenceId, resetComputation]);

  useEffect(() => {
    if (returnedAmount && seededAmountRef.current !== returnedAmount) {
      seededAmountRef.current = returnedAmount;
      setAmount(returnedAmount);
    }
  }, [returnedAmount]);

  const validateInput = useCallback((field: string, value: string): string | undefined => {
    return validateField(field, value);
  }, []);

  const handleSetValue = (text: string) => {
    const normalizedValue = normalizeCurrencyInput(text);
    setAmount(normalizedValue);

    if (touched['Amount']) {
      const message = validateInput('Amount', normalizedValue);
      setErrors(prev => ({ ...prev, 'Amount': message || undefined }));
    }
  };

  useEffect(() => {
    let active = true;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const error = validateField('Amount', amount);
    const numAmount = parseCurrencyInput(amount);
    
    if (!error && numAmount != null && numAmount > 0 && selectedReferenceId) {
      const baseAmount = numAmount;
      debounceTimer.current = setTimeout(() => {
        const payload = {
          paymentMethodReferenceId: selectedReferenceId,
          billingReferenceId: billingReferenceId as string,
          baseAmount,
          baseCurrency: 'PHP',
          transactionType: 'payment' as const,
          notes: notes || null,
        };
        void createTransactionComputation(payload).unwrap().then((response) => {
          if (active) {
            setResolvedComputation({ key: JSON.stringify([billingReferenceId, selectedReferenceId, baseAmount, notes]), response });
            setComputationErr(false);
            setCardNeedsReAdd(false);
          }
        }).catch((error: { data?: { code?: string } }) => {
          if (active) {
            setResolvedComputation(null);
            setComputationErr(true);
            setCardNeedsReAdd(error?.data?.code === 'CARD_REVAULT_REQUIRED');
          }
        });
      }, COMMON.CALC_DEBOUNCE_TIME);
    } else {
      setResolvedComputation(null);
    }
    
    return () => {
      active = false;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [amount, notes, selectedReferenceId, billingReferenceId, createTransactionComputation]);

  const handleDeleteBiller = async () => {
    if (!billData) return; 

    try {
      await deleteBill(billData.billing_id).unwrap();
      dispatch(showSnackbar({
        message: `Biller "${merchantName}" deleted successfully.`,
        variant: 'success'
      }));
      router.back();
    } catch (error: any) {
      dispatch(showSnackbar({
        message: error?.data?.message || 'Failed to delete biller.',
        variant: 'error'
      }));
    }
  }

  const modalDeleteBiller = () => {
    const modalId = 'deleteBiller';
    modalActions[modalId] = handleDeleteBiller;

    dispatch(showModal({
      id: modalId,
      iconType: 'warning',
      headerMessage: 'Delete Biller?',
      bodyMessage: 'Are you sure you want to delete this biller?',
      buttonConfig: {
        primaryLabel: 'Confirm',
        primaryStyle: { backgroundColor: Colors.error06 },
        secondaryLabel: 'No',
        direction: 'row'
      }
    }));
  }

  const handleAddPaymentMethod = () => {
    router.push({
      pathname: '/payment-methods/add-card',
      params: {
        returnTo: `/bills/one-time-payments/pay/${billingReferenceId}`,
        billingReferenceId,
        returnAmount: amount,
      },
    });
  };

  const handleSelectPaymentMethod = () => {
    setTouched(prev => ({ ...prev, 'Amount': true }));
    const message = validateField('Amount', amount);
    setErrors(prev => ({ ...prev, 'Amount': message || undefined }));
    if (message) {
      if (message === ERRORS.AMOUNT_REQUIRED) {
        dispatch(showSnackbar({ message, variant: 'error' }));
      }
      return;
    }

    const numAmount = parseCurrencyInput(amount);
    if (numAmount == null || numAmount <= 0) {
      dispatch(showSnackbar({ message: 'Enter a valid amount before paying.', variant: 'error' }));
      return;
    }

    router.push({
      pathname: '/bills/one-time-payments/payment-methods',
      params: {
        billingReferenceId: billingReferenceId as string,
        baseAmount: String(numAmount),
        baseCurrency: 'PHP',
        returnTo: `/bills/one-time-payments/pay/${billingReferenceId}`,
        returnAmount: String(numAmount),
      },
    });
  };

  const handleConfirmPayment = () => {
    if (isPaymentMethodsEmpty) {
      handleSelectPaymentMethod();
      return;
    }

    if (!selectedReferenceId) {
      dispatch(showSnackbar({
        message: 'Select a default payment method before paying.',
        variant: 'error'
      }));
      return;
    }

    setTouched(prev => ({ ...prev, 'Amount': true }));

    const message = validateField('Amount', amount);
    setErrors(prev => ({ ...prev, 'Amount': message || undefined }));

    if (message) {
      if (message === ERRORS.AMOUNT_REQUIRED) {
        dispatch(showSnackbar({ message, variant: 'error' }));
      }
      return;
    }

    if (!currentComputation || isComputationLoading || computationErr) {
      dispatch(showSnackbar({
        message: 'Validation error. Cannot proceed without fee computation.',
        variant: 'error'
      }));
      return;
    }

    const invoiceReferenceId = computationResponse?.invoiceReferenceId || computationResponse?.computation?.invoiceReferenceId || '';

    router.push({
      pathname: '/bills/one-time-payments/pay/confirm-payment', 
      params: {
        billingReferenceId: billingReferenceId as string,
        billData: billData ? JSON.stringify(billData) : undefined,
        computationResponse: computationResponse ? JSON.stringify(computationResponse) : undefined,
        invoiceReferenceId,
        transactionReferenceId: computationResponse?.transactionReferenceId || '',
        paymentMethodProvider: selectedMethod?.paymentMethodProvider ?? '',
        lastFourCardDigits: selectedMethod?.lastFourCardDigits ?? '',
      },
    });
  };
  
  if (billDetailIsLoading) {
    return (
      <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
        <NavHeaderComponent title='Biller Details' />
        <BillPaymentSkeleton label="Loading biller details" />
      </GlobalScrollView>
    );
  }
  
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title='Biller Details' rightNav={{ iconType: 'delete', onPress: modalDeleteBiller}} />
          {(
            <View style={styles.amountInputContainer}>
              <View style={styles.amountInput}>
                <InputValidationComponent
                  field="Amount"
                  value={amount}
                  setValue={handleSetValue}
                  placeholder="Amount"
                  errors={errors}
                  setErrors={setErrors}
                  touched={touched}
                  setTouched={setTouched}
                  validateField={(field, val) => validateField(field, val)}
                  keyboardType="decimal-pad"
                  formatAsCurrency
                />
                <View style={[styles.computationWrapper, { marginBottom: 24, minHeight: 16, justifyContent: 'center' }]}>
                  {paymentOption !== 'saved' ? null : isComputationLoading ? (
                    <InlineLoadingIndicator label="Calculating fees" />
                  ) : (
                    <>
                      {computationErr ? (
                        <AppText size='extraSmall' mVertical={2} color='error10' style={{textAlign: 'center'}}>
                          {cardNeedsReAdd
                            ? 'This card can no longer be used. Please remove it and add it again.'
                            : 'Unable to calculate fees for this bill. Please try again later or contact support.'}
                        </AppText>
                      ) : currentComputation ? (
                        <View>
                          <AppText size='extraSmall' style={styles.label}>
                            You will be charged a service fee of{' '}
                            <AppText size='extraSmall' style={styles.label} weight='700'>
                              {formatMoney([currentComputation.feeCurrency, currentComputation.feeAmount])}
                            </AppText>
                          </AppText>
                        </View>
                      ) : null}
                    </>
                  )}
                </View>
              </View>
            </View>
          )}
          <View style={[globalStyle.outerContainer, { marginBottom: 24 }]}>
            { isBillDataEmpty && (
              <EmptyStateCard
                variant="empty"
                message="Empty bill details. Please check back later."
              />
            )}
            <View style={styles.wrapper}>
              <AppText size='base' weight='700' mBottom={8}>Biller Summary</AppText>
              {billData?.custom_fields && (
                Object.entries(billData.custom_fields).map(([key, field]) => (
                  <InfoFieldComponent label={field.text} value={field.value} key={key} />
                ))
              )}
            </View>
          </View>
          <PaymentSourceSelector
            options={PAYMENT_SOURCE_OPTIONS}
            selectedValue={paymentOption}
            onSelect={(value) => setPaymentOption(value as 'saved' | 'new-card')}
          />

          { paymentOption === 'saved' ? (
            <>
              <PaymentMethodCardComponent sectionHeader={{ title: 'Payment Methods' }} route={`/bills/one-time-payments/pay/${billingReferenceId}` as Route} onAddPaymentMethod={handleAddPaymentMethod}/>
              <SpacerComponent height={24} />
              { !isPaymentMethodsEmpty && (
                <AppButton
                  title="Confirm"
                  variant="primary"
                  onPress={handleConfirmPayment}
                  isLoading={isComputationLoading}
                  disabled={!currentComputation || isComputationLoading || computationErr}
                />
              )}
            </>
          ) : (
            <>
              <View style={styles.newCardNotice}>
                <AppText size='small'>
                  This payment method will be used only for this payment and won’t be saved to your account.
                </AppText>
              </View>
              <SpacerComponent height={12} />
              <AppButton
                title="Select payment method"
                variant="primary"
                onPress={handleSelectPaymentMethod}
              />
            </>
          )}
        </View>
        <SpacerComponent height={24} />
      </GlobalScrollView>
    </KeyboardAvoidingView>
  );
};

export default PayBillScreen;
