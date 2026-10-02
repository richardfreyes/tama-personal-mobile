import { ENROLLMENT_PAYLOAD_FIELD_EXCLUDED_KEYS } from '@/constants/enrollment';
import { MerchantFormField, MerchantTransactionPayload } from '@/redux/features/merchants/merchantTypes';
import { EnrollmentPayloadBuilderParams, EnrollmentPayloads, EnrollmentReviewField } from '@/types/common';
import { formatMonetaryDisplayValue, normalizeMerchantFieldValue } from '@/utils/format';
import { buildDynamicPayloadFields, buildMerchantEnrollmentPayload, buildMerchantTransactionPayload } from '@/utils/merchantTransactionPayload';

export const buildEnrollmentFormPayloads = ({
  activeFormConfig,
  email,
  firstName,
  formData,
  inputFields,
  isEnrollmentSelected,
  lastName,
  merchantId,
}: EnrollmentPayloadBuilderParams): EnrollmentPayloads => {
  const dynamicPayloadFields = buildDynamicPayloadFields({
    formData,
    inputFields,
    payloadFieldExcludedKeys: ENROLLMENT_PAYLOAD_FIELD_EXCLUDED_KEYS,
  });
  const customerName = normalizeMerchantFieldValue(
    formData.customerName || `${formData.firstName || firstName} ${formData.lastName || lastName}`.trim()
  );
  const customerEmail = normalizeMerchantFieldValue(formData.customerEmail || formData.email || email);
  const customerMobile = normalizeMerchantFieldValue(formData.customerMobileNo);
  const customerCountryPrefix = formData.customerMobileNo_callingCode || formData.countryPrefix || '63';
  const customerCountryIso2 = formData.customerMobileNo_countryCode || formData.countryIso2 || 'ph';
  const currency = normalizeMerchantFieldValue(activeFormConfig?.currencies?.[0]?.currency || 'PHP');

  const payload = buildMerchantTransactionPayload({
    merchantId,
    paymentType: formData.paymentType,
    project: {
      name: formData.projectName,
      projectId: formData.projectId,
      category: formData.projectCategory,
    },
    clientNotes: formData.clientNotes,
    customer: {
      name: customerName,
      email: customerEmail,
      mobile: customerMobile,
      countryPrefix: customerCountryPrefix,
      countryIso2: customerCountryIso2,
    },
    bill: {
      amount: formData.amount,
      currency,
    },
    transactionType: isEnrollmentSelected ? 'enrollment' : 'payment',
    fields: dynamicPayloadFields,
  });

  const enrollmentPayload = buildMerchantEnrollmentPayload({
    customer: {
      name: customerName,
      email: customerEmail,
      mobile: customerMobile,
      countryPrefix: customerCountryPrefix,
      countryIso2: customerCountryIso2,
    },
    bill: {
      amount: formData.amount,
      currency,
    },
    project: {
      merchantProjectId: formData.merchantProjectId,
      name: formData.projectName,
      projectId: formData.projectId,
      category: formData.projectCategory,
    },
    clientNotes: formData.clientNotes,
    fields: dynamicPayloadFields.filter((f) => {
      const config = inputFields.find((field) => field.key === f.name);
      return config?.fieldType !== 'checkbox';
    }),
  });

  return {
    currency,
    enrollmentPayload,
    payload,
  };
};

export const buildEnrollmentDirectPayReviewFields = (payload: MerchantTransactionPayload): EnrollmentReviewField[] => [
  { text: 'Merchant ID', value: payload.merchantId },
  { text: 'Payment Type', value: payload.paymentType },
  { text: 'Project Name', value: payload.project?.name || '' },
  { text: 'Project ID', value: payload.project?.projectId || '' },
  { text: 'Amount', value: formatMonetaryDisplayValue(`${payload.bill.base.currency} ${payload.bill.base.amount || ''}`.trim(), 'Amount') },
  { text: 'Customer Name', value: payload.customer.name },
  { text: 'Customer Email', value: payload.customer.email },
  { text: 'Customer Mobile', value: payload.customer.mobile },
  { text: 'Transaction Type', value: payload.transactionType },
  { text: 'Client Notes', value: payload.clientNotes || '' },
  ...payload.fields.filter((f) => f.value != null && String(f.value).trim() !== ''),
];

export const buildEnrollmentReviewFields = ({
  currency,
  formData,
  merchantId,
  visibleInputFields,
}: {
  currency: string;
  formData: Record<string, any>;
  merchantId: string;
  visibleInputFields: MerchantFormField[];
}): EnrollmentReviewField[] => [
  { text: 'Merchant ID', value: merchantId },
  ...visibleInputFields
    .filter((field) =>
      field.key &&
      field.fieldType !== 'checkbox' &&
      formData[field.key] != null &&
      String(formData[field.key]).trim() !== ''
    )
    .map((field) => ({
      text: field.label,
      value: field.fieldType === 'currency'
        ? formatMonetaryDisplayValue(`${currency} ${formData[field.key] || ''}`.trim(), field.label)
        : String(formData[field.key] ?? ''),
    })),
];
