import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type User } from '@/types'; 
import { type RootState } from '@/store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');

  try {
    if (token && userStr) {
      const user = JSON.parse(userStr) as User;
      return { token, user, isAuthenticated: true };
    }
  } catch (e) {
    console.error("Error parsing user from local storage", e);
  }

  return { token: null, user: null, isAuthenticated: false };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem('accessToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export const selectCurrentUser = (state: RootState): User | null => state.auth.user;
export const selectIsAuthenticated = (state: RootState): boolean => state.auth.isAuthenticated;

export default authSlice.reducer;