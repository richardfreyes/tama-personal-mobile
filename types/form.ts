import { StyleProp, TextStyle, ViewStyle } from "react-native";

export interface LookupOption {
  code: string;
  name: string;
}

export interface DynamicFormLookupOptions {
  projectName?: LookupOption[];
  paymentType?: LookupOption[];
  propertyType?: LookupOption[];
  salesChannel?: LookupOption[];
  paymentMode?: LookupOption[];
  paymentYears?: LookupOption[];
  chargeTypes?: LookupOption[];
}

export interface Project {
  is_active: boolean;
  is_enabled: boolean;
  project_category: string;
  project_id: number;
  project_name: string;
}

export interface AddCardFormInputs {
  fullName: string;
  cardNumber: string;
  expiryDate: string;
  securityCode: string;
  streetAddress: string;
  country: string;
  stateRegion: string;
  city: string;
  postalCode: string;
}

export interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormInputs {
  firstName: string;
  lastName: string;
  emailAddress: string;
  rawPassword: string;
  turnstileToken: string;
}

export interface ForgotFormInputs {
  emailAddress: string;
}

export type FormFields = keyof (LoginFormInputs & SignupFormInputs & ForgotFormInputs & AddCardFormInputs);

export type Props = {
  field: string;
  value: string;
  extra?: { selected?: string, passwordToMatch?: string };
  setValue: (val: string) => void;
  label?: string;
  placeholder: string;
  errors: Record<string, string | undefined>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  touched: Record<string, boolean>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  validateField: (field: string, value: string, extra?: { selected?: string, passwordToMatch?: string }) => string | undefined;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "numeric" | "number-pad" | "decimal-pad" | "email-address" | "phone-pad" | undefined;
  secureTextEntry?: boolean;
  maxLength?: number;
  onFocus?: () => void;
  multiline?: boolean;
  editable?: boolean;
  maskOnBlur?: boolean;
  formatAsCurrency?: boolean;
  rightIcon?: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export interface InputValidationProps extends Props {
  mode?: 'flat' | 'outlined';
  left?: React.ReactNode;

  variant?: 'outlined' | 'amount';
  prefix?: string;
  helperText?: string;
}

export interface ResetPasswordInputs {
  email: string;
}

export interface Option {
  code: string | number | null;
  name: string;
}

export interface AppSelectInputProps {
  label: string;
  placeholder: string;
  options: Option[];
  selectedValue?: string | number | null;
  onValueChange?: (value: string | number | null) => void;
  style?: ViewStyle;
}
export interface FormField {
  fieldType: string;
  key: string;
  label: string;
  displayOrder?: number;
  hint?: string;
  placeholder?: string;
  isRequired: boolean;
  maxLength?: number;
  fields?: FormField[] | null;
  lookupReference?: {
    location: string;
    source: 'link' | 'self';
  };
  pattern?: string;
  visibility?: any;
}

export interface DynamicFormProps {
  apiEnv: 'enrollments' | 'wiremo';
  isEnrollmentsForm?: boolean;
  isEnrollment?: boolean;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
  onRefundPress?: () => void;
  fields?: FormField[];
  enrollmentFields?: any[];
  lookupOptions?: Record<string, any[]>;
  formData?: Record<string, any>;
  onFormChange?: (field: string, value: any, extraData?: Record<string, any>) => void;
  validateField?: (field: string, value: any) => string | undefined;
  errors?: Record<string, string | undefined>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  touched?: Record<string, boolean>;
  setTouched?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isFieldVisible?: (fieldKey: string) => boolean;
}

export interface EmailUpdateInputs {
  currentEmail: string;
  newEmail: string;
}

export interface PasswordUpdateInputs {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AddressInputs {
  streetAddress: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
}

export interface RtkQueryError {
  status: number;
  data: { message: string; };
}

export interface OTPInputProps {
  length?: number;
  onCodeChange: (code: string) => void;
  containerStyle?: object;
  inputStyle?: object;
  error?: string;
  onClearError?: () => void;
}

export interface SelectionCardProps {
  icon: React.FC<any>;
  title: string;
  description: string;
  onPress: () => void;
}

export interface TermsAndConditionsCheckboxProps {
  extraText?: string;
  onTermsLinkPress?: () => void;
  onPrivacyLinkPress?: () => void;
  onRefundLinkPress?: () => void;
  isChecked: boolean;
  onToggle: () => void;
  containerStyle?: ViewStyle;
}

export interface ToggleOptionProps {
  options?: string[];
  initialSelected?: string;
  onOptionChange?: (selectedOption: string) => void;
  buttonConfig?: ButtonConfig;
}

export interface ButtonConfig {
  isButton?: boolean;
  primaryBtn?: string;
  secondaryBtn?: string;
}

export interface ApiErrorResponse {
  status: number;
  data: ApiErrorData;
}

export interface ApiErrorData {
  message: string;
}
