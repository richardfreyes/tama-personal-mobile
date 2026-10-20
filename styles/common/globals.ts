import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const inputFocusColor = LightColors.primary;

export const createGlobalStyle = (Colors: ThemeColors) => StyleSheet.create({
  paperTextInput: {
    borderRadius: 8,
    fontSize: 14,
   height: 48, backgroundColor: Colors.inputBackground,},
  inputLabelError: {
    paddingLeft: 0,
    paddingRight: 0,
    lineHeight: 16,
   fontSize: 12, paddingTop: 0, paddingBottom: 0, minHeight: 12, color: Colors.errorText,},
  screenContainer: {
    flexGrow: 1, 
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  screenContainerTop: {
    justifyContent: 'flex-start',
  },
  outerContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 12
  },

  sectionPanel: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.dashboardPanelBorder,
    borderRadius: 12,
    borderWidth: 0,
    overflow: 'hidden',
    padding: 12,
  },

  listCard: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },

  skeletonOnCard: {
    backgroundColor: Colors.dashboardSkeleton,
  },
  headerTitle: {
    fontSize: 22,
   lineHeight: 28,},
  defaultText: {
    fontFamily: 'PoppinsRegular',
  },
  boldText: {
    fontFamily: 'PoppinsBold',
  },
  alignCenter: {
    flex: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  errorContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.errorText,
  },
  indicator: {
    height: 40,
  },
  searchBarContainer: {
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  searchIcon: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: undefined,
    top: 0,
    width: 24,
   left: 12,},
  searchIconDisabled: {
    opacity: 0.45,
  },
  inputBase: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.neutral04,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.neutral09,
    fontFamily: 'PoppinsRegular',
    fontSize: 14,
    fontWeight: '400',
    height: 44,
    includeFontPadding: false,
    lineHeight: 20,
    outlineColor: 'transparent',
    paddingBottom: 0,
    paddingLeft: 40,
    paddingRight: 12,
    paddingTop: 0,
    textAlignVertical: 'center',
    width: '100%',
  },
  inputFocused: {
    borderColor: Colors.primary,
   borderWidth: 1,},
  inputDisabled: {
    backgroundColor: Colors.neutral03,
    borderColor: Colors.neutral05,
    color: Colors.neutral07,
  },
  textAlignCenter: {
    textAlign: 'center',
  },
  optionHolder: {
    backgroundColor: Colors.neutral01,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral03,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 8,
  },
  inputFocusGradient: { borderRadius: 8, bottom: 0, left: 0, position: 'absolute', right: 0, top: 6 },
  inputFocusFill: { backgroundColor: Colors.inputBackground, borderRadius: 6.5, bottom: 1.5, left: 1.5, position: 'absolute', right: 1.5, top: 7.5 },
  inputFocusRing: { borderRadius: 8, boxShadow: `0 0 0 3px ${Colors.focusRing}` },
  inputContent: { fontSize: 14, lineHeight: 20, fontFamily: 'PoppinsRegular' },
  inputOutline: { borderRadius: 8, borderColor: Colors.neutral06 },
  fieldLabel: { fontSize: 13, lineHeight: 18, marginBottom: 6, color: Colors.text, fontFamily: 'PoppinsMedium' },
  authHeroIcon: {
    alignItems: 'center',
    backgroundColor: Colors.primaryTint,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
    width: 48,
  },
  authTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 8,
  },
  authLead: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  authLink: {
    color: Colors.primaryText,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    lineHeight: 20,
  },
  authMuted: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
    minWidth: 0,
  },
});

export const globalStyle = createGlobalStyle(LightColors);
