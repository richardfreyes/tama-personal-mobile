import { StyleSheet } from 'react-native';
import { Colors } from '../../common/colors';

export const otpWebViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral01,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral03,
    backgroundColor: Colors.neutral01,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 32,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.info10,
  },
  waitHint: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.info01,
    borderBottomWidth: 1,
    borderBottomColor: Colors.info02,
  },
  waitHintText: {
    fontSize: 13,
    textAlign: 'center',
    color: Colors.neutral08,
  },
  webView: {
    flex: 1,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral01,
  },
});
