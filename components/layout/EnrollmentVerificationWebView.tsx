import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { NativeLoadingIndicator } from '@/components/common/Loading';
import { ENROLLMENT_CALLBACK_MESSAGES } from '@/constants/enrollment';
import { ENV_CONFIG } from '@/constants/env';
import { Colors } from '@/styles/common/colors';
import { enrollmentVerificationWebViewStyles as styles } from '@/styles/components/layout/EnrollmentVerificationWebView';
import { EnrollmentCallbackResult, EnrollmentVerificationWebViewProps } from '@/types';
import { getLegacyEnrollmentCallbackResult, parseEnrollmentCallbackUrl } from '@/utils/enrollmentCallback';
import React, { useCallback, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const buildInjectedScript = (accessSignature: string, accessType: string): string => `
  (function() {
    try {
      sessionStorage.setItem('accessSignature', ${JSON.stringify(accessSignature)});
      sessionStorage.setItem('accessType', ${JSON.stringify(accessType)});
    } catch (e) {}
  })();
  true;
`;

const enrollmentVerificationOriginWhitelist = ENV_CONFIG.base.startsWith('http://')
  ? ['https://*', 'http://*', 'personaldashboardmob://enrollment-result*']
  : ['https://*', 'personaldashboardmob://enrollment-result*'];

export const EnrollmentVerificationWebView = ({ url, accessSignature, accessType, onComplete }: EnrollmentVerificationWebViewProps) => {
  const insets = useSafeAreaInsets();
  const headerTitleInset = Math.max(insets.left, insets.right, 72);
  const hasCompletedRef = useRef(false);
  const hasResultRef = useRef(false);
  const [completionResult, setCompletionResult] = useState<EnrollmentCallbackResult | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleDismiss = useCallback((result: EnrollmentCallbackResult) => {
    if (hasCompletedRef.current) return;

    hasCompletedRef.current = true;
    onComplete(result);
  }, [onComplete]);

  const handleResult = useCallback((result: EnrollmentCallbackResult) => {
    if (result.outcome !== 'success') {
      handleDismiss(result);
      return;
    }

    if (hasResultRef.current) return;

    hasResultRef.current = true;
    setCompletionResult(result);
  }, [handleDismiss]);

  const handleNavigationStateChange = useCallback(
    ({ url: navigationUrl, loading }: { url: string; loading: boolean }) => {
      if (loading) return;

      const result =
        parseEnrollmentCallbackUrl(navigationUrl) ||
        getLegacyEnrollmentCallbackResult(navigationUrl);
      if (result) {
        handleResult(result);
      }
    },
    [handleResult],
  );

  const handleShouldStartLoad = useCallback(({ url: navigationUrl }: { url: string }) => {
    const deepLinkResult = parseEnrollmentCallbackUrl(navigationUrl);
    if (deepLinkResult) {
      handleResult(deepLinkResult);
      return false;
    }

    if (getLegacyEnrollmentCallbackResult(navigationUrl)) {
      setIsFinalizing(true);
      return true;
    }

    return true;
  }, [handleResult]);

  const handleCancel = useCallback(() => {
    handleDismiss({
      outcome: 'cancelled',
      message: ENROLLMENT_CALLBACK_MESSAGES.cancelled,
    });
  }, [handleDismiss]);

  const handleReturnToApp = useCallback(() => {
    if (completionResult) {
      handleDismiss(completionResult);
    }
  }, [completionResult, handleDismiss]);

  const renderLoading = useCallback(() => (
    <NativeLoadingIndicator
      label="Loading enrollment verification"
      size="large"
      color={Colors.aqua10}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  ), []);

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View
            pointerEvents="none"
            style={[
              styles.headerTitleContainer,
              { left: headerTitleInset, right: headerTitleInset },
            ]}
            testID="enrollment-verification-header-title"
          >
            <Text
              accessibilityRole="header"
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              numberOfLines={1}
              style={styles.headerTitle}
            >
              Enrollment Verification
            </Text>
          </View>
          {!completionResult && !isFinalizing && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel enrollment verification"
              hitSlop={12}
              onPress={handleCancel}
              style={[styles.cancelButton, { right: Math.max(insets.right, 16) }]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          )}
        </View>

        {completionResult ? (
          <ScrollView
            alwaysBounceVertical={false}
            contentContainerStyle={[
              styles.completionContent,
              {
                paddingBottom: Math.max(insets.bottom, 24),
                paddingLeft: Math.max(insets.left, 24),
                paddingRight: Math.max(insets.right, 24),
              },
            ]}
            showsVerticalScrollIndicator={false}
            style={styles.completionArea}
            testID="enrollment-verification-completion"
          >
            <View
              style={styles.completionCard}
              testID="enrollment-verification-completion-card"
            >
              <AppText
                accessibilityRole="header"
                size="extraLarge"
                style={styles.completionTitle}
                weight="700"
              >
                Verification complete
              </AppText>
              <AppText
                color="neutral08"
                style={styles.completionMessage}
              >
                {completionResult.message}
              </AppText>
              <AppButton
                buttonStyle={styles.returnButton}
                onPress={handleReturnToApp}
                testID="return-to-app-button"
                title="Return to app"
                variant="primary"
              />
            </View>
          </ScrollView>
        ) : (
          <View style={styles.webViewArea}>
            <WebView
              source={{ uri: url }}
              style={styles.webView}
              javaScriptEnabled
              domStorageEnabled
              injectedJavaScriptBeforeContentLoaded={buildInjectedScript(accessSignature, accessType)}
              originWhitelist={enrollmentVerificationOriginWhitelist}
              onShouldStartLoadWithRequest={handleShouldStartLoad}
              onNavigationStateChange={handleNavigationStateChange}
              startInLoadingState
              renderLoading={renderLoading}
            />
            {isFinalizing && (
              <View
                style={styles.finalizingOverlay}
                testID="enrollment-verification-finalizing"
              >
                <NativeLoadingIndicator
                  label="Completing verification"
                  size="large"
                  color={Colors.aqua10}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};
