
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  const SafeAreaInsetsContext = React.createContext(insets);
  const SafeAreaFrameContext = React.createContext(frame);

  return {
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    SafeAreaProvider: ({ children }) => React.createElement(
      SafeAreaInsetsContext.Provider,
      { value: insets },
      React.createElement(
        SafeAreaFrameContext.Provider,
        { value: frame },
        React.createElement(View, null, children),
      ),
    ),
    SafeAreaView: View,
    initialWindowMetrics: { insets, frame },
    useSafeAreaInsets: jest.fn(() => insets),
    useSafeAreaFrame: jest.fn(() => frame),
  };
});

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/'),
  useSegments: jest.fn(() => []),
  useFocusEffect: jest.fn((callback) => {
    const React = require('react');
    React.useEffect(() => {
      const cleanup = callback();
      return typeof cleanup === 'function' ? cleanup : undefined;
    }, [callback]);
  }),
}));

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const View = require('react-native/Libraries/Components/View/View');

  const makeGesture = () => {
    const gesture = { handlers: {} };
    ['onStart', 'onUpdate', 'onEnd', 'onFinalize'].forEach((name) => {
      gesture[name] = (handler) => {
        gesture.handlers[name] = handler;
        return gesture;
      };
    });
    ['activateAfterLongPress', 'minDistance', 'enabled'].forEach((name) => {
      gesture[name] = () => gesture;
    });
    return gesture;
  };

  return {
    Gesture: { Pan: makeGesture, Tap: makeGesture },
    GestureDetector: function GestureDetector({ children, gesture }) {
      return React.cloneElement(React.Children.only(children), { gesture });
    },
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

const ExpoConstants = require('expo-constants').default;
ExpoConstants.linkingUri = 'personaldashboardmob://';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};

  const createSharedValue = Reanimated.useSharedValue;
  Reanimated.useSharedValue = (initial) => require('react').useRef(createSharedValue(initial)).current;
  Reanimated.useAnimatedRef = jest.fn(() => {
    const ref = (node) => {
      ref.current = node;
      return node;
    };
    ref.current = null;
    return ref;
  });
  Reanimated.useFrameCallback = jest.fn(() => ({
    setActive: jest.fn(),
    isActive: false,
    callbackId: -1,
  }));
  return Reanimated;
});

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Circle: 'Circle',
  Rect: 'Rect',
  Path: 'Path',
  G: 'G',
}));

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    LinearGradient: React.forwardRef((props, ref) => (
      React.createElement(View, { ...props, ref })
    )),
  };
});
