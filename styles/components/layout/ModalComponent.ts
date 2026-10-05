import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const modalComponentStyles = StyleSheet.create({
  headerMessage: {
    marginBottom: 24,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    backgroundColor: Colors.neutral01,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 24,
    alignItems: 'center',
    width: '80%',
  },
  icon: {
    color: Colors.red10,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },

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
    borderRadius: 24,
    boxShadow: '0px 20px 48px -16px rgba(37, 22, 21, 0.4)',
    gap: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    width: '100%',
  },
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
    color: Colors.maroon11,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  confirmBody: {
    color: Colors.maroon09,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  confirmActions: {
    gap: 8,
    width: '100%',
  },
  confirmPrimaryButton: {
    backgroundColor: Colors.red09,
    borderRadius: 14,
    minHeight: 48,
    paddingVertical: 0,
  },
  confirmSecondaryButton: {
    backgroundColor: Colors.neutral03,
    borderColor: Colors.transparent,
    borderRadius: 14,
    minHeight: 48,
    paddingVertical: 0,
  },
  confirmButtonText: {
    fontSize: 15,
  },
  confirmSecondaryText: {
    color: Colors.maroon11,
    fontSize: 15,
  },
  invoiceTitle: {
    marginBottom: 12
  },
  invoiceLabel: {
    marginBottom: 4,
  },
});