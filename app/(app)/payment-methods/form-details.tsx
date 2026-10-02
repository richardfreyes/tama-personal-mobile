import CalendarIcon from '@/assets/icons/calendar.svg';
import CardIcon from '@/assets/icons/card.svg';
import InfoIcon from '@/assets/icons/info.svg';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import NativePicker from '@/components/forms/NativePicker';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { OtpWebView } from '@/components/layout/OtpWebView';
import { VALIDATORS } from '@/constants';
import { COMMON } from '@/constants/common';
import { ONE_TIME_PAY_RETURN_PREFIX } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { setEnrollmentCardPayload } from '@/redux/features/enrollments/review/reviewSlice';
import { paymentMethodApi, useAddCardPaymentMutation, useGetPaymentMethodsQuery } from '@/redux/features/paymentMethods/paymentMethodApi';
import { useGetProfileDataQuery, useUpdateAddressMutation } from '@/redux/features/profile/profileApi';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { usePayTransactionMutation, usePayWithCardMutation } from '@/redux/features/transactions/transactionApi';
import { useAppDispatch } from '@/redux/hooks';
import { formDetailsStyles as styles } from '@/styles/app/payment-methods/form-details';
import { globalStyle } from '@/styles/common/globals';
import { AddCardFormInputs, PaymentMethodFormData } from '@/types';
import { detectCardProvider } from '@/utils/card';
import { buildAddCardRequestPayload, buildAddressPayload, buildEnrollmentCardPayload, formatPaymentMethodFieldValue, getNormalizedCardNumber, getPaymentOptionByTitle, getSavedBillingAddressFormValues, PAYMENT_METHOD_PRIORITY_COUNTRIES, validatePaymentMethodForm, validatePaymentMethodInput } from '@/utils/paymentMethodForm';
import { resolveInternalReturnPath } from '@/utils/returnNavigation';
import { validateField } from '@/utils/validators';
import { City, Country, ICity, ICountry, IState, State } from 'country-state-city';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Checkbox, useTheme } from 'react-native-paper';

