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
    color: Colors.aqua10,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  invoiceTitle: {
    marginBottom: 12
  },
  invoiceLabel: {
    marginBottom: 4,
  },
});