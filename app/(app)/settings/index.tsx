import { useThemedStyles, useThemeColors } from '@/hooks/useAppTheme';
import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { SlideUpScreenModal } from '@/components/layout/SlideUpScreenModal';
import { COMMON } from '@/constants/common';
import { HELP_CENTER_URL } from '@/constants/contact';
import { useAuth } from '@/hooks/useAuth';
import { clearSession } from '@/redux/features/login/loginApi';
import { showModal } from '@/redux/features/modal/modalSlice';
import { useAppDispatch } from '@/redux/hooks';
import { handleSettingsRoute } from '@/services/navigation';
import { createSettingsStyles as makeStyles } from '@/styles/app/settings';
import { createGlobalStyle as makeGlobalStyle } from '@/styles/common/globals';
import { SettingRoute, SlideUpScreenModalRef } from '@/types';
import { modalActions } from '@/utils/modalActions';
import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { APP_INFO } from '@/constants/appInfo';
import * as WebBrowser from 'expo-web-browser';
import { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';

const SETTINGS_NAV = COMMON.SETTINGS.filter(item => item.id !== 'logout');

export default function AccountSettingsScreen() {
  const styles = useThemedStyles(makeStyles);
  const globalStyle = useThemedStyles(makeGlobalStyle);
  const Colors = useThemeColors();

  const dispatch = useAppDispatch();
  const bottomSheetRef = useRef<SlideUpScreenModalRef>(null);
  const { firstName, lastName, email } = useAuth();
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  const version = APP_INFO.version;
  const build = APP_INFO.buildNumber;

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleItemPress = (route: SettingRoute) => {
    if (!route) return;
    if (route === '#about') {
      router.push('/settings/about');
    } else if (route === '#help') {
      openLink(HELP_CENTER_URL);
    } else if (route === '#contact') {
      router.push('/settings/contact');
    } else {
      handleSettingsRoute(route);
    }
  };

  const logoutHandler = async () => {
    await dispatch(clearSession());
    router.replace('/login');
  };

  const handleLogout = () => {
    const modalId = 'accountLogout';
    modalActions[modalId] = logoutHandler;

    dispatch(showModal({
      id: modalId,
      variant: 'confirm',
      iconType: 'logout',
      headerMessage: 'Log Out',
      bodyMessage: 'Are you sure you want to log out?',
      buttonConfig: {
        primaryLabel: 'Log Out',
        secondaryLabel: 'Cancel',
        direction: 'row',
        primaryStyle: { backgroundColor: Colors.errorFill },
      }
    }));
  };

  return (
    <View style={{ flex: 1 }}>
      <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title='Account Settings' />
          <View style={[globalStyle.outerContainer, { gap: 8 }]}>

            {/* Profile row */}
            <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(1)} activeOpacity={0.7}>
              <View style={styles.profileRow}>
                <View style={{ position: 'relative', flexShrink: 0 }}>
                  <LinearGradient
                    colors={['#D41414', '#F36B25', '#FFAD38']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarRing}
                  >
                    <View style={styles.avatarInner}>
                      <AppText weight='600' style={styles.initialsText}>{initials}</AppText>
                    </View>
                  </LinearGradient>
                  <View style={styles.cameraBadge}>
                    <Feather name="camera" size={11} color="#FFFFFF" />
                  </View>
                </View>
                <View style={styles.profileInfo}>
                  <AppText weight='600' style={styles.userNameText} numberOfLines={1}>
                    {firstName} {lastName}
                  </AppText>
                  <AppText style={styles.emailText} numberOfLines={1}>{email}</AppText>
                </View>
              </View>
            </TouchableOpacity>

            {/* Settings card */}
            <View style={styles.settingsCard}>
              {SETTINGS_NAV.map((item, index) => {
                const SvgIcon = item.icon;
                return (
                  <View key={item.id}>
                    {index > 0 && <View style={styles.rowDivider} />}
                    <TouchableOpacity onPress={() => handleItemPress(item.route)} activeOpacity={0.7}>
                      <View style={styles.settingsRow}>
                        <View style={styles.iconTile}>
                          <SvgIcon width={17} height={17} color={Colors.neutral09} />
                        </View>
                        <AppText weight='500' style={styles.rowTitle}>{item.title}</AppText>
                        <ChevronRightIcon width={18} height={18} color={Colors.neutral06} />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Logout row */}
            <View style={styles.settingsCard}>
              <TouchableOpacity
                testID="logout-button"
                onPress={handleLogout}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Log out of your account"
              >
                <View style={styles.settingsRow}>
                  <View style={styles.iconTileDanger}>
                    <LogoutIcon width={17} height={17} color={Colors.errorText} />
                  </View>
                  <AppText weight='500' style={styles.rowTitleDanger}>Logout</AppText>
                </View>
              </TouchableOpacity>
            </View>

            {/* Version */}
            <AppText style={styles.versionText}>Version {version} ({build})</AppText>

          </View>
        </View>
      </GlobalScrollView>

      <SlideUpScreenModal ref={bottomSheetRef}>
        <View>
          <AppText style={[globalStyle.textAlignCenter, { marginBottom: 24 }]} size='medium' weight='700'>
            Upload Profile Photo
          </AppText>
          {COMMON.PROFILE.map((item, index) => {
            const SvgComponent = item.icon;
            return (
              <TouchableOpacity style={globalStyle.optionHolder} key={item.id}>
                <View style={globalStyle.optionContent}>
                  <SvgComponent style={globalStyle.optionIcon} width={16} height={16} />
                  <AppText style={index === 2 ? { color: Colors.error06 } : null} weight='600'>
                    {item.title}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </SlideUpScreenModal>
    </View>
  );
}
