import { useThemeColors, useThemedStyles } from '@/hooks/useAppTheme';
import MailIcon from '@/assets/icons/mail.svg';
import PhoneIcon from '@/assets/icons/phone.svg';
import { AppText } from '@/components/common/AppText';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { createOptDeliverySelectionStyles as makeStyles } from '@/styles/auth/reset-password/otp-delivery-selection';
import { createGlobalStyle as makeGlobalStyle } from '@/styles/common/globals';
import { SelectionCardProps } from '@/types';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

const SelectionCard: React.FC<SelectionCardProps> = ({ icon: Icon, title, description, onPress }) => {
  const styles = useThemedStyles(makeStyles);
  const Colors = useThemeColors();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrapper}>
        <Icon width={18} height={18} />
      </View>
      <View style={styles.textWrapper}>
        <AppText style={styles.cardTitle}>{title}</AppText>
        <AppText style={styles.cardDescription} weight='600'>{description}</AppText>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
};

const OTPDeliverySelectionScreen: React.FC = () => {
  const styles = useThemedStyles(makeStyles);
  const globalStyle = useThemedStyles(makeGlobalStyle);

  const Colors = useThemeColors();
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
        <View style={globalStyle.authHeroIcon}>
          <Feather name="shield" size={22} color={Colors.primaryText} />
        </View>
        <AppText weight='600' style={globalStyle.authTitle}>Make Selection</AppText>
        <AppText style={globalStyle.authLead}>Select which contact detail should we use to reset your password.</AppText>
        <View style={styles.cardContainer}>
          <SelectionCard
            icon={PhoneIcon}
            title="via SMS:"
            description={userPhone}
            onPress={() => handleContinue('text')}
          />
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