import { StyleSheet } from "react-native";
import { Colors } from "../../common/colors";
import { FontSizes } from "../../common/typography";

export const sectionHeaderComponentStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
	title: {
		fontSize: FontSizes.small,
		color: Colors.neutral07,
	},
	link: {
		color: Colors.aqua10,
		fontSize: FontSizes.small,
		textDecorationLine: 'underline',
	},
});