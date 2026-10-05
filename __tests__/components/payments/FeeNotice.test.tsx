import { describe, expect, it, jest } from '@jest/globals';
import FeeNotice from '@/components/payments/FeeNotice';
import { renderWithProviders } from '@/utils/test-utils';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

const notice = (overrides: Partial<React.ComponentProps<typeof FeeNotice>> = {}) => (
  <FeeNotice
    hasError={false}
    isCalculating={false}
    isReplacingCard={false}
    needsCardReplacement={false}
    onReplaceCard={jest.fn()}
    {...overrides}
  />
);

describe('FeeNotice', () => {
  it('shows nothing until there is something to say', () => {
    const { toJSON } = renderWithProviders(notice());
    expect(toJSON()).toBeNull();
  });

  it('says the fee is being worked out', () => {
    renderWithProviders(notice({ isCalculating: true }));
    expect(screen.getAllByLabelText('Calculating fees').length).toBeGreaterThan(0);
  });

  it('says what the service fee came to', () => {
    renderWithProviders(notice({ fee: '₱ 25.00' }));
    expect(screen.getByText('₱ 25.00')).toBeTruthy();
    expect(screen.getByText(/You will be charged a service fee of/)).toBeTruthy();
  });

  it('shows the calculation, not an old fee, while it is working', () => {
    renderWithProviders(notice({ isCalculating: true, fee: '₱ 25.00' }));
    expect(screen.queryByText('₱ 25.00')).toBeNull();
  });

  it('explains a calculation that failed', () => {
    renderWithProviders(notice({ hasError: true }));

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Unable to calculate fees for this bill. Please try again later or contact support.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Replace card' })).toBeNull();
  });

  it('offers to replace a card that can no longer be used', () => {
    const onReplaceCard = jest.fn();
    renderWithProviders(notice({ hasError: true, needsCardReplacement: true, onReplaceCard }));

    expect(screen.getByText('This card can no longer be used. Please remove it and add it again.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Replace card' }));
    expect(onReplaceCard).toHaveBeenCalledTimes(1);
  });

  it('shows the replace button as busy while the card is being removed', () => {
    renderWithProviders(notice({ hasError: true, needsCardReplacement: true, isReplacingCard: true }));
    expect(screen.getByTestId('ActivityIndicator')).toBeTruthy();
  });
});
