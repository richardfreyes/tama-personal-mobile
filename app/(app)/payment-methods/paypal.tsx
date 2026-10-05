import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { NativeLoadingIndicator } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { OtpWebView } from '@/components/layout/OtpWebView';
import { PAYMENT_CANCEL_TIMEOUT_MS, PAYMENT_REQUEST_TIMEOUT_MS, VALIDATORS } from '@/constants';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useCancelPayPalMutation, useCapturePayPalMutation, usePayWithPayPalMutation } from '@/redux/features/transactions/transactionApi';
import { useAppDispatch } from '@/redux/hooks';
import { globalStyle } from '@/styles/common/globals';
import { PayPalSession } from '@/types/common';
import { clearPaymentIntentKey, getPaymentIntentKey } from '@/utils/paymentIntentKey';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

const PayPalPayment = () => {
  const dispatch = useAppDispatch();
  const { billingReferenceId, baseAmount, baseCurrency } = useLocalSearchParams<{billingReferenceId?: string; baseAmount?: string; baseCurrency?: string;}>();
  const [payWithPayPal] = usePayWithPayPalMutation();
  const [capturePayPal] = useCapturePayPalMutation();
  const [cancelPayPal] = useCancelPayPalMutation();
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [session, setSession] = useState<PayPalSession | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryApproval, setRetryApproval] = useState(false);
  const startedRef = useRef(false);
  const outcomeRef = useRef<'success' | 'failure' | null>(null);
  const paymentIntent = `${billingReferenceId}:${baseAmount}:${baseCurrency || 'PHP'}`;
  const createRequestKeyRef = useRef(getPaymentIntentKey('paypal-start', paymentIntent));

  const runBounded = useCallback(async <T,>(requestTask: any, timeoutMs: number): Promise<T> => {
    const timer = setTimeout(() => requestTask.abort?.(), timeoutMs);
    try {
      return await requestTask.unwrap();
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    dispatch(showSnackbar({ message, variant: 'error' }));
  }, [dispatch]);

  const startPayment = useCallback(async () => {
    const amount = Number(baseAmount);
    if (!billingReferenceId || !Number.isFinite(amount) || amount <= 0) {
      setIsStarting(false);
      showError('Enter a valid amount before paying with PayPal.');
      return;
    }

    setIsStarting(true);
    setErrorMessage(null);
    setSession(null);
    setRetryApproval(false);
    outcomeRef.current = null;
    try {
      const response = await runBounded<any>(payWithPayPal({
        idempotencyKey: createRequestKeyRef.current,
        payload: {
          billingReferenceId,
          baseAmount: amount,
          baseCurrency: baseCurrency || 'PHP',
          notes: null,
        },
      }), PAYMENT_REQUEST_TIMEOUT_MS);
      setSession({
        transactionReferenceId: response.transactionReferenceId,
        invoiceReferenceId: response.invoiceReferenceId,
        redirectUrl: response.redirectUrl,
      });
      setWebviewUrl(response.redirectUrl);
    } catch (err: any) {
      showError(err?.data?.message || (
        err?.name === 'AbortError'
          ? 'PayPal took too long to respond. Please try again.'
          : 'Unable to start PayPal. Please try again.'
      ));
    } finally {
      setIsStarting(false);
    }
  }, [baseAmount, baseCurrency, billingReferenceId, payWithPayPal, runBounded, showError]);

  useFocusEffect(useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      void startPayment();
    }
    return () => { startedRef.current = false; };
  }, [startPayment]));

  const cancelPendingPayment = useCallback(async () => {
    if (!session?.transactionReferenceId) return;
    try {
      await runBounded(cancelPayPal(session.transactionReferenceId), PAYMENT_CANCEL_TIMEOUT_MS);
    } catch {

    }
  }, [cancelPayPal, runBounded, session?.transactionReferenceId]);

  const completePayment = useCallback(async () => {
    if (!session) {
      setWebviewUrl(null);
      showError('Unable to identify the PayPal payment. Please try again.');
      return;
    }

    outcomeRef.current = 'success';
    setIsCapturing(true);
    setErrorMessage(null);
    try {
      const response = await runBounded<any>(
        capturePayPal(session.transactionReferenceId),
        PAYMENT_REQUEST_TIMEOUT_MS,
      );
      clearPaymentIntentKey('paypal-start', paymentIntent);
      setWebviewUrl(null);
      dispatch(showSnackbar({
        message: response.message || 'Payment successful.',
        variant: 'success',
      }));
      router.replace({
        pathname: '/bills/one-time-payments/pay/payment-success',
        params: {
          billingReferenceId,
          invoiceReferenceId: response.invoiceReferenceId || session.invoiceReferenceId,
        },
      });
    } catch (err: any) {
      setWebviewUrl(null);
      setRetryApproval(err?.status === 409 && err?.data?.code === 'PAYMENT_NOT_APPROVED');
      showError(err?.data?.message || (
        err?.name === 'AbortError'
          ? 'PayPal confirmation took too long. Check the payment status again.'
          : 'Unable to complete the PayPal payment.'
      ));
    } finally {
      setIsCapturing(false);
    }
  }, [billingReferenceId, capturePayPal, dispatch, paymentIntent, runBounded, session, showError]);

  const handleFailure = useCallback(() => {
    outcomeRef.current = 'failure';
    clearPaymentIntentKey('paypal-start', paymentIntent);
    createRequestKeyRef.current = getPaymentIntentKey('paypal-start', paymentIntent);
    setWebviewUrl(null);
    setSession(null);
    setRetryApproval(false);
    showError('The PayPal payment was cancelled.');
    void cancelPendingPayment();
  }, [cancelPendingPayment, paymentIntent, showError]);

  const handleComplete = useCallback(() => {
    if (outcomeRef.current) return;
    setWebviewUrl(null);
    setRetryApproval(true);
    showError('PayPal was closed. Complete the approval before checking the payment.');
  }, [showError]);

  const handleWebViewError = useCallback((message: string) => {
    setWebviewUrl(null);
    showError(message);
  }, [showError]);

  const retry = useCallback(() => {
    if (session && retryApproval) {
      outcomeRef.current = null;
      setErrorMessage(null);
      setRetryApproval(false);
      setWebviewUrl(session.redirectUrl);
      return;
    }
    if (session) {
      void completePayment();
      return;
    }
    void startPayment();
  }, [completePayment, retryApproval, session, startPayment]);

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
      <NavHeaderComponent title="PayPal" />
      <View style={[globalStyle.outerContainer, { minHeight: 220, justifyContent: 'center' }]}>
        {isStarting || isCapturing ? (
          <View style={globalStyle.loadingContainer}>
            <NativeLoadingIndicator
              label={isCapturing ? 'Completing PayPal payment' : 'Preparing PayPal payment'}
              size="large"
            />
            <SpacerComponent height={16} />
            <AppText size="small" style={globalStyle.textAlignCenter}>
              {isCapturing ? 'Securely capturing your approved PayPal order…' : 'Opening the secure PayPal approval page…'}
            </AppText>
          </View>
        ) : errorMessage ? (
          <View>
            <AppText size="medium" weight="700" color="maroon10" mBottom={8}>Payment not completed</AppText>
            <AppText size="small" mBottom={20}>{errorMessage}</AppText>
            <AppButton
              title={session ? (retryApproval ? 'Return to PayPal' : 'Check Payment Status') : 'Try Again'}
              variant="primary"
              onPress={retry}
            />
          </View>
        ) : null}
      </View>
      <SpacerComponent height={100} />

      <OtpWebView
        url={webviewUrl || ''}
        title="PayPal Payment"
        visible={!!webviewUrl}
        isProcessing={isCapturing}
        processingLabel="Completing your payment"
        onComplete={handleComplete}
        onSuccess={() => { void completePayment(); }}
        onFailure={handleFailure}
        onError={handleWebViewError}
        successUrlPatterns={[VALIDATORS.PAYPAL_SUCCESS_URL_PATTERN]}
        failureUrlPatterns={[VALIDATORS.PAYPAL_FAILURE_URL_PATTERN]}
        successMode="navigation"
      />
    </ScrollView>
  );
};

export default PayPalPayment;
