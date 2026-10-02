import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import { AppText } from '@/components/common/AppText';
import { GlobalScrollView } from '@/components/common/GlobalScrollView';
import NavHeaderComponent from '@/components/layout/NavHeaderComponent';
import { LEGAL_ROWS, STATS, VERSION_ROWS } from '@/constants/about';
import { aboutStyles as styles } from '@/styles/app/settings/about';
import { Colors } from '@/styles/common/colors';
import { globalStyle } from '@/styles/common/globals';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function AboutScreen() {
  const { width } = useWindowDimensions();
  const isStatsHorizontal = width >= 390;

  return (
    <GlobalScrollView contentContainerStyle={[globalStyle.screenContainer, styles.screenContainer]}>
      <NavHeaderComponent title="About" />

      <View style={styles.introSection}>
        <AppText weight="700" style={styles.eyebrow}>Learn More About Us</AppText>
        <AppText weight="700" style={styles.missionTitle}>Our mission is to expand your reach globally.</AppText>
        <AppText style={styles.bodyText}>
          Tama helps enterprises expand their reach globally by providing a convenient, secure, and efficient way of collecting payments from their customers, anywhere in the world.
        </AppText>
      </View>

      <View style={styles.statsSection}>
        <AppText weight="700" style={styles.sectionTitle}>Enable your business to go global</AppText>
        <View style={isStatsHorizontal ? styles.statsGridHorizontal : styles.statsGridVertical}>
          {STATS.map((stat, index) => {
            const isLast = index === STATS.length - 1;
            return (
              <View
                key={stat.value}
                style={[
                  styles.statCard,
                  isStatsHorizontal ? styles.statCardHorizontal : styles.statCardVertical,
                  isStatsHorizontal && !isLast ? styles.statCardSpacing : null,
                ]}
              >
                <View style={[styles.iconCircle, !isStatsHorizontal ? styles.iconCircleVertical : null]}>
                  <Feather name={stat.icon} size={22} color={Colors.aqua10} />
                </View>
                <View style={isStatsHorizontal ? styles.statContentHorizontal : styles.statContentVertical}>
                  <AppText weight="700" style={[styles.statValue, !isStatsHorizontal ? styles.statTextVertical : null]}>
                    {stat.value}
                  </AppText>
                  <AppText style={[styles.statLabel, !isStatsHorizontal ? styles.statTextVertical : null]}>
                    {stat.label}
                  </AppText>
                  <AppText style={[styles.statDescription, !isStatsHorizontal ? styles.statTextVertical : null]}>
                    {stat.description}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.statsSection}>
        <AppText weight="700" style={styles.sectionTitle}>Mobile Application Information</AppText>
        <View style={styles.versionCard}>
          {VERSION_ROWS.map((row, index) => (
            <View
              key={row.label}
              style={[styles.versionRow, index === VERSION_ROWS.length - 1 ? styles.versionRowLast : null]}
            >
              <AppText weight="500" style={styles.versionLabel}>{row.label}</AppText>
              <AppText weight="600" style={styles.versionValue}>{row.value}</AppText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsSection}>
        <AppText weight="700" style={styles.sectionTitle}>Community Standards and legal policies</AppText>
        <View style={styles.legalList}>
          {LEGAL_ROWS.map(row => (
            <TouchableOpacity key={row.title} style={styles.legalRow} onPress={row.onPress} activeOpacity={0.7}>
              <Feather name={row.icon} size={16} color={Colors.aegeanBlue10} style={styles.legalIcon} />
              <AppText weight="600" style={styles.legalTitle}>{row.title}</AppText>
              <ChevronRightIcon width={16} height={16} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </GlobalScrollView>
  );
}
