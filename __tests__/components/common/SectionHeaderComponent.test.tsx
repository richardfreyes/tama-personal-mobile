import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { SectionHeaderComponent } from '../../../components/common/SectionHeaderComponent';
import { renderWithProviders } from '../../../utils/test-utils';

describe('SectionHeaderComponent', () => {
  // ---- Rendering ----

  it('renders the title text', () => {
    renderWithProviders(
      <SectionHeaderComponent title="My Bills" linkText="View All" />,
    );
    expect(screen.getByText('My Bills')).toBeTruthy();
  });

  it('renders the link text', () => {
    renderWithProviders(
      <SectionHeaderComponent title="My Bills" linkText="View All" />,
    );
    expect(screen.getByText('View All')).toBeTruthy();
  });

  it('renders without a link when linkText is null', () => {
    renderWithProviders(
      <SectionHeaderComponent title="Payment Methods" linkText={null as any} />,
    );
    expect(screen.getByText('Payment Methods')).toBeTruthy();
    expect(screen.queryByText('View All')).toBeNull();
  });

  // ---- Interaction ----

  it('calls onViewAllPress when the link is pressed', () => {
    const onViewAllPress = jest.fn();
    renderWithProviders(
      <SectionHeaderComponent
        title="My Bills"
        linkText="View All"
        onViewAllPress={onViewAllPress}
      />,
    );
    fireEvent.press(screen.getByText('View All'));
    expect(onViewAllPress).toHaveBeenCalledTimes(1);
  });

  it('does not crash when pressed without an onViewAllPress handler', () => {
    renderWithProviders(
      <SectionHeaderComponent title="My Bills" linkText="View All" />,
    );
    expect(() => fireEvent.press(screen.getByText('View All'))).not.toThrow();
  });

  // ---- Link accessibility ----

  it('exposes the link as a button that says what it opens', () => {
    const onViewAllPress = jest.fn();
    renderWithProviders(
      <SectionHeaderComponent
        title="One Time Payments"
        linkText="View All"
        onViewAllPress={onViewAllPress}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'View All One Time Payments' }));
    expect(onViewAllPress).toHaveBeenCalledTimes(1);
  });

  it('labels the link with its own text when there is no title', () => {
    renderWithProviders(<SectionHeaderComponent linkText="View All" />);
    expect(screen.getByRole('button', { name: 'View All' })).toBeTruthy();
  });

  it('renders only the title when there is no link', () => {
    renderWithProviders(<SectionHeaderComponent title="Auto Debit" />);
    expect(screen.getByText('Auto Debit')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  // ---- Optional style props ----

  it('renders with custom style props without crashing', () => {
    const { toJSON } = renderWithProviders(
      <SectionHeaderComponent
        title="Styled"
        linkText="Link"
        titleStyle={{ color: 'red' }}
        linkStyle={{ color: 'blue' }}
        containerStyle={{ padding: 8 }}
      />,
    );
    expect(screen.getByText('Styled')).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });
});
