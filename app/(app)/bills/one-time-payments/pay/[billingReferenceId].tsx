import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { BillPaymentSkeleton } from '@/components/common/Loading';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import SavedBillCard from '@/components/one-time-payments/SavedBillCard';
import FeeNotice from '@/components/payments/FeeNotice';
import OneTimeMethodList from '@/components/payments/OneTimeMethodList';
import PaymentFooter from '@/components/payments/PaymentFooter';
import PaymentInfoSection from '@/components/payments/PaymentInfoSection';
import PaymentMethodsComponent from '@/components/payments/PaymentMethodsComponent';
import PaymentSourceSelector from '@/components/payments/PaymentSourceSelector';
import { ERRORS } from '@/constants';
import { COMMON } from '@/constants/common';
import { ONE_TIME_PAYMENT_METHODS, PAYMENT_SOURCE_OPTIONS } from '@/constants/paymentOptions';
import { BILLER_SUMMARY_EMPTY_LABEL } from '@/constants/savedBills';
import { useGetBillDetailQuery } from '@/redux/features/billDetail/billDetailApi';
import { useGetBillersQuery } from '@/redux/features/biller/billerApi';
import { useDeleteBillMutation } from '@/redux/features/bills/billsApi';
import { showModal } from '@/redux/features/modal/modalSlice';
import { selectLastCompletedInvoiceReferenceId } from '@/redux/features/oneTimePayment/oneTimePaymentSlice';
import { useDeleteCardPaymentMutation, useGetPaymentMethodsQuery } from '@/redux/features/paymentMethods/paymentMethodApi';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useCreateTransactionComputationMutation } from '@/redux/features/transactions/transactionApi';
import { TransactionComputationResponse } from '@/redux/features/transactions/transactionTypes';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { openOneTimePaymentMethod, openPaymentMethod } from '@/services/routeNavigation';
import { billingReferenceIdStyles as styles } from '@/styles/app/bills/one-time-payments/pay/billingReferenceId';
import { Colors } from '@/styles/common/colors';
import type { OneTimePaymentMethodId } from '@/types';
import { formatLastFourDigits, getProviderDisplay, getSavedPaymentMethods } from '@/utils/card';
import { formatPaymentTotal, formatPesoAmount, normalizeCurrencyInput, parseCurrencyInput } from '@/utils/format';
import { modalActions } from '@/utils/modalActions';
import { getBillerLogoMap, getBillerSummaryRows, getSavedBillAmountInput, getSavedBillNickname } from '@/utils/savedBills';
import { validateField } from '@/utils/validators';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

