import React from 'react'

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-50"></div>
    </div>
  )
}

export default Spinner
