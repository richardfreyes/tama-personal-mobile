import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import DynamicFormComponent from '../../../components/forms/DynamicFormComponent';
import { FormField } from '../../../types/form';
import { renderWithProviders } from '../../../utils/test-utils';

// ---------------------------------------------------------------------------
// Mocks – child components replaced with lightweight testable elements
// ---------------------------------------------------------------------------

jest.mock('@/components/forms/InputValidationComponent', () => {
  const RN = require('react-native');
  const Mock = (props: any) => (
    <RN.View testID={`input-validation-${props.field}`}>
      <RN.TextInput
        testID={`text-input-${props.field}`}
        value={props.value}
        onChangeText={props.setValue}
        placeholder={props.placeholder}
      />
      <RN.Text testID={`format-as-currency-${props.field}`}>
        {props.formatAsCurrency ? 'currency' : 'plain'}
      </RN.Text>
    </RN.View>
  );
  return { __esModule: true, default: Mock };
});

jest.mock('@/components/forms/NativePicker', () => {
  const RN = require('react-native');
  const Mock = (props: any) => (
    <RN.View testID={`native-picker-${props.label}`}>
      <RN.Text>{props.label}</RN.Text>
      <RN.Text testID={`native-picker-placeholder-${props.label}`}>
        {props.placeholder}
      </RN.Text>
    </RN.View>
  );
  return { __esModule: true, default: Mock };
});

jest.mock('@/components/settings/TermsAndPolicyText', () => {
  const RN = require('react-native');
  const Mock = (props: any) => (
    <RN.View testID="terms-checkbox">
      <RN.TouchableOpacity testID="terms-toggle" onPress={props.onToggle}>
        <RN.Text>{props.isChecked ? 'Checked' : 'Unchecked'}</RN.Text>
      </RN.TouchableOpacity>
      {props.extraText && <RN.Text>{props.extraText}</RN.Text>}
    </RN.View>
  );
  return { __esModule: true, default: Mock };
});

jest.mock('react-native-country-codes-picker', () => ({
  CountryPicker: (props: any) => {
    if (!props.show) return null;
    const RN = require('react-native');
    return (
      <RN.View testID="country-picker">
        <RN.Text>Country Picker</RN.Text>
      </RN.View>
    );
  },
}));

jest.mock('react-native-paper-dates', () => ({
  DatePickerModal: (props: any) => {
    if (!props.visible) return null;
    const RN = require('react-native');
    return (
      <RN.View testID="date-picker-modal">
        <RN.Text>Date Picker</RN.Text>
      </RN.View>
    );
  },
}));

// ---------------------------------------------------------------------------
// Field fixtures
// ---------------------------------------------------------------------------

const textField: FormField = {
  fieldType: 'text',
  key: 'name',
  label: 'Full Name',
  isRequired: true,
  placeholder: 'Enter full name',
  maxLength: 50,
};

const emailField: FormField = {
  fieldType: 'email',
  key: 'email',
  label: 'Email',
  isRequired: true,
  placeholder: 'Enter email',
};

const numberField: FormField = {
  fieldType: 'number',
  key: 'amount',
  label: 'Amount',
  isRequired: true,
};

const currencyField: FormField = {
  fieldType: 'currency',
  key: 'price',
  label: 'Price',
  isRequired: true,
  maxLength: 10,
};

const dateField: FormField = {
  fieldType: 'date',
  key: 'birthDate',
  label: 'Birth Date',
  isRequired: true,
};

const telField: FormField = {
  fieldType: 'tel',
  key: 'phone',
  label: 'Phone',
  isRequired: true,
  placeholder: 'Enter phone number',
  maxLength: 11,
};

const longtextField: FormField = {
  fieldType: 'longtext',
  key: 'notes',
  label: 'Notes',
  isRequired: false,
  placeholder: 'Enter notes',
  maxLength: 500,
};

const lookupField: FormField = {
  fieldType: 'lookup',
  key: 'country',
  label: 'Country',
  isRequired: true,
  placeholder: 'Select country',
};

