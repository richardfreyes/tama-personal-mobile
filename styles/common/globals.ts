import { StyleSheet } from 'react-native';
import { Colors } from './colors';
import { FontSizes } from './typography';

// Focus colour for text inputs: a soft charcoal rather than pure black.
// Deliberately not red or amber so a focused field never reads as an error or a warning.
export const inputFocusColor = Colors.neutral08;

export const globalStyle = StyleSheet.create({
  paperTextInput: {
    borderRadius: 4,
    fontSize: 14,
  },
  inputLabelError: {
    paddingLeft: 0,
    paddingRight: 0,
    lineHeight: 12,
  },
  screenContainer: {
    flexGrow: 1, 
    justifyContent: 'center',
    backgroundColor: Colors.neutral01,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  screenContainerTop: {
    justifyContent: 'flex-start',
  },
  outerContainer: {
    backgroundColor: Colors.maroon01,
    padding: 12,
    borderRadius: 8
  },
  headerTitle: {
    fontSize: 24,
  },
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
    color: 'red',
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
    right: 17,
    top: 0,
    width: 24,
  },
  searchIconDisabled: {
    opacity: 0.45,
  },
  inputBase: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 30,
    borderWidth: 1,
    color: Colors.neutral09,
    fontFamily: 'PoppinsRegular',
    fontSize: FontSizes.small,
    fontWeight: '400',
    height: 44,
    includeFontPadding: false,
    lineHeight: 15,
    outlineColor: 'transparent',
    paddingBottom: 0,
    paddingLeft: 24,
    paddingRight: 54,
    paddingTop: 0,
    textAlignVertical: 'center',
    width: '100%',
  },
  inputFocused: {
    borderColor: inputFocusColor,
  },
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
});
