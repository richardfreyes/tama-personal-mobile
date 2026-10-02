import { AddCardRequest } from '@/redux/features/paymentMethods/paymentMethodTypes';
import { AddCardFormInputs, PaymentMethodFormData, PaymentOption } from '@/types';
import { detectCardProvider } from '@/utils/card';
import { formatExpiryDate } from '@/utils/format';
import { getCvcLength, validateCardNumber, validateCVC, validateExpiryDate, validateField } from '@/utils/validators';
import { Country } from 'country-state-city';

export const PAYMENT_METHOD_PRIORITY_COUNTRIES = ["PH", "US"];

const fieldsToValidate: (keyof AddCardFormInputs)[] = [
  'fullName',
  'cardNumber',
  'expiryDate',
  'securityCode',
  'streetAddress',
  'country',
  'stateRegion',
  'city',
  'postalCode',
];

export const getPaymentOptionByTitle = (
  title: string,
  paymentOptions: readonly PaymentOption[]
) => (
  paymentOptions.find(option => option.title === title)
);

export const getNormalizedCardNumber = (cardNumber: string) => (
  cardNumber.replace(/\s/g, '')
);

export const formatPaymentMethodFieldValue = (
  field: keyof AddCardFormInputs,
  value: string,
  currentProvider: string
) => {
  let newValue = value;
  let provider = currentProvider;

  if (field === 'expiryDate') {
    newValue = formatExpiryDate(value);
    if (newValue.length > 5) {
      newValue = newValue.substring(0, 5);
    }
  } else if (field === 'cardNumber') {
    newValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    if (newValue.length > 19) {
      newValue = newValue.substring(0, 19);
    }
    provider = detectCardProvider(newValue);
  }

  return {
    cardProvider: provider,
    value: newValue,
  };
};

export const getSavedBillingAddressFormValues = (user: any) => ({
  streetAddress: user?.customerAddress || user?.customerAddress || '',
  city: user?.customerAddressCity || user?.customerAddressCity || '',
  stateRegion: user?.customerAddressState || user?.customerAddressState || '',
  postalCode: user?.customerAddressPostalCode || user?.customerAddressPostalCode || '',
  country: user?.customerCountryIso2Code || user?.customerCountryIso2Code || '',
});

export const validatePaymentMethodInput = (
  field: string,
  value: string,
  formData: PaymentMethodFormData
): string | undefined => {
  switch (field) {
    case 'cardNumber':
      const cardValidation = validateCardNumber(value);
      if (!cardValidation.isValid && !cardValidation.isPotentiallyValid) {
         return 'Invalid card number.';
      }

      if (!cardValidation.isValid && value.length >= 19) {
         return 'Invalid card number.';
      }
      return undefined;

    case 'expiryDate':
      const expiryValidation = validateExpiryDate(value);
      if (!expiryValidation.isValid && value.length >= 5) {
        return 'Invalid or expired date.';
      }
      return undefined;

    case 'securityCode':
      const requiredLength = getCvcLength(formData.cardNumber);
      const cvcValidation = validateCVC(value, requiredLength);

      if (!cvcValidation.isValid && value.length >= requiredLength) {
        return 'Invalid security code.';
      }
      return undefined;

    default:
      return validateField(field, value);
  }
};

export const validatePaymentMethodForm = (formData: PaymentMethodFormData) => {
  let isValid = true;
  const newErrors: Partial<Record<keyof AddCardFormInputs, string | undefined>> = {};
  const newTouched: Partial<Record<keyof AddCardFormInputs, boolean>> = {};

  fieldsToValidate.forEach(field => {
    newTouched[field] = true;

    let error = validatePaymentMethodInput(field, formData[field], formData);

    if (field === 'cardNumber') {
       const cardValidation = validateCardNumber(formData[field]);
       if (!cardValidation.isValid) error = 'Invalid card number.';
    }
    if (field === 'expiryDate') {
       const expiryValidation = validateExpiryDate(formData[field]);
       if (!expiryValidation.isValid) error = 'Invalid expiration date.';
    }
    if (field === 'securityCode') {
       const reqLen = getCvcLength(formData.cardNumber);
       const cvcValidation = validateCVC(formData[field], reqLen);
       if (!cvcValidation.isValid) error = 'Invalid security code.';
    }

    if (error) {
      newErrors[field] = error;
      isValid = false;
    }
  });

  return {
    errors: newErrors,
    isValid,
    touched: newTouched,
  };
};

export const buildEnrollmentCardPayload = ({
  cardNumber,
  formData,
  user,
}: {
  cardNumber: string;
  formData: PaymentMethodFormData;
  user: any;
}) => {
  const selectedCountry = Country.getCountryByCode(formData.country) || Country.getAllCountries().find(country => country.name === formData.country);
  const countryCode = selectedCountry?.isoCode || user?.customerCountryIso2Code || '';
  const countryName = selectedCountry?.name || Country.getCountryByCode(countryCode)?.name || countryCode;

  return {
    creditCardNumber: cardNumber,
    expiryDate: formData.expiryDate,
    cardSecurityCode: formData.securityCode,
    cardholderName: formData.fullName,
    cardOrigin: countryCode,
    billingStreet: formData.streetAddress,
    billingCity: formData.city,
    billingState: formData.stateRegion,
    billingCountry: countryName,
    billingCountryCode: countryCode,
    billingPostalCode: formData.postalCode,
  };
};

export const buildAddressPayload = ({
  firstName,
  formData,
  lastName,
}: {
  firstName: string;
  formData: PaymentMethodFormData;
  lastName: string;
}) => ({
  firstName: firstName,
  lastName: lastName,
  streetAddress: formData.streetAddress,
  country: formData.country,
  state: formData.stateRegion,
  city: formData.city,
  postalCode: formData.postalCode,
});

export const buildAddCardRequestPayload = ({
  cardNumber,
  currentProvider,
  formData,
  user,
  forcePrimary = false,
}: {
  cardNumber: string;
  currentProvider: string;
  formData: PaymentMethodFormData;
  user: any;
  forcePrimary?: boolean;
}): AddCardRequest => ({
  creditCardNumber: cardNumber,
  expiryDate: formData.expiryDate,
  cardSecurityCode: formData.securityCode,
  isPrimary: formData.useAsPrimaryPayment || forcePrimary,
  bin: cardNumber.substring(0, 8),
  cardProvider: currentProvider,
  cardholderName: formData.fullName,
  cardOrigin: formData.country || user?.customerCountryIso2Code as string,
  billingStreet: formData.streetAddress,
  billingCity: formData.city,
  billingState: formData.stateRegion,
  billingCountry: formData.country || user?.customerCountryIso2Code as string,
  billingCountryCode: formData.country || user?.customerCountryIso2Code as string,
  billingPostalCode: formData.postalCode,
});
