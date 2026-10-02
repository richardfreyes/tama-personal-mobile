import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { OtpWebView } from '../../../components/layout/OtpWebView';
import { renderWithProviders } from '../../../utils/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-webview', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const MockWebView = (props: any) => <View testID="webview" {...props} />;
  return { WebView: MockWebView };
});

const baseProps = {
  url: 'https://verify.example.com/otp',
  visible: true,
  onComplete: jest.fn(),
  onSuccess: jest.fn(),
  onError: jest.fn(),
};

const getWebView = () => screen.getByTestId('webview');

describe('OtpWebView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // ---- Rendering ----

  it('renders the default header title', () => {
    renderWithProviders(<OtpWebView {...baseProps} />);
    expect(screen.getByText('OTP Verification')).toBeTruthy();
  });

  it('renders a custom title', () => {
    renderWithProviders(<OtpWebView {...baseProps} title="Verify Card" />);
    expect(screen.getByText('Verify Card')).toBeTruthy();
  });

  it('covers the verification page with a processing state during native completion', () => {
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        isProcessing
        processingLabel="Completing your payment"
      />,
    );
    expect(screen.getByTestId('native-loading-indicator').props.accessibilityLabel)
      .toBe('Completing your payment');
  });

  it('shows the wait hint under the header', () => {
    renderWithProviders(<OtpWebView {...baseProps} waitHint="Wait a few seconds." />);
    expect(screen.getByText('Wait a few seconds.')).toBeTruthy();
  });

  it('keeps waiting instead of closing when Done is tapped with waitOnDismiss', () => {
    jest.useFakeTimers();
    renderWithProviders(<OtpWebView {...baseProps} waitOnDismiss />);

    fireEvent.press(screen.getByText('Done'));

    expect(baseProps.onComplete).not.toHaveBeenCalled();
    expect(screen.getByTestId('native-loading-indicator').props.accessibilityLabel)
      .toBe('Waiting for confirmation');
  });

  it('completes normally when the redirect arrives while waiting', () => {
    jest.useFakeTimers();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        waitOnDismiss
        successMode="message"
        successUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/]}
      />,
    );

    fireEvent.press(screen.getByText('Done'));
    act(() => {
      getWebView().props.onShouldStartLoadWithRequest({
        url: 'https://api.example.com/gateway/maya/vault/ref123/success',
        isTopFrame: true,
      });
      getWebView().props.onShouldStartLoadWithRequest({
        url: 'https://app.example.com/dashboard/payment-methods',
        isTopFrame: true,
      });
    });
    act(() => { jest.advanceTimersByTime(20000); });

    expect(baseProps.onSuccess).toHaveBeenCalledTimes(1);
    expect(baseProps.onComplete).not.toHaveBeenCalled();
    expect(baseProps.onError).not.toHaveBeenCalled();
  });

  it('gives up with an error when no redirect arrives in time', () => {
    jest.useFakeTimers();
    renderWithProviders(<OtpWebView {...baseProps} waitOnDismiss />);

    fireEvent.press(screen.getByText('Done'));
    act(() => { jest.advanceTimersByTime(14000); });
    expect(baseProps.onComplete).not.toHaveBeenCalled();

    act(() => { jest.advanceTimersByTime(2000); });
    expect(baseProps.onError).toHaveBeenCalledWith('Card verification did not finish. Please try again.');
    expect(baseProps.onComplete).toHaveBeenCalledTimes(1);
  });

  it('closes straight away on Done when waitOnDismiss is not set', () => {
    renderWithProviders(<OtpWebView {...baseProps} />);

    fireEvent.press(screen.getByText('Done'));

    expect(baseProps.onComplete).toHaveBeenCalledTimes(1);
  });

  it('covers the page while the success callback is running', () => {
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        successMode="message"
        successUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/]}
      />,
    );
    expect(screen.queryByTestId('native-loading-indicator')).toBeNull();

    act(() => {
      getWebView().props.onShouldStartLoadWithRequest({
        url: 'https://api.example.com/gateway/maya/vault/ref123/success',
        isTopFrame: true,
      });
    });

    expect(screen.getByTestId('native-loading-indicator')).toBeTruthy();
  });

  it('renders the Done button', () => {
    renderWithProviders(<OtpWebView {...baseProps} />);
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('passes the url to the WebView source', () => {
    renderWithProviders(<OtpWebView {...baseProps} />);
    expect(getWebView().props.source).toEqual({ uri: baseProps.url });
  });

  it('passes injectedJavaScript through to the WebView', () => {
    renderWithProviders(
      <OtpWebView {...baseProps} injectedJavaScript="window.foo = 1;" />,
    );
    expect(getWebView().props.injectedJavaScript).toBe('window.foo = 1;');
  });

  it('does not render content when not visible', () => {
    renderWithProviders(<OtpWebView {...baseProps} visible={false} />);
    expect(screen.queryByText('Done')).toBeNull();
  });

  // ---- Dismiss ----

  it('calls onComplete when Done is pressed', () => {
    const onComplete = jest.fn();
    renderWithProviders(<OtpWebView {...baseProps} onComplete={onComplete} />);
    fireEvent.press(screen.getByText('Done'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete only once even if Done is pressed repeatedly', () => {
    const onComplete = jest.fn();
    renderWithProviders(<OtpWebView {...baseProps} onComplete={onComplete} />);
    const done = screen.getByText('Done');
    fireEvent.press(done);
    fireEvent.press(done);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // ---- Navigation-based success detection ----

  it('calls onSuccess and onComplete when navigating to a success url', () => {
    const onSuccess = jest.fn();
    const onComplete = jest.fn();
    renderWithProviders(
      <OtpWebView {...baseProps} onSuccess={onSuccess} onComplete={onComplete} />,
    );
    act(() => {
      getWebView().props.onNavigationStateChange({
        url: 'https://verify.example.com/otp-success',
        loading: false,
      });
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('ignores navigation to a non-success url', () => {
    const onSuccess = jest.fn();
    const onComplete = jest.fn();
    renderWithProviders(
      <OtpWebView {...baseProps} onSuccess={onSuccess} onComplete={onComplete} />,
    );
    act(() => {
      getWebView().props.onNavigationStateChange({
        url: 'https://verify.example.com/still-here',
        loading: false,
      });
    });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('honours custom success url patterns', () => {
    const onComplete = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onComplete={onComplete}
        successUrlPatterns={['payment-done']}
      />,
    );
    act(() => {
      getWebView().props.onNavigationStateChange({
        url: 'https://verify.example.com/payment-done',
      });
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('honours regular expression success url patterns', () => {
    const onComplete = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onComplete={onComplete}
        successUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/]}
      />,
    );
    act(() => {
      getWebView().props.onNavigationStateChange({
        url: 'http://localhost:8800/gateway/maya/vault/instrument_123/success',
        loading: false,
      });
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('waits for a success url to finish loading before completing', () => {
    const onComplete = jest.fn();
    renderWithProviders(
      <OtpWebView {...baseProps} onComplete={onComplete} />,
    );
    act(() => {
      getWebView().props.onNavigationStateChange({
        url: 'https://verify.example.com/otp-success',
        loading: true,
      });
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('reports message-based success to the native app exactly once', () => {
    const onComplete = jest.fn();
    const onSuccess = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onComplete={onComplete}
        onSuccess={onSuccess}
        successMode="message"
      />,
    );

    act(() => {
      getWebView().props.onMessage({
        nativeEvent: { data: JSON.stringify({ type: 'success' }) },
      });
      getWebView().props.onMessage({
        nativeEvent: { data: JSON.stringify({ status: 'success' }) },
      });
      getWebView().props.onNavigationStateChange({
        url: 'https://verify.example.com/otp-success',
        loading: false,
      });
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('blocks the web redirect after the success callback and completes natively', () => {
    const callbackUrl = 'http://localhost:8810/gateway/maya/vault/instrument_123/success';
    const onComplete = jest.fn();
    const onSuccess = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onComplete={onComplete}
        onSuccess={onSuccess}
        successMode="message"
        successUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/]}
      />,
    );

    expect(getWebView().props.onShouldStartLoadWithRequest({
      url: callbackUrl,
      isTopFrame: true,
    })).toBe(true);

    expect(getWebView().props.onShouldStartLoadWithRequest({
      url: 'http://localhost:3000/login',
      isTopFrame: true,
    })).toBe(false);

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  // ---- Declined / failed card verification ----

  it('arms on the failed callback and reports a decline on the follow-up web redirect', () => {
    const failedCallbackUrl = 'http://localhost:8810/gateway/maya/vault/instrument_123/failed';
    const onFailure = jest.fn();
    const onSuccess = jest.fn();
    const onComplete = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onComplete={onComplete}
        onSuccess={onSuccess}
        onFailure={onFailure}
        successMode="message"
        successUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/]}
        failureUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/(?:failed|cancelled)(?:[?#]|$)/]}
      />,
    );

    // The failed callback loads so the backend can clean up the pending card...
    expect(getWebView().props.onShouldStartLoadWithRequest({
      url: failedCallbackUrl,
      isTopFrame: true,
    })).toBe(true);

    // ...then the redirect to the web dashboard is blocked and reported as a decline.
    expect(getWebView().props.onShouldStartLoadWithRequest({
      url: 'https://app.aqwire.io/dashboard/payment-methods',
      isTopFrame: true,
    })).toBe(false);

    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('reports a decline when the failed callback answers with an HTTP error body', () => {
    const onFailure = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onFailure={onFailure}
        successMode="message"
        successUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/]}
        failureUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/(?:failed|cancelled)(?:[?#]|$)/]}
      />,
    );

    act(() => {
      getWebView().props.onHttpError({
        nativeEvent: { statusCode: 400, url: 'http://localhost:8810/gateway/maya/vault/instrument_123/failed' },
      });
    });

    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('reports a decline when the failed callback finishes loading without redirecting', () => {
    const onFailure = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onFailure={onFailure}
        successMode="message"
        failureUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/(?:failed|cancelled)(?:[?#]|$)/]}
      />,
    );

    act(() => {
      getWebView().props.onNavigationStateChange({
        url: 'http://localhost:8810/gateway/maya/vault/instrument_123/failed',
        loading: false,
      });
    });

    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('reports a decline when the failed callback hangs', () => {
    jest.useFakeTimers();
    const onFailure = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onFailure={onFailure}
        successMode="message"
        failureUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/(?:failed|cancelled)(?:[?#]|$)/]}
      />,
    );

    expect(getWebView().props.onShouldStartLoadWithRequest({
      url: 'http://localhost:8810/gateway/maya/vault/instrument_123/failed',
      isTopFrame: true,
    })).toBe(true);
    expect(onFailure).not.toHaveBeenCalled();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('reports a decline on a failed/declined WebView message', () => {
    const onFailure = jest.fn();
    const onSuccess = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onFailure={onFailure}
        onSuccess={onSuccess}
        successMode="message"
      />,
    );

    act(() => {
      getWebView().props.onMessage({
        nativeEvent: { data: JSON.stringify({ status: 'declined' }) },
      });
    });

    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('does not treat callback page subresources as the post-success redirect', () => {
    const callbackUrl = 'http://localhost:8810/gateway/maya/vault/instrument_123/success';
    const onSuccess = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onSuccess={onSuccess}
        successMode="message"
        successUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/]}
      />,
    );

    getWebView().props.onShouldStartLoadWithRequest({
      url: callbackUrl,
      isTopFrame: true,
    });

    expect(getWebView().props.onShouldStartLoadWithRequest({
      url: 'http://localhost:8810/assets/success.css',
      isTopFrame: false,
    })).toBe(true);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('ignores non-success and malformed WebView messages', () => {
    const onSuccess = jest.fn();
    renderWithProviders(
      <OtpWebView {...baseProps} onSuccess={onSuccess} successMode="message" />,
    );

    act(() => {
      getWebView().props.onMessage({
        nativeEvent: { data: JSON.stringify({ type: 'failure' }) },
      });
      getWebView().props.onMessage({ nativeEvent: { data: 'not-json' } });
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  // ---- URL scheme guarding ----

  it('allows https navigation requests', () => {
    renderWithProviders(<OtpWebView {...baseProps} />);
    expect(
      getWebView().props.onShouldStartLoadWithRequest({
        url: 'https://verify.example.com/page',
      }),
    ).toBe(true);
  });

  it('allows http navigation requests for a local API environment', () => {
    renderWithProviders(<OtpWebView {...baseProps} />);
    expect(getWebView().props.originWhitelist).toEqual([
      'https://*',
      'http://*',
      'about:*',
      'localhost:*',
    ]);
    expect(
      getWebView().props.onShouldStartLoadWithRequest({
        url: 'http://localhost:8800/gateway/maya/vault/instrument_123/success',
      }),
    ).toBe(true);
  });

  it('rewrites a scheme-less local callback to the configured API origin', () => {
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        successUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/]}
      />,
    );

    act(() => {
      expect(
        getWebView().props.onShouldStartLoadWithRequest({
          url: 'localhost:8810/gateway/maya/vault/instrument_123/success',
        }),
      ).toBe(false);
    });

    expect(getWebView().props.source).toEqual({
      uri: 'http://localhost:8810/gateway/maya/vault/instrument_123/success',
    });
  });

  it('rewrites an absolute LAN callback to the configured local API host', () => {
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        successUrlPatterns={[/\/payment-methods\/direct-debit\/success(?:[?#]|$)/]}
      />,
    );

    act(() => {
      expect(
        getWebView().props.onShouldStartLoadWithRequest({
          url: 'http://192.168.100.149:8800/payment-methods/direct-debit/success?state=signed',
        }),
      ).toBe(false);
    });

    expect(getWebView().props.source).toEqual({
      uri: 'http://localhost:8800/payment-methods/direct-debit/success?state=signed',
    });
  });

  it('rewrites a local callback with the wrong protocol to the configured protocol', () => {
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        successUrlPatterns={[/\/payment-methods\/direct-debit\/success(?:[?#]|$)/]}
      />,
    );

    act(() => {
      expect(
        getWebView().props.onShouldStartLoadWithRequest({
          url: 'https://192.168.100.149:8800/payment-methods/direct-debit/success?state=signed',
        }),
      ).toBe(false);
    });

    expect(getWebView().props.source).toEqual({
      uri: 'http://localhost:8800/payment-methods/direct-debit/success?state=signed',
    });
  });

  it('rewrites a scheme-less failed callback and dismisses the declined verification', () => {
    const onFailure = jest.fn();
    const failedCallbackUrl = 'localhost:8810/gateway/maya/vault/instrument_123/failed';
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onFailure={onFailure}
        successMode="message"
        failureUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/(?:failed|cancelled)(?:[?#]|$)/]}
      />,
    );

    act(() => {
      expect(getWebView().props.onShouldStartLoadWithRequest({
        url: failedCallbackUrl,
        isTopFrame: true,
      })).toBe(false);
    });

    expect(getWebView().props.source).toEqual({
      uri: `http://${failedCallbackUrl}`,
    });

    act(() => {
      getWebView().props.onNavigationStateChange({
        url: `http://${failedCallbackUrl}`,
        loading: false,
      });
    });

    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('blocks non-allowed scheme navigation requests', () => {
    renderWithProviders(<OtpWebView {...baseProps} />);
    expect(
      getWebView().props.onShouldStartLoadWithRequest({ url: 'tel:12345' }),
    ).toBe(false);
  });

  // ---- Error handling ----

  it('calls onError with a friendly message when the WebView errors', () => {
    const onError = jest.fn();
    renderWithProviders(<OtpWebView {...baseProps} onError={onError} />);
    act(() => {
      getWebView().props.onError();
    });
    expect(onError).toHaveBeenCalledWith(
      'Failed to load the verification page. Please try again.',
    );
  });

  it('does not complete when the success callback returns an HTTP error', () => {
    const callbackUrl = 'http://localhost:8810/gateway/maya/vault/instrument_123/success';
    const onComplete = jest.fn();
    const onError = jest.fn();
    const onSuccess = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onComplete={onComplete}
        onError={onError}
        onSuccess={onSuccess}
        successUrlPatterns={[/\/gateway\/maya\/vault\/[^/?#]+\/success(?:[?#]|$)/]}
      />,
    );

    act(() => {
      getWebView().props.onShouldStartLoadWithRequest({
        url: callbackUrl,
        isTopFrame: true,
      });
      getWebView().props.onLoadStart({ nativeEvent: { url: callbackUrl } });
      getWebView().props.onHttpError({
        nativeEvent: {
          url: callbackUrl,
          statusCode: 404,
        },
      });
      getWebView().props.onNavigationStateChange({
        url: callbackUrl,
        loading: false,
      });
    });

    expect(getWebView().props.onShouldStartLoadWithRequest({
      url: 'http://localhost:3000/login',
      isTopFrame: true,
    })).toBe(true);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      'Card verification could not be completed (HTTP 404). Please try again.',
    );
  });

  it('does not complete when the success callback has a WebView transport error', () => {
    const callbackUrl = 'http://localhost:8800/payment-methods/direct-debit/success?state=signed';
    const onComplete = jest.fn();
    const onError = jest.fn();
    const onSuccess = jest.fn();
    renderWithProviders(
      <OtpWebView
        {...baseProps}
        onComplete={onComplete}
        onError={onError}
        onSuccess={onSuccess}
        successUrlPatterns={[/\/payment-methods\/direct-debit\/success(?:[?#]|$)/]}
      />,
    );

    act(() => {
      getWebView().props.onLoadStart({ nativeEvent: { url: callbackUrl } });
      getWebView().props.onError({ nativeEvent: { url: callbackUrl } });
      getWebView().props.onNavigationStateChange({
        url: callbackUrl,
        loading: false,
      });
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      'Failed to load the verification page. Please try again.',
    );
  });
});
