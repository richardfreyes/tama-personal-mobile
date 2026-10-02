import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateEmailMutation } from '@/redux/features/accountSecurity/accountSecurityApi';
import { clearSession } from '@/redux/features/login/loginApi';
import { clearBiometricCredentials } from '@/services/authStorage';
import { showModal } from '@/redux/features/modal/modalSlice';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { changeEmailStyles as styles } from '@/styles/app/settings/security/change-email';
import { globalStyle } from '@/styles/common/globals';
import { EmailUpdateInputs } from '@/types';
import { validateField } from '@/utils/validators';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function ChangeEmail() {
  const dispatch = useAppDispatch();
  const { email: currentEmailFromAuth } = useAuth();
  const [updateEmail, { isLoading }] = useUpdateEmailMutation();
  const [formData, setFormData] = useState<EmailUpdateInputs>({ currentEmail: '', newEmail: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof EmailUpdateInputs, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof EmailUpdateInputs, boolean>>>({});
  
  useFocusEffect(
    useCallback(() => {
      return () => {
        setErrors({});
        setTouched({});
        setFormData(prev => ({ ...prev, newEmail: '' }));
      };
    }, [])
  );

  useEffect(() => {
    if (currentEmailFromAuth) {
      setFormData(prev => ({ ...prev, currentEmail: currentEmailFromAuth }));
    }
  }, [currentEmailFromAuth]);

  const handleTextChange = (field: keyof EmailUpdateInputs, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setTouched({ newEmail: true });

    const validationMessage = validateField('newEmail', formData.newEmail);
    let finalError = validationMessage;

    if (!finalError && formData.newEmail.trim() === formData.currentEmail.trim()) {
      finalError = "New email must be different from the current email.";
    }

    if (finalError) {
      setErrors({ newEmail: finalError });
      dispatch(showSnackbar({
        message: finalError || 'Validation error.',
        variant: 'error'
      }));
      return;
    }

    try {
      await updateEmail({
        emailAddress: formData.newEmail,
      }).unwrap();

      dispatch(showSnackbar({
        message: 'Check your new email to confirm the change. Signing out...',
        variant: 'success'
      }));

      setFormData(prev => ({ ...prev, newEmail: '' }));

      setTimeout(async () => {
        dispatch(showModal({
          iconType: 'info',
          headerMessage: 'Session Expired',
          bodyMessage: 'Please check your email to verify your new email address. For security reasons, please sign in again with your new email.',
          buttonConfig: {
            primaryLabel: 'OK',
            direction: 'row'
          }
        }));
        await clearBiometricCredentials();
        await dispatch(clearSession());
        router.replace('/login');
      }, 2000);

    } catch (err: any) {
      dispatch(showSnackbar({
        message: err.data?.message || 'An error occurred.',
        variant: 'error'
      }));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <ScrollView contentContainerStyle={globalStyle.screenContainer}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title='Change Email' />
          <View style={globalStyle.outerContainer}>
            <View style={styles.wrapper}>
              <AppText style={styles.mainTitle} weight='600'>Update Your Email</AppText>
              <AppText style={[styles.descriptionText, { marginBottom: 24 }]}>Update the email you'll be using to login with this account.</AppText>
              <View style={styles.inputFieldContainer}>
                <InputValidationComponent
                  field="currentEmail"
                  value={formData.currentEmail}
                  setValue={(text) => handleTextChange('currentEmail', text)}
                  placeholder="Current Email"
                  errors={errors} setErrors={setErrors as any}
                  touched={touched} setTouched={setTouched as any}
                  validateField={validateField}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  editable={false} 
                />

                <InputValidationComponent
                  field="newEmail"
                  value={formData.newEmail}
                  setValue={(text) => handleTextChange('newEmail', text)}
                  placeholder="New Email"
                  errors={errors} setErrors={setErrors as any}
                  touched={touched} setTouched={setTouched as any}
                  validateField={validateField}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                />

                <SpacerComponent height={8} />

                <AppButton 
                  title="Update Email" 
                  variant="primary" 
                  onPress={handleSubmit} 
                  isLoading={isLoading} 
                  disabled={isLoading}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
