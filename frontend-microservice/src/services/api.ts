import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API configuration - Use empty string for relative URLs in Docker
// In Docker, nginx proxy handles /api requests, so use empty baseURL
const BASE_URL = '';

// Create axios instance
const apiConnector: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiConnector.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiConnector.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Only redirect on 401 if it's NOT a login attempt
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Don't show toast in interceptor - let individual API functions handle their own messages
    // This prevents duplicate toasts
    
    return Promise.reject(error);
  }
);

// API endpoints configuration
export const endpoints = {
  // Auth Service Endpoints
  AUTH: {
    SENDOTP_API: '/api/v1/auth/sendotp',
    SIGNUP_API: '/api/v1/auth/signup',
    LOGIN_API: '/api/v1/auth/login',
    RESETPASSTOKEN_API: '/api/v1/auth/reset-password-token',
    RESETPASSWORD_API: '/api/v1/auth/reset-password',
    CHANGEPASSWORD_API: '/api/v1/auth/changepassword',
  },
  
  // Profile Service Endpoints
  PROFILE: {
    GET_USER_DETAILS_API: '/api/v1/profile/getUserDetails',
    GET_USER_ENROLLED_COURSES_API: '/api/v1/profile/getEnrolledCourses',
    UPDATE_PROFILE_API: '/api/v1/profile/updateProfile',
    UPDATE_DISPLAY_PICTURE_API: '/api/v1/profile/updateDisplayPicture',
    DELETE_PROFILE_API: '/api/v1/profile/deleteProfile',
    GET_INSTRUCTOR_DATA_API: '/api/v1/profile/instructorDashboard',
  },
  
  // Course Service Endpoints
  COURSE: {
    GET_ALL_COURSE_API: '/api/v1/course/getAllCourses',
    COURSE_DETAILS_API: '/api/v1/course/getCourseDetails',
    EDIT_COURSE_API: '/api/v1/course/editCourse',
    CREATE_COURSE_API: '/api/v1/course/createCourse',
    DELETE_COURSE_API: '/api/v1/course/deleteCourse',
    GET_INSTRUCTOR_COURSES_API: '/api/v1/course/getInstructorCourses',
    GET_FULL_COURSE_DETAILS_AUTHENTICATED: '/api/v1/course/getFullCourseDetails',
    LECTURE_COMPLETION_API: '/api/v1/course/updateCourseProgress',
    CREATE_SECTION_API: '/api/v1/course/addSection',
    CREATE_SUBSECTION_API: '/api/v1/course/addSubSection',
    UPDATE_SECTION_API: '/api/v1/course/updateSection',
    UPDATE_SUBSECTION_API: '/api/v1/course/updateSubSection',
    DELETE_SECTION_API: '/api/v1/course/deleteSection',
    DELETE_SUBSECTION_API: '/api/v1/course/deleteSubSection',
  },
  
  // Category Endpoints
  CATEGORIES: {
    CATEGORIES_API: '/api/v1/category/showAllCategories',
    CREATE_CATEGORY_API: '/api/v1/category/createCategory',
    CATEGORY_PAGE_DETAILS_API: '/api/v1/category/getCategoryPageDetails',
  },
  
  // Rating and Review Endpoints
  RATING: {
    REVIEWS_DETAILS_API: '/api/v1/rating/getReviews',
    CREATE_RATING_API: '/api/v1/rating/createRating',
    GET_AVERAGE_RATING_API: '/api/v1/rating/getAverageRating',
  },
  
  
  // Contact and Notification Endpoints
  CONTACT: {
    CONTACT_US_API: '/api/v1/reach/contact',
  },
  
  // Media Upload Endpoints
  MEDIA: {
    UPLOAD_API: '/api/v1/media/upload',
    UPLOAD_VIDEO_API: '/api/v1/media/upload-video',
  },
  
  // Service Discovery
  SERVICES: {
    GET_SERVICES_API: '/api/services',
    HEALTH_CHECK_API: '/health',
  },
};

// Legacy API connector function for backward compatibility
export const apiConnectorLegacy = async (
  method: string,
  url: string,
  data?: any,
  headers?: any
) => {
  try {
    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      data,
      headers,
    };
    return await apiConnector(config);
  } catch (error) {
    throw error;
  }
};

// Generic API call function
export const apiCall = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiConnector({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Service health check
export const checkServiceHealth = async () => {
  try {
    const response = await apiConnector.get(endpoints.SERVICES.HEALTH_CHECK_API);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Get available services
export const getAvailableServices = async () => {
  try {
    const response = await apiConnector.get(endpoints.SERVICES.GET_SERVICES_API);
    return response.data;
  } catch (error) {
    console.error('Failed to get services:', error);
    throw error;
  }
};

export { apiConnector };
