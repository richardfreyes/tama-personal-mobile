import { CheckboxFieldRenderer } from '@/components/forms/dynamic-field-renderers/CheckboxFieldRenderer';
import { DateFieldRenderer } from '@/components/forms/dynamic-field-renderers/DateFieldRenderer';
import { LookupFieldRenderer } from '@/components/forms/dynamic-field-renderers/LookupFieldRenderer';
import { PhoneFieldRenderer } from '@/components/forms/dynamic-field-renderers/PhoneFieldRenderer';
import { TextFieldRenderer } from '@/components/forms/dynamic-field-renderers/TextFieldRenderer';
import { DynamicFormProps, FormField } from '@/types/form';
import { formatDateForStorage, parseDateValue } from '@/utils/date';
import { sortFieldsByDisplayOrder } from '@/utils/fieldVisibility';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { CountryPicker } from "react-native-country-codes-picker";
import { DatePickerModal } from 'react-native-paper-dates';
import { AppText } from '../common/AppText';

const DynamicFormComponent = ({
  apiEnv,
  isEnrollmentsForm,
  isEnrollment,
  onTermsPress,
  onPrivacyPress,
  onRefundPress,
  fields,
  enrollmentFields,
  isFieldVisible,
  lookupOptions,
  formData,
  onFormChange,
  validateField,
  errors,
  setErrors,
  touched,
  setTouched
}: DynamicFormProps & { 
  lookupOptions: Record<string, any>;
  formData: Record<string, any>;
  onFormChange: (field: string, value: any, extraData?: Record<string, any>) => void;
  validateField: (field: string, value: any) => string | undefined;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  touched: Record<string, boolean>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [pickerFieldKey, setPickerFieldKey] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFieldKey, setDateFieldKey] = useState<string | null>(null);
  const activeDate = dateFieldKey ? parseDateValue(formData[dateFieldKey]) : undefined;

  const dateValidRange = useMemo(() => {
    if (apiEnv !== 'enrollments') return undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { startDate: today };
  }, [apiEnv]);

  const orderedFields = useMemo(() => sortFieldsByDisplayOrder(fields || []), [fields]);
  const orderedEnrollmentFields = useMemo(() => sortFieldsByDisplayOrder(enrollmentFields || []), [enrollmentFields]);

  const handleFieldChange = (fieldKey: string, value: any, extraData?: Record<string, any>) => {
    onFormChange(fieldKey, value, extraData);
    // setTouched(prev => ({ ...prev, [fieldKey]: true }));

    // const error = validateField(fieldKey, value);
    // setErrors(prev => ({ ...prev, [fieldKey]: error }));
    if (touched[fieldKey]) {
      const error = validateField(fieldKey, value);
      setErrors(prev => ({ ...prev, [fieldKey]: error }));
    } else {
      // Optional: clear error if you want typing to hide the error immediately
      setErrors(prev => ({ ...prev, [fieldKey]: undefined }));
    }
  };

  const handleDateDismiss = () => {
    setShowDatePicker(false);
    setDateFieldKey(null);
  };

  const handleDateConfirm = ({ date }: { date: Date | undefined }) => {
    if (dateFieldKey && date) {
      handleFieldChange(dateFieldKey, formatDateForStorage(date));
    }

    handleDateDismiss();
  };

  const handleDateChange = ({ date }: { date: Date | undefined }) => {
    if (dateFieldKey && date) {
      handleFieldChange(dateFieldKey, formatDateForStorage(date));
      handleDateDismiss();
    }
  };

  const openDatePicker = (fieldKey: string) => {
    setDateFieldKey(fieldKey);
    setShowDatePicker(true);
  };

  const openCountryPicker = (fieldKey: string) => {
    setPickerFieldKey(fieldKey);
    setShowCountryPicker(true);
  };

  const renderField = (field: FormField, fieldId: string) => {
    if (isEnrollmentsForm) return;
    if (field.fieldType !== 'row' && field.key && isFieldVisible && !isFieldVisible(field.key)) {
      return null;
    }

    switch (field.fieldType) {
      case 'text':
      case 'currency':
      case 'email':
      case 'number':
        return (
          <TextFieldRenderer
            field={field}
            formData={formData}
            handleFieldChange={handleFieldChange}
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField}
          />
        );

      case 'date':
        return (
          <DateFieldRenderer
            field={field}
            fieldId={fieldId}
            formData={formData}
            errors={errors}
            touched={touched}
            openDatePicker={openDatePicker}
          />
        );

      case 'tel':
        return (
          <PhoneFieldRenderer
            field={field}
            formData={formData}
            handleFieldChange={handleFieldChange}
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField}
            openCountryPicker={openCountryPicker}
          />
        );

      case 'longtext':
        return (
          <TextFieldRenderer
            field={field}
            formData={formData}
            handleFieldChange={handleFieldChange}
            errors={errors}
            setErrors={setErrors}
            touched={touched}
            setTouched={setTouched}
            validateField={validateField}
            multiline
          />
        );

      case 'lookup':
        return (
          <LookupFieldRenderer
            field={field}
            fieldId={fieldId}
            apiEnv={apiEnv}
            lookupOptions={lookupOptions}
            formData={formData}
            touched={touched}
            errors={errors}
            handleFieldChange={handleFieldChange}
          />
        );

      case 'checkbox':
        return (
          <CheckboxFieldRenderer
            field={field}
            isEnrollment={isEnrollment}
            onTermsPress={onTermsPress}
            onPrivacyPress={onPrivacyPress}
            onRefundPress={onRefundPress}
            formData={formData}
            touched={touched}
            errors={errors}
            handleFieldChange={handleFieldChange}
          />
        );

      case 'row':
        const hasVisibleLeaf = (nestedField: FormField): boolean => {
          if (nestedField.fieldType === 'row') {
            return (nestedField.fields || []).some(hasVisibleLeaf);
          }

          return !nestedField.key || !isFieldVisible || isFieldVisible(nestedField.key);
        };
        const visibleNestedFields = sortFieldsByDisplayOrder(field.fields || []).filter(hasVisibleLeaf);

        if (visibleNestedFields.length === 0) {
          return null;
        }

        return (
          <View>
            {field.label ? <AppText weight='bold' mBottom={8}>{field.label}</AppText> : null}
            {field.hint ? <AppText size='small' color='neutral08' mBottom={12}>{field.hint}</AppText> : null}
            <View>
              {visibleNestedFields.map((nestedField: FormField, index: number) => (
                <View key={`${fieldId}_${nestedField.key || index}`}>
                  {renderField(nestedField, `${fieldId}_${nestedField.key || index}`)}
                </View>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {orderedFields.map((field, index) => (
        <React.Fragment key={`${field.key || field.fieldType}_${index}`}>
          {renderField(field, `${field.key || field.fieldType}_${index}`)}
        </React.Fragment>
      ))}

      {orderedEnrollmentFields.map((field, index) => (
        <React.Fragment key={`${field.key || field.fieldType}_${index}`}>
          {renderField(field, `${field.key || field.fieldType}_${index}`)}
        </React.Fragment>
      ))}

      <CountryPicker
        show={showCountryPicker}
        lang="en"
        style={{ modal: { height: 500 }}}
        pickerButtonOnPress={(item) => {
          if (pickerFieldKey) {
            handleFieldChange(`${pickerFieldKey}_callingCode`, item.dial_code);
            handleFieldChange(`${pickerFieldKey}_countryCode`, item.code);
            handleFieldChange(`${pickerFieldKey}_flag`, item.flag);
          }
          setShowCountryPicker(false);
        }}
        onBackdropPress={() => setShowCountryPicker(false)}
      />

      <DatePickerModal
        locale="en"
        mode="single"
        visible={showDatePicker}
        onDismiss={handleDateDismiss}
        date={activeDate}
        onChange={handleDateChange}
        onConfirm={handleDateConfirm}
        validRange={dateValidRange}
      />
    </>
  );
};

export default DynamicFormComponent;
