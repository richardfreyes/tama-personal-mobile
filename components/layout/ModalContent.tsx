import { modalContentStyles as styles } from '@/styles/components/layout/ModalContent';
import { ModalContentProps } from '@/types';
import React from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../common/AppButton';
import { AppText } from '../common/AppText';

const ModalContent: React.FC<ModalContentProps> = ({
  visible,
  title,
  description,
  bulletItems,
  numberedItems,
  children,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType='slide' onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <AppText weight='700' size='large' style={styles.title}>{title}</AppText>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          {description ? (
            <AppText size='small' style={styles.description}>{description}</AppText>
          ) : null}

          {bulletItems && bulletItems.length > 0
            ? bulletItems.map((item, index) => (
                <View key={`bullet-${index}`} style={styles.listItem}>
                  <AppText size='small' style={styles.bulletMarker}>{'•'}</AppText>
                  <AppText size='small' style={styles.listText}>{item}</AppText>
                </View>
              ))
            : null}

          {numberedItems && numberedItems.length > 0
            ? numberedItems.map((item, index) => (
                <View key={`numbered-${index}`} style={styles.listItem}>
                  <AppText size='small' weight='600' style={styles.numberedMarker}>{`${index + 1}.`}</AppText>
                  <AppText size='small' style={styles.listText}>{item}</AppText>
                </View>
              ))
            : null}

          {children}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <AppButton title='Close' variant='secondary' onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default ModalContent;
