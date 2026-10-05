import { BRAND_RING_GRADIENT_COLORS, GRADIENT_DIAGONAL_END, GRADIENT_DIAGONAL_START } from '@/constants/gradients';
import { MERCHANT_LOGO_CIRCLE_RATIO, MERCHANT_LOGO_DEFAULT_SIZE, MERCHANT_LOGO_RING_INSET } from '@/constants/merchantLogo';
import { merchantLogoStyles as styles } from '@/styles/components/common/MerchantLogo';
import { MerchantLogoProps } from '@/types/common';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, View } from 'react-native';
import { AppText } from './AppText';

export default function MerchantLogo({ initials, logoUrl, variant = 'tile', size = MERCHANT_LOGO_DEFAULT_SIZE }: MerchantLogoProps) {
  if (variant === 'tile') {
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

  const isRing = variant === 'ring';
  const contentSize = isRing ? size - MERCHANT_LOGO_RING_INSET : size;
  const logoSize = Math.round(contentSize * MERCHANT_LOGO_CIRCLE_RATIO);

  const initialsStyle = [styles.initials, size >= 56 && styles.initialsLarge];

  const content = (
    <View
      style={[styles.circle, { borderRadius: contentSize / 2, height: contentSize, width: contentSize }]}
      testID="merchant-logo-circle"
    >
      {logoUrl ? (
        <Image
          accessible={false}
          resizeMode="contain"
          source={{ uri: logoUrl }}
          style={{ height: logoSize, width: logoSize }}
        />
      ) : (
        <AppText weight="600" style={initialsStyle}>{initials}</AppText>
      )}
    </View>
  );

  if (!isRing) {
    return content;
  }

  return (
    <LinearGradient
      colors={BRAND_RING_GRADIENT_COLORS}
      end={GRADIENT_DIAGONAL_END}
      start={GRADIENT_DIAGONAL_START}
      style={[styles.ring, { borderRadius: size / 2, height: size, width: size }]}
      testID="merchant-logo-ring"
    >
      <View style={[styles.ringEdge, { borderRadius: (size - 4) / 2, height: size - 4, width: size - 4 }]}>
        {content}
      </View>
    </LinearGradient>
  );
}
