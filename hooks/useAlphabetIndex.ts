import { BILLER_DIRECTORY_ACTIVE_OFFSET, BILLER_DIRECTORY_JUMP_OFFSET } from '@/constants/billerDirectory';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type Animated from 'react-native-reanimated';

export const useAlphabetIndex = (letters: readonly string[]) => {
  const scrollRef = useRef<React.ComponentRef<typeof Animated.ScrollView>>(null);
  const listTop = useRef(0);
  const sectionTops = useRef<Record<string, number>>({});

  const lettersRef = useRef(letters);
  lettersRef.current = letters;
  const [activeLetter, setActiveLetter] = useState(letters[0] ?? '');

  useEffect(() => {
    setActiveLetter((current) => (letters.includes(current) ? current : letters[0] ?? ''));
  }, [letters]);

  const getSectionTop = useCallback((letter: string): number | undefined => {
    const sectionTop = sectionTops.current[letter];
    return sectionTop === undefined ? undefined : listTop.current + sectionTop;
  }, []);

  const handleListLayout = useCallback((event: LayoutChangeEvent) => {
    listTop.current = event.nativeEvent.layout.y;
  }, []);

  const handleSectionLayout = useCallback((letter: string, event: LayoutChangeEvent) => {
    sectionTops.current[letter] = event.nativeEvent.layout.y;
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollTop = event.nativeEvent.contentOffset.y;
    let current = lettersRef.current[0] ?? '';

    lettersRef.current.forEach((letter) => {
      const sectionTop = getSectionTop(letter);
      if (sectionTop !== undefined && sectionTop <= scrollTop + BILLER_DIRECTORY_ACTIVE_OFFSET) {
        current = letter;
      }
    });

    setActiveLetter(current);
  }, [getSectionTop]);

  const scrollToLetter = useCallback((letter: string, animated = true) => {
    const sectionTop = getSectionTop(letter);
    if (sectionTop !== undefined) {
      scrollRef.current?.scrollTo({ animated, y: Math.max(sectionTop - BILLER_DIRECTORY_JUMP_OFFSET, 0) });
    }

    setActiveLetter(letter);
  }, [getSectionTop]);

  return { activeLetter, handleListLayout, handleScroll, handleSectionLayout, scrollRef, scrollToLetter };
};
