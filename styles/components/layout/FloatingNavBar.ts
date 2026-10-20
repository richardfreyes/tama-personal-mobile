import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createFloatingNavBarStyles = (Colors: ThemeColors) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
   bottom: 0, backgroundColor: Colors.tabBar,},
  tabBar: {
    backgroundColor: Colors.tabBar,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: Colors.border,
    padding: 0,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0,
    shadowRadius: 18,
    elevation: 0,
   borderTopWidth: 1,},
  tabButton: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  iconSlot: {
    width: 24,
    height: 24,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconSlot: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: Colors.primaryText,
  },
  inactiveTabLabel: {
    color: Colors.textSecondary,
  },
  activeIndicator: { position: 'absolute', top: 0, width: 32, height: 2, backgroundColor: Colors.primary },
});

export const floatingNavBarStyles = createFloatingNavBarStyles(LightColors);
