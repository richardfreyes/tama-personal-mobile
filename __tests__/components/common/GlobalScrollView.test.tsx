import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { GlobalScrollView } from '../../../components/common/GlobalScrollView';
import { TabBarAnimationProvider } from '../../../context/TabBarAnimationContext';
import { renderWithProviders } from '../../../utils/test-utils';

const mockTabBarTranslateY = { value: 0 };
const mockTabBarHeight = { value: 50 };
const mockKeyboardHeight = { value: 0 };

jest.mock('@/context/TabBarAnimationContext', () => ({
  TabBarAnimationProvider: ({ children }: any) => children,
  useTabBarAnimation: () => ({
    tabBarTranslateY: mockTabBarTranslateY,
    tabBarHeight: mockTabBarHeight,
  }),
}));

jest.mock('react-native-reanimated', () => {
  const { ScrollView } = require('react-native');
  return {
    __esModule: true,
    default: { ScrollView },
    runOnJS: (callback: any) => callback,
    useAnimatedKeyboard: () => ({ height: mockKeyboardHeight }),
    useAnimatedScrollHandler: ({ onScroll }: any) => (
      ({ nativeEvent }: any) => onScroll(nativeEvent)
    ),
    useSharedValue: (value: any) => ({ value }),
    withTiming: (value: any) => value,
  };
});

function renderGSV(
  props: Record<string, any> = {},
  children?: React.ReactNode,
) {
  return renderWithProviders(
    <TabBarAnimationProvider>
      <GlobalScrollView {...(props as any)}>
        {children ?? <Text>Scroll Content</Text>}
      </GlobalScrollView>
    </TabBarAnimationProvider>,
  );
}

describe('GlobalScrollView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTabBarTranslateY.value = 0;
    mockTabBarHeight.value = 50;
    mockKeyboardHeight.value = 0;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---- Rendering ----

  it('renders without crashing', () => {
    const { toJSON } = renderGSV();
    expect(toJSON()).toBeTruthy();
  });

  it('renders its children', () => {
    renderGSV({}, <Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('renders multiple children', () => {
    renderGSV(
      {},
      <>
        <Text>First</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </>,
    );
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.getByText('Second')).toBeTruthy();
    expect(screen.getByText('Third')).toBeTruthy();
  });

  it('renders complex nested children', () => {
    renderGSV(
      {},
      <View>
        <View>
          <Text>Nested Content</Text>
        </View>
      </View>,
    );
    expect(screen.getByText('Nested Content')).toBeTruthy();
  });

  // ---- ScrollView props pass-through ----

  it('passes through contentContainerStyle', () => {
    const style = { padding: 20, backgroundColor: 'red' };
    renderGSV({ contentContainerStyle: style });
    // The Animated.ScrollView (mocked as plain ScrollView) receives the prop
    const scrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    expect(scrollView.props.contentContainerStyle).toEqual(style);
  });

  it('passes through horizontal prop', () => {
    renderGSV({ horizontal: true });
    const scrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    expect(scrollView.props.horizontal).toBe(true);
  });

  it('passes through showsVerticalScrollIndicator prop', () => {
    renderGSV({ showsVerticalScrollIndicator: false });
    const scrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
  });

  it('passes through testID prop', () => {
    renderGSV({ testID: 'my-scroll-view' });
    expect(screen.getByTestId('my-scroll-view')).toBeTruthy();
  });

  it('sets scrollEventThrottle to 16', () => {
    renderGSV();
    const scrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    expect(scrollView.props.scrollEventThrottle).toBe(16);
  });

  // ---- onScroll callback ----

  it('attaches an onScroll handler to the ScrollView', () => {
    renderGSV();
    const scrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    expect(scrollView.props.onScroll).toBeDefined();
  });

  it('does not crash when scrolling without an onScroll prop', () => {
    renderGSV();
    const scrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    expect(() => {
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 100, x: 0 },
          contentSize: { height: 1000, width: 390 },
          layoutMeasurement: { height: 800, width: 390 },
        },
      });
    }).not.toThrow();
  });

  it('forwards scroll events and hides the tab bar while scrolling down', () => {
    const onScroll = jest.fn();
    renderGSV({ onScroll });
    const scrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 100, x: 0 },
        contentSize: { height: 1000, width: 390 },
        layoutMeasurement: { height: 500, width: 390 },
      },
    });
    expect(mockTabBarTranslateY.value).toBe(200);
    expect(onScroll).toHaveBeenCalledWith({
      nativeEvent: {
        contentOffset: { y: 100, x: 0 },
        contentSize: { height: 1000, width: 390 },
        layoutMeasurement: { height: 500, width: 390 },
      },
    });
  });

  it('reveals the tab bar while scrolling up away from the bottom', () => {
    renderGSV();
    const scrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 100, x: 0 },
        contentSize: { height: 1000, width: 390 },
        layoutMeasurement: { height: 500, width: 390 },
      },
    });
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 20, x: 0 },
        contentSize: { height: 1000, width: 390 },
        layoutMeasurement: { height: 500, width: 390 },
      },
    });
    expect(mockTabBarTranslateY.value).toBe(0);
  });

  it('keeps the tab bar visible and suppresses forwarded scrolling while the keyboard is open', () => {
    const onScroll = jest.fn();
    mockKeyboardHeight.value = 250;
    mockTabBarTranslateY.value = 200;
    renderGSV({ onScroll });
    const scrollView = screen.UNSAFE_getAllByType(ScrollView)[0];
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 100, x: 0 },
        contentSize: { height: 1000, width: 390 },
        layoutMeasurement: { height: 500, width: 390 },
      },
    });
    expect(mockTabBarTranslateY.value).toBe(0);
    expect(onScroll).not.toHaveBeenCalled();
  });

  // ---- Edge cases ----

  it('renders with no extra props', () => {
    const { toJSON } = renderGSV();
    expect(toJSON()).toBeTruthy();
  });

  it('renders with empty children', () => {
    const { toJSON } = renderGSV({}, <></>);
    expect(toJSON()).toBeTruthy();
  });
});
