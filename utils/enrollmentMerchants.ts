import type { EnrollmentMerchantLike } from '@/types/enrollment';

export const hasAutoDebitEligibilityMetadata = (merchant: EnrollmentMerchantLike): boolean => {
  const directFlag =
    merchant.isAutoDebitEnabled ??
    merchant.autoDebitEnabled ??
    merchant.is_auto_debit_enabled ??
    merchant.auto_debit_enabled;

  if (typeof directFlag === 'boolean') {
    return true;
  }

  const paymentConfigs = [
    merchant.payments,
    merchant.paymentMethods,
    merchant.paymentOptions,
  ].find(Array.isArray);

  return !!paymentConfigs?.some((paymentConfig: Record<string, any>) => (
    typeof paymentConfig.isAutoDebitEnabled === 'boolean'
  ));
};

export const isAutoDebitEnabledMerchant = (merchant: EnrollmentMerchantLike): boolean => {
  const directFlag =
    merchant.isAutoDebitEnabled ??
    merchant.autoDebitEnabled ??
    merchant.is_auto_debit_enabled ??
    merchant.auto_debit_enabled;

  if (directFlag === true) {
    return true;
  }

  const paymentConfigs = [
    merchant.payments,
    merchant.paymentMethods,
    merchant.paymentOptions,
  ].find(Array.isArray);

  return paymentConfigs?.some((paymentConfig: Record<string, any>) => (
    paymentConfig.isEnabled !== false && paymentConfig.isAutoDebitEnabled === true
  )) ?? false;
};

export const getAutoDebitEnabledMerchants = <T extends EnrollmentMerchantLike>(merchants?: T[]): T[] => (
  merchants?.filter(isAutoDebitEnabledMerchant) ?? []
);

export const getUniqueMerchants = <T extends EnrollmentMerchantLike>(merchants: T[]): T[] => {
  const seenMerchantKeys = new Set<string>();

  return merchants.filter((merchant) => {
    const merchantId = merchant.id ?? merchant.merchant_id;
    const merchantCode = merchant.pid ?? merchant.merchant_code;
    const merchantName = merchant.name ?? merchant.merchant_name;
    const merchantKey =
      merchantId !== undefined && merchantId !== null
        ? `id:${String(merchantId)}`
        : merchantCode !== undefined && merchantCode !== null
          ? `code:${String(merchantCode)}`
          : typeof merchantName === 'string' && merchantName.trim()
            ? `name:${merchantName.trim().toLowerCase()}`
            : null;

    if (!merchantKey) {
      return true;
    }

    if (seenMerchantKeys.has(merchantKey)) {
      return false;
    }

    seenMerchantKeys.add(merchantKey);
    return true;
  });
};

export const getDisplayableAutoDebitMerchants = <T extends EnrollmentMerchantLike>(merchants?: T[]): T[] => {
  if (!merchants) {
    return [];
  }

  const hasEligibilityMetadata = merchants.some(hasAutoDebitEligibilityMetadata);
  const displayableMerchants = hasEligibilityMetadata
    ? getAutoDebitEnabledMerchants(merchants)
    : merchants;

  return getUniqueMerchants(displayableMerchants);
};
