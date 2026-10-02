import { ResolveBillerEnrollmentMetadataArgs } from "@/types";

export const resolveBillerEnrollmentMetadata = ({
  merchantCode,
  merchantId,
  paymentType,
  projectId,
}: ResolveBillerEnrollmentMetadataArgs) => {
  const selectedProjectId = Number(projectId);
  const normalizedMerchantCode = merchantCode.trim().toUpperCase();
  const selectedPaymentType = String(paymentType ?? '').trim();
  const paymentTypePrefix = `${normalizedMerchantCode}_`;

  return {
    projectId: Number.isFinite(selectedProjectId) && selectedProjectId > 0 ? selectedProjectId : merchantId,
    paymentTypeCode: selectedPaymentType ? `${paymentTypePrefix}${selectedPaymentType}` : `${paymentTypePrefix}One Time Payment`,
  };
};
