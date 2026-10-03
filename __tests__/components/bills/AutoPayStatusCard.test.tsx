import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import AutoPayStatusCard from '../../../components/bills/AutoPayStatusCard';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));

describe('AutoPayStatusCard', () => {
  it('shows the active status and enrollment count', () => {
    render(<AutoPayStatusCard activeCount={3} onManage={jest.fn()} />);
    expect(screen.getByText('3 active enrollments')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('Your eligible bills are paid automatically on their due dates.')).toBeTruthy();
    expect(screen.queryByText('Not enrolled')).toBeNull();
  });

  it('uses the singular label for a single enrollment', () => {
    render(<AutoPayStatusCard activeCount={1} onManage={jest.fn()} />);
    expect(screen.getByText('1 active enrollment')).toBeTruthy();
  });

  it('shows that nothing is enrolled when there are no active enrollments', () => {
    render(<AutoPayStatusCard activeCount={0} onManage={jest.fn()} />);
    expect(screen.getByText('No active enrollments')).toBeTruthy();
    expect(screen.getByText('Not enrolled')).toBeTruthy();
    expect(screen.queryByText('Active')).toBeNull();
  });

  it('opens Auto Debit when the whole card is pressed', () => {
    const onManage = jest.fn();
    render(<AutoPayStatusCard activeCount={2} onManage={onManage} />);
    fireEvent.press(screen.getByRole('button', { name: 'View Auto Debit' }));
    expect(onManage).toHaveBeenCalledTimes(1);
  });
});
