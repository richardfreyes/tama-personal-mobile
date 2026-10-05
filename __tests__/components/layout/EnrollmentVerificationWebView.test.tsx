
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { EnrollmentVerificationWebView } from '../../../components/layout/EnrollmentVerificationWebView';
import { Colors } from '../../../styles/common/colors';
import { renderWithProviders } from '../../../utils/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  const MockWebView = (props: any) => (
    <View
      testID="webview"
      {...props}
    />
  );
  return { WebView: MockWebView };
});

const DEFAULT_PROPS = {
  url: 'https://verify.example.com/enrollment/abc-123',
  accessSignature: 'sig_test_abc123',
  accessType: 'view',
  onComplete: jest.fn(),
};

describe('EnrollmentVerificationWebView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the modal with the header title', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    expect(screen.getByText('Enrollment Verification')).toBeTruthy();
  });

  it('renders a cancellation control', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('centers the title against equal full-screen bounds while keeping Cancel trailing', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const titleContainerStyle = StyleSheet.flatten(
      screen.getByTestId('enrollment-verification-header-title').props.style,
    );
    const cancelButtonStyle = StyleSheet.flatten(
      screen.getByLabelText('Cancel enrollment verification').props.style,
    );
    const cancelTextStyle = StyleSheet.flatten(screen.getByText('Cancel').props.style);

    expect(titleContainerStyle).toMatchObject({
      left: 72,
      position: 'absolute',
      right: 72,
    });
    expect(cancelButtonStyle).toMatchObject({
      position: 'absolute',
      right: 16,
    });
    expect(cancelTextStyle.color).toBe(Colors.red10);
  });

  it('renders the WebView with the correct source url', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');
    expect(webView.props.source).toEqual({ uri: DEFAULT_PROPS.url });
  });

  it('passes javaScriptEnabled and domStorageEnabled to the WebView', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');
    expect(webView.props.javaScriptEnabled).toBe(true);
    expect(webView.props.domStorageEnabled).toBe(true);
  });

  it('allows https, local development, and the enrollment callback origin', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');
    expect(webView.props.originWhitelist).toEqual([
      'https://*',
      'http://*',
      'personaldashboardmob://enrollment-result*',
    ]);
  });

  it('injects a script that sets accessSignature and accessType in sessionStorage', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');
    const script = webView.props.injectedJavaScriptBeforeContentLoaded as string;

    expect(script).toContain('sessionStorage.setItem');
    expect(script).toContain(JSON.stringify(DEFAULT_PROPS.accessSignature));
    expect(script).toContain(JSON.stringify(DEFAULT_PROPS.accessType));
  });

  it('properly escapes special characters in the injected script', () => {
    const props = {
      ...DEFAULT_PROPS,
      accessSignature: 'sig"with\'special<chars>&more',
      accessType: 'edit"type',
    };
    renderWithProviders(<EnrollmentVerificationWebView {...props} />);
    const webView = screen.getByTestId('webview');
    const script = webView.props.injectedJavaScriptBeforeContentLoaded as string;

    expect(script).toContain(JSON.stringify(props.accessSignature));
    expect(script).toContain(JSON.stringify(props.accessType));
  });

  it('shows the centered native completion card after the backend success callback finishes loading', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');

    fireEvent(webView, 'navigationStateChange', {
      url: 'http://local-api.example/merchants/demo/enrollments/enr-123/cko/success?xsrf=token',
      loading: false,
    });

    expect(screen.getByTestId('enrollment-verification-completion')).toBeTruthy();
    expect(screen.getByText('Verification complete')).toBeTruthy();
    expect(screen.getByText('Verification complete. You may return to the app.')).toBeTruthy();
    expect(screen.getByText('Return to app')).toBeTruthy();
    expect(screen.queryByText('Cancel')).toBeNull();
    expect(screen.queryByLabelText('Cancel enrollment verification')).toBeNull();
    expect(screen.queryByTestId('webview')).toBeNull();
    expect(DEFAULT_PROPS.onComplete).not.toHaveBeenCalled();

    const completionAreaStyle = StyleSheet.flatten(
      screen.getByTestId('enrollment-verification-completion').props.contentContainerStyle,
    );
    const completionCardStyle = StyleSheet.flatten(
      screen.getByTestId('enrollment-verification-completion-card').props.style,
    );
    const returnButtonStyle = StyleSheet.flatten(
      screen.getByTestId('return-to-app-button').props.style,
    );

    expect(completionAreaStyle).toMatchObject({
      alignItems: 'center',
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 34,
    });
    expect(completionCardStyle).toMatchObject({
      alignItems: 'center',
      maxWidth: 440,
      width: '100%',
    });
    expect(returnButtonStyle.backgroundColor).toBe(Colors.red10);

    fireEvent.press(screen.getByTestId('return-to-app-button'));

    expect(DEFAULT_PROPS.onComplete).toHaveBeenCalledWith({
      outcome: 'success',
      message: 'Verification complete. You may return to the app.',
    });
  });

  it('completes only once after repeated success callback events', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');
    const callbackState = {
      url: 'https://api.example.com/merchants/demo/enrollments/enr-123/cko/success',
      loading: false,
    };

    fireEvent(webView, 'navigationStateChange', callbackState);
    fireEvent(webView, 'navigationStateChange', callbackState);
    fireEvent.press(screen.getByTestId('return-to-app-button'));
    fireEvent.press(screen.getByTestId('return-to-app-button'));

    expect(DEFAULT_PROPS.onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onComplete while the backend success callback is still loading', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');

    fireEvent(webView, 'navigationStateChange', {
      url: 'https://api.example.com/merchants/demo/enrollments/enr-123/cko/success',
      loading: true,
    });

    expect(DEFAULT_PROPS.onComplete).not.toHaveBeenCalled();
  });

  it('does not call onComplete for the old receipt page', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');

    fireEvent(webView, 'navigationStateChange', {
      url: 'https://api.example.com/enrollments/receipt/enr-123/view',
      loading: false,
    });

    expect(DEFAULT_PROPS.onComplete).not.toHaveBeenCalled();
  });

  it('intercepts the deep-link result and passes decoded callback parameters', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');
    const shouldLoad = webView.props.onShouldStartLoadWithRequest({
      url: 'personaldashboardmob://enrollment-result?outcome=failure&message=Card+verification+failed%2E',
    });

    expect(shouldLoad).toBe(false);
    expect(DEFAULT_PROPS.onComplete).toHaveBeenCalledWith({
      outcome: 'failure',
      message: 'Card verification failed.',
    });
  });

  it('shows deep-link success in the native completion card before returning to the app', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');
    let shouldLoad = true;

    act(() => {
      shouldLoad = webView.props.onShouldStartLoadWithRequest({
        url: 'personaldashboardmob://enrollment-result?outcome=success&message=Verification+complete%2E+You+may+return+to+the+app%2E',
      });
    });

    expect(shouldLoad).toBe(false);
    expect(screen.getByText('Verification complete')).toBeTruthy();
    expect(DEFAULT_PROPS.onComplete).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Return to app'));

    expect(DEFAULT_PROPS.onComplete).toHaveBeenCalledWith({
      outcome: 'success',
      message: 'Verification complete. You may return to the app.',
    });
  });

  it('allows the backend success callback to load so the enrollment is finalized', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');
    let shouldLoad = false;

    act(() => {
      shouldLoad = webView.props.onShouldStartLoadWithRequest({
        url: 'https://api.example.com/merchants/demo/enrollments/enr-123/cko/success?xsrf=token',
      });
    });

    expect(shouldLoad).toBe(true);
    expect(DEFAULT_PROPS.onComplete).not.toHaveBeenCalled();
  });

  it('covers the WebView with a loading state while the success callback finalizes', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');

    expect(screen.queryByTestId('enrollment-verification-finalizing')).toBeNull();

    act(() => {
      webView.props.onShouldStartLoadWithRequest({
        url: 'https://api.example.com/merchants/demo/enrollments/enr-123/cko/success?xsrf=token',
      });
    });

    expect(screen.getByTestId('enrollment-verification-finalizing')).toBeTruthy();
    expect(screen.getByTestId('webview')).toBeTruthy();
    expect(screen.queryByText('Cancel')).toBeNull();
    expect(DEFAULT_PROPS.onComplete).not.toHaveBeenCalled();

    fireEvent(webView, 'navigationStateChange', {
      url: 'https://api.example.com/merchants/demo/enrollments/enr-123/cko/success?xsrf=token',
      loading: false,
    });

    expect(screen.getByText('Verification complete')).toBeTruthy();
    expect(screen.queryByTestId('webview')).toBeNull();
  });

  it('allows the backend error callback to load and reports failure once it resolves', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);
    const webView = screen.getByTestId('webview');
    let shouldLoad = false;

    act(() => {
      shouldLoad = webView.props.onShouldStartLoadWithRequest({
        url: 'https://api.example.com/merchants/demo/enrollments/enr-123/cko/error?xsrf=token',
      });
    });

    expect(shouldLoad).toBe(true);
    expect(screen.getByTestId('enrollment-verification-finalizing')).toBeTruthy();
    expect(DEFAULT_PROPS.onComplete).not.toHaveBeenCalled();

    fireEvent(webView, 'navigationStateChange', {
      url: 'https://api.example.com/merchants/demo/enrollments/enr-123/cko/error?xsrf=token',
      loading: false,
    });

    expect(DEFAULT_PROPS.onComplete).toHaveBeenCalledWith({
      outcome: 'failure',
      message: 'Card verification failed. Please try again.',
    });
  });

  it('reports user cancellation and closes only once', () => {
    renderWithProviders(<EnrollmentVerificationWebView {...DEFAULT_PROPS} />);

    fireEvent.press(screen.getByText('Cancel'));
    fireEvent.press(screen.getByText('Cancel'));

    expect(DEFAULT_PROPS.onComplete).toHaveBeenCalledTimes(1);
    expect(DEFAULT_PROPS.onComplete).toHaveBeenCalledWith({
      outcome: 'cancelled',
      message: 'Verification was cancelled. You can try again when you are ready.',
    });
  });

  it('renders with a different url', () => {
    const customUrl = 'https://other.example.com/verify/xyz';
    renderWithProviders(
      <EnrollmentVerificationWebView {...DEFAULT_PROPS} url={customUrl} />,
    );
    const webView = screen.getByTestId('webview');
    expect(webView.props.source).toEqual({ uri: customUrl });
  });

  it('renders without crashing when url is an empty string', () => {
    const { toJSON } = renderWithProviders(
      <EnrollmentVerificationWebView {...DEFAULT_PROPS} url="" />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crashing when accessSignature is an empty string', () => {
    const { toJSON } = renderWithProviders(
      <EnrollmentVerificationWebView {...DEFAULT_PROPS} accessSignature="" />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
