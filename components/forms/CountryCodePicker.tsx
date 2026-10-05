import type { CountryCodePickerProps } from '@/types/common';
import type React from 'react';

const CountryCodePicker = (require('react-native-country-codes-picker') as {
  CountryPicker: React.ComponentType<CountryCodePickerProps>;
}).CountryPicker;

export default CountryCodePicker;
