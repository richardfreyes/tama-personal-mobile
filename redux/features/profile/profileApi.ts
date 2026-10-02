import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { LoginResponse } from "../auth/authTypes";
import { setToken } from "../login/loginApi";
import { CustomerData, ProfileResponse, UpdateAddressRequest, UpdateAddressResponse, UpdateProfileRequest } from "./profileTypes";

export const profileApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfileData: builder.query<CustomerData, void>({
      query: () => API_PATHS.settings.individual,
      providesTags: ['Profile'],
      transformResponse: (response: ProfileResponse) => response.customer
    }),

    updateProfile: builder.mutation<LoginResponse, UpdateProfileRequest>({
      query: (body) => ({
        url: API_PATHS.settings.updateProfile,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            dispatch(setToken(data.token));
          }
        } catch (error) {
          console.error("Update profile mutation failed:", error);
        }
      },
    }),
    updateAddress: builder.mutation<UpdateAddressResponse, UpdateAddressRequest>({
      query: (body) => ({
        url: API_PATHS.settings.updateAddress,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'], 
    }),
  }),
});

export const { 
  useGetProfileDataQuery, 
  useUpdateProfileMutation,
  useUpdateAddressMutation
} = profileApi;
