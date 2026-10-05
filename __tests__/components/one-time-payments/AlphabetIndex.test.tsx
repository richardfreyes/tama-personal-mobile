import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AlphabetIndex from '@/components/common/AlphabetIndex';
import { Colors } from '@/styles/common/colors';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet } from 'react-native';

describe('AlphabetIndex', () => {
  const letters = ['#', 'A', 'C', 'D'];

  it('lists every letter as a button', () => {
    render(<AlphabetIndex activeLetter="A" letters={letters} onSelect={jest.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Jump to C' })).toBeTruthy();
  });

  it('puts the current letter in a 22pt red badge and the rest in plain red', () => {
    render(<AlphabetIndex activeLetter="A" letters={letters} onSelect={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Jump to A' }).props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByRole('button', { name: 'Jump to C' }).props.accessibilityState).toEqual({ selected: false });

    expect(StyleSheet.flatten(screen.getByText('A').props.style).color).toBe(Colors.neutral01);
    expect(StyleSheet.flatten(screen.getByText('C').props.style).color).toBe(Colors.red09);
  });

  it('reports the letter that was tapped', () => {
    const onSelect = jest.fn();
    render(<AlphabetIndex activeLetter="A" letters={letters} onSelect={onSelect} />);

    fireEvent.press(screen.getByRole('button', { name: 'Jump to D' }));
    expect(onSelect).toHaveBeenCalledWith('D');
  });

  it('makes each letter a 32 x 28 target', () => {
    render(<AlphabetIndex activeLetter="A" letters={letters} onSelect={jest.fn()} />);

    expect(StyleSheet.flatten(screen.getByTestId('alphabet-index-C').props.style)).toEqual(
      expect.objectContaining({ height: 28, width: 32 }),
    );
  });

  it('squeezes the letters, and the badge, to the height it is given', () => {
    render(<AlphabetIndex activeLetter="A" letterHeight={18} letters={letters} onSelect={jest.fn()} />);

    expect(StyleSheet.flatten(screen.getByTestId('alphabet-index-C').props.style).height).toBe(18);
  });

  it('is described as a jump-to-letter control', () => {
    render(<AlphabetIndex activeLetter="A" letters={letters} onSelect={jest.fn()} />);
    expect(screen.getByLabelText('Jump to letter')).toBeTruthy();
  });

  describe('fast-scroll', () => {
    type PanEvent = { y: number };
    type Pan = { handlers: Record<'onStart' | 'onUpdate' | 'onFinalize', (event: PanEvent) => void> };

    const setUp = (props: Partial<React.ComponentProps<typeof AlphabetIndex>> = {}) => {
      const onSelect = jest.fn();
      const onScrub = jest.fn();
      render(<AlphabetIndex activeLetter="A" letters={letters} onScrub={onScrub} onSelect={onSelect} {...props} />);
      const pan = screen.getByTestId('alphabet-index').props.gesture as Pan;
      return { onScrub, onSelect, pan };
    };

    beforeEach(() => {
      jest.mocked(Haptics.selectionAsync).mockClear();
    });

    it('scrolls to the letter the finger lands on after the hold', () => {
      const { onScrub, pan } = setUp();

      pan.handlers.onStart({ y: 70 });

      expect(onScrub).toHaveBeenCalledTimes(1);
      expect(onScrub).toHaveBeenCalledWith('C');
    });

    it('follows the finger up and down without lifting', () => {
      const { onScrub, pan } = setUp();

      pan.handlers.onStart({ y: 14 });
      pan.handlers.onUpdate({ y: 98 });
      pan.handlers.onUpdate({ y: 42 });

      expect(onScrub.mock.calls.map(([letter]) => letter)).toEqual(['#', 'D', 'A']);
    });

    it('does not repeat a letter while the finger stays on it', () => {
      const { onScrub, pan } = setUp();

      pan.handlers.onStart({ y: 30 });
      pan.handlers.onUpdate({ y: 40 });
      pan.handlers.onUpdate({ y: 52 });

      expect(onScrub).toHaveBeenCalledTimes(1);
    });

    it('stops on the first and last letters when the finger slides past the rail', () => {
      const { onScrub, pan } = setUp();

      pan.handlers.onStart({ y: -30 });
      pan.handlers.onUpdate({ y: 400 });

      expect(onScrub.mock.calls.map(([letter]) => letter)).toEqual(['#', 'D']);
    });

    it('ticks the haptics once per new letter', () => {
      const { pan } = setUp();

      pan.handlers.onStart({ y: 14 });
      pan.handlers.onUpdate({ y: 20 });
      pan.handlers.onUpdate({ y: 42 });
      pan.handlers.onUpdate({ y: 70 });

      expect(Haptics.selectionAsync).toHaveBeenCalledTimes(3);
    });

    it('picks up the same letter again in a later drag', () => {
      const { onScrub, pan } = setUp();

      pan.handlers.onStart({ y: 70 });
      pan.handlers.onFinalize({ y: 70 });
      pan.handlers.onStart({ y: 70 });

      expect(onScrub).toHaveBeenCalledTimes(2);
    });

    it('falls back to onSelect when no scrub handler is given', () => {
      const onSelect = jest.fn();
      render(<AlphabetIndex activeLetter="A" letters={letters} onSelect={onSelect} />);
      const pan = screen.getByTestId('alphabet-index').props.gesture as Pan;

      pan.handlers.onStart({ y: 98 });

      expect(onSelect).toHaveBeenCalledWith('D');
    });

    it('swells the letter under the finger and eases it back on release', () => {
      const { onScrub, onSelect, pan } = setUp();
      const rerender = () => screen.rerender(
        <AlphabetIndex activeLetter="A" letters={letters} onScrub={onScrub} onSelect={onSelect} />,
      );
      const scaleOf = (letter: string) => {
        const { transform } = StyleSheet.flatten(screen.getByTestId(`alphabet-index-${letter}-magnifier`).props.style);
        return (transform as Record<string, number>[]).find((entry) => 'scale' in entry)?.scale;
      };

      expect(scaleOf('C')).toBe(1);

      pan.handlers.onStart({ y: 70 });
      rerender();
      expect(scaleOf('C')).toBeGreaterThan(2);
      expect(scaleOf('D')).toBeGreaterThan(1);
      expect(scaleOf('D')).toBeLessThan(scaleOf('C') as number);
      expect(scaleOf('#')).toBe(1);

      pan.handlers.onFinalize({ y: 70 });
      rerender();
      expect(scaleOf('C')).toBe(1);
      expect(scaleOf('D')).toBe(1);
    });
  });
});
