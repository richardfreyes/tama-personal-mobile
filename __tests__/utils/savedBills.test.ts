import { describe, expect, it } from '@jest/globals';
import type { Bill } from '@/redux/features/bills/billsTypes';
import type { Biller } from '@/redux/features/biller/billerTypes';
import { formatSavedBillAmount, getActiveSavedBillCount, getBillerDueSummary, getBillerLogoMap, getBillerStatus, getBillerSummaryRows, getSavedBillAmount, getSavedBillAmountInput, getSavedBillAmountValue, getSavedBillCaption, getSavedBillContractNumber, getSavedBillInitials, getSavedBillSubtitle, getSavedMerchantIds, getUniqueSavedBills, isActiveSavedBill, sortSavedBillsByUrgency, } from '@/utils/savedBills';

const makeBill = (overrides: Partial<Bill> = {}): Bill => ({
  billing_id: 1,
  billing_name: 'Netflix',
  billing_reference_id: 'bill-1',
  billing_type: 'saved',
  client_notes: '',
  custom_fields: {
    amount: { text: 'Amount', value: '₱170' },
  },
  customer_id: 1,
  merchant_category_name: 'Entertainment',
  merchant_id: 1,
  merchant_name: 'Netflix International B.V.',
  payment_type_id: 1,
  project_id: 1,
  ...overrides,
});

describe('saved bills utilities', () => {
  it('deduplicates bills by reference and counts only active unpaid entries', () => {
    const active = makeBill();
    const duplicate = makeBill({ billing_id: 2 });
    const paid = makeBill({
      billing_id: 3,
      billing_reference_id: 'bill-3',
      payment_status: 'Paid',
    });
    const inactive = makeBill({
      billing_id: 4,
      billing_reference_id: 'bill-4',
      is_active: false,
    });

    expect(getUniqueSavedBills([active, duplicate, paid, inactive])).toHaveLength(3);
    expect(getActiveSavedBillCount([active, duplicate, paid, inactive])).toBe(1);
    expect(isActiveSavedBill(paid)).toBe(false);
  });

  it('formats initials for single and multi-word bill names', () => {
    expect(getSavedBillInitials('Netflix')).toBe('NE');
    expect(getSavedBillInitials('SSS Contribution')).toBe('SC');
    expect(getSavedBillInitials('')).toBe('SB');
  });

  it('skips punctuation and filler words when taking initials', () => {
    expect(getSavedBillInitials('AboitizLand, Inc.')).toBe('AB');
    expect(getSavedBillInitials('Agriya Gardens by Damosa Land.')).toBe('AG');
    expect(getSavedBillInitials('Rockwell Property Management Corporation')).toBe('RP');
    expect(getSavedBillInitials('Netflix International B.V.')).toBe('NI');
    expect(getSavedBillInitials('Inc.')).toBe('SB');
  });

  it('uses the first digit and letter for a name that starts with numbers', () => {
    expect(getSavedBillInitials('724Care')).toBe('7C');
    expect(getSavedBillInitials('3M')).toBe('3M');
    expect(getSavedBillInitials('7-Eleven')).toBe('7E');
  });

  it('derives amount and due captions from saved-bill fields', () => {
    const now = new Date('2026-07-31T08:00:00.000Z');
    const dueTomorrow = makeBill({ due_date: '2026-08-01T00:00:00.000Z' });
    const paid = makeBill({
      date_paid: '2026-07-15T00:00:00.000Z',
      payment_status: 'Paid',
    });

    expect(getSavedBillAmount(dueTomorrow)).toBe('₱170');
    expect(getSavedBillCaption(dueTomorrow, now)).toBe('Due tomorrow');
    expect(getSavedBillCaption(paid, now)).toBe('Paid Jul 15');
  });

  it('uses a useful payment status when the API has no due metadata', () => {
    expect(getSavedBillCaption(makeBill())).toBe('Ready to pay');
    expect(getSavedBillAmount(makeBill({ custom_fields: {} }))).toBe('—');
  });
});

describe('getSavedMerchantIds', () => {
  it('collects the merchant of each saved bill once', () => {
    const ids = getSavedMerchantIds([
      makeBill({ billing_reference_id: 'a', merchant_id: 5 }),
      makeBill({ billing_reference_id: 'b', merchant_id: 5 }),
      makeBill({ billing_reference_id: 'c', merchant_id: 9 }),
    ]);

    expect(Array.from(ids).sort()).toEqual([5, 9]);
  });

  it('is empty before bills have loaded or when there are none', () => {
    expect(getSavedMerchantIds(undefined).size).toBe(0);
    expect(getSavedMerchantIds(null).size).toBe(0);
    expect(getSavedMerchantIds([]).size).toBe(0);
  });
});

