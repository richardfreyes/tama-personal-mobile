import { COMMON } from '@/constants/common';
import { useCreateMerchantEnrollmentEnrollMutation } from '@/redux/features/merchants/merchantApi';
import type { MerchantEnrollmentDetailResponse } from '@/redux/features/merchants/merchantTypes';
import { useCallback, useRef, useState } from 'react';
import type { EnrollmentCallbackResult, PendingEnrollmentVerification, PendingReceiptContext, SubmitPaymentParams, UseCompleteEnrollmentParams } from '../types';
import { getPaymentErrorMessage } from '../utils/paymentErrors';
import { getFirstString, getReferenceIdFromUrl } from '../utils/paymentReceipt';
import { validatePaymentPreconditions } from '../utils/paymentValidation';
import { getPaymentIntentKey } from '@/utils/paymentIntentKey';

export const useCompleteEnrollment = ({ merchantId, transactionId, xsrfKey, getLatestMerchantTransaction, onError, onNotice, onSuccess }: UseCompleteEnrollmentParams) => {
  const isSuccessfulCreatedResponse = (status?: number): boolean => status === 201;
  const [createMerchantEnrollmentEnroll, { isLoading: isSubmittingEnrollment }] = useCreateMerchantEnrollmentEnrollMutation();
  const [pendingVerification, setPendingVerification] = useState<PendingEnrollmentVerification | null>(null);
  const pendingReceiptRef = useRef<PendingReceiptContext | null>(null);

  const completeEnrollmentSuccess = useCallback(({ referenceId, accessSignature, accessType, successMessage }: PendingReceiptContext) => {
    if (!referenceId) {
      onError('Enrollment completed, but the receipt reference was not returned.');
      return;
    }

    if (!accessSignature) {
      onError('Enrollment completed, but receipt authorization was not returned.');
      return;
    }

    onSuccess({
      message: successMessage || COMMON.SUCCESS.PAYMENT_SUCCESS,
      referenceId,
      receiptAccessSignature: accessSignature,
      receiptAccessType: accessType || 'view',
    });
  }, [onError, onSuccess]);

  const handleVerificationComplete = useCallback(async (result: EnrollmentCallbackResult) => {
    const receiptContext = pendingReceiptRef.current;

    setPendingVerification(null);
    pendingReceiptRef.current = null;

    if (result.outcome !== 'success') {
      return;
    }

    if (!receiptContext) {
      onError(COMMON.ERRORS.MISSING_DETAILS);
      return;
    }

    try {
      const enrollment = await getLatestMerchantTransaction() as MerchantEnrollmentDetailResponse | null;
      const status = enrollment?.status?.toUpperCase().replace(/\s+/g, '_');
      if (!enrollment?.referenceId || !['ONGOING', 'FOR_REVIEW'].includes(status || '')) {
        onError('Enrollment is still being confirmed. Check Auto Debit status before trying again.');
        return;
      }
      completeEnrollmentSuccess({ ...receiptContext, referenceId: enrollment.referenceId });
    } catch (error: any) {
      onError(getPaymentErrorMessage(error, 'Unable to confirm enrollment status. Check Auto Debit before trying again.'));
    }
  }, [completeEnrollmentSuccess, getLatestMerchantTransaction, onError]);

  const submitEnrollment = useCallback(async ({ hasAcceptedTerms, isPaymentMethodReady }: SubmitPaymentParams) => {
    const validationError = validatePaymentPreconditions({
      merchantId,
      transactionId,
      isPaymentMethodReady,
      hasAcceptedTerms,
    });

    if (validationError) {
      onError(validationError);
      return;
    }

    try {
      const enrollResponse = await createMerchantEnrollmentEnroll({
        merchantCode: merchantId,
        enrollmentId: transactionId,
        xsrfKey,
        idempotencyKey: getPaymentIntentKey('enrollment-enroll', `${merchantId}:${transactionId}`),
      }).unwrap();

      const verificationUrl = getFirstString(enrollResponse.verificationUrl, enrollResponse.verification_url, enrollResponse.redirectUrl, enrollResponse.redirect_url);
      const successMessage = enrollResponse.message || COMMON.SUCCESS.PAYMENT_SUCCESS;
      const accessSignature = enrollResponse.accessSignature || '';
      const accessType = enrollResponse.accessType || 'view';
      const referenceId = getFirstString(
        enrollResponse.referenceId,
        enrollResponse.reference_id,
        getReferenceIdFromUrl(verificationUrl),
      );

      if (isSuccessfulCreatedResponse(enrollResponse.httpStatus) && verificationUrl) {
        onNotice(enrollResponse.message || COMMON.SUCCESS.PAYMENT_PENDING, 'success');

        pendingReceiptRef.current = { referenceId, successMessage, accessSignature, accessType };
        setPendingVerification({ url: verificationUrl, accessSignature, accessType });
        return;
      }

      if (isSuccessfulCreatedResponse(enrollResponse.httpStatus)) {
        const enrollment = await getLatestMerchantTransaction() as MerchantEnrollmentDetailResponse | null;
        const status = enrollment?.status?.toUpperCase().replace(/\s+/g, '_');
        if (!['ONGOING', 'FOR_REVIEW'].includes(status || '')) {
          onError('Enrollment is still being confirmed. Check Auto Debit status before trying again.');
          return;
        }

        completeEnrollmentSuccess({
          referenceId: enrollment?.referenceId || referenceId,
          successMessage,
          accessSignature,
          accessType,
        });
        return;
      }

      onError(enrollResponse.message || COMMON.ERRORS.UNEXPECTED_RESPONSE);
    } catch (error: any) {
      onError(getPaymentErrorMessage(error));
    }
  }, [
    completeEnrollmentSuccess,
    createMerchantEnrollmentEnroll,
    getLatestMerchantTransaction,
    merchantId,
    onError,
    onNotice,
    transactionId,
    xsrfKey,
  ]);

  return {
    isSubmittingEnrollment,
    submitEnrollment,
    pendingVerification,
    handleVerificationComplete,
  };
};
