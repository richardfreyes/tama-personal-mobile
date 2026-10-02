import { Colors } from '@/styles/common/colors';
import { loadingStyles as styles } from '@/styles/components/common/Loading';
import { DetailsSkeletonProps, FormSkeletonProps, HorizontalCardSkeletonProps, NativeLoadingIndicatorProps, NativeProgressBarProps, PaymentInfoSkeletonProps, SkeletonBlockProps, SkeletonListProps } from '@/types/loading';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, Platform, View } from 'react-native';
import { AppText } from './AppText';

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReducedMotion(enabled);
        }
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReducedMotion);

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  return reducedMotion;
};

const useLoadingAnnouncement = (label?: string) => {
  useEffect(() => {
    if (!label) {
      return;
    }

    AccessibilityInfo.announceForAccessibility(label);
  }, [label]);
};

export const NativeLoadingIndicator = ({
  label = 'Loading',
  size = 'small',
  color = Colors.red10,
  style,
  testID = 'native-loading-indicator',
}: NativeLoadingIndicatorProps) => {
  useLoadingAnnouncement(label);

  return (
    <ActivityIndicator
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      color={color}
      size={size}
      style={style}
      testID={testID}
    />
  );
};

export const InlineLoadingIndicator = ({
  label = 'Loading',
  style,
}: Omit<NativeLoadingIndicatorProps, 'size' | 'testID'>) => (
  <View
    accessibilityLabel={label}
    accessibilityLiveRegion="polite"
    accessibilityRole="progressbar"
    accessibilityState={{ busy: true }}
    style={[styles.inlineContainer, style]}
  >
    <NativeLoadingIndicator label={label} size="small" testID="inline-loading-indicator" />
    <AppText size="extraSmall" color="neutral07" style={styles.inlineText}>
      {label}
    </AppText>
  </View>
);

export const SkeletonBlock = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  testID = 'skeleton-block',
}: SkeletonBlockProps) => {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: Platform.OS === 'ios' ? 850 : 700,
          easing: Easing.inOut(Easing.quad),
          isInteraction: false,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: Platform.OS === 'ios' ? 850 : 700,
          easing: Easing.inOut(Easing.quad),
          isInteraction: false,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.skeletonBlock,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export const SkeletonList = ({
  rows = 5,
  label = 'Loading list',
  showAvatar = true,
  showTrailing = true,
  rowStyle,
}: SkeletonListProps) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.skeletonContainer}
      testID="skeleton-list"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={[styles.skeletonRow, rowStyle]}>
          {showAvatar ? (
            <SkeletonBlock width={36} height={36} borderRadius={18} />
          ) : null}
          <View style={styles.skeletonTextGroup}>
            <SkeletonBlock width="72%" height={14} />
            <SkeletonBlock width="48%" height={12} />
          </View>
          {showTrailing ? (
            <View style={styles.skeletonTrailing}>
              <SkeletonBlock width={58} height={18} borderRadius={9} />
              <SkeletonBlock width={72} height={12} />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
};

export const HorizontalCardSkeleton = ({
  items = 3,
  label = 'Loading cards',
  itemWidth = 120,
  itemHeight = 132,
}: HorizontalCardSkeletonProps) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.horizontalCards}
      testID="horizontal-card-skeleton"
    >
      {Array.from({ length: items }).map((_, index) => (
        <View key={index} style={[styles.cardSkeleton, { width: itemWidth, minHeight: itemHeight }]}>
          <SkeletonBlock height={50} borderRadius={4} />
          <SkeletonBlock width="84%" height={14} />
          <SkeletonBlock width="64%" height={10} />
          <SkeletonBlock width="72%" height={16} />
        </View>
      ))}
    </View>
  );
};

export const BillerListSkeleton = ({ rows = 6, label = 'Loading billers' }: Pick<SkeletonListProps, 'rows' | 'label'>) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      testID="biller-list-skeleton"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.billerRow}>
          <SkeletonBlock width={60} height={24} borderRadius={4} />
          <SkeletonBlock width={index % 2 === 0 ? '58%' : '72%'} height={14} />
        </View>
      ))}
    </View>
  );
};

export const PaymentMethodListSkeleton = ({ rows = 3, label = 'Loading payment methods' }: Pick<SkeletonListProps, 'rows' | 'label'>) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.paymentMethodList}
      testID="payment-method-list-skeleton"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.paymentMethodRow}>
          <View style={styles.paymentMethodDetails}>
            <SkeletonBlock width={46} height={30} borderRadius={4} />
            <View style={styles.skeletonTextGroup}>
              <SkeletonBlock width={index % 2 === 0 ? '42%' : '54%'} height={14} />
              <SkeletonBlock width="68%" height={12} />
            </View>
          </View>
          {index === 0 ? <SkeletonBlock width={64} height={22} borderRadius={11} /> : null}
        </View>
      ))}
    </View>
  );
};

