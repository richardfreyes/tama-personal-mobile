import { StyleSheet } from 'react-native';
import { Colors } from '../../common/colors';
import { FontSizes } from '../../common/typography';

export const enrollmentVerificationWebViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral01,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderBottomColor: Colors.neutral03,
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: 49,
    paddingVertical: 12,
    position: 'relative',
  },
  headerTitleContainer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
  },
  headerTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    position: 'absolute',
  },
  cancelButtonText: {
    color: Colors.aqua10,
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  completionArea: {
    backgroundColor: Colors.neutral02,
    flex: 1,
  },
  completionContent: {
    alignItems: 'center',
    backgroundColor: Colors.neutral02,
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 24,
  },
  completionCard: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    maxWidth: 440,
    padding: 32,
    shadowColor: Colors.neutral10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    width: '100%',
  },
  completionTitle: {
    color: Colors.neutral09,
    lineHeight: 28,
    textAlign: 'center',
  },
  completionMessage: {
    lineHeight: 21,
    marginBottom: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  returnButton: {
    maxWidth: 240,
    width: '100%',
  },
  webView: {
    flex: 1,
  },
  webViewArea: {
    flex: 1,
    position: 'relative',
  },
  finalizingOverlay: {
    alignItems: 'center',
    backgroundColor: Colors.neutral01,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
