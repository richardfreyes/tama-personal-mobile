import { NativeLoadingIndicator } from '@/components/common/Loading';
import { VALIDATORS } from '@/constants';
import { COMMON } from '@/constants/common';
import { ENV_CONFIG } from '@/constants/env';
import { Colors } from '@/styles/common/colors';
import { otpWebViewStyles as styles } from '@/styles/components/layout/OtpWebView';
import { OtpWebViewProps } from '@/types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import type { ShouldStartLoadRequest, WebViewErrorEvent, WebViewHttpErrorEvent, WebViewMessageEvent, WebViewNavigationEvent } from 'react-native-webview/lib/WebViewTypes';

const TAG = '[OtpWebView]';

// Path only: callback URLs carry reference ids and the provider's query strings are not needed to debug
const describeUrl = (rawUrl: string): string => {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.host}${parsed.pathname}`;
  } catch {
    return 'unparseable-url';
  }
};

export const OtpWebView = ({
  url,
  title = 'OTP Verification',
  visible,
  isProcessing = false,
  processingLabel = 'Completing verification',
  waitHint,
  waitOnDismiss = false,
  onComplete,
  onSuccess,
  onError,
  onFailure,
  injectedJavaScript,
  successUrlPatterns,
  failureUrlPatterns,
  successMode = 'navigation',
}: OtpWebViewProps) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const hasCompletedRef = useRef(false);
  const failedSuccessUrlRef = useRef<string | null>(null);
  const successCallbackStartedRef = useRef(false);
  const failureCallbackStartedRef = useRef(false);
  const failureCallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sourceUrl, setSourceUrl] = useState(url);
  const [isCompletingCallback, setIsCompletingCallback] = useState(false);
  const [isWaitingOnDismiss, setIsWaitingOnDismiss] = useState(false);
  const dismissWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const patterns = successUrlPatterns ?? COMMON.WEBVIEW.DEFAULT_SUCCESS_PATTERNS;
  const failurePatterns = useMemo(() => failureUrlPatterns ?? [], [failureUrlPatterns]);
  const isLocalApi = ENV_CONFIG.base.startsWith('http://');
  const allowedSchemes = useMemo(
    () => isLocalApi
      ? [...COMMON.WEBVIEW.ALLOWED_SCHEMES, 'http:']
      : COMMON.WEBVIEW.ALLOWED_SCHEMES,
    [isLocalApi],
  );
  const originWhitelist = useMemo(
    () => isLocalApi
      ? ['https://*', 'http://*', 'about:*', 'localhost:*']
      : ['https://*', 'about:*'],
    [isLocalApi],
  );

  const clearFailureCallbackTimer = useCallback(() => {
    if (failureCallbackTimerRef.current) {
      clearTimeout(failureCallbackTimerRef.current);
      failureCallbackTimerRef.current = null;
    }
    if (dismissWaitTimerRef.current) {
      clearTimeout(dismissWaitTimerRef.current);
      dismissWaitTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (visible) {
      clearFailureCallbackTimer();
      hasCompletedRef.current = false;
      failedSuccessUrlRef.current = null;
      successCallbackStartedRef.current = false;
      failureCallbackStartedRef.current = false;
      setIsCompletingCallback(false);
      setIsWaitingOnDismiss(false);
      setSourceUrl(url);
    }

    return clearFailureCallbackTimer;
  }, [clearFailureCallbackTimer, visible, url]);

  const isSuccessUrl = useCallback((navUrl: string): boolean => {
    if (!navUrl) return false;

    if (COMMON.WEBVIEW.IGNORED_URL_PREFIXES.some(prefix => navUrl.startsWith(prefix))) {
      return false;
    }

    return patterns.some(pattern => {
      if (typeof pattern === 'string') {
        return navUrl.includes(pattern);
      }

      return new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '')).test(navUrl);
    });
  }, [patterns]);

  const isFailureUrl = useCallback((navUrl: string): boolean => {
    if (!navUrl || failurePatterns.length === 0) return false;

    if (COMMON.WEBVIEW.IGNORED_URL_PREFIXES.some(prefix => navUrl.startsWith(prefix))) {
      return false;
    }

    return failurePatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return navUrl.includes(pattern);
      }

      return new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, '')).test(navUrl);
    });
  }, [failurePatterns]);

  const normalizeLocalCallbackUrl = useCallback((requestUrl: string): string | null => {
    if (!isSuccessUrl(requestUrl) && !isFailureUrl(requestUrl)) return null;

    const apiUrl = new URL(ENV_CONFIG.base);
    const schemeLessLocalUrl = VALIDATORS.LOCAL_URL_WITHOUT_SCHEME.test(requestUrl);
    let callbackUrl: URL;

    try {
      callbackUrl = new URL(
        schemeLessLocalUrl ? `${apiUrl.protocol}//${requestUrl}` : requestUrl,
      );
    } catch {
      return null;
    }

    const isLocalCallbackHost = callbackUrl.hostname === 'localhost'
      || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(callbackUrl.hostname);
    if (!isLocalCallbackHost) return null;

    const originalUrl = callbackUrl.toString();
    callbackUrl.protocol = apiUrl.protocol;
    callbackUrl.hostname = apiUrl.hostname;
    if (!isLocalApi) {
      callbackUrl.port = apiUrl.port;
    }

    const normalizedUrl = callbackUrl.toString();
    return !schemeLessLocalUrl && normalizedUrl === originalUrl ? null : normalizedUrl;
  }, [isFailureUrl, isLocalApi, isSuccessUrl]);

  const dismiss = useCallback(() => {
    if (hasCompletedRef.current) return;

    console.log(TAG, 'closed with Done before a result');
    clearFailureCallbackTimer();
    hasCompletedRef.current = true;
    onComplete();
  }, [clearFailureCallbackTimer, onComplete]);

  const handleDismiss = useCallback(() => {
    if (hasCompletedRef.current) return;

    if (!waitOnDismiss) {
      dismiss();
      return;
    }

    // The provider redirects on its own a few seconds after its confirmation page appears, so
    // closing now would cancel a card that is about to be verified. Wait for that redirect instead.
    if (dismissWaitTimerRef.current) return;

    console.log(TAG, 'Done tapped, waiting for the provider redirect');
    setIsWaitingOnDismiss(true);
    dismissWaitTimerRef.current = setTimeout(() => {
      dismissWaitTimerRef.current = null;
      if (hasCompletedRef.current) return;

      console.log(TAG, 'no provider redirect after waiting, giving up');
      setIsWaitingOnDismiss(false);
      onError?.('Card verification did not finish. Please try again.');
      dismiss();
    }, COMMON.WEBVIEW.DISMISS_WAIT_TIMEOUT_MS);
  }, [dismiss, onError, waitOnDismiss]);

  const completeNativeSuccess = useCallback(() => {
    if (hasCompletedRef.current) return;

    console.log(TAG, 'success: callback finished and redirected on');
    clearFailureCallbackTimer();
    hasCompletedRef.current = true;
    successCallbackStartedRef.current = false;
    onSuccess?.();
  }, [clearFailureCallbackTimer, onSuccess]);

  const completeFailure = useCallback(() => {
    if (hasCompletedRef.current) return;

    console.log(TAG, `failure (success callback started=${successCallbackStartedRef.current}, failure callback started=${failureCallbackStartedRef.current})`);
    clearFailureCallbackTimer();
    hasCompletedRef.current = true;
    successCallbackStartedRef.current = false;
    failureCallbackStartedRef.current = false;
    onFailure?.();
  }, [clearFailureCallbackTimer, onFailure]);

  const armFailureCallbackTimer = useCallback(() => {
    if (failureCallbackTimerRef.current) return;

    failureCallbackTimerRef.current = setTimeout(
      completeFailure,
      COMMON.WEBVIEW.FAILURE_CALLBACK_TIMEOUT_MS,
    );
  }, [completeFailure]);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    const currentUrl = navState.url || '';

    if (hasCompletedRef.current) return;

    if (!navState.loading && isFailureUrl(currentUrl)) {
      completeFailure();
      return;
    }

    if (successMode === 'message') return;

    if (
      !navState.loading
      && isSuccessUrl(currentUrl)
      && failedSuccessUrlRef.current !== currentUrl
    ) {
      hasCompletedRef.current = true;
      onSuccess?.();
      onComplete();
      return;
    }
  }, [completeFailure, isFailureUrl, isSuccessUrl, onComplete, onSuccess, successMode]);

  const handleShouldStartLoadWithRequest = useCallback((request: ShouldStartLoadRequest): boolean => {
    if (hasCompletedRef.current) return false;

    const requestUrl = request.url || '';
    const isTopFrame = request.isTopFrame !== false;
    if (isTopFrame) console.log(TAG, 'navigating to', describeUrl(requestUrl));
    const isFailureCallback = successMode === 'message'
      && isTopFrame
      && isFailureUrl(requestUrl);

    if (isFailureCallback) {
      failureCallbackStartedRef.current = true;
      armFailureCallbackTimer();
    }

    const normalizedCallbackUrl = normalizeLocalCallbackUrl(requestUrl);

    if (normalizedCallbackUrl) {
      setSourceUrl(normalizedCallbackUrl);
      return false;
    }

    if (successMode === 'message' && isTopFrame) {
      if (isSuccessUrl(requestUrl)) {
        successCallbackStartedRef.current = true;
        setIsCompletingCallback(true);
      } else if (
        !isFailureCallback
        && !COMMON.WEBVIEW.IGNORED_URL_PREFIXES.some(prefix => requestUrl.startsWith(prefix))
      ) {
        if (successCallbackStartedRef.current) {
          completeNativeSuccess();
          return false;
        }
        if (failureCallbackStartedRef.current) {
          completeFailure();
          return false;
        }
      }
    }

    try {
      const parsed = new URL(requestUrl);
      return allowedSchemes.includes(parsed.protocol);
    } catch {
      return allowedSchemes.some(scheme => requestUrl.startsWith(scheme));
    }
  }, [allowedSchemes, armFailureCallbackTimer, completeFailure, completeNativeSuccess, isFailureUrl, isSuccessUrl, normalizeLocalCallbackUrl, successMode]);

  const handleLoadStart = useCallback((event: WebViewNavigationEvent) => {
    const requestUrl = event.nativeEvent.url || '';

    if (isSuccessUrl(requestUrl)) {
      failedSuccessUrlRef.current = null;
    }
  }, [isSuccessUrl]);

  const handleHttpError = useCallback((event: WebViewHttpErrorEvent) => {
    const { statusCode, url: requestUrl } = event.nativeEvent;
    console.log(TAG, `HTTP ${statusCode} from`, describeUrl(requestUrl));

    if (isFailureUrl(requestUrl)) {
      completeFailure();
      return;
    }

    if (!isSuccessUrl(requestUrl)) return;

    failedSuccessUrlRef.current = requestUrl;
    successCallbackStartedRef.current = false;
    setIsCompletingCallback(false);
    onError?.(`Card verification could not be completed (HTTP ${statusCode}). Please try again.`);
  }, [completeFailure, isFailureUrl, isSuccessUrl, onError]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    if (hasCompletedRef.current || successMode !== 'message') return;

    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        status?: string;
        type?: string;
      };
      const isSuccess = message.type === 'success' || message.status === 'success';
      const isFailure = message.type === 'failure'
        || message.type === 'failed'
        || message.status === 'failure'
        || message.status === 'failed'
        || message.status === 'declined';

      if (isSuccess) {
        completeNativeSuccess();
        return;
      }

      if (isFailure) {
        completeFailure();
      }
    } catch {
      // Ignore unrelated or malformed messages from the verification page.
    }
  }, [completeFailure, completeNativeSuccess, successMode]);

  const handleWebViewError = useCallback((event?: WebViewErrorEvent) => {
    const requestUrl = event?.nativeEvent?.url || '';
    if (isSuccessUrl(requestUrl)) {
      failedSuccessUrlRef.current = requestUrl;
      successCallbackStartedRef.current = false;
      setIsCompletingCallback(false);
    }
    if (onError) {
      onError('Failed to load the verification page. Please try again.');
    }
  }, [isSuccessUrl, onError]);

  const renderLoading = useCallback(() => (
    <NativeLoadingIndicator
      label="Loading verification page"
      size="large"
      color={Colors.red10}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  ), []);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </View>

        {waitHint ? (
          <View style={styles.waitHint}>
            <Text style={styles.waitHintText}>{waitHint}</Text>
          </View>
        ) : null}

        <WebView
          ref={webViewRef}
          source={{ uri: sourceUrl }}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          autoManageStatusBarEnabled={false}
          originWhitelist={originWhitelist}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onLoadStart={handleLoadStart}
          onHttpError={handleHttpError}
          onMessage={successMode === 'message' ? handleMessage : undefined}
          startInLoadingState
          renderLoading={renderLoading}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleWebViewError}
          onContentProcessDidTerminate={() => webViewRef.current?.reload()}
          injectedJavaScript={injectedJavaScript}
        />

        {isProcessing || isCompletingCallback || isWaitingOnDismiss ? (
          <View style={styles.processingOverlay}>
            <NativeLoadingIndicator
              label={isWaitingOnDismiss && !isProcessing && !isCompletingCallback ? 'Waiting for confirmation' : processingLabel}
              size="large"
              color={Colors.red10}
            />
          </View>
        ) : null}
      </View>
    </Modal>
  );
};
