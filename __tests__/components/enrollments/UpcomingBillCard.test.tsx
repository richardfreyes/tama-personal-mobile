import { describe, expect, it, jest } from '@jest/globals';
import UpcomingBillCard from '@/components/enrollments/UpcomingBillCard';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet } from 'react-native';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));

const bill = {
  title: 'Acqua Private Residences',
  merchantName: 'Tama Homes',
  amount: 'PHP 1,250.00',
  dueDateLabel: 'July 30, 2026',
  daysRemainingLabel: '5 days left',
  isNearestUpcoming: true,
} as any;

const renderCard = (overrides: Record<string, unknown> = {}, onPress = jest.fn<(...args: any[]) => any>()) => {
  const onEnroll = jest.fn<() => void>();
  const result = render(
    <UpcomingBillCard
      bill={{ ...bill, ...overrides }}
      index={0}
      onEnroll={onEnroll}
      onPress={onPress}
      pageWidth={320}
    />,
  );
  return { ...result, onEnroll, onPress };
};

describe('UpcomingBillCard', () => {
  it('renders the split gradient card with a separate due-date base', () => {
    const { UNSAFE_getAllByType } = renderCard();

    expect(screen.getByText('Next bill due')).toBeTruthy();
    expect(screen.getByText('Tama Homes')).toBeTruthy();
    expect(screen.getByText('₱')).toBeTruthy();
    expect(screen.getByText('1,250.00')).toBeTruthy();
    expect(screen.getByText('Due July 30, 2026')).toBeTruthy();
    expect(screen.getByText('5 days left')).toBeTruthy();
    expect(screen.queryByText('Pay Now')).toBeNull();

    const gradient = UNSAFE_getAllByType(LinearGradient)[0];
    expect(gradient.props.colors).toEqual(['#3D2422', '#7F211D', '#C11E1A', '#E65F2C']);
    expect(gradient.props.locations).toEqual([0, 0.4, 0.78, 1]);
    const cardStyle = StyleSheet.flatten(screen.getByTestId('monthly-bill-card-container-0').props.style);
    expect(cardStyle.backgroundColor).toBe('#FFF');
    expect(cardStyle.borderRadius).toBe(24);
  });

  it('keeps enrollment details on the card and opens Enroll Auto Debit separately', () => {
    const { onEnroll, onPress } = renderCard();
    const card = screen.getByTestId('monthly-bill-card-container-0');
    const billDetails = screen.getByRole('button', {
      name: 'Tama Homes, PHP 1,250.00, due July 30, 2026',
    });
    const enroll = screen.getByRole('button', { name: 'Enroll Auto Debit' });
    expect(within(card).getAllByRole('button')).toHaveLength(2);
    expect(within(billDetails).queryByRole('button', { name: 'Enroll Auto Debit' })).toBeNull();

    const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
      start: jest.fn<(...args: any[]) => any>(),
    } as any);
    fireEvent(billDetails, 'pressIn');
    fireEvent(billDetails, 'pressOut');
    fireEvent.press(billDetails);
    expect(timing).toHaveBeenCalledTimes(2);
    expect(onPress).toHaveBeenCalledWith(expect.objectContaining({ title: 'Acqua Private Residences' }));
    timing.mockRestore();

    onPress.mockClear();
    fireEvent.press(enroll);
    expect(onPress).not.toHaveBeenCalled();
    expect(onEnroll).toHaveBeenCalledTimes(1);
  });

  it('keeps non-peso currencies explicit and handles bills due today', () => {
    renderCard({ amount: 'USD 2,300.00', daysRemainingLabel: 'Due today', dueDateLabel: 'Oct 5, 2026' });

    expect(screen.getByText('USD')).toBeTruthy();
    expect(screen.getByText('2,300.00')).toBeTruthy();
    expect(screen.getByText('Due Oct 5, 2026')).toBeTruthy();
    expect(screen.getByText('Due today')).toBeTruthy();
  });
});
