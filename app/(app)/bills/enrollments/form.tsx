import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { FormSkeleton } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import DynamicFormComponent from '@/components/forms/DynamicFormComponent';
import { AutoDebitTermsModal } from '@/components/layout/AutoDebitTermsModal';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { COMMON } from '@/constants/common';
import { useAuth } from '@/hooks/useAuth';
import { setXsrfToken } from '@/redux/features/csrf/csrfSlice';
import { useCreateMerchantEnrollmentMutation, useGetMerchantByIdQuery, useGetMerchantEnrollmentFormConfigQuery, useGetMerchantProjectsQuery } from '@/redux/features/merchants/merchantApi';
import { selectEnrollmentReview, setEnrollmentTransactionResponse } from '@/redux/features/enrollments/review/reviewSlice';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { formStyles as styles } from '@/styles/app/bills/enrollments/form';
import { globalStyle } from '@/styles/common/globals';
import { flattenFields, resolveVisibilityState, sortFieldsByDisplayOrder } from '@/utils/fieldVisibility';
import { removeHiddenKeys, validateEnrollmentField } from '@/utils/enrollmentFormValidation';
import { buildEnrollmentReviewFields, buildEnrollmentFormPayloads } from '@/utils/enrollmentPayloadBuilder';
import { validateField } from '@/utils/validators';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

