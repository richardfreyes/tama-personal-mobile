import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import SearchMerchants from '@/components/common/SearchMerchants';
import type { Biller } from '@/redux/features/biller/billerTypes';
import { renderWithProviders } from '@/utils/test-utils';
import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

const mockScrollTo = jest.fn();

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(() => {
        const cleanup = cb();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, []);
    },
  };
});

jest.mock('react-native-reanimated', () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual<typeof import('react')>('react');
  const { ScrollView } = jest.requireActual<typeof import('react-native')>('react-native');
  const AnimatedScrollView = forwardRef(function MockAnimatedScrollView(props: any, ref: any) {
    useImperativeHandle(ref, () => ({ scrollTo: mockScrollTo }));
    return <ScrollView {...props} />;
  });
  const View = jest.requireActual<typeof import('react-native')>('react-native').View;
  return {
    __esModule: true,
    default: { ScrollView: AnimatedScrollView, View },
    runOnJS: (fn: unknown) => fn,
    useAnimatedStyle: (updater: () => object) => updater(),
    useSharedValue: (value: unknown) => ({ value }),
    withTiming: (value: unknown) => value,
  };
});

jest.mock('@/components/common/GlobalScrollView', () => ({
  useTabBarScrollHandler: (onScroll: unknown) => onScroll,
}));

const makeBiller = (merchant_name: string, merchant_id: number, merchant_logo_url = ''): Biller => ({
  address_one: '',
  address_three: '',
  address_two: '',
  created_at: '',
  is_active: true,
  is_public: true,
  merchant_code: merchant_name.toLowerCase(),
  merchant_id,
  merchant_logo_url,
  merchant_name,
  merchant_status: 'active',
  merchant_timezone: 'Asia/Manila',
  updated_at: '',
});

const billers = [
  makeBiller('Megaworld', 1),
  makeBiller('724Care', 2),
  makeBiller('Avida Land', 3),
  makeBiller('AboitizLand, Inc.', 4),
  makeBiller('Filinvest Land', 5),
  makeBiller('Federal Land', 6),
  makeBiller('SMDC', 7),
];

const layoutEvent = (y: number, height = 100) => ({ nativeEvent: { layout: { x: 0, y, width: 300, height } } });

const renderDirectory = (props: Partial<React.ComponentProps<typeof SearchMerchants>> = {}) => renderWithProviders(
  <SearchMerchants
    data={billers}
    header={<Text>Saved billers header</Text>}
    layout="directory"
    savedMerchantIds={new Set([5])}
    searchProperty="merchant_name"
    {...props}
  />,
);

