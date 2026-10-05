import { BILLER_INDEX_BADGE_SIZE, BILLER_INDEX_HOLD_MS, BILLER_INDEX_LETTER_HEIGHT, BILLER_INDEX_LETTER_WIDTH, BILLER_INDEX_MAGNIFY_MS, BILLER_INDEX_MAGNIFY_SHIFT, BILLER_INDEX_MAX_SCALE, } from '@/constants/billerDirectory';
import { alphabetIndexStyles as styles } from '@/styles/components/common/AlphabetIndex';
import type { AlphabetIndexLetterProps, AlphabetIndexProps } from '@/types/common';
import { getLetterIndexAtY, getLetterMagnification } from '@/utils/alphabetIndex';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText } from './AppText';

function AlphabetIndexLetter({ letter, index, isActive, letterHeight, touchY, magnify, onPress }: AlphabetIndexLetterProps) {
  const badgeSize = Math.min(BILLER_INDEX_BADGE_SIZE, letterHeight);

  const magnifiedStyle = useAnimatedStyle(() => {
    const amount = getLetterMagnification((index + 0.5) * letterHeight, touchY.value, letterHeight) * magnify.value;

    return {
      transform: [
        { translateX: -amount * BILLER_INDEX_MAGNIFY_SHIFT },
        { scale: 1 + amount * (BILLER_INDEX_MAX_SCALE - 1) },
      ],
    };
  });

  return (
    <Animated.View style={magnifiedStyle} testID={`alphabet-index-${letter}-magnifier`}>
      <Pressable
        accessibilityLabel={`Jump to ${letter}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        hitSlop={{ left: 6, right: 6 }}
        onPress={onPress}
        style={[styles.letter, { height: letterHeight, width: BILLER_INDEX_LETTER_WIDTH }]}
        testID={`alphabet-index-${letter}`}
      >
        {isActive ? (
          <View style={[styles.badge, { borderRadius: badgeSize / 2, height: badgeSize, width: badgeSize }]}>
            <AppText weight="600" style={styles.badgeText}>{letter}</AppText>
          </View>
        ) : (
          <AppText weight="600" style={styles.letterText}>{letter}</AppText>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function AlphabetIndex({
  letters,
  activeLetter,
  letterHeight = BILLER_INDEX_LETTER_HEIGHT,
  onSelect,
  onScrub,
  style,
}: AlphabetIndexProps) {

  const touchY = useSharedValue(-1);
  const magnify = useSharedValue(0);
  const scrubbedIndex = useSharedValue(-1);

  const handleScrub = useCallback((letter: string) => {
    void Haptics.selectionAsync();
    (onScrub ?? onSelect)(letter);
  }, [onScrub, onSelect]);

  const scrubTo = (y: number) => {
    'worklet';
    touchY.value = y;
    const index = getLetterIndexAtY(y, letterHeight, letters.length);

    if (index !== scrubbedIndex.value) {
      scrubbedIndex.value = index;
      runOnJS(handleScrub)(letters[index]);
    }
  };

  const scrub = Gesture.Pan()
    .activateAfterLongPress(BILLER_INDEX_HOLD_MS)
    .onStart((event) => {
      magnify.value = withTiming(1, { duration: BILLER_INDEX_MAGNIFY_MS });
      scrubTo(event.y);
    })
    .onUpdate((event) => {
      scrubTo(event.y);
    })
    .onFinalize(() => {
      magnify.value = withTiming(0, { duration: BILLER_INDEX_MAGNIFY_MS });
      scrubbedIndex.value = -1;
    });

  return (
    <GestureDetector gesture={scrub}>
      <View accessibilityLabel="Jump to letter" style={[styles.rail, style]} testID="alphabet-index">
        {letters.map((letter, index) => (
          <AlphabetIndexLetter
            index={index}
            isActive={letter === activeLetter}
            key={letter}
            letter={letter}
            letterHeight={letterHeight}
            magnify={magnify}
            onPress={() => onSelect(letter)}
            touchY={touchY}
          />
        ))}
      </View>
    </GestureDetector>
  );
}
