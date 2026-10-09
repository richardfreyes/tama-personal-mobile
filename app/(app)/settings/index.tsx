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
import { settingsStyles as styles } from '@/styles/app/settings';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { SettingRoute, SlideUpScreenModalRef } from '@/types';
import { modalActions } from '@/utils/modalActions';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';

export default function AccountSettingsScreen() {  
  const dispatch = useAppDispatch();
  const bottomSheetRef = useRef<SlideUpScreenModalRef>(null);
  const { firstName, lastName, email } = useAuth();
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleItemPress = (route: SettingRoute) => {
    if (!route) return;
    if (route === 'logout') {
      handleLogout();
    } else if (route === '#about') {
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
  }

  const handleLogout = () => {
    const modalId = 'setDefaultPaymentMethod';
    modalActions[modalId] = logoutHandler;

    dispatch(showModal({
      id: modalId,
      iconType: 'logout',
      headerMessage: 'Logout',
      bodyMessage: 'Are you sure you want to log out?',
      buttonConfig: {
        primaryLabel: 'Yes',
        secondaryLabel: 'No',
        direction: 'column'
      }
    }));
  }

  return (
    <View style={{ flex: 1 }}>
      <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title='Account Settings' />
          <View style={globalStyle.outerContainer}>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(1)}>
              <View style={styles.infoBlock}>
                {
}
                <View style={styles.profileInitials}>
                  <AppText size='extraLarge'>{initials}</AppText>
                </View>
                <View>
                  <AppText weight='600' style={styles.userNameText}>{firstName} {lastName}</AppText>
                  <AppText style={styles.infoText}>{email}</AppText>
                </View>
              </View>
            </TouchableOpacity>
            <View>
              {COMMON.SETTINGS.map((item) => {
                const SvgComponent = item.icon;
                return (
                  <TouchableOpacity style={styles.itemContainer} key={item.id} onPress={() => handleItemPress(item.route)}>
                    <View style={styles.itemContent}>
                      <SvgComponent style={ styles.itemIcon } width={16} height={16} />
                      <AppText style={styles.itemTitle} weight='600'>{item.title}</AppText>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </View>
      </GlobalScrollView>
      <SlideUpScreenModal ref={bottomSheetRef}>
        <View>
          <AppText style={[globalStyle.textAlignCenter, { marginBottom: 24 }]} size='medium' weight='700'>Upload Profile Photo</AppText>
          {COMMON.PROFILE.map((item, index) => {
            const SvgComponent = item.icon;
            return (
              <TouchableOpacity style={globalStyle.optionHolder} key={item.id}>
                <View style={globalStyle.optionContent}>
                  <SvgComponent style={globalStyle.optionIcon} width={16} height={16} />
                  <AppText style={index === 2 ? { color: Colors.error06 } : null} weight='600'>{item.title}</AppText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </SlideUpScreenModal>
    </View>
  );
}
