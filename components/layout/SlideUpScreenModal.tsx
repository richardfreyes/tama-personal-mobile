import { slideScreenModalStyles as styles } from "@/styles/components/layout/SlideUpScreenModal";
import { SlideUpScreenModalProps, SlideUpScreenModalRef } from "@/types";
import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, PanResponder, Pressable, useWindowDimensions, View } from "react-native";

const SNAP_POINTS = [0.35, 0.5, 0.8];
const OPEN_DURATION_MS = 260;
const CLOSE_DURATION_MS = 200;
const DISMISS_DRAG_PX = 80;

export const SlideUpScreenModal = React.forwardRef<SlideUpScreenModalRef, SlideUpScreenModalProps>(({ children, onClose }, ref) => {
  const { height: windowHeight } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [snapIndex, setSnapIndex] = useState(0);
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);

  const sheetHeight = windowHeight * SNAP_POINTS[snapIndex];

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: OPEN_DURATION_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 1, duration: OPEN_DURATION_MS, useNativeDriver: true }),
    ]).start();
  }, [backdropOpacity, translateY]);

  const close = useCallback(() => {
    if (!visible || isClosing.current) return;
    isClosing.current = true;
    Animated.parallel([
      Animated.timing(translateY, { toValue: windowHeight, duration: CLOSE_DURATION_MS, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: CLOSE_DURATION_MS, useNativeDriver: true }),
    ]).start(() => {
      isClosing.current = false;
      setVisible(false);
      onClose?.();
    });
  }, [backdropOpacity, onClose, translateY, visible, windowHeight]);

  const snapToIndex = useCallback((index: number) => {
    if (index < 0) {
      close();
      return;
    }
    setSnapIndex(Math.min(index, SNAP_POINTS.length - 1));
    if (!visible) {
      translateY.setValue(windowHeight);
      backdropOpacity.setValue(0);
      setVisible(true);
    }
  }, [backdropOpacity, close, translateY, visible, windowHeight]);

  useImperativeHandle(ref, () => ({
    snapToIndex,
    expand: () => snapToIndex(SNAP_POINTS.length - 1),
    collapse: () => snapToIndex(0),
    close,
    forceClose: close,
  }), [close, snapToIndex]);

  const dragResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      if (gesture.dy > 0) translateY.setValue(gesture.dy);
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > DISMISS_DRAG_PX) {
        close();
        return;
      }
      Animated.timing(translateY, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    },
  }), [close, translateY]);

  return (
    <Modal
      animationType="none"
      onRequestClose={close}
      onShow={animateIn}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable accessibilityLabel="Close" onPress={close} style={styles.backdropPressable} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { height: sheetHeight, transform: [{ translateY }] }]}>
          <View {...dragResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handleIndicator} />
          </View>
          <View style={styles.contentContainer}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

SlideUpScreenModal.displayName = 'SlideUpScreenModal';
