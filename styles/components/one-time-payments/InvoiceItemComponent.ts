import { StyleSheet } from 'react-native';
import { Colors as LightColors } from '@/styles/common/colors';
import type { ThemeColors } from '@/types/theme';

export const createInvoiceItemStyles = (Colors: ThemeColors) => StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  billerName: {
    color: Colors.primaryText,
    marginBottom: 2,
  },
  dateText: {
    color: Colors.neutral08,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    color: Colors.success10,
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  fieldDivider: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.maroon02,
  }
});
export const invoiceItemStyles = createInvoiceItemStyles(LightColors);
