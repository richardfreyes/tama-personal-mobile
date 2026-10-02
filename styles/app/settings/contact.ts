import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const contactStyles = StyleSheet.create({
  screenContainer: {
    justifyContent: 'flex-start',
  },
  introCard: {
    backgroundColor: Colors.maroon01,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  introEyebrow: {
    color: Colors.red10,
    fontSize: FontSizes.extraSmall,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  introTitle: {
    color: Colors.maroon10,
    fontSize: FontSizes.extraExtraLarge,
    lineHeight: 30,
    marginBottom: 10,
  },
  introBody: {
    color: Colors.neutral08,
    fontSize: FontSizes.base,
    lineHeight: 21,
  },
  sectionTitle: {
    color: Colors.maroon10,
    fontSize: FontSizes.large,
    lineHeight: 24,
    marginBottom: 12,
  },
  contactList: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  contactRow: {
    alignItems: 'center',
    borderBottomColor: Colors.neutral04,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  contactRowLast: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: Colors.red01,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    color: Colors.maroon10,
    fontSize: FontSizes.small,
    lineHeight: 17,
    marginBottom: 2,
  },
  contactLabel: {
    color: Colors.neutral08,
    fontSize: FontSizes.small,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.neutral04,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  infoRow: {
    marginBottom: 14,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoLabel: {
    color: Colors.maroon10,
    fontSize: FontSizes.small,
    lineHeight: 17,
    marginBottom: 4,
  },
  infoValue: {
    color: Colors.neutral08,
    fontSize: FontSizes.small,
    lineHeight: 19,
  },
});
