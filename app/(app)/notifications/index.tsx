import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import ToggleOptionComponent from '@/components/common/ToggleOption';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { SlideUpScreenModal } from '@/components/layout/SlideUpScreenModal';
import NotificationItem from '@/components/settings/NotificationItem';
import { COMMON } from '@/constants/common';
import { notificationStyles as styles } from '@/styles/app/notifications';
import { globalStyle } from '@/styles/common/globals';
import BottomSheet from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<typeof COMMON.MOCK_DATA.NOTIFICATIONS>([]);
  const [listFilter, setListFilter] = useState('Recent Activity');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const visibleNotifications = listFilter === 'Unread'
    ? notifications.filter((notification) => !notification.isRead)
    : notifications;

  const sections = visibleNotifications.reduce((acc, notification) => {
    const category = notification.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(notification);
    return acc;
  }, {} as Record<string, typeof COMMON.MOCK_DATA.NOTIFICATIONS>);

  const orderedSections = ['Today', 'Yesterday', 'Older'].filter(key => sections[key]);

  const handleNotificationPress = (id: string) => {

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

  };

  const renderSection = (category: string, list: typeof COMMON.MOCK_DATA.NOTIFICATIONS, index: number) => (
    <View key={category}>
      <AppText style={[styles.sectionHeader, index === 0 && { marginTop: 0, marginBottom: 24 }]} weight='700' size='small'>{category}</AppText>
      {list.map(item => (
        <NotificationItem
          key={item.id}
          {...item}
          onPress={handleNotificationPress}
        />
      ))}
    </View>
  );

  const handleSelectionChange = (selectedOption: string) => {
    setListFilter(selectedOption);
  };

  const handleMenuPress = (item: (typeof COMMON.NOTIFICATIONS)[number]) => {
    if (item.id === '1') {
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      bottomSheetRef.current?.close();
      return;
    }

    router.push(item.route);
  };

  const onMorePress = () => {
    bottomSheetRef.current?.snapToIndex(1);
  }

  return (
    <GlobalScrollView contentContainerStyle={globalStyle.screenContainer}>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <NavHeaderComponent title="Notifications" rightNav={{iconType: 'more', onPress: onMorePress}}/>
                <ToggleOptionComponent
                  options={['Recent Activity', 'Unread']}
                  initialSelected={'Recent Activity'}
                  onOptionChange={handleSelectionChange}
                />
              <SpacerComponent height={24} />
            </View>
            {orderedSections.length > 0 ? (
              orderedSections.map((category, index) => renderSection(category, sections[category], index))
            ) : (

              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                <AppText color='neutral08'>You have no notifications.</AppText>
              </View>
            )}
          </ScrollView>
        </View>
        <SlideUpScreenModal ref={bottomSheetRef}>
            <View>
              {COMMON.NOTIFICATIONS.map((item) => {
                const SvgComponent = item.icon;
                return (
                  <TouchableOpacity style={globalStyle.optionHolder} key={item.id} onPress={() => handleMenuPress(item)}>
                    <View style={globalStyle.optionContent}>
                      <SvgComponent style={globalStyle.optionIcon} width={16} height={16} />
                      <AppText weight='600'>{item.title}</AppText>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
        </SlideUpScreenModal>
      </View>
    </GlobalScrollView>
  );
};

export default NotificationsScreen;