describe('getBillerLogoMap', () => {
  const makeBiller = (merchant_id: number, merchant_logo_url: string): Biller => ({
    address_one: '',
    address_three: '',
    address_two: '',
    created_at: '',
    is_active: true,
    is_public: true,
    merchant_code: `m${merchant_id}`,
    merchant_id,
    merchant_logo_url,
    merchant_name: `Merchant ${merchant_id}`,
    merchant_status: 'active',
    merchant_timezone: 'Asia/Manila',
    updated_at: '',
  });

  it('maps merchant ids to their logos and skips billers without one', () => {
    const logos = getBillerLogoMap([
      makeBiller(1, 'https://example.com/one.png'),
      makeBiller(2, ''),
      makeBiller(3, 'https://example.com/three.png'),
    ]);

    expect(logos.get(1)).toBe('https://example.com/one.png');
    expect(logos.get(3)).toBe('https://example.com/three.png');
    expect(logos.has(2)).toBe(false);
    expect(logos.size).toBe(2);
  });

  it('returns an empty map before billers have loaded', () => {
    expect(getBillerLogoMap(undefined).size).toBe(0);
    expect(getBillerLogoMap(null).size).toBe(0);
    expect(getBillerLogoMap([]).size).toBe(0);
  });
});

describe('formatSavedBillAmount', () => {
  const withAmount = (value: string) => makeBill({ custom_fields: { amount: { text: 'Amount', value } } });

  it('shows peso amounts with a peso sign and two decimals', () => {
    expect(formatSavedBillAmount(withAmount('₱1,750'))).toBe('₱ 1,750.00');
    expect(formatSavedBillAmount(withAmount('PHP 1,750.5'))).toBe('₱ 1,750.50');
    expect(formatSavedBillAmount(withAmount('2500'))).toBe('₱ 2,500.00');
  });

  it('keeps foreign currencies as the bill reports them', () => {
    expect(formatSavedBillAmount(withAmount('USD 25.5'))).toBe('USD 25.5');
  });

  it('falls back to the no-amount label when the bill has no amount', () => {
    expect(formatSavedBillAmount(makeBill({ custom_fields: {} }))).toBe('Enter amount');
  });
});

describe('saved bill amounts as numbers', () => {
  const withAmount = (value: string) => makeBill({ custom_fields: { amount: { text: 'Amount', value } } });

  it('reads peso and plain amounts as numbers', () => {
    expect(getSavedBillAmountValue(withAmount('₱1,750'))).toBe(1750);
    expect(getSavedBillAmountValue(withAmount('10,000.00'))).toBe(10000);
    expect(getSavedBillAmountValue(withAmount('PHP 99.5'))).toBe(99.5);
  });

  it('has no number for a foreign currency or a missing amount', () => {
    expect(getSavedBillAmountValue(withAmount('USD 25'))).toBeNull();
    expect(getSavedBillAmountValue(makeBill({ custom_fields: {} }))).toBeNull();
  });

  it('prefills the amount field with two decimals, or leaves it empty', () => {
    expect(getSavedBillAmountInput(withAmount('10,000'))).toBe('10000.00');
    expect(getSavedBillAmountInput(withAmount('₱1,750.5'))).toBe('1750.50');
    expect(getSavedBillAmountInput(withAmount('0'))).toBe('');
    expect(getSavedBillAmountInput(makeBill({ custom_fields: {} }))).toBe('');
  });
});

describe('biller status', () => {

  const now = new Date(2026, 9, 3, 12, 0, 0);
  const at = (month: number, day: number) => new Date(2026, month, day).toISOString();

  it('says how many days a bill is overdue', () => {
    expect(getBillerStatus(makeBill({ due_date: at(9, 1) }), now)).toEqual(
      expect.objectContaining({ tone: 'overdue', label: 'Overdue 2 days' }),
    );
    expect(getBillerStatus(makeBill({ due_date: at(9, 2) }), now)).toEqual(
      expect.objectContaining({ tone: 'overdue', label: 'Overdue 1 day' }),
    );
  });

  it('shows the due date of a bill that is due today or later', () => {
    expect(getBillerStatus(makeBill({ due_date: at(9, 5) }), now)).toEqual(
      expect.objectContaining({ tone: 'due', label: 'Due Oct 5' }),
    );
    expect(getBillerStatus(makeBill({ due_date: at(9, 3) }), now)?.tone).toBe('due');
  });

  it('shows when a bill was paid, even without a date', () => {
    expect(getBillerStatus(makeBill({ date_paid: at(8, 28) }), now)).toEqual({ tone: 'paid', label: 'Paid Sep 28' });
    expect(getBillerStatus(makeBill({ payment_status: 'Paid' }), now)).toEqual({ tone: 'paid', label: 'Paid' });
  });

  it('reports never paid only when the API says there is no payment', () => {
    expect(getBillerStatus(makeBill({ date_paid: null }), now)).toEqual({ tone: 'none', label: 'Never paid' });
    expect(getBillerStatus(makeBill({ paid_at: null }), now)?.tone).toBe('none');
  });

  it('has no status when the API reports nothing, rather than guessing', () => {
    expect(getBillerStatus(makeBill(), now)).toBeNull();
    expect(getBillerStatus(makeBill({ payment_status: 'Active' }), now)).toBeNull();
  });

  it('reads the due date from a custom field when the bill has none of its own', () => {
    const bill = makeBill({
      custom_fields: { amount: { text: 'Amount', value: '1' }, paymentDueDate: { text: 'Due', value: at(9, 8) } },
    });
    expect(getBillerStatus(bill, now)?.label).toBe('Due Oct 8');
  });
});

