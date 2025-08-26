import React from 'react'

const Error = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-richblack-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-richblack-5">404</h1>
        <p className="mt-4 text-xl text-richblack-300">Page Not Found</p>
        <p className="mt-2 text-richblack-400">
          The page you are looking for doesn't exist.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-lg bg-yellow-50 px-6 py-3 text-richblack-900 font-semibold hover:bg-yellow-25 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}

export default Error
