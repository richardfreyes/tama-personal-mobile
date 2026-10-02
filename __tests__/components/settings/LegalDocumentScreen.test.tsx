import { describe, expect, it, jest } from '@jest/globals';
import LegalDocumentScreen from '@/components/settings/LegalDocumentScreen';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View testID="legal-scroll">{children}</View>;
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{title}</Text>;
  }
));
jest.mock('@/components/settings/LegalDocumentContent', () => (
  ({ content }: any) => {
    const { Text } = require('react-native');
    return <Text>{content}</Text>;
  }
));

describe('LegalDocumentScreen', () => {
  it('composes navigation header and legal content', () => {
    render(
      <LegalDocumentScreen
        title="Privacy Policy"
        content="Updated July 2026"
      />,
    );
    expect(screen.getByTestId('legal-scroll')).toBeTruthy();
    expect(screen.getByText('Privacy Policy')).toBeTruthy();
    expect(screen.getByText('Updated July 2026')).toBeTruthy();
  });
});
