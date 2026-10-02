import InfoIcon from '@/assets/icons/exclamation-circle-yellow.svg';
import { Colors } from '@/styles/common/colors';
import { DisplayNoticeProps } from '@/types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

export default function DisplayNotice({
  title,
  description,
  Icon,
}: DisplayNoticeProps) {
  return (
    <View style={styles.container}>
      {Icon && (
        <View style={styles.iconContainer}>
          <InfoIcon width={24} height={24} />
        </View>
      )}

      <View style={styles.textContainer}>
        { title && ( <AppText style={styles.title} size='small' weight="700">{title}
        {' '}{ description && ( <AppText style={styles.description} size='small' >{description}</AppText> )}
        </AppText> )}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    backgroundColor: Colors.amber01,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    lineHeight: 20,
  },
  description: {
    lineHeight: 20,
    marginTop: 2,
  },
  chevronContainer: {
    marginLeft: 16,
  },
});