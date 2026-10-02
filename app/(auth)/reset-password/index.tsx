import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useResetPasswordMutation } from '@/redux/features/resetPassword/resetPasswordApi';
import { resetPasswordStyles as styles } from '@/styles/auth/reset-password';
import { globalStyle } from '@/styles/common/globals';
import { ResetPasswordInputs } from '@/types';
import { validateField } from '@/utils/validators';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const ResetPasswordScreen = () => {
  const [formData, setFormData] = useState<ResetPasswordInputs>({ email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordInputs, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ResetPasswordInputs, boolean>>>({});
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const theme = useTheme();
  const primaryColor = theme.colors.primary;

  const isFormValid = useMemo(() => {
    const hasEmail = formData.email.trim().length > 0;
    const noErrors = !errors.email;
    return hasEmail && noErrors;
  }, [formData.email, errors.email]);

  const handleSetValue = (field: keyof ResetPasswordInputs, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const validateInput = (field: string, value: string): string => {
    const message = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: message || undefined }));
    return message;
  };
  
  const handleSubmit = async () => {
    const emailError = validateInput('email', formData.email);
    if (emailError) {
      setTouched(prev => ({ ...prev, email: true }));
      return;
    }

    try {
      const result = await resetPassword({ emailAddress: formData.email }).unwrap();
      router.push('/reset-password/check-email');
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      const errorMessage = error?.data?.error || 'Failed to send reset email. Please try again.';
      setErrors(prev => ({ ...prev, email: errorMessage }));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <ScrollView contentContainerStyle={[globalStyle.screenContainer, styles.container]}>
        <View>
          <NavHeaderComponent />
          <AppText weight='700' style={[globalStyle.headerTitle, { marginBottom: 24 }]}>Forgot Password</AppText>
          
          <AppText variant='bodyMedium'>
            Enter the email associated with your account and we’ll send an email with instructions to reset your password.
          </AppText>

          <View style={{ marginTop: 24 }}>
            <InputValidationComponent
              field="email"
              value={formData.email}
              setValue={(text) => handleSetValue('email', text)}
              placeholder="Email"
              errors={errors}
              setErrors={setErrors}
              touched={touched}
              setTouched={setTouched}
              validateField={validateInput}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
            />
          </View>
        </View>

        <View>
          <View style={{ marginBottom: 24 }}>
            <AppButton 
              title="Submit" 
              variant="primary" 
              onPress={handleSubmit} 
              isLoading={isLoading}
            />
          </View>
          
          <View style={styles.loginLinkContainer}>
            <AppText>Remember your password? </AppText>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <AppText style={[styles.loginLink, { color: primaryColor }]}>Login</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;