import MockLogoicon from '@/assets/images/mock-logo.svg';
import { AppText } from '@/components/common/AppText';
import { notificationStyles as styles } from '@/styles/app/notifications';
import { Colors } from '@/styles/common/colors';
import { NotificationItemProps } from '@/types';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  body,
  date,
  isRead,
  onPress,
}) => {
  return (
    <TouchableOpacity style={[styles.notificationCard, !isRead ? { backgroundColor: Colors.aegeanBlue01 } : null]} onPress={() => onPress(id)}>
      <View style={styles.iconContainer}>
        <MockLogoicon width={28} height={28} color={Colors.neutral01} />
      </View>
      <View style={styles.textContainer}>
        <AppText style={styles.titleText}>{title}</AppText>
        <AppText>{body}</AppText>
        <AppText style={styles.dateText}>{date}</AppText>
      </View>
      {!isRead && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

export default NotificationItem;