import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const onboardingFlowStyles = StyleSheet.create({
  container: {
    padding: 24,
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
    textAlign: 'center',
    fontSize: FontSizes.extraExtraLarge,
    color: Colors.aegeanBlue10
  },
  desc: {
    textAlign: 'center',
    fontSize: FontSizes.base,
  },
  indicatorContainer: {
    marginBottom: 24
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  }
});