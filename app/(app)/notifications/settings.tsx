import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import SettingToggleItem from '@/components/settings/NotificationSetting';
import { notificationSettingsStyles as styles } from '@/styles/app/notifications/settings';
import { globalStyle } from '@/styles/common/globals';
import React, { useState } from 'react';
import { View } from 'react-native';

const NotificationSettingsScreen = () => {
  const [settings, setSettings] = useState({
    pushNotification: true,
    emailNotification: false,
    smsNotification: true,
    paymentConfirmNotification: false,
    paymentFailureNotification: false,
    upcomingDueNotification: true,
    newBillNotification: false,
    appAnnoucementNotification: false,
    promotionAndOfferNotification: false,
    productUpdateNotification: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <NavHeaderComponent title='Notifications Settings' />
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <AppText weight='600' size='medium' mBottom={12}>Manage Alerts</AppText>
          <AppText size='small'>Manage how you receive updates and alerts from Tama. Turn on the notifications you want to stay informed.</AppText>

          <AppText  style={styles.sectionTitle} weight="600" size='medium'>General Notification</AppText>

          <SettingToggleItem
            label="Push Notifications"
            description="Toggle all app notifications on/off"
            isEnabled={settings.pushNotification}
            onToggle={() => handleToggle('pushNotification')}
          />

          <SettingToggleItem
            label="Email Notifications"
            description="Receive email alerts for key transactions."
            isEnabled={settings.emailNotification}
            onToggle={() => handleToggle('emailNotification')}
          />

          <SettingToggleItem
            label="SMS Notifications"
            description="Get alerts via text message"
            isEnabled={settings.smsNotification}
            onToggle={() => handleToggle('smsNotification')}
          />

          <AppText style={styles.sectionTitle} weight="600" size='medium'>Payments & Bills</AppText>

          <SettingToggleItem
            label="Payment Confirmations"
            description="Get notified when a payment succeeds"
            isEnabled={settings.paymentConfirmNotification}
            onToggle={() => handleToggle('paymentConfirmNotification')}
          />

          <SettingToggleItem
            label="Payment Failures"
            description="Receive alerts for failed or declined payments"
            isEnabled={settings.paymentFailureNotification}
            onToggle={() => handleToggle('paymentFailureNotification')}
          />

          <SettingToggleItem
            label="Upcoming Due Dates"
            description="Reminder before your bill or payment is due"
            isEnabled={settings.upcomingDueNotification}
            onToggle={() => handleToggle('upcomingDueNotification')}
          />

          <SettingToggleItem
            label="New Bill Available"
            description="Notification when a new bill is ready"
            isEnabled={settings.newBillNotification}
            onToggle={() => handleToggle('newBillNotification')}
          />

          <AppText style={styles.sectionTitle} weight="600" size='medium'>Payments & Bills</AppText>

          <SettingToggleItem
            label="App Announcements"
            description="News or updates about the app"
            isEnabled={settings.appAnnoucementNotification}
            onToggle={() => handleToggle('appAnnoucementNotification')}
          />

          <SettingToggleItem
            label="Promotions & Offers"
            description="Special deals and marketing messages"
            isEnabled={settings.promotionAndOfferNotification}
            onToggle={() => handleToggle('promotionAndOfferNotification')}
          />

          <SettingToggleItem
            label="Product Updates"
            description="Information about new features or improvements"
            isEnabled={settings.productUpdateNotification}
            onToggle={() => handleToggle('productUpdateNotification')}
          />

        </View>
      </View>
      <SpacerComponent height={100} />
    </GlobalScrollView>
  );
};

export default NotificationSettingsScreen;