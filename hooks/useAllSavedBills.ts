import { useGetAllBillsQuery } from '@/redux/features/bills/billsApi';
import { getSavedBillsForDisplay, getUniqueSavedBills, shouldUseMockSavedBills } from '@/utils/savedBills';
import { useMemo } from 'react';

export function useAllSavedBills({ skip = false }: { skip?: boolean } = {}) {
  const query = useGetAllBillsQuery(undefined, { skip });
  const isUsingMockBills = !skip && shouldUseMockSavedBills(query.data);
  const bills = useMemo(
    () => (skip ? [] : getUniqueSavedBills(getSavedBillsForDisplay(query.data))),
    [query.data, skip],
  );

  return {
    bills,
    isLoading: !skip && !isUsingMockBills && query.isLoading,
    isFetching: !skip && !isUsingMockBills && query.isFetching,
    isError: !skip && !isUsingMockBills && query.isError,
    refetch: query.refetch,
  };
}
