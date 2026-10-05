import { describe, expect, it } from '@jest/globals';
import PaymentInfoSection from '@/components/payments/PaymentInfoSection';
import type { BillerSummaryRows } from '@/types/bill';
import { renderWithProviders } from '@/utils/test-utils';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

const rows: BillerSummaryRows = {
  primary: [
    { id: 'paymentName', label: 'Payment Name', value: 'HDMF Refiling Fee' },
    { id: 'projectName', label: 'Project Name', value: '100 West Makati Tower' },
    { id: 'contractNumber', label: 'Contract Number', value: '1231232346433246' },
    { id: 'customerName', label: 'Customer Name', value: 'Richard' },
  ],
  secondary: [
    { id: 'billName', label: 'Bill Name', value: 'Filinvest Land' },
    { id: 'payee', label: 'Payee', value: 'FLI' },
    { id: 'email', label: 'Email', value: 'aqwire@google.com' },
    { id: 'mobile', label: 'Mobile', value: '+63 977 088 4111' },
    { id: 'salesExecutive', label: 'Sales Executive Name', value: '' },
    { id: 'clientNotes', label: 'Client Notes', value: '' },
  ],
};

const renderSummary = (summary: BillerSummaryRows) => renderWithProviders(
  <PaymentInfoSection
    emptyText="Not provided"
    rows={summary.primary}
    secondaryRows={summary.secondary}
    testID="biller-summary"
    title="Biller Summary"
    variant="summary"
  />,
);

describe('PaymentInfoSection summary', () => {
  it('shows the four key rows and none of the rest to begin with', () => {
    renderSummary(rows);

    expect(screen.getByText('Biller Summary')).toBeTruthy();
    ['Payment Name', 'Project Name', 'Contract Number', 'Customer Name'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
    expect(screen.getByText('HDMF Refiling Fee')).toBeTruthy();
    expect(screen.queryByText('Bill Name')).toBeNull();
    expect(screen.queryByText('Client Notes')).toBeNull();
  });

  it('says how many more details there are', () => {
    renderSummary(rows);
    expect(screen.getByText('Show all details (6 more)')).toBeTruthy();
  });

  it('opens the rest from the toggle, and closes them again', () => {
    renderSummary(rows);

    fireEvent.press(screen.getByRole('button', { name: 'Show all details (6 more)' }));

    ['Bill Name', 'Payee', 'Email', 'Mobile', 'Sales Executive Name', 'Client Notes'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
    expect(screen.getByText('+63 977 088 4111')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Show less' }).props.accessibilityState).toEqual({ expanded: true });

    fireEvent.press(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.queryByText('Bill Name')).toBeNull();
    expect(screen.getByText('Show all details (6 more)')).toBeTruthy();
  });

  it('reads an empty value as "Not provided"', () => {
    renderSummary(rows);
    fireEvent.press(screen.getByRole('button', { name: /Show all details/ }));

    expect(screen.getAllByText('Not provided')).toHaveLength(2);
    expect(screen.queryByText('---')).toBeNull();
  });

  it('has no toggle when there is nothing more to show', () => {
    renderSummary({ primary: rows.primary, secondary: [] });

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Payment Name')).toBeTruthy();
  });

  it('counts details specific to the biller among the hidden ones', () => {
    renderSummary({ ...rows, secondary: [...rows.secondary, { id: 'unitNumber', label: 'Unit Number', value: 'B27L02' }] });
    expect(screen.getByText('Show all details (7 more)')).toBeTruthy();
  });
});
