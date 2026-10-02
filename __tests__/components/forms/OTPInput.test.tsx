import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { TextInput } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import OTPInput from '../../../components/forms/OTPInput';
import { renderWithProviders } from '../../../utils/test-utils';

function renderOtp(overrides: Record<string, any> = {}) {
  const onCodeChange = overrides.onCodeChange ?? jest.fn();
  const utils = renderWithProviders(
    <PaperProvider>
      <OTPInput onCodeChange={onCodeChange} {...overrides} />
    </PaperProvider>,
  );
  return { ...utils, onCodeChange };
}

function getInputs() {
  return screen.UNSAFE_getAllByType(TextInput);
}

describe('OTPInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- Rendering ----

  it('renders the default number (6) of inputs', () => {
    renderOtp();
    expect(getInputs()).toHaveLength(6);
  });

  it('renders a custom number of inputs', () => {
    renderOtp({ length: 4 });
    expect(getInputs()).toHaveLength(4);
  });

  // ---- Typing ----

  it('calls onCodeChange with the digit typed in the first box', () => {
    const { onCodeChange } = renderOtp();
    fireEvent.changeText(getInputs()[0], '5');
    expect(onCodeChange).toHaveBeenLastCalledWith('5');
  });

  it('assembles the full code as digits are entered across boxes', () => {
    const { onCodeChange } = renderOtp({ length: 4 });
    const inputs = getInputs();
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    expect(onCodeChange).toHaveBeenLastCalledWith('123');
  });

  it('distributes pasted digits across the code', () => {
    const { onCodeChange } = renderOtp();
    onCodeChange.mockClear();
    fireEvent.changeText(getInputs()[0], '99');
    expect(onCodeChange).toHaveBeenLastCalledWith('99');
  });

  it('strips non-numeric characters', () => {
    const { onCodeChange } = renderOtp();
    fireEvent.changeText(getInputs()[0], 'a');
    expect(onCodeChange).toHaveBeenLastCalledWith('');
  });

  it('uses a numeric keyboard', () => {
    renderOtp();
    expect(getInputs()[0].props.keyboardType).toBe('number-pad');
  });

  // ---- Error state ----

  it('shows the provided error message', () => {
    renderOtp({ error: 'Code expired' });
    expect(screen.getByText('Code expired')).toBeTruthy();
  });

  it('calls onClearError when typing while an error is present', () => {
    const onClearError = jest.fn();
    renderOtp({ error: 'Bad code', onClearError });
    fireEvent.changeText(getInputs()[0], '1');
    expect(onClearError).toHaveBeenCalledTimes(1);
  });

  it('does not call onClearError when there is no error', () => {
    const onClearError = jest.fn();
    renderOtp({ onClearError });
    fireEvent.changeText(getInputs()[0], '1');
    expect(onClearError).not.toHaveBeenCalled();
  });
});
