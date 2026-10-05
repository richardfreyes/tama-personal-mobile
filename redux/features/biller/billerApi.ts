import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { Biller, BillersResponse, GetBillersParams, QueryValue } from "./billerTypes";

export const billerApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillers: builder.query<Biller[], GetBillersParams>({
      query: (params) => {
        const queryParams: string[] = [];
        const getSingleValue = (value: QueryValue): string | number | undefined => {
          if (Array.isArray(value)) {
            return value[0]; 
          }
          return value;
        };

        const searchTerm = getSingleValue(params.search);
        if (searchTerm !== undefined && searchTerm !== null) {
          const searchString = String(searchTerm);
          queryParams.push(`search=${encodeURIComponent(searchString)}`);
        }

        const categoryValue = getSingleValue(params.category);
        if (categoryValue !== undefined && categoryValue !== null) {
          const categoryString = String(categoryValue);
          const categoryId = parseInt(categoryString, 10);

          if (!isNaN(categoryId)) {
            queryParams.push(`category=${categoryId}`);
          }
        }

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

        return `${API_PATHS.dashboard.biller}${queryString}`;
      },
      providesTags: ['Billers'],

      transformResponse: (response: BillersResponse) => {
        return response.billers || [];
      },
    }),
  })
});

export const { useGetBillersQuery } = billerApi;