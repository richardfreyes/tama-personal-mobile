import AutoPayStatusCard from '@/components/bills/AutoPayStatusCard';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { SkeletonBlock, SkeletonGroup } from '@/components/common/Loading';
import { SectionHeaderComponent } from '@/components/common/SectionHeaderComponent';
import { globalStyle } from '@/styles/common/globals';
import { autoPayStatusCardStyles } from '@/styles/components/bills/AutoPayStatusCard';
import { autoDebitCardStyles as styles } from '@/styles/components/enrollments/AutoDebitCard';
import { AutoDebitCardProps } from '@/types/common';
import React from 'react';
import { View } from 'react-native';

export default function AutoDebitCard({
  onPress,
  showViewAll = false,
  activeCount = 0,
  isLoading = false,
  isError = false,
  onRetry,
}: AutoDebitCardProps) {
  return (
    <View style={globalStyle.sectionPanel} testID="auto-debit-card">
      <SectionHeaderComponent
        title="Auto Debit"
        linkText={showViewAll ? 'View All' : undefined}
        onViewAllPress={onPress}
      />
      {isLoading ? (
        <SkeletonGroup label="Loading Auto Debit" style={autoPayStatusCardStyles.card} testID="auto-debit-loading">
          <SkeletonBlock borderRadius={14} height={44} style={globalStyle.skeletonOnCard} width={44} />
          <View style={styles.skeletonColumn}>
            <SkeletonBlock height={16} style={globalStyle.skeletonOnCard} width="68%" />
            <SkeletonBlock height={12} style={globalStyle.skeletonOnCard} width="94%" />
            <SkeletonBlock height={12} style={globalStyle.skeletonOnCard} width="76%" />
          </View>
        </SkeletonGroup>
      ) : isError ? (
        <EmptyStateCard
          message="Unable to load Auto Debit."
          onRetry={onRetry}
          retryLabel="Try loading Auto Debit again"
          variant="error"
        />
      ) : (
        <AutoPayStatusCard activeCount={activeCount} onManage={onPress} />
      )}
    </View>
  );
}
