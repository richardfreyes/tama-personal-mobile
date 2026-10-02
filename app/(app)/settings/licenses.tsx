import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { LICENSE_LOGOS } from '@/constants/license';
import { aboutStyles as styles } from '@/styles/app/settings/about';
import { globalStyle } from '@/styles/common/globals';
import { Image, View } from 'react-native';

export default function LicensesScreen() {
  return (
    <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, styles.screenContainer]}>
      <NavHeaderComponent title="Licenses" />
      <View style={styles.licensesCard}>
        <AppText weight="600" style={styles.licensesEyebrow}>Secure and Compliant</AppText>
        <AppText weight="700" style={styles.licensesTitle}>Your payments are safe with us</AppText>
        <AppText style={styles.licensesBody}>
          Aqwire is secure and is compliant. This means all your payments and information are protected and secured with top of the line encryption.
        </AppText>
        <AppText weight="600" style={styles.licensesSubtitle}>Our licenses, accreditations and partners:</AppText>

        <View style={styles.licensesLogoGrid}>
          {LICENSE_LOGOS.map(logo => (
            <View key={logo.accessibilityLabel} style={styles.licensesLogoTile}>
              <Image
                accessibilityLabel={logo.accessibilityLabel}
                resizeMode="contain"
                source={logo.source}
                style={[styles.licensesLogo, { width: logo.width, height: logo.height }]}
              />
            </View>
          ))}
        </View>
      </View>
    </GlobalScrollView>
  );
}
