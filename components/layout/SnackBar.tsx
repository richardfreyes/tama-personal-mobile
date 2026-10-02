import { Colors } from '@/styles/common/colors';
import { snackBarStyles as styles } from '@/styles/components/layout/SnackBar';
import { SnackBarProps } from '@/types';
import Octicons from '@expo/vector-icons/Octicons';
import React from 'react';
import { View } from 'react-native';
import { Portal as PaperPortal, Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../common/AppText';

const SnackbarComponent: React.FC<SnackBarProps> = ({ variant = 'success', visible, onDismiss, message }) => {
  const insets = useSafeAreaInsets();
  const topPosition = insets.top + 10; 

  const variantConfig = {
    success: {
      icon: 'check-circle-fill' as const,
      color: Colors.success09,
      borderColor: Colors.success06,
      backgroundColor: Colors.success01,
    },
    error: {
      icon: 'x-circle-fill' as const,
      color: Colors.error06,
      borderColor: Colors.error06,
      backgroundColor: Colors.error01,
    },
  };

  const config = variantConfig[variant];

  if (!visible) {
    return null;
  }

  return (
    <PaperPortal>
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        duration={4000}
        wrapperStyle={{ top: topPosition, zIndex: 10000, position: 'absolute', paddingHorizontal: 24 }}
        style={[styles.snackbar, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}
      >
        <View style={styles.content}>
          <Octicons 
            name={config.icon} 
            size={20} 
            color={config.color}
            style={{ marginRight: 24 }} 
          />
          <AppText style={{paddingRight: 24}} size='small'>
            {message}
          </AppText>
        </View>
      </Snackbar>
    </PaperPortal>
  );
}

export default SnackbarComponent;
