import { describe, expect, it, jest } from '@jest/globals';
import PaymentOptionRow from '@/components/payments/PaymentOptionRow';
import { Colors } from '@/styles/common/colors';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

const renderRow = (props: Partial<React.ComponentProps<typeof PaymentOptionRow>> = {}) => render(
  <PaymentOptionRow
    leading={<Text>logo</Text>}
    onPress={jest.fn()}
    selected={false}
    subtitle="•••• 4242"
    testID="row"
    title="Visa"
    {...props}
  />,
);

describe('PaymentOptionRow', () => {
  it('shows the logo, title and detail', () => {
    renderRow();

    expect(screen.getByText('logo')).toBeTruthy();
    expect(screen.getByText('Visa')).toBeTruthy();
    expect(screen.getByText('•••• 4242')).toBeTruthy();
  });

  it('announces itself as a radio with its title, detail and badge', () => {
    renderRow({ badge: 'Default', selected: true });

    const row = screen.getByRole('radio', { name: 'Visa, •••• 4242, Default' });
    expect(row.props.accessibilityState).toEqual({ checked: true, selected: true });
  });

  it('runs its handler when pressed', () => {
    const onPress = jest.fn();
    renderRow({ onPress });

    fireEvent.press(screen.getByTestId('row'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('draws a thick red radio when selected and a thin grey one when not', () => {
    const { rerender } = renderRow({ selected: true });
    expect(StyleSheet.flatten(screen.getByTestId('row-radio').props.style)).toEqual(
      expect.objectContaining({ borderColor: Colors.red09, borderWidth: 7, height: 22, width: 22 }),
    );

    rerender(
      <PaymentOptionRow leading={<Text>logo</Text>} onPress={jest.fn()} selected={false} testID="row" title="Visa" />,
    );
    expect(StyleSheet.flatten(screen.getByTestId('row-radio').props.style)).toEqual(
      expect.objectContaining({ borderColor: Colors.outlineMuted, borderWidth: 1.5 }),
    );
  });

  it('has a pill only when given a badge', () => {
    const { rerender } = renderRow();
    expect(screen.queryByText('Default')).toBeNull();

    rerender(<PaymentOptionRow badge="Default" leading={<Text>logo</Text>} onPress={jest.fn()} selected={false} title="Visa" />);
    expect(screen.getByText('Default')).toBeTruthy();
  });

  it('sets a 64pt minimum height and a divider unless it is the last row', () => {
    const { rerender } = renderRow();
    expect(StyleSheet.flatten(screen.getByTestId('row').props.style)).toEqual(
      expect.objectContaining({ minHeight: 64, borderBottomWidth: 1, borderBottomColor: Colors.dashboardSkeleton }),
    );

    rerender(<PaymentOptionRow isLast leading={<Text>logo</Text>} onPress={jest.fn()} selected={false} testID="row" title="Visa" />);
    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).borderBottomWidth).toBeUndefined();
  });

  it('offers a 68pt row for payment methods with longer descriptions', () => {
    renderRow({ size: 'tall' });
    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).minHeight).toBe(68);
  });

  it('gives a card number tabular figures', () => {
    renderRow({ isSubtitleNumeric: true });
    expect(StyleSheet.flatten(screen.getByText('•••• 4242').props.style)).toEqual(
      expect.objectContaining({ fontVariant: ['tabular-nums'], fontSize: 13 }),
    );
  });

  it('copes with no subtitle', () => {
    renderRow({ subtitle: undefined });
    expect(screen.getByRole('radio', { name: 'Visa' })).toBeTruthy();
  });
});
