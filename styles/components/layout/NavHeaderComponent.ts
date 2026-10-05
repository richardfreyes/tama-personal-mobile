import { NAV_HEADER_DEFAULT_HORIZONTAL_PADDING, NAV_HEADER_OUTLINED_BOTTOM_PADDING, NAV_HEADER_OUTLINED_BUTTON_SIZE, NAV_HEADER_OUTLINED_HORIZONTAL_PADDING, NAV_HEADER_VERTICAL_PADDING } from '@/constants';
import { COMMON } from '@/constants/common';
import { StyleSheet, ViewStyle } from "react-native";
import { Colors } from "../../common/colors";

const navButtonBase: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
  width: COMMON.BACK_BUTTON_SIZE,
  height: COMMON.BACK_BUTTON_SIZE,
  borderRadius: COMMON.BACK_BUTTON_SIZE / 2,
};

const navHeaderStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    paddingVertical: 12,
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
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
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
    backgroundColor: Colors.neutral01,
    shadowColor: Colors.neutral10,
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
    backgroundColor: Colors.neutral01,
    flexDirection: 'row',
    gap: 8,
    paddingBottom: NAV_HEADER_OUTLINED_BOTTOM_PADDING,
    paddingHorizontal: NAV_HEADER_OUTLINED_HORIZONTAL_PADDING,
  },
  outlinedButton: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 14,
    borderWidth: 1,
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
    color: Colors.maroon11,
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export const navHeaderComponentStyles = {
  ...navHeaderStyles,
  getHeaderHeight: (safeAreaTop: number) => safeAreaTop + COMMON.BACK_BUTTON_SIZE + (NAV_HEADER_VERTICAL_PADDING * 2),
  getOutlinedHeaderHeight: (safeAreaTop: number) => safeAreaTop + NAV_HEADER_OUTLINED_BUTTON_SIZE + NAV_HEADER_OUTLINED_BOTTOM_PADDING,
};
