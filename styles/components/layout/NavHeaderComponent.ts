import { COMMON } from "@/constants/common";
import { StyleSheet, ViewStyle } from "react-native";
import { Colors } from "../../common/colors";

const HEADER_VERTICAL_PADDING = 12;
const DEFAULT_HORIZONTAL_PADDING = 24;

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
    left: DEFAULT_HORIZONTAL_PADDING,
    right: DEFAULT_HORIZONTAL_PADDING,
  },
});

export const navHeaderComponentStyles = {
  ...navHeaderStyles,
  getHeaderHeight: (safeAreaTop: number) => safeAreaTop + COMMON.BACK_BUTTON_SIZE + (HEADER_VERTICAL_PADDING * 2),
};
