import { StyleSheet } from 'react-native';
import { Colors } from '../../../common/colors';

export const paymentInfoStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '100%',
  },
  section: {
    gap: 10,
  },
  title: {
    color: Colors.maroon11,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  toggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    height: 48,
    justifyContent: 'center',
  },
  togglePressed: {
    opacity: 0.7,
  },
  toggleText: {
    color: Colors.red09,
    fontSize: 14,
    lineHeight: 20,
  },
});
