import { globalStyle } from '@/styles/common/globals';
import { DateFieldRendererProps } from '@/types';
import { formatDateDisplay } from '@/utils/date';
import { TouchableOpacity, View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

export const DateFieldRenderer = ({
  field,
  fieldId,
  formData,
  errors,
  touched,
  openDatePicker,
}: DateFieldRendererProps) => {
  const handleOpenDatePicker = () => {
    openDatePicker(field.key);
  };

  return (
    <View key={fieldId}>
      <TouchableOpacity activeOpacity={0.7} onPress={handleOpenDatePicker}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={field.label}
            value={formatDateDisplay(formData[field.key])}
            placeholder={field.placeholder || field.label}
            editable={false}
            error={!!(touched[field.key] && errors[field.key])}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={handleOpenDatePicker}
                forceTextInputFocus={false}
              />
            }
          />
        </View>
      </TouchableOpacity>
      <HelperText style={globalStyle.inputLabelError} type="error" visible={!!(touched[field.key] && errors[field.key])}>
        {touched[field.key] ? errors[field.key] : ''}
      </HelperText>
    </View>
  );
};
