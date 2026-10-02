import { StyleProp, ViewStyle } from 'react-native';

export type NativeLoadingIndicatorProps = {
  label?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export type SkeletonListProps = {
  rows?: number;
  label?: string;
  showAvatar?: boolean;
  showTrailing?: boolean;
  rowStyle?: StyleProp<ViewStyle>;
};

export type HorizontalCardSkeletonProps = {
  items?: number;
  label?: string;
  itemWidth?: number;
  itemHeight?: number;
};

export type FormSkeletonProps = {
  fields?: number;
  label?: string;
};

export type DetailsSkeletonProps = {
  sections?: number;
  rowsPerSection?: number;
  label?: string;
};

export type NativeProgressBarProps = {
  progress: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export type PaymentInfoSkeletonProps = {
  label?: string;
  sections?: number;
  rowsPerSection?: number;
  includeNotice?: boolean;
  includeCheckbox?: boolean;
};