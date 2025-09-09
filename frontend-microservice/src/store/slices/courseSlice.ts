import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course } from '@/types';

interface CourseState {
  step: number;
  course: Course | null;
  editCourse: boolean;
  enrollmentLoading: boolean;
}

const initialState: CourseState = {
  step: 1,
  course: null,
  editCourse: false,
  enrollmentLoading: false,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    setCourse: (state, action: PayloadAction<Course | null>) => {
      state.course = action.payload;
    },
    setEditCourse: (state, action: PayloadAction<boolean>) => {
      state.editCourse = action.payload;
    },
    setEnrollmentLoading: (state, action: PayloadAction<boolean>) => {
      state.enrollmentLoading = action.payload;
    },
    resetCourseState: (state) => {
      state.step = 1;
      state.course = null;
      state.editCourse = false;
    },
  },
});

export const {
  setStep,
  setCourse,
  setEditCourse,
  setEnrollmentLoading,
  resetCourseState,
} = courseSlice.actions;

export default courseSlice.reducer;
