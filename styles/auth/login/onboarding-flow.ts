import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { StyleSheet } from "react-native";

export const createOnboardingFlowStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  imgContainer: {
    marginTop: 'auto'
  },
  image: {
    width: '100%',
  },
  itemContainer: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    marginTop: 16,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
    color: Colors.text
  },
  desc: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  indicatorContainer: {
    marginBottom: 24
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  }
});
export const onboardingFlowStyles = createOnboardingFlowStyles(LightColors);
