import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { getUniqueSavedBills } from "@/utils/savedBills";
import { AddBillRequest, AddBillResponse, Bill, BillsResponse, DeleteBillResponse } from "./billsTypes";

export const billsApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query<Bill[], {page: number}>({
      query: ({ page }) => `${API_PATHS.bills.base}?page=${page}`,
      providesTags: ['Bills'],
      transformResponse: (response: BillsResponse) => {
        return response?.bills || [];
      },
    }),
    getAllBills: builder.query<Bill[], void>({
      async queryFn(_argument, _api, _extraOptions, baseQuery) {
        let bills: Bill[] = [];

        for (let page = 0; ; page += 1) {
          const result = await baseQuery(`${API_PATHS.bills.base}?page=${page}`);
          if (result.error) {
            return { error: result.error };
          }

          const pageBills = (result.data as BillsResponse | undefined)?.bills ?? [];
          const uniqueBills = getUniqueSavedBills([...bills, ...pageBills]);
          if (pageBills.length === 0 || uniqueBills.length === bills.length) {
            return { data: bills };
          }

          bills = uniqueBills;
        }
      },
      providesTags: ['Bills'],
    }),
    addBill: builder.mutation<AddBillResponse, AddBillRequest>({
      query: (body) => ({
        url: API_PATHS.bills.base,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Bills'], 
    }),
    deleteBill: builder.mutation<DeleteBillResponse, number>({
      query: (billingId) => ({
        url: `/bills/${billingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bills'], 
    }),
  })
});

export const { useGetBillsQuery, useGetAllBillsQuery, useAddBillMutation, useDeleteBillMutation } = billsApi;
