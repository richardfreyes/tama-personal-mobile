import WarningIcon from '@/assets/icons/warning.svg';
import { Colors } from '@/styles/common/colors';
import { globalStyle, inputFocusColor } from '@/styles/common/globals';
import { fullScreenModalStyles as styles } from '@/styles/components/layout/FullScreenModal';
import { FullScreenModalProps, IconProps } from '@/types';
import React from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  type,
  isVisible,
  onClose,
  title,
  children,
  onAction,
  headerActionText,
}) => {
  const insets = useSafeAreaInsets();

  const getTypeIconProps = (type: string | null | undefined): IconProps => {
    const baseStyle = { marginBottom: 12 };
    const size = { width: 54, height: 54 };

    switch (type) {
      case 'cancelAutopay':
      case 'cancelEnrollment':
        return { Icon: WarningIcon, style: baseStyle, ...size };
      default:
        return { Icon: null };
    }
  };

  const iconProps = getTypeIconProps(type);
  const IconComponent = iconProps.Icon;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={[styles.centerView,  { paddingTop: insets.top, paddingBottom: insets.top }]} activeOpacity={1} onPressOut={onClose}>
        <View style={styles.container}>
          <ScrollView style={styles.content}>
            <View style={styles.topContent}>
              {IconComponent && <IconComponent style={iconProps.style} width={iconProps.width} height={iconProps.height} fill={Colors.success10}/>}
              <AppText style={{ marginBottom: 12 }} weight='700' size='medium'>{title}</AppText>
              <AppText size='base' style={[globalStyle.textAlignCenter, { marginBottom: 12 }]}>Autopay covers the entire month, and once canceled, you may lose access to all benefits for the rest of the month.</AppText>
              <AppText style={{ marginBottom: 4 }} size='extraSmall'>Invoice ID: <AppText size='extraSmall' weight='700'>QW-I-SXYTXYIB</AppText></AppText>
              <AppText style={{ marginBottom: 4 }} size='extraSmall'>Amount: <AppText size='extraSmall' weight='700'>PHP 4,000.00</AppText></AppText>
              <AppText style={{ marginBottom: 12 }} size='extraSmall'>Due Date: <AppText size='extraSmall' weight='700'>October 23, 2025</AppText></AppText>
            </View>
            <TextInput
              mode="outlined"
              activeOutlineColor={inputFocusColor}
              label="Reason for Cancellation"
              placeholder="Please state your reason."
              placeholderTextColor="#A9A9A9"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              contentStyle={{ minHeight: 280, textAlignVertical: 'top' }}
              style={{ marginBottom: 12 }}
            />
            <AppText style={{ marginBottom: 12 }} size='extraSmall'>Cancellation of an invoice is final. Type <AppText size='extraSmall' weight='700'>"cancel invoice"</AppText> below to confirm cancellation:</AppText>
            <TextInput mode="outlined" activeOutlineColor={inputFocusColor} style={{ marginBottom: 24 }}/>
            <View style={styles.btnContainer}>
              <View style={{flex: 1, marginRight: 4}}>
                <AppButton 
                  title="Back"
                  variant="tertiary" 
                  onPress={onClose}
                />
              </View>
              <View style={{flex: 1, marginLeft: 4}}>
                <AppButton 
                  title="Confirm"
                  variant="danger" 
                  countdownSeconds={5} 
                  isCountdownActive={isVisible}
                  onPress={onAction}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default FullScreenModal;
