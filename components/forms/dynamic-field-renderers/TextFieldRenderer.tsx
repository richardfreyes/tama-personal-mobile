import InputValidationComponent from '@/components/forms/InputValidationComponent';
import { TextFieldRendererProps } from '@/types';

export const TextFieldRenderer = ({
  field,
  formData,
  handleFieldChange,
  errors,
  setErrors,
  touched,
  setTouched,
  validateField,
  multiline,
}: TextFieldRendererProps) => {
  const inputProps = {
    field: field.key,
    value: formData[field.key] || '',
    setValue: (value: string) => handleFieldChange(field.key, value),
    label: field.label,
    placeholder: field.placeholder || field.label,
    errors,
    setErrors,
    touched,
    setTouched,
    validateField,
    maxLength: field.fieldType === 'currency' ? undefined : field.maxLength,
    multiline,
    formatAsCurrency: field.fieldType === 'currency',
  };

  if (multiline) {
    return <InputValidationComponent {...inputProps} />;
  }

  return (
    <InputValidationComponent
      {...inputProps}
      keyboardType={
        field.fieldType === 'email' ? 'email-address' :
        field.fieldType === 'currency' ? 'decimal-pad' :
        field.fieldType === 'number' ? 'numeric' :
        'default'
      }
    />
  );
};
