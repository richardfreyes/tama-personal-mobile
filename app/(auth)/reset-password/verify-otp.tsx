import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import ResendCodeTimer from '@/components/common/ResendCodeTimer';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import OTPInput from '@/components/forms/OTPInput';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { COMMON } from '@/constants/common';
import { verifyStyles as styles } from '@/styles/auth/verify-otp';
import { globalStyle } from '@/styles/common/globals';
import { FontSizes } from '@/styles/common/typography';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VerificationScreen = () => {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<'otp', string | undefined>>({otp: undefined});
  const isLoading = false;

  const validateOtp = (value: string): string | undefined => {
    if (!value) {
      return "Verification code is required.";
    }
    if (!COMMON.VALIDATORS.REGEX.OTP.test(value)) {
      return `Code must be ${COMMON.VALIDATORS.DEFAULT_OTP_LENGTH} digits.`;
    }
    return undefined;
  };

  const handleSetValue = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    setOtp(cleanedText);
    const error = validateOtp(cleanedText);
    setErrors({ otp: error });
  };

  const handleVerify = async () => {
    handleVerifySuccess();
  };

  const handleVerifySuccess = () => {
    router.replace('/reset-password/create-new-password');
  };

  const isButtonDisabled = useMemo(() => {
    return otp.length !== COMMON.VALIDATORS.DEFAULT_OTP_LENGTH || errors.otp !== undefined || isLoading;
  }, [otp, errors, isLoading]);

  const handleOTPChange = (code: string) => {
    setOtp(code);

    if (code.length === 6) {
      Keyboard.dismiss();
      handleVerifySuccess();
    }
  };

  const handleResendCode = () => {
    // 1. Logic to call your API endpoint to resend the OTP code (via email or SMS)
    return;
  };

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, styles.container ]}>
      <View>
        <NavHeaderComponent />
        <AppText weight='700' style={[globalStyle.headerTitle, { marginBottom: 24 }]}>Enter Verification Code</AppText>
        <AppText style={{fontSize: FontSizes.base}}>
          We have sent a six-digit verification code to <AppText weight='700'>richardreyes@aqwire.co</AppText>. Please enter the code below to reset your password and regain access to your account.
        </AppText>
        <OTPInput 
          length={6} 
          onCodeChange={handleOTPChange} 
          containerStyle={{ marginVertical: 24 }}
        />
        <ResendCodeTimer initialTime={30} onResend={handleResendCode}/>
      </View>
      <View>
        <AppButton
          title="Confirm"
          variant="primary"
          onPress={handleVerify}
          isLoading={isLoading}
          disabled={false}
        />
        <SpacerComponent height={24} />
      </View>
    </ScrollView>
  );
};

export default VerificationScreen;
