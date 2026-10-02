import { useTabBarAnimation } from '@/context/TabBarAnimationContext';
import { GlobalScrollViewProps } from '@/types/common';
import React from 'react';
import Animated, { runOnJS, useAnimatedKeyboard, useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';

export const useTabBarScrollHandler = (onScroll?: GlobalScrollViewProps['onScroll']) => {
  const { tabBarTranslateY, tabBarHeight } = useTabBarAnimation();
  const lastContentOffset = useSharedValue(0);
  const keyboard = useAnimatedKeyboard();

  return useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffset = event.contentOffset.y;
      const diff = currentOffset - lastContentOffset.value;
      const isAtBottom = event.layoutMeasurement.height + currentOffset >= event.contentSize.height - 50;

      if (keyboard.height.value > 0) {
        tabBarTranslateY.value = withTiming(0, { duration: 150 });
        return;
      }

      if (diff > 0 && currentOffset > 50) {
        if (tabBarHeight.value > 0) {
          tabBarTranslateY.value = withTiming(tabBarHeight.value + 150, { duration: 300 });
        }
      } else if (diff < 0 && !isAtBottom) {
        tabBarTranslateY.value = withTiming(0, { duration: 300 });
      }

      lastContentOffset.value = currentOffset;
      if (onScroll) {
        runOnJS(onScroll)({
          nativeEvent: event,
        } as any);
      }
    },
  });
};

export const GlobalScrollView: React.FC<GlobalScrollViewProps> = ({ children, onScroll, ...props }) => {
  const scrollHandler = useTabBarScrollHandler(onScroll);

  return (
    <Animated.ScrollView
      {...props}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {children}
    </Animated.ScrollView>
  );
};
