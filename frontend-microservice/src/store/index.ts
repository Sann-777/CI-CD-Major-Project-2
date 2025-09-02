import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authSlice from './slices/authSlice';
import profileSlice from './slices/profileSlice';
import cartSlice from './slices/cartSlice';
import courseSlice from './slices/courseSlice';
import viewCourseSlice from './slices/viewCourseSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    profile: profileSlice,
    cart: cartSlice,
    course: courseSlice,
    viewCourse: viewCourseSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: (import.meta as any).env?.DEV || process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed dispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();