const FormDetails = () => {
  const theme = useTheme();
  const primaryColor = theme.colors.primary;
  const dispatch = useAppDispatch();
  const [addCardPayment, { isLoading }] = useAddCardPaymentMutation();
  const [payWithCard, { isLoading: isPayingWithCard }] = usePayWithCardMutation();
  const [payTransaction, { isLoading: isChargingAfterVerification }] = usePayTransactionMutation();
  const { data: paymentMethods, isSuccess: paymentMethodsLoaded } = useGetPaymentMethodsQuery();
  const isFirstPaymentMethod = paymentMethodsLoaded && (paymentMethods?.length ?? 0) === 0;
  const [errors, setErrors] = useState<Partial<Record<keyof AddCardFormInputs, string | undefined>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AddCardFormInputs, boolean>>>({});
  const { methodTitle, apiEnv, billingReferenceId, baseAmount, baseCurrency, returnTo, returnAmount } = useLocalSearchParams<{ methodTitle: string, apiEnv: string, billingReferenceId: string, baseAmount: string, baseCurrency: string, returnTo: string, returnAmount: string }>();
  const isOneTimePayment = apiEnv === 'one-time';
  const oneTimeRedirectContextRef = useRef<{ code?: string; transactionReferenceId?: string; successParams: Record<string, any> } | null>(null);
  const isSubmitting = isLoading || isPayingWithCard || isChargingAfterVerification;
  const { data: user } = useGetProfileDataQuery();
  const [formData, setFormData] = useState<PaymentMethodFormData>(COMMON.INITIAL_FORM_DETAILS_STATE);
  const { data: profileData, refetch } = useGetProfileDataQuery();
  const hasSavedAddress = !!(profileData?.customerAddress && profileData?.customerCountryIso2Code);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const isPriorityCountry = PAYMENT_METHOD_PRIORITY_COUNTRIES.includes(formData.country);
  const { firstName, lastName } = useAuth();
  const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateAddressMutation();
  const [otpRedirectUrl, setOtpRedirectUrl] = useState<string | null>(null);
  const hasHandledOtpSuccessRef = useRef(false);
  const savedCardReferenceIdRef = useRef<string | undefined>(undefined);
  const oneTimePaymentKeyRef = useRef(Crypto.randomUUID());
  const verificationPaymentKeyRef = useRef(Crypto.randomUUID());

  const resetForm = useCallback(() => {
    setFormData(COMMON.INITIAL_FORM_DETAILS_STATE);
    setErrors({});
    setTouched({});
  }, []);

  const navigateAfterSave = useCallback((referenceId?: string) => {
    const safeReturn = resolveInternalReturnPath(returnTo, '');
    const isOneTimeReturn = safeReturn.startsWith(ONE_TIME_PAY_RETURN_PREFIX) && !!billingReferenceId;

    if (!isOneTimeReturn) {
      router.replace('/payment-methods');
      return;
    }

    router.replace({
      pathname: '/bills/one-time-payments/pay/[billingReferenceId]',
      params: {
        billingReferenceId: billingReferenceId as string,
        ...(returnAmount ? { amount: returnAmount as string } : {}),
        ...(referenceId ? { selectedPaymentMethodReferenceId: referenceId } : {}),
      },
    });
  }, [returnTo, returnAmount, billingReferenceId]);

  const handleOtpComplete = useCallback(() => {
    setOtpRedirectUrl(null);
    if (isOneTimePayment) {
      if (!hasHandledOtpSuccessRef.current) {
        oneTimeRedirectContextRef.current = null;
        dispatch(showSnackbar({
          message: 'Card authentication was not completed. Please try again.',
          variant: 'error',
        }));
      }
      return;
    }
    router.replace('/payment-methods');
  }, [isOneTimePayment, dispatch]);

  const handleOneTimeOtpSuccess = useCallback(async () => {
    if (hasHandledOtpSuccessRef.current) return;
    hasHandledOtpSuccessRef.current = true;

    const context = oneTimeRedirectContextRef.current;
    setOtpRedirectUrl(null);

    if (!context) return;

    try {
      if (context.code === 'CARD_VERIFICATION_REQUIRED' && context.transactionReferenceId) {
        const retryResponse = await payTransaction({ transactionId: context.transactionReferenceId, idempotencyKey: verificationPaymentKeyRef.current }).unwrap();
        if (retryResponse.redirect) {
          dispatch(showSnackbar({ message: 'Card authentication is still required. Check the payment status later.', variant: 'error' }));
          return;
        }
      }
      resetForm();
      dispatch(showSnackbar({ message: 'Payment successful.', variant: 'success' }));
      router.replace({ pathname: '/bills/one-time-payments/pay/payment-success', params: context.successParams });
    } catch (err: any) {
      dispatch(showSnackbar({ message: err?.data?.message || 'Payment failed. Please try again.', variant: 'error' }));
    }
  }, [dispatch, payTransaction, resetForm]);

  const handleOtpSuccess = useCallback(() => {
    if (isOneTimePayment) {
      void handleOneTimeOtpSuccess();
      return;
    }

    if (hasHandledOtpSuccessRef.current) return;

    hasHandledOtpSuccessRef.current = true;
    setOtpRedirectUrl(null);
    resetForm();
    dispatch(paymentMethodApi.util.invalidateTags(['PaymentMethods']));
    dispatch(showSnackbar({
      message: 'Payment method added successfully.',
      variant: 'success',
    }));
    navigateAfterSave(savedCardReferenceIdRef.current);
  }, [dispatch, resetForm, isOneTimePayment, handleOneTimeOtpSuccess, navigateAfterSave]);

  const handleOtpError = useCallback((message: string) => {
    dispatch(showSnackbar({ message, variant: 'error' }));
  }, [dispatch]);

  const handleOtpFailure = useCallback(() => {
    hasHandledOtpSuccessRef.current = true;
    oneTimeRedirectContextRef.current = null;
    setOtpRedirectUrl(null);
    dispatch(showSnackbar({
      message: 'Your card was declined. Please try another card.',
      variant: 'error',
    }));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      resetForm();
      refetch();

      if (profileData) {
        syncProfileToForm(profileData);
      }

      return () => {
        setErrors({});
        setTouched({});
      };
    }, [refetch, profileData, resetForm])
  );

  useEffect(() => {
    if (formData.country && formData.stateRegion) {
      const stateCities = City.getCitiesOfState(formData.country, formData.stateRegion);
      setCities(stateCities);
    }
  }, [formData.stateRegion, formData.country]);

  useEffect(() => {
    if (formData.country) {
      const countryStates = State.getStatesOfCountry(formData.country);
      setStates(countryStates);
    } else {
      setStates([]);
    }
  }, [formData.country]);

  const syncProfileToForm = (data: any) => {
    const countryCode = data.customerCountryIso2Code || formData.country;
    const stateValue = data.customerAddressState || formData.stateRegion;

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
    const allCountries = Country.getAllCountries();
        const sortedCountries = [
      ...allCountries.filter(c => PAYMENT_METHOD_PRIORITY_COUNTRIES.includes(c.isoCode)),
      ...allCountries.filter(c => !PAYMENT_METHOD_PRIORITY_COUNTRIES.includes(c.isoCode)),
    ];
    setCountries(sortedCountries);
  }, []);

  const selectedOption = getPaymentOptionByTitle(methodTitle, COMMON.PAYMENT_OPTIONS);

  const handleTextChange = (field: keyof AddCardFormInputs, value: string) => {
    const { cardProvider, value: newValue } = formatPaymentMethodFieldValue(field, value, formData.cardProvider);

    setFormData(prev => ({ ...prev, [field]: newValue, cardProvider }));
    const message = validateField(field as string, newValue);
    setErrors(prev => ({ ...prev, [field]: message || undefined }));
  };

  const handleSwitchChange = (field: 'saveAsDefaultBilling' | 'useAsPrimaryPayment', value: boolean) => {
    if (field === 'saveAsDefaultBilling' && value === true) {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        ...getSavedBillingAddressFormValues(user),
      }));
      
      setErrors(prev => ({
        ...prev,
        streetAddress: undefined,
        city: undefined,
        stateRegion: undefined,
        postalCode: undefined,
        country: undefined
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateInput = (field: string, value: string): string | undefined => {
    return validatePaymentMethodInput(field, value, formData);
  };

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleSubmit = async () => {
    const { errors: newErrors, isValid, touched: newTouched } = validatePaymentMethodForm(formData);

    setErrors(newErrors); 
    setTouched((prev) => ({ ...prev, ...newTouched }));

    if (!isValid) {
      dispatch(showSnackbar({
        message: 'Please correct the highlighted fields.',
        variant: 'error'
      }));
      return;
    }

    const cardNumber = getNormalizedCardNumber(formData.cardNumber);
    const currentProvider = detectCardProvider(cardNumber);
    const enrollmentCardPayload = buildEnrollmentCardPayload({ cardNumber, formData, user });

    if (isOneTimePayment) {
      const cardRequest = buildAddCardRequestPayload({ cardNumber, currentProvider, formData, user });
      try {
        const response = await payWithCard({ idempotencyKey: oneTimePaymentKeyRef.current, payload: {
          ...cardRequest,
          billingReferenceId: (billingReferenceId as string) || '',
          baseAmount: Number(baseAmount) || 0,
          baseCurrency: (baseCurrency as string) || 'PHP',
          notes: null,
          savePaymentMethod: false,
        }}).unwrap();

        const successParams: Record<string, any> = {
          billingReferenceId: (billingReferenceId as string) || '',
          transactionReferenceId: response.transactionReferenceId || '',
          invoiceReferenceId: response.invoiceReferenceId || '',
          computationResponse: response.computation
            ? JSON.stringify({
                computation: response.computation,
                invoiceReferenceId: response.invoiceReferenceId,
                transactionReferenceId: response.transactionReferenceId,
              })
            : undefined,
        };

        if (response.redirect) {
          hasHandledOtpSuccessRef.current = false;
          oneTimeRedirectContextRef.current = {
            code: response.code,
            transactionReferenceId: response.transactionReferenceId,
            successParams,
          };
          dispatch(showSnackbar({ message: 'Please complete 3DS verification...', variant: 'success' }));
          setOtpRedirectUrl(response.redirect);
          return;
        }

        resetForm();
        dispatch(showSnackbar({ message: response.message || 'Payment successful.', variant: 'success' }));
        router.replace({ pathname: '/bills/one-time-payments/pay/payment-success', params: successParams });
      } catch (err: any) {
        dispatch(showSnackbar({
          message: err?.data?.message || 'Payment failed. Please try again.',
          variant: 'error',
        }));
      }
      return;
    }

    if (apiEnv === 'enrollments') {
      dispatch(setEnrollmentCardPayload(enrollmentCardPayload));
      router.replace('/(app)/bills/enrollments/confirm-payment');
      return;
    } else {
      try {
        const needsAddressUpdate = !profileData?.customerAddress || !profileData?.customerCountryIso2Code;

        if (needsAddressUpdate) {
          const addressPayload = buildAddressPayload({ firstName, formData, lastName });

          await updateAddress(addressPayload).unwrap();
        }

        const payload = buildAddCardRequestPayload({ cardNumber, currentProvider, formData, user, forcePrimary: isFirstPaymentMethod });

        const response = await addCardPayment(payload).unwrap();
        if (response.redirect) {
          hasHandledOtpSuccessRef.current = false;
          savedCardReferenceIdRef.current = response.referenceId;
          dispatch(showSnackbar({
            message: 'Please complete 3DS verification...',
            variant: 'success'
          }));

          setOtpRedirectUrl(response.redirect);
        } else {
          resetForm();
          dispatch(showSnackbar({
            message: 'Payment method successfully added.',
            variant: 'success'
          }));
          navigateAfterSave(response.referenceId);
        }
      } catch (err: any) {
        dispatch(showSnackbar({
          // TODO: change the backend response to send a specific error code for existing card to avoid relying on error message, QA Team corrected that exist with s 'exists'
          message: err.data?.message === 'Card information already exist' ? 'Card information already exists' : err.data?.message || 'Failed to add card.',
          variant: 'error'
        }));
      }
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
        <NavHeaderComponent title='Payment Methods' />
        <View>
          <View style={globalStyle.outerContainer}>
            <View style={styles.outerContainer}>
              <AppText size='medium' color='maroon10' weight='700' mBottom={16}>{methodTitle || 'Add Payment Method'}</AppText>
              { selectedOption?.logos?.length || selectedOption?.mainLogoUri ? (
                <View style={styles.logosContainer}>
                  {selectedOption?.logos?.length && (selectedOption.logos.map((item) => {
                      const LogoComponent = item.uri;
                      return (
                        <View key={item.id} style={{ marginRight: 4 }}>
                          <LogoComponent width={24} height={24} /> 
                        </View>
                      );
                    })
                  )}

                  {selectedOption?.mainLogoUri && (
                    <View>
                      {(() => {
                        const MainLogo = selectedOption.mainLogoUri.uri || selectedOption.mainLogoUri;
                        return <MainLogo width={64} height={40} />;
                      })()}
                    </View>
                  )}
                </View>
              ) : null }
              <View style={styles.infoBox}>
                <InfoIcon width={36} height={36} style={styles.infoIcon} />
                <AppText style={styles.infoText}>To verify your card is valid and active, we may place a temporary authorization hold of $1 or ₱10 on your account. This is not an actual charge and will be automatically reversed.</AppText>
              </View>

              <AppText size='medium' color='maroon10' weight='700' mBottom={16}>Card Information</AppText>

              <InputValidationComponent
                field="fullName"
                value={formData.fullName}
                setValue={(text) => handleTextChange('fullName', text)}
                placeholder="Full Name"
                errors={errors} setErrors={setErrors}
                touched={touched} setTouched={setTouched}
                validateField={validateInput}
                mode="outlined"
              />

              <InputValidationComponent
                field="cardNumber"
                value={formData.cardNumber}
                setValue={(text) => handleTextChange('cardNumber', text)}
                placeholder="Card Number"
                errors={errors} setErrors={setErrors}
                touched={touched} setTouched={setTouched}
                validateField={validateInput}
                keyboardType="numeric"
                maxLength={19}
                mode="outlined"
                maskOnBlur={true}
                rightIcon={<CardIcon width={40} height={40}/>}
              />

              <InputValidationComponent
                field="expiryDate"
                value={formData.expiryDate}
                setValue={(text) => handleTextChange('expiryDate', text)}
                placeholder="Expiration Date"
                errors={errors} setErrors={setErrors}
                touched={touched} setTouched={setTouched}
                validateField={validateInput}
                keyboardType="numeric"
                maxLength={5}
                mode="outlined"
                rightIcon={<CalendarIcon width={40} height={40}/>}
              />

              <InputValidationComponent
                field="securityCode"
                value={formData.securityCode}
                setValue={(text) => handleTextChange('securityCode', text)}
                placeholder="Security Code / CVV"
                errors={errors} setErrors={setErrors}
                touched={touched} setTouched={setTouched}
                validateField={validateInput}
                keyboardType="numeric"
                secureTextEntry={true}
                maxLength={4}
                mode="outlined"
              />

              <SpacerComponent height={12} />

              <AppText size='medium' color='maroon10' weight='700' mBottom={16}>Billing Information</AppText>

              <SpacerComponent height={8} />

              {hasSavedAddress && (
                <View style={styles.switchRow}>
                  <Checkbox.Android
                    status={formData.saveAsDefaultBilling ? 'checked' : 'unchecked'}
                    onPress={() => handleSwitchChange('saveAsDefaultBilling', !formData.saveAsDefaultBilling)}
                    color={primaryColor}
                  />
                  <AppText style={styles.checkboxLabel}>Is the card&apos;s billing information the same as your Personal Address?</AppText>
                </View>
              )}

              <NativePicker
                label="Country"
                placeholder="Select Country"
                options={countries.map(country => ({
                  code: country.isoCode,
                  name: country.name,
                }))}
                selectedValue={formData.country}
                onValueChange={(value) => handleTextChange('country', value as string)}
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
                errors={errors} setErrors={setErrors}
                touched={touched} setTouched={setTouched}
                validateField={validateInput}
                mode="outlined"
              />

              <InputValidationComponent
                field="postalCode"
                value={formData.postalCode}
                setValue={(text) => handleTextChange('postalCode', text)}
                placeholder="Postal Code"
                errors={errors} setErrors={setErrors}
                touched={touched} setTouched={setTouched}
                validateField={validateInput}
                keyboardType="numeric"
                mode="outlined"
              />

              { !isOneTimePayment && apiEnv !== 'enrollments' && (
                <View style={styles.finalCheckboxRow}>
                  <Checkbox.Android
                    status={formData.useAsPrimaryPayment ? 'checked' : 'unchecked'}
                    onPress={() => handleSwitchChange('useAsPrimaryPayment', !formData.useAsPrimaryPayment)}
                    color={primaryColor}
                  />
                  <AppText style={styles.checkboxLabel}>Use this as default payment method.</AppText>
                </View>
              )}

              { isOneTimePayment && (
                <>
                  <AppText size='small' style={styles.saveHint}>
                    This card will be used only for this payment and won’t be saved to your account.
                  </AppText>
                  <SpacerComponent height={12} />
                </>
              )}

              <AppButton
                title={isOneTimePayment ? 'Pay Now' : apiEnv === 'enrollments' ? 'Next' : 'Save Information'}
                variant="primary"
                onPress={handleSubmit}
                isLoading={isOneTimePayment ? isSubmitting : isLoading}
                disabled={isOneTimePayment ? isSubmitting : undefined}
              />
              <SpacerComponent height={24} />
            </View>
          </View>
        </View>
        <SpacerComponent height={100} />
      </GlobalScrollView>

      <OtpWebView
        url={otpRedirectUrl || ''}
        title="3DS Verification"
        visible={!!otpRedirectUrl}
        onComplete={handleOtpComplete}
        onSuccess={handleOtpSuccess}
        onError={handleOtpError}
        onFailure={handleOtpFailure}
        successUrlPatterns={[VALIDATORS.CARD_3DS_SUCCESS_URL_PATTERN]}
        failureUrlPatterns={[VALIDATORS.CARD_3DS_FAILED_URL_PATTERN]}
        successMode="message"
      />
    </KeyboardAvoidingView>
  );
};

export default FormDetails;
