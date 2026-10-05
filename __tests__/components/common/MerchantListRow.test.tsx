import { describe, expect, it } from '@jest/globals';
import MerchantListRow from '@/components/common/MerchantListRow';
import { renderWithProviders } from '@/utils/test-utils';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

describe('MerchantListRow', () => {
  it('shows the merchant name and initials', () => {
    renderWithProviders(<MerchantListRow name="Avida Land" testID="biller-row-19" />);

    expect(screen.getByText('Avida Land')).toBeTruthy();
    expect(screen.getByText('AL')).toBeTruthy();
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('shows a Saved pill when the merchant is saved', () => {
    renderWithProviders(<MerchantListRow badge="Saved" name="Avida Land" />);
    expect(screen.getByText('Saved')).toBeTruthy();
  });

  it('shows the logo instead of the initials when there is one', () => {
    renderWithProviders(<MerchantListRow logoUrl="https://example.com/avida.png" name="Avida Land" />);

    expect(screen.UNSAFE_getByType(Image).props.source).toEqual({ uri: 'https://example.com/avida.png' });
    expect(screen.queryByText('AL')).toBeNull();
  });

  it('reads as one item, saying whether it is saved', () => {
    const { rerender } = renderWithProviders(<MerchantListRow name="Avida Land" />);
    expect(screen.getByLabelText('Avida Land')).toBeTruthy();

    rerender(<MerchantListRow badge="Saved" name="Avida Land" />);
    expect(screen.getByLabelText('Avida Land, saved')).toBeTruthy();
  });

  it('is 81pt tall, as drawn in the design: 60pt of content, 10pt of padding either side and a divider', () => {
    renderWithProviders(<MerchantListRow name="Avida Land" testID="biller-row-19" />);

    expect(StyleSheet.flatten(screen.getByTestId('biller-row-19').props.style)).toEqual(
      expect.objectContaining({ borderBottomWidth: 1, minHeight: 81, paddingVertical: 10 }),
    );
  });

  it('is not pressable unless an onPress is given', () => {
    renderWithProviders(<MerchantListRow badge="Saved" name="Avida Land" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
