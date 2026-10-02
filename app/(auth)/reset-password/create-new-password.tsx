import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import PasswordRule from '@/components/forms/PasswordRule';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import TermsAndConditionsCheckbox from '@/components/settings/TermsAndPolicyText';
import usePasswordValidation from '@/hooks/usePasswordValidation';
import { useResetPasswordWithTokenMutation } from '@/redux/features/resetPassword/resetPasswordApi';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { globalStyle } from '@/styles/common/globals';
import { validateField } from '@/utils/validators';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

const CreateNewPasswordScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [resetPasswordWithToken, { isLoading }] = useResetPasswordWithTokenMutation();
  const { token, code } = useLocalSearchParams<{ token?: string; code?: string }>();
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof formData, boolean>>>({});
  const REQUIRED_STRING_FIELDS: (keyof typeof formData)[] = ['createPassword', 'confirmPassword'];
  const passwordValidationRules = usePasswordValidation(password);
  const [formData, setFormData] = useState({createPassword: '', confirmPassword: '', agreedToTerms: false });

  useEffect(() => {
    if (!token || !code) {
      console.warn('No token or code provided for password reset');
    }
  }, [token, code]);

  const isFormComplete = useMemo(() => {
    const allStringFieldsValid = REQUIRED_STRING_FIELDS.every(field => {
      const value = formData[field];
      return typeof value === 'string' && value.trim().length > 0;
    });

    const passwordsMatch = !errors.createPassword && !errors.confirmPassword;

    const allPasswordRulesValid = passwordValidationRules.every(rule => rule.valid);

    return allStringFieldsValid && formData.agreedToTerms && passwordsMatch && allPasswordRulesValid;
  }, [formData, errors, passwordValidationRules]);

  const crossValidateField = useCallback(
    (field: keyof typeof formData, value: string): string | undefined => {
      let extraData: { selected?: string } = {};

      if (field === 'confirmPassword') {
        extraData.selected = formData.createPassword;
      } else if (field === 'createPassword') {
        extraData.selected = formData.confirmPassword;
      }
      
      const error = validateField(field as string, value, extraData);
      return error || undefined;
    },
    [formData.createPassword, formData.confirmPassword] 
  );

  const handleSetValueAndValidate = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    if (field === 'createPassword') {
      setPassword(value as string);
    }

    if (typeof value === 'string') {
      const error = crossValidateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));

      if (field === 'createPassword' || field === 'confirmPassword') {
        const otherField = field === 'createPassword' ? 'confirmPassword' : 'createPassword';
        const otherValue = field === 'createPassword' ? formData.confirmPassword : formData.createPassword;
        const newTypedValue = value;
        const otherFieldValue = otherValue;
        const otherMatchError = validateField(
          otherField as string, 
          otherFieldValue,
          { selected: newTypedValue }
        );
        setErrors(prev => ({ ...prev, [otherField]: otherMatchError || undefined }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!isFormComplete) return;

    const failedRules = passwordValidationRules.filter(rule => !rule.valid);

    if (failedRules.length > 0) {
      setErrors(prev => ({ ...prev, createPassword: 'Password does not meet all requirements.' }));
      return;
    }

    if (!token || !code) {
      dispatch(showSnackbar({
        message: 'Invalid or missing reset token. Please check your reset link.',
        variant: 'error'
      }));
      return;
    }

    try {
      await resetPasswordWithToken({token, code, newPassword: formData.createPassword}).unwrap();
      router.replace('/reset-password/success');
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      dispatch(showSnackbar({
        message: error?.data?.error || 'Failed to reset password. Please try again.',
        variant: 'error'
      }));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <ScrollView contentContainerStyle={[globalStyle.screenContainer]}>
        <NavHeaderComponent />
        <View style={{ flex: 1 }}>
          <AppText weight='700' style={[globalStyle.headerTitle, { marginBottom: 16 }]}>Create New Password</AppText>

          <InputValidationComponent
            field="createPassword"
            value={formData.createPassword}
            setValue={(text) => handleSetValueAndValidate('createPassword', text)}
            placeholder="Password"
            mode="outlined"
            secureTextEntry={true}
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField} 
            extra={{ passwordToMatch: formData.confirmPassword, selected: formData.createPassword }} 
          />

          <View>
            {passwordValidationRules.map((rule, index) => (
              <PasswordRule {...rule} key={index} />
            ))}
          </View>

          <InputValidationComponent
            field="confirmPassword"
            value={formData.confirmPassword}
            setValue={(text) => handleSetValueAndValidate('confirmPassword', text)}
            placeholder="Confirm Password"
            mode="outlined"
            secureTextEntry={true}
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField} 
            extra={{ passwordToMatch: formData.createPassword, selected: formData.confirmPassword }} 
          />
          <TermsAndConditionsCheckbox
            extraText="Clicking 'Submit' means you agree to our"
            isChecked={formData.agreedToTerms}
            onToggle={() => handleSetValueAndValidate('agreedToTerms', !formData.agreedToTerms)}
          />
        </View>
        <AppButton
          title="Submit"
          variant="primary"
          onPress={handleSubmit}
          isLoading={isLoading}
          disabled={!isFormComplete}
        />
        <SpacerComponent height={24} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateNewPasswordScreen;
