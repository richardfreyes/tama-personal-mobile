import { describe, expect, it, jest } from '@jest/globals';
import PrivacyScreen from '@/app/(app)/settings/privacy';
import RefundPolicyScreen from '@/app/(app)/settings/refund-policy';
import TermsScreen from '@/app/(app)/settings/terms';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/components/settings/LegalDocumentScreen', () => (
  ({ title, content }: any) => {
    const { Text } = require('react-native');
    return <Text>{`${title}|${content.slice(0, 20)}`}</Text>;
  }
));

describe('legal document routes', () => {
  it.each([
    [PrivacyScreen, 'Privacy Policy'],
    [RefundPolicyScreen, 'Refund and Chargeback Policy'],
    [TermsScreen, 'Terms & Conditions'],
  ])('passes the correct title for %s', (Screen, title) => {
    render(<Screen />);
    expect(screen.getByText(new RegExp(`^${title.replace(/[&]/g, '\\&')}\\|`))).toBeTruthy();
  });
});
