import MailIcon from '@/assets/icons/mail.svg';
import PhoneIcon from '@/assets/icons/phone.svg';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { optDeliverySelectionStyles as styles } from '@/styles/auth/reset-password/otp-delivery-selection';
import { globalStyle } from '@/styles/common/globals';
import { SelectionCardProps } from '@/types';
import { router } from 'expo-router';
import React from 'react';
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
  const userEmail = 'user@example.com';
  const userPhone = '+63 955 577* ***';

  const handleContinue = (method: 'email' | 'text') => {
    router.push({
      pathname: '/reset-password/verify-otp',
      params: { method, identifier: method === 'email' ? userEmail : userPhone }
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
            title="via SMS:"
            description={userPhone}
            onPress={() => handleContinue('text')}
          />
          <SpacerComponent height={12} />
          <SelectionCard
            icon={MailIcon}
            title="via email:"
            description={userEmail}
            onPress={() => handleContinue('email')}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default OTPDeliverySelectionScreen;