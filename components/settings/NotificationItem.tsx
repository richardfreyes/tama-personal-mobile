import { useThemedStyles, useThemeColors } from '@/hooks/useAppTheme';
import AqwireLogo from '@/assets/icons/aqwire-logo.svg';
import { AppText } from '@/components/common/AppText';
import { createNotificationStyles as makeStyles } from '@/styles/app/notifications';
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
  const styles = useThemedStyles(makeStyles);
  const Colors = useThemeColors();

  return (
    <TouchableOpacity style={[styles.notificationCard, !isRead ? { backgroundColor: Colors.maroon01 } : null]} onPress={() => onPress(id)}>
      <View style={styles.iconContainer}>
        <AqwireLogo width={28} height={28} />
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