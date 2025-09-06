import { Dispatch } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { apiCall, endpoints } from '../api'
import { setLoading, setToken } from '@/store/slices/authSlice'
import { resetCart } from '@/store/slices/cartSlice'
import { setUser } from '@/store/slices/profileSlice'

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints.AUTH

export function sendOtp(email: string, navigate: any) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Sending OTP...')
    dispatch(setLoading(true))
    try {
      const response = await apiCall('POST', SENDOTP_API, {
        email,
        checkUserPresent: true,
      })

      if (!response.success) {
        throw new Error(response.message)
      }

      toast.dismiss(toastId)
      toast.success('OTP Sent Successfully')
      navigate('/verify-email')
    } catch (error: any) {
      toast.dismiss(toastId)
      const errorMessage = error.response?.data?.message || error.message || 'Could Not Send OTP'
      toast.error(errorMessage)
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export function signUp(
  accountType: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
  otp: string,
  navigate: any
) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Creating account...')
    dispatch(setLoading(true))
    try {
      const response = await apiCall('POST', SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      })

      if (!response.success) {
        throw new Error(response.message)
      }
      
      toast.dismiss(toastId)
      toast.success('Signup Successful')
      navigate('/login')
    } catch (error: any) {
      toast.dismiss(toastId)
      const errorMessage = error.response?.data?.message || error.message || 'Signup Failed'
      toast.error(errorMessage)
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export function login(email: string, password: string, navigate: any) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Logging in...')
    dispatch(setLoading(true))
    try {
      const response = await apiCall('POST', LOGIN_API, {
        email,
        password,
      })

      if (!response.success) {
        throw new Error(response.message)
      }

      dispatch(setToken(response.token))
      
      const userImage = response?.user?.image
        ? response.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.user.firstName} ${response.user.lastName}`
      
      dispatch(setUser({ ...response.user, image: userImage }))
      
      localStorage.setItem('token', JSON.stringify(response.token))
      localStorage.setItem('user', JSON.stringify({ ...response.user, image: userImage }))
      
      toast.dismiss(toastId)
      toast.success('Login Successful')
      navigate('/dashboard/my-profile')
    } catch (error: any) {
      toast.dismiss(toastId)
      let errorMessage = 'Login Failed'
      
      // Priority order: backend message > specific status message > generic fallback
      if (error.response?.data?.message) {
        // Use the specific backend error message
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else {
        // Only use fallback messages if no backend message exists
        if (error.response?.status === 401) {
          errorMessage = 'Invalid email or password'
        } else if (error.response?.status === 404) {
          errorMessage = 'User not found. Please check your email.'
        } else if (error.response?.status === 400) {
          errorMessage = 'Please provide valid email and password'
        } else if (error.message) {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export function logout(navigate: any) {
  return (dispatch: Dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(resetCart())
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
    localStorage.removeItem('total')
    localStorage.removeItem('totalItems')
    toast.success('Logged Out')
    navigate('/')
  }
}

export function getPasswordResetToken(email: string, setEmailSent: (sent: boolean) => void) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Loading...')
    dispatch(setLoading(true))
    try {
      const response = await apiCall('POST', RESETPASSTOKEN_API, {
        email,
      })

      console.log('RESETPASSTOKEN RESPONSE............', response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success('Reset Email Sent')
      setEmailSent(true)
    } catch (error: any) {
      console.log('RESETPASSTOKEN ERROR............', error)
      toast.error('Failed To Send Reset Email')
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

export function resetPassword(password: string, confirmPassword: string, token: string, navigate: any) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Loading...')
    dispatch(setLoading(true))
    try {
      const response = await apiCall('POST', RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      })

      console.log('RESETPASSWORD RESPONSE............', response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success('Password Reset Successfully')
      navigate('/login')
    } catch (error: any) {
      console.log('RESETPASSWORD ERROR............', error)
      toast.error('Failed To Reset Password')
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}
