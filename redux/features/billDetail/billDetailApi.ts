import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { BillDetail, BillDetailResponse } from "./billDetailTypes";

export const billDetailApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillDetail: builder.query<BillDetail, string>({
      query: (billingReferenceId) => API_PATHS.bills.getDetail(billingReferenceId),
      providesTags: ['BillDetail'],
      transformResponse: (response: BillDetailResponse) => response.bill,
    })
  })
});

export const { useGetBillDetailQuery } = billDetailApi;