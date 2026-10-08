import { FLOATING_NAV_HIDDEN_ROUTES, FLOATING_NAV_TABS } from '@/constants';
import { AppText } from '@/components/common/AppText';
import { useTabBarAnimation } from '@/context/TabBarAnimationContext';
import { Colors } from '@/styles/common/colors';
import { floatingNavBarStyles as styles } from '@/styles/components/layout/FloatingNavBar';
import { router, usePathname, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FloatingNavBar = () => {
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

  const activeSection =
    pathname.split('/').find(Boolean)
    ?? segments.find((segment) => segment && !segment.startsWith('('));

  return (
    <Animated.View
      style={[styles.tabBarContainer, { bottom: insets.bottom + 8 }, animatedStyle]}
      onLayout={(event) => {
        tabBarHeight.value = event.nativeEvent.layout.height;
      }}
    >
      <Animated.View style={[styles.tabBar]}>
        {FLOATING_NAV_TABS.map((tab) => {
          const { icon: Icon } = tab;
          const isFocused = getSection(tab.name) === activeSection;
          const iconColor = isFocused ? Colors.red09 : Colors.maroon09;

          const onPress = () => {
            if (!isFocused) {
              router.navigate(tab.href);
            } else if (pathname !== tab.href) {
              router.replace(tab.href);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
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
