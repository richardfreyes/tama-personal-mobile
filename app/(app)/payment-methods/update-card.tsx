import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { NativeLoadingIndicator } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { showModal } from '@/redux/features/modal/modalSlice';
import { useDeleteCardPaymentMutation, useGetPaymentMethodsQuery, useUpdateCardPaymentMutation } from '@/redux/features/paymentMethods/paymentMethodApi';
import type { PaymentMethod } from '@/redux/features/paymentMethods/paymentMethodTypes';
import { showSnackbar } from '@/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from '@/redux/hooks';
import { updateCardStyles as styles } from '@/styles/app/payment-methods/update-card';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { formatLastFourDigits, getCardIcon, getProviderDisplay } from '@/utils/card';
import { modalActions } from '@/utils/modalActions';
import { Redirect, Route, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function PaymentMethodDetailsCard() {
  const params = useLocalSearchParams();
  const referenceIdParam = Array.isArray(params.referenceId) ? params.referenceId[0] : params.referenceId;
  const referenceId = referenceIdParam == null ? undefined : String(referenceIdParam);
  const backRouteParam = Array.isArray(params.route) ? params.route[0] : params.route;
  const backRoute = typeof backRouteParam === 'string' ? backRouteParam as Route : undefined;
  const dispatch = useAppDispatch();
  const [updatePaymentMethod, { isLoading: isSettingDefault }] = useUpdateCardPaymentMutation();
  const [deletePaymentMethod, { isLoading: isDeleting }] = useDeleteCardPaymentMutation();
  const [isSettingDefaultTransition, setIsSettingDefaultTransition] = useState(false);
  const [isDeletingTransition, setIsDeletingTransition] = useState(false);
  const [transitionPaymentMethod, setTransitionPaymentMethod] = useState<PaymentMethod | null>(null);
  const { data: paymentMethods, isError, isFetching, isLoading } = useGetPaymentMethodsQuery();
  const cachedPaymentMethod = paymentMethods?.find((method) => String(method.referenceId) === referenceId);
  const paymentMethod = transitionPaymentMethod ?? cachedPaymentMethod;
  const isBusy = isSettingDefault || isSettingDefaultTransition || isDeleting || isDeletingTransition;
  const isOnlyMethod = paymentMethods !== undefined && paymentMethods.length <= 1;
  const isDeleteBlocked = Boolean(paymentMethod?.isPrimary) && !isOnlyMethod;
  const paymentMethodProvider = paymentMethod?.paymentMethodProvider?.trim() || 'Card';
  const lastFourCardDigits = formatLastFourDigits(paymentMethod?.lastFourCardDigits || '');
  const providerDisplay = getProviderDisplay(paymentMethodProvider);
  const maskedNumber = '•••• •••• ••••';
  const expiryDateDisplay = paymentMethod?.paymentMethodExpiry;
  const fullAddress = [
    paymentMethod?.billingStreetAddress,
    paymentMethod?.billingCityAddress,
    paymentMethod?.billingStateAddress ? `${paymentMethod.billingStateAddress}, ${paymentMethod.billingPostalCode}` : paymentMethod?.billingPostalCode,
    paymentMethod?.billingCountryAddress,
  ].filter(Boolean).join('\n');
  const { uri: IconComponent } = getCardIcon(paymentMethodProvider);

  useFocusEffect(
    useCallback(() => {
      if (!referenceId) return;

      setIsSettingDefaultTransition(false);
      setIsDeletingTransition(false);
      setTransitionPaymentMethod(null);
    }, [referenceId]),
  );

  const isInvalidDetail = !referenceId
    || isError
    || (!isLoading && !isFetching && paymentMethods !== undefined && !cachedPaymentMethod);

  if (isInvalidDetail && !isDeletingTransition) {
    return <Redirect href="/payment-methods" />;
  }

  if (!referenceId || !paymentMethod) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <NativeLoadingIndicator label="Loading payment method" size="large" color={Colors.aqua10} />
      </View>
    );
  }

  const handleSetAsDefault = async () => {
    if (isBusy || paymentMethod.isPrimary) return;
    setTransitionPaymentMethod({ ...paymentMethod });
    setIsSettingDefaultTransition(true);
    try {
      const response = await updatePaymentMethod({
        id: referenceId,
        payload: { paymentIsPrimary: true, paymentIsEnabled: true }
      }).unwrap();
      router.replace(backRoute || '/payment-methods');
      dispatch(showSnackbar({ message: response.message || 'Payment method set as default successfully.', variant: 'success' }));
    } catch (err: any) {
      setTransitionPaymentMethod(null);
      setIsSettingDefaultTransition(false);
      dispatch(showSnackbar({ message: err.data?.message || 'Failed to set as default.', variant: 'error' }));
    }
  };

  const handleDelete = async () => {
    if (isBusy || isDeleteBlocked) return;
    setTransitionPaymentMethod({ ...paymentMethod });
    setIsDeletingTransition(true);
    try {
      const response = await deletePaymentMethod({
        id: referenceId,
      }).unwrap();
      router.replace('/payment-methods');
      setTransitionPaymentMethod(null);
      setIsDeletingTransition(false);
      dispatch(showSnackbar({ variant: 'success', message: response.message || 'Payment method removed successfully.' }));
    } catch (err: any) {
      setTransitionPaymentMethod(null);
      setIsDeletingTransition(false);
      dispatch(showSnackbar({ message: err.data?.message || 'Failed to remove payment method.', variant: 'error' }));
    }
  }

  const handleOpenDeleteModal = () => {
    if (isBusy || isDeleteBlocked) return;
    const modalId = 'deletePaymentMethod';
    modalActions[modalId] = handleDelete;

    dispatch(showModal({
      id: modalId,
      iconType: 'warning',
      headerMessage: 'Delete Payment Method?',
      bodyMessage: 'Are you sure you want to delete this payment method?',
      buttonConfig: {
        primaryLabel: 'Confirm',
        primaryStyle: { backgroundColor: Colors.error06 },
        secondaryLabel: 'No',
        direction: 'row'
      }
    }));
  }

  return (
    <ScrollView contentContainerStyle={{...globalStyle.screenContainer }}>
      <NavHeaderComponent title={`${providerDisplay} ${lastFourCardDigits}`} />
      <View style={{ flex: 1 }}>
        <View style={globalStyle.outerContainer}>
          <View style={styles.cardDetailsContainer}>
            <View style={styles.iconContainer}>
              <IconComponent width={54} height={54} />
            </View>
            <View>
              <View style={styles.badgeContainer}>
                <AppText style={{textTransform: 'capitalize'}} weight='700' size='extraLarge'>{providerDisplay}</AppText>
                {paymentMethod.isPrimary && (
                  <AppText style={styles.isPrimary} size='small' weight='600'>Primary</AppText>
                )}
              </View>
              <AppText size='extraLarge' weight='700'>{maskedNumber}</AppText>
              <AppText style={styles.lastFourCardDigits} size='extraLarge' weight='700'>{lastFourCardDigits}</AppText>
              <AppText size='small'>Expires: {expiryDateDisplay}</AppText>
            </View>
          </View>
          <View>
            <AppText style={styles.billingCardholderName} size='base' weight='600'>{paymentMethod.billingCardholderName}</AppText>
            <AppText style={styles.address}>{fullAddress}</AppText>
          </View>
          <View>
            <AppButton
              title="Set As Default"
              variant="primary"
              onPress={handleSetAsDefault}
              isLoading={isSettingDefault || isSettingDefaultTransition}
              disabled={paymentMethod.isPrimary || isBusy}
            />
            <SpacerComponent height={12} />
            <AppButton
              title="Delete"
              variant="secondary"
              onPress={handleOpenDeleteModal}
              isLoading={isDeleting || isDeletingTransition}
              disabled={isDeleteBlocked || isBusy}
            />
            {isDeleteBlocked && !isSettingDefaultTransition && (
              <AppText style={styles.deleteHint} size='small'>
                Set another payment method as default before deleting this one.
              </AppText>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
