import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const dashboardStatusBarScrimStyles = StyleSheet.create({
  scrim: {
    backgroundColor: Colors.neutral01,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },

  fade: {
    height: 6,
    left: 0,
    position: 'absolute',
    right: 0,
    top: '100%',
  },
});
