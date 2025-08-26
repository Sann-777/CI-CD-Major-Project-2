import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, SignupData } from '@/types';

const initialState: AuthState = {
  signupData: null,
  loading: false,
  token: localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token')!) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSignupData: (state, action: PayloadAction<SignupData>) => {
      state.signupData = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('token', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('token');
      }
    },
    resetAuth: (state) => {
      state.signupData = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setSignupData, setLoading, setToken, resetAuth } = authSlice.actions;
export default authSlice.reducer;
