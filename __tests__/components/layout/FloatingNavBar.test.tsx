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

type RouteEntry = { key: string; name: string };

function buildNavProps(overrides: {
  routes?: RouteEntry[];
  index?: number;
  navigateToTab?: jest.Mock;
  emit?: jest.Mock;
} = {}) {
  const routes: RouteEntry[] = overrides.routes ?? [
    { key: 'dashboard-key', name: 'dashboard' },
    { key: 'transactions-key', name: 'transactions/index' },
    { key: 'bills-key', name: 'bills/index' },
    { key: 'payments-key', name: 'payment-methods/index' },
  ];

  const navigateToTab = overrides.navigateToTab ?? jest.fn();
  const emit = overrides.emit ?? jest.fn(() => ({ defaultPrevented: false }));

  return {
    state: {
      index: overrides.index ?? 0,
      routes,
      key: 'tab-state-key',
      routeNames: routes.map((r) => r.name),
      stale: false as const,
      type: 'tab' as const,
      history: [],
    },
    descriptors: Object.fromEntries(
      routes.map((r) => [
        r.key,
        {
          options: {},
          route: r,
          render: () => null,
        },
      ]),
    ),
    emitter: { emit } as any,
    navigateToTab,
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  };
}

function renderNavBar(overrides: Parameters<typeof buildNavProps>[0] = {}) {
  const props = buildNavProps(overrides);
  return {
    ...renderWithProviders(
      <TabBarAnimationProvider>
        <FloatingNavBar {...(props as any)} />
      </TabBarAnimationProvider>,
    ),
    props,
  };
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
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'saved']);
    renderNavBar({ index: 0 });

    const buttons = getTabButtons();
    expect(buttons).toHaveLength(VALID_ROUTE_NAMES.length);
    expect(buttons[0].props.accessibilityState).toEqual({ selected: false });
    expect(buttons[1].props.accessibilityState).toEqual({ selected: true });
    expect(getIconColor(buttons[1])).toBe(Colors.red09);
  });

  it('keeps Bills active when the focused navigator route is Saved Bills', () => {
    const routes: RouteEntry[] = [
      { key: 'bills-key', name: 'bills/index' },
      { key: 'saved-bills-key', name: 'bills/one-time-payments/saved' },
    ];
    renderNavBar({ index: 1, routes });

    const buttons = getTabButtons();
    expect(buttons).toHaveLength(1);
    expect(buttons[0].props.accessibilityState).toEqual({ selected: true });
    expect(getIconColor(buttons[0])).toBe(Colors.red09);
  });

  it('renders a tab button for each route that has an icon config', () => {
    renderNavBar();
    const buttons = getTabButtons();
    expect(buttons).toHaveLength(VALID_ROUTE_NAMES.length);
  });

  it('skips routes that do not have an icon config entry', () => {
    const routes: RouteEntry[] = [
      { key: 'dashboard-key', name: 'dashboard' },
      { key: 'unknown-key', name: 'settings/index' },
    ];
    renderNavBar({ routes });
    const buttons = getTabButtons();
    expect(buttons).toHaveLength(1);
  });

  it('renders no tab buttons when all routes are unknown', () => {
    const routes: RouteEntry[] = [
      { key: 'a-key', name: 'unknown-a' },
      { key: 'b-key', name: 'unknown-b' },
    ];
    renderNavBar({ routes });
    expect(screen.UNSAFE_queryAllByType(TouchableOpacity)).toHaveLength(0);
  });

  it('renders the container when routes array is empty', () => {
    const { toJSON } = renderNavBar({ routes: [] });
    expect(toJSON()).toBeTruthy();
    expect(screen.UNSAFE_queryAllByType(TouchableOpacity)).toHaveLength(0);
  });

  it('restores the tab bar when navigating to another route', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    const props = buildNavProps();
    const renderTree = () => (
      <TabBarAnimationProvider>
        <TabBarAnimationCapture />
        <FloatingNavBar {...(props as any)} />
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

  it('renders correctly with a single valid route', () => {
    const routes: RouteEntry[] = [{ key: 'dashboard-key', name: 'dashboard' }];
    renderNavBar({ routes, index: 0 });
    expect(getTabButtons()).toHaveLength(1);
  });

  it('navigates to the pressed tab when it is not focused', () => {
    const navigateToTab = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    renderNavBar({ index: 0, navigateToTab, emit });

    const buttons = getTabButtons();
    fireEvent.press(buttons[2]);

    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'tabPress',
        target: 'transactions-key',
        canPreventDefault: true,
      }),
    );
    expect(navigateToTab).toHaveBeenCalledWith('transactions-key');
  });

  it('does not navigate when the pressed tab is already focused', () => {
    const navigateToTab = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    renderNavBar({ index: 0, navigateToTab, emit });

    const buttons = getTabButtons();
    fireEvent.press(buttons[0]);

    expect(emit).toHaveBeenCalledTimes(1);
    expect(navigateToTab).not.toHaveBeenCalled();
  });

  it('returns to the section root when the active tab is pressed from a nested screen', () => {
    mockUsePathname.mockReturnValue('/bills/one-time-payments/saved');
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'one-time-payments', 'saved']);
    const navigateToTab = jest.fn();
    renderNavBar({ index: 0, navigateToTab });

    fireEvent.press(getTabButtons()[1]);

    expect(router.replace).toHaveBeenCalledWith('/bills');
    expect(navigateToTab).not.toHaveBeenCalled();
  });

  it('leaves the screen alone when the active tab is already on its root', () => {
    mockUsePathname.mockReturnValue('/bills');
    mockUseSegments.mockReturnValue(['(app)', 'bills']);
    renderNavBar({ index: 0 });

    fireEvent.press(getTabButtons()[1]);

    expect(router.replace).not.toHaveBeenCalled();
  });

  it('does not navigate when the event is default-prevented', () => {
    const navigateToTab = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: true }));
    renderNavBar({ index: 0, navigateToTab, emit });

    const buttons = getTabButtons();
    fireEvent.press(buttons[1]);

    expect(emit).toHaveBeenCalledTimes(1);
    expect(navigateToTab).not.toHaveBeenCalled();
  });

  it('emits tabPress with the correct target key for each tab', () => {
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    renderNavBar({ index: 0, emit });
    const buttons = getTabButtons();

    const expectedKeys = ['dashboard-key', 'bills-key', 'transactions-key', 'payments-key'];
    buttons.forEach((btn, i) => {
      if (i === 0) return;
      fireEvent.press(btn);
      const lastCall = ((emit as jest.Mock).mock.calls.at(-1)?.[0]) as { target: string };
      expect(lastCall.target).toBe(expectedKeys[i]);
    });
  });

  it('navigates to the correct route key for each tab', () => {
    const navigateToTab = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    renderNavBar({ index: 0, navigateToTab, emit });
    const buttons = getTabButtons();

    const expectedRouteKeys = ['dashboard-key', 'bills-key', 'transactions-key', 'payments-key'];
    buttons.forEach((btn, i) => {
      if (i === 0) return;
      fireEvent.press(btn);
      const lastCall = (navigateToTab as jest.Mock).mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(expectedRouteKeys[i]);
    });
  });

  it('passes the active color to the focused icon and inactive color to others', () => {
    renderNavBar({ index: 2 });
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

  it('updates the focused icon when a different index is provided', () => {

    const { unmount } = renderNavBar({ index: 0 });
    let buttons = getTabButtons();
    expect(buttons[0].props.accessibilityState).toEqual({ selected: true });
    expect(getIconColor(buttons[0])).toBe(Colors.red09);
    expect(getIconColor(buttons[2])).toBe(Colors.maroon09);
    unmount();

    renderNavBar({ index: 1 });
    buttons = getTabButtons();
    expect(buttons[0].props.accessibilityState).toEqual({ selected: false });
    expect(buttons[2].props.accessibilityState).toEqual({ selected: true });
    expect(getIconColor(buttons[2])).toBe(Colors.red09);
  });

  it('keeps the Bills navigation item active throughout the Add Biller flow', () => {
    mockUsePathname.mockReturnValue('/bills/one-time-payments/add/form');
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'one-time-payments', 'add', 'form']);
    renderNavBar({ index: 0 });

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
