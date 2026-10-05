import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { Linking } from 'react-native';
import { AutoDebitTermsModal } from '../../../components/layout/AutoDebitTermsModal';
import { renderWithProviders } from '../../../utils/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('AutoDebitTermsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'openURL').mockImplementation(jest.fn() as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the title when visible', () => {
    renderWithProviders(<AutoDebitTermsModal visible onClose={jest.fn()} />);
    expect(
      screen.getByText('Auto-Debit Enrollment Terms & Conditions'),
    ).toBeTruthy();
  });

  it('renders nothing when not visible', () => {
    renderWithProviders(
      <AutoDebitTermsModal visible={false} onClose={jest.fn()} />,
    );
    expect(
      screen.queryByText('Auto-Debit Enrollment Terms & Conditions'),
    ).toBeNull();
  });

  it('renders the numbered clauses', () => {
    renderWithProviders(<AutoDebitTermsModal visible onClose={jest.fn()} />);
    expect(screen.getByText(/recurring payment program/)).toBeTruthy();
    expect(
      screen.getByText(/required to submit separate Auto Debit enrollments/),
    ).toBeTruthy();
  });

  it('opens the support email when the email link is pressed', () => {
    renderWithProviders(<AutoDebitTermsModal visible onClose={jest.fn()} />);
    fireEvent.press(screen.getAllByText('support@aqwire.co')[0]);
    expect(Linking.openURL).toHaveBeenCalledWith('mailto:support@aqwire.co');
  });

  it('opens the phone dialler when the phone link is pressed', () => {
    renderWithProviders(<AutoDebitTermsModal visible onClose={jest.fn()} />);
    fireEvent.press(screen.getByText('+1 408-335-0522 (USA)'));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:+14083350522');
  });

  it('calls onClose when the Close button is pressed', () => {
    const onClose = jest.fn();
    renderWithProviders(<AutoDebitTermsModal visible onClose={onClose} />);
    fireEvent.press(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
