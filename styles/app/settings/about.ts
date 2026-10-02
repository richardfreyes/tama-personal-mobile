import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const aboutStyles = StyleSheet.create({
  screenContainer: {
    justifyContent: 'flex-start',
  },
  introSection: {
    marginTop: 12,
    marginBottom: 28,
  },
  eyebrow: {
    color: Colors.red10,
    fontSize: FontSizes.extraSmall,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  missionTitle: {
    color: Colors.maroon10,
    fontSize: FontSizes.extraExtraLarge,
    lineHeight: 30,
    marginBottom: 16,
  },
  bodyText: {
    color: Colors.maroon10,
    fontSize: FontSizes.base,
    lineHeight: 21,
  },
  sectionTitle: {
    color: Colors.maroon10,
    fontSize: FontSizes.large,
    lineHeight: 24,
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGridHorizontal: {
    flexDirection: 'row',
  },
  statsGridVertical: {
    flexDirection: 'column',
  },
  statCard: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  statCardHorizontal: {
    flex: 1,
    alignItems: 'center',
    minHeight: 166,
  },
  statCardVertical: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statCardSpacing: {
    marginRight: 8,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderColor: Colors.red04,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    marginBottom: 10,
    width: 48,
  },
  iconCircleVertical: {
    marginBottom: 0,
    marginRight: 12,
  },
  statContentHorizontal: {
    alignItems: 'center',
  },
  statContentVertical: {
    flex: 1,
  },
  statValue: {
    color: Colors.maroon10,
    fontSize: FontSizes.medium,
    lineHeight: 20,
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    color: Colors.maroon10,
    fontSize: FontSizes.extraSmall,
    lineHeight: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  statDescription: {
    color: Colors.neutral08,
    fontSize: FontSizes.extraSmall,
    lineHeight: 14,
    textAlign: 'center',
  },
  statTextVertical: {
    textAlign: 'left',
  },
  versionCard: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  versionRow: {
    borderBottomColor: Colors.neutral04,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  versionRowLast: {
    borderBottomWidth: 0,
  },
  versionLabel: {
    color: Colors.maroon10,
    fontSize: FontSizes.extraSmall,
  },
  versionValue: {
    color: Colors.maroon10,
    flexShrink: 1,
    fontSize: FontSizes.extraSmall,
    textAlign: 'right',
  },
  legalList: {
    marginBottom: 24,
  },
  legalRow: {
    alignItems: 'center',
    borderBottomColor: Colors.neutral04,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  legalIcon: {
    marginRight: 12,
  },
  legalTitle: {
    color: Colors.maroon10,
    flex: 1,
    fontSize: FontSizes.small,
  },
  licensesCard: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  licensesEyebrow: {
    color: Colors.maroon09,
    fontSize: FontSizes.medium,
    lineHeight: 22,
    marginBottom: 14,
    textAlign: 'center',
  },
  licensesTitle: {
    color: Colors.maroon10,
    fontSize: FontSizes.extraExtraLarge,
    lineHeight: 31,
    marginBottom: 16,
    textAlign: 'center',
  },
  licensesBody: {
    color: Colors.neutral08,
    fontSize: FontSizes.base,
    lineHeight: 22,
    marginBottom: 28,
    textAlign: 'center',
  },
  licensesSubtitle: {
    color: Colors.neutral08,
    fontSize: FontSizes.base,
    lineHeight: 21,
    marginBottom: 20,
    textAlign: 'center',
  },
  licensesLogoGrid: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  licensesLogoTile: {
    alignItems: 'center',
    height: 82,
    justifyContent: 'center',
    marginBottom: 14,
    width: '50%',
  },
  licensesLogo: {
    maxHeight: 64,
    maxWidth: '100%',
  },
});
