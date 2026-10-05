import { Colors } from '@/styles/common/colors';
import { FontSizes } from '@/styles/common/typography';
import { AppTextProps } from '@/types';
import { POPPINS_FONT_NAMES } from '@/constants/fonts';
import React from 'react';
import { Linking, Pressable } from 'react-native';
import { Text } from 'react-native-paper';

export const AppText: React.FC<AppTextProps> = ({ 
  children, 
  style, 
  weight = 'regular', 
  size, 
  variant = 'bodyMedium', 
  url, 
  color,
  m,
  mTop,
  mBottom,
  mLeft,
  mRight,
  mHorizontal,
  mVertical,
  ...rest 
}) => {
  const fontFamilyString = POPPINS_FONT_NAMES[weight];
  const customFontFamilyStyle = { fontFamily: fontFamilyString };

  const handlePress = async () => {
    if (url) {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Don't know how to open URL: ${url}`);
      }
    }
  };

  const spacingStyle = {
    ...(m !== undefined && { margin: m }),
    ...(mTop !== undefined && { marginTop: mTop }),
    ...(mBottom !== undefined && { marginBottom: mBottom }),
    ...(mLeft !== undefined && { marginLeft: mLeft }),
    ...(mRight !== undefined && { marginRight: mRight }),
    ...(mHorizontal !== undefined && { marginHorizontal: mHorizontal }),
    ...(mVertical !== undefined && { marginVertical: mVertical }),
  };

  const fontSizeStyle = size ? { fontSize: FontSizes[size] } : null;
  const colorStyle = color ? { color: Colors[color] } : null;

  const textElement = (
    <Text variant={variant as any} style={[customFontFamilyStyle, fontSizeStyle, colorStyle, spacingStyle, style]} {...rest}>
      {children}
    </Text>
  );

  if (url) {
    return (
      <Pressable onPress={handlePress}>{textElement}</Pressable>
    );
  }

  return textElement;
};