const PayBillScreen = () => {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();
  const billingReferenceId = params.billingReferenceId as string;
  const merchantName = params.merchantName;
  const preselectedReferenceId = typeof params.selectedPaymentMethodReferenceId === 'string' ? params.selectedPaymentMethodReferenceId : undefined;
  const returnedAmount = typeof params.amount === 'string' ? params.amount : undefined;
  const { data: paymentMethodData } = useGetPaymentMethodsQuery();
  const { data: billersData } = useGetBillersQuery({});

  const savedMethods = getSavedPaymentMethods(paymentMethodData);
  const {
    data: billData,
    isError: billDetailIsError,
    isLoading: billDetailIsLoading,
    refetch: refetchBillDetail,
  } = useGetBillDetailQuery(billingReferenceId);
  const [deleteBill] = useDeleteBillMutation();
  const [deletePaymentMethod, { isLoading: isRemovingCard }] = useDeleteCardPaymentMutation();
  const [pickedMethodId, setPickedMethodId] = useState<string | undefined>();
  const pickedMethod = savedMethods.find(method => method.referenceId === pickedMethodId);
  const primaryMethod = savedMethods.find(method => method.isPrimary === true);
  const preselectedMethod = preselectedReferenceId ? savedMethods.find(method => method.referenceId === preselectedReferenceId) : undefined;
  const selectedMethod = pickedMethod ?? preselectedMethod ?? primaryMethod ?? savedMethods[0];
  const selectedReferenceId = selectedMethod?.referenceId;
  const [createTransactionComputation, { isLoading: isComputationLoading, reset: resetComputation }] = useCreateTransactionComputationMutation();
  const [amount, setAmount] = useState('');

  const [isAmountEdited, setIsAmountEdited] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [resolvedComputation, setResolvedComputation] = useState<{ key: string; response: TransactionComputationResponse } | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | number | null>(null);
  const [computationErr, setComputationErr] = useState(false);
  const [cardNeedsReAdd, setCardNeedsReAdd] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'saved' | 'new-card'>('saved');
  const isSavedCardMode = paymentOption === 'saved';
  const [otherMethodId, setOtherMethodId] = useState<OneTimePaymentMethodId | null>(null);
  const savedAmount = useMemo(() => (billData ? getSavedBillAmountInput(billData) : ''), [billData]);
  const amountValue = isAmountEdited || amount !== '' ? amount : savedAmount;
  const currentComputationKey = JSON.stringify([billingReferenceId, selectedReferenceId, parseCurrencyInput(amountValue), notes]);
  const computationResponse = resolvedComputation?.key === currentComputationKey ? resolvedComputation.response : null;
  const currentComputation = computationResponse?.computation ?? null;

  const seededAmountRef = useRef<string | null>(null);

  const clearComputationError = useCallback(() => {
    setComputationErr(false);
    setCardNeedsReAdd(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      clearComputationError();
    }, [clearComputationError])
  );

  const lastCompletedInvoiceReferenceId = useAppSelector(selectLastCompletedInvoiceReferenceId);
  const handledCompletedInvoiceRef = useRef(lastCompletedInvoiceReferenceId);
  useEffect(() => {
    if (handledCompletedInvoiceRef.current === lastCompletedInvoiceReferenceId) return;
    handledCompletedInvoiceRef.current = lastCompletedInvoiceReferenceId;
    setAmount('');
    setIsAmountEdited(false);
    setErrors({});
    setTouched({});
    setNotes('');
    setResolvedComputation(null);
    clearComputationError();
    setPaymentOption('saved');
    setPickedMethodId(undefined);
    setOtherMethodId(null);
    resetComputation();
  }, [lastCompletedInvoiceReferenceId, resetComputation, clearComputationError]);

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
    setIsAmountEdited(true);

    setTouched(prev => ({ ...prev, 'Amount': true }));

    const message = validateInput('Amount', normalizedValue);
    setErrors(prev => ({ ...prev, 'Amount': message || undefined }));
  };

  useEffect(() => {
    let active = true;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const error = validateField('Amount', amountValue);
    const numAmount = parseCurrencyInput(amountValue);

    if (isSavedCardMode && !error && numAmount != null && numAmount > 0 && selectedReferenceId) {
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
            clearComputationError();
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
      clearComputationError();
    }

    return () => {
      active = false;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [amountValue, notes, selectedReferenceId, billingReferenceId, isSavedCardMode, createTransactionComputation, clearComputationError]);

  const handleDeleteBiller = async () => {
    if (!billData) return; 

    try {
      await deleteBill(billData.billing_id).unwrap();
      dispatch(showSnackbar({
        message: `Biller "${getSavedBillNickname(billData)}" deleted successfully.`,
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
      variant: 'confirm',
      iconType: 'delete',
      headerMessage: `Remove ${billData?.billing_name || merchantName || 'this biller'}?`,
      bodyMessage: 'It will no longer appear in Saved billers. Your payment history stays.',
      buttonConfig: {
        primaryLabel: 'Remove Biller',
        secondaryLabel: 'Cancel',
        direction: 'column'
      }
    }));
  }

  const handleAddPaymentMethod = () => {
    router.push({
      pathname: '/payment-methods/add-card',
      params: {
        returnTo: `/bills/one-time-payments/pay/${billingReferenceId}`,
        billingReferenceId,
        returnAmount: amountValue,
      },
    });
  };

  const handleReplaceCard = async () => {
    if (!selectedReferenceId) return;

    try {
      await deletePaymentMethod({ id: selectedReferenceId }).unwrap();
    } catch (error: any) {
      dispatch(showSnackbar({
        message: error?.data?.message || 'Failed to remove payment method.',
        variant: 'error'
      }));
      return;
    }
    handleAddPaymentMethod();
  };

  const handleReplaceCardPress = () => {
    if (!selectedMethod) return;

    if (selectedMethod.isPrimary && savedMethods.length > 1) {
      openPaymentMethod(selectedMethod.referenceId, `/bills/one-time-payments/pay/${billingReferenceId}`);
      return;
    }

    const modalId = 'replaceCard';
    modalActions[modalId] = handleReplaceCard;

    dispatch(showModal({
      id: modalId,
      iconType: 'warning',
      headerMessage: 'Replace Card?',
      bodyMessage: `The card ending in ${formatLastFourDigits(selectedMethod.lastFourCardDigits)} will be removed so you can add it again.`,
      buttonConfig: {
        primaryLabel: 'Remove and add',
        primaryStyle: { backgroundColor: Colors.error06 },
        secondaryLabel: 'Cancel',
        direction: 'row'
      }
    }));
  };

  const validateAmountToPay = (): number | undefined => {
    setTouched(prev => ({ ...prev, 'Amount': true }));
    const message = validateField('Amount', amountValue);
    setErrors(prev => ({ ...prev, 'Amount': message || undefined }));
    if (message) {
      if (message === ERRORS.AMOUNT_REQUIRED) {
        dispatch(showSnackbar({ message, variant: 'error' }));
      }
      return undefined;
    }

    const numAmount = parseCurrencyInput(amountValue);
    if (numAmount == null || numAmount <= 0) {
      dispatch(showSnackbar({ message: 'Enter a valid amount before paying.', variant: 'error' }));
      return undefined;
    }

    return numAmount;
  };

  const handleConfirmOtherMethod = () => {
    const numAmount = validateAmountToPay();
    const method = ONE_TIME_PAYMENT_METHODS.find(option => option.value === otherMethodId);
    if (numAmount === undefined || !method) return;

    openOneTimePaymentMethod({
      title: method.title,
      billingReferenceId,
      baseAmount: String(numAmount),
      baseCurrency: 'PHP',
      returnTo: `/bills/one-time-payments/pay/${billingReferenceId}`,
      returnAmount: String(numAmount),
    });
  };

  const handleConfirmPayment = () => {
    if (!selectedReferenceId) {
      dispatch(showSnackbar({
        message: 'Select a default payment method before paying.',
        variant: 'error'
      }));
      return;
    }

    setTouched(prev => ({ ...prev, 'Amount': true }));

    const message = validateField('Amount', amountValue);
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
      <View style={styles.screen}>
        <GlobalScrollView contentContainerStyle={styles.content}>
          <NavHeaderComponent title='Biller Details' variant="outlined" />
          <View style={styles.body}>
            <BillPaymentSkeleton label="Loading biller details" />
          </View>
        </GlobalScrollView>
      </View>
    );
  }

  if (billDetailIsError) {
    return (
      <View style={styles.screen}>
        <NavHeaderComponent title='Biller Details' variant="outlined" />
        <View style={styles.body}>
          <EmptyStateCard
            message="Unable to load this biller. Please try again later."
            onRetry={() => { void refetchBillDetail(); }}
            retryLabel="Try loading this biller again"
            variant="error"
          />
        </View>
      </View>
    );
  }

  const parsedAmount = parseCurrencyInput(amountValue) ?? 0;

  const hasAmount = parsedAmount > 0 && !validateField('Amount', amountValue);
  const selectedOtherMethod = ONE_TIME_PAYMENT_METHODS.find(option => option.value === otherMethodId);
  const hasPaymentChoice = isSavedCardMode ? Boolean(selectedMethod) : Boolean(selectedOtherMethod);
  const isFeeReady = Boolean(currentComputation) && !computationErr;

  const isFeePending = isSavedCardMode && hasAmount && hasPaymentChoice && !isFeeReady && !computationErr;
  const canConfirm = hasAmount && hasPaymentChoice && (!isSavedCardMode || isFeeReady);
  const hasFeeError = isSavedCardMode && hasAmount && hasPaymentChoice && computationErr;

  const footerLabel = !hasAmount
    ? 'Enter an amount to continue'
    : !hasPaymentChoice
      ? (isSavedCardMode ? 'Select a card' : 'Select a payment method')
      : hasFeeError
        ? 'Unable to calculate fees'
        : `Total · ${isSavedCardMode
          ? `${getProviderDisplay(selectedMethod?.paymentMethodProvider)} •••• ${formatLastFourDigits(selectedMethod?.lastFourCardDigits)}`
          : selectedOtherMethod?.title}`;
  const footerTotal = isSavedCardMode && currentComputation
    ? formatPaymentTotal(currentComputation.totalCurrency, currentComputation.totalAmount)
    : formatPesoAmount(parsedAmount);

  const summaryRows = billData ? getBillerSummaryRows(billData) : undefined;
  const billerLogoUrl = billData ? getBillerLogoMap(billersData).get(billData.merchant_id) : undefined;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <GlobalScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <NavHeaderComponent
          rightNav={{ iconType: 'delete', onPress: modalDeleteBiller, accessibilityLabel: 'Remove saved biller' }}
          title='Biller Details'
          variant="outlined"
        />
        <View style={styles.body}>
          <View style={styles.amountSection}>
            {billData ? <SavedBillCard bill={billData} logoUrl={billerLogoUrl} variant="hero" /> : null}
            <View style={styles.amountField}>
              <InputValidationComponent
                field="Amount"
                value={amountValue}
                setValue={handleSetValue}
                label="Amount to pay"
                placeholder="0.00"
                prefix="₱"
                variant="amount"
                helperText={savedAmount
                  ? 'Prefilled from your saved biller. You can change it.'
                  : 'No amount saved for this biller. Enter the amount on your statement.'}
                errors={errors}
                setErrors={setErrors}
                touched={touched}
                setTouched={setTouched}
                validateField={(field, val) => validateField(field, val)}
                keyboardType="decimal-pad"
                formatAsCurrency
              />
              {isSavedCardMode && hasAmount ? (
                <FeeNotice
                  fee={currentComputation ? formatPaymentTotal(currentComputation.feeCurrency, currentComputation.feeAmount) : undefined}
                  hasError={computationErr}
                  isCalculating={isComputationLoading}
                  isReplacingCard={isRemovingCard}
                  needsCardReplacement={cardNeedsReAdd}
                  onReplaceCard={handleReplaceCardPress}
                />
              ) : null}
            </View>
          </View>
          {summaryRows ? (
            <PaymentInfoSection
              emptyText={BILLER_SUMMARY_EMPTY_LABEL}
              rows={summaryRows.primary}
              secondaryRows={summaryRows.secondary}
              testID="biller-summary"
              title="Biller Summary"
              variant="summary"
            />
          ) : (
            <EmptyStateCard
              variant="empty"
              message="Empty bill details. Please check back later."
            />
          )}
          <View style={styles.paySection}>
            <AppText weight="600" style={styles.sectionTitle}>Pay with</AppText>
            <PaymentSourceSelector
              options={PAYMENT_SOURCE_OPTIONS}
              selectedValue={paymentOption}
              onSelect={(value) => setPaymentOption(value as 'saved' | 'new-card')}
            />
            {isSavedCardMode ? (
              <PaymentMethodsComponent
                onAddPaymentMethod={handleAddPaymentMethod}
                onSelectMethod={(method) => setPickedMethodId(method.referenceId)}
                selectedMethodId={selectedReferenceId}
              />
            ) : (
              <OneTimeMethodList onSelectMethod={setOtherMethodId} selectedMethod={otherMethodId} />
            )}
          </View>
        </View>
      </GlobalScrollView>
      <PaymentFooter
        isConfirmDisabled={!canConfirm && !isFeePending}
        isConfirming={isFeePending}
        isLabelError={hasFeeError}
        label={footerLabel}
        onConfirm={isSavedCardMode ? handleConfirmPayment : handleConfirmOtherMethod}
        total={footerTotal}
      />
    </KeyboardAvoidingView>
  );
};

export default PayBillScreen;
