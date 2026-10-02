import { describe, expect, it } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import React from 'react';
import PaymentInfoSection from '../../../components/payments/PaymentInfoSection';
import { renderWithProviders } from '../../../utils/test-utils';

const rows = [
  { label: 'Amount', value: 'PHP 4,000.00', weight: '600' as const },
  { label: 'Reference', value: 'QW-I-12345' },
  { label: 'Date', value: 'October 23, 2025' },
];

describe('PaymentInfoSection', () => {
  // ---- Rendering ----

  it('renders the section title', () => {
    renderWithProviders(<PaymentInfoSection title="Payment Details" rows={rows} />);
    expect(screen.getByText('Payment Details')).toBeTruthy();
  });

  it('renders every row label', () => {
    renderWithProviders(<PaymentInfoSection title="Payment Details" rows={rows} />);
    expect(screen.getByText('Amount')).toBeTruthy();
    expect(screen.getByText('Reference')).toBeTruthy();
    expect(screen.getByText('Date')).toBeTruthy();
  });

  it('renders every row value', () => {
    renderWithProviders(<PaymentInfoSection title="Payment Details" rows={rows} />);
    expect(screen.getByText('PHP 4,000.00')).toBeTruthy();
    expect(screen.getByText('QW-I-12345')).toBeTruthy();
    expect(screen.getByText('October 23, 2025')).toBeTruthy();
  });

  // ---- Empty / edge cases ----

  it('renders the title with no rows', () => {
    renderWithProviders(<PaymentInfoSection title="Empty Section" rows={[]} />);
    expect(screen.getByText('Empty Section')).toBeTruthy();
  });

  it('falls back to a placeholder when a row value is empty', () => {
    renderWithProviders(
      <PaymentInfoSection
        title="Details"
        rows={[{ label: 'Notes', value: '' }]}
      />,
    );
    expect(screen.getByText('Notes')).toBeTruthy();
    expect(screen.getByText('---')).toBeTruthy();
  });
});
