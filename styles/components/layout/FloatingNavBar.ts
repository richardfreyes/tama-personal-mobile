import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";

export const floatingNavBarStyles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: Colors.neutral01,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dashboardCardBorder,
    padding: 6,
    shadowColor: Colors.maroon10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  iconSlot: {
    width: 60,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconSlot: {
    backgroundColor: Colors.red01,
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: Colors.red09,
  },
  inactiveTabLabel: {
    color: Colors.maroon09,
  },
});
