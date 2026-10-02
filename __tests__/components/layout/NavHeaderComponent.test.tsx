import { renderWithProviders } from '@/utils/test-utils';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import NavHeaderComponent from '../../../components/layout/NavHeaderComponent';
import { navHeaderComponentStyles } from '../../../styles/components/layout/NavHeaderComponent';

let mockIsFocused = true;

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockIsFocused,
}));

jest.mock('react-native-paper', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const actual = jest.requireActual('react-native-paper') as Record<string, unknown>;

  return {
    ...actual,
    Portal: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// expo-router is globally mocked in jest.setup.js but missing navigate/canGoBack
const mockRouter = router as jest.Mocked<typeof router> & {
  navigate: jest.Mock;
  canGoBack: jest.Mock;
};

beforeEach(() => {
  mockIsFocused = true;
  (mockRouter as any).navigate = jest.fn();
  (mockRouter as any).canGoBack = jest.fn().mockReturnValue(false);
});

const renderNavHeader = (component: React.ReactElement) => renderWithProviders(component);

describe('NavHeaderComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Basic rendering ----

  it('renders the title', () => {
    renderNavHeader(<NavHeaderComponent title="Settings" />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders the back button', () => {
    renderNavHeader(<NavHeaderComponent title="Settings" />);
    expect(screen.getByLabelText('Go back')).toBeTruthy();
  });

  it('renders the sticky header shell and layout spacer', () => {
    renderNavHeader(<NavHeaderComponent title="Settings" />);
    expect(screen.getByTestId('nav-header-spacer')).toBeTruthy();
    expect(screen.getByTestId('sticky-nav-header')).toBeTruthy();
  });

  it('does not render the sticky enrollment header when the route is not focused', () => {
    mockIsFocused = false;
    renderNavHeader(<NavHeaderComponent title="Fill Out Details" />);
    expect(screen.getByTestId('nav-header-spacer')).toBeTruthy();
    expect(screen.queryByTestId('sticky-nav-header')).toBeNull();
    expect(screen.queryByText('Fill Out Details')).toBeNull();
  });

  it('starts with no sticky header shadow', () => {
    const overlayStyle = StyleSheet.flatten(navHeaderComponentStyles.stickyHeaderOverlay);
    expect(overlayStyle.elevation).toBe(0);
    expect(overlayStyle.shadowOpacity).toBe(0);
    expect(overlayStyle.shadowRadius).toBe(0);
  });

  it('renders without a title', () => {
    const { toJSON } = renderNavHeader(<NavHeaderComponent />);
    expect(toJSON()).toBeTruthy();
  });

  // ---- Logo ----

  it('renders logo when logo prop is true', () => {
    const { toJSON } = renderNavHeader(<NavHeaderComponent title="Home" logo={true} />);
    const json = JSON.stringify(toJSON());
    // SVG mock renders as "SvgMock" string, logo adds an extra wrapper View with marginRight
    expect(json).toContain('"marginRight":8');
  });

  it('does not render logo when logo prop is false', () => {
    const { toJSON } = renderNavHeader(<NavHeaderComponent title="Home" logo={false} />);
    const json = JSON.stringify(toJSON());
    expect(json).not.toContain('"marginRight":8');
  });

  // ---- Back button behavior ----

  it('calls onBackPress when provided', () => {
    const onBackPress = jest.fn<() => void>();
    renderNavHeader(<NavHeaderComponent title="Page" onBackPress={onBackPress} />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(onBackPress).toHaveBeenCalledTimes(1);
    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('calls router.back (history) when canGoBack is true and no onBackPress', () => {
    mockRouter.canGoBack.mockReturnValue(true);
    renderNavHeader(<NavHeaderComponent title="Page" />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('replaces to the app root guard as fallback when history is empty', () => {
    mockRouter.canGoBack.mockReturnValue(false);
    renderNavHeader(<NavHeaderComponent title="Page" />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it('prioritizes onBackPress over history navigation', () => {
    mockRouter.canGoBack.mockReturnValue(true);
    const onBackPress = jest.fn<() => void>();
    renderNavHeader(<NavHeaderComponent title="Page" onBackPress={onBackPress} />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(onBackPress).toHaveBeenCalledTimes(1);
    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  // ---- Right nav ----

  it('renders right nav button when rightNav is provided', () => {
    const onPress = jest.fn<() => void>();
    renderNavHeader(
      <NavHeaderComponent title="Page" rightNav={{ iconType: 'more', onPress }} />,
    );
    expect(screen.getByLabelText('More options')).toBeTruthy();
  });

  it('calls rightNav.onPress when right nav button is pressed', () => {
    const onPress = jest.fn<() => void>();
    renderNavHeader(
      <NavHeaderComponent title="Page" rightNav={{ iconType: 'delete', onPress }} />,
    );
    fireEvent.press(screen.getByLabelText('Delete'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders right spacer when rightNav is not provided', () => {
    const { toJSON } = renderNavHeader(<NavHeaderComponent title="Page" />);
    expect(screen.queryByLabelText('More options')).toBeNull();
    expect(toJSON()).toBeTruthy();
  });
});
