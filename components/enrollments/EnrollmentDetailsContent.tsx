import { AppText } from '@/components/common/AppText';
import { NativeProgressBar } from '@/components/common/Loading';
import DetailRows from '@/components/enrollments/DetailRows';
import EnrollmentStatusBadge from '@/components/enrollments/EnrollmentStatusBadge';
import { CONTACT_CHANNELS } from '@/constants/contact';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { enrollmentDetailsStyles as styles } from '@/styles/app/bills/enrollments/details';
import { Colors } from '@/styles/common/colors';
import type { EnrollmentDetailsContentProps } from '@/types/common';
import { getCardIcon } from '@/utils/card';
import { buildEnrollmentDetailsViewModel } from '@/utils/enrollmentPresentation';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Linking, Pressable, useWindowDimensions, View } from 'react-native';

export default function EnrollmentDetailsContent({ enrollment }: EnrollmentDetailsContentProps) {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [isCopyFocused, setIsCopyFocused] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const details = useMemo(() => buildEnrollmentDetailsViewModel(enrollment), [enrollment]);
  const { uri: PaymentMethodIcon } = getCardIcon(details.paymentMethod?.cardType);
  const SUPPORT_EMAIL = CONTACT_CHANNELS.find(({ action }) => action === 'email');
  const compactFields = <T,>(items: (T | null)[]): T[] => items.filter((item): item is T => item !== null);
  const summaryMetrics = compactFields([
    details.paymentFrequency ? { key: 'frequency', label: 'Payment frequency', value: details.paymentFrequency } : null,
    details.paymentDuration ? { key: 'duration', label: 'Number of payments', value: details.paymentDuration } : null,
    details.startDate ? { key: 'start', label: 'Start date', value: details.startDate } : null,
    { key: 'last-payment', label: 'Last payment', value: details.lastPayment },
  ]);

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      duration: 220,
      easing: Easing.out(Easing.quad),
      toValue: 1,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const handleCopyReference = async () => {
    if (!details.referenceId) return;

    await Clipboard.setStringAsync(details.referenceId);
    dispatch(showSnackbar({
      message: 'Enrollment reference copied.',
      variant: 'success',
    }));
  };

  const progressLabel = details.completedPayments !== null && details.totalPayments !== null
    ? `${details.completedPayments} of ${details.totalPayments} payments completed`
    : null;

  return (
    <Animated.View style={[styles.contentLayout, { opacity }]}>
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIdentity}>
            <AppText accessibilityRole="header" weight="700" style={styles.merchantName}>
              {details.merchantName}
            </AppText>
            <AppText size="small" weight="500" style={styles.paymentType}>
              {details.paymentType}
            </AppText>
          </View>
          <EnrollmentStatusBadge status={enrollment.status} />
        </View>
        <AppText size="small" style={styles.description}>
          Review your payment schedule, enrolled card, and account information.
        </AppText>

        {details.referenceId ? (
          <View style={styles.referencePanel}>
            <View style={styles.referenceTextGroup}>
              <AppText size="extraSmall" weight="600" style={styles.referenceLabel}>
                ENROLLMENT REFERENCE
              </AppText>
              <AppText
                ellipsizeMode="middle"
                numberOfLines={1}
                selectable
                weight="600"
                style={styles.referenceValue}
              >
                {details.referenceId}
              </AppText>
            </View>
            <Pressable
              accessibilityHint="Copies the enrollment reference to the clipboard"
              accessibilityLabel={`Copy enrollment reference ${details.referenceId}`}
              accessibilityRole="button"
              hitSlop={4}
              onBlur={() => setIsCopyFocused(false)}
              onFocus={() => setIsCopyFocused(true)}
              onPress={handleCopyReference}
              style={({ pressed }) => [
                styles.copyButton,
                isCopyFocused && styles.copyButtonFocused,
                pressed && styles.copyButtonPressed,
              ]}
              testID="copy-enrollment-reference"
            >
              <Feather color={Colors.maroon10} name="copy" size={18} />
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.paymentSummaryCard}>
        <AppText size="small" weight="600" style={styles.amountLabel}>MONTHLY PAYMENT</AppText>
        <AppText
          accessibilityLabel={`Monthly payment ${details.monthlyAmount}`}
          adjustsFontSizeToFit
          numberOfLines={1}
          weight="700"
          style={styles.monthlyAmount}
        >
          {details.monthlyAmount}
        </AppText>
        {details.estimatedTotal ? (
          <View style={styles.estimatedTotalPill}>
            <AppText size="extraSmall" style={styles.estimatedTotalLabel}>Estimated total</AppText>
            <AppText size="small" weight="700" style={styles.estimatedTotalValue}>
              {details.estimatedTotal}
            </AppText>
          </View>
        ) : null}

        <View style={styles.summaryMetrics}>
          {summaryMetrics.map((metric) => (
            <View
              key={metric.key}
              style={[styles.summaryMetric, isWide && styles.summaryMetricWide]}
            >
              <AppText size="extraSmall" style={styles.summaryMetricLabel}>{metric.label}</AppText>
              <AppText size="small" weight="600" style={styles.summaryMetricValue}>{metric.value}</AppText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.progressHeader}>
          <View style={styles.sectionTitleGroup}>
            <AppText accessibilityRole="header" weight="700" style={styles.sectionTitle}>
              Payment progress
            </AppText>
            {progressLabel ? (
              <AppText size="small" style={styles.sectionDescription}>{progressLabel}</AppText>
            ) : null}
          </View>
          {details.progress !== null ? (
            <AppText weight="700" style={styles.progressPercentage}>
              {Math.round(details.progress * 100)}%
            </AppText>
          ) : null}
        </View>

        {details.progress !== null && progressLabel ? (
          <NativeProgressBar label={progressLabel} progress={details.progress} style={styles.progressBar} />
        ) : (
          <AppText size="small" style={styles.unavailableText}>
            Payment progress is not available for this enrollment.
          </AppText>
        )}

        <View style={styles.progressDetails}>
          <View style={styles.progressDetail}>
            <AppText size="extraSmall" style={styles.progressDetailLabel}>LAST PAYMENT RECORD</AppText>
            <AppText size="small" weight="600" style={styles.progressDetailValue}>
              {details.lastPaymentRecord}
            </AppText>
          </View>
          {details.nextPaymentDate ? (
            <View style={styles.progressDetail}>
              <AppText size="extraSmall" style={styles.progressDetailLabel}>NEXT PAYMENT</AppText>
              <AppText size="small" weight="600" style={styles.progressDetailValue}>
                {details.nextPaymentDate}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.detailsGrid, isWide && styles.detailsGridWide]}>
        <View style={[styles.sectionCard, styles.gridCard, isWide && styles.gridCardWide]}>
          <View style={styles.cardTitleRow}>
            <View style={styles.paymentIconFrame}>
              <PaymentMethodIcon height={26} width={38} />
            </View>
            <View style={styles.cardTitleText}>
              <AppText accessibilityRole="header" weight="700" style={styles.sectionTitle}>
                Payment method
              </AppText>
              <AppText size="extraSmall" style={styles.sectionDescription}>
                Card enrolled for automatic payments
              </AppText>
            </View>
          </View>
          {details.paymentMethod ? (
            <DetailRows fields={compactFields([
              details.paymentMethod.cardType ? { key: 'card-type', label: 'Card type', value: details.paymentMethod.cardType } : null,
              details.paymentMethod.maskedCard ? { key: 'card', label: 'Card number', value: details.paymentMethod.maskedCard } : null,
              details.paymentMethod.cardholder ? { key: 'cardholder', label: 'Cardholder', value: details.paymentMethod.cardholder } : null,
              details.paymentMethod.expiry ? { key: 'expiry', label: 'Expiry', value: details.paymentMethod.expiry } : null,
              details.paymentMethod.paymentMethodType ? { key: 'payment-method-type', label: 'Payment method', value: details.paymentMethod.paymentMethodType } : null,
            ])} />
          ) : (
            <AppText size="small" style={styles.unavailableText}>
              No payment method is available for this enrollment.
            </AppText>
          )}
        </View>

        <View style={[styles.sectionCard, styles.gridCard, isWide && styles.gridCardWide]}>
          <AppText accessibilityRole="header" weight="700" style={styles.sectionTitle}>
            Property and enrollment information
          </AppText>
          {details.enrollmentFields.length ? (
            <DetailRows fields={details.enrollmentFields} />
          ) : (
            <AppText size="small" style={styles.unavailableText}>
              No additional enrollment information is available.
            </AppText>
          )}
        </View>

        <View style={[styles.sectionCard, styles.secondaryCard, styles.gridCard, isWide && styles.gridCardWide]}>
          <AppText accessibilityRole="header" weight="700" style={styles.sectionTitle}>
            Customer information
          </AppText>
          <AppText size="extraSmall" style={styles.sectionDescription}>
            Contact details associated with this enrollment
          </AppText>
          {details.customerFields.length ? (
            <DetailRows fields={details.customerFields} />
          ) : (
            <AppText size="small" style={styles.unavailableText}>
              Customer information is not available.
            </AppText>
          )}
        </View>

        <View style={[styles.sectionCard, styles.gridCard, isWide && styles.gridCardWide]}>
          <AppText accessibilityRole="header" weight="700" style={styles.sectionTitle}>
            Important Notes
          </AppText>
          <AppText size="extraSmall" style={styles.sectionDescription}>
            Keep these reminders in mind for uninterrupted automatic payments
          </AppText>
          <View style={styles.importantNotesList}>
            {[
              'Automatic payments will be charged to your enrolled card based on the payment schedule shown above.',
              'Keep your card active and ensure sufficient available credit or funds before each scheduled payment.',
              'The cardholder must be authorized to use this card for the enrolled account.',
              `Contact ${details.merchantName === 'Enrollment' ? 'the merchant' : details.merchantName} or Tama Support before your next payment if your card or enrollment details need to change.`,
            ].map((note) => (
              <View key={note} style={styles.importantNoteRow}>
                <View style={styles.importantNoteBullet} />
                <AppText size="small" style={styles.importantNoteText}>{note}</AppText>
              </View>
            ))}
          </View>
        </View>
      </View>

      {details.clientNotes ? (
        <View style={styles.sectionCard}>
          <AppText accessibilityRole="header" weight="700" style={styles.sectionTitle}>Notes</AppText>
          <AppText selectable size="small" style={styles.notesText}>{details.clientNotes}</AppText>
        </View>
      ) : null}

      <View style={styles.supportCard}>
        <View style={styles.supportIcon}>
          <Feather color={Colors.maroon10} name="help-circle" size={20} />
        </View>
        <View style={styles.supportTextGroup}>
          <AppText weight="700" style={styles.supportTitle}>Need help?</AppText>
          <AppText size="small" style={styles.supportText}>
            Contact {details.merchantName === 'Enrollment' ? 'the merchant' : details.merchantName} or Tama Support and share your enrollment reference.
          </AppText>
          {SUPPORT_EMAIL ? (
            <Pressable
              accessibilityLabel={`Email Tama Support at ${SUPPORT_EMAIL.label}`}
              accessibilityRole="link"
              onPress={() => { void Linking.openURL(SUPPORT_EMAIL.url); }}
              style={({ pressed }) => [styles.supportEmailLink, pressed && styles.supportEmailLinkPressed]}
            >
              <Feather color={Colors.maroon10} name="mail" size={16} />
              <AppText size="small" weight="600" style={styles.supportEmailText}>
                {SUPPORT_EMAIL.label}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