describe('SearchMerchants directory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listing', () => {
    it('counts the billers in the search field', () => {
      renderDirectory();
      expect(screen.getByPlaceholderText('Search 7 billers')).toBeTruthy();
    });

    it('says "biller" for a single one', () => {
      renderDirectory({ data: [billers[0]] });
      expect(screen.getByPlaceholderText('Search 1 biller')).toBeTruthy();
    });

    it('lists billers A–Z under their first letter, with numbers under "#"', () => {
      renderDirectory();

      const names = screen.getAllByTestId(/^biller-row-/).map((row) => row.props.accessibilityLabel);
      expect(names).toEqual([
        '724Care',
        'AboitizLand, Inc.',
        'Avida Land',
        'Federal Land',
        'Filinvest Land, saved',
        'Megaworld',
        'SMDC',
      ]);
      ['#', 'A', 'F', 'M', 'S'].forEach((letter) => {
        expect(screen.getAllByText(letter).length).toBeGreaterThan(0);
      });
    });

    it('puts a Saved pill on the billers the user has saved', () => {
      renderDirectory();
      expect(screen.getAllByText('Saved')).toHaveLength(1);
      expect(screen.getByLabelText('Filinvest Land, saved')).toBeTruthy();
    });

    it('shows the header above the search field', () => {
      renderDirectory();
      expect(screen.getByText('Saved billers header')).toBeTruthy();
    });

    it('keeps the search field fixed to the top of the scroll view', () => {
      renderDirectory();
      expect(screen.getByTestId('biller-directory-scroll').props.stickyHeaderIndices).toEqual([1]);
    });

    it('does not make the rows pressable', () => {
      renderDirectory();
      expect(screen.queryAllByRole('button').filter((button) => !String(button.props.testID).startsWith('alphabet-index'))).toHaveLength(0);
    });

    it('passes the selected biller to onSelect when a directory row is pressed', () => {
      const onSelect = jest.fn();
      renderDirectory({ onSelect });

      fireEvent.press(screen.getByTestId('biller-row-3'));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(billers[2]);
    });

    it('says so when there are no billers at all', () => {
      renderDirectory({ data: [] });

      expect(screen.getByText('No billers are available right now.')).toBeTruthy();
      expect(screen.queryByTestId('alphabet-index')).toBeNull();
    });
  });

  describe('searching', () => {
    const search = (text: string) => fireEvent.changeText(screen.getByTestId('biller-search'), text);

    it('replaces the lettered list with a flat list of matches and a count', () => {
      renderDirectory();
      search('land');

      expect(screen.getByText('4 billers match “land”')).toBeTruthy();
      const names = screen.getAllByTestId(/^biller-row-/).map((row) => row.props.accessibilityLabel);
      expect(names).toEqual(['AboitizLand, Inc.', 'Avida Land', 'Federal Land', 'Filinvest Land, saved']);
      expect(screen.queryByText('A')).toBeNull();
      expect(screen.queryByText('F')).toBeNull();
    });

    it('returns to the top when search starts after scrolling into the list', () => {
      renderDirectory();
      fireEvent.scroll(screen.getByTestId('biller-directory-scroll'), { nativeEvent: { contentOffset: { y: 620 } } });

      search('land');

      expect(mockScrollTo).toHaveBeenCalledWith({ animated: false, y: 0 });
      mockScrollTo.mockClear();
      search('land inc');
      expect(mockScrollTo).not.toHaveBeenCalled();

      search('');
      expect(mockScrollTo).toHaveBeenCalledWith({ animated: false, y: 0 });
    });

    it('says "1 biller matches" for a single match', () => {
      renderDirectory();
      search('mega');
      expect(screen.getByText('1 biller matches “mega”')).toBeTruthy();
    });

    it('ignores case and surrounding spaces', () => {
      renderDirectory();
      search('  AVIDA ');
      expect(screen.getByText('1 biller matches “AVIDA”')).toBeTruthy();
    });

    it('hides the saved billers header and the A–Z rail while searching', () => {
      renderDirectory();
      expect(screen.getByTestId('alphabet-index')).toBeTruthy();

      search('land');

      expect(screen.queryByText('Saved billers header')).toBeNull();
      expect(StyleSheet.flatten(screen.getByTestId('biller-directory-header', { includeHiddenElements: true }).props.style)).toEqual({ display: 'none' });
      expect(screen.queryByTestId('alphabet-index')).toBeNull();
    });

    it('shows a recoverable state when nothing matches', () => {
      renderDirectory();
      search('Vertis North');

      expect(screen.getByText('No billers found')).toBeTruthy();
      expect(screen.getByText('Nothing matches “Vertis North”. Check the spelling or try the company’s registered name.')).toBeTruthy();
      expect(screen.queryByTestId(/^biller-row-/)).toBeNull();
    });

    it('goes back to the full list from Clear Search', () => {
      renderDirectory();
      search('Vertis North');

      mockScrollTo.mockClear();

      fireEvent.press(screen.getByRole('button', { name: 'Clear Search' }));

      expect(screen.getAllByTestId(/^biller-row-/)).toHaveLength(7);
      expect(screen.getByTestId('biller-search').props.value).toBe('');
      expect(screen.getByTestId('alphabet-index')).toBeTruthy();
      expect(mockScrollTo).toHaveBeenCalledWith({ animated: false, y: 0 });
    });

    it('goes back to the full list from the clear button in the field', () => {
      renderDirectory();
      search('land');

      fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));

      expect(screen.getAllByTestId(/^biller-row-/)).toHaveLength(7);
    });

    it('treats a blank search as no search', () => {
      renderDirectory();
      search('   ');

      expect(screen.queryByText(/match/)).toBeNull();
      expect(screen.getByTestId('alphabet-index')).toBeTruthy();
    });
  });

  describe('A–Z rail', () => {
    const lay = (testID: string, y: number, height = 100) => act(() => {
      fireEvent(screen.getByTestId(testID), 'layout', layoutEvent(y, height));
    });

    it('offers a button for each letter, starting on the first', () => {
      renderDirectory();

      ['#', 'A', 'F', 'M', 'S'].forEach((letter) => {
        expect(screen.getByRole('button', { name: `Jump to ${letter}` })).toBeTruthy();
      });
      expect(screen.getByRole('button', { name: 'Jump to #' }).props.accessibilityState).toEqual({ selected: true });
    });

    it('jumps to a letter’s section, 72pt below the top, and marks it current', () => {
      renderDirectory();
      lay('biller-directory-list', 300);
      lay('biller-section-F', 400);

      fireEvent.press(screen.getByRole('button', { name: 'Jump to F' }));

      expect(mockScrollTo).toHaveBeenCalledWith({ animated: true, y: 300 + 400 - 72 });
      expect(screen.getByRole('button', { name: 'Jump to F' }).props.accessibilityState).toEqual({ selected: true });
      expect(screen.getByRole('button', { name: 'Jump to #' }).props.accessibilityState).toEqual({ selected: false });
    });

    it('scrubbing the rail jumps the list straight to each section, without animating', () => {
      renderDirectory();
      lay('biller-directory', 0, 874);
      lay('biller-directory-header', 0, 330);
      lay('biller-directory-list', 300);
      lay('biller-section-F', 400);
      lay('biller-section-M', 900);

      const pan = screen.getByTestId('alphabet-index').props.gesture;
      act(() => pan.handlers.onStart({ y: 2 * 28 + 5 }));
      act(() => pan.handlers.onUpdate({ y: 3 * 28 + 5 }));

      expect(mockScrollTo).toHaveBeenNthCalledWith(1, { animated: false, y: 300 + 400 - 72 });
      expect(mockScrollTo).toHaveBeenNthCalledWith(2, { animated: false, y: 300 + 900 - 72 });
      expect(screen.getByRole('button', { name: 'Jump to M' }).props.accessibilityState).toEqual({ selected: true });
    });

    it('follows the scroll position', () => {
      renderDirectory();
      lay('biller-directory-list', 300);
      lay('biller-section-F', 400);

      fireEvent.scroll(screen.getByTestId('biller-directory-scroll'), { nativeEvent: { contentOffset: { y: 619 } } });
      expect(screen.getByRole('button', { name: 'Jump to F' }).props.accessibilityState).toEqual({ selected: false });

      fireEvent.scroll(screen.getByTestId('biller-directory-scroll'), { nativeEvent: { contentOffset: { y: 620 } } });
      expect(screen.getByRole('button', { name: 'Jump to F' }).props.accessibilityState).toEqual({ selected: true });
    });

    it('starts just under the search field, below the header', () => {
      renderDirectory();
      lay('biller-directory-header', 0, 330);

      expect(StyleSheet.flatten(screen.getByTestId('alphabet-index').props.style)).toEqual(
        expect.objectContaining({ position: 'absolute', right: 4, top: 330 + 72 }),
      );
    });

    it('keeps its letters 28pt tall when they fit', () => {
      renderDirectory();
      lay('biller-directory', 0, 874);
      lay('biller-directory-header', 0, 330);

      expect(StyleSheet.flatten(screen.getByTestId('alphabet-index-F').props.style).height).toBe(28);
    });

    it('squeezes its letters together when the list is too long for the space', () => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, index) => makeBiller(`${letter} Biller`, 100 + index));
      renderDirectory({ data: alphabet });
      lay('biller-directory', 0, 874);
      lay('biller-directory-header', 0, 100);

      expect(StyleSheet.flatten(screen.getByTestId('alphabet-index-Q').props.style).height).toBe(Math.floor(590 / 26));
    });

    it('never squeezes its letters below 16pt', () => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, index) => makeBiller(`${letter} Biller`, 100 + index));
      renderDirectory({ data: alphabet });
      lay('biller-directory', 0, 874);
      lay('biller-directory-header', 0, 330);

      expect(StyleSheet.flatten(screen.getByTestId('alphabet-index-Q').props.style).height).toBe(16);
    });
  });

  describe('loading and failing', () => {
    it('shows a skeleton while loading, without a search field or rail', () => {
      renderDirectory({ isLoading: true });

      expect(screen.getByTestId('biller-directory-loading')).toBeTruthy();
      expect(screen.queryByTestId('biller-search')).toBeNull();
      expect(screen.queryByTestId('alphabet-index')).toBeNull();
      expect(screen.getByTestId('biller-directory-scroll').props.stickyHeaderIndices).toBeUndefined();
    });

    it('offers to retry when the billers cannot be loaded', () => {
      const onRetry = jest.fn();
      renderDirectory({ isError: true, onRetry });

      expect(screen.getByText('Unable to load billers at the moment. Please try again later.')).toBeTruthy();
      expect(screen.queryByTestId('biller-search')).toBeNull();
      expect(screen.queryByTestId('alphabet-index')).toBeNull();
      fireEvent.press(screen.getByRole('button', { name: 'Try loading billers again' }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
