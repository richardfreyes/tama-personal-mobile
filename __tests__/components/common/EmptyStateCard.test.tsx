import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import EmptyStateCard from '../../../components/common/EmptyStateCard';
import { renderWithProviders } from '../../../utils/test-utils';

describe('EmptyStateCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Message rendering ----

  it('renders the message text', () => {
    renderWithProviders(<EmptyStateCard message="No items found" />);
    expect(screen.getByText('No items found')).toBeTruthy();
  });

  it('renders with empty variant', () => {
    renderWithProviders(
      <EmptyStateCard variant="empty" message="No data available" />,
    );
    expect(screen.getByText('No data available')).toBeTruthy();
  });

  it('renders with error variant', () => {
    renderWithProviders(
      <EmptyStateCard variant="error" message="Something went wrong" />,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('renders correctly when variant is not specified', () => {
    renderWithProviders(<EmptyStateCard message="Default state" />);
    expect(screen.getByText('Default state')).toBeTruthy();
  });

  // ---- Custom styles ----

  it('applies custom containerStyle', () => {
    const customStyle = { backgroundColor: 'red', padding: 20 };
    const { toJSON } = renderWithProviders(
      <EmptyStateCard message="Styled" containerStyle={customStyle} />,
    );
    const tree = toJSON() as any;
    const flatStyle = StyleSheet.flatten(tree.props.style);
    expect(flatStyle).toEqual(
      expect.objectContaining({ backgroundColor: 'red', padding: 20 }),
    );
  });

  it('preserves base container styles when containerStyle is provided', () => {
    const customStyle = { backgroundColor: 'yellow' };
    const { toJSON } = renderWithProviders(
      <EmptyStateCard message="Merged" containerStyle={customStyle} />,
    );
    const tree = toJSON() as any;
    const flatStyle = StyleSheet.flatten(tree.props.style);
    expect(flatStyle).toEqual(
      expect.objectContaining({
        width: '100%',
        justifyContent: 'center',
        backgroundColor: 'yellow',
      }),
    );
  });

  it('applies custom messageStyle', () => {
    const customStyle = { color: 'blue', fontSize: 18 };
    renderWithProviders(
      <EmptyStateCard message="Custom text" messageStyle={customStyle} />,
    );
    const textElement = screen.getByText('Custom text');
    const flatStyle = StyleSheet.flatten(textElement.props.style);
    expect(flatStyle).toEqual(
      expect.objectContaining({ color: 'blue', fontSize: 18 }),
    );
  });

  // ---- Error with retry ----

  it('announces an error that can be retried as an alert with a Try Again button', () => {
    const onRetry = jest.fn();
    renderWithProviders(
      <EmptyStateCard
        message="Unable to load payment methods."
        onRetry={onRetry}
        retryLabel="Try loading payment methods again"
        variant="error"
      />,
    );

    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'alert' })).toBeTruthy();
    expect(screen.getByText('Unable to load payment methods.')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Try loading payment methods again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps an error without a retry action as plain text', () => {
    renderWithProviders(<EmptyStateCard message="Something went wrong" variant="error" />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.queryByText('Try Again')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  // ---- Empty with an icon ----

  it('explains an empty section with a title and description when it has an icon', () => {
    renderWithProviders(
      <EmptyStateCard
        icon="credit-card"
        message="Cards you save for paying bills will appear here."
        title="No payment methods yet"
      />,
    );

    expect(screen.getByText('No payment methods yet')).toBeTruthy();
    expect(screen.getByText('Cards you save for paying bills will appear here.')).toBeTruthy();
  });

  it('shows just the description when an icon card has no title', () => {
    renderWithProviders(<EmptyStateCard icon="clock" message="Nothing here yet." />);

    expect(screen.getByText('Nothing here yet.')).toBeTruthy();
  });

  it('ignores the title when there is no icon, keeping the plain message', () => {
    renderWithProviders(<EmptyStateCard message="Plain message" title="Ignored title" />);

    expect(screen.getByText('Plain message')).toBeTruthy();
    expect(screen.queryByText('Ignored title')).toBeNull();
  });

  // ---- Edge cases ----

  it('renders with only the required message prop', () => {
    renderWithProviders(<EmptyStateCard message="Minimal" />);
    expect(screen.getByText('Minimal')).toBeTruthy();
  });

  it('renders without crashing when message is an empty string', () => {
    const { toJSON } = renderWithProviders(<EmptyStateCard message="" />);
    expect(toJSON()).toBeTruthy();
  });
});
