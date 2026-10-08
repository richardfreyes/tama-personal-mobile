import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import AboutScreen from '@/app/(app)/settings/about';
import ContactScreen from '@/app/(app)/settings/contact';
import LicensesScreen from '@/app/(app)/settings/licenses';
import { CONTACT_CHANNELS } from '@/constants/contact';
import { LEGAL_ROWS, STATS } from '@/constants/about';
import { LICENSE_LOGOS } from '@/constants/license';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import React from 'react';
import { Linking } from 'react-native';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn<(...args: any[]) => any>(),
}));
jest.mock('@/components/common/GlobalScrollView', () => ({
  GlobalScrollView: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@/components/layout/NavHeaderComponent', () => (
  ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{`Nav:${title}`}</Text>;
  }
));

describe('informational settings screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => { jest.restoreAllMocks(); });

  it('renders the about mission, stats, application metadata, and legal navigation', () => {
    render(<AboutScreen />);
    expect(screen.getByText('Our mission is to expand your reach globally.')).toBeTruthy();
    STATS.forEach((stat) => {
      expect(screen.getByText(stat.value)).toBeTruthy();
      expect(screen.getByText(stat.label)).toBeTruthy();
    });
    expect(screen.getByText('Mobile Application Information')).toBeTruthy();

    LEGAL_ROWS.forEach((row) => fireEvent.press(screen.getByText(row.title)));
    expect(router.push).toHaveBeenCalledWith('/settings/terms');
    expect(router.push).toHaveBeenCalledWith('/settings/privacy');
    expect(router.push).toHaveBeenCalledWith('/settings/refund-policy');
    expect(router.push).toHaveBeenCalledWith('/settings/licenses');
  });

  it('renders all license accreditations with accessible image labels', () => {
    render(<LicensesScreen />);
    expect(screen.getByText('Your payments are safe with us')).toBeTruthy();
    LICENSE_LOGOS.forEach((logo) => {
      expect(screen.getByLabelText(logo.accessibilityLabel)).toBeTruthy();
    });
  });

  it('opens web channels in an in-app browser and device channels through linking', async () => {
    render(<ContactScreen />);
    expect(screen.getByText('We are here to help')).toBeTruthy();
    expect(screen.getByText('Support Hours')).toBeTruthy();

    fireEvent.press(screen.getByText('Facebook'));
    await waitFor(() => expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      CONTACT_CHANNELS[0].url,
    ));

    fireEvent.press(screen.getByText('Email Support'));
    await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith(
      'mailto:support@aqwire.co',
    ));
  });
});