export default function InformationScreen() {
  const dispatch = useAppDispatch();
  const { firstName, lastName, email } = useAuth();
  const params = useLocalSearchParams();
  const merchantId = params.merchantId as string;
  const merchantName = params.merchantName as string | undefined; 
  const [createMerchantEnrollment, { isLoading: isCreatingEnrollment }] = useCreateMerchantEnrollmentMutation();
  const isEnrollmentSelected = true;
  const { data: enrollmentFormConfig, isLoading: isEnrollmentFormLoading } = useGetMerchantEnrollmentFormConfigQuery(merchantId || '', { skip: !merchantId });
  const { data: projectsData, isLoading: isProjectsLoading } = useGetMerchantProjectsQuery(merchantId || '', { skip: !merchantId });
  const { data: merchantData, isLoading: isMerchantLoading } = useGetMerchantByIdQuery(merchantId || '', { skip: !merchantId });
  const activeFormConfig = enrollmentFormConfig;
  const fields = useMemo(() => sortFieldsByDisplayOrder(activeFormConfig?.fields || []), [activeFormConfig]);
  const inputFields = useMemo(() => flattenFields(fields), [fields]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isReviewScreen, setIsReviewScreen] = useState(false);
  const isLoading = isProjectsLoading || isEnrollmentFormLoading || isMerchantLoading;
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

  const { formResetKey } = useAppSelector(selectEnrollmentReview);
  const lastProcessedResetKeyRef = useRef(formResetKey);

  useEffect(() => {
    if (lastProcessedResetKeyRef.current === formResetKey) return;
    lastProcessedResetKeyRef.current = formResetKey;

    setFormData({});
    setErrors({});
    setTouched({});
    setIsReviewScreen(false);
    setIsTermsModalVisible(false);
  }, [formResetKey]);

  const enrollmentLookupOptions = useMemo(() => {
    const lookupOptions: Record<string, any> = {
      paymentType: merchantData?.paymentTypes ?? [],
      projectName: projectsData ?? [],
      paymentMode: merchantData?.paymentModes ?? [],
    };

    const extractLookupKey = (location?: string | null) => {
      if (!location) { return ''; }

      return location.replace(/\/+$/, '').split('/').pop() || location;
    };

    inputFields.forEach((field) => {
      if (field.fieldType !== 'lookup' || !field.key) { return; }

      const lookupReference = field.lookupReference;
      const lookupLocation = extractLookupKey(lookupReference?.location);
      if (!lookupLocation) { return; }

      if (lookupReference?.source === 'self') {
        const selfLookupOptions = merchantData?.[lookupLocation];
        if (selfLookupOptions !== undefined && selfLookupOptions !== null) {
          lookupOptions[field.key] = selfLookupOptions;
        }
      }
    });

    return lookupOptions;
  }, [inputFields, merchantData, projectsData]);

  const handleTextChange = (field: string, value: any, extraData?: Record<string, any>) => {
    setFormData((prev) => {
      const nextValues = { ...prev, [field]: value, ...(extraData ?? {}) };
      return resolveVisibilityState(fields, nextValues).sanitizedValues as Record<string, any>;
    });
  };

  const getFieldConfig = (fieldKey: string) => {
    return inputFields.find((field) => field.key === fieldKey);
  };

  const visibilityState = useMemo(() => (
    resolveVisibilityState(fields, formData)
  ), [fields, formData]);

  const visibleFieldKeys = visibilityState.visibleFieldKeys;

  const visibleInputFields = useMemo(() => (
    inputFields.filter((field) => visibleFieldKeys.has(field.key))
  ), [inputFields, visibleFieldKeys]);

  useEffect(() => {
    if (visibilityState.sanitizedValues !== formData) {
      setFormData(visibilityState.sanitizedValues as Record<string, any>);
    }

    if (visibilityState.hiddenFieldKeys.size > 0) {
      setErrors((prev) => removeHiddenKeys(prev, visibilityState.hiddenFieldKeys));
      setTouched((prev) => removeHiddenKeys(prev, visibilityState.hiddenFieldKeys));
    }
  }, [formData, visibilityState]);

  const validateInput = (field: string, value: any) => {
    if (!visibleFieldKeys.has(field)) {
      return undefined;
    }

    const fieldConfig = getFieldConfig(field);

    if (!fieldConfig) {
      return validateField(field, value) || undefined;
    }

    return validateEnrollmentField(fieldConfig, value, activeFormConfig?.currencies?.[0]);
  };

  const validateEnrollmentForm = () => {
    const nextErrors: Record<string, string | undefined> = {};
    const nextTouched: Record<string, boolean> = {};
    let isValid = true;

    visibleInputFields.forEach((field) => {
      nextTouched[field.key] = true;
      const error = validateEnrollmentField(field, formData[field.key], activeFormConfig?.currencies?.[0]);

      if (error) {
        nextErrors[field.key] = error;
        isValid = false;
      }
    });

    setTouched((prev) => ({ ...prev, ...nextTouched }));
    setErrors(nextErrors);

    return isValid;
  };

  const handleNext = () => {
    if (!validateEnrollmentForm()) {
      dispatch(showSnackbar({
        message: 'Please correct the highlighted fields.',
        variant: 'error',
      }));
      return;
    }

    setIsReviewScreen(true);
  };

  const handleOpenTermsModal = useCallback(() => {
    setIsTermsModalVisible(true);
  }, []);

  const handleCloseTermsModal = useCallback(() => {
    setIsTermsModalVisible(false);
  }, []);

  const { currency, enrollmentPayload } = buildEnrollmentFormPayloads({
    activeFormConfig,
    email,
    firstName,
    formData,
    inputFields,
    isEnrollmentSelected,
    lastName,
    merchantId,
  });

  const reviewFieldsEnrollment = buildEnrollmentReviewFields({
    currency,
    formData,
    merchantId,
    visibleInputFields,
  });

  const isSubmitting = isCreatingEnrollment;

  const handleConfirm = async () => {
    try {
      const response = await createMerchantEnrollment({
        merchantCode: merchantId,
        body: enrollmentPayload,
      }).unwrap();

      dispatch(setEnrollmentTransactionResponse({
        merchantId,
        merchantName: merchantName || '',
        transactionId: response.transactionId,
        xsrfKey: response.xsrfKey || '',
        message: '',
        status: '',
        isEnrollment: true,
      }));

      if (response.xsrfKey) {
        dispatch(setXsrfToken(response.xsrfKey));
      }

      dispatch(showSnackbar({
        message: COMMON.SUCCESS.CREATE_ENROLLMENT,
        variant: 'success',
      }));
      router.replace('/bills/enrollments/payment-method');
    } catch (error: any) {
      console.error('createMerchantEnrollment error', error);
      dispatch(showSnackbar({
        message: error?.data?.message || error?.data?.error || error?.message || COMMON.ERRORS.CREATE_ENROLLMENT,
        variant: 'error',
      }));
    }
  }

  if (isLoading) {
    return (
      <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
        <NavHeaderComponent title='Fill Out Details' />
        <SpacerComponent height={12} />
        <FormSkeleton fields={6} label="Loading enrollment form" />
      </GlobalScrollView>
    );
  }

  return (
    <>
      <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
        <NavHeaderComponent title='Fill Out Details' />
        <SpacerComponent height={12} />
        <View style={styles.container}>
          { !isReviewScreen ? (
            <View style={styles.wrapper}>
              <AppText size='medium' mBottom={12}>Your details for <AppText weight='bold'>{merchantName}</AppText></AppText>
              <AppText size='small' mBottom={24}>Type in the necessary information. Make sure all details are correct.</AppText>

              <DynamicFormComponent
                apiEnv='enrollments'
                isEnrollment={isEnrollmentSelected}
                onTermsPress={handleOpenTermsModal}
                enrollmentFields={fields}
                formData={formData}
                onFormChange={handleTextChange}
                isFieldVisible={(fieldKey) => visibleFieldKeys.has(fieldKey)}
                lookupOptions={enrollmentLookupOptions}
                validateField={validateInput}
                errors={errors}
                setErrors={setErrors}
                touched={touched}
                setTouched={setTouched}
              />

              <AppButton
                title='Next' 
                variant='primary' 
                onPress={handleNext}
                isLoading={isSubmitting}
              />

            </View>
          ) : (
            <View style={styles.wrapper}>
              <AppText size='medium' mBottom={12}>Your details for <AppText weight='bold'>{merchantName}</AppText></AppText>
              {reviewFieldsEnrollment.map((field, key) => (
                <InfoFieldComponent label={field.text} value={field.value} key={key} />
              ))}

              <SpacerComponent height={24} />

              <AppButton
                title='Edit'
                variant='secondary'
                onPress={() => setIsReviewScreen(false)}
                isLoading={isSubmitting}
              />

              <SpacerComponent height={12} />

              <AppButton
                title='Confirm'
                variant='primary'
                onPress={handleConfirm}
                isLoading={isSubmitting}
              />
            </View>
          )}
        </View>
        <SpacerComponent height={100} />
      </GlobalScrollView>

      <AutoDebitTermsModal
        visible={isTermsModalVisible}
        onClose={handleCloseTermsModal}
      />
    </>
  );
}
