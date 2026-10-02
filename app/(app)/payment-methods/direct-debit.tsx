import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { OtpWebView } from '@/components/layout/OtpWebView';
import DirectDebitBankOption from '@/components/payments/DirectDebitBankOption';
import { VALIDATORS } from '@/constants';
import { DIRECT_DEBIT_BANKS } from '@/constants/directDebit';
import { useChargeDirectDebitMutation, useGetPaymentMethodsQuery, useLinkDirectDebitMutation } from '@/redux/features/paymentMethods/paymentMethodApi';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { globalStyle } from '@/styles/common/globals';
import { router, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

const DirectDebit = () => {
  const dispatch = useAppDispatch();
  const { returnTo, billingReferenceId, returnAmount } = useLocalSearchParams<{ returnTo?: string; billingReferenceId?: string; returnAmount?: string }>();
  const [linkDirectDebit, { isLoading }] = useLinkDirectDebitMutation();
  const [chargeDirectDebit] = useChargeDirectDebitMutation();
  const { data: paymentMethods } = useGetPaymentMethodsQuery();
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [isCompletingPayment, setIsCompletingPayment] = useState(false);
  const outcomeRef = useRef<'success' | 'failure' | null>(null);
  const linkedReferenceRef = useRef<string | null>(null);
  const chargeKeyRef = useRef(Crypto.randomUUID());
  const isFirstPaymentMethod = (paymentMethods?.length ?? 0) === 0;

  const goToResult = useCallback((outcome: 'success' | 'failure' | 'cancelled') => {
    router.replace({
      pathname: '/payment-methods/direct-debit-result',
      params: { outcome, returnTo, billingReferenceId, returnAmount },
    });
  }, [returnTo, billingReferenceId, returnAmount]);

  const handleSelectBank = useCallback(async (channelCode: string) => {
    if (isLoading || webviewUrl) return;

    outcomeRef.current = null;
    setIsCompletingPayment(false);
    try {
      const response = await linkDirectDebit({ channelCode, isPrimary: isFirstPaymentMethod }).unwrap();
      linkedReferenceRef.current = response.referenceId;
      chargeKeyRef.current = Crypto.randomUUID();
      setWebviewUrl(response.redirectUrl);
    } catch (err: any) {
      dispatch(showSnackbar({
        message: err?.data?.message || 'Unable to start bank authorization. Please try again.',
        variant: 'error',
      }));
    }
  }, [dispatch, isFirstPaymentMethod, isLoading, linkDirectDebit, webviewUrl]);

  const handleSuccess = useCallback(async () => {
    outcomeRef.current = 'success';

    // Bank is linked — proceed to charge the bill (this is a one-time-payment method).
    if (!linkedReferenceRef.current || !billingReferenceId) {
      setWebviewUrl(null);
      goToResult('success');
      return;
    }

    setIsCompletingPayment(true);
    try {
      const response = await chargeDirectDebit({ idempotencyKey: chargeKeyRef.current, payload: {
        referenceId: linkedReferenceRef.current,
        billingReferenceId: billingReferenceId as string,
        baseCurrency: 'PHP',
        baseAmount: Number(returnAmount) || 0,
      }}).unwrap();

      if (response.isOTPRequired) {
        setIsCompletingPayment(false);
        setWebviewUrl(null);
        router.replace({
          pathname: '/payment-methods/direct-debit-otp',
          params: {
            paymentId: String(response.paymentId ?? ''),
            xenditPaymentId: response.xenditPaymentId ?? '',
            otpMobileNumber: response.otpMobileNumber ?? '',
            billingReferenceId,
            invoiceReferenceId: response.invoiceReferenceId ?? '',
          },
        });
        return;
      }

      dispatch(showSnackbar({
        message: response.message || 'Payment successful.',
        variant: 'success',
      }));
      setIsCompletingPayment(false);
      setWebviewUrl(null);
      router.replace({
        pathname: '/bills/one-time-payments/pay/payment-success',
        params: { billingReferenceId, invoiceReferenceId: response.invoiceReferenceId ?? '' },
      });
    } catch (err: any) {
      setIsCompletingPayment(false);
      setWebviewUrl(null);
      dispatch(showSnackbar({ message: err?.data?.message || 'Your payment could not be started.', variant: 'error' }));
      goToResult('failure');
    }
  }, [billingReferenceId, returnAmount, chargeDirectDebit, dispatch, goToResult]);

  const handleFailure = useCallback(() => {
    outcomeRef.current = 'failure';
    setIsCompletingPayment(false);
    setWebviewUrl(null);
    goToResult('failure');
  }, [goToResult]);

  const handleComplete = useCallback(() => {
    if (outcomeRef.current) return;

    setWebviewUrl(null);
    // Dismissed before an outcome resolved — leave the user on the bank picker.
  }, []);

  const handleError = useCallback((message: string) => {
    dispatch(showSnackbar({ message, variant: 'error' }));
  }, [dispatch]);

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
      <NavHeaderComponent title="Link a Bank Account" />
      <View style={globalStyle.outerContainer}>
        <AppText size="medium" color="aegeanBlue10" weight="700" mBottom={8}>Choose your bank</AppText>
        <AppText size="small" mBottom={16}>
          You&apos;ll be redirected to your bank to authorize direct debit. Your account details stay with the
          bank — we only store a secure token.
        </AppText>

        {DIRECT_DEBIT_BANKS.map((bank) => (
          <DirectDebitBankOption
            key={bank.channelCode}
            label={bank.label}
            icon={bank.icon}
            disabled={isLoading}
            onPress={() => handleSelectBank(bank.channelCode)}
          />
        ))}
      </View>

      <SpacerComponent height={100} />

      <OtpWebView
        url={webviewUrl || ''}
        title="Bank Authorization"
        visible={!!webviewUrl}
        isProcessing={isCompletingPayment}
        processingLabel="Completing your payment"
        onComplete={handleComplete}
        onSuccess={handleSuccess}
        onFailure={handleFailure}
        onError={handleError}
        successUrlPatterns={[VALIDATORS.DIRECT_DEBIT_SUCCESS_URL_PATTERN]}
        failureUrlPatterns={[VALIDATORS.DIRECT_DEBIT_FAILURE_URL_PATTERN]}
        successMode="navigation"
      />
    </ScrollView>
  );
};

export default DirectDebit;
