import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const searchMerchantsStyles = StyleSheet.create({
  scrollViewContent: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: Colors.red10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.neutral01,
    fontSize: 16,
    fontWeight: 'bold',
  },
  billsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  billCard: {
  },
  billerLogo: {
    width: 60,
    height: 24,
    marginRight: 12,
  },
  subText: {
    fontSize: FontSizes.small,
    color: Colors.neutral08,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },

  container: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billerCardList: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral03,
  },
  billerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: Colors.neutral01,
  },
  scrollContainerContent: {
    paddingHorizontal: 20, 
    paddingTop: 10,
    backgroundColor: Colors.neutral01,
  },
  inputDefault: {
  },
  searchInputSpacing: {
    marginBottom: 12,
  },
  filterScrollView: {
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: -20, 
    paddingHorizontal: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  pillActive: {
    borderColor: Colors.red10,
  },
  pillInactive: {
  },
  billerListContainer: {
  },
  billerRowTouchable: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  billerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  billerLogoRow: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  billerNameRow: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  directory: {
    backgroundColor: Colors.neutral01,
    flex: 1,
  },
  directoryContent: {
    flexGrow: 1,
  },
  hidden: {
    display: 'none',
  },
  searchWrapper: {
    backgroundColor: Colors.neutral01,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 44,
    paddingTop: 12,
  },
  directoryList: {
    paddingBottom: 132,
    paddingLeft: 20,
    paddingRight: 44,
  },
  matchCount: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 4,
  },
  letterHeading: {
    color: Colors.red09,
    fontSize: 13,
    lineHeight: 18,
    paddingBottom: 4,
    paddingTop: 12,
  },
  rail: {
    position: 'absolute',
    right: 4,
    zIndex: 3,
  },
});
