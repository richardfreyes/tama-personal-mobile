import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import EmptyStateCard from '../../../components/common/EmptyStateCard';
import { Colors } from '../../../styles/common/colors';
import { renderWithProviders } from '../../../utils/test-utils';

describe('EmptyStateCard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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

  it('renders with only the required message prop', () => {
    renderWithProviders(<EmptyStateCard message="Minimal" />);
    expect(screen.getByText('Minimal')).toBeTruthy();
  });

  it('renders without crashing when message is an empty string', () => {
    const { toJSON } = renderWithProviders(<EmptyStateCard message="" />);
    expect(toJSON()).toBeTruthy();
  });

  describe('dashed appearance', () => {
    it('is an outlined row with a title and description', () => {
      renderWithProviders(
        <EmptyStateCard
          appearance="dashed"
          icon="bookmark"
          message="Billers you save will appear here for one-tap payments."
          title="No saved billers yet"
        />,
      );

      expect(screen.getByText('No saved billers yet')).toBeTruthy();
      expect(screen.getByText('Billers you save will appear here for one-tap payments.')).toBeTruthy();
    });

    it('draws a dashed 1.5pt outline in the muted colour', () => {
      const { toJSON } = renderWithProviders(
        <EmptyStateCard appearance="dashed" icon="bookmark" message="Nothing here." title="Empty" />,
      );
      const root = (toJSON() as any);
      const style = StyleSheet.flatten(root.props.style);

      expect(style).toEqual(expect.objectContaining({
        borderColor: Colors.outlineMuted,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1.5,
        padding: 18,
      }));
    });
  });

  describe('centered appearance', () => {
    it('stacks the title and message and offers one action', () => {
      const onAction = jest.fn();
      renderWithProviders(
        <EmptyStateCard
          actionLabel="Clear Search"
          appearance="centered"
          icon="search"
          message="Nothing matches “Vertis North”."
          onAction={onAction}
          title="No billers found"
        />,
      );

      expect(screen.getByText('No billers found')).toBeTruthy();
      expect(screen.getByText('Nothing matches “Vertis North”.')).toBeTruthy();
      fireEvent.press(screen.getByRole('button', { name: 'Clear Search' }));
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('has no button without an action', () => {
      renderWithProviders(<EmptyStateCard appearance="centered" icon="search" message="Nothing." title="Empty" />);
      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  it('keeps the solid card when there is no icon, whatever the appearance', () => {
    renderWithProviders(<EmptyStateCard appearance="dashed" message="Plain message" />);
    expect(screen.getByText('Plain message')).toBeTruthy();
  });
});
