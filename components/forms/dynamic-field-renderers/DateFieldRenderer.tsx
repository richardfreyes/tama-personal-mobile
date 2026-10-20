import { useThemedStyles, useThemeColors } from '@/hooks/useAppTheme';
import { createGlobalStyle as makeGlobalStyle, inputFocusColor } from '@/styles/common/globals';
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
  const Colors = useThemeColors();
  const globalStyle = useThemedStyles(makeGlobalStyle);

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
            activeOutlineColor={inputFocusColor}
            accessibilityLabel={field.label}
            style={globalStyle.paperTextInput}
            contentStyle={globalStyle.inputContent}
            outlineStyle={globalStyle.inputOutline}
            outlineColor={Colors.border}
            textColor={Colors.text}
            value={formatDateDisplay(formData[field.key])}
            placeholder={field.placeholder && field.placeholder !== field.label ? field.placeholder : undefined}
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
