import { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { sendOtp } from '@/services/operations/authAPI'
import { setSignupData } from '@/store/slices/authSlice'
import { ACCOUNT_TYPE } from '@/types'
import Tab from '@/components/Common/Tab'
import frameImg from '@/assets/Images/frame.png'
import signupImg from '@/assets/Images/signup.webp'

function Signup() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // student or instructor
  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { firstName, lastName, email, password, confirmPassword } = formData

  // Handle input fields, when some value changes
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  // Handle Form Submission
  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords Don't Match")
      return
    }
    const signupData = {
      ...formData,
      accountType,
    }

    // Setting signup data to state
    // To be used after otp verification
    dispatch(setSignupData(signupData))
    // Send OTP to user for verification
    dispatch(sendOtp(formData.email, navigate))

    // Reset
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    setAccountType(ACCOUNT_TYPE.STUDENT)
  }

  // data to pass to Tab component
  const tabData = [
    {
      id: 1,
      tabName: 'Student',
      type: ACCOUNT_TYPE.STUDENT,
    },
    {
      id: 2,
      tabName: 'Instructor',
      type: ACCOUNT_TYPE.INSTRUCTOR,
    },
  ]

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center bg-richblack-900">
      <div className="mx-auto flex w-11/12 max-w-maxContent flex-col-reverse justify-between gap-y-12 py-12 md:flex-row md:gap-y-0 md:gap-x-16">
        <div className="mx-auto w-11/12 max-w-[420px] md:mx-0">
          <h1 className="text-2xl font-semibold leading-8 text-richblack-5 mb-3">
            Join the millions learning to code with StudyNotion for free
          </h1>
          <p className="text-base leading-6 mb-6">
            <span className="text-richblack-100">Build skills for today, tomorrow, and beyond.</span>{' '}
            <span className="font-edu-sa font-bold italic text-blue-100">
              Education to future-proof your career.
            </span>
          </p>
          {/* Tab */}
          <Tab tabData={tabData} field={accountType} setField={setAccountType} />
          {/* Form */}
          <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-5 mt-6">
            <div className="flex gap-x-4">
              <label className="flex-1">
                <p className="mb-2 text-sm leading-5 text-richblack-5">
                  First Name <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleOnChange}
                  placeholder="Enter first name"
                  className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
                />
              </label>
              <label className="flex-1">
                <p className="mb-2 text-sm leading-5 text-richblack-5">
                  Last Name <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleOnChange}
                  placeholder="Enter last name"
                  className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
                />
              </label>
            </div>
            <label className="w-full">
              <p className="mb-2 text-sm leading-5 text-richblack-5">
                Email Address <sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={handleOnChange}
                placeholder="Enter email address"
                className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
              />
            </label>
            <div className="flex gap-x-4">
              <label className="relative flex-1">
                <p className="mb-2 text-sm leading-5 text-richblack-5">
                  Create Password <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="Enter Password"
                  className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 pr-12 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[42px] z-[10] cursor-pointer"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible fontSize={20} fill="#AFB2BF" />
                  ) : (
                    <AiOutlineEye fontSize={20} fill="#AFB2BF" />
                  )}
                </span>
              </label>
              <label className="relative flex-1">
                <p className="mb-2 text-sm leading-5 text-richblack-5">
                  Confirm Password <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleOnChange}
                  placeholder="Confirm Password"
                  className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 pr-12 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
                />
                <span
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-[42px] z-[10] cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible fontSize={20} fill="#AFB2BF" />
                  ) : (
                    <AiOutlineEye fontSize={20} fill="#AFB2BF" />
                  )}
                </span>
              </label>
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-yellow-50 py-3 px-4 font-semibold text-richblack-900 hover:bg-yellow-100 transition-all duration-200"
            >
              Create Account
            </button>
          </form>
        </div>
        {/* Image */}
        <div className="relative mx-auto w-11/12 max-w-[450px] md:mx-0">
          <img
            src={frameImg}
            alt="Pattern"
            width={558}
            height={504}
            loading="lazy"
          />
          <img
            src={signupImg}
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

export default Signup
