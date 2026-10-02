import { API_PATHS } from '@/redux/apiPaths';
import { appApi } from '@/redux/appApi';
import { setToken } from '../login/loginApi';
import { LoginCredentials, LoginResponse } from './authTypes';

export const authApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: API_PATHS.auth.login,
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (credentials, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.token) {
            dispatch(setToken(data.token));
          }
        } catch (error) {
          console.error("Login mutation failed:", error);
        }
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation } = authApi;
