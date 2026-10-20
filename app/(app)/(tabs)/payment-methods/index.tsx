import { useThemedStyles } from '@/hooks/useAppTheme';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import PaymentMethodCardComponent from '@/components/payments/PaymentMethodsComponent';
import { createGlobalStyle as makeGlobalStyle } from '@/styles/common/globals';
import { ScrollView, View } from 'react-native';

export default function PaymentMethods() {
  const globalStyle = useThemedStyles(makeGlobalStyle);

  return (
    <ScrollView contentContainerStyle={{...globalStyle.screenContainer }}>
      <NavHeaderComponent title='Payment Methods' />
      <View style={{ flex: 1 }}>
        <PaymentMethodCardComponent sectionHeader={{ title: 'Manage your saved payment methods' }} />
      </View>
    </ScrollView>
  );
}