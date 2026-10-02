import { describe, expect, it, jest } from '@jest/globals';
import UpcomingBillCard from '@/components/enrollments/UpcomingBillCard';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Animated } from 'react-native';

const bill = {
  title: 'Acqua Private Residences',
  merchantName: 'Tama Homes',
  amount: 'PHP 1,250.00',
  dueDateLabel: 'July 30, 2026',
  isNearestUpcoming: true,
} as any;

describe('UpcomingBillCard', () => {
  it('renders the nearest upcoming amount and accessible due-date summary', () => {
    const onPress = jest.fn<(...args: any[]) => any>();
    render(
      <UpcomingBillCard
        bill={bill}
        index={0}
        onPress={onPress}
        pageWidth={320}
        scrollX={new Animated.Value(0)}
      />,
    );
    expect(screen.getByText('Tama Homes')).toBeTruthy();
    expect(screen.getByText('PHP 1,250.00')).toBeTruthy();
    expect(screen.getByText('Next bill due July 30, 2026')).toBeTruthy();
    expect(screen.getByRole('button', {
      name: 'Tama Homes, PHP 1,250.00, due July 30, 2026',
    })).toBeTruthy();
  });

  it('shows the due date on non-nearest cards and forwards press interactions', () => {
    const onPress = jest.fn<(...args: any[]) => any>();
    const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
      start: jest.fn<(...args: any[]) => any>(),
    } as any);
    render(
      <UpcomingBillCard
        bill={{ ...bill, isNearestUpcoming: false }}
        index={1}
        onPress={onPress}
        pageWidth={300}
        scrollX={new Animated.Value(0)}
      />,
    );
    const card = screen.getByTestId('monthly-bill-card-1');
    expect(screen.getByText('Next bill due July 30, 2026')).toBeTruthy();
    fireEvent(card, 'pressIn');
    fireEvent(card, 'pressOut');
    fireEvent.press(card);
    expect(timing).toHaveBeenCalledTimes(2);
    expect(onPress).toHaveBeenCalledWith(expect.objectContaining({ title: 'Acqua Private Residences' }));
    timing.mockRestore();
  });
});
