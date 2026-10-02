import { StyleSheet } from "react-native";
import { Colors } from "./common/colors";

export const rootStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral01,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '60%',
    height: 60,
  },
  loader: {
    marginTop: 20,
  }
});