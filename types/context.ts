import type { SharedValue } from 'react-native-reanimated';

export interface TabBarAnimationContextType {
  tabBarTranslateY: SharedValue<number>;
  tabBarHeight: SharedValue<number>;
}
