import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, Section, CourseProgress } from '@/types';

interface ViewCourseState {
  courseSectionData: Section[];
  courseEntireData: Course | null;
  completedLectures: string[];
  totalNoOfLectures: number;
  courseName: string;
  courseProgress: CourseProgress | null;
}

const initialState: ViewCourseState = {
  courseSectionData: [],
  courseEntireData: null,
  completedLectures: [],
  totalNoOfLectures: 0,
  courseName: '',
  courseProgress: null,
};

const viewCourseSlice = createSlice({
  name: 'viewCourse',
  initialState,
  reducers: {
    setCourseSectionData: (state, action: PayloadAction<Section[]>) => {
      state.courseSectionData = action.payload;
    },
    setCourseEntireData: (state, action: PayloadAction<Course>) => {
      state.courseEntireData = action.payload;
      state.courseName = action.payload.courseName;
    },
    setTotalNoOfLectures: (state, action: PayloadAction<number>) => {
      state.totalNoOfLectures = action.payload;
    },
    setCompletedLectures: (state, action: PayloadAction<string[]>) => {
      state.completedLectures = action.payload;
    },
    setCourseProgress: (state, action: PayloadAction<CourseProgress>) => {
      state.courseProgress = action.payload;
      state.completedLectures = action.payload.completedVideos;
    },
    updateCompletedLectures: (state, action: PayloadAction<string>) => {
      const lectureId = action.payload;
      if (!state.completedLectures.includes(lectureId)) {
        state.completedLectures.push(lectureId);
      }
    },
    resetViewCourse: (state) => {
      state.courseSectionData = [];
      state.courseEntireData = null;
      state.completedLectures = [];
      state.totalNoOfLectures = 0;
      state.courseName = '';
      state.courseProgress = null;
    },
  },
});

export const {
  setCourseSectionData,
  setCourseEntireData,
  setTotalNoOfLectures,
  setCompletedLectures,
  setCourseProgress,
  updateCompletedLectures,
  resetViewCourse,
} = viewCourseSlice.actions;

export default viewCourseSlice.reducer;
