import { describe, expect, it } from '@jest/globals';
import reducer, {
  clearSelectedEnrollment,
  setSelectedEnrollment,
} from '../../../redux/features/enrollmentSelection/enrollmentSelectionSlice';

describe('enrollmentSelectionSlice', () => {
  it('selects and clears an enrollment without modifying its data', () => {
    const enrollment = {
      referenceId: 'ENR-001',
      customFields: { unit: '18-A' },
    };
    const selectedState = reducer(undefined, setSelectedEnrollment(enrollment));

    expect(selectedState.selectedEnrollment).toEqual(enrollment);
    expect(reducer(selectedState, clearSelectedEnrollment()).selectedEnrollment).toBeNull();
  });
});
