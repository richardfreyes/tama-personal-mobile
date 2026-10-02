import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { fetchLookupOptions } from "@/redux/features/lookupOptions/lookupOptions";
import { AppBaseQuery, FormField, LookupOptionsPayload } from "./billerFormTypes";

export const formApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchFormConfig: builder.query<FormField[], number>({
      query: (billerId) => API_PATHS.bills.getBiller(billerId),
    }),
    fetchLookupOptions: builder.query<Record<string, any>, LookupOptionsPayload>({
      async queryFn({ billerId, formConfig }, api, extra, baseQuery: AppBaseQuery) {
        return await fetchLookupOptions({
          id: billerId,
          formConfig,
          source: "app",
            baseQuery: async (...args: Parameters<typeof baseQuery>) => {
              return await baseQuery(...args);
            },
          api,
          extra,
        });
      },
      providesTags: ['BillerFormConfig'],
    }),
  }),
  overrideExisting: true,
});

export const { useFetchFormConfigQuery, useFetchLookupOptionsQuery } = formApi;
