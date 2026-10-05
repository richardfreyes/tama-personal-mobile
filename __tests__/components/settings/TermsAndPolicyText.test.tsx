import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider, TouchableRipple } from 'react-native-paper';
import TermsAndConditionsCheckbox from '../../../components/settings/TermsAndPolicyText';
import { renderWithProviders } from '../../../utils/test-utils';

const mockOpenBrowserAsync = jest.fn();
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: (...args: any[]) => mockOpenBrowserAsync(...args),
}));

function renderCheckbox(props: Record<string, any> = {}) {
  return renderWithProviders(
    <PaperProvider>
      <TermsAndConditionsCheckbox
        isChecked={false}
        onToggle={jest.fn()}
        {...(props as any)}
      />
    </PaperProvider>,
  );
}

describe('TermsAndConditionsCheckbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the extra text when provided', () => {
    renderCheckbox({ extraText: 'I confirm that' });
    expect(screen.getByText(/I confirm that/)).toBeTruthy();
  });

  it('calls onToggle when the checkbox is pressed', () => {
    const onToggle = jest.fn();
    renderCheckbox({ onToggle });
    fireEvent.press(screen.UNSAFE_getByType(TouchableRipple));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows the Terms and Conditions link when onTermsLinkPress is provided', () => {
    renderCheckbox({ onTermsLinkPress: jest.fn() });
    expect(screen.getByText('Terms and Conditions')).toBeTruthy();
  });

  it('calls onTermsLinkPress when the terms link is pressed', () => {
    const onTermsLinkPress = jest.fn();
    renderCheckbox({ onTermsLinkPress });
    fireEvent.press(screen.getByText('Terms and Conditions'));
    expect(onTermsLinkPress).toHaveBeenCalledTimes(1);
  });

  it('shows the Terms of Service and Privacy Policy links by default', () => {
    renderCheckbox();
    expect(screen.getByText('Terms of Service')).toBeTruthy();
    expect(screen.getByText(/Privacy Policy/)).toBeTruthy();
  });

  it('opens the terms URL in a browser when Terms of Service is pressed', async () => {
    renderCheckbox();
    fireEvent.press(screen.getByText('Terms of Service'));
    await waitFor(() =>
      expect(mockOpenBrowserAsync).toHaveBeenCalledWith(
        'https://pay.aqwire.io/terms',
      ),
    );
  });

  it('opens the privacy URL in a browser when Privacy Policy is pressed', async () => {
    renderCheckbox();
    fireEvent.press(screen.getByText(/Privacy Policy/));
    await waitFor(() =>
      expect(mockOpenBrowserAsync).toHaveBeenCalledWith(
        'https://pay.aqwire.io/privacy',
      ),
    );
  });

  it('uses custom policy link handlers instead of browser links when provided', () => {
    const onTermsLinkPress = jest.fn();
    const onPrivacyLinkPress = jest.fn();
    const onRefundLinkPress = jest.fn();

    renderCheckbox({
      onTermsLinkPress,
      onPrivacyLinkPress,
      onRefundLinkPress,
    });

    fireEvent.press(screen.getByText('Terms of Service'));
    fireEvent.press(screen.getByText(/Privacy Policy/));
    fireEvent.press(screen.getByText('Refund Policy'));

    expect(onTermsLinkPress).toHaveBeenCalledTimes(1);
    expect(onPrivacyLinkPress).toHaveBeenCalledTimes(1);
    expect(onRefundLinkPress).toHaveBeenCalledTimes(1);
    expect(mockOpenBrowserAsync).not.toHaveBeenCalled();
  });
});
