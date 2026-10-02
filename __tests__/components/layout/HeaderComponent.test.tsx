import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import HeaderComponent from '../../../components/layout/HeaderComponent';
import { COMMON } from '../../../constants/common';
import { renderWithProviders } from '../../../utils/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

function buildLoginState(overrides: Record<string, any> = {}) {
  return {
    login: {
      loading: 'idle' as const,
      token: 'test-token',
      user: {
        firstName: 'John',
        lastName: 'Doe',
        username: 'john.doe@example.com',
        uid: 1,
        ...overrides,
      },
      error: null,
    },
  };
}

function renderHeader(userOverrides: Record<string, any> = {}) {
  return renderWithProviders(<HeaderComponent />, {
    preloadedState: buildLoginState(userOverrides),
  });
}

describe('HeaderComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---- Rendering ----

  it('renders without crashing', () => {
    const { toJSON } = renderHeader();
    expect(toJSON()).toBeTruthy();
  });

  it('renders the full name', () => {
    renderHeader();
    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  it('renders the initials from first and last name', () => {
    renderHeader();
    expect(screen.getByText('JD')).toBeTruthy();
  });

  // ---- Name variations ----

  it('renders initials for different names', () => {
    renderHeader({ firstName: 'Alice', lastName: 'Smith' });
    expect(screen.getByText('AS')).toBeTruthy();
    expect(screen.getByText('Alice Smith')).toBeTruthy();
  });

  it('renders single initial when lastName is empty', () => {
    renderHeader({ firstName: 'Jane', lastName: '' });
    expect(screen.getByText('J')).toBeTruthy();
    expect(screen.getByText('Jane')).toBeTruthy();
  });

  it('renders uppercased initials for lowercase names', () => {
    renderHeader({ firstName: 'bob', lastName: 'ross' });
    expect(screen.getByText('BR')).toBeTruthy();
  });

  // ---- Default / null user ----

  it('renders fallback initials when user is null', () => {
    renderWithProviders(<HeaderComponent />, {
      preloadedState: {
        login: {
          loading: 'idle',
          token: null,
          user: null,
          error: null,
        },
      },
    });
    // useAuth defaults to firstName='User', lastName=''
    expect(screen.getByText('U')).toBeTruthy();
    expect(screen.getByText('User')).toBeTruthy();
  });

  // ---- Navigation ----

  it('navigates to settings when the profile area is pressed', () => {
    renderHeader();
    const profileTouchables = screen.UNSAFE_getAllByType(TouchableOpacity);
    // The only TouchableOpacity wraps the profile info
    fireEvent.press(profileTouchables[0]);
    expect(router.push).toHaveBeenCalledWith(COMMON.ROUTES.settings);
  });

  it('navigates to the correct settings route', () => {
    renderHeader();
    const profileTouchables = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(profileTouchables[0]);
    expect(router.push).toHaveBeenCalledWith('/settings');
  });

  // ---- Edge cases ----

  it('renders with only required props', () => {
    const { toJSON } = renderHeader();
    expect(toJSON()).toBeTruthy();
  });
});
