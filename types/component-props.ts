import type { Bill } from "@/redux/features/bills/billsTypes";
import { Colors } from "@/styles/common/colors";
import { FontSizes } from "@/styles/common/typography";
import type { PoppinsWeight } from "@/utils/fonts";
import type { Route } from "expo-router";
import type React from "react";
import type { ScrollViewProps, StyleProp, TextInputProps, TextProps, TextStyle, TouchableOpacityProps, ViewStyle } from "react-native";
import type { Enrollment, EnrollmentDisplayField } from "./enrollment";
import { FormField } from "./form";
import type { SettingRoute } from "./navigation";
import type { AppliedFilters } from "./payment";

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'danger';

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
  linkText?: string | null;
  onViewAllPress?: () => void;
  titleStyle?: TextStyle;
  linkStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

export interface SearchInputProps extends Omit<TextInputProps, 'style'> {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export interface ComponentsProps {
  sectionHeader?: {
    title?: string;
    linkText?: string;
  };
  sectionFooter?: {
    button?: boolean;
  };
  isFilterVisible?: boolean;
  onOpenFilterSheet?: () => void;
  route?: Route;
  activeFilters?: AppliedFilters;
  onViewAllPress?: () => void;
  onAddBillerPress?: () => void;
  onPayNowPress?: () => void;
  onAddPaymentMethod?: () => void;
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
  onSelect: (item: any) => void;
  sectionTitle?: string;
  isError?: boolean;
  isLoading?: boolean;
  activeCategoryId?: number | null;
  onCategoryChange?: (id: number | undefined) => void;
  apiEnv?: 'enrollments' | 'wiremo';
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
  route?: Route;
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
};

export type AutoPayStatusCardProps = {
  activeCount: number;
  onManage: () => void;
};

export type OneTimePaymentCardProps = {
  onMakePayment: () => void;
};

export type SavedBillCardProps = {
  bill: Bill;
  logoUrl?: string;
  onPress: (bill: Bill) => void;
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
  title?: string;
  message: string;
  containerStyle?: ViewStyle;
  messageStyle?: TextStyle;
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
