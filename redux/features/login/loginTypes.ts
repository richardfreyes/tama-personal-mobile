import { JwtPayload } from "@/types";

export interface LoginState {
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  token: string | null;
  user: JwtPayload | null;
  error: string | null;
}

export const initialState: LoginState = {
  loading: 'idle',
  token: null,
  user: null,
  error: null,
};