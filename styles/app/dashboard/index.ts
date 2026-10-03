import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const dashboardStyles = StyleSheet.create({
  content: {
    backgroundColor: Colors.neutral01,
    flexGrow: 1,
    gap: 16,
    paddingBottom: 132,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  screen: {
    backgroundColor: Colors.neutral01,
    flex: 1,
  },
});
