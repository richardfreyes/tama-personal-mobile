import TabsLayout from '@/app/(app)/(tabs)/_layout';
import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('expo-router', () => {
  const { Text, View } = require('react-native');
  const Tabs = ({ children, tabBar }: any) => (
    <View>
      <Text>{`Tab bar:${tabBar()}`}</Text>
      {children}
    </View>
  );
  Tabs.Screen = function MockTabScreen({ name }: any) {
    return <Text>{`Tab:${name}`}</Text>;
  };
  return { Tabs };
});

describe('TabsLayout', () => {
  it('registers the four primary tabs and leaves the bar to the app layout', () => {
    render(<TabsLayout />);

    ['dashboard', 'bills/index', 'transactions/index', 'payment-methods/index'].forEach((name) => {
      expect(screen.getByText(`Tab:${name}`)).toBeTruthy();
    });
    expect(screen.getByText('Tab bar:null')).toBeTruthy();
  });
});
