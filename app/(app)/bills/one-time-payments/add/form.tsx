import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { FormSkeleton } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import DynamicFormComponent from '@/components/forms/DynamicFormComponent';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useFetchFormConfigQuery, useFetchLookupOptionsQuery } from '@/redux/features/billerForm/billerFormApi';
import { useAddBillMutation } from '@/redux/features/bills/billsApi';
import { AddBillRequest } from '@/redux/features/bills/billsTypes';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { formStyles as styles } from '@/styles/app/bills/one-time-payments/add/form';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { resolveBillerEnrollmentMetadata } from '@/utils/billerEnrollment';
import { resolveVisibilityState } from '@/utils/fieldVisibility';
import { normalizeLookupOptions } from '@/utils/normalizeLookupOptions';
import { validateField } from '@/utils/validators';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

export default function AddBillerFormScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();
  const merchantId = params.merchantId ? parseInt(params.merchantId as string) : undefined;
  const merchantCode = params.merchantCode as string | undefined;
  const merchantName = params.merchantName as string | undefined; 
  const { data: formConfig, isLoading: formLoading } = useFetchFormConfigQuery(merchantId!, { skip: !merchantId });
  const { data: lookupOptions, isLoading: lookupLoading } = useFetchLookupOptionsQuery({
    billerId: merchantId || 0,
    formConfig: formConfig || [], 
  }, { skip: !merchantId || formLoading || !formConfig || formConfig.length === 0 });
  const [addBill, { isLoading: isAddingBiller }] = useAddBillMutation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const isLoading = formLoading || lookupLoading;
  const isRockwell = merchantCode?.toLowerCase() === 'rockwellland';

  const termsConfig = useMemo(() => {
    return formConfig?.find(f => f.key === 'termsBox');
  }, [formConfig]);

  const visibleFormFields = useMemo(() => {
    return formConfig?.filter(f => f.key !== 'termsBox') || [];
  }, [formConfig]);

  const visibilityState = useMemo(() => (
    resolveVisibilityState(visibleFormFields, formData)
  ), [formData, visibleFormFields]);

  const visibleFieldKeys = visibilityState.visibleFieldKeys;
  const activeFormFields = useMemo(() => (
    visibleFormFields.filter(field => visibleFieldKeys.has(field.key))
  ), [visibleFieldKeys, visibleFormFields]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setFormData({});
        setErrors({});
        setTouched({});
      };
    }, [])
  );

  const validateInput = (fieldKey: string, value: string): string | undefined => {
    if (fieldKey !== 'billName' && !visibleFieldKeys.has(fieldKey)) {
      return undefined;
    }

    let message = validateField(fieldKey, value);

    if (fieldKey === 'billName') {
      if (!value || String(value).trim() === '') {
        return 'Name of Bill is required.';
      }
    }

    if (!message && formConfig) {
      const fieldConfig = formConfig.find((f) => f.key === fieldKey);

      if (fieldConfig) {
        if (fieldConfig.isRequired) {
          if (!value || String(value).trim() === '') {
            message = `${fieldConfig.label} is required.`;
          }
        }

        if (!message && value && fieldConfig.pattern) {
          try {
            const regex = new RegExp(fieldConfig.pattern);
            if (!regex.test(value)) {
              message = 'Invalid format.';
            }
          } catch (e) {
            console.warn('Invalid Regex from API');
          }
        }
      }
    }

    setErrors(prev => ({ ...prev, [fieldKey]: message || undefined }));
    return message;
  };

  const handleTextChange = (field: string, value: any, extraData?: Record<string, any>) => {
    setFormData(prev => {
      const nextValues = { ...prev, [field]: value, ...(extraData ?? {}) };
      return resolveVisibilityState(visibleFormFields, nextValues).sanitizedValues;
    });

    if (typeof value === 'string' && touched[field]) {
      validateInput(field, value);
    }
  };

  const getCallingCodeForField = (fieldKey: string): string => {
    const callingCodeKey = `${fieldKey}_callingCode`;
    return formData[callingCodeKey] || '+63';
  };

  const handleAddBiller = async () => {
    if (!formConfig || !lookupOptions) return;

    const newErrors: Record<string, string | undefined> = {};
    const newTouched: Record<string, boolean> = {};
    let isValid = true;

    if (isRockwell && termsConfig && !formData.termsAccepted) {
      dispatch(showSnackbar({
        message: 'Please accept the terms and conditions to proceed.',
        variant: 'error'
      }));
      return;
    }

    const markAndValidate = (fieldKey: string) => {
      // Skip termsBox validation loop since we handle it manually
      if (fieldKey === 'termsBox') return;

      newTouched[fieldKey] = true;
      const value = formData[fieldKey] || '';
      let error = validateField(fieldKey, value);
      
      if (fieldKey === 'billName') {
        if (!value || String(value).trim() === '') {
          error = 'Name of Bill is required.';
        }
      } else if (!error) {
        const fieldConfig = formConfig.find((f) => f.key === fieldKey);
        if (fieldConfig) {
          if (fieldConfig.isRequired && (!value || String(value).trim() === '')) {
            error = `${fieldConfig.label} is required.`;
          }
          if (!error && value && fieldConfig.pattern) {
             try {
                const regex = new RegExp(fieldConfig.pattern);
                if (!regex.test(value)) {
                  error = 'Invalid format.';
                }
             } catch (e) { /* ignore */ }
          }
        }
      }

      if (error) {
        newErrors[fieldKey] = error;
        isValid = false;
      }
    };

    activeFormFields.forEach((field) => markAndValidate(field.key));
    markAndValidate('billName');

    setErrors(newErrors);
    setTouched(newTouched);

    if (!isValid) {
      dispatch(showSnackbar({
        message: 'Please correct the highlighted fields.',
        variant: 'error'
      }));
      return;
    }

    const buildField = (key: string, label: string, value: any = formData[key]) => ({
      value,
      text: label
    });

    const telFields = formConfig.filter(field => field.fieldType === 'tel');
    const primaryTelField = telFields[0];
    const selectedPaymentType = normalizeLookupOptions('paymentType', lookupOptions)
      .find(option => option.code === formData.paymentType);

    const billBody: Record<string, { value: any; text: string }> = {
      ...activeFormFields.reduce<Record<string, any>>((acc, field) => {
        if (field.key === 'paymentType') {
          return acc;
        }

        acc[field.key] = buildField(field.key, field.label);
        return acc;
      }, {}),

      clientNotes: buildField('clientNotes', 'Client Notes', formData.clientNotes || ''),
      billName: buildField('billName', 'Bill Name'),
      mobileCallingCode: buildField('mobileCallingCode', 'Mobile Calling Code', primaryTelField ? getCallingCodeForField(primaryTelField.key) : '+63'),
      mobileNo: buildField('mobileNo', 'Mobile Number', primaryTelField ? formData[primaryTelField.key] : ''),
      agentName: buildField('agentName', 'Sales Executive Name', formData.agentName ? formData.agentName : '') 
    };

    if (selectedPaymentType) {
      billBody.paymentName = buildField('paymentName', 'Payment Name', selectedPaymentType.name);
    }

    if (isRockwell) {
      billBody.termsBox = {
        value: true,
        text: 'termsBox' 
      };
    }

    const enrollmentMetadata = resolveBillerEnrollmentMetadata({
      merchantCode: merchantCode as string,
      merchantId: merchantId || 0,
      paymentType: formData.paymentType,
      projectId: formData.projectId,
    });

    const payload: AddBillRequest = {
      billBody,
      billName: formData.billName,
      merchantCode: merchantCode as string,
      ...enrollmentMetadata,
      clientNotes: formData.clientNotes || ''
    };

    try {
      await addBill(payload).unwrap();
      dispatch(
        showSnackbar({
          message: 'Successfully added biller.',
          variant: 'success'
        })
      );
      router.push('/bills/one-time-payments');
    } catch (err: any) {
      dispatch(
        showSnackbar({
          message: err.data?.message || 'Failed to add biller.',
          variant: 'error'
        })
      );
    }
  };

  if (isLoading) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
        <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
          <NavHeaderComponent title='Add Biller Information' />
          <SpacerComponent height={12} />
          <FormSkeleton fields={6} label="Loading biller form" />
        </GlobalScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
        <NavHeaderComponent title='Add Biller Information' />
        <SpacerComponent height={12} />
        <View style={styles.container}>
          { (!lookupOptions || !formConfig ) ? (
            <EmptyStateCard
              variant='error'
              message='No form configuration or lookup options available.'
            />
          ) : (
            <View style={styles.wrapper}>
              <AppText size='medium' mBottom={12}>Your details for <AppText weight='bold'>{merchantName}</AppText></AppText>
              <AppText size='small' mBottom={24}>Type in the necessary information and make sure all details are correct. We’ll save your bill details once you click “Save Bill”.</AppText>

              <InputValidationComponent
                field='billName'
                value={formData.billName || ''}
                setValue={(text) => handleTextChange('billName', text)}
                placeholder='Name of Bill'
                errors={errors} setErrors={setErrors}
                touched={touched} setTouched={setTouched}
                validateField={validateInput}
              />

              <DynamicFormComponent
                apiEnv="wiremo"
                fields={visibleFormFields}
                lookupOptions={lookupOptions}
                formData={formData}
                onFormChange={handleTextChange}
                isFieldVisible={(fieldKey) => visibleFieldKeys.has(fieldKey)}
                errors={errors}
                setErrors={setErrors}
                touched={touched}
                setTouched={setTouched}
                validateField={validateInput}
              />
                
              <SpacerComponent height={isRockwell ? 12 : 24} />

              {isRockwell && termsConfig && (
                <View style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Checkbox.Android
                      status={formData.termsAccepted ? 'checked' : 'unchecked'}
                      onPress={() => handleTextChange('termsAccepted', !formData.termsAccepted)}
                      uncheckedColor={Colors.aqua10}
                    />
                    <View style={{ flex: 1 }}>
                      <AppText size='small' style={{ lineHeight: 20, textAlign: 'justify' }}>
                        {termsConfig.label}
                      </AppText>
                    </View>
                  </View>
                </View>
              )}
                
              <SpacerComponent height={isRockwell ? 12 : 0} />

              <AppButton 
                title='Save' 
                variant='primary' 
                onPress={handleAddBiller}
                isLoading={isAddingBiller}
              />
            </View>
          )}
        </View>
      </GlobalScrollView>
    </KeyboardAvoidingView>
  );
}
