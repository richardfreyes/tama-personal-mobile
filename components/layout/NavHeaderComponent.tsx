import AqwireLogo from '@/assets/icons/aqwire-logo.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import Lefticon from '@/assets/icons/left.svg';
import MoreIcon from '@/assets/icons/more.svg';
import { Colors } from '@/styles/common/colors';
import { navHeaderComponentStyles as styles } from '@/styles/components/layout/NavHeaderComponent';
import { IconProps, NavHeaderProps } from '@/types';
import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import { Pressable, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Portal as PaperPortal } from 'react-native-paper';
import Animated, { measure, useAnimatedRef, useAnimatedStyle, useFrameCallback, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../common/AppText';

const NavHeaderComponent: React.FC<NavHeaderProps> = ({title, onBackPress, rightNav, logo, variant = 'default'}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const placeholderRef = React.useRef<View>(null);
  const placeholderAnimatedRef = useAnimatedRef<View>();
  const frameRequestRef = React.useRef<number | null>(null);
  const isFocused = useIsFocused();
  const [headerFrame, setHeaderFrame] = React.useState<{ x: number; width: number } | null>(null);
  const isOutlined = variant === 'outlined';
  const headerHeight = isOutlined ? styles.getOutlinedHeaderHeight(insets.top) : styles.getHeaderHeight(insets.top);
  const shadowProgress = useSharedValue(0);
  const shadowTarget = useSharedValue(0);
  const topPlaceholderY = useSharedValue(-1);

  const animatedShadowStyle = useAnimatedStyle(() => ({
    elevation: shadowProgress.value * 3,
    shadowOpacity: shadowProgress.value * 0.08,
    shadowRadius: shadowProgress.value * 5,
  }));

  const shadowFrameCallback = useFrameCallback(() => {
    const measuredPlaceholder = measure(placeholderAnimatedRef);
    if (!measuredPlaceholder) return;

    if (topPlaceholderY.value < 0) {
      topPlaceholderY.value = measuredPlaceholder.pageY;
    }

    const nextShadowTarget = measuredPlaceholder.pageY < topPlaceholderY.value - 0.5 ? 1 : 0;
    if (shadowTarget.value === nextShadowTarget) return;

    shadowTarget.value = nextShadowTarget;
    shadowProgress.value = withTiming(nextShadowTarget, { duration: 140 });
  }, false);

  useFocusEffect(
    React.useCallback(() => {
      shadowFrameCallback.setActive(true);

      return () => {
        shadowFrameCallback.setActive(false);
        shadowTarget.value = 0;
        shadowProgress.value = 0;
      };
    }, [shadowFrameCallback, shadowProgress, shadowTarget])
  );

  const updateHeaderFrame = React.useCallback(() => {
    topPlaceholderY.value = -1;

    if (frameRequestRef.current !== null) {
      cancelAnimationFrame(frameRequestRef.current);
    }

    frameRequestRef.current = requestAnimationFrame(() => {
      frameRequestRef.current = null;
      const placeholder = placeholderRef.current;

      if (!placeholder?.measureInWindow) return;

      placeholder.measureInWindow((x, _y, width) => {
        setHeaderFrame(prevFrame => {
          if (prevFrame?.x === x && prevFrame.width === width) {
            return prevFrame;
          }

          return { x, width };
        });
      });
    });
  }, [topPlaceholderY]);

  const setPlaceholderRefs = React.useCallback((node: View | null) => {
    placeholderRef.current = node;
    placeholderAnimatedRef(node);
  }, [placeholderAnimatedRef]);

  React.useEffect(() => {
    updateHeaderFrame();

    return () => {
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
        frameRequestRef.current = null;
      }
    };
  }, [updateHeaderFrame, windowWidth]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  const IconRenderer: React.FC<IconProps> = ({ iconType, width = 24, height = 24, fill = '', style }) => {
    const getIcon = () => {
      switch (iconType) {
        case 'more':
          return <MoreIcon width={width} height={height} fill={fill} style={style} />;
        case 'delete':
          return <DeleteIcon width={width} height={height} fill={fill} style={style} />;
        default:
          return ;
      }
    };

    return getIcon();
  };

  const renderOutlinedContent = () => {
    const rightIconName = rightNav?.iconType === 'delete' ? 'trash-2' : 'more-horizontal';

    return (
      <View style={[styles.outlinedContainer, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [styles.outlinedButton, pressed && styles.outlinedButtonPressed]}
        >
          <Feather color={Colors.maroon10} name="chevron-left" size={20} />
        </Pressable>
        <AppText numberOfLines={1} style={styles.outlinedTitle} weight="600">{title}</AppText>
        {rightNav && ['more', 'delete'].includes(rightNav.iconType ?? '') ? (
          <Pressable
            accessibilityLabel={rightNav.accessibilityLabel ?? (rightNav.iconType === 'delete' ? 'Delete' : 'More options')}
            accessibilityRole="button"
            onPress={rightNav.onPress}
            style={({ pressed }) => [styles.outlinedButton, pressed && styles.outlinedButtonPressed]}
          >
            <Feather color={Colors.maroon09} name={rightIconName} size={19} />
          </Pressable>
        ) : <View style={styles.outlinedButtonSlot} />}
      </View>
    );
  };

  const renderHeaderContent = () => isOutlined ? renderOutlinedContent() : (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={4}>
          <Lefticon width={24} height={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.titleWrapper}>
        { logo && logo ? (
          <View style={{ marginRight: 8 }}>
            <AqwireLogo width={24} height={24} />
          </View>) : null
        }
        <AppText color='maroon10' style={[styles.headerTitle]} weight='700'>
          {title}
        </AppText>
      </View>
      { rightNav && ['more', 'delete'].includes(rightNav.iconType ?? '') ? (
        <TouchableOpacity style={rightNav?.iconType === 'more' ? styles.backButton : styles.rightNav} accessibilityRole="button" accessibilityLabel={rightNav.iconType === 'delete' ? 'Delete' : 'More options'} hitSlop={4} onPress={rightNav.onPress}>
          <IconRenderer iconType={rightNav.iconType ?? 'more'} width={24} height={24}  />
        </TouchableOpacity>
      ) : <View style={styles.rightSpacer} /> }
    </View>
  );

  return (
    <>
      <Animated.View
        ref={setPlaceholderRefs}
        onLayout={updateHeaderFrame}
        style={{ height: headerHeight }}
        testID="nav-header-spacer"
      />
      {isFocused ? (
        <PaperPortal>
          <Animated.View
            pointerEvents="box-none"
            style={[styles.stickyHeaderOverlay, { height: headerHeight }, animatedShadowStyle]}
            testID="sticky-nav-header-overlay"
          >
            <View
              style={[
                styles.stickyHeaderContent,
                headerFrame ? { left: headerFrame.x, width: headerFrame.width } : styles.stickyHeaderFallback,
              ]}
              testID="sticky-nav-header"
            >
              {renderHeaderContent()}
            </View>
          </Animated.View>
        </PaperPortal>
      ) : null}
    </>
  );
};

export default NavHeaderComponent;
