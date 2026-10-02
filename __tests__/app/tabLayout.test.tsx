import { describe, expect, it, jest } from '@jest/globals';
import TabLayout from '@/app/(app)/_layout';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/context/TabBarAnimationContext', () => ({
  TabBarAnimationProvider: ({ children }: any) => children,
}));
jest.mock('@/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector: any) => selector({ login: { token: 'test-token' } }),
}));
jest.mock('@/components/layout/FloatingNavBar', () => (
  () => {
    const { Text } = require('react-native');
    return <Text>Floating navigation</Text>;
  }
));
jest.mock('@/components/layout/HeaderComponent', () => (
  () => {
    const { Text } = require('react-native');
    return <Text>Dashboard header</Text>;
  }
));
jest.mock('expo-router', () => {
  const { Text, View } = require('react-native');
  const Tabs = ({ children, tabBar }: any) => (
    <View>
      {tabBar({ state: {}, descriptors: {}, navigation: {} })}
      {children}
    </View>
  );
  Tabs.Screen = ({ name, options }: any) => (
    <View>
      <Text>{`Tab:${name}:${options.headerShown}`}</Text>
      {options.header({})}
    </View>
  );
  return { Tabs };
});

describe('TabLayout', () => {
  it('composes the dashboard tab with custom header and floating navigation', () => {
    render(<TabLayout />);
    expect(screen.getByText('Floating navigation')).toBeTruthy();
    expect(screen.getByText('Tab:dashboard:true')).toBeTruthy();
    expect(screen.getByText('Dashboard header')).toBeTruthy();
  });
});