const checkboxField: FormField = {
  fieldType: 'checkbox',
  key: 'termsAccepted',
  label: 'I agree to the',
  isRequired: true,
};

const rowField: FormField = {
  fieldType: 'row',
  key: 'address',
  label: 'Address',
  hint: 'Enter your full address',
  isRequired: true,
  fields: [
    { fieldType: 'text', key: 'street', label: 'Street', isRequired: true },
    { fieldType: 'text', key: 'city', label: 'City', isRequired: true },
  ],
};

const autoDebitRowField: FormField = {
  fieldType: 'row',
  key: 'autoDebitDetails',
  label: 'Auto-Debit Schedule',
  hint: 'The monthly amount excludes convenience fees.',
  isRequired: false,
  displayOrder: 4,
  fields: [
    {
      fieldType: 'currency',
      key: 'amount',
      label: 'Monthly Amount Due in PHP',
      placeholder: 'Enter monthly amount due',
      isRequired: true,
      displayOrder: 3,
    },
    {
      fieldType: 'date',
      key: 'startDate',
      label: 'Start Payment Date',
      placeholder: 'Select start payment date',
      isRequired: true,
      displayOrder: 1,
    },
    {
      fieldType: 'number',
      key: 'monthSpan',
      label: 'No. of Months to Pay',
      placeholder: 'Enter number of months',
      isRequired: true,
      displayOrder: 2,
    },
  ],
};

