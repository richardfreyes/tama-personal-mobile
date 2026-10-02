import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { CONTACT_CHANNELS, CONTACT_SUPPORT_INFO } from '@/constants/contact';
import type { ContactActionType } from '@/constants/contact';
import { contactStyles as styles } from '@/styles/app/settings/contact';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Linking, TouchableOpacity, View } from 'react-native';

const openContactChannel = async (url: string, action: ContactActionType) => {
  if (action === 'web') {
    await WebBrowser.openBrowserAsync(url);
    return;
  }

  await Linking.openURL(url);
};

export default function ContactScreen() {
  return (
    <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, styles.screenContainer]}>
      <NavHeaderComponent title="Contact Us" />

      <View style={styles.introCard}>
        <AppText weight="700" style={styles.introEyebrow}>Connect with us</AppText>
        <AppText weight="700" style={styles.introTitle}>We are here to help</AppText>
        <AppText style={styles.introBody}>
          Reach Tama through our official support channels for account, billing, payment, and transaction concerns.
        </AppText>
      </View>

      <AppText weight="700" style={styles.sectionTitle}>Contact channels</AppText>
      <View style={styles.contactList}>
        {CONTACT_CHANNELS.map((channel, index) => {
          const isLast = index === CONTACT_CHANNELS.length - 1;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              accessibilityRole="link"
              key={`${channel.title}-${channel.label}`}
              onPress={() => openContactChannel(channel.url, channel.action)}
              style={[styles.contactRow, isLast ? styles.contactRowLast : null]}
            >
              <View style={styles.iconCircle}>
                <Feather name={channel.icon} size={18} color={Colors.aqua10} />
              </View>
              <View style={styles.contactText}>
                <AppText weight="600" style={styles.contactTitle}>{channel.title}</AppText>
                <AppText style={styles.contactLabel}>{channel.label}</AppText>
              </View>
              <ChevronRightIcon width={16} height={16} />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.infoCard}>
        {CONTACT_SUPPORT_INFO.map((item, index) => {
          const isLast = index === CONTACT_SUPPORT_INFO.length - 1;
          return (
            <View key={item.label} style={[styles.infoRow, isLast ? styles.infoRowLast : null]}>
              <AppText weight="600" style={styles.infoLabel}>{item.label}</AppText>
              <AppText style={styles.infoValue}>{item.value}</AppText>
            </View>
          );
        })}
      </View>
    </GlobalScrollView>
  );
}
