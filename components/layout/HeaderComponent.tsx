import { AppText } from '@/components/common/AppText';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/styles/common/colors';
import { headerComponentStyles as styles } from '@/styles/components/layout/HeaderComponent';
import type { HeaderProps } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const greetingForHour = (hour: number) => {
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
};

const HeaderComponent: React.FC<HeaderProps> = () => {
  const { firstName, lastName } = useAuth();
  const insets = useSafeAreaInsets();
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  const name = `${firstName} ${lastName}`.trim();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
      <Pressable
        accessibilityHint="Opens your settings"
        accessibilityLabel={`Profile, ${name}`}
        accessibilityRole="button"
        onPress={() => router.push('/settings')}
        style={styles.profileButton}
      >
        <LinearGradient
          colors={[Colors.red10, Colors.brandGradientVivid, Colors.amber10]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.avatarRing}
        >
          <View style={styles.avatarInner}>
            <AppText weight="600" style={styles.initials}>{initials}</AppText>
          </View>
        </LinearGradient>
        <View style={styles.textColumn}>
          <AppText numberOfLines={1} style={styles.greeting}>{greetingForHour(new Date().getHours())}</AppText>
          <AppText numberOfLines={1} ellipsizeMode="tail" weight="600" style={styles.name}>
            {name}
          </AppText>
        </View>
      </Pressable>
    </View>
  );
};

export default HeaderComponent;
