import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import FullScreenModal from '../../../components/layout/FullScreenModal';
import { renderWithProviders } from '../../../utils/test-utils';

// NOTE: 3 FAIL NEED TO REVISIT 17 PASSED 3 FAILED

const SafeAreaContext = React.createContext({
  top: 44,
  bottom: 34,
  left: 0,
  right: 0,
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

const DEFAULT_PROPS = {
  type: 'cancelAutopay' as const,
  isVisible: true,
  onClose: jest.fn(),
  title: 'Cancel Autopay',
  onAction: jest.fn(),
};

function renderModal(overrides: Record<string, any> = {}) {
  return renderWithProviders(
    <PaperProvider>
      <FullScreenModal {...DEFAULT_PROPS} {...(overrides as any)} />
    </PaperProvider>,
  );
}

describe('FullScreenModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---- Rendering when visible ----

  it('renders the title text', () => {
    renderModal();
    expect(screen.getByText('Cancel Autopay')).toBeTruthy();
  });

  it('renders the autopay cancellation description', () => {
    renderModal();
    expect(
      screen.getByText(/Autopay covers the entire month.*lose access/),
    ).toBeTruthy();
  });

  it('renders the invoice details', () => {
    renderModal();
    expect(screen.getByText('QW-I-SXYTXYIB')).toBeTruthy();
    expect(screen.getByText('PHP 4,000.00')).toBeTruthy();
    expect(screen.getByText('October 23, 2025')).toBeTruthy();
  });

  it('renders the cancellation confirmation instruction', () => {
    renderModal();
    expect(screen.getByText('"cancel invoice"')).toBeTruthy();
  });

  it('renders the Back button', () => {
    renderModal();
    expect(screen.getByText('Back')).toBeTruthy();
  });

  it('renders the Confirm button', () => {
    renderModal();
    expect(screen.getByText(/Confirm/)).toBeTruthy();
  });

  it('renders the Reason for Cancellation text input', () => {
    renderModal();
    // react-native-paper TextInput renders the label in multiple nodes
    expect(screen.getAllByText('Reason for Cancellation').length).toBeGreaterThanOrEqual(1);
  });

  // ---- Visibility ----

  it('renders content when isVisible is true', () => {
    renderModal({ isVisible: true });
    expect(screen.getByText('Cancel Autopay')).toBeTruthy();
  });

  it('does not render content when isVisible is false', () => {
    renderModal({ isVisible: false });
    expect(screen.queryByText('Cancel Autopay')).toBeNull();
  });

  // ---- Callbacks ----

  it('calls onClose when the Back button is pressed', () => {
    renderModal();
    fireEvent.press(screen.getByText('Back'));
    expect(DEFAULT_PROPS.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing the overlay via onPressOut', () => {
    renderModal();
    const overlays = screen.UNSAFE_getAllByType(
      require('react-native').TouchableOpacity,
    );
    // The first TouchableOpacity is the full-screen overlay with onPressOut
    const overlay = overlays[0];
    fireEvent(overlay, 'pressOut');
    expect(DEFAULT_PROPS.onClose).toHaveBeenCalledTimes(1);
  });

  // ---- Type-based icon ----

  it('renders an icon for cancelAutopay type', () => {
    const { toJSON } = renderModal({ type: 'cancelAutopay' });
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('SvgMock');
  });

  it('renders an icon for cancelEnrollment type', () => {
    const { toJSON } = renderModal({ type: 'cancelEnrollment' });
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('SvgMock');
  });

  // ---- Title variations ----

  it('renders a custom title', () => {
    renderModal({ title: 'Cancel Enrollment' });
    expect(screen.getByText('Cancel Enrollment')).toBeTruthy();
  });

  it('renders with an empty title without crashing', () => {
    const { toJSON } = renderModal({ title: '' });
    expect(toJSON()).toBeTruthy();
  });

  // ---- Optional props ----

  it('renders without onAction prop without crashing', () => {
    const { toJSON } = renderModal({ onAction: undefined });
    expect(toJSON()).toBeTruthy();
  });

  it('renders without headerActionText prop without crashing', () => {
    const { toJSON } = renderModal({ headerActionText: undefined });
    expect(toJSON()).toBeTruthy();
  });

  // ---- Edge cases ----

  it('renders without crashing with all required props', () => {
    const { toJSON } = renderModal();
    expect(toJSON()).toBeTruthy();
  });
});
