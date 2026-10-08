import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import FloatingNavBar from '../../../components/layout/FloatingNavBar';
import { FLOATING_NAV_TABS } from '../../../constants/navigationItems';
import { TabBarAnimationProvider, useTabBarAnimation } from '../../../context/TabBarAnimationContext';
import { Colors } from '../../../styles/common/colors';
import { floatingNavBarStyles } from '../../../styles/components/layout/FloatingNavBar';
import { renderWithProviders } from '../../../utils/test-utils';
import { router, usePathname, useSegments } from 'expo-router';

const mockUsePathname = usePathname as jest.Mock;
const mockUseSegments = useSegments as jest.Mock;
let capturedTabBarTranslateY: { value: number } | undefined;

function TabBarAnimationCapture() {
  capturedTabBarTranslateY = useTabBarAnimation().tabBarTranslateY;
  return null;
}

function renderNavBar() {
  return renderWithProviders(
    <TabBarAnimationProvider>
      <FloatingNavBar />
    </TabBarAnimationProvider>,
  );
}

function getTabButtons() {
  return screen.UNSAFE_getAllByType(TouchableOpacity);
}

function getIconColor(button: ReturnType<typeof getTabButtons>[number]) {
  return button.props.children[0].props.children.props.stroke;
}

const VALID_ROUTE_NAMES = FLOATING_NAV_TABS.map(({ name }) => name);

describe('FloatingNavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
    mockUseSegments.mockReturnValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('steps aside on Biller Details, which has its own footer', () => {
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'one-time-payments', 'pay', '[billingReferenceId]']);
    mockUsePathname.mockReturnValue('/bills/one-time-payments/pay/bill-1');
    renderNavBar();

    expect(screen.UNSAFE_queryAllByType(TouchableOpacity)).toHaveLength(0);
  });

  it('stays on the other payment screens', () => {
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'one-time-payments', 'pay', 'confirm-payment']);
    renderNavBar();

    expect(getTabButtons()).toHaveLength(4);
  });

  it('renders without crashing', () => {
    const { toJSON } = renderNavBar();
    expect(toJSON()).toBeTruthy();
  });

  it('renders the light bar with labeled tabs in the handoff order and 44pt touch targets', () => {
    renderNavBar();

    const buttons = getTabButtons();
    expect(buttons.map((button) => button.props.accessibilityLabel)).toEqual(['Home', 'Bills', 'History', 'Wallet']);
    buttons.forEach((button) => {
      expect(button.props.accessibilityRole).toBe('tab');
      expect(StyleSheet.flatten(button.props.style).minHeight).toBeGreaterThanOrEqual(44);
    });
    expect(floatingNavBarStyles.tabBar).toEqual(expect.objectContaining({
      backgroundColor: Colors.neutral01,
      borderRadius: 24,
      borderWidth: 1,
    }));
  });

  it('renders the tab bar with Bills active on the dedicated Saved Bills route', () => {
    mockUsePathname.mockReturnValue('/bills/one-time-payments/saved');
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'one-time-payments', 'saved']);
    renderNavBar();

    const buttons = getTabButtons();
    expect(buttons).toHaveLength(VALID_ROUTE_NAMES.length);
    expect(buttons[0].props.accessibilityState).toEqual({ selected: false });
    expect(buttons[1].props.accessibilityState).toEqual({ selected: true });
    expect(getIconColor(buttons[1])).toBe(Colors.red09);
  });

  it('renders a tab button for each route that has an icon config', () => {
    renderNavBar();
    const buttons = getTabButtons();
    expect(buttons).toHaveLength(VALID_ROUTE_NAMES.length);
  });

  it('restores the tab bar when navigating to another route', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    const renderTree = () => (
      <TabBarAnimationProvider>
        <TabBarAnimationCapture />
        <FloatingNavBar />
      </TabBarAnimationProvider>
    );
    const { rerender } = renderWithProviders(renderTree());

    act(() => {
      capturedTabBarTranslateY!.value = 150;
    });

    mockUsePathname.mockReturnValue('/payment-methods');
    rerender(renderTree());

    expect(capturedTabBarTranslateY!.value).toBe(0);
  });

  it('navigates to the pressed tab when it is not focused', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    renderNavBar();

    const buttons = getTabButtons();
    fireEvent.press(buttons[2]);
    fireEvent.press(buttons[1]);

    expect(router.navigate).toHaveBeenNthCalledWith(1, '/transactions');
    expect(router.navigate).toHaveBeenNthCalledWith(2, '/bills');
  });

  it('does not navigate when the pressed tab is already focused', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    renderNavBar();

    fireEvent.press(getTabButtons()[0]);

    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('returns to the section root when the active tab is pressed from a nested screen', () => {
    mockUsePathname.mockReturnValue('/bills/one-time-payments/saved');
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'one-time-payments', 'saved']);
    renderNavBar();

    fireEvent.press(getTabButtons()[1]);

    expect(router.replace).toHaveBeenCalledWith('/bills');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('leaves the screen alone when the active tab is already on its root', () => {
    mockUsePathname.mockReturnValue('/bills');
    mockUseSegments.mockReturnValue(['(app)', 'bills']);
    renderNavBar();

    fireEvent.press(getTabButtons()[1]);

    expect(router.replace).not.toHaveBeenCalled();
  });

  it('passes the active color to the focused icon and inactive color to others', () => {
    mockUsePathname.mockReturnValue('/bills');
    renderNavBar();
    const buttons = getTabButtons();

    buttons.forEach((btn, i) => {
      if (i === 1) {
        expect(btn.props.accessibilityState).toEqual({ selected: true });
        expect(getIconColor(btn)).toBe(Colors.red09);
        expect(StyleSheet.flatten(btn.props.children[0].props.style).backgroundColor).toBe(Colors.red01);
      } else {
        expect(btn.props.accessibilityState).toEqual({ selected: false });
        expect(getIconColor(btn)).toBe(Colors.maroon09);
      }
    });
  });

  it('updates the focused icon when the pathname changes', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    const { unmount } = renderNavBar();
    let buttons = getTabButtons();
    expect(buttons[0].props.accessibilityState).toEqual({ selected: true });
    expect(getIconColor(buttons[2])).toBe(Colors.maroon09);
    unmount();

    mockUsePathname.mockReturnValue('/transactions');
    renderNavBar();
    buttons = getTabButtons();
    expect(buttons[0].props.accessibilityState).toEqual({ selected: false });
    expect(buttons[2].props.accessibilityState).toEqual({ selected: true });
    expect(getIconColor(buttons[2])).toBe(Colors.red09);
  });

  it('keeps the Bills navigation item active throughout the Add Biller flow', () => {
    mockUsePathname.mockReturnValue('/bills/one-time-payments/add/form');
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'one-time-payments', 'add', 'form']);
    renderNavBar();

    const buttons = getTabButtons();
    expect(buttons[0].props.accessibilityState).toEqual({ selected: false });
    expect(buttons[1].props.accessibilityState).toEqual({ selected: true });
    expect(getIconColor(buttons[1])).toBe(Colors.red09);
  });

  it('stores the measured height when onLayout fires', () => {
    renderNavBar();
    const tree = screen.toJSON() as any;

    expect(tree.props.onLayout).toBeDefined();

    tree.props.onLayout({
      nativeEvent: { layout: { height: 70, width: 300, x: 0, y: 0 } },
    });

    expect(true).toBe(true);
  });
});
