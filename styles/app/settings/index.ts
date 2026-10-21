import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const createSettingsStyles = (Colors: ThemeColors) => StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    flexShrink: 0,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: Colors.background,
    backgroundColor: Colors.avatarBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: FontSizes.large,
    color: Colors.primaryText,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    borderWidth: 2.5,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  userNameText: {
    fontSize: FontSizes.base,
    color: Colors.neutral09,
    lineHeight: 22,
  },
  emailText: {
    fontSize: FontSizes.extraSmall,
    color: Colors.neutral07,
    lineHeight: 18,
  },
  settingsCard: {
    backgroundColor: Colors.neutral01,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.neutral04,
    marginLeft: 56,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconTileDanger: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.errorBackground,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowTitle: {
    flex: 1,
    fontSize: FontSizes.small,
    lineHeight: 20,
    color: Colors.neutral09,
  },
  rowTitleDanger: {
    flex: 1,
    fontSize: FontSizes.small,
    lineHeight: 20,
    color: Colors.errorText,
  },
  versionText: {
    textAlign: 'center',
    fontSize: FontSizes.extraSmall,
    color: Colors.neutral07,
    marginTop: 0,
  },
});

export const settingsStyles = createSettingsStyles(LightColors);
