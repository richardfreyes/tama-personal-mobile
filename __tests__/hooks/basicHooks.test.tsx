import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TabBarAnimationProvider, useTabBarAnimation } from '@/context/TabBarAnimationContext';
import { useAuth } from '@/hooks/useAuth';
import usePasswordValidation from '@/hooks/usePasswordValidation';
import useResendCountdown from '@/hooks/useResendCountdown';
import { useAppSelector } from '@/redux/hooks';
import { act, renderHook } from '@testing-library/react-native';
import React, { PropsWithChildren } from 'react';

jest.mock('@/redux/hooks', () => ({
  useAppSelector: jest.fn<(...args: any[]) => any>(),
}));

const mockUseAppSelector = useAppSelector as jest.Mock<(...args: any[]) => any>;

describe('basic hooks and context', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('usePasswordValidation', () => {
    it('reports every unmet rule for an empty password', () => {
      const { result } = renderHook(() => usePasswordValidation(''));
      expect(result.current).toHaveLength(4);
      expect(result.current.every((rule) => !rule.valid)).toBe(true);
      expect(result.current.map((rule) => rule.text)).toEqual([
        expect.stringContaining('12 characters'),
        expect.stringContaining('uppercase and lowercase'),
        expect.stringContaining('letters and numbers'),
        expect.stringContaining('special character'),
      ]);
    });

    it('recomputes all rules when the password changes', () => {
      const { result, rerender } = renderHook<
        ReturnType<typeof usePasswordValidation>,
        { password: string }
      >(
        ({ password }) => usePasswordValidation(password),
        { initialProps: { password: 'short' } },
      );
      expect(result.current.some((rule) => !rule.valid)).toBe(true);
      rerender({ password: 'LongPassword123!' });
      expect(result.current.every((rule) => rule.valid)).toBe(true);
    });
  });

  describe('useResendCountdown', () => {
    beforeEach(() => { jest.useFakeTimers(); });
    afterEach(() => { jest.useRealTimers(); });

    it('counts down to zero, deactivates, and can restart', () => {
      const { result, unmount } = renderHook(() => useResendCountdown(2));
      expect(result.current).toMatchObject({ countdown: 2, isActive: true });

      act(() => jest.advanceTimersByTime(1000));
      expect(result.current).toMatchObject({ countdown: 1, isActive: true });

      act(() => jest.advanceTimersByTime(1000));
      expect(result.current).toMatchObject({ countdown: 0, isActive: false });

      act(() => result.current.startCountdown());
      expect(result.current).toMatchObject({ countdown: 2, isActive: true });
      unmount();
      expect(jest.getTimerCount()).toBe(0);
    });

    it('uses a 30-second default', () => {
      const { result } = renderHook(() => useResendCountdown());
      expect(result.current.countdown).toBe(30);
    });
  });

  describe('useAuth', () => {
    it('returns authenticated user fields and token', () => {
      mockUseAppSelector.mockImplementation((selector) => selector({
        login: {
          token: 'token',
          user: {
            firstName: 'Ada',
            lastName: 'Lovelace',
            username: 'ada@example.com',
          },
        },
      }));
      const { result } = renderHook(() => useAuth());
      expect(result.current).toEqual({
        token: 'token',
        user: expect.objectContaining({ firstName: 'Ada' }),
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        isLoggedIn: true,
      });
    });

    it('returns display-safe guest fallbacks', () => {
      mockUseAppSelector.mockImplementation((selector) => selector({
        login: { token: null, user: null },
      }));
      const { result } = renderHook(() => useAuth());
      expect(result.current).toEqual({
        token: null,
        user: null,
        firstName: 'User',
        lastName: '',
        email: 'user@example.com',
        isLoggedIn: false,
      });
    });
  });

  describe('TabBarAnimationContext', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <TabBarAnimationProvider>{children}</TabBarAnimationProvider>
    );

    it('shares mutable tab-bar position and height values', () => {
      const { result } = renderHook(() => useTabBarAnimation(), { wrapper });
      expect(result.current.tabBarTranslateY.value).toBe(0);
      expect(result.current.tabBarHeight.value).toBe(0);
      act(() => {
        result.current.tabBarTranslateY.value = 24;
        result.current.tabBarHeight.value = 80;
      });
      expect(result.current.tabBarTranslateY.value).toBe(24);
      expect(result.current.tabBarHeight.value).toBe(80);
    });

    it('throws a clear error outside its provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderHook(() => useTabBarAnimation())).toThrow(
        'useTabBarAnimation must be used within a TabBarAnimationProvider',
      );
      consoleError.mockRestore();
    });
  });
});
