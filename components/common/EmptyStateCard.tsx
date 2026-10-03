import { Colors } from '@/styles/common/colors';
import { emptyStateCardStyles as styles } from '@/styles/components/common/EmptyStateCard';
import { EmptyStateCardProps } from '@/types';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  variant = 'empty',
  icon,
  title,
  message,
  onRetry,
  retryLabel,
  containerStyle,
  messageStyle,
}) => {
  if (variant === 'error' && onRetry) {
    return (
      <View accessibilityRole="alert" style={[styles.errorCard, containerStyle]}>
        <View style={styles.errorIcon}>
          <Feather color={Colors.dashboardErrorText} name={icon ?? 'alert-circle'} size={20} />
        </View>
        <AppText style={[styles.errorMessage, messageStyle]}>{message}</AppText>
        <Pressable
          accessibilityLabel={retryLabel}
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
        >
          <Feather color={Colors.red09} name="refresh-cw" size={16} />
          <AppText weight="600" style={styles.retryText}>Try Again</AppText>
        </Pressable>
      </View>
    );
  }

  if (icon) {
    return (
      <View style={[styles.emptyCard, containerStyle]}>
        <View style={styles.emptyIcon}>
          <Feather color={Colors.maroon09} name={icon} size={20} />
        </View>
        <View style={styles.emptyCopy}>
          {title ? <AppText weight="600" style={styles.emptyTitle}>{title}</AppText> : null}
          <AppText style={[styles.emptyDescription, messageStyle]}>{message}</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.cardContainer, containerStyle]}>
      <AppText style={[styles.message, messageStyle]}>{message}</AppText>
    </View>
  );
};

export default EmptyStateCard;
