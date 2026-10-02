import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import FilterAutopay from '../../../components/payments/FilterAutopay';
import { renderWithProviders } from '../../../utils/test-utils';

let capturedDatePickerProps: any = null;

jest.mock('react-native-paper-dates', () => ({
  DatePickerModal: (props: any) => {
    capturedDatePickerProps = props;
    if (!props.visible) return null;
    const RN = require('react-native');
    return (
      <RN.View testID="date-picker-modal">
        <RN.Text>Date Picker</RN.Text>
      </RN.View>
    );
  },
}));

const DEFAULT_PROPS = {
  onApply: jest.fn(),
  onReset: jest.fn(),
};

function renderFilter(overrides: Record<string, any> = {}) {
  return renderWithProviders(
    <PaperProvider>
      <FilterAutopay {...DEFAULT_PROPS} {...(overrides as any)} />
    </PaperProvider>,
  );
}

describe('FilterAutopay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedDatePickerProps = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---- Rendering ----

  it('renders the Filter header title', () => {
    renderFilter();
    expect(screen.getByText('Filter')).toBeTruthy();
  });

  it('renders the Status section title', () => {
    renderFilter();
    expect(screen.getByText('Status')).toBeTruthy();
  });

  it('renders all autopay status labels', () => {
    renderFilter();
    expect(screen.getByText('Successful')).toBeTruthy();
    expect(screen.getByText('Incomplete')).toBeTruthy();
    expect(screen.getByText('Cancelled')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.getByText('Declined')).toBeTruthy();
  });

  it('renders both transaction type options', () => {
    renderFilter();
    expect(screen.getByText('Transaction Type')).toBeTruthy();
    expect(screen.getByText('One Time Payment')).toBeTruthy();
    expect(screen.getByText('Enrollment')).toBeTruthy();
  });

  it('renders the Reset link in the section header and the Reset button', () => {
    renderFilter();
    expect(screen.getAllByText('Reset').length).toBeGreaterThanOrEqual(2);
  });

  it('renders the Apply button', () => {
    renderFilter();
    expect(screen.getByText('Apply')).toBeTruthy();
  });

  // ---- Status filter toggling ----

  it('includes a toggled-on status in the applied filters', () => {
    renderFilter();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({ statusFilters: ['successful'] }),
    );
  });

  it('removes a status when toggled off', () => {
    renderFilter();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    fireEvent.press(checkboxes[0]);
    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({ statusFilters: [] }),
    );
  });

  it('supports selecting multiple statuses', () => {
    renderFilter();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    fireEvent.press(checkboxes[2]);
    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({ statusFilters: ['successful', 'cancelled'] }),
    );
  });

  it('selects all five statuses', () => {
    renderFilter();
    const checkboxes = screen.getAllByRole('checkbox').slice(0, 5);
    checkboxes.forEach((cb) => fireEvent.press(cb));
    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        statusFilters: ['successful', 'incomplete', 'cancelled', 'uncaptured', 'declined'],
      }),
    );
  });

  // ---- Transaction type filter toggling ----

  it('applies the one-time payment transaction type filter', () => {
    renderFilter();
    fireEvent.press(screen.getByTestId('filter-transaction-type-oneTimePayment'));
    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({ transactionTypeFilters: ['oneTimePayment'] }),
    );
  });

  it('applies the enrollment transaction type filter', () => {
    renderFilter();
    fireEvent.press(screen.getByTestId('filter-transaction-type-enrollment'));
    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({ transactionTypeFilters: ['enrollment'] }),
    );
  });

  it('supports selecting both transaction types', () => {
    renderFilter();
    fireEvent.press(screen.getByTestId('filter-transaction-type-oneTimePayment'));
    fireEvent.press(screen.getByTestId('filter-transaction-type-enrollment'));
    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionTypeFilters: ['oneTimePayment', 'enrollment'],
      }),
    );
  });

  it('deselects only the targeted status without affecting others', () => {
    renderFilter();
    const checkboxes = screen.getAllByRole('checkbox');
    // Select first three
    fireEvent.press(checkboxes[0]);
    fireEvent.press(checkboxes[1]);
    fireEvent.press(checkboxes[2]);
    // Deselect the middle one
    fireEvent.press(checkboxes[1]);
    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({ statusFilters: ['successful', 'cancelled'] }),
    );
  });

  // ---- Apply ----

  it('calls onApply with the correct default filter shape when nothing is selected', () => {
    renderFilter();
    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledTimes(1);
    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith({
      statusFilters: [],
      transactionTypeFilters: [],
      createdAtRange: '',
      project: '',
      paymentType: '',
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('includes both status filters and date range in the applied output', () => {
    renderFilter();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);

    act(() => {
      capturedDatePickerProps?.onConfirm({
        startDate: new Date('2025-06-01T00:00:00.000Z'),
        endDate: new Date('2025-06-30T00:00:00.000Z'),
      });
    });

    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith({
      statusFilters: ['successful'],
      transactionTypeFilters: [],
      createdAtRange: '2025-06-01 ~ 2025-06-30',
      project: '',
      paymentType: '',
      startDate: '2025-06-01T00:00:00.000Z',
      endDate: '2025-06-30T00:00:00.000Z',
    });
  });

  // ---- Date range ----

  it('does not show the date picker on initial render', () => {
    renderFilter();
    expect(screen.queryByTestId('date-picker-modal')).toBeNull();
  });

  it('passes the date picker mode as range', () => {
    renderFilter();
    expect(capturedDatePickerProps.mode).toBe('range');
  });

  it('includes the confirmed date range in the applied filters', () => {
    renderFilter();

    act(() => {
      capturedDatePickerProps?.onConfirm({
        startDate: new Date('2025-01-15T00:00:00.000Z'),
        endDate: new Date('2025-01-31T00:00:00.000Z'),
      });
    });

    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAtRange: '2025-01-15 ~ 2025-01-31',
        startDate: '2025-01-15T00:00:00.000Z',
        endDate: '2025-01-31T00:00:00.000Z',
      }),
    );
  });

  it('keeps the date range empty when the date picker is dismissed', () => {
    renderFilter();

    act(() => {
      capturedDatePickerProps?.onDismiss();
    });

    fireEvent.press(screen.getByText('Apply'));

    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAtRange: '',
        startDate: undefined,
        endDate: undefined,
      }),
    );
  });

  // ---- Reset ----

  it('calls onReset when the bottom Reset button is pressed', () => {
    renderFilter();
    const resetButtons = screen.getAllByText('Reset');
    fireEvent.press(resetButtons[resetButtons.length - 1]);
    expect(DEFAULT_PROPS.onReset).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when the section-header Reset link is pressed', () => {
    renderFilter();
    const resetButtons = screen.getAllByText('Reset');
    fireEvent.press(resetButtons[0]);
    expect(DEFAULT_PROPS.onReset).toHaveBeenCalledTimes(1);
  });

  it('clears selected statuses and date range after Reset', () => {
    renderFilter();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    fireEvent.press(checkboxes[1]);
    fireEvent.press(screen.getByTestId('filter-transaction-type-enrollment'));

    act(() => {
      capturedDatePickerProps?.onConfirm({
        startDate: new Date('2025-03-01T00:00:00.000Z'),
        endDate: new Date('2025-03-31T00:00:00.000Z'),
      });
    });

    // Verify something was selected
    fireEvent.press(screen.getByText('Apply'));
    expect(DEFAULT_PROPS.onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        statusFilters: ['successful', 'incomplete'],
        transactionTypeFilters: ['enrollment'],
        startDate: '2025-03-01T00:00:00.000Z',
      }),
    );

    // Now reset
    const resetButtons = screen.getAllByText('Reset');
    fireEvent.press(resetButtons[resetButtons.length - 1]);

    // Apply again to confirm everything is cleared
    fireEvent.press(screen.getByText('Apply'));
    expect(DEFAULT_PROPS.onApply).toHaveBeenLastCalledWith({
      statusFilters: [],
      transactionTypeFilters: [],
      createdAtRange: '',
      project: '',
      paymentType: '',
      startDate: undefined,
      endDate: undefined,
    });
  });

  // ---- Edge cases ----

  it('renders without crashing', () => {
    const { toJSON } = renderFilter();
    expect(toJSON()).toBeTruthy();
  });
});
