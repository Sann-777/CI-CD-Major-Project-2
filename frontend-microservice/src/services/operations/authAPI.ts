import { Dispatch } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import { apiConnectorLegacy as apiConnector, endpoints } from '../api'
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
    const toastId = toast.loading('Loading...')
    dispatch(setLoading(true))
    try {
      const response = await apiConnector('POST', SENDOTP_API, {
        email,
        checkUserPresent: true,
      })

      console.log('SENDOTP API RESPONSE............', response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success('OTP Sent Successfully')
      navigate('/verify-email')
    } catch (error: any) {
      console.log('SENDOTP API ERROR............', error)
      const errorMessage = error.response?.data?.message || 'Could Not Send OTP'
      toast.error(errorMessage)
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
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
    const toastId = toast.loading('Loading...')
    dispatch(setLoading(true))
    try {
      const response = await apiConnector('POST', SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      })

      console.log('SIGNUP API RESPONSE............', response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success('Signup Successful')
      navigate('/login')
    } catch (error: any) {
      console.log('SIGNUP API ERROR............', error)
      const errorMessage = error.response?.data?.message || 'Signup Failed'
      toast.error(errorMessage)
      navigate('/signup')
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function login(email: string, password: string, navigate: any) {
  return async (dispatch: Dispatch) => {
    const toastId = toast.loading('Logging in...')
    dispatch(setLoading(true))
    try {
      const response = await apiConnector('POST', LOGIN_API, {
        email,
        password,
      })

      console.log('LOGIN API RESPONSE............', response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      dispatch(setToken(response.data.token))
      
      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`
      
      dispatch(setUser({ ...response.data.user, image: userImage }))
      
      localStorage.setItem('token', JSON.stringify(response.data.token))
      localStorage.setItem('user', JSON.stringify({ ...response.data.user, image: userImage }))
      
      toast.success('Login Successful')
      navigate('/dashboard/my-profile')
    } catch (error: any) {
      console.log('LOGIN API ERROR............', error)
      const errorMessage = error.response?.data?.message || 'Login Failed'
      toast.error(errorMessage)
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
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
      const response = await apiConnector('POST', RESETPASSTOKEN_API, {
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
      const response = await apiConnector('POST', RESETPASSWORD_API, {
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
      const errorMessage = error.response?.data?.message || 'Failed To Reset Password'
      toast.error(errorMessage)
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}
