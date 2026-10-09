import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const slideScreenModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.neutral01,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleIndicator: {
    backgroundColor: Colors.neutral05,
    width: 50,
    height: 5,
    borderRadius: 3,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
});
