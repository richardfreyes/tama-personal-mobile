import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import OnboardingFlow from '@/app/(auth)/login/onboarding-flow';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { ScrollView } from 'react-native';

const mockNavigate = jest.fn<(...args: any[]) => any>();

jest.mock('expo-router', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('OnboardingFlow', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('measures pages, advances indicators, and reveals navigation on the final page', () => {
    const view = render(<OnboardingFlow />);
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
    const scroll = view.UNSAFE_getByType(ScrollView);
    fireEvent(scroll, 'layout', { nativeEvent: { layout: { width: 300 } } });
    fireEvent(scroll, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 600 } },
    });
    fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    expect(mockNavigate).toHaveBeenCalledWith('login/index');
  });
});
