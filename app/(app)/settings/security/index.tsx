import { useThemedStyles, useThemeColors } from '@/hooks/useAppTheme';
import { AppText } from '@/components/common/AppText';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { COMMON } from '@/constants/common';
import { showModal } from '@/redux/features/modal/modalSlice';
import { store } from '@/redux/store';
import { createSettingsStyles as makeSettingsStyles } from '@/styles/app/settings';
import { createGlobalStyle as makeGlobalStyle } from '@/styles/common/globals';
import { SettingRoute } from '@/types';
import { router } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function Security() {
  const settingsStyles = useThemedStyles(makeSettingsStyles);
  const globalStyle = useThemedStyles(makeGlobalStyle);
  const Colors = useThemeColors();

  const handleSettingsRoute = (route: SettingRoute) => {
    if (!route) return;

    if(route === '#deactivationDeletion') {
      store.dispatch(showModal({
        id: 'deactivationDeletion',
        iconType: 'warning',
        headerMessage: 'ACCOUNT DEACTIVATION OR DELETION',
        bodyType: 'accountDeletion',
        buttonConfig: {
          primaryLabel: 'Send Email',
          primaryStyle: { backgroundColor: Colors.red10 }, 
          secondaryLabel: 'Cancel',
          direction: 'row',
        },
      }));
      return;
    }
    if (route.startsWith('/')) {
      router.push(route as never);
      return;
    }
    router.push(`./${route}`);
  };

  return (
    <ScrollView contentContainerStyle={globalStyle.screenContainer}>
      <View style={{ flex: 1 }}>
        <NavHeaderComponent title='Account & Security' />
        <View style={[globalStyle.outerContainer, { gap: 8 }]}>
          <View style={settingsStyles.settingsCard}>
            {COMMON.ACCOUNT_SECURITY.map((item, index) => {
              const SvgComponent = item.icon;
              return (
                <View key={item.id}>
                  {index > 0 && <View style={settingsStyles.rowDivider} />}
                  <TouchableOpacity onPress={() => handleSettingsRoute(item.route)} activeOpacity={0.7}>
                    <View style={settingsStyles.settingsRow}>
                      <View style={settingsStyles.iconTile}>
                        <SvgComponent width={17} height={17} color={Colors.neutral09} />
                      </View>
                      <AppText weight='500' style={settingsStyles.rowTitle}>{item.title}</AppText>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
