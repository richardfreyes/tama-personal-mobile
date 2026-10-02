import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import DisplayNotice from '@/components/common/DisplayNotice';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { PaymentInfoSkeleton } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import { EnrollmentVerificationWebView } from '@/components/layout/EnrollmentVerificationWebView';
import ModalContent from '@/components/layout/ModalContent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { OtpWebView } from '@/components/layout/OtpWebView';
import PaymentInfoSection from '@/components/payments/PaymentInfoSection';
import LegalDocumentContent from '@/components/settings/LegalDocumentContent';
import { VALIDATORS } from '@/constants';
import { COMMON } from '@/constants/common';
import { PRIVACY_POLICY_CONTENT, REFUND_AND_CHARGEBACK_POLICY_CONTENT, TERMS_AND_CONDITIONS_CONTENT } from '@/constants/legal';
import { useCompleteEnrollment } from '@/hooks/useCompleteEnrollment';
import { useCompleteEnrollmentPayment } from '@/hooks/useCompleteEnrollmentPayment';
import { useInitializeEnrollmentPaymentMethod } from '@/hooks/useInitializeEnrollmentPaymentMethod';
import { appApi } from '@/redux/appApi';
import { setXsrfToken } from '@/redux/features/csrf/csrfSlice';
import { clearEnrollmentCardPayload, clearEnrollmentTransactionResponse } from '@/redux/features/enrollments/review/reviewSlice';
import { showModal } from '@/redux/features/modal/modalSlice';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import type { MerchantEnrollmentDetailResponse } from '@/redux/features/merchants/merchantTypes';
import type { RootState } from '@/redux/store';
import { confirmPaymentStyles as styles } from '@/styles/app/bills/enrollments/confirm-payment';
import { globalStyle } from '@/styles/common/globals';
import { ConfirmPaymentDisplayTransaction, EnrollmentCallbackResult, EnrollmentLineItem, PaymentInfoRow } from '@/types';
import { formatLineItemFee, isValidLineItemFee, normalizeName } from '@/utils/format';
import { buildEnrollmentPaymentDetails, buildPaymentDetails, buildPaymentMethodDetails, buildScheduledPaymentInfo } from '@/utils/paymentMappers';
import { modalActions } from '@/utils/modalActions';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Checkbox, useTheme } from 'react-native-paper';

