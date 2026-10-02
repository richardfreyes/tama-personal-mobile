import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import PasswordRule from '@/components/forms/PasswordRule';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import usePasswordValidation from '@/hooks/usePasswordValidation';
import { useUpdatePasswordMutation } from '@/redux/features/accountSecurity/accountSecurityApi';
import { clearSession } from '@/redux/features/login/loginApi';
import { clearBiometricCredentials } from '@/services/authStorage';
import { showModal } from '@/redux/features/modal/modalSlice';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { changePasswordStyles as styles } from '@/styles/app/settings/security/change-password';
import { globalStyle } from '@/styles/common/globals';
import { PasswordUpdateInputs } from '@/types';
import { validateField } from '@/utils/validators';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function ChangePassword() {
  const dispatch = useAppDispatch();
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordUpdateInputs, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof PasswordUpdateInputs, boolean>>>({});
  const [formData, setFormData] = useState<PasswordUpdateInputs>({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const passwordValidationRules = usePasswordValidation(formData.newPassword);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setErrors({});
        setTouched({});
      };
    }, [])
  );

  const validateInput = (field: keyof PasswordUpdateInputs, value: string, currentFormData: PasswordUpdateInputs) => {
    let error = validateField(field, value);

    if (field === 'confirmNewPassword' || field === 'newPassword') {
      const passwordToMatch = field === 'confirmNewPassword' ? currentFormData.newPassword : value;
      const passwordToCheck = field === 'confirmNewPassword' ? value : currentFormData.confirmNewPassword;
      
      if (field === 'confirmNewPassword') {
         if (value !== currentFormData.newPassword) {
           error = 'Passwords do not match.';
         }
      } 
    }
    return error || undefined;
  };

  const handleTextChange = (field: keyof PasswordUpdateInputs, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (touched[field]) {
        const error = validateInput(field, value, updated);
        setErrors(prevErrors => ({ ...prevErrors, [field]: error }));

        if (field === 'newPassword' && touched.confirmNewPassword) {
          const confirmError = updated.confirmNewPassword !== value ? 'Passwords do not match.' : undefined;
          setErrors(prevErrors => ({ ...prevErrors, confirmNewPassword: confirmError }));
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async () => {
    setTouched({
      oldPassword: true,
      newPassword: true,
      confirmNewPassword: true,
    });

    let isValid = true;
    const newErrors: Partial<Record<keyof PasswordUpdateInputs, string | undefined>> = {};

    Object.keys(formData).forEach(key => {
      const field = key as keyof PasswordUpdateInputs;
      const error = validateInput(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match.';
      isValid = false;
    }
    
    setErrors(newErrors);

    if (!isValid) {
      dispatch(showSnackbar({
        message: 'Please correct the highlighted fields.',
        variant: 'error'
      }));
      return;
    }

    try {
      const payload = {
        currentPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      };
      const response = await updatePassword(payload).unwrap();
      dispatch(showSnackbar({
        message: response.message || 'Password updated successfully.',
        variant: 'success'
      }));

      setTimeout(async () => {
        dispatch(showModal({
          iconType: 'info',
          headerMessage: 'Session Expired',
          bodyMessage: 'Password successfully changed. For security reasons, please sign in again with your new password.',
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
        message: err.data?.message || 'Failed to update password. Please try again.',
        variant: 'error'
      }));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <ScrollView contentContainerStyle={globalStyle.screenContainer}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title='Change Password' />
          <View style={globalStyle.outerContainer}>
            <View style={styles.wrapper}>
              <AppText style={styles.mainTitle} weight='600'>Update Your Password</AppText>
              <AppText style={[styles.descriptionText, { marginBottom: 24 }]}>
                Update the password you'll be using to login with this account.
              </AppText>
              <View style={styles.inputFieldContainer}>
                <InputValidationComponent
                  field="oldPassword"
                  value={formData.oldPassword}
                  setValue={(text) => handleTextChange('oldPassword', text)}
                  placeholder="Old Password"
                  errors={errors}
                  setErrors={setErrors}
                  touched={touched}
                  setTouched={setTouched}
                  validateField={validateField}
                  secureTextEntry={true}
                  mode="outlined"
                />
                <InputValidationComponent
                  field="newPassword"
                  value={formData.newPassword}
                  setValue={(text) => handleTextChange('newPassword', text)}
                  placeholder="Create New Password"
                  errors={errors}
                  setErrors={setErrors}
                  touched={touched}
                  setTouched={setTouched}
                  validateField={validateField}
                  secureTextEntry={true}
                  mode="outlined"
                />
                <View>
                  {passwordValidationRules.map((rule, index) => (
                    <PasswordRule {...rule} key={index} />
                  ))}
                </View>
                <InputValidationComponent
                  field="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  setValue={(text) => handleTextChange('confirmNewPassword', text)}
                  placeholder="Confirm New Password"
                  errors={errors}
                  setErrors={setErrors}
                  touched={touched}
                  setTouched={setTouched}
                  validateField={validateField}
                  secureTextEntry={true}
                  mode="outlined"
                />
                <SpacerComponent height={8} />
                <AppButton 
                  title="Update Password" 
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
