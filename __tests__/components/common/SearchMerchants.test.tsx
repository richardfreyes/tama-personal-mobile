import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { Image } from 'react-native';
import SearchMerchants from '../../../components/common/SearchMerchants';
import { renderWithProviders } from '../../../utils/test-utils';

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
  const { View, ScrollView } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: { ScrollView, View },
    runOnJS: (fn: unknown) => fn,
    useAnimatedStyle: (updater: () => object) => updater(),
    useSharedValue: (value: unknown) => ({ value }),
    withTiming: (value: unknown) => value,
  };
});

jest.mock('@/components/common/GlobalScrollView', () => ({
  useTabBarScrollHandler: (onScroll: unknown) => onScroll,
}));

const merchants = [
  { id: 1, name: 'Alpha Biller', merchant_logo_url: 'https://logo/alpha.png' },
  { id: 2, name: 'Beta Corp' },
  { id: 3, name: '16-101 Enterprise, Inc.', logoUrl: 'https://cdn.aqwire.io/portal/v3/client/16101/16101-logo.png' },
];

const baseProps = {
  data: merchants,
  searchProperty: 'name' as const,
  onSelect: jest.fn(),
  onCategoryChange: jest.fn(),
};

describe('SearchMerchants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input with the biller count', () => {
    renderWithProviders(<SearchMerchants {...baseProps} />);
    expect(screen.getByPlaceholderText('Search 3 billers')).toBeTruthy();
  });

  it('renders the category pills when a category handler is given', () => {
    renderWithProviders(<SearchMerchants {...baseProps} />);
    expect(screen.getByText('All Billers')).toBeTruthy();
    expect(screen.getByText('Real Estate')).toBeTruthy();
  });

  it('omits the category pills without a category handler', () => {
    renderWithProviders(<SearchMerchants {...baseProps} onCategoryChange={undefined} />);
    expect(screen.queryByText('All Billers')).toBeNull();
  });

  it('renders the merchants from the data list', () => {
    renderWithProviders(<SearchMerchants {...baseProps} />);
    expect(screen.getByText('Alpha Biller')).toBeTruthy();
    expect(screen.getByText('Beta Corp')).toBeTruthy();
  });

  it('renders a logo image when merchant_logo_url is present', () => {
    renderWithProviders(<SearchMerchants {...baseProps} />);
    const images = screen.UNSAFE_getAllByType(Image);
    expect(
      images.some((img) => img.props.source?.uri === 'https://logo/alpha.png'),
    ).toBe(true);
  });

  it('renders a enrollment biller logo when logoUrl is present', () => {
    renderWithProviders(<SearchMerchants {...baseProps} />);
    const images = screen.UNSAFE_getAllByType(Image);
    expect(
      images.some(
        (img) => img.props.source?.uri === 'https://cdn.aqwire.io/portal/v3/client/16101/16101-logo.png',
      ),
    ).toBe(true);
  });

  it('filters the list by the search query', () => {
    renderWithProviders(<SearchMerchants {...baseProps} />);
    fireEvent.changeText(screen.getByPlaceholderText('Search 3 billers'), 'Alpha');
    expect(screen.getByText('Alpha Biller')).toBeTruthy();
    expect(screen.queryByText('Beta Corp')).toBeNull();
  });

  it('matches an accented name from an unaccented query', () => {
    renderWithProviders(
      <SearchMerchants {...baseProps} data={[{ id: 4, name: 'Éclair Land' }]} />,
    );
    fireEvent.changeText(screen.getByPlaceholderText('Search 1 biller'), 'eclair');
    expect(screen.getByText('Éclair Land')).toBeTruthy();
  });

  it('shows the no-match state when the search matches nothing', () => {
    renderWithProviders(<SearchMerchants {...baseProps} />);
    fireEvent.changeText(screen.getByPlaceholderText('Search 3 billers'), 'zzzz');
    expect(screen.getByText('No billers found')).toBeTruthy();
  });

  it('shows the empty state when data is an empty array or undefined', () => {
    renderWithProviders(<SearchMerchants {...baseProps} data={[]} />);
    expect(screen.getByText('No billers are available right now.')).toBeTruthy();
  });

  it('treats undefined data as empty', () => {
    renderWithProviders(<SearchMerchants {...baseProps} data={undefined as any} />);
    expect(screen.getByText('No billers are available right now.')).toBeTruthy();
  });

  it('shows the error state when isError is true', () => {
    renderWithProviders(
      <SearchMerchants {...baseProps} isError />,
    );
    expect(
      screen.getByText(
        'Unable to load billers at the moment. Please try again later.',
      ),
    ).toBeTruthy();
  });

  it('does not show the empty state while loading', () => {
    renderWithProviders(
      <SearchMerchants {...baseProps} data={[]} isLoading />,
    );
    expect(screen.queryByText('No billers are available right now.')).toBeNull();
  });

  it('calls onSelect with the merchant when an item is pressed', () => {
    const onSelect = jest.fn();
    renderWithProviders(<SearchMerchants {...baseProps} onSelect={onSelect} />);
    fireEvent.press(screen.getByText('Beta Corp'));
    expect(onSelect).toHaveBeenCalledWith(merchants[1]);
  });

  it('calls onCategoryChange with the category id when a pill is pressed', () => {
    const onCategoryChange = jest.fn();
    renderWithProviders(
      <SearchMerchants {...baseProps} onCategoryChange={onCategoryChange} />,
    );
    fireEvent.press(screen.getByText('Real Estate'));
    expect(onCategoryChange).toHaveBeenCalledWith(2);
  });

});
