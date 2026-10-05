import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { infoFieldComponentStyles as styles } from '@/styles/components/common/InfoFieldComponent';
import { InfoFieldProps } from '@/types';
import { formatMonetaryDisplayValue } from '@/utils/format';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { View } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { AppText } from './AppText';

const InfoFieldComponent: React.FC<InfoFieldProps> = ({
  label,
  value,
  containerStyle,
  labelStyle,
  valueStyle,
  weight = '400',
  copy,
  variant = 'default',
  emptyText = '---',
}) => {
  const dispatch = useAppDispatch();
  const displayValue = formatMonetaryDisplayValue(value, label) || value;

  const handleCopy = async () => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    dispatch(showSnackbar({
      message: 'Value copied to clipboard.',
      variant: 'success'
    }));
  };

  const isSummary = variant === 'summary';
  const valueWeight = isSummary ? (displayValue ? '500' : '400') : weight;

  return (
    <View style={[styles.fieldContainer, isSummary && styles.summaryContainer, containerStyle]}>
      <AppText style={[isSummary ? styles.summaryLabel : styles.fieldLabel, labelStyle]}>
        {label}
      </AppText>
      <AppText
        style={[isSummary ? (displayValue ? styles.summaryValue : styles.summaryEmpty) : styles.fieldValue, valueStyle]}
        weight={valueWeight}
      >
        {displayValue || emptyText}
      </AppText>
      {copy && value && (
        <View style={{ marginRight: 16 }}>
          <PaperTextInput.Icon
            style={styles.copyIcon} 
            icon="content-copy"
            size={16}
            onPress={handleCopy}
          />
        </View>
      )}
      <View style={[styles.fieldDivider, isSummary && styles.summaryDivider]} />
    </View>
  )
};

export default InfoFieldComponent;
