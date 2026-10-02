import { SpacerProps } from '@/types/common';
import { View } from 'react-native';

export const SpacerComponent = ({ height = 0, width = 0 }: SpacerProps) => {
  return <View style={{ height, width }} />;
};