const unknownField: FormField = {
  fieldType: 'foobar',
  key: 'unknown',
  label: 'Unknown',
  isRequired: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let mockOnFormChange: jest.Mock;
let mockValidateField: jest.Mock;
let mockSetErrors: jest.Mock;
let mockSetTouched: jest.Mock;

const buildProps = (overrides: Record<string, any> = {}) => ({
  apiEnv: 'wiremo' as const,
  fields: [] as FormField[],
  lookupOptions: {} as Record<string, any>,
  formData: {} as Record<string, any>,
  onFormChange: mockOnFormChange,
  validateField: mockValidateField,
  errors: {} as Record<string, string | undefined>,
  setErrors: mockSetErrors,
  touched: {} as Record<string, boolean>,
  setTouched: mockSetTouched,
  ...overrides,
});

function renderForm(overrides: Record<string, any> = {}) {
  const props = buildProps(overrides);
  return renderWithProviders(
    <PaperProvider>
      <DynamicFormComponent {...(props as any)} />
    </PaperProvider>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DynamicFormComponent', () => {
  beforeEach(() => {
    mockOnFormChange = jest.fn();
    mockValidateField = jest.fn().mockReturnValue(undefined);
    mockSetErrors = jest.fn();
    mockSetTouched = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Empty / no fields ----

  it('renders nothing when fields array is empty', () => {
    const { toJSON } = renderForm({ fields: [] });
    const tree = toJSON() as any;
    // Should only contain the hidden CountryPicker (show=false renders null)
    // and hidden DatePickerModal (visible=false renders null)
    expect(screen.queryByTestId('input-validation-name')).toBeNull();
  });

  it('renders nothing when fields is undefined', () => {
    renderForm({ fields: undefined });
    expect(screen.queryByTestId('input-validation-name')).toBeNull();
  });

  // ---- isEnrollmentsForm flag ----

  it('does not render field content when isEnrollmentsForm is true', () => {
    renderForm({ isEnrollmentsForm: true, fields: [textField, emailField] });
    expect(screen.queryByTestId('input-validation-name')).toBeNull();
    expect(screen.queryByTestId('input-validation-email')).toBeNull();
  });

  // ---- Text field ----

  it('renders InputValidationComponent for text field type', () => {
    renderForm({ fields: [textField] });
    expect(screen.getByTestId('input-validation-name')).toBeTruthy();
  });

  it('passes current formData value to text field', () => {
    renderForm({ fields: [textField], formData: { name: 'Alice' } });
    expect(screen.getByTestId('text-input-name').props.value).toBe('Alice');
  });

  it('passes placeholder from field definition', () => {
    renderForm({ fields: [textField] });
    expect(screen.getByTestId('text-input-name').props.placeholder).toBe(
      'Enter full name',
    );
  });

  it('falls back to label when placeholder is undefined', () => {
    const noPlaceholder = { ...textField, placeholder: undefined };
    renderForm({ fields: [noPlaceholder] });
    expect(screen.getByTestId('text-input-name').props.placeholder).toBe(
      'Full Name',
    );
  });

  it('calls onFormChange when text input value changes', () => {
    renderForm({ fields: [textField] });
    fireEvent.changeText(screen.getByTestId('text-input-name'), 'Bob');
    expect(mockOnFormChange).toHaveBeenCalledWith('name', 'Bob', undefined);
  });

  // ---- Email field ----

  it('renders InputValidationComponent for email field type', () => {
    renderForm({ fields: [emailField] });
    expect(screen.getByTestId('input-validation-email')).toBeTruthy();
  });

  // ---- Number field ----

  it('renders InputValidationComponent for number field type', () => {
    renderForm({ fields: [numberField] });
    expect(screen.getByTestId('input-validation-amount')).toBeTruthy();
  });

  // ---- Currency field ----

  it('renders InputValidationComponent for currency field type', () => {
    renderForm({ fields: [currencyField] });
    expect(screen.getByTestId('input-validation-price')).toBeTruthy();
  });

  it('enables reusable currency input formatting for currency field type', () => {
    renderForm({ fields: [currencyField] });
    expect(screen.getByTestId('format-as-currency-price').props.children).toBe('currency');
  });

  // ---- Date field ----

  it('renders date field with label', () => {
    renderForm({ fields: [dateField] });
    expect(screen.getAllByText('Birth Date').length).toBeGreaterThanOrEqual(1);
  });

  it('shows formatted date value in date field', () => {
    renderForm({
      fields: [dateField],
      formData: { birthDate: '2024-06-15' },
    });
    expect(screen.getByDisplayValue('2024-06-15')).toBeTruthy();
  });

  it('shows empty value when date is not set', () => {
    renderForm({ fields: [dateField], formData: {} });
    expect(screen.getByDisplayValue('')).toBeTruthy();
  });

  it('shows error on date field when touched and error exists', () => {
    renderForm({
      fields: [dateField],
      touched: { birthDate: true },
      errors: { birthDate: 'Date is required' },
    });
    expect(screen.getByText('Date is required')).toBeTruthy();
  });

  it('does not show date error when field is not touched', () => {
    renderForm({
      fields: [dateField],
      touched: { birthDate: false },
      errors: { birthDate: 'Date is required' },
    });
    expect(screen.queryByText('Date is required')).toBeNull();
  });

  // ---- Tel field ----

  it('renders InputValidationComponent for tel field type', () => {
    renderForm({ fields: [telField] });
    expect(screen.getByTestId('input-validation-phone')).toBeTruthy();
  });

  // ---- Longtext field ----

  it('renders InputValidationComponent for longtext field type', () => {
    renderForm({ fields: [longtextField] });
    expect(screen.getByTestId('input-validation-notes')).toBeTruthy();
  });

  // ---- Lookup field ----

  it('renders NativePicker for lookup field type', () => {
    renderForm({ fields: [lookupField] });
    expect(screen.getByTestId('native-picker-Country')).toBeTruthy();
  });

  it('shows lookup label text', () => {
    renderForm({ fields: [lookupField] });
    expect(screen.getByText('Country')).toBeTruthy();
  });

  // ---- Checkbox field ----

  it('renders TermsAndConditionsCheckbox for checkbox field type', () => {
    renderForm({ fields: [checkboxField] });
    expect(screen.getByTestId('terms-checkbox')).toBeTruthy();
  });

  it('shows unchecked state when formData value is falsy', () => {
    renderForm({
      fields: [checkboxField],
      formData: { termsAccepted: false },
    });
    expect(screen.getByText('Unchecked')).toBeTruthy();
  });

  it('shows checked state when formData value is true', () => {
    renderForm({
      fields: [checkboxField],
      formData: { termsAccepted: true },
    });
    expect(screen.getByText('Checked')).toBeTruthy();
  });

  it('calls onFormChange with toggled value when checkbox is pressed', () => {
    renderForm({
      fields: [checkboxField],
      formData: { termsAccepted: false },
    });
    fireEvent.press(screen.getByTestId('terms-toggle'));
    expect(mockOnFormChange).toHaveBeenCalledWith('termsAccepted', true, undefined);
  });

  it('shows checkbox error text when touched and error exists', () => {
    renderForm({
      fields: [checkboxField],
      touched: { termsAccepted: true },
      errors: { termsAccepted: 'Required' },
    });
    expect(
      screen.getByText(/To proceed, please check this box/),
    ).toBeTruthy();
  });

  // ---- Row field ----

  it('renders nested fields inside a row', () => {
    renderForm({ fields: [rowField] });
    expect(screen.getByTestId('input-validation-street')).toBeTruthy();
    expect(screen.getByTestId('input-validation-city')).toBeTruthy();
  });

  it('renders row label text', () => {
    renderForm({ fields: [rowField] });
    expect(screen.getByText('Address')).toBeTruthy();
  });

  it('renders row hint text', () => {
    renderForm({ fields: [rowField] });
    expect(screen.getByText('Enter your full address')).toBeTruthy();
  });

  it('renders a keyed row when visibility contains only its nested leaf keys', () => {
    const visibleLeafKeys = new Set(['startDate', 'monthSpan', 'amount']);
    const isFieldVisible = jest.fn((key: string) => visibleLeafKeys.has(key));

    renderForm({ fields: [autoDebitRowField], isFieldVisible });

    expect(screen.getByText('Auto-Debit Schedule')).toBeTruthy();
    expect(screen.getByText('The monthly amount excludes convenience fees.')).toBeTruthy();
    expect(screen.getAllByDisplayValue('').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('input-validation-monthSpan')).toBeTruthy();
    expect(screen.getByTestId('input-validation-amount')).toBeTruthy();
    expect(isFieldVisible).not.toHaveBeenCalledWith('autoDebitDetails');
  });

  it('orders top-level and nested row fields by displayOrder', () => {
    const fields: FormField[] = [
      { fieldType: 'text', key: 'customerName', label: 'Name of Unit Owner', isRequired: true, displayOrder: 5 },
      autoDebitRowField,
      { fieldType: 'text', key: 'unitNumber', label: 'Unit Number', isRequired: true, displayOrder: 3 },
      { fieldType: 'text', key: 'projectName', label: 'Project Name', isRequired: true, displayOrder: 1 },
      { fieldType: 'text', key: 'soNumber', label: 'SO Number', isRequired: true, displayOrder: 2 },
    ];

    renderForm({ fields });

    const renderedTextFields = screen.getAllByTestId(/^input-validation-/)
      .map((node) => node.props.testID);

    expect(renderedTextFields).toEqual([
      'input-validation-projectName',
      'input-validation-soNumber',
      'input-validation-unitNumber',
      'input-validation-monthSpan',
      'input-validation-amount',
      'input-validation-customerName',
    ]);
  });

  it('renders nothing for row when nested fields list is empty', () => {
    const emptyRow: FormField = { ...rowField, fields: [] };
    renderForm({ fields: [emptyRow] });
    expect(screen.queryByText('Address')).toBeNull();
  });

  it('omits label/hint Views when they are undefined', () => {
    const bareRow: FormField = {
      ...rowField,
      label: '',
      hint: undefined,
    };
    renderForm({ fields: [bareRow] });
    expect(screen.queryByText('Address')).toBeNull();
    expect(screen.queryByText('Enter your full address')).toBeNull();
    expect(screen.getByTestId('input-validation-street')).toBeTruthy();
  });

  // ---- Unknown field type ----

  it('renders nothing for an unrecognised field type', () => {
    renderForm({ fields: [unknownField] });
    expect(screen.queryByTestId('input-validation-unknown')).toBeNull();
    expect(screen.queryByTestId('native-picker-Unknown')).toBeNull();
  });

  // ---- isFieldVisible ----

  it('hides field when isFieldVisible returns false', () => {
    const isFieldVisible = jest.fn().mockReturnValue(false);
    renderForm({ fields: [textField], isFieldVisible });
    expect(screen.queryByTestId('input-validation-name')).toBeNull();
    expect(isFieldVisible).toHaveBeenCalledWith('name');
  });

  it('shows field when isFieldVisible returns true', () => {
    const isFieldVisible = jest.fn().mockReturnValue(true);
    renderForm({ fields: [textField], isFieldVisible });
    expect(screen.getByTestId('input-validation-name')).toBeTruthy();
  });

  it('shows field when isFieldVisible is not provided', () => {
    renderForm({ fields: [textField] });
    expect(screen.getByTestId('input-validation-name')).toBeTruthy();
  });

  it('filters nested row fields via isFieldVisible', () => {
    const isFieldVisible = jest.fn((key: string) => key !== 'city');
    renderForm({ fields: [rowField], isFieldVisible });
    expect(screen.getByTestId('input-validation-street')).toBeTruthy();
    expect(screen.queryByTestId('input-validation-city')).toBeNull();
  });

  it('returns null for row when all nested fields are hidden', () => {
    const isFieldVisible = jest.fn().mockReturnValue(false);
    renderForm({ fields: [rowField], isFieldVisible });
    expect(screen.queryByText('Address')).toBeNull();
    expect(screen.queryByTestId('input-validation-street')).toBeNull();
  });

  // ---- Validation behaviour ----

  it('calls validateField on change when field has been touched', () => {
    renderForm({
      fields: [textField],
      touched: { name: true },
    });
    fireEvent.changeText(screen.getByTestId('text-input-name'), 'Alice');
    expect(mockValidateField).toHaveBeenCalledWith('name', 'Alice');
    expect(mockSetErrors).toHaveBeenCalled();
  });

  it('clears error without validating when field has not been touched', () => {
    renderForm({
      fields: [textField],
      touched: { name: false },
    });
    fireEvent.changeText(screen.getByTestId('text-input-name'), 'Alice');
    expect(mockValidateField).not.toHaveBeenCalled();
    expect(mockSetErrors).toHaveBeenCalled();

    const updater = mockSetErrors.mock.calls[0][0] as (
      prev: Record<string, string | undefined>,
    ) => Record<string, string | undefined>;
    const result = updater({ existingField: 'some error' });
    expect(result).toEqual({ existingField: 'some error', name: undefined });
  });

  // ---- Multiple fields ----

  it('renders multiple fields in order', () => {
    renderForm({ fields: [textField, emailField, longtextField] });
    expect(screen.getByTestId('input-validation-name')).toBeTruthy();
    expect(screen.getByTestId('input-validation-email')).toBeTruthy();
    expect(screen.getByTestId('input-validation-notes')).toBeTruthy();
  });

  // ---- enrollmentFields ----

  it('renders enrollmentFields alongside regular fields', () => {
    const enrollmentText: FormField = {
      fieldType: 'text',
      key: 'enrollmentName',
      label: 'Enrollment Name',
      isRequired: true,
    };
    renderForm({ fields: [textField], enrollmentFields: [enrollmentText] });
    expect(screen.getByTestId('input-validation-name')).toBeTruthy();
    expect(screen.getByTestId('input-validation-enrollmentName')).toBeTruthy();
  });

  // ---- Global pickers render hidden by default ----

  it('does not show CountryPicker or DatePickerModal on initial render', () => {
    renderForm({ fields: [telField, dateField] });
    expect(screen.queryByTestId('country-picker')).toBeNull();
    expect(screen.queryByTestId('date-picker-modal')).toBeNull();
  });
});
