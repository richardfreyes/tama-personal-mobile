import { BRAND_SOFT_GRADIENT_COLORS, GRADIENT_DIAGONAL_END, GRADIENT_DIAGONAL_START } from '@/constants/gradients';
import { Colors } from '@/styles/common/colors';
import { emptyStateCardStyles as styles } from '@/styles/components/common/EmptyStateCard';
import { EmptyStateCardProps } from '@/types';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  appearance = 'card',
  actionLabel,
  onAction,
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

  if (icon && appearance === 'dashed') {
    return (
      <View style={[styles.dashedCard, containerStyle]}>
        <LinearGradient
          colors={BRAND_SOFT_GRADIENT_COLORS}
          end={GRADIENT_DIAGONAL_END}
          start={GRADIENT_DIAGONAL_START}
          style={styles.dashedIcon}
        >
          <Feather color={Colors.red09} name={icon} size={22} />
        </LinearGradient>
        <View style={styles.dashedCopy}>
          {title ? <AppText weight="600" style={styles.dashedTitle}>{title}</AppText> : null}
          <AppText style={[styles.dashedDescription, messageStyle]}>{message}</AppText>
        </View>
      </View>
    );
  }

  if (icon && appearance === 'centered') {
    return (
      <View style={[styles.centeredCard, containerStyle]}>
        <LinearGradient
          colors={BRAND_SOFT_GRADIENT_COLORS}
          end={GRADIENT_DIAGONAL_END}
          start={GRADIENT_DIAGONAL_START}
          style={styles.centeredIcon}
        >
          <Feather color={Colors.red09} name={icon} size={24} />
        </LinearGradient>
        <View style={styles.centeredCopy}>
          {title ? <AppText weight="600" style={styles.centeredTitle}>{title}</AppText> : null}
          <AppText style={[styles.centeredDescription, messageStyle]}>{message}</AppText>
        </View>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => [styles.centeredAction, pressed && styles.centeredActionPressed]}
          >
            <AppText weight="600" style={styles.centeredActionText}>{actionLabel}</AppText>
          </Pressable>
        ) : null}
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
