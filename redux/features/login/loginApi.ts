import { decodeJwt } from '@/utils/jwt';
import { clearPaymentIntentKeys } from '@/utils/paymentIntentKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState, LoginState } from './loginTypes';

export const retrieveToken = createAsyncThunk<string | null>(
  'login/retrieveToken',
  async () => {
    try {
      let token = await SecureStore.getItemAsync('wiremo.token');
      if (!token) {
        token = await AsyncStorage.getItem('wiremo.token');
        if (token) {
          await SecureStore.setItemAsync('wiremo.token', token);
          await AsyncStorage.removeItem('wiremo.token');
        }
      }
      return token;
    } catch (error) {
      console.error("Failed to retrieve token from storage:", error);
      return null;
    }
  }
);

export const clearSession = createAsyncThunk('login/clearSession', async (_, { dispatch }) => {
  await SecureStore.deleteItemAsync('wiremo.token');
  await AsyncStorage.removeItem('wiremo.token');
  clearPaymentIntentKeys();
  dispatch(logout());
  dispatch({ type: 'RESET_APP_STATE' });
});

const loginSlice = createSlice({
  name: 'login',
  initialState: initialState as LoginState,
  reducers: {
    setToken: (state: LoginState, action: PayloadAction<string>) => {
      const token = action.payload;
      const user = decodeJwt(token);
      state.loading = 'succeeded';
      state.token = token;
      state.user = user;
      state.error = null;
      void SecureStore.setItemAsync('wiremo.token', token);
    },
    logout: (state: LoginState) => {
      state.token = null;
      state.user = null;
      state.loading = 'idle';
      state.error = null;
      void SecureStore.deleteItemAsync('wiremo.token');
      void AsyncStorage.removeItem('wiremo.token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(retrieveToken.fulfilled, (state, action) => {
        const token = action.payload;
        const user = token ? decodeJwt(token) : null;
        state.token = token;
        state.user = user;
        state.loading = token ? 'succeeded' : 'idle';
        state.error = null;
      })
      .addCase(retrieveToken.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(retrieveToken.rejected, (state) => {
        state.loading = 'failed';
        state.token = null;
        state.user = null;
      });
  },
});

export const { setToken, logout } = loginSlice.actions;
export const { reducer: loginReducer } = loginSlice;
export default loginReducer;
