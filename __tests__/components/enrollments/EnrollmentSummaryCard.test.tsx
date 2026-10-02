import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import EnrollmentSummaryCard from '@/components/enrollments/EnrollmentSummaryCard';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Animated } from 'react-native';

const enrollment = {
  referenceId: 'ENR-001',
  merchantCode: 'AQWIRE',
  merchantName: 'Aqwire Homes',
  status: 'active',
  baseAmount: 1250,
  baseCurrency: 'PHP',
  nextDebitDate: '2026-08-01',
  paymentMethod: {
    provider: 'visa',
    lastFourDigits: '1111',
  },
} as any;

describe('EnrollmentSummaryCard', () => {
  beforeEach(() => {
    jest.spyOn(Animated, 'timing').mockReturnValue({
      start: jest.fn<(...args: any[]) => any>(),
      stop: jest.fn<(...args: any[]) => any>(),
    } as any);
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('renders enrollment summary fields and opens the selected enrollment', () => {
    const onPress = jest.fn<(...args: any[]) => any>();
    render(<EnrollmentSummaryCard item={enrollment} index={0} onPress={onPress} />);
    expect(screen.getByText('AQWIRE')).toBeTruthy();
    expect(screen.getByText('ENR-001')).toBeTruthy();
    expect(screen.getByText('MONTHLY AMOUNT')).toBeTruthy();
    expect(screen.getByText('NEXT DEBIT')).toBeTruthy();
    const card = screen.getByTestId('enrollment-card-0');
    fireEvent.press(card);
    expect(onPress).toHaveBeenCalledWith(enrollment);
  });

  it('renders a logo when available and animates press feedback', () => {
    render(
      <EnrollmentSummaryCard
        item={enrollment}
        index={2}
        logoUrl="https://example.test/logo.png"
        onPress={jest.fn<(...args: any[]) => any>()}
      />,
    );
    const card = screen.getByTestId('enrollment-card-2');
    fireEvent(card, 'pressIn');
    fireEvent(card, 'pressOut');
    expect(Animated.timing).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      toValue: 0.98,
    }));
    expect(Animated.timing).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      toValue: 1,
    }));
  });

  it('falls back to merchant title and avatar initial when merchant code and logo are absent', () => {
    render(
      <EnrollmentSummaryCard
        item={{ ...enrollment, merchantCode: undefined, logoUrl: undefined }}
        index={3}
        onPress={jest.fn<(...args: any[]) => any>()}
      />,
    );
    expect(screen.getByText('AUTO DEBIT ENROLLMENT')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
  });
});
