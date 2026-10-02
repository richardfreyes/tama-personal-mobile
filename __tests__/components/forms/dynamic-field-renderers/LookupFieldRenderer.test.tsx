import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import React from 'react';
import { LookupFieldRenderer } from '../../../../components/forms/dynamic-field-renderers/LookupFieldRenderer';
import { renderWithProviders } from '../../../../utils/test-utils';

// Capture the props passed to NativePicker so we can exercise its callbacks.
let pickerProps: any = null;

jest.mock('@/components/forms/NativePicker', () => {
  const RN = require('react-native');
  const Mock = (props: any) => {
    pickerProps = props;
    return <RN.View testID="native-picker" />;
  };
  return { __esModule: true, default: Mock };
});

const buildProps = (overrides: Record<string, any> = {}) => ({
  field: {
    fieldType: 'lookup',
    key: 'country',
    label: 'Country',
    isRequired: true,
    placeholder: 'Select country',
  },
  fieldId: 'country-0',
  apiEnv: 'wiremo',
  lookupOptions: {
    country: [
      { code: 'PH', name: 'Philippines' },
      { code: 'US', name: 'USA' },
    ],
  },
  formData: {},
  touched: {},
  errors: {},
  handleFieldChange: jest.fn(),
  ...overrides,
});

describe('LookupFieldRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pickerProps = null;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Rendering / prop mapping ----

  it('renders the NativePicker', () => {
    renderWithProviders(<LookupFieldRenderer {...(buildProps() as any)} />);
    expect(screen.getByTestId('native-picker')).toBeTruthy();
  });

  it('passes the label and placeholder', () => {
    renderWithProviders(<LookupFieldRenderer {...(buildProps() as any)} />);
    expect(pickerProps.label).toBe('Country');
    expect(pickerProps.placeholder).toBe('Select country');
  });

  it('falls back to a default placeholder when none is provided', () => {
    renderWithProviders(
      <LookupFieldRenderer
        {...(buildProps({
          field: { fieldType: 'lookup', key: 'country', label: '', isRequired: false },
        }) as any)}
      />,
    );
    expect(pickerProps.placeholder).toBe('Select an option');
  });

  it('normalises lookup options into code/name pairs', () => {
    renderWithProviders(<LookupFieldRenderer {...(buildProps() as any)} />);
    expect(pickerProps.options).toEqual([
      { code: 'PH', name: 'Philippines' },
      { code: 'US', name: 'USA' },
    ]);
  });

  it('uses the formData value as the selected value', () => {
    renderWithProviders(
      <LookupFieldRenderer {...(buildProps({ formData: { country: 'US' } }) as any)} />,
    );
    expect(pickerProps.selectedValue).toBe('US');
  });

  // ---- onValueChange (default branch) ----

  it('calls handleFieldChange with the raw value for a standard field', () => {
    const handleFieldChange = jest.fn();
    renderWithProviders(
      <LookupFieldRenderer {...(buildProps({ handleFieldChange }) as any)} />,
    );
    pickerProps.onValueChange('US');
    expect(handleFieldChange).toHaveBeenCalledWith('country', 'US');
  });

  // ---- onValueChange (enrollments branch) ----

  it('stores the code for a enrollments paymentType field', () => {
    const handleFieldChange = jest.fn();
    renderWithProviders(
      <LookupFieldRenderer
        {...(buildProps({
          apiEnv: 'enrollments',
          field: { fieldType: 'lookup', key: 'paymentType', label: 'Payment Type' },
          lookupOptions: {
            paymentType: [{ code: 'card', name: 'Card' }],
          },
          handleFieldChange,
        }) as any)}
      />,
    );
    pickerProps.onValueChange('card');
    expect(handleFieldChange).toHaveBeenCalledWith('paymentType', 'card', {
      paymentType: 'card',
      paymentTypeCode: 'card',
    });
  });

  it('stores the name for a non-paymentType enrollments field', () => {
    const handleFieldChange = jest.fn();
    renderWithProviders(
      <LookupFieldRenderer
        {...(buildProps({
          apiEnv: 'enrollments',
          field: { fieldType: 'lookup', key: 'bank', label: 'Bank' },
          lookupOptions: { bank: [{ code: 'bdo', name: 'BDO' }] },
          handleFieldChange,
        }) as any)}
      />,
    );
    pickerProps.onValueChange('bdo');
    expect(handleFieldChange).toHaveBeenCalledWith('bank', 'BDO', {
      bank: 'BDO',
      bankCode: 'bdo',
    });
  });

  // ---- onValueChange (projectName branch) ----

  it('resolves the project name and metadata for the projectName field', () => {
    const handleFieldChange = jest.fn();
    renderWithProviders(
      <LookupFieldRenderer
        {...(buildProps({
          field: { fieldType: 'lookup', key: 'projectName', label: 'Project' },
          lookupOptions: {
            projectName: [
              { projectId: 'p1', name: 'Project One', category: 'Residential' },
            ],
          },
          handleFieldChange,
        }) as any)}
      />,
    );
    pickerProps.onValueChange('p1');
    expect(handleFieldChange).toHaveBeenCalledWith(
      'projectName',
      'Project One',
      expect.objectContaining({
        projectId: 'p1',
        projectCategory: 'Residential',
      }),
    );
  });

  // ---- Error wiring ----

  it('passes the error only when the field is touched', () => {
    renderWithProviders(
      <LookupFieldRenderer
        {...(buildProps({
          touched: { country: true },
          errors: { country: 'Required' },
        }) as any)}
      />,
    );
    expect(pickerProps.error).toBe('Required');
  });

  it('does not pass an error when the field is untouched', () => {
    renderWithProviders(
      <LookupFieldRenderer
        {...(buildProps({
          touched: { country: false },
          errors: { country: 'Required' },
        }) as any)}
      />,
    );
    expect(pickerProps.error).toBeUndefined();
  });
});
