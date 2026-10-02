import NativePicker from '@/components/forms/NativePicker';
import { LookupFieldRendererProps } from '@/types';
import { normalizeLookupOptions } from '@/utils/normalizeLookupOptions';

const getLookupItems = (fieldKey: string, lookupOptions: Record<string, any>) => {
  const optionsSource = lookupOptions?.[fieldKey];

  if (Array.isArray(optionsSource)) {
    return optionsSource;
  }

  if (fieldKey === 'projectName' && Array.isArray(optionsSource?.projects)) {
    return optionsSource.projects;
  }

  if (fieldKey === 'paymentMode' && Array.isArray(optionsSource?.paymentModes)) {
    return optionsSource.paymentModes;
  }

  if (optionsSource && typeof optionsSource === 'object') {
    return Object.values(optionsSource);
  }

  return [];
};

export const LookupFieldRenderer = ({
  field,
  fieldId,
  apiEnv,
  lookupOptions,
  formData,
  touched,
  errors,
  handleFieldChange,
}: LookupFieldRendererProps) => {
  const optionsArray = normalizeLookupOptions(field.key, lookupOptions);

  return (
    <NativePicker
      key={fieldId}
      label={field.label}
      placeholder={field.placeholder || field.label || 'Select an option'}
      options={optionsArray}
      selectedValue={ field.key === 'projectName' ? (formData.projectId || formData[field.key]) : apiEnv === 'enrollments' && formData[`${field.key}Code`] ? formData[`${field.key}Code`] : formData[field.key]}
      onValueChange={(value) => {
        const selectedValue = value as string;
        const selectedOption = optionsArray.find((option) => String(option.code) === selectedValue);

        if (field.key === 'projectName') {
          const selectedProject = getLookupItems(field.key, lookupOptions).find((item: any) => (
            String(item?.projectId ?? item?.merchantProjectId ?? item?.project_id ?? item?.id) === selectedValue
          ));

          handleFieldChange(
            field.key,
            String(selectedProject?.name ?? selectedProject?.project_name ?? selectedValue),
            {
              projectId: String(selectedProject?.projectId ?? selectedValue),
              merchantProjectId: selectedProject?.merchantProjectId,
              projectCategory: selectedProject?.category ?? selectedProject?.project_category ?? '',
            }
          );
          return;
        }

        if (apiEnv === 'enrollments' && selectedOption) {
          const shouldStoreCodeValue = field.key === 'paymentType';

          handleFieldChange(field.key, shouldStoreCodeValue ? selectedOption.code : selectedOption.name, {
            [field.key]: shouldStoreCodeValue ? selectedOption.code : selectedOption.name,
            [`${field.key}Code`]: selectedOption.code,
          });
          return;
        }

        handleFieldChange(field.key, selectedValue);
      }}
      error={touched[field.key] ? errors[field.key] : undefined}
    />
  );
};