describe('ordering and summarising saved billers', () => {
  const now = new Date(2026, 9, 3, 12, 0, 0);
  const at = (month: number, day: number) => new Date(2026, month, day).toISOString();
  const named = (name: string, overrides: Partial<Bill> = {}, amount = '') => makeBill({
    billing_name: name,
    billing_reference_id: name,
    custom_fields: amount ? { amount: { text: 'Amount', value: amount } } : {},
    ...overrides,
  });

  const filinvest = named('Filinvest', { due_date: at(9, 5) }, '10,000.00');
  const rockwell = named('Rockwell', { date_paid: null });
  const care = named('724Care', { due_date: at(9, 1) }, '32,321.00');
  const avida = named('Avida', { date_paid: at(8, 28) }, '8,450.00');
  const unknown = named('Unknown');

  it('lists overdue first, then due, then never paid, then paid', () => {
    const names = sortSavedBillsByUrgency([avida, rockwell, filinvest, care], now).map((bill) => bill.billing_name);
    expect(names).toEqual(['724Care', 'Filinvest', 'Rockwell', 'Avida']);
  });

  it('orders overdue billers longest overdue first and due ones by date', () => {
    const later = named('Later', { due_date: at(9, 20) });
    const sooner = named('Sooner', { due_date: at(9, 4) });
    const lessOverdue = named('Less overdue', { due_date: at(9, 2) });
    const names = sortSavedBillsByUrgency([later, lessOverdue, sooner, care], now).map((bill) => bill.billing_name);
    expect(names).toEqual(['724Care', 'Less overdue', 'Sooner', 'Later']);
  });

  it('leaves billers the API says nothing about in the order they came in', () => {
    const second = named('Second');
    const names = sortSavedBillsByUrgency([unknown, second], now).map((bill) => bill.billing_name);
    expect(names).toEqual(['Unknown', 'Second']);
  });

  it('totals what is due and overdue and names the next bill', () => {
    expect(getBillerDueSummary([avida, rockwell, filinvest, care], now)).toEqual({
      billCount: 2,
      overdueCount: 1,
      total: 42321,
      knownAmountCount: 2,
      hasUnknownAmounts: false,
      next: { nickname: 'Filinvest', dueDateLabel: 'Oct 5' },
    });
  });

  it('names the first overdue bill when nothing else is coming due', () => {
    expect(getBillerDueSummary([care], now)).toEqual({
      billCount: 1,
      overdueCount: 1,
      total: 32321,
      knownAmountCount: 1,
      hasUnknownAmounts: false,
      next: { nickname: '724Care', dueDateLabel: 'Oct 1' },
    });
  });

  it('counts due bills without an amount and marks the total as incomplete', () => {
    const noAmount = named('No amount', { due_date: at(9, 6) });
    expect(getBillerDueSummary([noAmount, filinvest], now)?.total).toBe(10000);
    expect(getBillerDueSummary([noAmount, filinvest], now)?.billCount).toBe(2);
    expect(getBillerDueSummary([noAmount, filinvest], now)?.knownAmountCount).toBe(1);
    expect(getBillerDueSummary([noAmount, filinvest], now)?.hasUnknownAmounts).toBe(true);
    expect(getBillerDueSummary([noAmount], now)).toEqual({
      billCount: 1,
      overdueCount: 0,
      total: 0,
      knownAmountCount: 0,
      hasUnknownAmounts: true,
      next: { nickname: 'No amount', dueDateLabel: 'Oct 6' },
    });
  });

  it('has no summary when nothing is due or overdue', () => {
    expect(getBillerDueSummary([avida, rockwell, unknown], now)).toBeNull();
    expect(getBillerDueSummary([], now)).toBeNull();
  });
});

