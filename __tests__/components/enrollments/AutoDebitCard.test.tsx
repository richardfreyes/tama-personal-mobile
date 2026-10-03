import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import AutoDebitCard from '../../../components/enrollments/AutoDebitCard';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));

describe('AutoDebitCard', () => {
  it('renders the section header with the enrollment status card', () => {
    render(<AutoDebitCard activeCount={2} onPress={jest.fn()} />);
    expect(screen.getByText('Auto Debit')).toBeTruthy();
    expect(screen.getByText('2 active enrollments')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('shows the not enrolled state by default', () => {
    render(<AutoDebitCard onPress={jest.fn()} />);
    expect(screen.getByText('No active enrollments')).toBeTruthy();
    expect(screen.getByText('Not enrolled')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    render(<AutoDebitCard onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'View Auto Debit' }));
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

  it('shows a skeleton instead of the status while loading', () => {
    render(<AutoDebitCard isLoading onPress={jest.fn()} />);
    expect(screen.getByLabelText('Loading Auto Debit')).toBeTruthy();
    expect(screen.getByTestId('auto-debit-loading')).toBeTruthy();
    expect(screen.queryByText('No active enrollments')).toBeNull();
  });

  it('retries the section when it fails to load', () => {
    const onRetry = jest.fn();
    render(<AutoDebitCard isError onPress={jest.fn()} onRetry={onRetry} />);
    expect(screen.getByText('Unable to load Auto Debit.')).toBeTruthy();
    expect(screen.queryByText('No active enrollments')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Try loading Auto Debit again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
