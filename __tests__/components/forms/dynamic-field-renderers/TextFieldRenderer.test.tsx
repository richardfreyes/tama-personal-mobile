import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { TextFieldRenderer } from '../../../../components/forms/dynamic-field-renderers/TextFieldRenderer';
import { renderWithProviders } from '../../../../utils/test-utils';

// Isolate the renderer by replacing the wrapped input with a lightweight mock
// that surfaces the props it receives.
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
        formatAsCurrency={props.formatAsCurrency}
      />
    </RN.View>
  );
  return { __esModule: true, default: Mock };
});

const baseField = {
  fieldType: 'text',
  key: 'name',
  label: 'Full Name',
  isRequired: true,
  placeholder: 'Enter full name',
  maxLength: 50,
};

const buildProps = (overrides: Record<string, any> = {}) => ({
  field: baseField,
  formData: {},
  handleFieldChange: jest.fn(),
  errors: {},
  setErrors: jest.fn(),
  touched: {},
  setTouched: jest.fn(),
  validateField: jest.fn(),
  multiline: false,
  ...overrides,
});

describe('TextFieldRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Rendering / prop mapping ----

  it('renders the input for the field key', () => {
    renderWithProviders(<TextFieldRenderer {...(buildProps() as any)} />);
    expect(screen.getByTestId('ivc-name')).toBeTruthy();
  });

  it('passes the current formData value', () => {
    renderWithProviders(
      <TextFieldRenderer
        {...(buildProps({ formData: { name: 'Alice' } }) as any)}
      />,
    );
    expect(screen.getByTestId('ivc-input-name').props.value).toBe('Alice');
  });

  it('falls back to an empty string when no value exists', () => {
    renderWithProviders(<TextFieldRenderer {...(buildProps() as any)} />);
    expect(screen.getByTestId('ivc-input-name').props.value).toBe('');
  });

  it('uses the placeholder, falling back to the label', () => {
    renderWithProviders(<TextFieldRenderer {...(buildProps() as any)} />);
    expect(screen.getByTestId('ivc-input-name').props.placeholder).toBe(
      'Enter full name',
    );

    const noPlaceholder = { ...baseField, placeholder: undefined };
    renderWithProviders(
      <TextFieldRenderer {...(buildProps({ field: noPlaceholder }) as any)} />,
    );
    expect(screen.getByTestId('ivc-input-name').props.placeholder).toBe(
      'Full Name',
    );
  });

  it('passes the field label separately from its placeholder', () => {
    renderWithProviders(<TextFieldRenderer {...(buildProps() as any)} />);

    expect(screen.getByTestId('ivc-name').props.label).toBe('Full Name');
    expect(screen.getByTestId('ivc-input-name').props.placeholder).toBe('Enter full name');
  });

  // ---- setValue wiring ----

  it('routes value changes through handleFieldChange with the field key', () => {
    const handleFieldChange = jest.fn();
    renderWithProviders(
      <TextFieldRenderer {...(buildProps({ handleFieldChange }) as any)} />,
    );
    fireEvent.changeText(screen.getByTestId('ivc-input-name'), 'Bob');
    expect(handleFieldChange).toHaveBeenCalledWith('name', 'Bob');
  });

  // ---- keyboardType per field type ----

  it('uses an email keyboard for email fields', () => {
    renderWithProviders(
      <TextFieldRenderer
        {...(buildProps({ field: { ...baseField, fieldType: 'email' } }) as any)}
      />,
    );
    expect(screen.getByTestId('ivc-input-name').props.keyboardType).toBe(
      'email-address',
    );
  });

  it('uses a numeric keyboard for number fields', () => {
    const { getByTestId } = renderWithProviders(
      <TextFieldRenderer
        {...(buildProps({ field: { ...baseField, fieldType: 'number' } }) as any)}
      />,
    );
    expect(getByTestId('ivc-input-name').props.keyboardType).toBe('numeric');
  });

  it('uses a decimal keyboard for currency fields', () => {
    const { getByTestId } = renderWithProviders(
      <TextFieldRenderer
        {...(buildProps({
          field: { ...baseField, fieldType: 'currency' },
        }) as any)}
      />,
    );
    expect(getByTestId('ivc-input-name').props.keyboardType).toBe('decimal-pad');
  });

  it('enables currency formatting for currency fields', () => {
    const { getByTestId } = renderWithProviders(
      <TextFieldRenderer
        {...(buildProps({
          field: { ...baseField, fieldType: 'currency' },
        }) as any)}
      />,
    );
    expect(getByTestId('ivc-input-name').props.formatAsCurrency).toBe(true);
  });

  it('uses the default keyboard for plain text fields', () => {
    renderWithProviders(<TextFieldRenderer {...(buildProps() as any)} />);
    expect(screen.getByTestId('ivc-input-name').props.keyboardType).toBe(
      'default',
    );
  });

  // ---- maxLength handling ----

  it('passes the field maxLength for non-currency fields', () => {
    renderWithProviders(<TextFieldRenderer {...(buildProps() as any)} />);
    expect(screen.getByTestId('ivc-input-name').props.maxLength).toBe(50);
  });

  it('omits maxLength for currency fields', () => {
    renderWithProviders(
      <TextFieldRenderer
        {...(buildProps({
          field: { ...baseField, fieldType: 'currency' },
        }) as any)}
      />,
    );
    expect(
      screen.getByTestId('ivc-input-name').props.maxLength,
    ).toBeUndefined();
  });

  // ---- multiline branch ----

  it('does not set a keyboardType when multiline is true', () => {
    renderWithProviders(
      <TextFieldRenderer {...(buildProps({ multiline: true }) as any)} />,
    );
    expect(
      screen.getByTestId('ivc-input-name').props.keyboardType,
    ).toBeUndefined();
    expect(screen.getByTestId('ivc-name').props.multiline).toBe(true);
  });
});
