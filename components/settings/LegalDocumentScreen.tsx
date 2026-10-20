import { useThemedStyles } from '@/hooks/useAppTheme';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import LegalDocumentContent from '@/components/settings/LegalDocumentContent';
import { createLegalStyles as makeStyles } from '@/styles/app/settings/legal';
import { createGlobalStyle as makeGlobalStyle } from '@/styles/common/globals';
import { LegalDocumentScreenProps } from '@/types/legalDocuments';
import { View } from 'react-native';

export default function LegalDocumentScreen({ content, title }: LegalDocumentScreenProps) {
  const styles = useThemedStyles(makeStyles);
  const globalStyle = useThemedStyles(makeGlobalStyle);

  return (
    <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, styles.screenContainer]}>
      <NavHeaderComponent title={title} />

      <View style={styles.contentCard}>
        <LegalDocumentContent content={content} />
      </View>
    </GlobalScrollView>
  );
}
