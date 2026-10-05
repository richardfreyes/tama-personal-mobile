import { StyleSheet } from 'react-native';
import { Colors } from '../../common/colors';

export const alphabetIndexStyles = StyleSheet.create({
  rail: {
    alignItems: 'center',
  },
  letter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    color: Colors.red09,
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: Colors.red09,
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.neutral01,
    fontSize: 12,
    lineHeight: 16,
  },
});
