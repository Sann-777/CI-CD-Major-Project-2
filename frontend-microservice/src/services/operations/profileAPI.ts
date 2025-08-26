import { Dispatch } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { apiConnector, endpoints } from '../api'
import { setUser, setLoading } from '@/store/slices/profileSlice'
import { logout } from './authAPI'

const {
  GET_USER_DETAILS_API,
  GET_USER_ENROLLED_COURSES_API,
  UPDATE_PROFILE_API,
  UPDATE_DISPLAY_PICTURE_API,
  DELETE_PROFILE_API,
  GET_INSTRUCTOR_DATA_API,
} = endpoints.PROFILE

export function getUserDetails(token: string, navigate: any) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Loading...')
    dispatch(setLoading(true))
    try {
      const response = await apiConnector('GET', GET_USER_DETAILS_API, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('GET_USER_DETAILS API RESPONSE............', response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      
      const userImage = response.data.data.image
        ? response.data.data.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.data.firstName} ${response.data.data.lastName}`
      
      dispatch(setUser({ ...response.data.data, image: userImage }))
    } catch (error: any) {
      dispatch(logout(navigate))
      console.log('GET_USER_DETAILS API ERROR............', error)
      toast.error('Could Not Get User Details')
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

export async function getUserEnrolledCourses(token: string) {
  const toastId = toast.loading('Loading...')
  let result = []
  try {
    console.log('BEFORE Calling BACKEND API FOR ENROLLED COURSES')
    const response = await apiConnector(
      'GET',
      GET_USER_ENROLLED_COURSES_API,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    console.log('AFTER Calling BACKEND API FOR ENROLLED COURSES')

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data
  } catch (error: any) {
    console.log('GET_USER_ENROLLED_COURSES_API API ERROR............', error)
    toast.error('Could Not Get Enrolled Courses')
  }
  toast.dismiss(toastId)
  return result
}

export function updateProfile(token: string, formData: any) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Loading...')
    try {
      const response = await apiConnector('PUT', UPDATE_PROFILE_API, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('UPDATE_PROFILE_API API RESPONSE............', response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      
      const userImage = response.data.updatedUserDetails.image
        ? response.data.updatedUserDetails.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.updatedUserDetails.firstName} ${response.data.updatedUserDetails.lastName}`
      
      dispatch(
        setUser({ ...response.data.updatedUserDetails, image: userImage })
      )
      toast.success('Profile Updated Successfully')
    } catch (error: any) {
      console.log('UPDATE_PROFILE_API API ERROR............', error)
      toast.error('Could Not Update Profile')
    }
    toast.dismiss(toastId)
  }
}

export function updateDisplayPicture(token: string, formData: FormData) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Loading...')
    try {
      const response = await apiConnector(
        'PUT',
        UPDATE_DISPLAY_PICTURE_API,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log('UPDATE_DISPLAY_PICTURE_API API RESPONSE............', response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success('Display Picture Updated Successfully')
      dispatch(setUser(response.data.data))
    } catch (error: any) {
      console.log('UPDATE_DISPLAY_PICTURE_API API ERROR............', error)
      toast.error('Could Not Update Display Picture')
    }
    toast.dismiss(toastId)
  }
}

export function deleteProfile(token: string, navigate: any) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Loading...')
    try {
      const response = await apiConnector('DELETE', DELETE_PROFILE_API, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log('DELETE_PROFILE_API API RESPONSE............', response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success('Profile Deleted Successfully')
      dispatch(logout(navigate))
    } catch (error: any) {
      console.log('DELETE_PROFILE_API API ERROR............', error)
      toast.error('Could Not Delete Profile')
    }
    toast.dismiss(toastId)
  }
}

export async function getInstructorData(token: string) {
  const toastId = toast.loading('Loading...')
  let result = []
  try {
    const response = await apiConnector('GET', GET_INSTRUCTOR_DATA_API, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log('GET_INSTRUCTOR_DATA_API API RESPONSE............', response)
    result = response?.data?.courses
  } catch (error: any) {
    console.log('GET_INSTRUCTOR_DATA_API API ERROR............', error)
    toast.error('Could Not Get Instructor Data')
  }
  toast.dismiss(toastId)
  return result
}
