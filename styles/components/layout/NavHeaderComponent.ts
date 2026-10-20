import { NAV_HEADER_DEFAULT_HORIZONTAL_PADDING, NAV_HEADER_OUTLINED_BOTTOM_PADDING, NAV_HEADER_OUTLINED_BUTTON_SIZE, NAV_HEADER_OUTLINED_HORIZONTAL_PADDING, NAV_HEADER_VERTICAL_PADDING } from '@/constants';
import { COMMON } from '@/constants/common';
import { StyleSheet, ViewStyle } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

const navButtonBase: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
  width: COMMON.BACK_BUTTON_SIZE,
  height: COMMON.BACK_BUTTON_SIZE,
  borderRadius: 8,
};

export const createNavHeaderComponentStyles = (Colors: ThemeColors) => {
const navHeaderStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 6,
  },
  backButtonContainer: {
    width: COMMON.BACK_BUTTON_SIZE,
    zIndex: 10, 
  },
  backButton: {
    ...navButtonBase,
    backgroundColor: Colors.maroon01,
  },
  rightNav: {
    ...navButtonBase
  },
  titleWrapper: {
    flex: 1, 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    textAlign: 'center',
    textTransform: 'none',
   lineHeight: 22,},
  rightSpacer: {
    width: COMMON.RIGHT_SPACER_WIDTH,
  },
  stickyHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 0,
    backgroundColor: Colors.background,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  stickyHeaderContent: {
    position: 'absolute',
    top: 0,
  },
  stickyHeaderFallback: {
    left: NAV_HEADER_DEFAULT_HORIZONTAL_PADDING,
    right: NAV_HEADER_DEFAULT_HORIZONTAL_PADDING,
  },

  outlinedContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flexDirection: 'row',
    gap: 8,
    paddingBottom: NAV_HEADER_OUTLINED_BOTTOM_PADDING,
    paddingHorizontal: NAV_HEADER_OUTLINED_HORIZONTAL_PADDING,
  },
  outlinedButton: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 0,
    height: NAV_HEADER_OUTLINED_BUTTON_SIZE,
    justifyContent: 'center',
    width: NAV_HEADER_OUTLINED_BUTTON_SIZE,
  },
  outlinedButtonPressed: {
    backgroundColor: Colors.dashboardPanel,
  },
  outlinedButtonSlot: {
    width: NAV_HEADER_OUTLINED_BUTTON_SIZE,
  },
  outlinedTitle: {
    color: Colors.text,
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
  },
});

return {
  ...navHeaderStyles,
  getHeaderHeight: (safeAreaTop: number) => safeAreaTop + COMMON.BACK_BUTTON_SIZE + (NAV_HEADER_VERTICAL_PADDING * 2),
  getOutlinedHeaderHeight: (safeAreaTop: number) => safeAreaTop + NAV_HEADER_OUTLINED_BUTTON_SIZE + NAV_HEADER_OUTLINED_BOTTOM_PADDING,
};

};

export const navHeaderComponentStyles = createNavHeaderComponentStyles(LightColors);
