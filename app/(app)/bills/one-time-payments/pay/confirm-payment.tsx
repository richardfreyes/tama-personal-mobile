import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import DisplayNotice from '@/components/common/DisplayNotice';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import ModalContent from '@/components/layout/ModalContent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import LegalDocumentContent from '@/components/settings/LegalDocumentContent';
import { OtpWebView } from '@/components/layout/OtpWebView';
import TermsAndConditionsCheckbox from '@/components/settings/TermsAndPolicyText';
import { PRIVACY_POLICY_CONTENT, TERMS_AND_CONDITIONS_CONTENT } from '@/constants/legal';
import { useGetBillDetailQuery } from '@/redux/features/billDetail/billDetailApi';
import { useLazyGetTransactionDetailQuery } from '@/redux/features/transactionDetail/transactionDetailApi';
import { selectLastCompletedInvoiceReferenceId } from '@/redux/features/oneTimePayment/oneTimePaymentSlice';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { usePayTransactionMutation } from '@/redux/features/transactions/transactionApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { confirmPaymentsStyles as styles } from '@/styles/app/bills/one-time-payments/pay/confirm-payment';
import { globalStyle } from '@/styles/common/globals';
import { formatLastFourDigits, getProviderDisplay } from '@/utils/card';
import { formatMoney } from '@/utils/format';
import { isConfirmedPaymentStatus, isFailedPaymentStatus } from '@/utils/paymentStatus';
import { getPaymentIntentKey } from '@/utils/paymentIntentKey';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

const ConfirmPaymentScreen = () => {
  const dispatch = useAppDispatch();
  const [ payTransaction, { isLoading }] = usePayTransactionMutation();
  const [getTransactionDetail, { isFetching: isCheckingStatus }] = useLazyGetTransactionDetailQuery();
  const { billingReferenceId, computationResponse, invoiceReferenceId, transactionReferenceId, paymentMethodProvider, lastFourCardDigits } = useLocalSearchParams();
  const { data: billData, isLoading: billDetailIsLoading } = useGetBillDetailQuery(billingReferenceId as string);
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [activeLegalModal, setActiveLegalModal] = React.useState<'terms' | 'privacy' | null>(null);
  const [redirectUrl, setRedirectUrl] = React.useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = React.useState(false);
  const submittingRef = useRef(false);
  const amount = JSON.parse(computationResponse as string);
  const hasCardInfo = Boolean((paymentMethodProvider as string)?.trim() || (lastFourCardDigits as string)?.trim());
  const cardLabel = `${getProviderDisplay(paymentMethodProvider as string)} •••• ${formatLastFourDigits(lastFourCardDigits as string)}`;

  const lastCompletedInvoiceReferenceId = useAppSelector(selectLastCompletedInvoiceReferenceId);
  const handledCompletedInvoiceRef = useRef(lastCompletedInvoiceReferenceId);
  useEffect(() => {
    if (handledCompletedInvoiceRef.current === lastCompletedInvoiceReferenceId) return;
    handledCompletedInvoiceRef.current = lastCompletedInvoiceReferenceId;
    setAcceptedTerms(false);
    setActiveLegalModal(null);
  }, [lastCompletedInvoiceReferenceId]);

  const openReceipt = () => {
    setAwaitingConfirmation(false);
    router.replace({
      pathname: '/bills/one-time-payments/pay/payment-success',
      params: { billingReferenceId, computationResponse, invoiceReferenceId, transactionReferenceId },
    });
  };

  const verifyPayment = async () => {
    try {

      const detail = await getTransactionDetail((transactionReferenceId || invoiceReferenceId) as string, false).unwrap();
      if (isFailedPaymentStatus(detail.status)) {
        dispatch(showSnackbar({ message: 'Payment could not be completed. Check its status before trying again.', variant: 'error' }));
        return;
      }
      if (isConfirmedPaymentStatus(detail.status)) {
        dispatch(showSnackbar({ message: 'Payment successful.', variant: 'success' }));
      }
    } catch {

    }
    openReceipt();
  };

  const handlePayNow = async () => {
    if (!acceptedTerms || submittingRef.current) return;
    submittingRef.current = true;

    try {
      if (!awaitingConfirmation) {
        const response = await payTransaction({ transactionId: transactionReferenceId as string, idempotencyKey: getPaymentIntentKey('saved-card-payment', transactionReferenceId as string) }).unwrap();
        setAwaitingConfirmation(true);
        if (response.redirect) {
          setRedirectUrl(response.redirect);
          return;
        }
      }
      await verifyPayment();
    } catch (err: any) {
      dispatch(showSnackbar({
        message: err.data?.message || 'Unable to confirm payment. Check its status before retrying.',
        variant: 'error',
      }));
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <>
      <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title='Pay Bills' />
          <DisplayNotice Icon={'info'} title='important:' description='Auto-debit arrangement enrollments with Tama are charged in US Dollars and are subject to mid-market foreign exchange rates.'/>
          <View style={[globalStyle.outerContainer, { marginBottom: 24 }]}>
            <View style={styles.wrapper}>
              <View style={{ alignItems: 'center' }}>
                <AppText size='medium' style={styles.title} weight='700'>{billData?.merchant_name}</AppText>
                <AppText size='extraSmall' style={styles.desc}>You are about to pay</AppText>
                <AppText size='large' mBottom={8} weight='700'>{formatMoney([amount.computation.totalCurrency, amount.computation.totalAmount])}</AppText>
                {hasCardInfo ? (
                  <AppText style={styles.desc}>using <AppText style={styles.desc} weight='700'>{cardLabel}</AppText></AppText>
                ) : null}
              </View>
              {billData?.custom_fields && (
                Object.entries(billData.custom_fields).map(([key, field]) => (
                  <InfoFieldComponent label={field.text} value={field.value} key={key} />
                ))
              )}
            </View>
          </View>
          <TermsAndConditionsCheckbox
            extraText="I have read and agree to the"
            isChecked={acceptedTerms}
            onToggle={() => setAcceptedTerms((prev) => !prev)}
            onTermsLinkPress={() => setActiveLegalModal('terms')}
            onPrivacyLinkPress={() => setActiveLegalModal('privacy')}
          />
          <AppButton
            title={awaitingConfirmation ? 'Check Payment Status' : 'Complete My Payment'}
            variant="primary"
            onPress={handlePayNow}
            isLoading={isLoading || isCheckingStatus}
            disabled={!acceptedTerms || isLoading || isCheckingStatus}
          />
        </View>
        <SpacerComponent height={24} />
      </GlobalScrollView>

      {activeLegalModal === 'terms' ? (
        <ModalContent
          visible
          title="Terms & Conditions"
          onClose={() => setActiveLegalModal(null)}
        >
          <LegalDocumentContent content={TERMS_AND_CONDITIONS_CONTENT} />
        </ModalContent>
      ) : null}

      {activeLegalModal === 'privacy' ? (
        <ModalContent
          visible
          title="Privacy Policy"
          onClose={() => setActiveLegalModal(null)}
        >
          <LegalDocumentContent content={PRIVACY_POLICY_CONTENT} />
        </ModalContent>
      ) : null}
      {redirectUrl ? (
        <OtpWebView
          visible
          url={redirectUrl}
          onComplete={() => setRedirectUrl(null)}
          onSuccess={() => { setRedirectUrl(null); void verifyPayment(); }}
          onFailure={() => { setRedirectUrl(null); dispatch(showSnackbar({ message: 'Card authentication failed. Check payment status before trying again.', variant: 'error' })); }}
        />
      ) : null}
    </>
  );
};

export default ConfirmPaymentScreen;
