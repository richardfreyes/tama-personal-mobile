import { describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import SnackbarComponent from '../../../components/layout/SnackBar';
import { renderWithProviders } from '../../../utils/test-utils';

jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View } = require('react-native');
  const actual = jest.requireActual('react-native-paper') as Record<string, unknown>;

  return {
    ...actual,
    Portal: ({ children }: any) => React.createElement(View, { testID: 'snackbar-overlay' }, children),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 44, bottom: 34, left: 0, right: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  const InsetsContext = React.createContext(insets);
  const FrameContext = React.createContext(frame);

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => (
      <InsetsContext.Provider value={insets}>
        <FrameContext.Provider value={frame}>{children}</FrameContext.Provider>
      </InsetsContext.Provider>
    ),
    SafeAreaInsetsContext: InsetsContext,
    SafeAreaFrameContext: FrameContext,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets, frame },
  };
});

function renderSnackbar(props: Record<string, any> = {}) {
  return renderWithProviders(
    <PaperProvider>
      <SnackbarComponent
        visible
        onDismiss={jest.fn()}
        message="Saved successfully"
        {...(props as any)}
      />
    </PaperProvider>,
  );
}

describe('SnackbarComponent', () => {
  // ---- Visibility ----

  it('renders the message when visible', () => {
    renderSnackbar();
    expect(screen.getByText('Saved successfully')).toBeTruthy();
  });

  it('renders inside a enrollment so it appears above sticky headers', () => {
    renderSnackbar();
    expect(screen.getByTestId('snackbar-overlay')).toBeTruthy();
  });

  it('does not render the message when not visible', () => {
    renderSnackbar({ visible: false });
    expect(screen.queryByText('Saved successfully')).toBeNull();
  });

  // ---- Variants ----

  it('renders the message for the success variant', () => {
    renderSnackbar({ variant: 'success', message: 'All good' });
    expect(screen.getByText('All good')).toBeTruthy();
  });

  it('renders the message for the error variant', () => {
    renderSnackbar({ variant: 'error', message: 'Something failed' });
    expect(screen.getByText('Something failed')).toBeTruthy();
  });

  // ---- Edge cases ----

  it('renders an empty message without crashing', () => {
    const { toJSON } = renderSnackbar({ message: '' });
    expect(toJSON()).toBeTruthy();
  });
});
