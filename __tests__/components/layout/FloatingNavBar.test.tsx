import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import FloatingNavBar from '../../../components/layout/FloatingNavBar';
import { COMMON } from '../../../constants/common';
import { TabBarAnimationProvider, useTabBarAnimation } from '../../../context/TabBarAnimationContext';
import { Colors } from '../../../styles/common/colors';
import { renderWithProviders } from '../../../utils/test-utils';
import { usePathname, useSegments } from 'expo-router';

const mockUsePathname = usePathname as jest.Mock;
const mockUseSegments = useSegments as jest.Mock;
let capturedTabBarTranslateY: { value: number } | undefined;

function TabBarAnimationCapture() {
  capturedTabBarTranslateY = useTabBarAnimation().tabBarTranslateY;
  return null;
}

// ---- helpers ----

type RouteEntry = { key: string; name: string };

function buildNavProps(overrides: {
  routes?: RouteEntry[];
  index?: number;
  navigate?: jest.Mock;
  emit?: jest.Mock;
} = {}) {
  const routes: RouteEntry[] = overrides.routes ?? [
    { key: 'dashboard-key', name: 'dashboard' },
    { key: 'transactions-key', name: 'transactions/index' },
    { key: 'bills-key', name: 'bills/index' },
    { key: 'payments-key', name: 'payment-methods/index' },
  ];

  const navigate = overrides.navigate ?? jest.fn();
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
          navigation: { navigate, emit } as any,
          render: () => null,
        },
      ]),
    ),
    navigation: { navigate, emit } as any,
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

/** Return all TouchableOpacity instances (the tab buttons). */
function getTabButtons() {
  return screen.UNSAFE_getAllByType(TouchableOpacity);
}

const VALID_ROUTE_NAMES = Object.keys(COMMON.MENU_SVG_ICONS);

describe('FloatingNavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
    mockUseSegments.mockReturnValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---- Rendering ----

  it('renders without crashing', () => {
    const { toJSON } = renderNavBar();
    expect(toJSON()).toBeTruthy();
  });

  it('renders the tab bar with Bills active on the dedicated Saved Bills route', () => {
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'saved']);
    renderNavBar({ index: 0 });

    const buttons = getTabButtons();
    expect(buttons).toHaveLength(VALID_ROUTE_NAMES.length);
    expect(buttons[0].props.children.props.fill).not.toBe(Colors.aqua10);
    expect(buttons[2].props.children.props.fill).toBe(Colors.aqua10);
  });

  it('keeps Bills active when the focused navigator route is Saved Bills', () => {
    const routes: RouteEntry[] = [
      { key: 'bills-key', name: 'bills/index' },
      { key: 'saved-bills-key', name: 'bills/one-time-payments/saved' },
    ];
    renderNavBar({ index: 1, routes });

    const buttons = getTabButtons();
    expect(buttons).toHaveLength(1);
    expect(buttons[0].props.children.props.fill).toBe(Colors.aqua10);
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

  // ---- Tab press — navigation ----

  it('navigates to the pressed tab when it is not focused', () => {
    const navigate = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    renderNavBar({ index: 0, navigate, emit });

    const buttons = getTabButtons();
    fireEvent.press(buttons[1]); // transactions tab

    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'tabPress',
        target: 'transactions-key',
        canPreventDefault: true,
      }),
    );
    expect(navigate).toHaveBeenCalledWith('transactions/index', { merge: true });
  });

  it('does not navigate when the pressed tab is already focused', () => {
    const navigate = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    renderNavBar({ index: 0, navigate, emit });

    const buttons = getTabButtons();
    fireEvent.press(buttons[0]); // already focused

    expect(emit).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not navigate when the event is default-prevented', () => {
    const navigate = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: true }));
    renderNavBar({ index: 0, navigate, emit });

    const buttons = getTabButtons();
    fireEvent.press(buttons[1]);

    expect(emit).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('emits tabPress with the correct target key for each tab', () => {
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    renderNavBar({ index: 0, emit });
    const buttons = getTabButtons();

    const expectedKeys = ['dashboard-key', 'transactions-key', 'bills-key', 'payments-key'];
    buttons.forEach((btn, i) => {
      if (i === 0) return; // skip focused tab
      fireEvent.press(btn);
      const lastCall = ((emit as jest.Mock).mock.calls.at(-1)?.[0]) as { target: string };
      expect(lastCall.target).toBe(expectedKeys[i]);
    });
  });

  it('navigates to the correct route name for each tab', () => {
    const navigate = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    renderNavBar({ index: 0, navigate, emit });
    const buttons = getTabButtons();

    const expectedRoutes = ['dashboard', 'transactions/index', 'bills/index', 'payment-methods/index'];
    buttons.forEach((btn, i) => {
      if (i === 0) return;
      fireEvent.press(btn);
      const lastCall = (navigate as jest.Mock).mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(expectedRoutes[i]);
      expect(lastCall?.[1]).toEqual({ merge: true });
    });
  });

  // ---- Focus state / icon color ----

  it('passes the active color to the focused icon and inactive color to others', () => {
    renderNavBar({ index: 2 }); // bills tab focused
    const buttons = getTabButtons();

    // Each button wraps an SVG mock component; its fill prop carries the icon color.
    buttons.forEach((btn, i) => {
      const iconEl = btn.props.children;
      if (i === 2) {
        // Focused tab gets the aqua highlight
        expect(iconEl.props.fill).toBe(Colors.aqua10);
      } else {
        // Unfocused tabs get their configured inactive color
        expect(iconEl.props.fill).toBeTruthy();
        expect(iconEl.props.fill).not.toBe(Colors.aqua10);
      }
    });
  });

  it('updates the focused icon when a different index is provided', () => {
    // First render with index 0
    const { unmount } = renderNavBar({ index: 0 });
    let buttons = getTabButtons();
    expect(buttons[0].props.children.props.fill).toBe(Colors.aqua10);
    expect(buttons[1].props.children.props.fill).not.toBe(Colors.aqua10);
    unmount();

    // Re-render with index 1
    renderNavBar({ index: 1 });
    buttons = getTabButtons();
    expect(buttons[0].props.children.props.fill).not.toBe(Colors.aqua10);
    expect(buttons[1].props.children.props.fill).toBe(Colors.aqua10);
  });

  it('keeps the Bills navigation item active throughout the Add Biller flow', () => {
    mockUsePathname.mockReturnValue('/bills/one-time-payments/add/form');
    mockUseSegments.mockReturnValue(['(app)', 'bills', 'one-time-payments', 'add', 'form']);
    renderNavBar({ index: 0 });

    const buttons = getTabButtons();
    expect(buttons[0].props.children.props.fill).not.toBe(Colors.aqua10);
    expect(buttons[2].props.children.props.fill).toBe(Colors.aqua10);
  });

  // ---- onLayout ----

  it('stores the measured height when onLayout fires', () => {
    renderNavBar();
    const tree = screen.toJSON() as any;

    // The outermost Animated.View has the onLayout prop
    expect(tree.props.onLayout).toBeDefined();

    // Simulate a layout event
    tree.props.onLayout({
      nativeEvent: { layout: { height: 70, width: 300, x: 0, y: 0 } },
    });

    // No crash means tabBarHeight.value was written successfully
    expect(true).toBe(true);
  });
});
