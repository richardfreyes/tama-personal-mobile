import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';
import { FontSizes } from "@/styles/common/typography";
import { StyleSheet } from "react-native";

export const createSearchMerchantsStyles = (Colors: ThemeColors) => StyleSheet.create({
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
    color: Colors.white,
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
    paddingHorizontal: 16, 
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
  inputDefault: {
  },
  searchInputSpacing: {
    marginBottom: 12,
  },
  filterScrollView: {
    flexDirection: 'row',
    marginBottom: 4,
    marginTop: 8,
    paddingHorizontal: 16,
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
    borderBottomColor: Colors.dashboardCardBorder,
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
    borderColor: Colors.dashboardCardBorder,
  },
  billerNameRow: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral09,
  },
  directory: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  directoryContent: {
    flexGrow: 1,
  },
  hidden: {
    display: 'none',
  },
  searchWrapper: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginLeft: 16,
    marginRight: 28,
    paddingBottom: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  directorySearch: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 1,
  },
  directoryList: {
    backgroundColor: Colors.backgroundSecondary,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: 16,
    marginRight: 28,
    paddingBottom: 132,
    paddingHorizontal: 12,
    paddingTop: 0,
  },
  listCard: {
    backgroundColor: Colors.neutral01,
    borderColor: Colors.dashboardCardBorder,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
  matchCount: {
    color: Colors.maroon09,
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 4,
  },
  letterHeading: {
    color: Colors.primaryText,
    fontSize: 15,
    lineHeight: 20,
    paddingBottom: 4,
    paddingTop: 14,
  },
  rail: {
    position: 'absolute',
    right: 6,
    zIndex: 3,
  },
});

export const searchMerchantsStyles = createSearchMerchantsStyles(LightColors);
