import { paymentMethodCardComponentStyles as styles } from '@/styles/components/payments/PaymentMethodCardComponent';
import { LogoReference, PaymentMethodCardProps } from '@/types';
import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { AppText } from '../common/AppText';

const SmallLogoItem: React.FC<{ item: LogoReference; spacing: number; isLast: boolean }> = ({ item, spacing, isLast }) => {
  const SvgComponent = item.uri;
  return (
    <View
      testID={`payment-logo-${item.id}`}
      style={[styles.smallIconContainer, !isLast && { marginRight: spacing }]}
    >
      <SvgComponent 
        key={item.id}
        width={26} 
        height={26} 
        // resizeMode="contain"
      />
    </View>
  );
};

const PaymentMethodCardComponent: React.FC<PaymentMethodCardProps> = ({ option, onPress, style }) => {
  const isLogoList = option.logos.length > 0;
  const mainLogoRef = option.mainLogoUri;
  const SingleLogoComponent = (mainLogoRef && 'uri' in mainLogoRef) ? ((mainLogoRef as any as LogoReference).uri) : null;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.cardContainer, style]}>
      {isLogoList && (
        <FlatList
          data={option.logos}
          renderItem={({ item, index }) => (
            <SmallLogoItem
              item={item}
              spacing={option.logoSpacing ?? 8}
              isLast={index === option.logos.length - 1}
            />
          )}
          keyExtractor={(item, index) => `${item.id}-${index}`} 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.iconList}
        />
      )}

      {SingleLogoComponent && (
        <View style={styles.largeLogoContainer}>
          <SingleLogoComponent height={26} width={70} />
        </View>
      )}

      <AppText style={styles.titleText} weight='medium'>{option.title}</AppText>
    </TouchableOpacity>
  );
};

export default PaymentMethodCardComponent;
