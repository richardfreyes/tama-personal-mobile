import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
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
