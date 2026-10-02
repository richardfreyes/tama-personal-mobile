import { Colors } from '@/styles/common/colors';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import NotificationItem from '../../../components/settings/NotificationItem';
import { renderWithProviders } from '../../../utils/test-utils';

const baseProps = {
  id: 'n-1',
  title: 'Payment received',
  body: 'Your payment of PHP 1,500 was successful.',
  date: 'Oct 23, 2025',
  isRead: true,
  onPress: jest.fn(),
};

describe('NotificationItem', () => {
  // ---- Rendering ----

  it('renders the title, body and date', () => {
    renderWithProviders(<NotificationItem {...baseProps} />);
    expect(screen.getByText('Payment received')).toBeTruthy();
    expect(
      screen.getByText('Your payment of PHP 1,500 was successful.'),
    ).toBeTruthy();
    expect(screen.getByText('Oct 23, 2025')).toBeTruthy();
  });

  it('renders the logo icon (mocked svg)', () => {
    const { toJSON } = renderWithProviders(<NotificationItem {...baseProps} />);
    expect(JSON.stringify(toJSON())).toContain('SvgMock');
  });

  // ---- Read / unread styling ----

  it('applies the unread background colour when isRead is false', () => {
    renderWithProviders(<NotificationItem {...baseProps} isRead={false} />);
    const card = screen.UNSAFE_getAllByType(TouchableOpacity)[0];
    const style = StyleSheet.flatten(card.props.style);
    expect(style.backgroundColor).toBe(Colors.maroon01);
  });

  it('does not apply the unread background when isRead is true', () => {
    renderWithProviders(<NotificationItem {...baseProps} isRead />);
    const card = screen.UNSAFE_getAllByType(TouchableOpacity)[0];
    const style = StyleSheet.flatten(card.props.style);
    expect(style.backgroundColor).not.toBe(Colors.maroon01);
  });

  // ---- Interaction ----

  it('calls onPress with the notification id when pressed', () => {
    const onPress = jest.fn();
    renderWithProviders(<NotificationItem {...baseProps} onPress={onPress} />);
    fireEvent.press(screen.getByText('Payment received'));
    expect(onPress).toHaveBeenCalledWith('n-1');
  });
});
