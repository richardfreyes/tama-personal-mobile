import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import EnrollmentResultScreen from '@/app/(app)/bills/enrollments/result';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock<(...args: any[]) => any>;

describe('EnrollmentResultScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it.each([
    ['success', 'Enrollment verification complete', 'Back to Home', '/dashboard'],
    ['cancelled', 'Enrollment verification cancelled', 'Return to Enrollments', '/bills/enrollments'],
    ['failed', 'Enrollment verification failed', 'Return to Enrollments', '/bills/enrollments'],
  ])('renders and routes the %s outcome', (outcome, title, button, route) => {
    mockUseLocalSearchParams.mockReturnValue({ outcome, message: 'Callback message' });
    render(<EnrollmentResultScreen />);
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText('Callback message')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: button }));
    expect(router.replace).toHaveBeenCalledWith(route);
  });

  it('normalizes array parameters and supplies the default failure message', () => {
    mockUseLocalSearchParams.mockReturnValue({ outcome: ['unexpected'] });
    render(<EnrollmentResultScreen />);
    expect(screen.getByText('Enrollment verification failed')).toBeTruthy();
    expect(screen.getByText('Card verification failed. Please try again.')).toBeTruthy();
  });
});
