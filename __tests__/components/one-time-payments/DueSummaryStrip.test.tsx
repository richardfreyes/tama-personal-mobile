import { describe, expect, it } from '@jest/globals';
import DueSummaryStrip from '@/components/one-time-payments/DueSummaryStrip';
import { renderWithProviders } from '@/utils/test-utils';
import { screen } from '@testing-library/react-native';
import React from 'react';

describe('DueSummaryStrip', () => {
  it('counts the bills to pay and how many are overdue, with the total', () => {
    renderWithProviders(
      <DueSummaryStrip
        summary={{ billCount: 2, overdueCount: 1, total: 42321, knownAmountCount: 2, hasUnknownAmounts: false, next: { nickname: 'Filinvest Land', dueDateLabel: 'Oct 5' } }}
      />,
    );

    expect(screen.getByText('2 bills to pay · 1 overdue')).toBeTruthy();
    expect(screen.getByText('₱ 42,321.00')).toBeTruthy();
    expect(screen.getByText('Next: Filinvest Land, Oct 5')).toBeTruthy();
  });

  it('leaves out the overdue count when nothing is overdue', () => {
    renderWithProviders(
      <DueSummaryStrip summary={{ billCount: 3, overdueCount: 0, total: 900, knownAmountCount: 3, hasUnknownAmounts: false, next: { nickname: 'Meralco', dueDateLabel: 'Oct 8' } }} />,
    );

    expect(screen.getByText('3 bills to pay')).toBeTruthy();
  });

  it('says "1 bill" for a single bill', () => {
    renderWithProviders(
      <DueSummaryStrip summary={{ billCount: 1, overdueCount: 1, total: 100, knownAmountCount: 1, hasUnknownAmounts: false, next: null }} />,
    );

    expect(screen.getByText('1 bill to pay · 1 overdue')).toBeTruthy();
  });

  it('leaves out the next bill when there is none to name', () => {
    renderWithProviders(<DueSummaryStrip summary={{ billCount: 1, overdueCount: 0, total: 100, knownAmountCount: 1, hasUnknownAmounts: false, next: null }} />);
    expect(screen.queryByText(/^Next:/)).toBeNull();
  });

  it('reads as one sentence to a screen reader', () => {
    renderWithProviders(
      <DueSummaryStrip
        summary={{ billCount: 2, overdueCount: 1, total: 42321, knownAmountCount: 2, hasUnknownAmounts: false, next: { nickname: 'Filinvest Land', dueDateLabel: 'Oct 5' } }}
      />,
    );

    expect(screen.getByLabelText('2 bills to pay · 1 overdue. ₱ 42,321.00. Next: Filinvest Land, Oct 5')).toBeTruthy();
  });

  it('shows the known subtotal as incomplete when another due bill has no amount', () => {
    renderWithProviders(<DueSummaryStrip summary={{ billCount: 2, overdueCount: 0, total: 100, knownAmountCount: 1, hasUnknownAmounts: true, next: null }} />);
    expect(screen.getByText('₱ 100.00+')).toBeTruthy();
  });

  it('explains when no due bill has a saved amount', () => {
    renderWithProviders(<DueSummaryStrip summary={{ billCount: 1, overdueCount: 0, total: 0, knownAmountCount: 0, hasUnknownAmounts: true, next: null }} />);
    expect(screen.getByText('Amount not saved')).toBeTruthy();
  });
});
