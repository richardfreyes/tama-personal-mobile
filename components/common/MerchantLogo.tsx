import { merchantLogoStyles as styles } from '@/styles/components/common/MerchantLogo';
import { MerchantLogoProps } from '@/types/common';
import React from 'react';
import { Image, View } from 'react-native';
import { AppText } from './AppText';

export default function MerchantLogo({ initials, logoUrl }: MerchantLogoProps) {
  return (
    <View style={styles.tile}>
      {logoUrl ? (
        <Image accessible={false} resizeMode="contain" source={{ uri: logoUrl }} style={styles.image} />
      ) : (
        <AppText weight="600" style={styles.initials}>{initials}</AppText>
      )}
    </View>
  );
}
