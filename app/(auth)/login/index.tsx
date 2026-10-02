import FaceIdIcon from '@/assets/icons/face-id.svg';
import FingerprintIcon from '@/assets/icons/fingerprint.svg';
import BrandLogo from '@/assets/logo-brand.svg';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import { useLoginMutation } from '@/redux/features/auth/auth';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { clearBiometricCredentials, getBiometricCredentials, hasBiometricsEnabled, saveBiometricCredentials } from '@/services/authStorage';
import { loginStyle as styles } from '@/styles/auth/login/index';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { ApiErrorResponse, LoginFormInputs } from '@/types/form';
import { getAppVersionLabel } from '@/utils/appInfo';
import { decodeJwt } from '@/utils/jwt';
import { validateField } from '@/utils/validators';
import * as LocalAuthentication from 'expo-local-authentication';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [formData, setFormData] = useState<LoginFormInputs>({email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormInputs, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormInputs, boolean>>>({});
  const [faceId, setFaceId] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType | null>(null);
  const FIELDS_TO_VALIDATE: (keyof LoginFormInputs)[] = ['email', 'password'];
  const [loginWithPassword, setLoginWithPassword] = useState<boolean>(false);
  const [savedUser, setSavedUser] = useState({ name: '', email: '' });
  const versionLabel = getAppVersionLabel();
  const passwordInputProps = {
    field: 'password',
    value: formData.password,
    setValue: (text: string) => handleSetValue('password', text),
    placeholder: 'Password',
    errors: errors,
    setErrors: setErrors,
    touched: touched,
    setTouched: setTouched,
    validateField: validateField,
    secureTextEntry: true,
  };

  const initializeBiometrics = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const hasEnrollment = await LocalAuthentication.isEnrolledAsync();
      const biometricsEnabled = await hasBiometricsEnabled();

      if (!hasHardware || !hasEnrollment || !biometricsEnabled) {
        setFaceId(false);
        return;
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType(LocalAuthentication.AuthenticationType.FINGERPRINT);
      }

      const creds = await getBiometricCredentials();
      if (creds?.email) {
        setFaceId(true);
        setSavedUser({
          name: `${creds.firstName} ${creds.lastName}`.trim(),
          email: creds.email,
        });
      } else {
        setFaceId(false);
      }
    } catch (error) {
      dispatch(showSnackbar({
        message: 'Biometric check failed.',
        variant: 'error'
      }));
      console.warn('Biometric check failed:', error);
      setFaceId(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      initializeBiometrics();

      return () => {
        setFormData({ email: '', password: '', rememberMe: false });
        setErrors({});
        setTouched({});
        setLoginWithPassword(false);
      };
    }, [initializeBiometrics])
  );

  const handleSubmit = async () => {
    const newTouchedState = FIELDS_TO_VALIDATE.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Partial<Record<keyof LoginFormInputs, boolean>>);

    setTouched(prev => ({ ...prev, ...newTouchedState }));

    const validationErrors = (Object.keys(formData) as (keyof LoginFormInputs)[]).reduce((acc, field) => {
      if (field === 'rememberMe') { return acc; }

      const value = formData[field];
      if (typeof value === 'string') {
        const message = validateField(field, value); 
        if (message) { acc[field] = message; }
      }
      return acc;
    }, {} as Partial<Record<keyof LoginFormInputs, string>>);

    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      dispatch(showSnackbar({
        message: 'Validation error. Please correct the form errors.',
        variant: 'error'
      }));
      return;
    }

    try {
      const response = await login({ 
        username: formData.email, 
        password: formData.password,
        rememberMe: formData.rememberMe
      }).unwrap();

      if (response.redirect) {
        const redirect = response.redirect;
        const params = new URLSearchParams(redirect.split('?')[1]);
        const token = params.get('token');  

        router.replace({ 
          pathname: '/verify',
          params: { 
            email: formData.email,
            tempToken: token
          }
        });
        return;
      }

      if (formData.rememberMe) {
        const user = decodeJwt(response.token);
        if (user) {
          await saveBiometricCredentials(
            formData.email, 
            formData.password,
            user.firstName || '',
            user.lastName || ''
          );
        }
      } else {
        await clearBiometricCredentials();
      }
      router.replace('/dashboard');
    } catch (error) {
      dispatch(showSnackbar({
        message: (error as ApiErrorResponse)?.data?.message || 'Login failed. Please try again.',
        variant: 'error'
      }));
    }
  };

  const handleLoginPassword = () => {
    setLoginWithPassword(true);
    setFormData(prev => ({ ...prev, email: savedUser.email, rememberMe: true }));
    setErrors({});
    setTouched({});
  }

  const handleSetValue = (field: keyof LoginFormInputs | 'rememberMe', value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field !== 'rememberMe') {
      if (touched[field as keyof LoginFormInputs]) {
        const message = validateField(field as keyof LoginFormInputs, value as string);
        setErrors(prev => ({ ...prev, [field]: message || undefined }));
      }
    }
  };

  const btnLogin = () => {
    const isSubmitMode = !faceId || loginWithPassword;
    const title = isSubmitMode ? 'Login' : 'Login with Password';
    const handlePress = isSubmitMode ? handleSubmit : handleLoginPassword;

    return (
      <AppButton 
        title={title} 
        variant='primary' 
        onPress={handlePress} 
        isLoading={isLoading} 
        disabled={isLoading}
      />
    );
  }

  const handleSwitchAccount = async () => {
    await clearBiometricCredentials();
    setFaceId(false);
  }

  const handleBiometricAuth = async () => {
    const promptMsg = biometricType === LocalAuthentication.AuthenticationType.FINGERPRINT 
      ? 'Authenticate with Fingerprint' 
      : 'Authenticate with Face ID';

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMsg,
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
    });

    if (result.success) {
      const creds = await getBiometricCredentials();
      if (creds) {
        try {
          await login({
            username: creds.email,
            password: creds.password,
            rememberMe: true
          }).unwrap();
          router.replace('/dashboard');
        } catch {
          dispatch(showSnackbar({
            message: 'Login failed. Please log in with your password.',
            variant: 'error'
          }));
          setFaceId(false);
        }
      } else {
        dispatch(showSnackbar({
          message: 'Credentials not found. Please log in with your password.',
          variant: 'error'
        }));
        setFaceId(false);
      }
    } else {
      dispatch(showSnackbar({
        message: 'Authentication failed.',
        variant: 'error'
      }));
    }
  };

  const renderBiometricIcon = () => {
    if (biometricType === LocalAuthentication.AuthenticationType.FINGERPRINT) {
      return <FingerprintIcon width={72} height={72} />;
    }
    return <FaceIdIcon width={72} height={72} />;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[globalStyle.screenContainer, styles.screenContainer]}>
          <View>
            <View style={{ marginBottom: 'auto' }}>
              <View style={styles.logoContainer}>
                <BrandLogo style={styles.logo} width={210} height={53} />
                <AppText size='medium' weight='700' color='neutral08' mTop={5}>Pay all your bills in one place</AppText>
              </View>
              { faceId ?  (
                <View>
                  { !loginWithPassword && ( <AppText style={globalStyle.textAlignCenter} size='extraExtraLarge'>Welcome back,</AppText> )}
                  <AppText style={globalStyle.textAlignCenter} weight='700' size='extraExtraLarge'>{savedUser.name || 'User'}</AppText>
                  {loginWithPassword && (
                    <View>
                      <AppText size='small' mBottom={16} style={[globalStyle.textAlignCenter]}>{savedUser.email || 'Email'}</AppText>
                      <InputValidationComponent {...passwordInputProps} />
                    </View>
                  )}
                </View>
              ) :
              (
                <View>
                  <AppText weight='700' mBottom={16} size='extraExtraLarge' color='aegeanBlue10'>Login</AppText>
                  <InputValidationComponent
                    field='email'
                    value={formData.email}
                    setValue={(text) => handleSetValue('email', text)}
                    placeholder='Email'
                    errors={errors}
                    setErrors={setErrors}
                    touched={touched}
                    setTouched={setTouched}
                    validateField={validateField}
                    autoCapitalize='none'
                  />

                  <InputValidationComponent {...passwordInputProps}/>

                  <View style={styles.rememberRow}>
                    <View style={styles.rememberMe}>
                      <Checkbox.Android
                        status={formData.rememberMe ? 'checked' : 'unchecked'}
                        onPress={() => handleSetValue('rememberMe', !formData.rememberMe)}
                        style={styles.checkbox}
                        uncheckedColor={Colors.aqua10}
                      />
                      <AppText>Remember me</AppText>
                    </View>
                    <TouchableOpacity onPress={() => router.navigate('/reset-password')}>
                      <AppText style={styles.forgotPasswordText}>Forgot Password?</AppText>
                    </TouchableOpacity>
                  </View>

                  <View style={{ marginBottom: 24 }}>{btnLogin()}</View>

                  <View style={styles.signupRow}>
                    <AppText>{"Don't have an account? "}</AppText>
                    <TouchableOpacity onPress={() => router.navigate('/signup')}>
                      <AppText style={styles.forgotPasswordText}>Sign Up</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            { faceId && (
              <View style={{ marginTop: 'auto' }}>
                <TouchableOpacity onPress={handleBiometricAuth}>
                  <SpacerComponent height={24} />
                  <View style={styles.faceIdIcon}>
                    {renderBiometricIcon()}
                  </View>
                </TouchableOpacity>
                <View>
                  <AppText style={[globalStyle.textAlignCenter, {marginBottom: 24}]}>Not you? 
                    <AppText style={{color: Colors.aqua10}} onPress={handleSwitchAccount}> Switch Account</AppText>
                  </AppText>
                  {btnLogin()}
                  <SpacerComponent height={24} />
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => router.navigate('/reset-password')}>
                      <AppText style={styles.forgotPasswordText}>Forgot Password?</AppText>
                    </TouchableOpacity>
                  </View>
                  <SpacerComponent height={24} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        <View pointerEvents="none" style={styles.versionFooter}>
          <AppText style={styles.versionText}>Version {versionLabel}</AppText>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
