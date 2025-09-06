import { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { AppDispatch } from '@/store'
import { login } from '@/services/operations/authAPI'
import frameImg from '@/assets/Images/frame.png'
import loginImg from '@/assets/Images/login.webp'

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = formData

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(login(email, password, navigate))
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      <div className="mx-auto flex w-11/12 max-w-maxContent flex-col-reverse justify-between gap-y-12 py-12 md:flex-row md:gap-y-0 md:gap-x-12">
        <div className="mx-auto w-11/12 max-w-[450px] md:mx-0">
          <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5">
            Welcome Back
          </h1>
          <p className="mt-4 text-[1.125rem] leading-[1.625rem]">
            <span className="text-richblack-100">Build skills for today, tomorrow, and beyond.</span>{' '}
            <span className="font-edu-sa font-bold italic text-blue-100">
              Education to future-proof your career.
            </span>
          </p>
          <form onSubmit={handleOnSubmit} className="mt-6 flex w-full flex-col gap-y-4">
            <label className="w-full">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                Email Address <sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                type="text"
                name="email"
                value={email}
                onChange={handleOnChange}
                placeholder="Enter email address"
                className="input-style"
              />
            </label>
            <label className="relative">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                Password <sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Enter Password"
                className="input-style pr-12"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                ) : (
                  <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                )}
              </span>
              <Link to="/forgot-password">
                <p className="mt-1 ml-auto max-w-max text-xs text-blue-100">
                  Forgot Password
                </p>
              </Link>
            </label>
            <button
              type="submit"
              className="mt-6 rounded-[8px] bg-yellow-50 py-[8px] px-[12px] font-medium text-richblack-900"
            >
              Sign In
            </button>
          </form>
        </div>
        <div className="relative mx-auto w-11/12 max-w-[450px] md:mx-0">
          <img
            src={frameImg}
            alt="Pattern"
            width={558}
            height={504}
            loading="lazy"
          />
          <img
            src={loginImg}
            alt="Students"
            width={558}
            height={504}
            loading="lazy"
            className="absolute -top-4 right-4 z-10"
          />
        </div>
      </div>
    </div>
  )
}

export default Login
