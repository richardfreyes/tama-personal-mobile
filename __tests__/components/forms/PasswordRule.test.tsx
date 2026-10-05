import { Colors } from '@/styles/common/colors';
import { describe, expect, it } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import React from 'react';
import PasswordRule from '../../../components/forms/PasswordRule';
import { renderWithProviders } from '../../../utils/test-utils';

describe('PasswordRule', () => {

  it('renders the rule text', () => {
    renderWithProviders(<PasswordRule text="At least 8 characters" valid={false} />);
    expect(screen.getByText('At least 8 characters')).toBeTruthy();
  });

  it('uses the success colour for the icon when valid', () => {
    const { toJSON } = renderWithProviders(
      <PasswordRule text="Has a number" valid />,
    );
    expect(JSON.stringify(toJSON())).toContain(Colors.success09);
  });

  it('uses the neutral colour for the icon when invalid', () => {
    const { toJSON } = renderWithProviders(
      <PasswordRule text="Has a number" valid={false} />,
    );
    expect(JSON.stringify(toJSON())).toContain(Colors.neutral03);
  });

  it('renders the check icon (mocked svg)', () => {
    const { toJSON } = renderWithProviders(
      <PasswordRule text="Has a symbol" valid />,
    );
    expect(JSON.stringify(toJSON())).toContain('SvgMock');
  });
});
