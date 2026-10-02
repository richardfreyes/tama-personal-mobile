import { COMMON } from '@/constants/common';
import { useCreateMerchantTransactionPaymentCkoMutation, useLazyGetMerchantReceiptKeysQuery } from '@/redux/features/merchants/merchantApi';
import type { MerchantTransactionDetailResponse } from '@/redux/features/merchants/merchantTypes';
import { useCallback, useRef, useState } from 'react';
import type { PendingPaymentRedirect, SubmitPaymentParams, UseCompleteEnrollmentPaymentParams } from '../types';
import { getPaymentErrorMessage } from '../utils/paymentErrors';
import { extractReceiptAccessPayload, getPaymentRedirectUrl, getReceiptReferenceId } from '../utils/paymentReceipt';
import { validatePaymentPreconditions } from '../utils/paymentValidation';
import { getPaymentIntentKey } from '@/utils/paymentIntentKey';

export const useCompleteEnrollmentPayment = ({ merchantId, transactionId, xsrfKey, getLatestMerchantTransaction, onError, onNotice, onSuccess }: UseCompleteEnrollmentPaymentParams) => {
  const isSuccessfulCreatedResponse = (status?: number): boolean => status === 201;
  const [createMerchantTransactionPaymentCko, { isLoading: isSubmittingPayment }] = useCreateMerchantTransactionPaymentCkoMutation();
  const [getMerchantReceiptKeys] = useLazyGetMerchantReceiptKeysQuery();
  const [pendingPaymentRedirect, setPendingPaymentRedirect] = useState<PendingPaymentRedirect | null>(null);
  const pendingReceiptRef = useRef<{ fallbackReferenceId?: string; successMessage?: string; } | null>(null);

  const completeReceiptFlow = useCallback(async ({ fallbackReferenceId, successMessage }: { fallbackReferenceId?: string; successMessage?: string; }) => {
    if (!merchantId || !transactionId) {
      onError(COMMON.ERRORS.MISSING_DETAILS);
      return;
    }

    try {
      const keys = await getMerchantReceiptKeys({ merchantCode: merchantId, transactionId }).unwrap();
      const receiptAccessPayload = extractReceiptAccessPayload(keys, fallbackReferenceId);

      if (!receiptAccessPayload?.referenceId) {
        onError('Payment completed, but the receipt reference was not returned.');
        return;
      }

      if (!receiptAccessPayload.receiptAccessSignature) {
        onError('Payment completed, but receipt authorization was not returned.');
        return;
      }

      onSuccess({ message: successMessage || COMMON.SUCCESS.PAYMENT_SUCCESS, ...receiptAccessPayload, });
    } catch (error: any) {
      onError(getPaymentErrorMessage(error, 'Unable to load receipt authorization. Please try again.'));
    }
  }, [getMerchantReceiptKeys, merchantId, onError, onSuccess, transactionId]);

  const handlePaymentRedirectComplete = useCallback(() => {
    const receiptContext = pendingReceiptRef.current;

    setPendingPaymentRedirect(null);
    pendingReceiptRef.current = null;

    if (!receiptContext) {
      onError(COMMON.ERRORS.MISSING_DETAILS);
      return;
    }

    void completeReceiptFlow(receiptContext);
  }, [completeReceiptFlow, onError]);

  const submitPayment = useCallback(async ({ hasAcceptedTerms, isPaymentMethodReady }: SubmitPaymentParams) => {
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
      const paymentResponse = await createMerchantTransactionPaymentCko({
        merchantCode: merchantId,
        transactionId,
        xsrfKey,
        idempotencyKey: getPaymentIntentKey('merchant-payment', `${merchantId}:${transactionId}`),
        body: {
          paymentMethod: 'creditcard',
        },
      }).unwrap();

      const redirectUrl = getPaymentRedirectUrl(paymentResponse);
      const successMessage = COMMON.SUCCESS.PAYMENT_SUCCESS;

      if (isSuccessfulCreatedResponse(paymentResponse.httpStatus) && redirectUrl) {
        onNotice(COMMON.SUCCESS.PAYMENT_PENDING, 'success');

        const referenceId = getReceiptReferenceId(paymentResponse, undefined, redirectUrl);
        pendingReceiptRef.current = { fallbackReferenceId: referenceId, successMessage };
        setPendingPaymentRedirect({ url: redirectUrl });
        return;
      }

      if (isSuccessfulCreatedResponse(paymentResponse.httpStatus)) {
        const transaction = await getLatestMerchantTransaction();
        const referenceId = getReceiptReferenceId( paymentResponse, transaction as MerchantTransactionDetailResponse | null );

        if (!referenceId) {
          onError('Payment completed, but the receipt reference was not returned.');
          return;
        }

        await completeReceiptFlow({
          fallbackReferenceId: referenceId,
          successMessage,
        });
        return;
      }

      onError(paymentResponse.message || COMMON.ERRORS.UNEXPECTED_RESPONSE);
    } catch (error: any) {
      onError(getPaymentErrorMessage(error));
    }
  }, [
    completeReceiptFlow,
    createMerchantTransactionPaymentCko,
    getLatestMerchantTransaction,
    merchantId,
    onError,
    onNotice,
    transactionId,
    xsrfKey,
  ]);

  return { isSubmittingPayment, submitPayment, pendingPaymentRedirect, handlePaymentRedirectComplete };
};
