import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { localPhoneNumber, PhoneFieldRenderer } from '../../../../components/forms/dynamic-field-renderers/PhoneFieldRenderer';
import { renderWithProviders } from '../../../../utils/test-utils';

// Surface InputValidationComponent props (including the `left` adornment element)
// so we can assert wiring without rendering the full Paper input.
jest.mock('@/components/forms/InputValidationComponent', () => {
  const RN = require('react-native');
  const Mock = (props: any) => (
    <RN.View testID={`ivc-${props.field}`} {...props}>
      <RN.TextInput
        testID={`ivc-input-${props.field}`}
        value={props.value}
        onChangeText={props.setValue}
        placeholder={props.placeholder}
        keyboardType={props.keyboardType}
        maxLength={props.maxLength}
      />
    </RN.View>
  );
  return { __esModule: true, default: Mock };
});

const field = {
  fieldType: 'tel',
  key: 'phone',
  label: 'Phone',
  isRequired: true,
  placeholder: 'Enter phone number',
  maxLength: 11,
};

const buildProps = (overrides: Record<string, any> = {}) => ({
  field,
  formData: {},
  handleFieldChange: jest.fn(),
  errors: {},
  setErrors: jest.fn(),
  touched: {},
  setTouched: jest.fn(),
  validateField: jest.fn(),
  openCountryPicker: jest.fn(),
  ...overrides,
});

describe('PhoneFieldRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Rendering / prop mapping ----

  it('renders the input for the phone field', () => {
    renderWithProviders(<PhoneFieldRenderer {...(buildProps() as any)} />);
    expect(screen.getByTestId('ivc-phone')).toBeTruthy();
  });

  it('passes the current value, placeholder, keyboardType and maxLength', () => {
    renderWithProviders(
      <PhoneFieldRenderer
        {...(buildProps({ formData: { phone: '9171234567' } }) as any)}
      />,
    );
    const input = screen.getByTestId('ivc-input-phone');
    expect(input.props.value).toBe('9171234567');
    expect(input.props.placeholder).toBe('Enter phone number');
    expect(input.props.keyboardType).toBe('phone-pad');
    expect(input.props.maxLength).toBe(11);
  });

  it('falls back to an empty value when none is provided', () => {
    renderWithProviders(<PhoneFieldRenderer {...(buildProps() as any)} />);
    expect(screen.getByTestId('ivc-input-phone').props.value).toBe('');
  });

  it('does not display an already-prefixed phone number with a second calling code', () => {
    renderWithProviders(
      <PhoneFieldRenderer {...(buildProps({ formData: { phone: '+639770884111' } }) as any)} />,
    );
    expect(screen.getByTestId('ivc-input-phone').props.value).toBe('9770884111');
    expect(localPhoneNumber('9770884111', '+63')).toBe('9770884111');
  });

  // ---- setValue wiring ----

  it('routes value changes through handleFieldChange', () => {
    const handleFieldChange = jest.fn();
    renderWithProviders(
      <PhoneFieldRenderer {...(buildProps({ handleFieldChange }) as any)} />,
    );
    fireEvent.changeText(screen.getByTestId('ivc-input-phone'), '9990001111');
    expect(handleFieldChange).toHaveBeenCalledWith('phone', '9990001111');
  });

  it('normalizes a pasted number that includes the calling code', () => {
    const handleFieldChange = jest.fn();
    renderWithProviders(<PhoneFieldRenderer {...(buildProps({ handleFieldChange }) as any)} />);
    fireEvent.changeText(screen.getByTestId('ivc-input-phone'), '+639770884111');
    expect(handleFieldChange).toHaveBeenCalledWith('phone', '9770884111');
  });

  // ---- Country picker adornment ----

  it('opens the country picker when the left adornment is pressed', () => {
    const openCountryPicker = jest.fn();
    renderWithProviders(
      <PhoneFieldRenderer {...(buildProps({ openCountryPicker }) as any)} />,
    );
    const left = screen.getByTestId('ivc-phone').props.left;
    left.props.onPress();
    expect(openCountryPicker).toHaveBeenCalledWith('phone');
  });

  it('shows the default PH calling code and flag', () => {
    renderWithProviders(<PhoneFieldRenderer {...(buildProps() as any)} />);
    const left = screen.getByTestId('ivc-phone').props.left;
    renderWithProviders(<>{left.props.icon()}</>);
    expect(screen.getByText('+63')).toBeTruthy();
    expect(screen.getByText('🇵🇭')).toBeTruthy();
  });

  it('shows a custom calling code and flag from formData', () => {
    renderWithProviders(
      <PhoneFieldRenderer
        {...(buildProps({
          formData: { phone_callingCode: '+1', phone_flag: '🇺🇸' },
        }) as any)}
      />,
    );
    const left = screen.getByTestId('ivc-phone').props.left;
    renderWithProviders(<>{left.props.icon()}</>);
    expect(screen.getByText('+1')).toBeTruthy();
    expect(screen.getByText('🇺🇸')).toBeTruthy();
  });
});
