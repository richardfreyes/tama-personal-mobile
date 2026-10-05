import { FLOATING_NAV_HIDDEN_ROUTES, FLOATING_NAV_TABS } from '@/constants';
import { AppText } from '@/components/common/AppText';
import { useTabBarAnimation } from '@/context/TabBarAnimationContext';
import { Colors } from '@/styles/common/colors';
import { floatingNavBarStyles as styles } from '@/styles/components/layout/FloatingNavBar';
import { router, usePathname, useSegments } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FloatingNavBar = ({ state, emitter, navigateToTab }: BottomTabBarProps) => {
  const pathname = usePathname();
  const segments = useSegments();
  const { tabBarTranslateY, tabBarHeight } = useTabBarAnimation();
  const keyboard = useAnimatedKeyboard();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    tabBarTranslateY.value = 0;
  }, [pathname, tabBarTranslateY]);

  const animatedStyle = useAnimatedStyle(() => {
    const effectiveTranslateY = tabBarTranslateY.value + keyboard.height.value;

    return {
      transform: [
        { translateY: effectiveTranslateY },
      ],
    };
  });

  const getSection = (name: string) => name.split('/')[0];

  const routePath = segments.filter((segment) => !segment.startsWith('(')).join('/');
  if (FLOATING_NAV_HIDDEN_ROUTES.includes(routePath)) {
    return null;
  }

  const focusedRouteName = state.routes[state.index]?.name ?? '';
  const activeSection =
    pathname.split('/').find(Boolean)
    ?? segments.find((segment) => segment && !segment.startsWith('('))
    ?? getSection(focusedRouteName);

  return (
    <Animated.View
      style={[styles.tabBarContainer, { bottom: insets.bottom + 8 }, animatedStyle]}
      onLayout={(event) => {
        tabBarHeight.value = event.nativeEvent.layout.height;
      }}
    >
      <Animated.View style={[styles.tabBar]}>
        {FLOATING_NAV_TABS.map((tab) => {
          const route = state.routes.find(({ name }) => name === tab.name);
          if (!route) return null;
          const { icon: Icon } = tab;
          const isFocused = getSection(tab.name) === activeSection;
          const iconColor = isFocused ? Colors.red09 : Colors.maroon09;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigateToTab(route.key);
            } else if (isFocused && pathname !== tab.href && !event.defaultPrevented) {
              router.replace(tab.href);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isFocused }}
            >
              <View style={[styles.iconSlot, isFocused && styles.activeIconSlot]}>
                <Icon width={22} height={22} stroke={iconColor} />
              </View>
              <AppText weight={isFocused ? '600' : '500'} style={[styles.tabLabel, isFocused ? styles.activeTabLabel : styles.inactiveTabLabel]}>
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

export default FloatingNavBar;
