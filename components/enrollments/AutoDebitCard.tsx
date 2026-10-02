import AutoDebitIcon from '@/assets/icons/auto-debit.svg';
import ChevronRightIcon from '@/assets/icons/chevron-right-light.svg';
import { SectionHeaderComponent } from '@/components/common/SectionHeaderComponent';
import { globalStyle } from '@/styles/common/globals';
import { autoDebitCardStyles as styles } from '@/styles/components/enrollments/AutoDebitCard';
import { AutoDebitCardProps } from '@/types/common';
import AutoPayStatusCard from '@/components/bills/AutoPayStatusCard';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function AutoDebitCard({ onPress, showViewAll = false, activeCount = 0 }: AutoDebitCardProps) {

  if (activeCount > 0) {
    return <AutoPayStatusCard activeCount={activeCount} onManage={onPress} />;
  }

  return (
    <View style={globalStyle.outerContainer}>
      <SectionHeaderComponent
        title="Auto Debit"
        linkText={showViewAll ? 'View All' : undefined}
        onViewAllPress={onPress}
      />
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress} accessibilityRole="button" accessibilityLabel="Set up Auto Debit">
        <View style={styles.iconBadge}>
          <AutoDebitIcon width={24} height={24} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>Never miss a bill</Text>
          <Text style={styles.subtitle}>Set up automatic payments for eligible bills</Text>
        </View>

        <ChevronRightIcon width={8} height={14} />
      </TouchableOpacity>
    </View>
  );
}
