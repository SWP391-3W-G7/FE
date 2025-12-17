import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type User } from '@/types'; 
import { type RootState } from '@/store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      const user = JSON.parse(userStr) as User;
      if (user && user.id) {
        return { token, user, isAuthenticated: true };
      }
    }
  } catch (e) {
    console.error("Error parsing user from local storage", e);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  return { token: null, user: null, isAuthenticated: false };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      
      // Ensure user has id, use email as fallback
      const userWithId = {
        ...user,
        id: user.id || (user as any).email || 'unknown',
      };
      
      state.user = userWithId;
      state.token = token;
      state.isAuthenticated = true;

      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userWithId));
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