export const TransactionHistorySkeleton = ({ rows = 5, label = 'Loading transactions' }: Pick<SkeletonListProps, 'rows' | 'label'>) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      testID="transaction-history-skeleton"
    >
      <SkeletonBlock width={72} height={12} style={styles.transactionDateSkeleton} />
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.transactionRow}>
          <View style={styles.transactionLeft}>
            <SkeletonBlock width={24} height={24} borderRadius={12} />
            <View style={styles.skeletonTextGroup}>
              <SkeletonBlock width={index % 2 === 0 ? '70%' : '86%'} height={14} />
              <SkeletonBlock width="58%" height={11} />
            </View>
          </View>
          <View style={styles.transactionRight}>
            <SkeletonBlock width={112} height={24} borderRadius={12} />
            <SkeletonBlock width={72} height={14} />
            <SkeletonBlock width={86} height={10} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const ProfileSkeleton = ({ label = 'Loading profile' }: { label?: string }) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.profileContainer}
      testID="profile-skeleton"
    >
      {[0, 1].map((sectionIndex) => (
        <View key={sectionIndex} style={styles.profileSection}>
          <View style={styles.profileHeaderRow}>
            <SkeletonBlock width={sectionIndex === 0 ? '48%' : '42%'} height={16} />
            <SkeletonBlock width={58} height={32} borderRadius={16} />
          </View>
          <View style={styles.profileInfoBox}>
            {Array.from({ length: sectionIndex === 0 ? 3 : 5 }).map((_, rowIndex) => (
              <View key={rowIndex} style={styles.detailRow}>
                <SkeletonBlock width="38%" height={13} />
                <SkeletonBlock width={rowIndex % 2 === 0 ? '42%' : '34%'} height={13} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export const PaymentInfoSkeleton = ({
  label = 'Loading payment details',
  sections = 2,
  rowsPerSection = 4,
  includeNotice = false,
  includeCheckbox = false,
}: PaymentInfoSkeletonProps) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.paymentInfoContainer}
      testID="payment-info-skeleton"
    >
      {includeNotice ? (
        <View style={styles.noticeSkeleton}>
          <SkeletonBlock width="28%" height={14} />
          <SkeletonBlock width="92%" height={12} />
          <SkeletonBlock width="72%" height={12} />
        </View>
      ) : null}
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <View key={sectionIndex} style={styles.detailsSection}>
          <SkeletonBlock width={sectionIndex === 0 ? '44%' : '56%'} height={14} />
          {Array.from({ length: rowsPerSection }).map((__, rowIndex) => (
            <View key={rowIndex} style={styles.detailRow}>
              <SkeletonBlock width={rowIndex % 2 === 0 ? '42%' : '34%'} height={12} />
              <SkeletonBlock width={rowIndex % 2 === 0 ? '36%' : '46%'} height={12} />
            </View>
          ))}
        </View>
      ))}
      {includeCheckbox ? (
        <View style={styles.checkboxSkeletonRow}>
          <SkeletonBlock width={24} height={24} borderRadius={4} />
          <View style={styles.skeletonTextGroup}>
            <SkeletonBlock width="96%" height={12} />
            <SkeletonBlock width="82%" height={12} />
          </View>
        </View>
      ) : null}
      {includeCheckbox ? <SkeletonBlock height={40} borderRadius={20} /> : null}
    </View>
  );
};

export const ReceiptSkeleton = ({ label = 'Loading payment receipt' }: { label?: string }) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.receiptWrapper}
      testID="receipt-skeleton"
    >
      <View style={styles.receiptHeader}>
        <SkeletonBlock width="54%" height={18} />
        <SkeletonBlock width="42%" height={28} />
        <SkeletonBlock width="38%" height={12} />
      </View>
      <PaymentInfoSkeleton label={label} sections={2} rowsPerSection={5} />
      <View style={styles.receiptFooter}>
        <SkeletonBlock width="52%" height={11} />
        <SkeletonBlock width="70%" height={11} />
      </View>
    </View>
  );
};

export const BillPaymentSkeleton = ({ label = 'Loading biller details' }: { label?: string }) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.billPaymentContainer}
      testID="bill-payment-skeleton"
    >
      <View style={styles.amountSkeletonContainer}>
        <SkeletonBlock width="70%" height={48} borderRadius={6} />
        <SkeletonBlock width="52%" height={12} />
      </View>
      <PaymentInfoSkeleton label={label} sections={1} rowsPerSection={4} />
      <View style={styles.detailsSection}>
        <SkeletonBlock width="48%" height={16} />
        <PaymentMethodListSkeleton rows={1} label="Loading selected payment method" />
      </View>
      <SkeletonBlock height={40} borderRadius={20} />
    </View>
  );
};

export const TransactionDetailSkeleton = ({ label = 'Loading transaction details' }: { label?: string }) => (
  <PaymentInfoSkeleton label={label} sections={2} rowsPerSection={4} />
);

export const FormSkeleton = ({ fields = 5, label = 'Loading form' }: FormSkeletonProps) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.formContainer}
      testID="form-skeleton"
    >
      <SkeletonBlock width="70%" height={18} />
      <SkeletonBlock width="92%" height={12} />
      {Array.from({ length: fields }).map((_, index) => (
        <View key={index} style={styles.fieldGroup}>
          <SkeletonBlock width="36%" height={12} />
          <SkeletonBlock height={48} borderRadius={6} />
        </View>
      ))}
      <SkeletonBlock height={40} borderRadius={20} />
    </View>
  );
};

export const DetailsSkeleton = ({
  sections = 2,
  rowsPerSection = 4,
  label = 'Loading details',
}: DetailsSkeletonProps) => {
  useLoadingAnnouncement(label);

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      style={styles.detailsContainer}
      testID="details-skeleton"
    >
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <View key={sectionIndex} style={styles.detailsSection}>
          <SkeletonBlock width="48%" height={16} />
          {Array.from({ length: rowsPerSection }).map((__, rowIndex) => (
            <View key={rowIndex} style={styles.detailRow}>
              <SkeletonBlock width="36%" height={12} />
              <SkeletonBlock width="42%" height={12} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export const NativeProgressBar = ({
  progress,
  label = 'Loading progress',
  style,
}: NativeProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View
      accessibilityLabel={`${label}: ${Math.round(clampedProgress * 100)}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress * 100) }}
      style={[styles.progressTrack, style]}
    >
      <View style={[styles.progressFill, { width: `${clampedProgress * 100}%` }]} />
    </View>
  );
};
