import { COMMON } from '@/constants/common';
import { useAuth } from '@/hooks/useAuth';
import { headerComponentStyles as styles } from '@/styles/components/layout/HeaderComponent';
import { HeaderProps } from '@/types';
import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../common/AppText';

const HeaderComponent: React.FC<HeaderProps> = () => {
  const { firstName, lastName } = useAuth();
  const insets = useSafeAreaInsets();
  const [unread, setUnread] = React.useState(3);
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  const handleNotificationPress = () => {
    router.push(COMMON.ROUTES.notifications);
  }
  
  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity onPress={() => router.push(COMMON.ROUTES.settings)}>
        <View style={styles.profileInfo}>
          <View style={styles.profileInitials}>
            <AppText size='small'>{initials}</AppText>
          </View>
          {/* TODO: For phase 2
          <Image source={{ uri: COMMON.PROFILE_IMAGE_URI }} style={styles.profileImage}/> */}
          <AppText>{firstName} {lastName}</AppText>
        </View>
      </TouchableOpacity>
      {/* TODO: For Phase 2
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.headerButton} onPress={handleNotificationPress}>
          <Notification width={24} height={24} />
          <View style={styles.unreadBadge}>
            <AppText style={styles.unreadCountLabel} size='tiny' weight='600'>{unread}</AppText>
          </View>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default HeaderComponent;