import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
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

export const { useGetBillsQuery, useAddBillMutation, useDeleteBillMutation } = billsApi;