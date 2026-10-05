import type { MerchantTransactionDetailResponse, MerchantTransactionPaymentCkoResponse } from '@/redux/features/merchants/merchantTypes';
import { RECEIPT_FALLBACK } from '@/constants/paymentReceipt';
import type { BillingDetailItem, TransactionDetail } from '@/redux/features/transactionDetail/transactionDetailTypes';
import type { TransactionComputationResponse } from '@/redux/features/transactions/transactionTypes';
import type { ReceiptAccessPayload } from '../types';
import { formatApiDate } from './date';
import { formatMoney } from './format';
import { isRecord } from './typeGuards';

export const getFirstString = (...values: any[]): string => {
  const match = values.find((value) => typeof value === 'string' && value.trim().length > 0);
  return typeof match === 'string' ? match.trim() : '';
};

const getStringByKeys = (source: Record<string, any>, keys: string[]): string => (
  getFirstString(...keys.map((key) => source[key]))
);

export const getReferenceIdFromUrl = (url?: string): string => {
  if (!url) return '';

  try {
    const parsedUrl = new URL(url);
    const referenceFromQuery = getFirstString(
      parsedUrl.searchParams.get('referenceId'),
      parsedUrl.searchParams.get('reference_id'),
      parsedUrl.searchParams.get('reference'),
      parsedUrl.searchParams.get('ref'),
    );

    if (referenceFromQuery) return referenceFromQuery;

    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    const receiptIndex = pathSegments.findIndex((segment) => segment.toLowerCase() === 'receipt');

    return receiptIndex >= 0 ? decodeURIComponent(pathSegments[receiptIndex + 1] ?? '') : '';
  } catch {
    const queryMatch = url.match(/[?&](?:referenceId|reference_id|reference|ref)=([^&#]+)/i);
    if (queryMatch?.[1]) return decodeURIComponent(queryMatch[1]);

    const pathMatch = url.match(/\/receipt\/([^/?#]+)(?:\/|$)/i);
    return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : '';
  }
};

export const getPaymentRedirectUrl = (paymentResponse: MerchantTransactionPaymentCkoResponse): string => (
  getFirstString(paymentResponse.redirectUrl, paymentResponse.redirect_url)
);

export const getReceiptReferenceId = (
  paymentResponse: MerchantTransactionPaymentCkoResponse,
  transaction?: MerchantTransactionDetailResponse | null,
  successUrl?: string,
): string => (
  getFirstString(
    paymentResponse.referenceId,
    paymentResponse.reference_id,
    transaction?.referenceId,
    transaction?.reference_id,
    getReferenceIdFromUrl(successUrl),
  )
);

export const extractReceiptAccessPayload = (
  rawKeys: any,
  fallbackReferenceId = '',
): ReceiptAccessPayload | null => {
  if (!isRecord(rawKeys)) return null;

  const nestedData = isRecord(rawKeys.data) ? rawKeys.data : {};
  const sources = [rawKeys, nestedData];

  const getValue = (keys: string[]) => getFirstString(
    ...sources.map((source) => getStringByKeys(source, keys)),
  );

  const referenceId = getFirstString(
    fallbackReferenceId,
    getValue(['referenceId', 'reference_id']),
  );
  const receiptAccessSignature = getValue([
    'accessSignature',
    'access_signature',
    'accesssignature',
  ]);
  const receiptAccessType = getValue([
    'accessType',
    'access_type',
    'accesstype',
  ]) || 'view';

  if (!referenceId || !receiptAccessSignature) {
    return null;
  }

  return {
    referenceId,
    receiptAccessSignature,
    receiptAccessType,
  };
};

export const parseComputationResponse = (value: string): TransactionComputationResponse | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as TransactionComputationResponse;
  } catch {
    return null;
  }
};

export const formatCurrencyAmount = (currency?: string, amount?: number | null): string => {
  if (!currency || typeof amount !== 'number' || !Number.isFinite(amount)) {
    return RECEIPT_FALLBACK;
  }

  return formatMoney([currency, amount]);
};

const formatDateValue = (value?: string | null): string => (
  value ? formatApiDate(value, "MMMM dd, yyyy - hh:mm:ss a") : RECEIPT_FALLBACK
);

const displayValue = (value: unknown): string => {
  if (value === null || value === undefined) return RECEIPT_FALLBACK;

  const stringValue = String(value).trim();
  return stringValue || RECEIPT_FALLBACK;
};

const appendReceiptField = (
  fields: Record<string, BillingDetailItem>,
  usedLabels: Set<string>,
  key: string,
  text: string,
  value: unknown,
) => {
  const normalizedLabel = text.trim().toLowerCase();

  if (usedLabels.has(normalizedLabel)) return;

  fields[key] = { text, value: displayValue(value) };
  usedLabels.add(normalizedLabel);
};

const getTotalFees = (transaction: TransactionDetail): number | null => {
  if (!Array.isArray(transaction.items)) return null;

  const hasFeeAmount = transaction.items.some((item) => typeof item.feeAmount === 'number');
  const total = transaction.items.reduce((sum, item) => (
    sum + (typeof item.feeAmount === 'number' ? item.feeAmount : 0)
  ), 0);

  return hasFeeAmount ? total : null;
};

export const buildReceiptDetails = (
  transaction: TransactionDetail,
): Record<string, BillingDetailItem> => {
  const fields: Record<string, BillingDetailItem> = {};
  const usedLabels = new Set<string>();
  const transactionReference = transaction.transactionReferenceId || transaction.externalTransactionId;
  const feeCurrency = transaction.items?.find((item) => typeof item.feeAmount === 'number' && item.feeAmount > 0)?.feeCurrency || transaction.totalCurrency;

  appendReceiptField(fields, usedLabels, 'transactionReference', 'Transaction Reference', transactionReference);
  appendReceiptField(fields, usedLabels, 'billerName', 'Biller Name', transaction.merchantName || transaction.billingName);
  appendReceiptField(fields, usedLabels, 'accountName', 'Account Name', transaction.name || transaction.billingName);
  appendReceiptField(fields, usedLabels, 'amount', 'Amount', formatCurrencyAmount(transaction.baseCurrency, transaction.baseAmount));
  appendReceiptField(fields, usedLabels, 'fees', 'Fees', formatCurrencyAmount(feeCurrency, getTotalFees(transaction)));
  appendReceiptField(fields, usedLabels, 'totalAmount', 'Total Amount', formatCurrencyAmount(transaction.totalCurrency, transaction.totalAmount));
  appendReceiptField(fields, usedLabels, 'paidDate', 'Paid Date', formatDateValue(transaction.transactionDate));
  appendReceiptField(fields, usedLabels, 'notes', 'Notes', transaction.notes);

  return fields;
};

export const buildCustomerDetails = (
  transaction: TransactionDetail,
  fallbackBillingDetails?: Record<string, BillingDetailItem>,
): Record<string, BillingDetailItem> => {
  const fields: Record<string, BillingDetailItem> = {};
  const usedLabels = new Set<string>();
  const billingDetails = transaction.billingDetails && Object.keys(transaction.billingDetails).length > 0
    ? transaction.billingDetails
    : fallbackBillingDetails;

  Object.entries(billingDetails || {}).forEach(([key, field]) => {
    appendReceiptField(fields, usedLabels, `billing-${key}`, field.text, field.value);
  });

  return fields;
};
