import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useResendDirectDebitOtpMutation, useValidateDirectDebitOtpMutation } from '@/redux/features/paymentMethods/paymentMethodApi';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { globalStyle } from '@/styles/common/globals';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TextInput } from 'react-native-paper';

const DirectDebitOtp = () => {
  const dispatch = useAppDispatch();
  const { paymentId, xenditPaymentId, otpMobileNumber, billingReferenceId, invoiceReferenceId } =
    useLocalSearchParams<{
      paymentId?: string;
      xenditPaymentId?: string;
      otpMobileNumber?: string;
      billingReferenceId?: string;
      invoiceReferenceId?: string;
    }>();
  const [validateOtp, { isLoading }] = useValidateDirectDebitOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendDirectDebitOtpMutation();
  const [otp, setOtp] = useState('');

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      dispatch(showSnackbar({ message: 'Enter the 6-digit code.', variant: 'error' }));
      return;
    }
    try {
      const response = await validateOtp({
        paymentId: Number(paymentId),
        xenditPaymentId: xenditPaymentId as string,
        otpCode: otp,
      }).unwrap();
      dispatch(showSnackbar({
        message: response.message || 'Payment successful.',
        variant: 'success',
      }));
      router.replace({
        pathname: '/bills/one-time-payments/pay/payment-success',
        params: { billingReferenceId, invoiceReferenceId },
      });
    } catch (err: any) {
      dispatch(showSnackbar({ message: err?.data?.message || 'That code was not accepted.', variant: 'error' }));
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ paymentId: Number(paymentId), xenditPaymentId: xenditPaymentId as string }).unwrap();
      dispatch(showSnackbar({ message: 'A new code has been sent.', variant: 'success' }));
    } catch (err: any) {
      dispatch(showSnackbar({ message: err?.data?.message || 'Could not resend the code.', variant: 'error' }));
    }
  };

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
      <NavHeaderComponent title="Confirm Payment" />
      <View style={globalStyle.outerContainer}>
        <AppText size="medium" color="aegeanBlue10" weight="700" mBottom={8}>Enter the code</AppText>
        <AppText size="small" mBottom={16}>
          We sent a 6-digit code {otpMobileNumber ? `to ${otpMobileNumber}` : 'to your registered mobile number'}. Enter
          it to authorize this direct-debit payment.
        </AppText>

        <TextInput
          mode="outlined"
          label="6-digit code"
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
        />

        <SpacerComponent height={16} />
        <AppButton title="Confirm Payment" variant="primary" onPress={handleSubmit} isLoading={isLoading} disabled={isLoading} />
        <SpacerComponent height={12} />
        <AppButton title="Resend Code" variant="secondary" onPress={handleResend} isLoading={isResending} disabled={isResending} />
      </View>
    </ScrollView>
  );
};

export default DirectDebitOtp;
