import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "../../common/typography";

export const createNativePickerStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {},
  inputWrapper: { 
    position: 'relative' 
  },

  input: { 
    backgroundColor: Colors.inputBackground, 
    fontSize: FontSizes.base 
  , minHeight: 48, borderRadius: 8,},

  disabledInput: { 
    backgroundColor: Colors.neutral02 
  },

  touchOverlay: { 
    ...StyleSheet.absoluteFill, 
    zIndex: 10 
  },

  androidWrapper: { 
    width: '100%', 
    position: 'relative',
    justifyContent: 'center',
  },

  androidInvisiblePicker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
    elevation: 10,
  },

  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },

  modalBackdrop: { 
    ...StyleSheet.absoluteFill, 
    backgroundColor: Colors.overlay 
  },

  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },

  modalTitle: { 
    fontSize: 17, 
    color: Colors.neutral09 
  },

  cancelButton: { 
    color: Colors.neutral07, 
    fontSize: 15 
  },

  doneButton: { 
    color: Colors.primaryText, 
    fontSize: 15, 
    fontWeight: '600' 
  },

  pickerWrapper: { 
    paddingHorizontal: 0 
  },

  iosPicker: { 
    height: 216, 
    width: '100%' 
  },

  iosPickerItem: { 
    height: 216, 
    fontSize: 20 
  },
  pickerLabel: { flex: 1, color: Colors.text, fontSize: 15, lineHeight: 20 },
  pickerList: { maxHeight: 320 },
  selectedLabel: { color: Colors.primaryText, fontFamily: 'PoppinsSemiBold' },
  selectedRow: { backgroundColor: Colors.primaryTint },
  pickerSearch: { margin: 16 },
  pickerRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: Colors.divider },
});

export const nativePickerStyles = createNativePickerStyles(LightColors);
