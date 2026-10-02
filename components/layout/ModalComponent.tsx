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
  const { isVisible, dismissible, iconType, headerMessage, bodyMessage, bodyType, buttonConfig, id } = useAppSelector(selectModal);
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

// REFERENCE TODO FOR PHASE 2 THIS IS REFACTORED CODE

// END //
// const ModalComponent: React.FC<ModalComponentProps> = ({
//   type,
//   iconType,
//   isVisible,
//   onClose,
//   headerMessage,
//   bodyMessage,
//   buttonConfig,
//   buttonText,
//   buttonTextSecondary,
//   onButtonPress,
//   onButtonPressSecondary,
//   invoiceStatus,
//   refId,
//   chargedAmount,
//   retries,
//   paymentRefId,
//   datePaid,
// }) => {
//   const getStatusIconProps = (status: string | null | undefined) => {
//     switch (status) {
//       case 'Paid':
//         return { 
//           Icon: CheckIcon, 
//           fillColor: Colors.success10 
//         };
//       case 'Pending':
//       case 'Sched':
//         return { 
//           Icon: ClockIcon, 
//           fillColor: Colors.maroon10 
//         };
//       default:
//         return { 
//           Icon: CircleExclamationIcon, 
//           fillColor: Colors.textSecondary
//         };
//     }
//   };
//   const { Icon: StatusIcon, fillColor } = getStatusIconProps(invoiceStatus);

//   const getTypeIcon = (iconType: string) => {
//     switch (iconType) {
//       case 'error':
//       case 'warning':
//         return WarningIcon;
//       case 'success':
//         return CheckCircleIcon;
//       default:
//         return CheckCircleIcon;
//     }
//   }
//   const TypeIcon = getTypeIcon(iconType || '');

//   return (  
//     <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose} >
//       <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={onClose}>
//         { type && type === 'invoice' ? (
//           <View style={styles.modalView} onStartShouldSetResponder={() => true}>
//             <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={onClose}>
//               <CloseIcon width={24} height={24} onPress={onClose} />
//             </TouchableOpacity>
//             <StatusIcon width={42} height={42} style={styles.icon} fill={fillColor} />
//             <AppText style={styles.invoiceTitle} weight='700'>{invoiceStatus?.toUpperCase()}</AppText>
//             <AppText size='extraSmall' style={styles.invoiceLabel}>Invoice Reference ID: <AppText size='extraSmall' weight='700'>{refId}</AppText></AppText>
//             <AppText size='extraSmall' style={styles.invoiceLabel}>{invoiceStatus === 'Paid' ? 'Charged Amount: ' : 'Amount Due:'} <AppText size='extraSmall' weight='700'>{chargedAmount}</AppText></AppText>
//             { invoiceStatus === 'Paid' ? (
//               <>
//                 <AppText size='extraSmall' style={styles.invoiceLabel}>Retries: <AppText size='extraSmall'>{retries}</AppText></AppText>
//                 <AppText size='extraSmall' style={styles.invoiceLabel}>Payment Reference ID: <AppText size='extraSmall' weight='700' style={{color: Colors.red10, textDecorationLine: 'underline'}}>{paymentRefId}</AppText></AppText>
//               </>
//             ) : null }
//             <AppText size='extraSmall' style={styles.invoiceLabel}>{ invoiceStatus === 'Paid' ? 'Paid At: ' : 'Due At: '}<AppText size='extraSmall' weight='700'>{datePaid}</AppText></AppText>
//             { invoiceStatus === 'Sched' ? (
//               <View style={{ width: '100%' }}>
//                 <SpacerComponent height={24} />
//                 <AppButton title={buttonText} onPress={onButtonPress} variant="primary"/>
//                 <SpacerComponent height={12} />
//                 { buttonTextSecondary ? 
//                   <AppButton 
//                     title={buttonTextSecondary} 
//                     onPress={onButtonPressSecondary} 
//                     variant="danger" 
//                     countdownSeconds={5} 
//                     isCountdownActive={isVisible}
//                   /> 
//                 : null }
//               </View>
//             ) : null }
//           </View>
//         ) : (
//           <View style={styles.modalView} onStartShouldSetResponder={() => true}>
//             <AppText style={styles.headerMessage} weight='700'>{headerMessage}</AppText>
//             <TypeIcon width={42} height={42} style={styles.icon} />
//             <AppText style={styles.modalText}>{bodyMessage}</AppText>
//             { buttonConfig && buttonConfig.direction === 'row' ? (
//               <View style={{ width: '100%', flexDirection: 'row' }}>
//                 <View style={{ flex: 1, marginRight: 6 }}>
//                   <AppButton title={buttonText} onPress={onButtonPress} variant="tertiary"/>
//                 </View>
//                 <View style={{ flex: 1, marginLeft: 6 }}>
//                   { buttonTextSecondary ? <AppButton title={buttonTextSecondary} onPress={onButtonPress} variant="danger"/> : null }
//                 </View>
//               </View>
//             ) : (
//               <View style={{ width: '100%' }}>
//                 <AppButton title={buttonText} onPress={onButtonPress} variant="primary"/>
//                 <SpacerComponent height={12} />
//                 { buttonTextSecondary ? <AppButton title={buttonTextSecondary} onPress={onButtonPress} variant="tertiary" textStyle={{color: 'red'}}/> : null }
//               </View>
//             )}
//           </View>
//         )}
//       </TouchableOpacity>
//     </Modal>
//   );
// };


// export default ModalComponent;
