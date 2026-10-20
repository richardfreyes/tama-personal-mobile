import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createOtpWebViewStyles = (Colors: ThemeColors) => StyleSheet.create({
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
    color: Colors.primaryText,
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
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral01,
  },
});

export const otpWebViewStyles = createOtpWebViewStyles(LightColors);
