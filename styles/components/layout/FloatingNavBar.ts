import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const floatingNavBarStyles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: Colors.aegeanBlue10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 15,
    elevation: 8,
    boxShadow: '0 4px 5px rgba(0, 0, 0, 0.25)', 
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
});