const ConfirmPaymentScreen = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const [completedTransactionSessionKey, setCompletedTransactionSessionKey] = useState<string | null>(null);
  const [hasAcceptedPaymentTerms, setHasAcceptedPaymentTerms] = useState(false);
  const [hasAcceptedEnrollmentTerms, setHasAcceptedEnrollmentTerms] = useState(false);
  const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | 'refund' | null>(null);
  const { cardPayload, formResetKey, transactionResponse } = useAppSelector((state: RootState) => state.enrollmentReview);
  const merchantId = transactionResponse?.merchantId || '';
  const transactionId = transactionResponse?.transactionId || '';
  const xsrfKey = transactionResponse?.xsrfKey;
  const isEnrollment = transactionResponse?.isEnrollment !== false;
  const transactionSessionKey = useMemo(() => {
    if (!transactionId) return '';

    return [
      formResetKey,
      merchantId,
      transactionId,
      xsrfKey || '',
      isEnrollment ? 'enrollment' : 'payment',
    ].join('|');
  }, [formResetKey, isEnrollment, merchantId, transactionId, xsrfKey]);
  const isPaymentComplete = !!transactionSessionKey && completedTransactionSessionKey === transactionSessionKey;

  const notify = useCallback((message: string, variant: any = 'error') => {
    dispatch(showSnackbar({ message, variant }));
  }, [dispatch]);

  const notifyError = useCallback((message: string) => {
    notify(message, 'error');
  }, [notify]);

  const showEnrollmentDeclinedModal = useCallback(() => {
    const modalId = 'enrollment-verification-declined';
    modalActions[modalId] = () => {
      router.replace('/(app)/bills/enrollments/payment-method');
    };
    dispatch(showModal({
      id: modalId,
      dismissible: false,
      iconType: 'error',
      headerMessage: 'Enrollment Declined',
      bodyMessage: 'Your enrollment was declined. Please try again or use a different card.',
      buttonConfig: {
        primaryLabel: 'OK',
      },
    }));
  }, [dispatch]);

  const handlePaymentMethodInitializationError = useCallback((message: string) => {
    if (isEnrollment) {
      showEnrollmentDeclinedModal();
      return;
    }

    notifyError(message);
  }, [isEnrollment, notifyError, showEnrollmentDeclinedModal]);

  const {
    cardDetails,
    merchantTransactionData,
    isPaymentMethodReady,
    isInitializingPaymentMethod,
    cardVerificationUrl,
    handleCardVerificationSuccess,
    handleCardVerificationFailure,
    handleCardVerificationDismissed,
    resetPaymentMethodState,
    getLatestMerchantTransaction,
  } = useInitializeEnrollmentPaymentMethod({
    merchantId,
    transactionId,
    xsrfKey,
    cardPayload,
    isEnrollment,
    onError: handlePaymentMethodInitializationError,
  });

  const [hasCompletedInit, setHasCompletedInit] = useState(false);
  const previousTransactionSessionKeyRef = useRef(transactionSessionKey);
  const prevIsPaymentMethodReadyRef = useRef(false);

  useEffect(() => {
    if (previousTransactionSessionKeyRef.current === transactionSessionKey) {
      return;
    }

    previousTransactionSessionKeyRef.current = transactionSessionKey;
    setHasCompletedInit(false);
    prevIsPaymentMethodReadyRef.current = false;

    if (transactionSessionKey) {
      setCompletedTransactionSessionKey(null);
      setHasAcceptedPaymentTerms(false);
      setHasAcceptedEnrollmentTerms(false);
      setHasAcceptedPrivacyPolicy(false);
      setActiveLegalModal(null);
    }
  }, [transactionSessionKey]);

  useEffect(() => {
    if (transactionSessionKey && !prevIsPaymentMethodReadyRef.current && isPaymentMethodReady) {
      setHasCompletedInit(true);
    }
    prevIsPaymentMethodReadyRef.current = isPaymentMethodReady;
  }, [isPaymentMethodReady, transactionSessionKey]);

  const displayTransaction = useMemo<ConfirmPaymentDisplayTransaction>(() => (
    (merchantTransactionData || COMMON.MOCK_DATA.ENROLLMENTS.CONFIRM_PAYMENT) as ConfirmPaymentDisplayTransaction
  ), [merchantTransactionData]);

  const paymentDetails = useMemo(
    () => isEnrollment
      ? buildEnrollmentPaymentDetails(merchantTransactionData as MerchantEnrollmentDetailResponse | undefined)
      : buildPaymentDetails(displayTransaction),
    [displayTransaction, isEnrollment, merchantTransactionData],
  );

  const paymentMethodDetails = useMemo(
    () => buildPaymentMethodDetails({ transactionId, cardPayload, cardDetails }),
    [cardDetails, cardPayload, transactionId],
  );

  const scheduledPaymentInfo = useMemo(() => {
    if (!isEnrollment || !merchantTransactionData) return null;
    const enrollment = merchantTransactionData as MerchantEnrollmentDetailResponse;
    return buildScheduledPaymentInfo({
      currency: enrollment.bill?.currency ?? enrollment.baseCurrency ?? COMMON.DEFAULT_CURRENCY,
      monthlyAmount: enrollment.bill?.amount ?? enrollment.baseAmount ?? COMMON.DEFAULT_AMOUNT,
      months: enrollment.enrollmentMonths,
      startDate: enrollment.enrollmentStartDate,
    });
  }, [isEnrollment, merchantTransactionData]);

  const isDataReady = hasCompletedInit && !!merchantTransactionData;
  const isEnrollmentTransaction = isEnrollment;
  const isPaymentTransaction = !isEnrollment;

  const directPaymentFeeRows = useMemo<PaymentInfoRow[]>(() => {
    if (!isPaymentTransaction) return [];

    const lineItems: EnrollmentLineItem[] = (merchantTransactionData as any)?.lineItems || [];
    const rows: PaymentInfoRow[] = [];

    const visaFeeLineItem = lineItems.find((item) => item.description === "Visa's fees");
    if (visaFeeLineItem && isValidLineItemFee(visaFeeLineItem.fee)) {
      rows.push({ label: "Visa's fees", value: formatLineItemFee(visaFeeLineItem.fee) });
    }

    const convenienceFeeLineItem = lineItems.find((item) =>
      item.description === "Aqwire's convenience fee" || item.description === "Tama's convenience fee"
    );
    if (convenienceFeeLineItem && isValidLineItemFee(convenienceFeeLineItem.fee)) {
      rows.push({ label: 'Convenience fee', value: formatLineItemFee(convenienceFeeLineItem.fee) });
    }

    return rows;
  }, [isPaymentTransaction, merchantTransactionData]);

  const shouldShowDirectPaymentFees = directPaymentFeeRows.length > 0;

  const paymentDetailsWithFees = useMemo<PaymentInfoRow[]>(() => {
    if (!shouldShowDirectPaymentFees) return paymentDetails;

    const totalAmountIndex = paymentDetails.findIndex((row) => row.label === 'Total Amount');

    if (totalAmountIndex === -1) {
      return [...paymentDetails, ...directPaymentFeeRows];
    }

    const totalAmountRow = paymentDetails[totalAmountIndex];
    const detailsWithoutTotal = [
      ...paymentDetails.slice(0, totalAmountIndex),
      ...paymentDetails.slice(totalAmountIndex + 1),
    ];

    return [...detailsWithoutTotal, ...directPaymentFeeRows, totalAmountRow];
  }, [paymentDetails, directPaymentFeeRows, shouldShowDirectPaymentFees]);
  const isCreditCardPaymentMethod = !!cardPayload;
  const customerNameNormalized = normalizeName(displayTransaction.customerName);
  const cardholderNameNormalized = normalizeName(cardPayload?.cardholderName);
  const isCardholderNameDifferent = isCreditCardPaymentMethod && customerNameNormalized !== '' && cardholderNameNormalized !== '' && customerNameNormalized !== cardholderNameNormalized;
  const shouldShowCardholderDisclaimer = isDataReady && isCardholderNameDifferent;
  const hasAcceptedTerms = isEnrollmentTransaction ? (hasAcceptedEnrollmentTerms && hasAcceptedPrivacyPolicy) : hasAcceptedPaymentTerms;

  const handlePaymentSuccess = useCallback(({
    message,
    referenceId,
    receiptAccessSignature,
    receiptAccessType,
  }: {
    message: string;
    referenceId: string;
    receiptAccessSignature: string;
    receiptAccessType: string;
  }) => {
    resetPaymentMethodState();
    setCompletedTransactionSessionKey(transactionSessionKey);
    setHasAcceptedPaymentTerms(false);
    setHasAcceptedEnrollmentTerms(false);
    setHasAcceptedPrivacyPolicy(false);

    if (isEnrollment) {
      dispatch(appApi.util.invalidateTags(['Enrollments']));
    }

    dispatch(clearEnrollmentCardPayload());
    dispatch(clearEnrollmentTransactionResponse());
    dispatch(setXsrfToken(null));
    notify(message, 'success');

    router.replace({
      pathname: '/bills/enrollments/payment-success',
      params: {
        merchantId,
        transactionId,
        referenceId,
        receiptAccessSignature,
        receiptAccessType,
        isEnrollment: isEnrollment ? 'true' : 'false',
      },
    });
  }, [dispatch, isEnrollment, merchantId, notify, resetPaymentMethodState, transactionId, transactionSessionKey]);

  const { isSubmittingPayment, submitPayment, pendingPaymentRedirect, handlePaymentRedirectComplete } = useCompleteEnrollmentPayment({
    merchantId,
    transactionId,
    xsrfKey,
    getLatestMerchantTransaction,
    onError: notifyError,
    onNotice: notify,
    onSuccess: handlePaymentSuccess,
  });

  const { isSubmittingEnrollment, submitEnrollment, pendingVerification, handleVerificationComplete } = useCompleteEnrollment({
    merchantId,
    transactionId,
    xsrfKey,
    getLatestMerchantTransaction,
    onError: notifyError,
    onNotice: notify,
    onSuccess: handlePaymentSuccess,
  });

  const handleEnrollmentVerificationComplete = useCallback((result: EnrollmentCallbackResult) => {
    handleVerificationComplete(result);

    if (result.outcome === 'failure') {
      showEnrollmentDeclinedModal();
      return;
    }

    if (result.outcome === 'cancelled') {
      router.replace({
        pathname: '/bills/enrollments/result',
        params: result,
      });
    }
  }, [handleVerificationComplete, showEnrollmentDeclinedModal]);

  const isProcessingPayment = isInitializingPaymentMethod || isSubmittingPayment || isSubmittingEnrollment || !!pendingVerification || !!pendingPaymentRedirect;
  const isSubmitDisabled = isPaymentComplete || !isPaymentMethodReady || !hasAcceptedTerms || isProcessingPayment;

  const openCardAuthForm = useCallback(async () => {
    await WebBrowser.openBrowserAsync(COMMON.LEGAL_URLS.CARD_AUTH_FORM_URL);
  }, []);

  const closeLegalModal = useCallback(() => {
    setActiveLegalModal(null);
  }, []);

  const handlePayNow = useCallback(() => {
    if (isEnrollment) {
      void submitEnrollment({
        hasAcceptedTerms,
        isPaymentMethodReady,
      });
    } else {
      void submitPayment({
        hasAcceptedTerms,
        isPaymentMethodReady,
      });
    }
  }, [hasAcceptedTerms, isEnrollment, isPaymentMethodReady, submitEnrollment, submitPayment]);

  return (
    <>
      <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title="Pay Bills" onBackPress={() => {
            router.navigate({
              pathname: '/payment-methods/form-details',
              params: { apiEnv: 'enrollments' },
            });
          }} />

          {isDataReady ? (
            <>
              <DisplayNotice
                Icon="info"
                title="Important:"
                description="Payments made through the Tama platform incur forex charges based on Tama's own internal FX rates. This is a standard fee for international remittances."
              />

              <PaymentInfoSection title="Payment Details" rows={paymentDetailsWithFees} />

              {scheduledPaymentInfo && (
                <>
                  <PaymentInfoSection title="Scheduled Payment" rows={scheduledPaymentInfo.rows} />
                  <View style={styles.noteContainer}>
                    <AppText weight="light" style={styles.noteText}>
                      {scheduledPaymentInfo.noteText}
                    </AppText>
                  </View>
                </>
              )}

              <PaymentInfoSection title="Payment Method Details" rows={paymentMethodDetails} />

              {shouldShowCardholderDisclaimer && (
                <View style={styles.disclaimerContainer}>
                  <AppText weight="light" style={styles.disclaimerText}>
                    <AppText weight="700" style={styles.disclaimerTitle}>Disclaimer: </AppText>
                    {"We've detected that the unit owner and cardholder names are different. By proceeding with this payment, you represent and warrant that you are the cardholder or have obtained the cardholder's authorization to use this credit card. Please complete this "}
                    <AppText style={styles.link} onPress={openCardAuthForm}>form</AppText>
                    {' '}and provide it to your merchant.
                  </AppText>
                </View>
              )}

              {isEnrollmentTransaction && (
                <>
                  <View style={styles.checkboxRow}>
                    <Checkbox.Android
                      status={hasAcceptedEnrollmentTerms ? 'checked' : 'unchecked'}
                      onPress={() => setHasAcceptedEnrollmentTerms((prev) => !prev)}
                      color={primaryColor}
                    />
                    <View style={styles.checkboxTextContainer}>
                      <AppText weight="light" style={styles.checkboxText}>
                        I agree to the{' '}
                        <AppText style={styles.link} onPress={() => setActiveLegalModal('terms')}>
                          Auto-Debit Enrollment Terms & Conditions
                        </AppText>
                        {' '}and certify that I am authorized to make a payment on this account and certify that I am authorized to complete this payment for this unit/property.
                        <AppText weight="light" style={styles.required}> *</AppText>
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.checkboxRow}>
                    <Checkbox.Android
                      status={hasAcceptedPrivacyPolicy ? 'checked' : 'unchecked'}
                      onPress={() => setHasAcceptedPrivacyPolicy((prev) => !prev)}
                      color={primaryColor}
                    />
                    <View style={styles.checkboxTextContainer}>
                      <AppText weight="light" style={styles.checkboxText}>
                        By using our service, you agree with the storage and handling of your data by this website in accordance with our{' '}
                        <AppText style={styles.link} onPress={() => setActiveLegalModal('privacy')}>Privacy Policy</AppText>.
                        <AppText weight="light" style={styles.required}> *</AppText>
                      </AppText>
                    </View>
                  </View>
                </>
              )}

              {isPaymentTransaction && (
                <View style={styles.checkboxRow}>
                  <Checkbox.Android
                    status={hasAcceptedPaymentTerms ? 'checked' : 'unchecked'}
                    onPress={() => setHasAcceptedPaymentTerms((prev) => !prev)}
                    color={primaryColor}
                  />
                  <View style={styles.checkboxTextContainer}>
                    <AppText weight="light" style={styles.checkboxText}>
                      By ticking the checkbox, you agree to the{' '}
                      <AppText style={styles.link} onPress={() => setActiveLegalModal('terms')}>Terms & Conditions</AppText>,{' '}
                      <AppText style={styles.link} onPress={() => setActiveLegalModal('privacy')}>Privacy Policy</AppText>
                      {' '}and{' '}
                      <AppText style={styles.link} onPress={() => setActiveLegalModal('refund')}>Refund Policy</AppText>
                      {' '}of Tama and certify that you are authorized to make a payment on this account.
                      <AppText weight="light" style={styles.required}> *</AppText>
                    </AppText>
                  </View>
                </View>
              )}

              <AppButton
                title={isPaymentComplete ? 'Payment Submitted' : 'Complete My Payment'}
                variant="primary"
                onPress={handlePayNow}
                isLoading={isProcessingPayment}
                disabled={isSubmitDisabled}
              />
            </>
          ) : (
            <View testID="enrollment-confirm-payment-loading">
              <PaymentInfoSkeleton
                sections={2}
                rowsPerSection={5}
                label="Loading payment details"
                includeNotice
                includeCheckbox
              />
            </View>
          )}
        </View>

        <SpacerComponent height={24} />

        {pendingVerification && (
          <EnrollmentVerificationWebView
            url={pendingVerification.url}
            accessSignature={pendingVerification.accessSignature}
            accessType={pendingVerification.accessType}
            onComplete={handleEnrollmentVerificationComplete}
          />
        )}

        {isEnrollmentTransaction && (
          <OtpWebView
            url={cardVerificationUrl || ''}
            title="3DS Verification"
            waitHint="After the confirmation page appears, wait a few seconds. You'll be returned to the app automatically."
            waitOnDismiss
            visible={!!cardVerificationUrl}
            onComplete={handleCardVerificationDismissed}
            onSuccess={handleCardVerificationSuccess}
            onFailure={() => handleCardVerificationFailure('Your card was declined. Please try another card.')}
            onError={notifyError}
            successUrlPatterns={[VALIDATORS.CARD_3DS_SUCCESS_URL_PATTERN]}
            failureUrlPatterns={[VALIDATORS.CARD_3DS_FAILED_URL_PATTERN]}
            successMode="message"
          />
        )}

        {isPaymentTransaction && pendingPaymentRedirect && (
          <OtpWebView
            url={pendingPaymentRedirect.url}
            title="Complete Payment"
            visible
            onComplete={handlePaymentRedirectComplete}
            onError={notifyError}
          />
        )}
      </GlobalScrollView>

      {activeLegalModal === 'terms' ? (
        <ModalContent
          visible
          title={isEnrollmentTransaction ? 'Auto-Debit Enrollment Terms & Conditions' : 'Terms & Conditions'}
          onClose={closeLegalModal}
        >
          <LegalDocumentContent content={TERMS_AND_CONDITIONS_CONTENT} />
        </ModalContent>
      ) : null}

      {activeLegalModal === 'privacy' ? (
        <ModalContent
          visible
          title="Privacy Policy"
          onClose={closeLegalModal}
        >
          <LegalDocumentContent content={PRIVACY_POLICY_CONTENT} />
        </ModalContent>
      ) : null}

      {activeLegalModal === 'refund' ? (
        <ModalContent
          visible
          title="Refund and Chargeback Policy"
          onClose={closeLegalModal}
        >
          <LegalDocumentContent content={REFUND_AND_CHARGEBACK_POLICY_CONTENT} />
        </ModalContent>
      ) : null}
    </>
  );
};

export default ConfirmPaymentScreen;
