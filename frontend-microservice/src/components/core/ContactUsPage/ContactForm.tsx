import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { apiConnector } from '@/services/apiConnector'
import { contactusEndpoint } from '@/services/apis'
import CountryCode from '@/data/countrycode.json'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phoneNo: string
  message: string
  countrycode: string
}

const ContactForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormData>()

  const submitContactForm = async (data: FormData) => {
    console.log("Form Data - ", data)
    const toastId = toast.loading('Sending message...')
    try {
      setLoading(true)
      
      // Use the form data directly since countrycode is now included
      const formData = data
      
      const res = await apiConnector.post(contactusEndpoint.CONTACT_US_API, formData)
      console.log("Email Res - ", res)
      
      if (res.data.success) {
        toast.success("Message sent successfully!")
        reset()
      } else {
        toast.error(res.data.message || "Failed to send message")
      }
    } catch (error: any) {
      console.log("ERROR MESSAGE - ", error)
      let errorMessage = "Failed to send message. Please try again."
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message && !error.message.includes('Network Error')) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        email: "",
        firstName: "",
        lastName: "",
        message: "",
        phoneNo: "",
        countrycode: "+91",
      })
    }
  }, [reset, isSubmitSuccessful])

  return (
    <form
      className="flex w-full flex-col gap-y-5"
      onSubmit={handleSubmit(submitContactForm)}
    >
      <div className="flex gap-x-4">
        <label className="flex-1">
          <p className="mb-2 text-sm leading-5 text-richblack-5">
            First Name <sup className="text-pink-200">*</sup>
          </p>
          <input
            required
            type="text"
            placeholder="Enter first name"
            className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
            {...register("firstName", { required: true })}
          />
          {errors.firstName && (
            <span className="mt-1 text-[12px] text-pink-200">
              Please enter your name.
            </span>
          )}
        </label>
        <label className="flex-1">
          <p className="mb-2 text-sm leading-5 text-richblack-5">
            Last Name
          </p>
          <input
            type="text"
            placeholder="Enter last name"
            className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
            {...register("lastName")}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email">
          <p className="mb-2 text-sm leading-5 text-richblack-5">
            Email Address <sup className="text-pink-200">*</sup>
          </p>
          <input
            type="email"
            id="email"
            placeholder="Enter email address"
            className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
            {...register("email", { required: true })}
          />
          {errors.email && (
            <span className="mt-1 text-[12px] text-pink-200">
              Please enter your Email address.
            </span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phonenumber">
          <p className="mb-2 text-sm leading-5 text-richblack-5">
            Phone Number <sup className="text-pink-200">*</sup>
          </p>
          <div className="flex gap-x-4">
            <div className="flex w-[81px] flex-col gap-2">
              <select
                id="countrycode"
                className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 focus:outline-none focus:border-yellow-50"
                defaultValue="+91"
                {...register("countrycode")}
              >
                {CountryCode.map((ele, i) => {
                  return (
                    <option key={i} value={ele.code}>
                      {ele.code} -{ele.country}
                    </option>
                  )
                })}
              </select>
            </div>
            <div className="flex w-[calc(100%-90px)] flex-col gap-2">
              <input
                type="number"
                id="phonenumber"
                placeholder="12345 67890"
                className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50"
                {...register("phoneNo", {
                  required: {
                    value: true,
                    message: "Please enter your Phone Number.",
                  },
                  maxLength: { value: 12, message: "Invalid Phone Number" },
                  minLength: { value: 10, message: "Invalid Phone Number" },
                })}
              />
            </div>
          </div>
          {errors.phoneNo && (
            <span className="mt-1 text-[12px] text-pink-200">
              {errors.phoneNo.message}
            </span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message">
          <p className="mb-2 text-sm leading-5 text-richblack-5">
            Message <sup className="text-pink-200">*</sup>
          </p>
          <textarea
            id="message"
            cols={30}
            rows={7}
            placeholder="Enter your message here"
            className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:border-yellow-50 resize-none"
            {...register("message", { required: true })}
          />
          {errors.message && (
            <span className="mt-1 text-[12px] text-pink-200">
              Please enter your Message.
            </span>
          )}
        </label>
      </div>

      <button
        disabled={loading}
        type="submit"
        className="mt-6 w-full rounded-lg bg-yellow-50 py-3 px-4 font-semibold text-richblack-900 hover:bg-yellow-100 transition-all duration-200 disabled:bg-richblack-500 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  )
}

export default ContactForm
