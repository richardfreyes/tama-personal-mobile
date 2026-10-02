import type { Bill } from '@/redux/features/bills/billsTypes';

const makeMockSavedBill = ({
  id,
  name,
  provider,
  amount,
  dueDate,
  paidAt,
}: {
  id: number;
  name: string;
  provider: string;
  amount: string;
  dueDate?: string;
  paidAt?: string;
}): Bill => ({
  billing_id: id,
  billing_name: name,
  billing_reference_id: `mock-saved-bill-${id}`,
  billing_type: 'saved',
  client_notes: '',
  custom_fields: {
    amount: { text: 'Amount', value: amount },
  },
  customer_id: 1,
  date_paid: paidAt,
  due_date: dueDate,
  is_active: true,
  merchant_category_name: 'Utilities',
  merchant_id: id,
  merchant_name: provider,
  payment_status: paidAt ? 'Paid' : 'Active',
  payment_type_id: 1,
  project_id: id,
});

export const MOCK_SAVED_BILLS: Bill[] = [
  makeMockSavedBill({
    amount: '₱1,750',
    dueDate: '2026-08-07T00:00:00.000Z',
    id: 1,
    name: 'Pag-IBIG Housing',
    provider: 'Home Development Mutual Fund',
  }),
  makeMockSavedBill({
    amount: '₱2,034',
    id: 2,
    name: 'SSS Contribution',
    paidAt: '2026-07-15T00:00:00.000Z',
    provider: 'Social Security System',
  }),
  makeMockSavedBill({
    amount: '₱170',
    dueDate: '2026-08-01T00:00:00.000Z',
    id: 3,
    name: 'Netflix',
    provider: 'Netflix International B.V.',
  }),
  makeMockSavedBill({
    amount: '₱99',
    dueDate: '2026-08-05T00:00:00.000Z',
    id: 4,
    name: 'Spotify Premium',
    provider: 'Spotify AB',
  }),
  makeMockSavedBill({
    amount: '₱894',
    dueDate: '2026-07-29T00:00:00.000Z',
    id: 5,
    name: 'Cignal TV',
    provider: 'Cignal Cable Corporation',
  }),
  makeMockSavedBill({
    amount: '₱3,874',
    dueDate: '2026-08-03T00:00:00.000Z',
    id: 6,
    name: 'Meralco',
    provider: 'Manila Electric Company',
  }),
  makeMockSavedBill({
    amount: '₱1,289',
    dueDate: '2026-08-05T00:00:00.000Z',
    id: 7,
    name: 'Maynilad',
    provider: 'Maynilad Water Services, Inc.',
  }),
  makeMockSavedBill({
    amount: '₱2,805',
    id: 8,
    name: 'PLDT Home',
    paidAt: '2026-07-18T00:00:00.000Z',
    provider: 'PLDT Home, Inc.',
  }),
  makeMockSavedBill({
    amount: '₱2,242',
    dueDate: '2026-08-02T00:00:00.000Z',
    id: 9,
    name: 'Globe Telecom',
    provider: 'Globe Telecom, Inc.',
  }),
  makeMockSavedBill({
    amount: '₱765',
    dueDate: '2026-08-04T00:00:00.000Z',
    id: 10,
    name: 'Manila Water',
    provider: 'Manila Water Company, Inc.',
  }),
  makeMockSavedBill({
    amount: '₱618',
    dueDate: '2026-08-06T00:00:00.000Z',
    id: 11,
    name: 'PrimeWater',
    provider: 'PrimeWater Infrastructure Corp.',
  }),
  makeMockSavedBill({
    amount: '₱1,899',
    dueDate: '2026-08-08T00:00:00.000Z',
    id: 12,
    name: 'Converge FiberX',
    provider: 'Converge ICT Solutions Inc.',
  }),
  makeMockSavedBill({
    amount: '₱1,499',
    dueDate: '2026-08-09T00:00:00.000Z',
    id: 13,
    name: 'Sky Cable',
    provider: 'Sky Cable Corporation',
  }),
  makeMockSavedBill({
    amount: '₱999',
    dueDate: '2026-08-10T00:00:00.000Z',
    id: 14,
    name: 'Smart Postpaid',
    provider: 'Smart Communications, Inc.',
  }),
];
