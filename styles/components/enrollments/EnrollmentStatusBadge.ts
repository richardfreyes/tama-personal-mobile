import { Colors } from '@/styles/common/colors';
import { StyleSheet } from 'react-native';

export const enrollmentStatusBadgeStyles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    flexDirection: 'row',
    minHeight: 24,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  summaryCardBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    marginLeft: 6,
    minHeight: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: Colors.success01,
  },
  pendingBadge: {
    backgroundColor: Colors.amber02,
  },
  failedBadge: {
    backgroundColor: Colors.error01,
  },
  pausedBadge: {
    backgroundColor: Colors.info01,
  },
  ongoingBadge: {
    backgroundColor: Colors.info01,
  },
  neutralBadge: {
    backgroundColor: Colors.neutral04,
  },
  dot: {
    borderRadius: 3,
    height: 6,
    marginRight: 6,
    width: 6,
  },
  activeDot: {
    backgroundColor: Colors.success10,
  },
  pendingDot: {
    backgroundColor: Colors.amber10,
  },
  failedDot: {
    backgroundColor: Colors.error10,
  },
  pausedDot: {
    backgroundColor: Colors.info10,
  },
  ongoingDot: {
    backgroundColor: Colors.info10,
  },
  ongoingText: {
    color: Colors.info10,
  },
  neutralDot: {
    backgroundColor: Colors.neutral07,
  },
  text: {
    color: Colors.neutral09,
  },
});
