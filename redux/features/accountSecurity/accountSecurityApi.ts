import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { setToken } from "../login/loginApi";
import { ChangeEmailConfirmRequest, ChangeEmailConfirmResponse, UpdateEmailRequest, UpdateEmailResponse, UpdatePasswordRequest, UpdatePasswordResponse } from "./accountSecurityTypes";

export const accountSecurityApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    updateEmail: builder.mutation<UpdateEmailResponse, UpdateEmailRequest>({
      query: (body) => ({
        url: API_PATHS.settings.updateEmail,
        method: 'POST',
        body: {
          ...body,
          platform: 'mobile',
        },
      }),
      invalidatesTags: ['Profile'], 
    }),
    updatePassword: builder.mutation<UpdatePasswordResponse, UpdatePasswordRequest>({
      query: (body) => ({
        url: API_PATHS.settings.updatePassword,
        method: 'PUT',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            dispatch(setToken(data.token));
          }
        } catch (error) {
          console.error("Update password mutation failed:", error);
        }
      },
    }),
    changeEmailConfirm: builder.mutation<ChangeEmailConfirmResponse, ChangeEmailConfirmRequest>({
      query: (body) => ({
        url: API_PATHS.settings.updateEmailConfirm,
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const { useUpdateEmailMutation, useUpdatePasswordMutation, useChangeEmailConfirmMutation } = accountSecurityApi;