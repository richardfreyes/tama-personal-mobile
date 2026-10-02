import { COMMON } from '@/constants/common';
import { PaymentPreconditions } from '@/types';

export const validatePaymentPreconditions = ({ merchantId, transactionId, isPaymentMethodReady, hasAcceptedTerms }: PaymentPreconditions): string | null => {
  if (!merchantId || !transactionId) return COMMON.ERRORS.MISSING_DETAILS;
  if (!isPaymentMethodReady) return COMMON.ERRORS.METHOD_NOT_READY;
  if (!hasAcceptedTerms) return COMMON.ERRORS.TERMS_NOT_ACCEPTED;

  return null;
};
