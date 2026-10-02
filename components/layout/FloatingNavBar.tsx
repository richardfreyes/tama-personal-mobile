import { COMMON } from '@/constants/common';
import { useTabBarAnimation } from '@/context/TabBarAnimationContext';
import { Colors } from '@/styles/common/colors';
import { floatingNavBarStyles as styles } from '@/styles/components/layout/FloatingNavBar';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, usePathname, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

const FloatingNavBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const pathname = usePathname();
  const segments = useSegments();
  const { tabBarTranslateY, tabBarHeight } = useTabBarAnimation();
  const keyboard = useAnimatedKeyboard();

  useEffect(() => {
    tabBarTranslateY.value = 0;
  }, [pathname, tabBarTranslateY]);

  const animatedStyle = useAnimatedStyle(() => {
    // Use the actual keyboard height from the animated hook. This avoids conflicts with
    // Android's native window resizing when the keyboard appears, preventing crashes.
    const effectiveTranslateY = tabBarTranslateY.value + keyboard.height.value;

    return {
      transform: [
        { translateY: effectiveTranslateY },
      ],
    };
  });

  const getSection = (name: string) => name.split('/')[0];

  const focusedRouteName = state.routes[state.index]?.name ?? '';
  const activeSection =
    pathname.split('/').find(Boolean)
    ?? segments.find((segment) => segment && !segment.startsWith('('))
    ?? getSection(focusedRouteName);

  return (
    <Animated.View
      style={[styles.tabBarContainer, animatedStyle]}
      onLayout={(event) => {
        // Measure the height of the tab bar and store it in the shared context value.
        // This ensures the scroll animation uses the correct height, preventing crashes.
        tabBarHeight.value = event.nativeEvent.layout.height;
      }}
    >
      <Animated.View style={[styles.tabBar]}>
        {state.routes.map((route) => {
          const iconConfig = COMMON.MENU_SVG_ICONS[route.name as keyof typeof COMMON.MENU_SVG_ICONS];
          if (!iconConfig || !iconConfig.Component) return null;
          const { Component, color: inactiveColor } = iconConfig;
          const isFocused = getSection(route.name) === activeSection;
          const iconColor = isFocused ? Colors.aqua10 : inactiveColor;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, { merge: true });
            } else if (isFocused && pathname !== `/${getSection(route.name)}` && !event.defaultPrevented) {
              router.replace(`/${getSection(route.name)}` as any);
            }
          };

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabButton} accessibilityRole="tab" accessibilityLabel={descriptors[route.key]?.options.title || getSection(route.name)} accessibilityState={{ selected: isFocused }} hitSlop={6}>
              <Component width={24} height={24} fill={iconColor} />
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

export default FloatingNavBar;
