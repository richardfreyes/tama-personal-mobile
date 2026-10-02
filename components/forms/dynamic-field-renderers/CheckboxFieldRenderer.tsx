import TermsAndConditionsCheckbox from '@/components/settings/TermsAndPolicyText';
import { globalStyle } from '@/styles/common/globals';
import { CheckboxFieldRendererProps } from '@/types';
import { View } from 'react-native';
import { HelperText } from 'react-native-paper';

export const CheckboxFieldRenderer = ({
  field,
  isEnrollment,
  onTermsPress,
  onPrivacyPress,
  onRefundPress,
  formData,
  touched,
  errors,
  handleFieldChange,
}: CheckboxFieldRendererProps) => {
  const shouldUsePolicyModals = !isEnrollment && (!!onPrivacyPress || !!onRefundPress);

  return (
    <View>
      <TermsAndConditionsCheckbox
        extraText={field.label}
        onTermsLinkPress={isEnrollment || shouldUsePolicyModals ? onTermsPress : undefined}
        onPrivacyLinkPress={!isEnrollment ? onPrivacyPress : undefined}
        onRefundLinkPress={!isEnrollment ? onRefundPress : undefined}
        isChecked={formData[field.key]}
        onToggle={() => handleFieldChange(field.key, !formData[field.key])}
      />
      { !!(touched[field.key] && errors[field.key]) && (
        <HelperText style={[globalStyle.inputLabelError, { marginBottom: 6 }]} type="error" visible={!!(touched[field.key] && errors[field.key])}>
          To proceed, please check this box to confirm that you agree to our Terms and Conditions.
        </HelperText>
      )}
    </View>
  );
};
