import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import NativePicker from '@/components/forms/NativePicker';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useAuth } from '@/hooks/useAuth';
import { useGetProfileDataQuery, useUpdateAddressMutation } from '@/redux/features/profile/profileApi';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { editAddressStyles as styles } from '@/styles/app/settings/profile/edit-address';
import { globalStyle } from '@/styles/common/globals';
import { AddressInputs } from '@/types';
import { validateField } from '@/utils/validators';
import { City, Country, ICity, ICountry, IState, State } from 'country-state-city';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function EditAddress() {
  const dispatch = useAppDispatch();
  const { data: profileData, refetch } = useGetProfileDataQuery();
  const [updateAddress, { isLoading }] = useUpdateAddressMutation();
  const { firstName, lastName } = useAuth();
  const [formData, setFormData] = useState<AddressInputs>({
    streetAddress: '',
    city: '',
    stateRegion: '',
    postalCode: '',
    country: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressInputs, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AddressInputs, boolean>>>({});
  const priorityCountries = ["PH", "US"];
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const isPriorityCountry = priorityCountries.includes(formData.country);

  useFocusEffect(
    useCallback(() => {
      refetch(); 

      return () => {
        setErrors({});
        setTouched({});
      };
    }, [refetch])
  );

  useFocusEffect(
    useCallback(() => {
      refetch();

      if (profileData) {
        syncProfileToForm(profileData);
      }

      return () => {
        setErrors({});
        setTouched({});
      };
    }, [refetch, profileData])
  );

  const syncProfileToForm = (data: any) => {
    const countryCode = data.customerCountryIso2Code || '';
    const stateValue = data.customerAddressState || '';

    setFormData({
      streetAddress: data.customerAddress || '',
      city: data.customerAddressCity || '',
      stateRegion: stateValue,
      postalCode: data.customerAddressPostalCode || '',
      country: countryCode,
    });

    if (countryCode) {
      const countryStates = State.getStatesOfCountry(countryCode);
      setStates(countryStates);
      
      if (stateValue) {
        const stateCities = City.getCitiesOfState(countryCode, stateValue);
        setCities(stateCities);
      }
    }
  };

  useEffect(() => {
    if (profileData) {
      syncProfileToForm(profileData);
    }
  }, [profileData]);

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const sortedCountries = [
      ...allCountries.filter(c => priorityCountries.includes(c.isoCode)),
      ...allCountries.filter(c => !priorityCountries.includes(c.isoCode)),
    ];
    setCountries(sortedCountries);
  }, []);

  useEffect(() => {
    if (formData.country) {
      const countryStates = State.getStatesOfCountry(formData.country);
      setStates(countryStates);
    } else {
      setStates([]);
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.country && formData.stateRegion) {
      const stateCities = City.getCitiesOfState(formData.country, formData.stateRegion);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [formData.stateRegion, formData.country]);

  const handleTextChange = (field: keyof AddressInputs, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value, ...(field === 'stateRegion' ? { city: '' } : {}) }));
  };

  const handleCountryChange = (value: string) => {
    setFormData(prev => ({ ...prev, 
      country: value ,
      city: '',
      stateRegion: '',
    }));
    if (touched.country) {
      const error = validateField('country', value);
      setErrors(prev => ({ ...prev, country: error || undefined }));
    }
  };

  const handleSubmit = async () => {
    const fieldsToValidate: (keyof AddressInputs)[] = ['country', 'streetAddress', 'stateRegion', 'city', 'postalCode'];
    let isValid = true;
    const newErrors: Partial<Record<keyof AddressInputs, string | undefined>> = {};
    const newTouched: Partial<Record<keyof AddressInputs, boolean>> = {};

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
        const payload = {
          firstName: firstName,
          lastName: lastName,
          streetAddress: formData.streetAddress,
          country: formData.country,
          state: formData.stateRegion,
          city: formData.city,
          postalCode: formData.postalCode,
        };

        await updateAddress(payload).unwrap();

        dispatch(showSnackbar({
          message: 'Successfully updated address.',
          variant: 'success'
        }));
        router.back();
        // router.push('/(app)/settings');

      } catch (err: any) {
        dispatch(showSnackbar({
          message: err.data?.message || 'Failed to update address.',
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
          <NavHeaderComponent title='Edit Personal Address' />
          <View style={globalStyle.outerContainer}>
            <View style={styles.wrapper}>
              <AppText style={styles.mainTitle} weight='600'>Update Your Address</AppText>
              <AppText style={[styles.descriptionText, { marginBottom: 24 }]}>Adding an address will help us verify your payments easily. Add your current address to enjoy seamless payments with Aqwire Personal.</AppText>
              <View style={styles.inputFieldContainer}>
                  <NativePicker
                    label="Country"
                    placeholder="Select Country"
                    options={countries.map(country => ({
                      code: country.isoCode,
                      name: country.name,
                    }))}
                    selectedValue={formData.country}
                    onValueChange={(value) => handleCountryChange(value as string)}
                    error={touched.country ? errors.country : undefined}
                  />

                  {isPriorityCountry && states.length > 0 ? (
                    <NativePicker
                      label="State / Region"
                      placeholder="Select State"
                      options={states.map(s => ({ code: s.isoCode, name: s.name }))}
                      selectedValue={formData.stateRegion}
                      onValueChange={(value) => handleTextChange('stateRegion', value as string)}
                      error={touched.stateRegion ? errors.stateRegion : undefined}
                    />
                  ) : (
                    <InputValidationComponent
                      field="stateRegion"
                      value={formData.stateRegion}
                      setValue={(value) => handleTextChange('stateRegion', value as string)}
                      placeholder="State / Region"
                      errors={errors} setErrors={setErrors as any}
                      touched={touched} setTouched={setTouched as any}
                      validateField={validateField}
                      mode="outlined"
                      keyboardType="default"
                      autoCapitalize="words"
                    />
                  )}

                  {isPriorityCountry && cities.length > 0 ? (
                    <NativePicker
                      label="City"
                      placeholder="Select City"
                      options={cities.map(c => ({ code: c.name, name: c.name }))}
                      selectedValue={formData.city}
                      onValueChange={(value) => handleTextChange('city', value as string)}
                      error={touched.city ? errors.city : undefined}
                    />
                  ) : (
                    <InputValidationComponent
                      field="city"
                      value={formData.city}
                      setValue={(value) => handleTextChange('city', value as string)}
                      placeholder="City"
                      errors={errors} setErrors={setErrors as any}
                      touched={touched} setTouched={setTouched as any}
                      validateField={validateField}
                      mode="outlined"
                      keyboardType="default"
                      autoCapitalize="words"
                    />
                  )}

                  <InputValidationComponent
                    field="streetAddress"
                    value={formData.streetAddress}
                    setValue={(text) => handleTextChange('streetAddress', text)}
                    placeholder="Street Address"
                    errors={errors} setErrors={setErrors as any}
                    touched={touched} setTouched={setTouched as any}
                    validateField={validateField}
                    mode="outlined"
                    keyboardType="default"
                    autoCapitalize="words"
                  />

                  <InputValidationComponent
                    field="postalCode"
                    value={formData.postalCode}
                    setValue={(text) => handleTextChange('postalCode', text)}
                    placeholder="Postal Code"
                    errors={errors} setErrors={setErrors as any}
                    touched={touched} setTouched={setTouched as any}
                    validateField={validateField}
                    mode="outlined"
                    keyboardType="default"
                    autoCapitalize="words"
                  />

                <SpacerComponent height={8} />
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
        <SpacerComponent height={100} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
