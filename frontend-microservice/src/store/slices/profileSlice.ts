import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProfileState, User } from '@/types';

const initialState: ProfileState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  loading: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    resetProfile: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
  },
});

export const { setUser, setLoading, updateProfile, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
