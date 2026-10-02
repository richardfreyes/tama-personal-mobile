import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import AutoPayStatusCard from '../../../components/bills/AutoPayStatusCard';

describe('AutoPayStatusCard', () => {
  it('renders the AutoPay section, active status, and enrollment count', () => {
    render(<AutoPayStatusCard activeCount={3} onManage={jest.fn()} />);
    expect(screen.getByText('Auto Debit')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('3 active enrollments')).toBeTruthy();
    expect(screen.getByText('View Auto Debit')).toBeTruthy();
  });

  it('uses the singular label for a single enrollment', () => {
    render(<AutoPayStatusCard activeCount={1} onManage={jest.fn()} />);
    expect(screen.getByText('1 active enrollment')).toBeTruthy();
  });

  it('calls onManage when Manage AutoPay is pressed', () => {
    const onManage = jest.fn();
    render(<AutoPayStatusCard activeCount={2} onManage={onManage} />);
    fireEvent.press(screen.getByText('View Auto Debit'));
    expect(onManage).toHaveBeenCalledTimes(1);
  });
});
