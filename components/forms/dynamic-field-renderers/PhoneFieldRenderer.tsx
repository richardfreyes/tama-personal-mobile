import { AppText } from '@/components/common/AppText';
import InputValidationComponent from '@/components/forms/InputValidationComponent';
import { dynamicFormComponentStyles as style } from '@/styles/components/forms/DynamicFormComponent';
import { PhoneFieldRendererProps } from '@/types/common';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

export const localPhoneNumber = (value: string, callingCode: string): string => {
  const compact = value.replace(/[\s()-]/g, '');
  const prefix = callingCode.replace(/\D/g, '');
  if (!prefix) return value;
  const withoutPrefix = compact.replace(new RegExp(`^\\+?${prefix}`), '');
  return withoutPrefix === compact ? value : withoutPrefix;
};

export const PhoneFieldRenderer = ({
  field,
  formData,
  handleFieldChange,
  errors,
  setErrors,
  touched,
  setTouched,
  validateField,
  openCountryPicker,
}: PhoneFieldRendererProps) => {
  const currentCallingCode = formData[`${field.key}_callingCode`] || '+63';
  const currentFlag = formData[`${field.key}_flag`] || '🇵🇭';

  return (
    <View key={field.key}>
      <View style={{ flex: 1 }}>
        <InputValidationComponent
          key={`${field.key}_${currentCallingCode}`}
          style={{ paddingLeft: 30 }}
          field={field.key}
          value={localPhoneNumber(formData[field.key] || '', currentCallingCode)}
          setValue={(value) => handleFieldChange(field.key, localPhoneNumber(value, currentCallingCode))}
          label={field.label}
          placeholder={field.placeholder || field.label}
          errors={errors}
          setErrors={setErrors}
          touched={touched}
          setTouched={setTouched}
          validateField={validateField}
          keyboardType="phone-pad"
          maxLength={field.maxLength}
          left={
            <TextInput.Icon
              icon={() => (
                <View style={style.countryPicker}>
                  <AppText size='base' color='neutral10' mLeft={16}>{currentFlag}</AppText>
                  <AppText size='base' color='neutral10'>{currentCallingCode}</AppText>
                  <AppText size='tiny' color='neutral10' mLeft={6}>▼</AppText>
                </View>
              )}
              onPress={() => openCountryPicker(field.key)}
              style={style.countryPickerIcon}
              rippleColor="transparent"
              forceTextInputFocus={false}
            />
          }
        />
      </View>
    </View>
  );
};
