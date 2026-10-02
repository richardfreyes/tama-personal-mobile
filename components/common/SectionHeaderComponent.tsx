import { sectionHeaderComponentStyles as styles } from '@/styles/components/common/SectionHeaderComponent';
import { SectionHeaderProps } from '@/types/common';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { AppText } from './AppText';

export const SectionHeaderComponent: React.FC<SectionHeaderProps> = ({
  title,
  linkText,
  onViewAllPress = () => {},
  titleStyle,
  linkStyle,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <AppText style={[styles.title, titleStyle]}>{title}</AppText>
      {linkText ? (
        <TouchableOpacity onPress={onViewAllPress}>
          <AppText style={[styles.link, linkStyle]}>{linkText}</AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