describe('biller summary', () => {
  const field = (text: string, value: string) => ({ text, value });
  const filinvest = makeBill({
    billing_name: 'Filinvest Land',
    merchant_name: 'Filinvest Land',
    client_notes: '',
    custom_fields: {
      amount: field('Amount Due', '10,000.00'),
      paymentName: field('Payment Name', 'HDMF Refiling Fee'),
      projectName: field('Project Name', '100 West Makati Tower'),
      contractNo: field('Contract Number', '1231232346433246'),
      customerName: field('Full Name', 'Richard'),
      customerEmail: field('Email', 'aqwire@google.com'),
      mobileCallingCode: field('Mobile Calling Code', '+63'),
      mobileNo: field('Mobile Number', '9770884111'),
      customerMobileNo: field('Mobile Number of Unit Owner', '9770884111'),
      agentName: field('Agent Name', ''),
      clientNotes: field('Client Notes', ''),
      billName: field('Bill Name', 'Filinvest Land'),
    },
  });

  it('lists the four key rows, then the rest, in the design order', () => {
    const { primary, secondary } = getBillerSummaryRows(filinvest);

    expect(primary.map((row) => [row.label, row.value])).toEqual([
      ['Payment Name', 'HDMF Refiling Fee'],
      ['Project Name', '100 West Makati Tower'],
      ['Contract Number', '1231232346433246'],
      ['Customer Name', 'Richard'],
    ]);
    expect(secondary.map((row) => [row.label, row.value])).toEqual([
      ['Bill Name', 'Filinvest Land'],
      ['Payee', 'Filinvest Land'],
      ['Email', 'aqwire@google.com'],
      ['Mobile', '+63 977 088 4111'],
      ['Sales Executive Name', ''],
      ['Client Notes', ''],
    ]);
  });

  it('merges the three phone fields into one number, whichever way the number was stored', () => {
    const withCode = (mobileNo: string) => makeBill({
      custom_fields: { mobileCallingCode: field('Code', '+63'), mobileNo: field('Mobile', mobileNo) },
    });
    const mobileOf = (bill: Bill) => getBillerSummaryRows(bill).secondary.find((row) => row.id === 'mobile')?.value;

    expect(mobileOf(withCode('+639770884111'))).toBe('+63 977 088 4111');
    expect(mobileOf(withCode('9770884111'))).toBe('+63 977 088 4111');
    expect(mobileOf(withCode('09770884111'))).toBe('+63 977 088 4111');
  });

  it('falls back to the owner’s mobile number when the bill has no other', () => {
    const bill = makeBill({ custom_fields: { customerMobileNo: field('Owner mobile', '9770884111') } });
    expect(getBillerSummaryRows(bill).secondary.find((row) => row.id === 'mobile')?.value).toBe('977 088 4111');
  });

  it('keeps the four standard summary rows when a biller omits fields', () => {
    const bill = makeBill({
      custom_fields: { paymentName: field('Payment Name', 'Dues'), projectName: field('Project Name', '') },
    });
    const { primary } = getBillerSummaryRows(bill);

    expect(primary.map((row) => row.id)).toEqual(['paymentName', 'projectName', 'contractNumber', 'customerName']);
    expect(primary[1].value).toBe('');
    expect(primary[2].value).toBe('');
  });

  it('adds details specific to the biller after the standard ones, under the biller’s own label', () => {
    const bill = makeBill({
      custom_fields: {
        amount: field('Amount', '100'),
        termsBox: field('termsBox', 'true'),
        unitNumber: field('Unit Number', 'B27L02'),
        agentEmail: field('Agent Email', ''),
      },
    });
    const { secondary } = getBillerSummaryRows(bill);

    expect(secondary.at(-1)).toEqual({ id: 'unitNumber', label: 'Unit Number', value: 'B27L02' });
    expect(secondary.map((row) => row.id)).not.toContain('amount');
    expect(secondary.map((row) => row.id)).not.toContain('termsBox');
    expect(secondary.map((row) => row.id)).not.toContain('agentEmail');
  });

  it('takes the client notes from the bill itself', () => {
    const { secondary } = getBillerSummaryRows(makeBill({ client_notes: 'Pay on the 5th' }));
    expect(secondary.find((row) => row.id === 'clientNotes')?.value).toBe('Pay on the 5th');
  });

  it('builds the heading line from the payee and the end of the contract number', () => {
    expect(getSavedBillContractNumber(filinvest)).toBe('1231232346433246');
    expect(getSavedBillSubtitle(filinvest)).toBe('Filinvest Land · Contract •••• 3246');
  });

  it('shows only the payee when the biller has no contract number', () => {
    expect(getSavedBillSubtitle(makeBill({ merchant_name: '724Care' }))).toBe('724Care');
  });
});
