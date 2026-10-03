import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const headerComponentStyles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.neutral01,
  },
  profileButton: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
    width: '100%',
  },
  avatarRing: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarInner: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderColor: Colors.neutral01,
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  initials: {
    color: Colors.red09,
    fontSize: 14,
    lineHeight: 20,
  },
  textColumn: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  greeting: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 18,
  },
  name: {
    color: Colors.maroon11,
    fontSize: 18,
    lineHeight: 26,
  },
});
