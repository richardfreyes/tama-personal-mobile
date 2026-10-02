import { COMMON } from '@/constants/common';
import type { MerchantEnrollmentDetailResponse, MerchantTransactionPaymentBinResponse } from '@/redux/features/merchants/merchantTypes';
import { detectCardProvider } from '@/utils/card';
import { addMonths, format, parseISO } from 'date-fns';
import type { ConfirmPaymentDisplayTransaction, EnrollmentCardPayload, NormalizedCardDetails, PaymentInfoRow, ScheduledPaymentInfo } from '../types';

export const splitCardholderName = (fullName: string): Pick<NormalizedCardDetails, 'firstName' | 'lastName'> => {
  const [firstName = '', ...lastNameParts] = fullName.trim().split(/\s+/).filter(Boolean);
  const lastName = lastNameParts.join(' ');

  return {
    firstName,
    lastName: lastName || firstName,
  };
};

export const normalizeCardNumber = (cardNumber: string): string => cardNumber.replace(/\D/g, '');

export const getNormalizedCardDetails = ( cardPayload?: EnrollmentCardPayload | null ): NormalizedCardDetails | null => {
  if (!cardPayload) return null;

  const cardholderName = cardPayload.cardholderName.trim();
  const creditCardNumber = normalizeCardNumber(cardPayload.creditCardNumber);
  const { firstName, lastName } = splitCardholderName(cardholderName);
  const cardScheme = String(detectCardProvider(creditCardNumber) || 'unknown');

  return {
    cardholderName,
    firstName,
    lastName,
    creditCardNumber,
    cardScheme,
    binNumber: creditCardNumber.slice(0, 6),
    lastFourDigits: creditCardNumber.slice(-4),
  };
};

export const buildVaultPaymentBody = ({ binData, cardPayload, cardDetails }: { binData: MerchantTransactionPaymentBinResponse; cardPayload: EnrollmentCardPayload; cardDetails: NormalizedCardDetails; }) => ({
  paymentMethod: 'creditcard',
  cardType: binData.account?.funding || '',
  cardScheme: cardDetails.cardScheme === 'unknown' ? binData.scheme?.name || '' : cardDetails.cardScheme,
  cardCountryCode: binData.account?.country?.code || '',
  brand: binData.brand || '',
  issuingBank: binData.issuer?.name || '',
  productName: binData.product?.name,
  productSegment: binData.product?.segment,
  securityCode: cardPayload.cardSecurityCode,
  cardholderName: cardDetails.cardholderName,
  cardholderFirstName: cardDetails.firstName,
  cardholderLastName: cardDetails.lastName,
  cardholdersCountry: cardPayload.billingCountry,
  cardholdersCountryCode: cardPayload.billingCountryCode,
  zipCode: cardPayload.billingPostalCode,
  streetAddress: cardPayload.billingStreet,
  addressLevel1: cardPayload.billingState,
  addressLevel2: cardPayload.billingCity,
  creditCardNumber: cardDetails.creditCardNumber,
  expiryDate: cardPayload.expiryDate,
});

const getMoneyTuple = ( value: any, fallbackCurrency = COMMON.DEFAULT_CURRENCY, fallbackAmount = COMMON.DEFAULT_AMOUNT ): readonly [string, number] => {
  if (!Array.isArray(value)) {
    return [fallbackCurrency, fallbackAmount];
  }

  const [currency, amount] = value;

  return [
    typeof currency === 'string' && currency.trim() ? currency : fallbackCurrency,
    typeof amount === 'number' && Number.isFinite(amount) ? amount : fallbackAmount,
  ];
};

const formatAmount = ( currency: string, amount: number, options?: Intl.NumberFormatOptions ): string => `${currency} ${amount.toLocaleString(undefined, options)}`;

const getTransactionFieldValue = ( transaction: ConfirmPaymentDisplayTransaction, fieldName: string, fallback = 'N/A' ): string => {
  const fieldValue = transaction.transactionFields?.find((field) => field.name === fieldName)?.value;

  if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
    return fallback;
  }

  return String(fieldValue);
};

const formatExchangeRate = (transaction: ConfirmPaymentDisplayTransaction): string => {
  const [baseCurrency, targetCurrency, rate] = transaction.qwxRate ?? ['', '', ''];

  if (!baseCurrency || !targetCurrency || !rate) return 'N/A';

  return `${baseCurrency} 1 = ${rate} ${targetCurrency}`;
};

