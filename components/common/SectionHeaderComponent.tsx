import { Colors } from '@/styles/common/colors';
import { sectionHeaderComponentStyles as styles } from '@/styles/components/common/SectionHeaderComponent';
import { SectionHeaderProps } from '@/types/common';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';

export const SectionHeaderComponent: React.FC<SectionHeaderProps> = ({
  title,
  count,
  linkText,
  onViewAllPress = () => {},
  titleStyle,
  linkStyle,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.titleGroup}>
        <AppText weight="600" numberOfLines={count === undefined ? undefined : 1} style={[styles.title, titleStyle]}>{title}</AppText>
        {count === undefined ? null : (
          <View style={styles.countBadge} testID="section-header-count">
            <AppText weight="600" style={styles.countText}>{count}</AppText>
          </View>
        )}
      </View>
      {linkText ? (
        <Pressable
          accessibilityLabel={title ? `${linkText} ${title}` : linkText}
          accessibilityRole="button"
          onPress={onViewAllPress}
          style={styles.link}
        >
          <AppText weight="500" style={[styles.linkText, linkStyle]}>{linkText}</AppText>
          <Feather color={Colors.red09} name="chevron-right" size={16} />
        </Pressable>
      ) : null}
    </View>
  );
};
