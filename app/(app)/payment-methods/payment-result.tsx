import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { NativeLoadingIndicator } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { PAYMENT_RESULT_COPY, PAYMENT_RESULT_PROVIDER_LABELS } from '@/constants/paymentResult';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import {
  useCancelPayPalMutation,
  useCapturePayPalMutation,
  useVerifyQrphMutation,
} from '@/redux/features/transactions/transactionApi';
import { useAppDispatch } from '@/redux/hooks';
import { globalStyle } from '@/styles/common/globals';
import { PaymentResultProvider, PaymentResultStatus } from '@/types/common';
import { getPaymentErrorMessage, isPaymentPending } from '@/utils/paymentErrors';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

/**
 * Landing screen for the `payment-result` deep link, reached when a PayPal or QR Ph page
 * finished outside the in-app WebView. The redirect outcome is only a hint: the payment is
 * always reconciled with the backend before anything is shown as successful.
 */
const PaymentResult = () => {
  const dispatch = useAppDispatch();
  const { provider, outcome, transactionReferenceId, invoiceReferenceId } = useLocalSearchParams<{
    provider?: string;
    outcome?: string;
    transactionReferenceId?: string;
    invoiceReferenceId?: string;
  }>();
  const paymentProvider: PaymentResultProvider = provider === 'paypal' ? 'paypal' : 'qrph';
  const providerLabel = PAYMENT_RESULT_PROVIDER_LABELS[paymentProvider];
  const [capturePayPal] = useCapturePayPalMutation();
  const [cancelPayPal] = useCancelPayPalMutation();
  const [verifyQrph] = useVerifyQrphMutation();
  const [status, setStatus] = useState<PaymentResultStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Expo Router reuses this screen when another return link arrives, so reconcile once per link.
  const reconciledLinkRef = useRef<string | null>(null);

  const reconcile = useCallback(async () => {
    if (!transactionReferenceId) {
      setStatus('error');
      return;
    }

    setStatus(null);
    setErrorMessage(null);
    try {
      const response = await (paymentProvider === 'paypal'
        ? capturePayPal(transactionReferenceId)
        : verifyQrph(transactionReferenceId)
      ).unwrap();
      dispatch(showSnackbar({ message: response.message || 'Payment successful.', variant: 'success' }));
      router.replace({
        pathname: '/bills/one-time-payments/pay/payment-success',
        params: { invoiceReferenceId: response.invoiceReferenceId || invoiceReferenceId || '' },
      });
    } catch (error: any) {
      if (isPaymentPending(error)) {
        setStatus('pending');
        return;
      }
      if (outcome === 'cancelled' || outcome === 'failure') {
        // QR Ph can be provider-paid before its webhook completes. Do not mark
        // it failed from a callback hint; the pending session expires server-side.
        if (paymentProvider === 'paypal') {
          try { await cancelPayPal(transactionReferenceId).unwrap(); } catch { /* best effort */ }
        }
        setStatus(outcome);
        return;
      }
      setErrorMessage(getPaymentErrorMessage(error, PAYMENT_RESULT_COPY.error.message));
      setStatus('error');
    }
  }, [cancelPayPal, capturePayPal, dispatch, invoiceReferenceId, outcome, paymentProvider, transactionReferenceId, verifyQrph]);

  useEffect(() => {
    const link = [paymentProvider, outcome, transactionReferenceId, invoiceReferenceId].join('|');
    if (reconciledLinkRef.current === link) return;
    reconciledLinkRef.current = link;
    void reconcile();
  }, [reconcile, paymentProvider, outcome, transactionReferenceId, invoiceReferenceId]);

  const copy = status ? PAYMENT_RESULT_COPY[status] : null;
  const canCheckAgain = (status === 'pending' || status === 'error') && !!transactionReferenceId;

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
      <NavHeaderComponent title={providerLabel} onBackPress={() => router.replace('/dashboard')} />
      <View style={[globalStyle.outerContainer, { minHeight: 220, justifyContent: 'center' }]}>
        {!copy ? (
          <View style={globalStyle.loadingContainer}>
            <NativeLoadingIndicator label={`Confirming your ${providerLabel} payment`} size="large" />
          </View>
        ) : (
          <View>
            <AppText size="medium" weight="700" color="maroon10" mBottom={8}>{copy.title}</AppText>
            <AppText size="small" mBottom={20}>{errorMessage || copy.message}</AppText>
            {canCheckAgain && (
              <>
                <AppButton title="Check Payment Status" variant="primary" onPress={() => { void reconcile(); }} />
                <SpacerComponent height={12} />
              </>
            )}
            <AppButton
              title="Back to Dashboard"
              variant={canCheckAgain ? 'secondary' : 'primary'}
              onPress={() => router.replace('/dashboard')}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PaymentResult;
