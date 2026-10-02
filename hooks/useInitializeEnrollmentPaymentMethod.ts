import { useCreateMerchantEnrollmentPaymentVaultMutation, useCreateMerchantTransactionPaymentVaultMutation, useLazyGetMerchantEnrollmentPaymentBinQuery, useLazyGetMerchantEnrollmentQuery, useLazyGetMerchantTransactionPaymentBinQuery, useLazyGetMerchantTransactionQuery } from '@/redux/features/merchants/merchantApi';
import { UseInitializeEnrollmentPaymentMethodParams } from '@/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPaymentErrorMessage } from '../utils/paymentErrors';
import { buildVaultPaymentBody, getNormalizedCardDetails } from '../utils/paymentMappers';
import { getPaymentIntentKey } from '@/utils/paymentIntentKey';

const TAG = '[EnrollmentCard]';

// Status and message only: error bodies can carry provider text but never the card details we send
const describeError = (error: any): string => `status=${error?.status ?? error?.originalStatus ?? 'n/a'} message=${error?.data?.message ?? error?.message ?? 'n/a'}`;

export const useInitializeEnrollmentPaymentMethod = ({ merchantId, transactionId, xsrfKey, cardPayload, isEnrollment, onError }: UseInitializeEnrollmentPaymentMethodParams) => {
  const initializationKeyRef = useRef<string | null>(null);
  const lastValidationErrorKeyRef = useRef<string | null>(null);
  const [isPaymentMethodReady, setIsPaymentMethodReady] = useState(false);
  const [cardVerificationUrl, setCardVerificationUrl] = useState<string | null>(null);
  const hasHandledCardVerificationRef = useRef(false);
  const [createMerchantTransactionPaymentVault, { isLoading: isVaultingTransactionPayment }] = useCreateMerchantTransactionPaymentVaultMutation();
  const [createMerchantEnrollmentPaymentVault, { isLoading: isVaultingEnrollmentPayment }] = useCreateMerchantEnrollmentPaymentVaultMutation();
  const isVaultingPayment = isVaultingTransactionPayment || isVaultingEnrollmentPayment;
  const [getMerchantTransactionPaymentBin, { isLoading: isBinLookupLoading }] = useLazyGetMerchantTransactionPaymentBinQuery();
  const [getMerchantEnrollmentPaymentBin, { isLoading: isEnrollmentBinLookupLoading }] = useLazyGetMerchantEnrollmentPaymentBinQuery();
  const [getMerchantTransaction, { data: merchantTransactionData, isLoading: isMerchantTransactionLoading }] = useLazyGetMerchantTransactionQuery();
  const [getMerchantEnrollment, { data: merchantEnrollmentData, isLoading: isMerchantEnrollmentLoading }] = useLazyGetMerchantEnrollmentQuery();
  const cardDetails = useMemo(() => getNormalizedCardDetails(cardPayload), [cardPayload]);
  const isSuccessfulStatus = (status?: number): boolean => ( typeof status === 'number' && status >= 200 && status < 300 );
  const resetPaymentMethodState = useCallback(() => { initializationKeyRef.current = null; setIsPaymentMethodReady(false); setCardVerificationUrl(null); }, []);

  const getLatestMerchantTransaction = useCallback(async () => {
    if (isEnrollment) {
      return getMerchantEnrollment({ merchantCode: merchantId, enrollmentId: transactionId, xsrfKey }).unwrap();
    }
    return getMerchantTransaction({ merchantCode: merchantId, transactionId, xsrfKey }).unwrap();
  }, [getMerchantEnrollment, getMerchantTransaction, isEnrollment, merchantId, transactionId, xsrfKey]);

  const handleCardVerificationSuccess = useCallback(async () => {
    if (hasHandledCardVerificationRef.current) {
      console.log(TAG, '3DS success ignored: already handled');
      return;
    }
    hasHandledCardVerificationRef.current = true;
    setCardVerificationUrl(null);
    console.log(TAG, '3DS success, refreshing the enrollment');

    try {
      await getMerchantEnrollment({ merchantCode: merchantId, enrollmentId: transactionId, xsrfKey }).unwrap();
      console.log(TAG, 'enrollment refreshed, card ready');
      setIsPaymentMethodReady(true);
    } catch (error: any) {
      console.log(TAG, 'refreshing the enrollment after 3DS failed:', describeError(error));
      resetPaymentMethodState();
      onError(getPaymentErrorMessage(error));
    }
  }, [getMerchantEnrollment, merchantId, onError, resetPaymentMethodState, transactionId, xsrfKey]);

  // Maya declined or cancelled the 3DS check, or the user closed the page before it finished
  const handleCardVerificationFailure = useCallback((message?: string) => {
    if (hasHandledCardVerificationRef.current) {
      console.log(TAG, '3DS failure ignored: already handled');
      return;
    }
    hasHandledCardVerificationRef.current = true;
    console.log(TAG, '3DS failure, showing the declined modal:', message ?? 'no message (page dismissed)');
    resetPaymentMethodState();
    onError(message || 'Card verification was not completed. Please try again or use a different card.');
  }, [onError, resetPaymentMethodState]);

  const handleCardVerificationDismissed = useCallback(() => {
    console.log(TAG, '3DS page dismissed by the user');
    handleCardVerificationFailure();
  }, [handleCardVerificationFailure]);

  const notifyValidationErrorOnce = useCallback((key: string, message: string) => {
    if (lastValidationErrorKeyRef.current === key) return;

    lastValidationErrorKeyRef.current = key;
    onError(message);
  }, [onError]);

  useEffect(() => {
    if (!cardPayload || !cardDetails) {
      resetPaymentMethodState();
      // notifyValidationErrorOnce('missing-card-details', 'Missing card details. Please select a payment method again.');
      return;
    }

    if (!merchantId || !transactionId) {
      resetPaymentMethodState();
      notifyValidationErrorOnce('missing-transaction-details', 'Missing transaction details. Please try again.');
      return;
    }

    if (cardDetails.binNumber.length < 6) {
      resetPaymentMethodState();
      notifyValidationErrorOnce('invalid-card-number', 'Invalid card number. Please re-enter your card details.');
      return;
    }

    lastValidationErrorKeyRef.current = null;

    const initializationKey = [
      merchantId,
      transactionId,
      cardDetails.binNumber,
      cardDetails.lastFourDigits,
      cardPayload.expiryDate,
    ].join(':');

    if (initializationKeyRef.current === initializationKey) {
      return;
    }

    let isActive = true;
    initializationKeyRef.current = initializationKey;
    setIsPaymentMethodReady(false);

    const initializePaymentMethod = async () => {
      try {
        const binLookup = isEnrollment ? getMerchantEnrollmentPaymentBin : getMerchantTransactionPaymentBin;
        const binData = await binLookup({
          merchantCode: merchantId,
          transactionId,
          xsrfKey,
          binNumber: cardDetails.binNumber,
        }).unwrap();

        const vaultBody = buildVaultPaymentBody({
          binData,
          cardPayload,
          cardDetails,
        });

        const vaultResponse = isEnrollment
          ? await createMerchantEnrollmentPaymentVault({
              merchantCode: merchantId,
              enrollmentId: transactionId,
              xsrfKey,
              body: vaultBody,
              idempotencyKey: getPaymentIntentKey('enrollment-vault', initializationKey),
            }).unwrap()
          : await createMerchantTransactionPaymentVault({
              merchantCode: merchantId,
              transactionId,
              xsrfKey,
              body: vaultBody,
              idempotencyKey: getPaymentIntentKey('transaction-vault', initializationKey),
            }).unwrap();

        console.log(TAG, `vault response: httpStatus=${vaultResponse.httpStatus} verificationRequired=${Boolean(vaultResponse.verificationRequired)}`);
        if (!isSuccessfulStatus(vaultResponse.httpStatus)) {
          if (isActive) {
            resetPaymentMethodState();
            onError(vaultResponse.message || 'Failed to vault payment method. Please re-enter your card details and try again.');
          }
          return;
        }

        // Maya asks for 3DS before it will vault the card: hold the card back until it is verified
        if (isEnrollment && vaultResponse.verificationRequired && vaultResponse.redirect) {
          if (isActive) {
            hasHandledCardVerificationRef.current = false;
            setCardVerificationUrl(vaultResponse.redirect);
          }
          return;
        }

        if (isEnrollment) {
          await getMerchantEnrollment({
            merchantCode: merchantId,
            enrollmentId: transactionId,
            xsrfKey,
          }).unwrap();
        } else {
          await getMerchantTransaction({
            merchantCode: merchantId,
            transactionId,
            xsrfKey,
          }).unwrap();
        }

        if (isActive) {
          setIsPaymentMethodReady(true);
        }
      } catch (error: any) {
        console.log(TAG, 'initialising the payment method failed:', describeError(error));
        if (isActive) {
          resetPaymentMethodState();
          onError(getPaymentErrorMessage(error));
        }
      }
    };

    void initializePaymentMethod();

    return () => {
      isActive = false;
    };
  }, [
    cardDetails,
    cardPayload,
    createMerchantEnrollmentPaymentVault,
    createMerchantTransactionPaymentVault,
    getMerchantEnrollment,
    getMerchantEnrollmentPaymentBin,
    getMerchantTransaction,
    getMerchantTransactionPaymentBin,
    isEnrollment,
    merchantId,
    notifyValidationErrorOnce,
    onError,
    resetPaymentMethodState,
    transactionId,
    xsrfKey,
  ]);

  return {
    cardDetails,
    merchantTransactionData: isEnrollment ? merchantEnrollmentData : merchantTransactionData,
    isPaymentMethodReady,
    cardVerificationUrl,
    handleCardVerificationSuccess,
    handleCardVerificationFailure,
    handleCardVerificationDismissed,
    isInitializingPaymentMethod: isBinLookupLoading || isEnrollmentBinLookupLoading || isVaultingPayment || isMerchantTransactionLoading || isMerchantEnrollmentLoading,
    isMerchantTransactionLoading: isMerchantTransactionLoading || isMerchantEnrollmentLoading,
    resetPaymentMethodState,
    getLatestMerchantTransaction,
  };
};
