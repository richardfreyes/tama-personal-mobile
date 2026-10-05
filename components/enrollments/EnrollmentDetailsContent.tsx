import { AppText } from '@/components/common/AppText';
import { NativeProgressBar } from '@/components/common/Loading';
import DetailRows from '@/components/enrollments/DetailRows';
import EnrollmentStatusBadge from '@/components/enrollments/EnrollmentStatusBadge';
import { SUPPORT_EMAIL_CHANNEL } from '@/constants/contact';
import { ENROLLMENT_DETAILS_COPY, ENROLLMENT_DETAILS_WIDE_BREAKPOINT, ENROLLMENT_IMPORTANT_NOTES, ENROLLMENT_SUMMARY_GRADIENT_COLORS, ENROLLMENT_SUMMARY_GRADIENT_END, ENROLLMENT_SUMMARY_GRADIENT_LOCATIONS, ENROLLMENT_SUMMARY_GRADIENT_START, } from '@/constants/enrollment';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { enrollmentDetailsStyles as styles } from '@/styles/app/bills/enrollments/details';
import { Colors } from '@/styles/common/colors';
import type { EnrollmentDetailsContentProps } from '@/types/common';
import { getCardIcon } from '@/utils/card';
import { buildEnrollmentDetailsViewModel } from '@/utils/enrollmentPresentation';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Linking, Pressable, useWindowDimensions, View } from 'react-native';

export default function EnrollmentDetailsContent({ enrollment }: EnrollmentDetailsContentProps) {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isWide = width >= ENROLLMENT_DETAILS_WIDE_BREAKPOINT;
  const [isCopyFocused, setIsCopyFocused] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const details = useMemo(() => buildEnrollmentDetailsViewModel(enrollment), [enrollment]);
  const { uri: PaymentMethodIcon } = getCardIcon(details.paymentMethod?.cardType);

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

  const openSupportEmail = () => {
    if (SUPPORT_EMAIL_CHANNEL) void Linking.openURL(SUPPORT_EMAIL_CHANNEL.url);
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
        <AppText size="small" style={styles.description}>{ENROLLMENT_DETAILS_COPY.summary}</AppText>

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

      <LinearGradient
        colors={ENROLLMENT_SUMMARY_GRADIENT_COLORS}
        end={ENROLLMENT_SUMMARY_GRADIENT_END}
        locations={ENROLLMENT_SUMMARY_GRADIENT_LOCATIONS}
        start={ENROLLMENT_SUMMARY_GRADIENT_START}
        style={styles.paymentSummaryCard}
      >
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
          {details.summaryMetrics.map((metric) => (
            <View
              key={metric.key}
              style={[styles.summaryMetric, isWide && styles.summaryMetricWide]}
            >
              <AppText size="extraSmall" style={styles.summaryMetricLabel}>{metric.label}</AppText>
              <AppText size="small" weight="600" style={styles.summaryMetricValue}>{metric.value}</AppText>
            </View>
          ))}
        </View>
      </LinearGradient>

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
            {ENROLLMENT_DETAILS_COPY.progressUnavailable}
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
                {ENROLLMENT_DETAILS_COPY.paymentMethodDescription}
              </AppText>
            </View>
          </View>
          {details.paymentMethod ? (
            <DetailRows fields={details.paymentMethodFields} />
          ) : (
            <AppText size="small" style={styles.unavailableText}>
              {ENROLLMENT_DETAILS_COPY.paymentMethodUnavailable}
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
              {ENROLLMENT_DETAILS_COPY.enrollmentFieldsUnavailable}
            </AppText>
          )}
        </View>

        <View style={[styles.sectionCard, styles.secondaryCard, styles.gridCard, isWide && styles.gridCardWide]}>
          <AppText accessibilityRole="header" weight="700" style={styles.sectionTitle}>
            Customer information
          </AppText>
          <AppText size="extraSmall" style={styles.sectionDescription}>
            {ENROLLMENT_DETAILS_COPY.customerDescription}
          </AppText>
          {details.customerFields.length ? (
            <DetailRows fields={details.customerFields} />
          ) : (
            <AppText size="small" style={styles.unavailableText}>
              {ENROLLMENT_DETAILS_COPY.customerFieldsUnavailable}
            </AppText>
          )}
        </View>

        <View style={[styles.sectionCard, styles.gridCard, isWide && styles.gridCardWide]}>
          <AppText accessibilityRole="header" weight="700" style={styles.sectionTitle}>
            Important Notes
          </AppText>
          <AppText size="extraSmall" style={styles.sectionDescription}>
            {ENROLLMENT_DETAILS_COPY.importantNotesDescription}
          </AppText>
          <View style={styles.importantNotesList}>
            {[
              ...ENROLLMENT_IMPORTANT_NOTES,
              `Contact ${details.merchantContactName} or Tama Support before your next payment if your card or enrollment details need to change.`,
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
            Contact {details.merchantContactName} or Tama Support and share your enrollment reference.
          </AppText>
          {SUPPORT_EMAIL_CHANNEL ? (
            <Pressable
              accessibilityLabel={`Email Tama Support at ${SUPPORT_EMAIL_CHANNEL.label}`}
              accessibilityRole="link"
              onPress={openSupportEmail}
              style={({ pressed }) => [styles.supportEmailLink, pressed && styles.supportEmailLinkPressed]}
            >
              <Feather color={Colors.maroon10} name="mail" size={16} />
              <AppText size="small" weight="600" style={styles.supportEmailText}>
                {SUPPORT_EMAIL_CHANNEL.label}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
