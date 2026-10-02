import { AppText } from '@/components/common/AppText';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { COMMON } from '@/constants/common';
import { showModal } from '@/redux/features/modal/modalSlice';
import { store } from '@/redux/store';
import { settingsStyles } from '@/styles/app/settings';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { SettingRoute } from '@/types';
import { router } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function Security() {
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
          primaryStyle: { backgroundColor: Colors.aqua10 }, 
          secondaryLabel: 'Cancel',
          direction: 'row',
        },
      }));
      return;
    }
    router.push(`./${route}`);
  };

  return (
    <ScrollView contentContainerStyle={globalStyle.screenContainer}>
      <View style={{ flex: 1 }}>
        <NavHeaderComponent title='Account & Security' />
        <View style={globalStyle.outerContainer}>
          {COMMON.ACCOUNT_SECURITY.map((item) => {
            const SvgComponent = item.icon;
            return (
              <TouchableOpacity style={settingsStyles.itemContainer} key={item.id} onPress={() => handleSettingsRoute(item.route)}>
                <View style={settingsStyles.itemContent}>
                  <SvgComponent style={ settingsStyles.itemIcon } width={16} height={16} />
                  <AppText style={settingsStyles.itemTitle} weight='600'>{item.title}</AppText>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </ScrollView>
  );
}
