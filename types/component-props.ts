import type { Bill } from "@/redux/features/bills/billsTypes";
import type { PaymentMethod } from "@/redux/features/paymentMethods/paymentMethodTypes";
import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import type { PoppinsWeight } from '@/types/typography';
import type { Feather } from "@expo/vector-icons";
import type { Href } from 'expo-router';
import type React from "react";
import type { SharedValue } from "react-native-reanimated";
import type { ScrollViewProps, StyleProp, TextInputProps, TextProps, TextStyle, TouchableOpacityProps, ViewStyle } from "react-native";
import type { BillerDueSummary, BillerStatus, SavedBillSummarySource, UpcomingEnrollmentBill } from "./bill";
import type { Enrollment, EnrollmentDisplayField } from "./enrollment";
import { FormField } from "./form";
import type { NavigationRoute, SettingRoute } from './navigation';
import type { AppliedFilters, OneTimePaymentMethodId } from "./payment";
import type { UnifiedTransaction } from "./transaction";

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'danger' | 'gradient';

export type FontSizeKey = keyof typeof FontSizes;
export type ColorKey = keyof typeof Colors;

export type PhoneFieldRendererProps = DynamicFieldRendererBaseProps & {
  openCountryPicker: (fieldKey: string) => void;
};

export type TextFieldRendererProps = DynamicFieldRendererBaseProps & {
  multiline?: boolean;
};

export interface SpacerProps {
  height?: number;
  width?: number;
}

export interface CountryCodePickerProps {
  show: boolean;
  lang: string;
  style?: { modal?: ViewStyle };
  pickerButtonOnPress: (country: { dial_code: string; code: string; flag: string }) => void;
  onBackdropPress?: () => void;
}

export interface PaymentSourceOption {
  value: string;
  label: string;
  description?: string;
}

