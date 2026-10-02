import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { CheckboxFieldRenderer } from '../../../../components/forms/dynamic-field-renderers/CheckboxFieldRenderer';
import { renderWithProviders } from '../../../../utils/test-utils';

// Replace the terms checkbox with a lightweight mock that surfaces its props.
jest.mock('@/components/settings/TermsAndPolicyText', () => {
  const RN = require('react-native');
  const Mock = (props: any) => (
    <RN.View testID="terms-checkbox" {...props}>
      <RN.TouchableOpacity testID="terms-toggle" onPress={props.onToggle}>
        <RN.Text>{props.isChecked ? 'Checked' : 'Unchecked'}</RN.Text>
      </RN.TouchableOpacity>
      {props.extraText ? <RN.Text>{props.extraText}</RN.Text> : null}
      {props.onTermsLinkPress ? <RN.Text>HAS_TERMS_LINK</RN.Text> : null}
      {props.onPrivacyLinkPress ? <RN.Text>HAS_PRIVACY_LINK</RN.Text> : null}
      {props.onRefundLinkPress ? <RN.Text>HAS_REFUND_LINK</RN.Text> : null}
    </RN.View>
  );
  return { __esModule: true, default: Mock };
});

const field = {
  fieldType: 'checkbox',
  key: 'termsAccepted',
  label: 'I agree to the terms',
  isRequired: true,
};

const buildProps = (overrides: Record<string, any> = {}) => ({
  field,
  isEnrollment: false,
  onTermsPress: jest.fn(),
  formData: {},
  touched: {},
  errors: {},
  handleFieldChange: jest.fn(),
  ...overrides,
});

function renderRenderer(overrides: Record<string, any> = {}) {
  return renderWithProviders(
    <PaperProvider>
      <CheckboxFieldRenderer {...(buildProps(overrides) as any)} />
    </PaperProvider>,
  );
}

describe('CheckboxFieldRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Rendering ----

  it('renders the checkbox with the field label as extra text', () => {
    renderRenderer();
    expect(screen.getByTestId('terms-checkbox')).toBeTruthy();
    expect(screen.getByText('I agree to the terms')).toBeTruthy();
  });

  it('reflects the unchecked state when formData is falsy', () => {
    renderRenderer({ formData: { termsAccepted: false } });
    expect(screen.getByText('Unchecked')).toBeTruthy();
  });

  it('reflects the checked state when formData is true', () => {
    renderRenderer({ formData: { termsAccepted: true } });
    expect(screen.getByText('Checked')).toBeTruthy();
  });

  // ---- Toggle ----

  it('toggles the value via handleFieldChange when pressed', () => {
    const handleFieldChange = jest.fn();
    renderRenderer({ formData: { termsAccepted: false }, handleFieldChange });
    fireEvent.press(screen.getByTestId('terms-toggle'));
    expect(handleFieldChange).toHaveBeenCalledWith('termsAccepted', true);
  });

  it('toggles a checked value back to false', () => {
    const handleFieldChange = jest.fn();
    renderRenderer({ formData: { termsAccepted: true }, handleFieldChange });
    fireEvent.press(screen.getByTestId('terms-toggle'));
    expect(handleFieldChange).toHaveBeenCalledWith('termsAccepted', false);
  });

  // ---- Terms link (enrollment) ----

  it('passes onTermsPress as the link handler when isEnrollment is true', () => {
    renderRenderer({ isEnrollment: true });
    expect(screen.getByText('HAS_TERMS_LINK')).toBeTruthy();
  });

  it('does not pass a link handler when isEnrollment is false', () => {
    renderRenderer({ isEnrollment: false });
    expect(screen.queryByText('HAS_TERMS_LINK')).toBeNull();
  });

  it('passes policy link handlers when direct pay policy handlers are provided', () => {
    renderRenderer({
      isEnrollment: false,
      onPrivacyPress: jest.fn(),
      onRefundPress: jest.fn(),
    });

    expect(screen.getByText('HAS_TERMS_LINK')).toBeTruthy();
    expect(screen.getByText('HAS_PRIVACY_LINK')).toBeTruthy();
    expect(screen.getByText('HAS_REFUND_LINK')).toBeTruthy();
  });

  // ---- Error helper text ----

  it('shows the consent error when touched and an error exists', () => {
    renderRenderer({
      touched: { termsAccepted: true },
      errors: { termsAccepted: 'Required' },
    });
    expect(
      screen.getByText(/To proceed, please check this box/),
    ).toBeTruthy();
  });

  it('hides the error when the field has not been touched', () => {
    renderRenderer({
      touched: { termsAccepted: false },
      errors: { termsAccepted: 'Required' },
    });
    expect(
      screen.queryByText(/To proceed, please check this box/),
    ).toBeNull();
  });
});
