import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useAuth } from '@/hooks/useAuth';
import { useGetProfileDataQuery, useUpdateProfileMutation } from '@/redux/features/profile/profileApi';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { editInfoStyles as styles } from '@/styles/app/settings/profile/edit-info';
import { globalStyle } from '@/styles/common/globals';
import { EditProfileInputs } from '@/types';
import { validateField } from '@/utils/validators';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function EditInfo() {
  const dispatch = useAppDispatch();
  const [errors, setErrors] = useState<Partial<Record<keyof EditProfileInputs, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof EditProfileInputs, boolean>>>({});
  const { user } = useAuth();
  const { data: profileData } = useGetProfileDataQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formData, setFormData] = useState<EditProfileInputs>({
    country: '',
    firstName: '',
    middleName: '',
    lastName: '',
    currentEmail: '',
    mobileNumber: '',
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        setErrors({});
        setTouched({});
      };
    }, [])
  );

  useEffect(() => {
    if (user) {
      setFormData({
        country: '',
        firstName: user.firstName || '',
        middleName: '',
        lastName: user.lastName || '',
        currentEmail: user.username || '',
        mobileNumber: '',
      });
    }
  }, [user, profileData]);

  const handleTextChange = (field: keyof EditProfileInputs, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const fieldsToValidate: (keyof EditProfileInputs)[] = ['firstName', 'lastName'];
    let isValid = true;
    const newErrors: Partial<Record<keyof EditProfileInputs, string | undefined>> = {};
    const newTouched: Partial<Record<keyof EditProfileInputs, boolean>> = {};

    fieldsToValidate.forEach((field) => {
      newTouched[field] = true;
      const value = formData[field];
      const errorMessage = validateField(field, value || ''); 
      
      if (errorMessage) {
        newErrors[field] = errorMessage;
        isValid = false;
      }
    });
    
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(newErrors);

    if (isValid) {
      try {
        await updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
        }).unwrap();

        dispatch(showSnackbar({
          message: 'Successfully updated profile information.',
          variant: 'success'
        }));
        router.back();

      } catch (err: any) {
        dispatch(showSnackbar({
          message: 'Failed to update profile information.',
          variant: 'error'
        }));
      }
    } else {
      dispatch(showSnackbar({
        message: 'Please correct the highlighted fields.',
        variant: 'error'
      }));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <ScrollView contentContainerStyle={globalStyle.screenContainer}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title='Edit Personal Information' />
          <View style={globalStyle.outerContainer}>
            <View style={styles.wrapper}>
              <AppText style={styles.mainTitle} weight='600'>Edit Profile</AppText>
              <AppText style={[styles.descriptionText, { marginBottom: 24 }]}>Changing your name will affect your name in our receipts, please make sure it reflects your legal name.</AppText>
              <View style={styles.inputFieldContainer}>
                <InputValidationComponent
                  field="firstName"
                  value={formData.firstName}
                  setValue={(text) => handleTextChange('firstName', text)}
                  placeholder="Full Legal First Name"
                  errors={errors} setErrors={setErrors as any}
                  touched={touched} setTouched={setTouched as any}
                  validateField={validateField}
                  mode="outlined"
                  keyboardType="default"
                  autoCapitalize="words"
                />

                <InputValidationComponent
                  field="lastName"
                  value={formData.lastName}
                  setValue={(text) => handleTextChange('lastName', text)}
                  placeholder="Full Legal Last Name"
                  errors={errors} setErrors={setErrors as any}
                  touched={touched} setTouched={setTouched as any}
                  validateField={validateField}
                  mode="outlined"
                  keyboardType="default"
                  autoCapitalize="words"
                />

                <InputValidationComponent
                  field="currentEmail"
                  value={formData.currentEmail}
                  setValue={() => {}}
                  placeholder="Current Email"
                  errors={{}} setErrors={setErrors as any}
                  touched={{}} setTouched={setTouched as any}
                  validateField={() => undefined}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false} 
                />

                {/* TODO: Add mobile in the backend to allow editing phone number */}
                {/* <InputValidationComponent
                  field="mobileNumber"
                  value={formData.mobileNumber ?? ''}
                  setValue={(text) => handleTextChange('mobileNumber', text)}
                  placeholder="Mobile Number"
                  errors={errors} setErrors={setErrors as any}
                  touched={touched} setTouched={setTouched as any}
                  validateField={validateField}
                  mode="outlined"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={false}
                /> */}

                <AppButton 
                  title={isLoading ? "Saving..." : "Save"} 
                  variant="primary" 
                  onPress={handleSubmit} 
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
