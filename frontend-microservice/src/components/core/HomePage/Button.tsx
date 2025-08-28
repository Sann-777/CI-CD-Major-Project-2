import React from 'react'
import { Link } from 'react-router-dom'

interface ButtonProps {
  children: React.ReactNode
  active?: boolean
  linkto?: string
  onClick?: () => void
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  active = false,
  linkto,
  onClick,
  className = "",
}) => {
  const baseClasses = `text-center text-sm sm:text-base lg:text-lg px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
    active
      ? "bg-yellow-50 text-richblack-900 hover:bg-yellow-100 hover:scale-105"
      : "bg-richblack-700 text-richblack-5 border border-richblack-600 hover:bg-richblack-600 hover:scale-105"
  } ${className}`

  if (linkto) {
    return (
      <Link to={linkto}>
        <div className={baseClasses}>{children}</div>
      </Link>
    )
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
