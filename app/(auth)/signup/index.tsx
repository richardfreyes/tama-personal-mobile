import BrandLogo from '@/assets/logo-brand.svg';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import PasswordRule from '@/components/forms/PasswordRule';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import TermsAndConditionsCheckbox from '@/components/settings/TermsAndPolicyText';
import usePasswordValidation from '@/hooks/usePasswordValidation';
import { useSignupMutation } from '@/redux/features/signup/signupApi';
import { SignupRequest } from '@/redux/features/signup/signupTypes';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { signupStyles as styles } from '@/styles/auth/signup/signup';
import { globalStyle } from '@/styles/common/globals';
import { validateField } from '@/utils/validators';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

const SignupScreen = () => {
  const [signup, { isLoading }] = useSignupMutation();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    signupPassword: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof formData, boolean>>>({});
  const [password, setPassword] = useState('');
  const passwordValidationRules = usePasswordValidation(password);

  const REQUIRED_STRING_FIELDS: (keyof typeof formData)[] = [
    'firstName', 
    'lastName', 
    'email', 
    'signupPassword', 
    'confirmPassword',
  ];

  useFocusEffect(
    useCallback(() => {
      return () => {
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          email: '',
          signupPassword: '',
          confirmPassword: '',
          agreedToTerms: false,
        });
        setErrors({});
        setTouched({});
        setPassword('');
      };
    }, [])
  );

  const handleSetValueAndValidate = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'signupPassword') {
      setPassword(value as string);
    }

    if (touched[field] && typeof value === 'string') {
      const extraData: { passwordToMatch?: string } = {};
      if (field === 'confirmPassword') {
        extraData.passwordToMatch = formData.signupPassword;
      }

      const error = validateField(field, value, extraData);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
      if (field === 'signupPassword' && touched.confirmPassword) {
        const confirmError = validateField(
          'confirmPassword', 
          formData.confirmPassword,
          { passwordToMatch: value as string }
        );
        setErrors(prev => ({ ...prev, confirmPassword: confirmError || undefined }));
      }
    }
  };

  const handleSignup = async () => {
    const newTouchedState = REQUIRED_STRING_FIELDS.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Partial<Record<keyof typeof formData, boolean>>);

    setTouched(prev => ({ ...prev, ...newTouchedState }));

    const validationErrors: Partial<Record<keyof typeof formData, string>> = {};

    REQUIRED_STRING_FIELDS.forEach((field) => {
      const value = formData[field] as string;
      const extraData: { passwordToMatch?: string } = {};

      if (field === 'confirmPassword') {
        extraData.passwordToMatch = formData.signupPassword;
      }

      const error = validateField(field, value, extraData);
      if (error) {
        validationErrors[field] = error;
      }
    });

    setErrors(validationErrors);

    if (!formData.agreedToTerms) {
      dispatch(showSnackbar({
        message: 'Please agree to the Terms and Conditions to proceed.',
        variant: 'error'
      }));
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      dispatch(showSnackbar({
        message: 'Please correct the errors in the form.',
        variant: 'error'
      }));
      return;
    }

    const payload: SignupRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      emailAddress: formData.email,
      rawPassword: formData.signupPassword,
      turnstileToken: "0.placeholder-token-replace-this-later", 
    };

    try {
      const response = await signup(payload).unwrap();
      if (response.token) {
        router.replace({ 
          pathname: '/verify',
          params: { 
            email: formData.email,
            tempToken: response.token
          }
        });
      } else {
        throw new Error('Missing verification token from server.');
      }
    } catch (err: any) {
      dispatch(showSnackbar({
        message: err.data?.message || 'Registration failed. Please try again.',
        variant: 'error'
      }));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <ScrollView contentContainerStyle={globalStyle.screenContainer}>
        <NavHeaderComponent />
        <View style={[styles.header]}>
          <View style={globalStyle.alignCenter}>
            <BrandLogo width={210} height={53} />
          </View>
        </View>

        <AppText weight='700' style={[globalStyle.headerTitle, { marginBottom: 16 }]}>Sign Up with Tama</AppText>

        <View style={{ marginBottom: 24 }}>
          <InputValidationComponent
            field="firstName"
            value={formData.firstName}
            setValue={(text) => handleSetValueAndValidate('firstName', text)}
            placeholder="First Name"
            mode="outlined"
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField} 
          />

          <InputValidationComponent
            field="middleName"
            value={formData.middleName}
            setValue={(text) => handleSetValueAndValidate('middleName', text)}
            placeholder="Middle Name (Optional)"
            mode="outlined"
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField}
          />
          
          <InputValidationComponent
            field="lastName"
            value={formData.lastName}
            setValue={(text) => handleSetValueAndValidate('lastName', text)}
            placeholder="Last Name"
            mode="outlined"
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField} 
          />

          <InputValidationComponent
            field="email"
            value={formData.email}
            setValue={(text) => handleSetValueAndValidate('email', text)}
            placeholder="Email"
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField} 
          />

          <InputValidationComponent
            field="signupPassword"
            value={formData.signupPassword}
            setValue={(text) => handleSetValueAndValidate('signupPassword', text)}
            placeholder="Password"
            mode="outlined"
            secureTextEntry={true}
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField} 
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
            extra={{ passwordToMatch: formData.signupPassword }} 
          />
        </View>

        <View>
          <TermsAndConditionsCheckbox
            extraText="By signing up, you agree to our"
            isChecked={formData.agreedToTerms}
            onToggle={() => handleSetValueAndValidate('agreedToTerms', !formData.agreedToTerms)}
          />
        </View>

        <View style={{ marginBottom: 12 }}>
          <AppButton 
            title="Sign Up" 
            variant="primary" 
            onPress={handleSignup} 
            isLoading={isLoading} 
            disabled={isLoading} 
          />
        </View>

        <View style={styles.loginLinkContainer}>
          <AppText style={styles.loginLinkText}>Already have an account? </AppText>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <AppText style={styles.loginLink}>Login</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;