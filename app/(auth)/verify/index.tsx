import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import ResendCodeTimer from '@/components/common/ResendCodeTimer';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import OTPInput from '@/components/forms/OTPInput';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { COMMON } from '@/constants/common';
import { useResendOtpMutation, useVerifyOtpMutation } from '@/redux/features/signup/signupApi';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { verifyStyles as styles } from '@/styles/auth/verify-otp';
import { globalStyle } from '@/styles/common/globals';
import { FontSizes } from '@/styles/common/typography';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VerificationScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { email, tempToken } = useLocalSearchParams<{ email: string, tempToken: string }>();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const isLoading = isVerifying || isResending;
  
  const validateOtp = (value: string): string | undefined => {
    if (!value) {
      return "Verification code is required.";
    }
    if (!COMMON.VALIDATORS.REGEX.OTP.test(value)) {
      return `Code must be ${COMMON.VALIDATORS.DEFAULT_OTP_LENGTH} digits.`;
    }
    return undefined;
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const error = validateOtp(otp);
    if (error) {
      setOtpError(error);
      return;
    }

    try {
      const response = await verifyOtp({ code: otp, token: tempToken }).unwrap();
      dispatch(showSnackbar({
        message: response.message,
        variant: 'success'
      }));
    } catch (err: any) {
      const errorMessage = err.data?.message || 'Incorrect OTP. Please try again.';
      setOtpError(errorMessage);
      dispatch(showSnackbar({
        message: errorMessage,
        variant: 'error'
      }));
    }
  };
  
  const handleOTPChange = (code: string) => {
    setOtp(code);
    if (otpError) {
      setOtpError(undefined);
    }
    
    if (code.length === COMMON.VALIDATORS.DEFAULT_OTP_LENGTH) {
      Keyboard.dismiss();
    }
  };

  const handleClearError = () => {
    setOtpError(undefined);
  };

  const isButtonDisabled = useMemo(() => {
    return otp.length !== COMMON.VALIDATORS.DEFAULT_OTP_LENGTH || isLoading;
  }, [otp, isLoading]);

  const handleResendCode = async () => {
    try {
      const response = await resendOtp({ token: tempToken }).unwrap();
      setOtpError(undefined);
      dispatch(showSnackbar({
        message: response.message,
        variant: 'success'
      }));
    } catch (err: any) {
      dispatch(showSnackbar({
        message: err.data?.message || 'Failed to resend code.',
        variant: 'error'
      }));
    }
  };

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, styles.container]}>
      <View>
        <NavHeaderComponent />
        <AppText weight='700' style={[globalStyle.headerTitle, { marginBottom: 24 }]}>Enter Verification Code</AppText>
        <AppText style={{fontSize: FontSizes.base}}>
          We have sent a six digit verification code to <AppText weight='700'>{email || 'your email'}</AppText>. Please input code below to complete sign up and verify your account.
        </AppText>
        <OTPInput 
          length={6} 
          onCodeChange={handleOTPChange}
          onClearError={handleClearError}
          error={otpError}
          containerStyle={{ marginTop: 24 }}
        />
        <ResendCodeTimer initialTime={30} onResend={handleResendCode}/>
      </View>
      <View>
        <AppButton
          title="Confirm"
          variant="primary"
          onPress={handleVerify}
          isLoading={isVerifying}
          disabled={isButtonDisabled}
        />
        <SpacerComponent height={24} />
      </View>
    </ScrollView>
  );
};

export default VerificationScreen;
