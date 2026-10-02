import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { ResetPasswordRequest, ResetPasswordResponse, ResetPasswordWithTokenRequest, ResetPasswordWithTokenResponse } from "./resetPasswordTypes";

export const resetPasswordApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: API_PATHS.auth.resetPassword,
        method: 'POST',
        body: {
          ...body,
          platform: 'mobile',
        },
      }),
    }),
    resetPasswordWithToken: builder.mutation<ResetPasswordWithTokenResponse, ResetPasswordWithTokenRequest>({
      query: ({ token, code, newPassword }) => ({
        url: `${API_PATHS.auth.resetPasswordConfirm}`,
        method: 'POST',
        body: { code, password1: newPassword },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const { useResetPasswordMutation, useResetPasswordWithTokenMutation } = resetPasswordApi;
