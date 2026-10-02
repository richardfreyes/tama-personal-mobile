import { describe, expect, it } from '@jest/globals';
import EnrollmentStatusBadge from '@/components/enrollments/EnrollmentStatusBadge';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

describe('EnrollmentStatusBadge', () => {
  it.each([
    ['failed_payment', 'Failed Payment'],
    ['processing', 'Processing'],
    ['active', 'Active'],
    ['on hold', 'On Hold'],
    ['unrecognized_status', 'Unrecognized Status'],
    [null, 'Status unavailable'],
  ])('renders a readable label for %s', (status, label) => {
    render(<EnrollmentStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeTruthy();
  });

  it('supports summary-card presentation without changing the label', () => {
    render(<EnrollmentStatusBadge status="successful" variant="summaryCard" />);
    expect(screen.getByText('Successful')).toBeTruthy();
  });
});
