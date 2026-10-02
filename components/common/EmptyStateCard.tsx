import { emptyStateCardStyles as styles } from '@/styles/components/common/EmptyStateCard';
import { EmptyStateCardProps } from '@/types';
import React from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  variant = 'empty',
  message,
  containerStyle,
  messageStyle,
}) => {
  return (
    <View style={[styles.cardContainer, containerStyle]}>
      <AppText style={[styles.message, messageStyle]}>{message}</AppText>
    </View>
  );
};

export default EmptyStateCard;