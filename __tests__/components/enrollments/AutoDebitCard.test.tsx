import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import AutoDebitCard from '../../../components/enrollments/AutoDebitCard';

describe('AutoDebitCard', () => {
  it('renders the section header, card title, and subtitle', () => {
    render(<AutoDebitCard onPress={jest.fn()} />);
    expect(screen.getByText('Auto Debit')).toBeTruthy();
    expect(screen.getByText('Never miss a bill')).toBeTruthy();
    expect(
      screen.getByText('Set up automatic payments for eligible bills'),
    ).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    render(<AutoDebitCard onPress={onPress} />);
    fireEvent.press(
      screen.getByText('Set up automatic payments for eligible bills'),
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('hides the View All link by default', () => {
    render(<AutoDebitCard onPress={jest.fn()} />);
    expect(screen.queryByText('View All')).toBeNull();
  });

  it('shows the View All link when showViewAll is set', () => {
    render(<AutoDebitCard onPress={jest.fn()} showViewAll />);
    expect(screen.getByText('View All')).toBeTruthy();
  });
});
