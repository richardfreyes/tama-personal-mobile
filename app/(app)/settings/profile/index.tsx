import InfoFieldComponent from '@/components/common/InfoFieldComponent';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import { ProfileSkeleton } from '@/components/common/Loading';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { useAuth } from '@/hooks/useAuth';
import { useGetProfileDataQuery } from '@/redux/features/profile/profileApi';
import { profileStyles as styles } from '@/styles/app/settings/profile';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import React from 'react';
import { Country, State } from 'country-state-city';
import { RefreshControl, ScrollView, View } from 'react-native';

export default function ProfileScreen() {
  const { data: profileData, isLoading, isFetching, isError, refetch } = useGetProfileDataQuery();
  const { firstName, lastName, email } = useAuth();

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={[globalStyle.screenContainer, globalStyle.screenContainerTop]}>
        <View style={{ flex: 1 }}>
          <NavHeaderComponent title='Profile' />
          <ProfileSkeleton label="Loading profile" />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={globalStyle.screenContainer}
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          tintColor={Colors.red10}
          colors={[Colors.red10]}
        />
      }
    >
      <View style={{ flex: 1 }}>
        <NavHeaderComponent title='Profile' />
        <View style={[ globalStyle.outerContainer, { marginBottom: 12 }]}>
          <AppText style={styles.sectionHeader}>Personal Information</AppText>
          <View style={[styles.infoBox, { marginBottom: 10 }]}>
            <InfoFieldComponent label="First Name" value={firstName} />
            <InfoFieldComponent label="Last Name" value={lastName} />
            <InfoFieldComponent label="Email" value={email} />
          </View>
          <AppButton title="Edit" variant="secondary" route='/settings/profile/edit-info' />
        </View>
        <View style={globalStyle.outerContainer}>
          <AppText style={styles.sectionHeader}>Personal Address</AppText>
          <View style={[styles.infoBox, { marginBottom: 10 }]}>
            { isError ? (
              <EmptyStateCard
                variant="error"
                message="Unable to load profile at the moment. Please try again later."
              /> ) : (
              <View>
                <InfoFieldComponent label="Street Address" value={profileData?.customerAddress} />
                <InfoFieldComponent label="City" value={profileData?.customerAddressCity} />
                <InfoFieldComponent label="State" value={State.getStateByCodeAndCountry(profileData?.customerAddressState || '', profileData?.customerCountryIso2Code || '')?.name || profileData?.customerAddressState} />
                <InfoFieldComponent label="Postal Code" value={profileData?.customerAddressPostalCode} />
                <InfoFieldComponent label="Country" value={Country.getCountryByCode(profileData?.customerCountryIso2Code || '')?.name || profileData?.customerCountryIso2Code} />
              </View>
            )}
          </View>
          {!isError && (
            <AppButton title="Edit" variant="secondary" route='/settings/profile/edit-address' />
          )}
        </View>
      </View>
      <SpacerComponent height={100} />
    </ScrollView>
  );
}
