import { StyleSheet } from "react-native";
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createModalComponentStyles = (Colors: ThemeColors) => StyleSheet.create({
  headerMessage: {
    marginBottom: 6,
    textAlign: 'center',
   fontSize: 17, lineHeight: 22,},
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.overlay,
   padding: 20,},
  modalView: {
    backgroundColor: Colors.neutral01,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    width: '100%',
   maxWidth: 400,},
  icon: {
    color: Colors.primaryText,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
   lineHeight: 21, color: Colors.textSecondary,},

  confirmScrim: {
    alignItems: 'center',
    backgroundColor: Colors.modalScrim,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  confirmCard: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderRadius: 16,
    boxShadow: '0px 20px 48px -16px rgba(37, 22, 21, 0.4)',
    gap: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    width: '100%',
   maxWidth: 400,},
  confirmIcon: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  confirmCopy: {
    alignItems: 'center',
    gap: 6,
  },
  confirmTitle: {
    color: Colors.text,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
  },
  confirmBody: {
    color: Colors.maroon09,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  confirmActions: {
    gap: 8,
    width: '100%',
   flexDirection: 'row-reverse',},
  confirmPrimaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 0,
   flex: 1,},
  confirmSecondaryButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 0,
   flex: 1,},
  confirmButtonText: {
    fontSize: 15,
  },
  confirmSecondaryText: {
    color: Colors.text,
    fontSize: 15,
  },
  invoiceTitle: {
    marginBottom: 12
  },
  invoiceLabel: {
    marginBottom: 4,
  },
  dangerIcon: { backgroundColor: Colors.errorBackground },
  dangerButton: { backgroundColor: Colors.errorFill },
});
export const modalComponentStyles = createModalComponentStyles(LightColors);
