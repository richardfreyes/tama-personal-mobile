import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import ResendCodeTimer from '../../../components/common/ResendCodeTimer';
import { renderWithProviders } from '../../../utils/test-utils';

describe('ResendCodeTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('shows the waiting message with the formatted seconds while counting down', () => {
    renderWithProviders(<ResendCodeTimer initialTime={3} onResend={jest.fn()} />);
    expect(
      screen.getByText(
        'Please wait 3s before requesting for a new code.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Resend Code')).toBeNull();
  });

  it('formats minutes and seconds for times over a minute', () => {
    renderWithProviders(<ResendCodeTimer initialTime={65} onResend={jest.fn()} />);
    expect(
      screen.getByText(
        'Please wait 1m 5s before requesting for a new code.',
      ),
    ).toBeTruthy();
  });

  it('shows the resend link once the countdown reaches zero', async () => {
    renderWithProviders(<ResendCodeTimer initialTime={3} onResend={jest.fn()} />);
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    await waitFor(() => {
      expect(screen.getByText('Resend Code')).toBeTruthy();
    });
    expect(screen.getByText("Didn't receive the code? ")).toBeTruthy();
  });

  it('calls onResend and restarts the countdown when the link is pressed', async () => {
    const onResend = jest.fn();
    renderWithProviders(<ResendCodeTimer initialTime={2} onResend={onResend} />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => expect(screen.getByText('Resend Code')).toBeTruthy());

    fireEvent.press(screen.getByText('Resend Code'));
    expect(onResend).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(
        screen.getByText('Please wait 2s before requesting for a new code.'),
      ).toBeTruthy(),
    );
  });
});
