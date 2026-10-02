import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import DirectDebitBankOption from '../../../components/payments/DirectDebitBankOption';

const BankIcon = () => <View testID="bank-icon" />;

describe('DirectDebitBankOption', () => {
  it('keeps long bank labels inside the option and preserves the action', () => {
    const onPress = jest.fn();
    const label = 'Rizal Commercial Banking Corporation (RCBC)';

    render(<DirectDebitBankOption label={label} icon={BankIcon} onPress={onPress} />);

    const bankLabel = screen.getByText(label);
    expect(bankLabel.props.numberOfLines).toBe(2);
    expect(bankLabel.props.ellipsizeMode).toBe('tail');
    expect(StyleSheet.flatten(bankLabel.props.style)).toEqual(
      expect.objectContaining({ flex: 1, flexShrink: 1 }),
    );

    fireEvent.press(screen.getByRole('button', { name: `Link ${label}` }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
