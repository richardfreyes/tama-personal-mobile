import { renderWithProviders } from '@/utils/test-utils';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import InputValidationComponent from '../../../components/forms/InputValidationComponent';

const defaultProps = () => ({
  field: 'email',
  value: '',
  setValue: jest.fn(),
  placeholder: 'Enter email',
  errors: {} as Record<string, string | undefined>,
  setErrors: jest.fn(),
  touched: {} as Record<string, boolean>,
  setTouched: jest.fn(),
  validateField: jest.fn<(field: string, value: string, extra?: any) => string | undefined>(),
  extra: undefined as { selected?: string; passwordToMatch?: string } | undefined,
});

describe('InputValidationComponent', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // ---- Basic rendering ----

  it('renders with placeholder as label when label is not provided', () => {
    const props = defaultProps();
    renderWithProviders(<InputValidationComponent {...props} />);
    expect(screen.getAllByText('Enter email').length).toBeGreaterThan(0);
  });

  it('renders with label when provided', () => {
    const props = defaultProps();
    renderWithProviders(<InputValidationComponent {...props} label="Email Address" />);
    expect(screen.getAllByText('Email Address').length).toBeGreaterThan(0);
  });

  it('renders the current value', () => {
    const props = defaultProps();
    renderWithProviders(<InputValidationComponent {...props} value="test@example.com" />);
    expect(screen.getByDisplayValue('test@example.com')).toBeTruthy();
  });

  it('formats currency values for display without changing the stored value prop', () => {
    const props = defaultProps();
    props.field = 'Amount';
    props.value = '1000.50';
    renderWithProviders(<InputValidationComponent {...props} formatAsCurrency />);
    expect(screen.getByDisplayValue('1,000.50')).toBeTruthy();
  });

  // ---- Validation on text change ----

  it('calls setValue and validateField on text change', () => {
    const props = defaultProps();
    props.validateField.mockReturnValue(undefined);
    renderWithProviders(<InputValidationComponent {...props} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter email'), 'hello');

    expect(props.setValue).toHaveBeenCalledWith('hello');
    expect(props.validateField).toHaveBeenCalledWith('email', 'hello', undefined);
  });

  it('normalizes currency text changes before storing and validating', () => {
    const props = defaultProps();
    props.field = 'Amount';
    props.validateField.mockReturnValue(undefined);
    renderWithProviders(<InputValidationComponent {...props} formatAsCurrency />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter email'), '10,000.50abc');

    expect(props.setValue).toHaveBeenCalledWith('10000.50');
    expect(props.validateField).toHaveBeenCalledWith('Amount', '10000.50', undefined);
  });

  it('keeps the cursor at the end after appending to a formatted currency value', () => {
    jest.useFakeTimers();

    const CurrencyHarness = () => {
      const [value, setValue] = React.useState('1000');
      const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});

      return (
        <InputValidationComponent
          field="Amount"
          value={value}
          setValue={setValue}
          placeholder="Amount"
          errors={errors}
          setErrors={setErrors}
          touched={{}}
          setTouched={jest.fn()}
          validateField={() => undefined}
          formatAsCurrency
        />
      );
    };

    renderWithProviders(<CurrencyHarness />);

    const input = screen.getByDisplayValue('1,000');
    fireEvent(input, 'selectionChange', {
      nativeEvent: { selection: { start: 5, end: 5 } },
    });
    fireEvent.changeText(input, '1,0001');

    const updatedInput = screen.getByDisplayValue('10,001');
    expect(updatedInput.props.selection).toEqual({ start: 6, end: 6 });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByDisplayValue('10,001').props.selection).toBeUndefined();
    jest.useRealTimers();
  });

  it('sets error when validateField returns a message', () => {
    const props = defaultProps();
    props.validateField.mockReturnValue('Invalid email');
    renderWithProviders(<InputValidationComponent {...props} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter email'), 'bad');

    expect(props.setErrors).toHaveBeenCalledWith(expect.any(Function));
    const updater = (props.setErrors as jest.Mock).mock.calls[0][0] as Function;
    const result = updater({});
    expect(result).toEqual({ email: 'Invalid email' });
  });

  it('clears error when validateField returns undefined', () => {
    const props = defaultProps();
    props.validateField.mockReturnValue(undefined);
    renderWithProviders(<InputValidationComponent {...props} />);

    fireEvent.changeText(screen.getByPlaceholderText('Enter email'), 'valid@email.com');

    const updater = (props.setErrors as jest.Mock).mock.calls[0][0] as Function;
    const result = updater({ email: 'old error' });
    expect(result).toEqual({ email: undefined });
  });

  // ---- Error display ----

  it('shows error text when field is touched and has error', () => {
    const props = defaultProps();
    props.touched = { email: true };
    props.errors = { email: 'Email is required' };
    renderWithProviders(<InputValidationComponent {...props} />);
    expect(screen.getByText('Email is required')).toBeTruthy();
  });

  it('does not show error when field is not touched', () => {
    const props = defaultProps();
    props.touched = { email: false };
    props.errors = { email: 'Email is required' };
    renderWithProviders(<InputValidationComponent {...props} />);
    expect(screen.queryByText('Email is required')).toBeNull();
  });

  // ---- Secure text entry / password toggle ----

  it('renders eye icon for password fields', () => {
    const props = defaultProps();
    renderWithProviders(<InputValidationComponent {...props} secureTextEntry={true} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('toggles password visibility on eye icon press', async () => {
    const props = defaultProps();
    props.value = 'secret123';
    renderWithProviders(<InputValidationComponent {...props} secureTextEntry={true} />);

    const input = screen.getByDisplayValue('secret123');
    expect(input.props.secureTextEntry).toBe(true);

    const toggleButton = screen.getByRole('button');
    fireEvent.press(toggleButton);

    await waitFor(() => {
      const updatedInput = screen.getByDisplayValue('secret123');
      expect(updatedInput.props.secureTextEntry).toBe(false);
    });
  });

  // ---- Error icon takes precedence over password toggle ----

  it('shows error icon instead of eye icon when field has error', () => {
    const props = defaultProps();
    props.touched = { email: true };
    props.errors = { email: 'Required' };
    const { toJSON } = renderWithProviders(
      <InputValidationComponent {...props} secureTextEntry={true} />,
    );
    const json = JSON.stringify(toJSON());
    expect(json).not.toContain('"eye"');
    expect(json).not.toContain('"eye-off"');
  });

  // ---- maskOnBlur ----

  it('masks value when maskOnBlur is true and input is not focused', () => {
    const props = defaultProps();
    props.value = '1234567890';
    renderWithProviders(<InputValidationComponent {...props} maskOnBlur={true} />);
    expect(screen.getByDisplayValue('••••••7890')).toBeTruthy();
  });

  it('shows unmasked value when focused with maskOnBlur', () => {
    const props = defaultProps();
    props.value = '1234567890';
    renderWithProviders(<InputValidationComponent {...props} maskOnBlur={true} />);

    fireEvent(screen.getByDisplayValue('••••••7890'), 'focus');

    expect(screen.getByDisplayValue('1234567890')).toBeTruthy();
  });

  it('re-masks value on blur', () => {
    const props = defaultProps();
    props.value = '1234567890';
    renderWithProviders(<InputValidationComponent {...props} maskOnBlur={true} />);

    const input = screen.getByDisplayValue('••••••7890');
    fireEvent(input, 'focus');
    expect(screen.getByDisplayValue('1234567890')).toBeTruthy();

    fireEvent(screen.getByDisplayValue('1234567890'), 'blur');
    expect(screen.getByDisplayValue('••••••7890')).toBeTruthy();
  });

  it('does not mask when value is empty', () => {
    const props = defaultProps();
    props.value = '';
    renderWithProviders(<InputValidationComponent {...props} maskOnBlur={true} />);
    expect(screen.getByPlaceholderText('Enter email')).toBeTruthy();
  });

  // ---- Password cross-validation ----

  it('cross-validates confirmPassword when signupPassword changes', () => {
    const props = defaultProps();
    props.field = 'signupPassword';
    props.touched = { signupPassword: true, confirmPassword: true };
    props.extra = { passwordToMatch: 'oldpass' };
    props.validateField
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce('Passwords do not match');

    renderWithProviders(<InputValidationComponent {...props} />);
    fireEvent.changeText(screen.getByPlaceholderText('Enter email'), 'newpass');

    expect(props.validateField).toHaveBeenCalledTimes(2);
    expect(props.validateField).toHaveBeenNthCalledWith(1, 'signupPassword', 'newpass', props.extra);
    expect(props.validateField).toHaveBeenNthCalledWith(
      2,
      'confirmPassword',
      'oldpass',
      expect.objectContaining({ passwordToMatch: 'newpass', selected: 'oldpass' }),
    );
  });

  it('does not cross-validate when other password field is not touched', () => {
    const props = defaultProps();
    props.field = 'signupPassword';
    props.touched = { signupPassword: true, confirmPassword: false };
    props.extra = { passwordToMatch: 'oldpass' };
    props.validateField.mockReturnValue(undefined);

    renderWithProviders(<InputValidationComponent {...props} />);
    fireEvent.changeText(screen.getByPlaceholderText('Enter email'), 'newpass');

    expect(props.validateField).toHaveBeenCalledTimes(1);
  });

  // ---- Editable ----

  it('renders as non-editable when editable is false', () => {
    const props = defaultProps();
    props.value = 'readonly';
    renderWithProviders(<InputValidationComponent {...props} editable={false} />);
    const input = screen.getByDisplayValue('readonly');
    expect(input.props.editable).toBe(false);
  });
});
