import { DEFAULT_ENROLLMENT_COUNT } from '@/constants/enrollment';
import { API_PATHS } from '@/redux/apiPaths';
import { appApi } from '@/redux/appApi';
import { getEnrollmentKey } from '@/utils/enrollment';
import type { FetchBaseQueryError, FetchBaseQueryMeta, QueryReturnValue } from '@reduxjs/toolkit/query';
import type { EnrollmentsList, EnrollmentsQueryParams, EnrollmentsResponse } from './enrollmentTypes';

const getEnrollmentsQueryPath = (params?: EnrollmentsQueryParams | void): string => {
  const page = params?.page ?? 0;
  const count = params?.count ?? DEFAULT_ENROLLMENT_COUNT;
  const searchQuery = params?.searchQuery ?? '';

  return `${API_PATHS.enrollments.base}?page=${page}&count=${count}&searchQuery=${encodeURIComponent(searchQuery)}`;
};

export const transformEnrollmentsResponse = (
  data: EnrollmentsResponse,
  params?: EnrollmentsQueryParams | void,
): EnrollmentsList => ({
  items: data.enrollments ?? [],
  totalCount: data.pagination?.total ?? 0,
  currentPage: params?.page ?? 0,
  limit: data.pagination?.limit ?? params?.count ?? DEFAULT_ENROLLMENT_COUNT,
  offset: data.pagination?.offset ?? 0,
});

export const fetchAllEnrollments = async (
  baseQuery: (
    path: string,
  ) => QueryReturnValue<any, FetchBaseQueryError, FetchBaseQueryMeta>
    | PromiseLike<QueryReturnValue<any, FetchBaseQueryError, FetchBaseQueryMeta>>,
): Promise<QueryReturnValue<EnrollmentsList, FetchBaseQueryError, FetchBaseQueryMeta>> => {
  const enrollments = new Map<string, EnrollmentsResponse['enrollments'][number]>();
  const seenOffsets = new Set<number>();
  let page = 0;
  let count = DEFAULT_ENROLLMENT_COUNT;
  let totalCount = 0;

  while (true) {
    const result = await baseQuery(getEnrollmentsQueryPath({
      page,
      count,
      searchQuery: '',
    }));

    if (result.error) {
      return { error: result.error };
    }

    const response = (result.data ?? {}) as Partial<EnrollmentsResponse>;
    const pageItems = response.enrollments ?? [];
    const offset = response.pagination?.offset ?? 0;
    const limit = response.pagination?.limit ?? count;
    const total = response.pagination?.total ?? pageItems.length;

    if (seenOffsets.has(offset)) {
      break;
    }
    seenOffsets.add(offset);

    pageItems.forEach((enrollment, index) => {
      enrollments.set(getEnrollmentKey(enrollment, offset + index), enrollment);
    });

    totalCount = Math.max(totalCount, total);
    const loadedThrough = offset + pageItems.length;
    if (pageItems.length === 0 || loadedThrough >= total || limit <= 0) {
      break;
    }

    page += 1;
    count = limit;
  }

  return {
    data: {
      items: Array.from(enrollments.values()),
      totalCount,
      currentPage: 0,
      limit: count,
      offset: 0,
    },
  };
};

export const enrollmentApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnrollments: builder.query<EnrollmentsList, EnrollmentsQueryParams | void>({
      query: getEnrollmentsQueryPath,
      providesTags: ['Enrollments'],
      transformResponse: (data: EnrollmentsResponse, _, params) => transformEnrollmentsResponse(data, params),
    }),
    getMonthlyBillsEnrollments: builder.query<EnrollmentsList, void>({
      queryFn: async (_, __, ___, baseQuery) => fetchAllEnrollments((path) => baseQuery(path)),
      providesTags: ['Enrollments'],
    }),
  }),
});

export const { useGetEnrollmentsQuery, useGetMonthlyBillsEnrollmentsQuery } = enrollmentApi;
