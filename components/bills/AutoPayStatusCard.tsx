import { BRAND_SOFT_GRADIENT_COLORS, GRADIENT_DIAGONAL_END, GRADIENT_DIAGONAL_START } from '@/constants';
import { Colors } from '@/styles/common/colors';
import { autoPayStatusCardStyles as styles } from '@/styles/components/bills/AutoPayStatusCard';
import { AutoPayStatusCardProps } from '@/types/common';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { AppText } from '../common/AppText';

export default function AutoPayStatusCard({ activeCount, onManage }: AutoPayStatusCardProps) {
  const isActive = activeCount > 0;
  const countLabel = isActive
    ? `${activeCount} active ${activeCount === 1 ? 'enrollment' : 'enrollments'}`
    : 'No active enrollments';

  return (
    <Pressable
      accessibilityLabel="View Auto Debit"
      accessibilityRole="button"
      onPress={onManage}
      style={styles.card}
    >
      <LinearGradient
        colors={BRAND_SOFT_GRADIENT_COLORS}
        end={GRADIENT_DIAGONAL_END}
        start={GRADIENT_DIAGONAL_START}
        style={styles.iconTile}
      >
        <Feather color={Colors.red09} name="repeat" size={20} />
      </LinearGradient>
      <View style={styles.textColumn}>
        <View style={styles.titleRow}>
          <AppText weight="600" style={styles.enrollmentCount}>{countLabel}</AppText>
          <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? Colors.success09 : Colors.neutral06 }]} />
            <AppText weight="500" style={[styles.statusText, { color: isActive ? Colors.dashboardSuccessText : Colors.neutral08 }]}>
              {isActive ? 'Active' : 'Not enrolled'}
            </AppText>
          </View>
        </View>
        <AppText style={styles.description}>Your eligible bills are paid automatically on their due dates.</AppText>
      </View>
      <Feather color={Colors.maroon07} name="chevron-right" size={20} style={styles.chevron} />
    </Pressable>
  );
}
