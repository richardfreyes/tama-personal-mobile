import BrandLogo from '@/assets/logo-brand.svg';
import { AppText } from '@/components/common/AppText';
import { SpacerComponent } from '@/components/common/SpacerComponent';
import { globalStyle } from '@/styles/common/globals';
import { pageStateStyles as style } from '@/styles/components/common/PageState';
import { PageStateProps } from '@/types/common';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PageState: React.FC<PageStateProps> = ({title, description, children, containerStyle = style.container }) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView contentContainerStyle={[globalStyle.screenContainer, containerStyle, { paddingTop: insets.top + 12 }]}>
      <View>
        <View style={style.brandLogoHolder}>
          <BrandLogo style={style.brandLogo} width={217} height={55} />
        </View>
        <AppText weight="700" color='maroon10' style={[globalStyle.headerTitle, { marginBottom: 24 }]}>{title}</AppText>
        <AppText>{description}</AppText>
      </View>
      <View>
        {children}
        <SpacerComponent height={24} />
      </View>
    </ScrollView>
  );
};