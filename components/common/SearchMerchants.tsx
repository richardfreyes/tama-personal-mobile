import { AppText } from '@/components/common/AppText';
import EmptyStateCard from '@/components/common/EmptyStateCard';
import SearchInput from '@/components/common/SearchInput';
import { COMMON } from '@/constants/common';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { searchMerchantsStyles as styles } from '@/styles/components/common/SearchMerchants';
import { SearchMerchantsProps } from '@/types/common';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { BillerListSkeleton } from './Loading';
import { SectionHeaderComponent } from './SectionHeaderComponent';

export default function SearchMerchants({
  data,
  searchProperty,
  onSelect,
  sectionTitle,
  isError = false,
  isLoading = false,
  activeCategoryId,
  onCategoryChange,
  apiEnv,
}: SearchMerchantsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;

    return data.filter((item) => {
      const value = item[searchProperty];
      return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery, searchProperty]);

  const isEmpty = !isLoading && (!filteredData || filteredData.length === 0);

  return (
    <View style={globalStyle.outerContainer}>
      {sectionTitle ? <SectionHeaderComponent title={sectionTitle} /> : null}
      <View style={{ borderRadius: 8, overflow: 'hidden' }}>
        
        <SearchInput
          containerStyle={styles.searchInputSpacing}
          onChangeText={setSearchQuery}
          placeholder="Search biller"
          value={searchQuery}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          {COMMON.BILLER_CATEGORIES.map((category) => {
            const categories = apiEnv === 'enrollments' && category.id === 'real_estate';
            if (categories) return;

            const isActive = activeCategoryId === category.categoryId;
            const IconComponent = category.icon;
            
            return (
              <TouchableOpacity 
                key={category.id} 
                style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
                onPress={() => onCategoryChange && onCategoryChange(category.categoryId)}
              >
                <IconComponent 
                  style={{ marginRight: 8 }}
                  {...category.iconProps}
                  fill={isActive ? Colors.red10 : Colors.neutral10}
                />
                <AppText size='small' style={{ color: isActive ? Colors.red10 : Colors.neutral10 }}>
                  {category.name}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      
        {isLoading ? (
          <BillerListSkeleton rows={6} label="Loading billers" />
        ) : isError ? (
          <EmptyStateCard
            variant="error"
            message="Unable to load billers at the moment. Please try again later."
          />
        ) : isEmpty ? (
          <EmptyStateCard
            variant='empty'
            message="No billers found matching your search."
          />
        ) : (
          filteredData.map((item, index) => {
            const logoUrl = item.logoUrl || item.merchant_logo_url || item.boxedLogo || item.standardLogo;

            return (
              <View style={styles.billerCardList} key={item.id || index}>
                <TouchableOpacity onPress={() => onSelect(item)}>
                  <View style={styles.billerCard}>
                    {logoUrl ? (
                      <Image
                        source={{ uri: logoUrl }}
                        style={styles.billerLogo}
                        resizeMode='contain'
                      />
                    ) : null }
                    <AppText size='small' style={{ flex: 1 }}>{item.merchant_name ? item.merchant_name : item.name}</AppText>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
