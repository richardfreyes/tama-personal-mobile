import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const notificationStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 'auto',
    backgroundColor: Colors.neutral01,
    zIndex: -1,
  },
  headerContainer: {
    justifyContent: 'center',
    backgroundColor: Colors.neutral01,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  contentContainer: {
    marginBottom: 'auto',
  },
  sectionHeader: {
    color: Colors.aqua10,
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomColor: Colors.neutral05,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    marginBottom: 2,
  },
  dateText: {
    marginTop: 5,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error10,
    marginLeft: 'auto',
    marginTop: 5,
  },
});