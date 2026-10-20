import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from 'react-native';

export const createIntroStyle = (Colors: ThemeColors) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyleFix: {
    height: '100%',
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  tagline: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.white,
    borderWidth: 1,
  },
  loginButtonText: {
    color: Colors.white,
  },
});

export const introStyle = createIntroStyle(LightColors);
