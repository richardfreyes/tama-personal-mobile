import { API_PATHS } from "@/redux/apiPaths";
import { appApi } from "@/redux/appApi";
import { setToken } from "@/redux/features/login/loginApi";
import { ResendOtpResponse, SignupRequest, SignupResponse, VerifyOtpRequest, VerifyOtpResponse } from "./signupTypes";

export const signupApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (body) => ({
        url: API_PATHS.auth.signup,
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: ({ token, code }) => ({
        url: API_PATHS.auth.verifyEmail,
        method: 'POST',
        body: { code },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            dispatch(setToken(data.token));
          }
        } catch (error) {
          console.error("OTP Verification failed:", error);
        }
      },
      invalidatesTags: ['Auth'],
    }),
    resendOtp: builder.mutation<ResendOtpResponse, VerifyOtpRequest>({
      query: ({ token }) => ({
        url: API_PATHS.auth.resendOtp,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
    }),
  }),
});

export const { useSignupMutation, useVerifyOtpMutation, useResendOtpMutation } = signupApi;