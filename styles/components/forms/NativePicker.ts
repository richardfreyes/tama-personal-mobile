import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const nativePickerStyles = StyleSheet.create({
  container: {},
  inputWrapper: { 
    position: 'relative' 
  },

  input: { 
    backgroundColor: 'white', 
    fontSize: FontSizes.base 
  },

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
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },

  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },

  modalTitle: { 
    fontSize: 17, 
    color: Colors.neutral09 
  },

  cancelButton: { 
    color: Colors.neutral07, 
    fontSize: 17 
  },

  doneButton: { 
    color: Colors.red10, 
    fontSize: 17, 
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
});
