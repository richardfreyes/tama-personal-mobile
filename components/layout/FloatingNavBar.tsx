import { FLOATING_NAV_TABS } from '@/constants';
import { AppText } from '@/components/common/AppText';
import { useTabBarAnimation } from '@/context/TabBarAnimationContext';
import { Colors } from '@/styles/common/colors';
import { floatingNavBarStyles as styles } from '@/styles/components/layout/FloatingNavBar';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, usePathname, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FloatingNavBar = ({ state, navigation }: BottomTabBarProps) => {
  const pathname = usePathname();
  const segments = useSegments();
  const { tabBarTranslateY, tabBarHeight } = useTabBarAnimation();
  const keyboard = useAnimatedKeyboard();
  const insets = useSafeAreaInsets();

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
      style={[styles.tabBarContainer, { bottom: insets.bottom + 8 }, animatedStyle]}
      onLayout={(event) => {
        // Measure the height of the tab bar and store it in the shared context value.
        // This ensures the scroll animation uses the correct height, preventing crashes.
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
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, { merge: true });
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
