import { ErrorData } from '@/types';
import { isRecord } from './typeGuards';

const getErrorData = (error: any): ErrorData => {
  if (!isRecord(error) || !isRecord(error.data)) {
    return {};
  }

  return error.data as ErrorData;
};

export const isPaymentMethodMismatchError = (error: any): boolean => {
  const errorData = getErrorData(error);
  const errorCode = String(errorData.code ?? errorData.errorCode ?? '').toUpperCase();
  const errorMessage = String(errorData.message ?? errorData.error ?? '').toUpperCase();

  return (
    errorCode === '30021' ||
    errorCode === 'PAYMENT_METHOD_MISMATCH' ||
    errorMessage.includes('PAYMENT_METHOD_MISMATCH')
  );
};

export const isPaymentPending = (error: any): boolean => (
  (error?.status === 409 || error?.originalStatus === 409)
  && (!error?.data?.code || error.data.code === 'PAYMENT_PENDING')
);

export const getPaymentErrorMessage = (
  error: any,
  fallbackMessage = 'Failed to submit payment. Please try again.',
): string => {
  if (isPaymentMethodMismatchError(error)) {
    return 'This transaction was prepared with a different payment processor. Please re-enter your card details and try again.';
  }

  const errorData = getErrorData(error);
  return errorData.message || errorData.error || fallbackMessage;
};
