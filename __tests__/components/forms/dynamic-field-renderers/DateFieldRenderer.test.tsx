import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { DateFieldRenderer } from '../../../../components/forms/dynamic-field-renderers/DateFieldRenderer';
import { renderWithProviders } from '../../../../utils/test-utils';

const field = {
  fieldType: 'date',
  key: 'birthDate',
  label: 'Birth Date',
  placeholder: 'Select birth date',
  isRequired: true,
};

const buildProps = (overrides: Record<string, any> = {}) => ({
  field,
  fieldId: 'birthDate-0',
  formData: {},
  errors: {},
  touched: {},
  openDatePicker: jest.fn(),
  ...overrides,
});

function renderRenderer(overrides: Record<string, any> = {}) {
  return renderWithProviders(
    <PaperProvider>
      <DateFieldRenderer {...(buildProps(overrides) as any)} />
    </PaperProvider>,
  );
}

describe('DateFieldRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the field label', () => {
    renderRenderer();

    expect(screen.getAllByText('Birth Date').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the formatted date value (date portion only)', () => {
    renderRenderer({ formData: { birthDate: '2024-06-15T10:30:00Z' } });
    expect(screen.getByDisplayValue('2024-06-15')).toBeTruthy();
  });

  it('shows an empty value when no date is set', () => {
    renderRenderer();
    expect(screen.getByDisplayValue('')).toBeTruthy();
  });

  it('uses the configured placeholder', () => {
    renderRenderer();
    expect(screen.getByPlaceholderText('Select birth date')).toBeTruthy();
  });

  it('opens the date picker when the field is pressed', () => {
    const openDatePicker = jest.fn();
    renderRenderer({ openDatePicker });
    fireEvent.press(screen.UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(openDatePicker).toHaveBeenCalledWith('birthDate');
  });

  it('shows the error text when touched and an error exists', () => {
    renderRenderer({
      touched: { birthDate: true },
      errors: { birthDate: 'Date is required' },
    });
    expect(screen.getByText('Date is required')).toBeTruthy();
  });

  it('does not show the error when the field is untouched', () => {
    renderRenderer({
      touched: { birthDate: false },
      errors: { birthDate: 'Date is required' },
    });
    expect(screen.queryByText('Date is required')).toBeNull();
  });
});
