import type { Enrollment } from '@/types/enrollment';

export interface EnrollmentSelectionState {
  selectedEnrollment: Enrollment | null;
}

export const initialState: EnrollmentSelectionState = {
  selectedEnrollment: null,
};
