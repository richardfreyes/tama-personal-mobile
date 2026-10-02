import MailIcon from '@/assets/icons/mail.svg';
import PhoneIcon from '@/assets/icons/phone.svg';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { optDeliverySelectionStyles as styles } from '@/styles/auth/reset-password/otp-delivery-selection';
import { globalStyle } from '@/styles/common/globals';
import { SelectionCardProps } from '@/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SelectionCard: React.FC<SelectionCardProps> = ({ icon: Icon, title, description, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrapper}>
        <Icon width={32} height={32} />
      </View>
      <View style={styles.textWrapper}>
        <AppText style={styles.cardTitle}>{title}</AppText>
        <AppText style={styles.cardDescription} weight='700'>{description}</AppText>
      </View>
    </TouchableOpacity>
  );
};

const OTPDeliverySelectionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'text' | null>('email');

  // mock from the previous screen (reset-password.tsx)
  const userEmail = 'user@example.com';
  const userPhone = '+63 955 577* ***';
  
  const handleContinue = (otp: string) => {
    setSelectedMethod(otp as string as 'email' | 'text');

    // TODO: 1. Call API to request OTP via selectedMethod.
    // TODO: 2. Navigate to the OTP verification screen (verify.tsx)
    // passing the selected method and user identifier.
    // For now, navigate to the existing verification screen:
    router.push({
      pathname: '/reset-password/verify-otp', 
      params: { method: selectedMethod, identifier: selectedMethod === 'email' ? userEmail : userPhone }
    });
  };

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, styles.container ]}>
      <NavHeaderComponent />
      <View style={{ flex: 1 }}>
        <AppText weight='700' style={[globalStyle.headerTitle, { marginBottom: 24 }]}>Make Selection</AppText>
        <AppText style={styles.headerMessage}>Select which contact detail should we use to reset your password.</AppText>
        <View style={styles.cardContainer}>
          <SelectionCard
            icon={PhoneIcon}
            title="via email:"
            description={userPhone}
            onPress={() => handleContinue('text')}
          />
          <SpacerComponent height={12} />
          <SelectionCard
            icon={MailIcon}
            title="via SMS:"
            description={userEmail}
            onPress={() => handleContinue('email')}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default OTPDeliverySelectionScreen;