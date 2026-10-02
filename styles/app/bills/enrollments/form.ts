import { Colors } from "@/styles/common/colors";
import { StyleSheet } from "react-native";

export const formStyles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral03,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  wrapper: {
    backgroundColor: Colors.neutral01,
    paddingHorizontal: 12,
    paddingVertical: 24,
    width: '100%',
    flex: 1,
  },
});
