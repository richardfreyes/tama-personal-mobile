import { useThemedStyles, useThemeColors } from '@/hooks/useAppTheme';
import { createMerchantListRowStyles as makeStyles } from '@/styles/components/common/MerchantListRow';
import type { MerchantListRowProps } from '@/types';
import { getSavedBillInitials } from '@/utils/savedBills';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import MerchantLogo from './MerchantLogo';

export default function MerchantListRow({
  name,
  logoUrl,
  initials,
  badge,
  onPress,
  testID,
  accessibilityLabel,
}: MerchantListRowProps) {
  const styles = useThemedStyles(makeStyles);
  const Colors = useThemeColors();

  const label = accessibilityLabel ?? (badge ? `${name}, ${badge.toLowerCase()}` : name);
  const content = (
    <>
      <MerchantLogo
        initials={initials ?? getSavedBillInitials(name)}
        logoUrl={logoUrl}
        size={40}
        variant="circle"
      />
      <AppText weight="500" style={styles.name}>{name}</AppText>
      {badge ? (
        <View style={styles.badge}>
          <AppText weight="500" style={styles.badgeText}>{badge}</AppText>
        </View>
      ) : null}
      {onPress ? (
        <Feather
          accessible={false}
          color={Colors.neutral06}
          name="chevron-right"
          size={18}
          style={styles.chevron}
        />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={styles.row}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View accessible accessibilityLabel={label} style={styles.row} testID={testID}>
      {content}
    </View>
  );
}