export const buildPaymentDetails = ( transaction: ConfirmPaymentDisplayTransaction ): PaymentInfoRow[] => {
  const [baseCurrency, baseAmount] = getMoneyTuple(transaction.billBase);
  const [convertedCurrency, convertedAmount] = getMoneyTuple(transaction.billConverted, baseCurrency, baseAmount);
  const [feeCurrency, feeAmount] = getMoneyTuple(transaction.billFee, baseCurrency, 0);
  const [totalCurrency, totalAmount] = getMoneyTuple(transaction.billTotal, baseCurrency, baseAmount + feeAmount);

  return [
    { label: 'Merchant Name', value: transaction.merchantName || 'N/A' },
    { label: 'Project Name', value: transaction.projectName || 'N/A' },
    { label: 'Lot Code', value: getTransactionFieldValue(transaction, 'lotCode') },
    { label: 'Payment Mode', value: getTransactionFieldValue(transaction, 'paymentMode') },
    { label: 'Name', value: transaction.customerName || 'N/A' },
    { label: 'Email', value: transaction.customerEmail || 'N/A' },
    { label: 'Mobile', value: transaction.customerMobileNo || 'N/A' },
    {
      label: 'Amount Due',
      value: formatAmount(baseCurrency, baseAmount, { maximumFractionDigits: 2 }),
    },
    {
      label: `Amount in ${convertedCurrency}`,
      value: formatAmount(convertedCurrency, convertedAmount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    // {
    //   label: 'Convenience Fee',
    //   value: formatAmount(feeCurrency, feeAmount, {
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2,
    //   }),
    // },
    {
      label: 'Total Amount',
      value: formatAmount(totalCurrency, totalAmount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      weight: '700',
    },
    {
      label: 'Tama Exchange Rate',
      value: formatExchangeRate(transaction),
    },
  ];
};

const isRenderable = (value: any): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed !== '' && trimmed.toUpperCase() !== 'N/A';
  }
  return true;
};

export const buildEnrollmentPaymentDetails = (
  transaction: MerchantEnrollmentDetailResponse | undefined,
): PaymentInfoRow[] => {
  if (!transaction) return [];

  const currency = transaction.bill?.currency ?? transaction.baseCurrency ?? COMMON.DEFAULT_CURRENCY;
  const monthlyAmount = transaction.bill?.amount ?? transaction.baseAmount ?? COMMON.DEFAULT_AMOUNT;

  const fields = transaction.fields ?? [];
  const findFieldValue = (name: string) => fields.find((f) => f.name === name)?.value;

  const monthSpan = Number(findFieldValue('monthSpan') ?? transaction.enrollmentMonths ?? 0);
  const lastAmount = Number(findFieldValue('lastAmount') ?? transaction.enrollmentLastPaymentAmount ?? 0);
  const totalAmount = monthlyAmount * monthSpan + lastAmount;

  const unitNumber = transaction.unitNumber || findFieldValue('unitNumber');

  const fmtOpts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

  const rows: PaymentInfoRow[] = [
    { label: 'Merchant Name', value: transaction.merchantName || 'N/A' },
    { label: 'Project Name', value: transaction.projectName || 'N/A' },
    { label: 'Lot Code', value: unitNumber != null ? String(unitNumber) : 'N/A' },
    { label: 'Payment Mode', value: 'N/A' },
    { label: 'Name', value: transaction.customerName || 'N/A' },
    { label: 'Email', value: transaction.customerEmail || 'N/A' },
    { label: 'Mobile', value: transaction.customerMobileNo || 'N/A' },
    {
      label: 'Amount Due',
      value: formatAmount(currency, monthlyAmount, fmtOpts),
    },
    {
      label: `Amount in ${currency}`,
      value: formatAmount(currency, totalAmount, fmtOpts),
    },
    {
      label: 'Total Amount',
      value: formatAmount(currency, totalAmount, fmtOpts),
      weight: '700',
    },
    {
      label: 'Tama Exchange Rate',
      value: 'N/A',
    },
  ];

  return rows.filter((row) => isRenderable(row.value));
};

export const buildPaymentMethodDetails = ({ transactionId, cardPayload, cardDetails }: {
  transactionId: string;
  cardPayload?: EnrollmentCardPayload | null;
  cardDetails?: NormalizedCardDetails | null;
}): PaymentInfoRow[] => {
  const paymentMethod = cardDetails?.cardScheme && cardDetails.cardScheme !== 'unknown' ? cardDetails.cardScheme : 'Card';

  return [
    { label: 'Transaction ID', value: transactionId || 'N/A', weight: '700' },
    { label: 'Card Holder Name', value: cardPayload?.cardholderName || 'N/A' },
    { label: 'Payment Method', value: paymentMethod },
    { label: 'Card Number',  value: cardDetails?.lastFourDigits ? `**** **** **** ${cardDetails.lastFourDigits}` : 'N/A' },
    { label: 'Expiry Date', value: cardPayload?.expiryDate || 'N/A' },
    { label: 'Country', value: cardPayload?.billingCountry || 'N/A' },
    { label: 'Zip Code', value: cardPayload?.billingPostalCode || 'N/A' },
  ];
};

export const buildScheduledPaymentInfo = (data: {
  currency?: string;
  monthlyAmount?: number;
  months?: number;
  startDate?: string | null;
}): ScheduledPaymentInfo | null => {
  const { currency = COMMON.DEFAULT_CURRENCY, monthlyAmount = 0, months = 0, startDate } = data;

  if (!months || !monthlyAmount || !startDate) return null;

  const startParsed = parseISO(startDate);
  const endParsed = addMonths(startParsed, months - 1);
  const totalAmount = monthlyAmount * months;

  const fmtOpts: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  const fmtCurrency = (amount: number) => `${currency} ${amount.toLocaleString(undefined, fmtOpts)}`;

  const formattedStart = format(startParsed, 'MMMM dd, yyyy');
  const formattedEnd = format(endParsed, 'MMMM dd, yyyy');

  const rows: PaymentInfoRow[] = [
    { label: 'Monthly Payment', value: fmtCurrency(monthlyAmount) },
    { label: 'Number of Months', value: `${months} month${months !== 1 ? 's' : ''}` },
    { label: 'Duration', value: `${formattedStart} to ${formattedEnd}` },
    { label: 'Total Enrollment Amount', value: fmtCurrency(totalAmount), weight: '700' },
  ];

  const noteText = `You will be paying ${fmtCurrency(monthlyAmount)} monthly from ${formattedStart} to ${formattedEnd}, amounting to ${fmtCurrency(totalAmount)}. Take note – amount is not inclusive of the Convenience Fee.`;

  return { rows, noteText };
};
