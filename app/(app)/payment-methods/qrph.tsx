import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { NativeLoadingIndicator } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { OtpWebView } from '@/components/layout/OtpWebView';
import { PAYMENT_REQUEST_TIMEOUT_MS, QRPH_VERIFY_MAX_ATTEMPTS, QRPH_VERIFY_POLL_INTERVAL_MS, VALIDATORS } from '@/constants';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { usePayWithQrphMutation, useVerifyQrphMutation } from '@/redux/features/transactions/transactionApi';
import { useAppDispatch } from '@/redux/hooks';
import { globalStyle } from '@/styles/common/globals';
import { QrphSession } from '@/types/common';
import { wait } from '@/utils/async';
import { isPaymentPending } from '@/utils/paymentErrors';
import { clearPaymentIntentKey, getPaymentIntentKey } from '@/utils/paymentIntentKey';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

const QrphPayment = () => {
  const dispatch = useAppDispatch();
  const { billingReferenceId, baseAmount, baseCurrency } = useLocalSearchParams<{billingReferenceId?: string; baseAmount?: string; baseCurrency?: string;}>();
  const [payWithQrph] = usePayWithQrphMutation();
  const [verifyQrph] = useVerifyQrphMutation();
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [session, setSession] = useState<QrphSession | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);
  const outcomeRef = useRef<'success' | 'failure' | null>(null);
  const paymentIntent = `${billingReferenceId}:${baseAmount}:${baseCurrency || 'PHP'}`;
  const createRequestKeyRef = useRef(getPaymentIntentKey('qrph-start', paymentIntent));

  const runBounded = useCallback(async <T,>(requestTask: any, timeoutMs: number): Promise<T> => {
    const timer = setTimeout(() => requestTask.abort?.(), timeoutMs);
    try {
      return await requestTask.unwrap();
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const showError = useCallback((message: string) => {
    setIsPending(false);
    setErrorMessage(message);
    dispatch(showSnackbar({ message, variant: 'error' }));
  }, [dispatch]);

  const startPayment = useCallback(async () => {
    const amount = Number(baseAmount);
    if (!billingReferenceId || !Number.isFinite(amount) || amount <= 0) {
      setIsStarting(false);
      showError('Enter a valid amount before paying with QR Ph.');
      return;
    }

    setIsStarting(true);
    setIsPending(false);
    setErrorMessage(null);
    setSession(null);
    outcomeRef.current = null;
    try {
      const response = await runBounded<any>(payWithQrph({
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
      });
      setWebviewUrl(response.redirectUrl);
    } catch (err: any) {
      showError(err?.data?.message || (
        err?.name === 'AbortError'
          ? 'QR Ph took too long to respond. Please try again.'
          : 'Unable to start QR Ph. Please try again.'
      ));
    } finally {
      setIsStarting(false);
    }
  }, [baseAmount, baseCurrency, billingReferenceId, payWithQrph, runBounded, showError]);

  useFocusEffect(useCallback(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      void startPayment();
    }
    return () => { startedRef.current = false; };
  }, [startPayment]));

  const completePayment = useCallback(async () => {
    if (!session) {
      setWebviewUrl(null);
      showError('Unable to identify the QR Ph payment. Please try again.');
      return;
    }

    outcomeRef.current = 'success';
    setIsVerifying(true);
    setIsPending(false);
    setErrorMessage(null);
    try {
      let response: any;
      for (let attempt = 1; attempt <= QRPH_VERIFY_MAX_ATTEMPTS; attempt += 1) {
        try {
          response = await runBounded<any>(
            verifyQrph(session.transactionReferenceId),
            PAYMENT_REQUEST_TIMEOUT_MS,
          );
          break;
        } catch (error: any) {
          if (!isPaymentPending(error) || attempt === QRPH_VERIFY_MAX_ATTEMPTS) {
            throw error;
          }
          await wait(QRPH_VERIFY_POLL_INTERVAL_MS);
        }
      }

      if (!response) {
        throw new Error('QR Ph verification did not return a response');
      }
      clearPaymentIntentKey('qrph-start', paymentIntent);
      setWebviewUrl(null);
      dispatch(showSnackbar({ message: response.message || 'Payment successful.', variant: 'success' }));
      router.replace({
        pathname: '/bills/one-time-payments/pay/payment-success',
        params: {
          billingReferenceId,
          invoiceReferenceId: response.invoiceReferenceId || session.invoiceReferenceId,
        },
      });
    } catch (err: any) {
      setWebviewUrl(null);
      if (isPaymentPending(err)) {
        setIsPending(true);
        setErrorMessage(err?.data?.message || 'Your QR Ph payment was received and is still being recorded.');
      } else {
        showError(err?.data?.message || (
          err?.name === 'AbortError'
            ? 'Payment verification took too long. Check the status again.'
            : 'Unable to verify the QR Ph payment.'
        ));
      }
    } finally {
      setIsVerifying(false);
    }
  }, [billingReferenceId, dispatch, paymentIntent, runBounded, session, showError, verifyQrph]);

  const handleFailure = useCallback(() => {
    outcomeRef.current = 'failure';
    clearPaymentIntentKey('qrph-start', paymentIntent);
    createRequestKeyRef.current = getPaymentIntentKey('qrph-start', paymentIntent);
    setWebviewUrl(null);
    setSession(null);
    showError('The QR Ph payment was not completed. Please try again.');
  }, [paymentIntent, showError]);

  const handleComplete = useCallback(() => {
    if (outcomeRef.current) return;
    if (session) {
      // The page can be closed after paying but before Maya redirects, so check the
      // payment status instead of assuming it failed. Unpaid sessions resolve to the
      // same pending/error states with a "Check Payment Status" retry.
      void completePayment();
      return;
    }
    setWebviewUrl(null);
    showError('QR Ph page was closed. Check the payment status before trying again.');
  }, [completePayment, session, showError]);

  const handleWebViewError = useCallback((message: string) => {
    setWebviewUrl(null);
    showError(message);
  }, [showError]);

  const retry = useCallback(() => {
    if (session) {
      void completePayment();
      return;
    }
    void startPayment();
  }, [completePayment, session, startPayment]);

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
      <NavHeaderComponent title="QR Ph" />
      <View style={[globalStyle.outerContainer, { minHeight: 220, justifyContent: 'center' }]}>
        {isStarting || isVerifying ? (
          <View style={globalStyle.loadingContainer}>
            <NativeLoadingIndicator
              label={isVerifying ? 'Verifying QR Ph payment' : 'Preparing QR Ph payment'}
              size="large"
            />
            <SpacerComponent height={16} />
            <AppText size="small" style={globalStyle.textAlignCenter}>
              {isVerifying ? 'Confirming your payment with Maya…' : 'Opening the secure QR Ph payment page…'}
            </AppText>
          </View>
        ) : errorMessage ? (
          <View>
            <AppText size="medium" weight="700" color="maroon10" mBottom={8}>
              {isPending ? 'Payment processing' : 'Payment not completed'}
            </AppText>
            <AppText size="small" mBottom={20}>{errorMessage}</AppText>
            <AppButton
              title={session ? 'Check Payment Status' : 'Try Again'}
              variant="primary"
              onPress={retry}
            />
          </View>
        ) : null}
      </View>
      <SpacerComponent height={100} />

      <OtpWebView
        url={webviewUrl || ''}
        title="QR Ph Payment"
        visible={!!webviewUrl}
        isProcessing={isVerifying}
        processingLabel="Verifying your payment"
        onComplete={handleComplete}
        onSuccess={() => { void completePayment(); }}
        onFailure={handleFailure}
        onError={handleWebViewError}
        successUrlPatterns={[VALIDATORS.QRPH_SUCCESS_URL_PATTERN]}
        failureUrlPatterns={[VALIDATORS.QRPH_FAILURE_URL_PATTERN]}
        successMode="navigation"
      />
    </ScrollView>
  );
};

export default QrphPayment;
