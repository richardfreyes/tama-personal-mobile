import type { Enrollment } from '@/types/enrollment';

export interface EnrollmentsPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface EnrollmentsResponse {
  enrollments: Enrollment[];
  pagination: EnrollmentsPagination;
}

export interface EnrollmentsQueryParams {
  page?: number;
  count?: number;
  searchQuery?: string;
}

export interface EnrollmentsList {
  items: Enrollment[];
  totalCount: number;
  currentPage: number;
  limit: number;
  offset: number;
}
