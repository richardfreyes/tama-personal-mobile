import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { PageState } from '../../../components/common/PageState';
import { renderWithProviders } from '../../../utils/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PageState', () => {
  // ---- Rendering ----

  it('renders the title and description', () => {
    renderWithProviders(
      <PageState title="Something went wrong" description="Please try again.">
        {null}
      </PageState>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Please try again.')).toBeTruthy();
  });

  it('renders the brand logo (mocked svg)', () => {
    const { toJSON } = renderWithProviders(
      <PageState title="Title" description="Desc">
        {null}
      </PageState>,
    );
    expect(JSON.stringify(toJSON())).toContain('SvgMock');
  });

  // ---- Children ----

  it('renders children passed to it', () => {
    renderWithProviders(
      <PageState title="Title" description="Desc">
        <Text>Custom action</Text>
      </PageState>,
    );
    expect(screen.getByText('Custom action')).toBeTruthy();
  });

  it('renders with null children without crashing', () => {
    const { toJSON } = renderWithProviders(
      <PageState title="Title" description="Desc">
        {null}
      </PageState>,
    );
    expect(toJSON()).toBeTruthy();
  });

  // ---- Edge cases ----

  it('renders very long description text', () => {
    const longText = 'word '.repeat(200).trim();
    renderWithProviders(
      <PageState title="Title" description={longText}>
        {null}
      </PageState>,
    );
    expect(screen.getByText(longText)).toBeTruthy();
  });
});
