import type { AppliedFilters } from '@/types';

export const EMPTY_FILTERS = {
  statusFilters: [],
  transactionTypeFilters: [],
  createdAtRange: '',
  project: '',
  paymentType: '',
  startDate: '',
  endDate: '',
} as AppliedFilters;

export const INITIAL_FORM_DETAILS_STATE = {
  fullName: '',
  cardNumber: '',
  expiryDate: '',
  securityCode: '',
  streetAddress: '',
  country: '',
  stateRegion: '',
  city: '',
  postalCode: '',
  saveAsDefaultBilling: false,
  useAsPrimaryPayment: false,
  cardProvider: 'unknown',
};

export const DEFAULT_CURRENCY = 'PHP';

export const DEFAULT_AMOUNT = 0;