export interface PaymentSourceSelectorProps {
  options: PaymentSourceOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export interface SectionHeaderProps {
  title?: string;

  count?: number;
  linkText?: string | null;
  onViewAllPress?: () => void;
  titleStyle?: TextStyle;
  linkStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

export interface SearchInputProps extends Omit<TextInputProps, 'style'> {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;

  variant?: 'outlined' | 'filled';

  onClear?: () => void;
}

export interface ComponentsProps {
  sectionHeader?: {
    title?: string;
    linkText?: string;
  };
  sectionFooter?: {
    button?: boolean;
  };

  limit?: number;

  isRefreshable?: boolean;
  isFilterVisible?: boolean;
  onOpenFilterSheet?: () => void;
  route?: NavigationRoute;
  activeFilters?: AppliedFilters;
  onViewAllPress?: () => void;
  onAddBillerPress?: () => void;
  onPayNowPress?: () => void;
  onAddPaymentMethod?: () => void;

  selectedMethodId?: string;
  onSelectMethod?: (method: PaymentMethod) => void;
}

export interface BillerCategory {
  id: string;
  name: string;
  categoryId: number | undefined;
  icon: React.FC<any>;
  iconProps: { width: number, height: number };
}

export interface SettingItemProps {
  item: {
    id: string;
    title: string;
    icon: string;
    route: SettingRoute;
  };
  onPress: (route: SettingRoute) => void;
}

export interface HeaderProps {
  userName?: string;
}

export interface InfoFieldProps {
  label: string;
  value?: string | null;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  weight?: PoppinsWeight;
  copy?: boolean;

  variant?: 'default' | 'summary';

  emptyText?: string;
}

export interface ModalButtonConfig {
  direction?: 'column' | 'row';
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}

export interface ModalComponentProps {
  isVisible: boolean;
  type?: 'invoice' | 'cancelInvoice';
  iconType?: 'success' | 'warning' | 'info' | 'info' | null;
  buttonConfig?: ModalButtonConfig;
  headerMessage?: string;
  bodyMessage?: string;
  onClose: () => void;

  buttonText?: string;
  buttonTextSecondary?: string;
  onButtonPress?: () => void;
  onButtonPressSecondary?: () => void;
  invoiceStatus?: 'Paid' | 'Sched' | 'Pending' | 'Draft';
  refId?: string,
  chargedAmount?: string,
  retries?: string,
  paymentRefId?: string,
  datePaid?: string,
}

export interface ResendCodeTimerProps {
  initialTime?: number;
  onResend: () => void;
  containerStyle?: ViewStyle;
}

export interface PasswordRuleProps {
  text: string;
  valid: boolean;
}

export interface SlideUpScreenModalProps {
  onClose?: () => void;
  children?: React.ReactNode;
}

export interface SnackBarProps {
  variant?: 'error' | 'success';
  visible: boolean;
  onDismiss: () => void;
  message?: string;
}

export interface NotificationItemProps {
  id: string;
  title: string;
  body: string;
  date: string;
  isRead: boolean;
  onPress: (id: string) => void;
}

export interface SettingToggleItemProps {
  label: string;
  description?: string;
  isEnabled: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

export interface FullScreenModalProps {
  type: 'cancelAutopay' | 'cancelEnrollment';
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  onAction?: () => void;
  headerActionText?: string;
}

export interface IconProps {
  iconType?: string;
  Icon?: React.FC<any> | null;
  style?: object;
  width?: number;
  height?: number;
  fill?: string;
}

export interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export interface PageStateProps {
  title: string;
  description: string;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export interface GlobalScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

interface Option {
  code: string | number;
  name: string;
}

export interface NativePickerProps {
  label: string;
  placeholder: string;
  options: Option[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  enabled?: boolean;
  error?: string;
  disabledMessage?: string;
}

export interface SearchMerchantsProps {
  data: any[];
  searchProperty: string;
  onSelect?: (item: any) => void;
  sectionTitle?: string;
  isError?: boolean;
  isLoading?: boolean;
  activeCategoryId?: number | null;
  onCategoryChange?: (id: number | undefined) => void;
  apiEnv?: 'enrollments' | 'wiremo';

  layout?: 'filters' | 'directory';

  header?: React.ReactNode;

  savedMerchantIds?: ReadonlySet<number>;
  onRetry?: () => void;
}

export interface StatusBadgeProps {
  label: string;
  colors: { text: string; dot: string; background?: string };

  appearance?: 'plain' | 'badge';
  variant?: 'default' | 'summaryCard';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface MerchantListRowProps {
  name: string;
  logoUrl?: string | null;
  initials?: string;
  badge?: string;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
}

export interface ModalContentProps {
  visible: boolean;
  title: string;
  description?: string;
  bulletItems?: string[];
  numberedItems?: string[];
  children?: React.ReactNode;
  onClose: () => void;
}

export interface AppButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: ButtonVariant;
  route?: Href;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  countdownSeconds?: number;
  isCountdownActive?: boolean;
}

export interface AppTextProps {
  accessibilityLabel?: TextProps['accessibilityLabel'];
  accessibilityRole?: TextProps['accessibilityRole'];
  adjustsFontSizeToFit?: TextProps['adjustsFontSizeToFit'];
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  weight?: PoppinsWeight;
  size?: FontSizeKey;
  variant?: 'displayMedium' | 'headlineLarge' | 'bodyMedium' | 'titleLarge' | string;
  color?: ColorKey;
  url?: string;
  m?: number;
  mTop?: number;
  mBottom?: number;
  mLeft?: number;
  mRight?: number;
  mHorizontal?: number;
  mVertical?: number;
  onPress?: () => void;
  testID?: TextProps['testID'];
  selectable?: boolean;
  numberOfLines?: number;
  ellipsizeMode?: TextProps['ellipsizeMode'];
  minimumFontScale?: TextProps['minimumFontScale'];
}

export interface DisplayNoticeProps {
  title?: string;
  description?: string;
  Icon?: string;
}

export type AutoDebitTermsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export type AutoDebitCardProps = {
  onPress: () => void;
  showViewAll?: boolean;
  activeCount?: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export type AutoPayStatusCardProps = {
  activeCount: number;
  onManage: () => void;
};

export type OneTimePaymentCardProps = {
  onMakePayment: () => void;
};

export type SavedBillCardProps = {
  bill: Bill | SavedBillSummarySource;
  logoUrl?: string | null;
  onPress?: (bill: Bill) => void;

  variant?: 'row' | 'card' | 'hero';

  status?: BillerStatus | null;
};

export interface DetailRowsProps {
  fields: EnrollmentDisplayField[];
}

export interface EnrollmentDetailsContentProps {
  enrollment: Enrollment;
}

export interface EnrollmentDetailsLookupProps {
  enrollmentId: string;
}

export interface EmptyStateCardProps {
  variant?: 'empty' | 'error';

  icon?: React.ComponentProps<typeof Feather>['name'];
  title?: string;
  message: string;

  onRetry?: () => void;
  retryLabel?: string;
  containerStyle?: ViewStyle;
  messageStyle?: TextStyle;

  appearance?: 'card' | 'dashed' | 'centered';

  actionLabel?: string;
  onAction?: () => void;
}

export type HandleFieldChange = (
  fieldKey: string,
  value: any,
  extraData?: Record<string, any>
) => void;

export interface DynamicFieldRendererBaseProps {
  field: FormField;
  formData: Record<string, any>;
  handleFieldChange: HandleFieldChange;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  touched: Record<string, boolean>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  validateField: (field: string, value: any) => string | undefined;
}

export interface CheckboxFieldRendererProps {
  field: FormField;
  isEnrollment?: boolean;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
  onRefundPress?: () => void;
  formData: Record<string, any>;
  touched: Record<string, boolean>;
  errors: Record<string, string | undefined>;
  handleFieldChange: HandleFieldChange;
}

export interface DateFieldRendererProps {
  field: FormField;
  fieldId: string;
  formData: Record<string, any>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  openDatePicker: (fieldKey: string) => void;
}

export interface LookupFieldRendererProps {
  field: FormField;
  fieldId: string;
  apiEnv?: string;
  lookupOptions: Record<string, any>;
  formData: Record<string, any>;
  touched: Record<string, boolean>;
  errors: Record<string, string | undefined>;
  handleFieldChange: HandleFieldChange;
}

export type LegalDocumentContentProps = {
  content: string;
  style?: StyleProp<ViewStyle>;
};

export interface DirectDebitBankOptionProps {
  label: string;
  icon: React.ComponentType<{ width?: number; height?: number; style?: StyleProp<ViewStyle> }>;
  onPress: () => void;
  disabled?: boolean;
}

export interface PaymentMethodRowProps {
  method: PaymentMethod;
  route?: NavigationRoute;
}

export interface RecentTransactionRowProps {
  transaction: UnifiedTransaction;
}

export interface MerchantLogoProps {
  initials: string;
  logoUrl?: string | null;

  variant?: 'tile' | 'circle' | 'ring';

  size?: number;
}

export interface UpcomingBillCardProps {
  bill: UpcomingEnrollmentBill;
  index: number;
  onPress: (bill: UpcomingEnrollmentBill) => void;
  onEnroll: () => void;
  pageWidth: number;
}

export interface PaymentOptionRowProps {

  leading: React.ReactNode;
  title: string;
  subtitle?: string;

  isSubtitleNumeric?: boolean;

  badge?: string;
  selected: boolean;

  size?: 'standard' | 'tall';

  isLast?: boolean;
  onPress: () => void;
  testID?: string;
}

export interface OneTimeMethodListProps {
  selectedMethod: OneTimePaymentMethodId | null;
  onSelectMethod: (method: OneTimePaymentMethodId) => void;
}

export interface DueSummaryStripProps {
  summary: BillerDueSummary;
}

export interface AlphabetIndexProps {
  letters: readonly string[];
  activeLetter: string;

  letterHeight?: number;

  onSelect: (letter: string) => void;

  onScrub?: (letter: string) => void;
  style?: StyleProp<ViewStyle>;
}

export interface AlphabetIndexLetterProps {
  letter: string;
  index: number;
  isActive: boolean;
  letterHeight: number;
  touchY: SharedValue<number>;
  magnify: SharedValue<number>;
  onPress: () => void;
}

export interface FeeNoticeProps {
  isCalculating: boolean;
  hasError: boolean;

  needsCardReplacement: boolean;

  fee?: string;
  onReplaceCard: () => void;
  isReplacingCard: boolean;
}

export interface PaymentFooterProps {

  label: string;
  isLabelError?: boolean;
  total: string;
  isConfirmDisabled: boolean;
  isConfirming: boolean;
  onConfirm: () => void;
}
