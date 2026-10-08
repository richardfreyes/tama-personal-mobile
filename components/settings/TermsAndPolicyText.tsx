import { LEGAL_URLS } from '@/constants/enrollment';
import { Colors } from '@/styles/common/colors';
import { FontSizes } from '@/styles/common/typography';
import { termsAndPolicyTextStyles as styles } from '@/styles/components/settings/TermsAndPolicyText';
import { TermsAndConditionsCheckboxProps } from '@/types';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { View } from 'react-native';
import { Checkbox, useTheme } from 'react-native-paper';
import { AppText } from '../common/AppText';

const TermsAndConditionsCheckbox: React.FC<TermsAndConditionsCheckboxProps> = ({
  extraText,
  onTermsLinkPress,
  onPrivacyLinkPress,
  onRefundLinkPress,
  isChecked,
  onToggle,
  containerStyle,
}) => {
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const hasPolicyLinkHandlers = !!onPrivacyLinkPress || !!onRefundLinkPress;

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleTermsPress = () => {
    if (onTermsLinkPress) {
      onTermsLinkPress();
      return;
    }

    void openLink(LEGAL_URLS.TERMS_URL);
  };

  const handlePrivacyPress = () => {
    if (onPrivacyLinkPress) {
      onPrivacyLinkPress();
      return;
    }

    void openLink(LEGAL_URLS.PRIVACY_URL);
  };

  return (
    <View style={[containerStyle, styles.termsRow]}>
      <Checkbox.Android
        status={isChecked ? 'checked' : 'unchecked'}
        onPress={onToggle}
        color={primaryColor}
      />

      <View style={styles.termsTextContainer}>
        {onTermsLinkPress && !hasPolicyLinkHandlers ? (
          <AppText weight='light' style={styles.termsIntroText}>
            {extraText ? extraText + ' ' : ''}
            {"By ticking this checkbox, you agree to the "}
            <AppText style={styles.termsLink} onPress={onTermsLinkPress}>Terms and Conditions</AppText>
            {" of Tama Pte Ltd."}
            <AppText weight='light' style={{fontSize: FontSizes.small, color: Colors.error06}}> *</AppText>
          </AppText>
        ) : (
          <AppText weight='light' style={styles.termsIntroText}>
            {extraText ? extraText + ' ' : ''}
            <AppText style={styles.termsLink} onPress={handleTermsPress}>Terms of Service</AppText>, and
            <AppText style={styles.termsLink} onPress={handlePrivacyPress}> Privacy Policy</AppText>
            {onRefundLinkPress ? (
              <>
                {', and '}
                <AppText style={styles.termsLink} onPress={onRefundLinkPress}>Refund Policy</AppText>
              </>
            ) : null}
            {'.'}
            <AppText weight='light' style={{fontSize: FontSizes.small, color: Colors.error06}}> *</AppText>
          </AppText>
        )}
      </View>
    </View>
  );
};

export default TermsAndConditionsCheckbox;
