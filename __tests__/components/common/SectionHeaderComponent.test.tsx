import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { SectionHeaderComponent } from '../../../components/common/SectionHeaderComponent';
import { renderWithProviders } from '../../../utils/test-utils';

describe('SectionHeaderComponent', () => {

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

  it('shows a count badge beside the title when given a count', () => {
    renderWithProviders(<SectionHeaderComponent title="Saved billers" count={4} linkText="Manage" />);

    expect(screen.getByText('Saved billers')).toBeTruthy();
    expect(screen.getByTestId('section-header-count')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('shows a count of zero rather than hiding it', () => {
    renderWithProviders(<SectionHeaderComponent title="Saved billers" count={0} />);
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('has no badge without a count', () => {
    renderWithProviders(<SectionHeaderComponent title="Saved billers" linkText="Manage" />);
    expect(screen.queryByTestId('section-header-count')).toBeNull();
  });
});
