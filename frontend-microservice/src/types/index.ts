// User and Authentication Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: 'Student' | 'Instructor' | 'Admin';
  active: boolean;
  approved: boolean;
  additionalDetails: UserProfile;
  courses: string[];
  image: string;
  courseProgress: string[];
  token?: string;
}

export interface UserProfile {
  _id?: string;
  gender?: string;
  dateOfBirth?: string;
  about?: string;
  contactNumber?: string;
}

export interface AuthState {
  signupData: SignupData | null;
  loading: boolean;
  token: string | null;
}

export interface ProfileState {
  user: User | null;
  loading: boolean;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: string;
  otp: string;
}

// Course Types
export interface Course {
  _id: string;
  courseName: string;
  courseDescription: string;
  instructor: User;
  whatYouWillLearn: string;
  courseContent: Section[];
  ratingAndReviews: RatingAndReview[];
  price: number;
  thumbnail: string;
  tag: string[];
  category: Category;
  studentsEnroled: string[];
  instructions: string[];
  status: 'Draft' | 'Published';
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  _id: string;
  sectionName: string;
  subSection: SubSection[];
}

export interface SubSection {
  _id: string;
  title: string;
  timeDuration: string;
  description: string;
  videoUrl: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  courses: string[];
}

export interface RatingAndReview {
  _id: string;
  user: User;
  rating: number;
  review: string;
  course: string;
  createdAt: string;
}

// Cart and Payment Types
export interface CartItem {
  _id: string;
  course: Course;
  quantity: number;
}

export interface CartState {
  cart: Course[];
  total: number;
  totalItems: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  message: string;
}

export interface CourseFormData {
  courseName: string;
  courseDescription: string;
  price: number;
  tag: string[];
  category: string;
  whatYouWillLearn: string;
  instructions: string[];
  thumbnail: File | null;
  status: 'Draft' | 'Published';
}

// Service Configuration Types
export interface ServiceConfig {
  name: string;
  url: string;
  endpoints: string[];
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Record<string, string>;
}

// UI Component Types
export interface TabData {
  id: string;
  tabName: string;
  type: string;
}

export interface HighlightText {
  text: string;
  highlight: boolean;
}

// Course Progress Types
export interface CourseProgress {
  _id: string;
  courseID: string;
  userId: string;
  completedVideos: string[];
  progressPercentage: number;
}

// Notification Types
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// Constants
export const ACCOUNT_TYPE = {
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin',
} as const;

export const COURSE_STATUS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
} as const;
