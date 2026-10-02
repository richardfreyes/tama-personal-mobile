import { MerchantEnrollmentPayload, MerchantEnrollmentProjectPayload, MerchantTransactionFieldPayload, MerchantTransactionPayload, MerchantTransactionProjectPayload } from '@/redux/features/merchants/merchantTypes';
import { ENROLLMENT_SOURCE } from '@/constants/enrollment';
import { formatAmountEnrollments, formatCustomerMobile, normalizeCurrencyInput, normalizeMerchantFieldValue } from '@/utils/format';
import { BuildDynamicPayloadFieldsParams, BuildMerchantEnrollmentPayloadParams, BuildMerchantTransactionPayloadParams, EnrollmentProjectCandidate, ProjectCandidate } from '@/types';

export const normalizeProjectForPayload = (project: ProjectCandidate): MerchantTransactionProjectPayload | null => {
  if (!project) {
    return null;
  }

  const normalizedProject: MerchantTransactionProjectPayload = {
    name: normalizeMerchantFieldValue(project.name).trim(),
    projectId: normalizeMerchantFieldValue(project.projectId).trim(),
    category: normalizeMerchantFieldValue(project.category).trim(),
  };

  const hasValidProject =
    normalizedProject.name.length > 0 &&
    normalizedProject.projectId.length > 0 &&
    normalizedProject.category.length > 0;

  return hasValidProject ? normalizedProject : null;
};

export const buildDynamicPayloadFields = ({
  formData,
  inputFields,
  payloadFieldExcludedKeys,
}: BuildDynamicPayloadFieldsParams): MerchantTransactionFieldPayload[] => (
  inputFields
    .filter((field) => field.key && !payloadFieldExcludedKeys.has(field.key))
    .map((field) => {
      const normalizedValue = (
        field.fieldType === 'currency'
          ? normalizeCurrencyInput(formData[field.key])
          : normalizeMerchantFieldValue(formData[field.key])
      ).trim();
      const fieldValue = normalizedValue.length > 0 ? normalizedValue : null;
      const fieldPayload: MerchantTransactionFieldPayload = {
        name: field.key,
        text: field.label || field.key,
        value: fieldValue,
      };

      if (field.fieldType === 'tel') {
        const countryPrefix = normalizeMerchantFieldValue(formData[`${field.key}_callingCode`]).replace(/^\+/, '').trim();
        const countryIso2 = normalizeMerchantFieldValue(formData[`${field.key}_countryCode`]).toLowerCase().trim();

        if (countryPrefix.length > 0) {
          fieldPayload.countryPrefix = countryPrefix;

          if (fieldPayload.value && !String(fieldPayload.value).startsWith('+')) {
            fieldPayload.value = `+${countryPrefix}${fieldPayload.value}`;
          }
        }

        if (countryIso2.length > 0) {
          fieldPayload.countryIso2 = countryIso2;
        }
      }

      return fieldPayload;
    })
);

const normalizeEnrollmentProject = (project: EnrollmentProjectCandidate): MerchantEnrollmentProjectPayload | null => {
  if (!project) {
    return null;
  }

  const name = normalizeMerchantFieldValue(project.name).trim();
  const projectId = normalizeMerchantFieldValue(project.projectId).trim();

  if (!name || !projectId) {
    return null;
  }

  return {
    merchantProjectId: project.merchantProjectId || 0,
    name,
    projectId,
    category: normalizeMerchantFieldValue(project.category).trim(),
  };
};

export const buildMerchantEnrollmentPayload = ({
  customer,
  bill,
  project,
  clientNotes,
  fields,
  source = ENROLLMENT_SOURCE,
}: BuildMerchantEnrollmentPayloadParams): MerchantEnrollmentPayload => {
  const prefix = normalizeMerchantFieldValue(customer.countryPrefix).replace(/^\+/, '');
  const mobile = normalizeMerchantFieldValue(customer.mobile);

  return {
    bill: {
      amount: formatAmountEnrollments(bill.amount),
      currency: normalizeMerchantFieldValue(bill.currency) || 'PHP',
    },
    customer: {
      name: normalizeMerchantFieldValue(customer.name),
      email: normalizeMerchantFieldValue(customer.email),
      mobile: mobile ? formatCustomerMobile(mobile, prefix) : null,
      countryPrefix: prefix || null,
      countryIso2: normalizeMerchantFieldValue(customer.countryIso2).toLowerCase() || null,
    },
    project: normalizeEnrollmentProject(project),
    clientNotes: normalizeMerchantFieldValue(clientNotes) || null,
    source,
    fields,
  };
};

export const buildMerchantTransactionPayload = ({
  merchantId,
  paymentType,
  project,
  clientNotes,
  customer,
  bill,
  transactionType,
  fields,
  source = ENROLLMENT_SOURCE,
}: BuildMerchantTransactionPayloadParams): MerchantTransactionPayload => {
  const normalizedClientNotes = normalizeMerchantFieldValue(clientNotes) || null;

  return {
    merchantId,
    paymentType: normalizeMerchantFieldValue(paymentType),
    project: normalizeProjectForPayload(project),
    clientNotes: normalizedClientNotes,
    customer: (() => {
      const prefix = normalizeMerchantFieldValue(customer.countryPrefix).replace(/^\+/, '') || '63';
      const mobile = normalizeMerchantFieldValue(customer.mobile);

      return {
        name: normalizeMerchantFieldValue(customer.name),
        email: normalizeMerchantFieldValue(customer.email),
        mobile: formatCustomerMobile(mobile, prefix),
        countryPrefix: prefix,
        countryIso2: normalizeMerchantFieldValue(customer.countryIso2).toLowerCase() || 'ph',
      };
    })(),
    bill: {
      base: {
        amount: formatAmountEnrollments(bill.amount),
        currency: normalizeMerchantFieldValue(bill.currency) || 'PHP',
      },
    },
    transactionType,
    source,
    adminNotes: normalizedClientNotes,
    fields,
  };
};
