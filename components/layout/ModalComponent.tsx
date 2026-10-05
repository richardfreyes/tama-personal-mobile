import { default as CheckCircleIcon } from '@/assets/icons/check-circle.svg';
import InfoIcon from '@/assets/icons/circle-exclamation.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import WarningIcon from '@/assets/icons/warning.svg';
import { useAuth } from '@/hooks/useAuth';
import { hideModal, selectModal } from '@/redux/features/modal/modalSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Colors } from '@/styles/common/colors';
import { modalComponentStyles as styles } from '@/styles/components/layout/ModalComponent';
import { modalActions } from '@/utils/modalActions';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Linking, Modal, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';
import { SpacerComponent } from '../common/SpacerComponent';

const getTypeIcon = (iconType: string) => {
  switch (iconType) {
    case 'error':
    case 'warning':
      return WarningIcon;
    case 'success':
    case 'info':
      return InfoIcon;
    case 'logout':
      return LogoutIcon;
    default:
      return CheckCircleIcon;
  }
};

export default function ModalComponent() {
  const dispatch = useAppDispatch();
  const { email } = useAuth();
  const { isVisible, dismissible, iconType, variant, headerMessage, bodyMessage, bodyType, buttonConfig, id } = useAppSelector(selectModal);
  const IconToRender = getTypeIcon(iconType || 'info');

  if (!isVisible) {
    return null;
  }

  const handleClose = () => {
    dispatch(hideModal());
  };

  const handleRequestClose = () => {
    if (dismissible !== false) {
      handleClose();
    }
  };

  const handlePrimaryPress = () => {
    if (id && modalActions[id]) {
      modalActions[id]();
      delete modalActions[id];
    }

    if (bodyType === 'accountDeletion') {
      Linking.openURL(`mailto:support@aqwire.co?subject=[ACCOUNT DEACTIVATION OR DELETION REQUEST] - ${email}`);
    }

    handleClose();
  };

  const handleSecondaryPress = () => {
    handleClose();
  };

  const renderBody = () => {
    switch (bodyType) {
      case 'accountDeletion':
        return (
          <AppText style={{ marginBottom: 16 }}>
            To permanently delete your account and associated data, please send an email to{' '}
            <AppText
              style={{ color: Colors.red10 }}
              onPress={() => Linking.openURL(`mailto:support@aqwire.co?subject=[ACCOUNT DEACTIVATION OR DELETION REQUEST] - ${email}`)}
            >
              support@aqwire.co
            </AppText>{' '}
            with the following details:
            {'\n\n'}
            {'\u2022'} Full Name{'\n'}
            {'\u2022'} Registered Email Address{'\n'}
            {'\u2022'} Reason for Deletion (Optional)
            {'\n\n'}
            Our team will process your request within 7 business days.
          </AppText>
        );

      default:
        return (
          <AppText style={styles.modalText}>
            {bodyMessage}
          </AppText>
        );
    }
  };

  if (variant === 'confirm') {
    return (
      <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={handleRequestClose}>
        <TouchableOpacity testID="modal-backdrop" style={styles.confirmScrim} activeOpacity={1} onPressOut={handleRequestClose}>
          <View accessibilityViewIsModal style={styles.confirmCard} onStartShouldSetResponder={() => true}>
            {iconType ? (
              <View style={styles.confirmIcon}>
                {iconType === 'delete'
                  ? <Feather color={Colors.red09} name="trash-2" size={22} />
                  : <IconToRender width={26} height={26} />}
              </View>
            ) : null}
            <View style={styles.confirmCopy}>
              <AppText accessibilityRole="header" weight="600" style={styles.confirmTitle}>{headerMessage}</AppText>
              <AppText style={styles.confirmBody}>{bodyMessage}</AppText>
            </View>
            {buttonConfig ? (
              <View style={styles.confirmActions}>
                <AppButton
                  buttonStyle={styles.confirmPrimaryButton}
                  onPress={handlePrimaryPress}
                  textStyle={styles.confirmButtonText}
                  title={buttonConfig.primaryLabel}
                  variant="primary"
                />
                {buttonConfig.secondaryLabel ? (
                  <AppButton
                    buttonStyle={styles.confirmSecondaryButton}
                    onPress={handleSecondaryPress}
                    textStyle={styles.confirmSecondaryText}
                    title={buttonConfig.secondaryLabel}
                    variant="quaternary"
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (  
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={handleRequestClose}>
      <TouchableOpacity testID="modal-backdrop" style={styles.centeredView} activeOpacity={1} onPressOut={handleRequestClose}>
        <View style={styles.modalView} onStartShouldSetResponder={() => true}>
          <AppText style={styles.headerMessage} weight='700' size='medium'>{headerMessage}</AppText>
          {iconType && <IconToRender width={54} height={54} style={styles.icon} />}
          {renderBody()}
          {buttonConfig && (
            buttonConfig.direction === 'row' ? (
              <View style={{ width: '100%', flexDirection: 'row', gap: 12 }}>
                {buttonConfig.secondaryLabel && (
                  <View style={{ flex: 1 }}>
                    <AppButton title={buttonConfig.secondaryLabel} onPress={handleSecondaryPress} variant="tertiary" buttonStyle={buttonConfig.secondaryStyle}/>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <AppButton title={buttonConfig.primaryLabel} onPress={handlePrimaryPress} variant="primary" buttonStyle={buttonConfig.primaryStyle}/>
                </View>
              </View>
            ) : (
              <View style={{ width: '100%' }}>
                <AppButton title={buttonConfig.primaryLabel} onPress={handlePrimaryPress} variant="primary" buttonStyle={buttonConfig.primaryStyle}/>
                <SpacerComponent height={12} />
                {buttonConfig.secondaryLabel && (
                  <AppButton title={buttonConfig.secondaryLabel} onPress={handleSecondaryPress} variant="tertiary" buttonStyle={buttonConfig.secondaryStyle}/>
                )}
              </View>
            )
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
