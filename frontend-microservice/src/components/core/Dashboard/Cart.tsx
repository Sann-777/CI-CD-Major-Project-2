import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const Cart: React.FC = () => {
  const { total, totalItems } = useSelector((state: RootState) => state.cart)

  return (
    <>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">Cart</h1>
      <p className="border-b border-b-richblack-400 pb-2 font-semibold text-richblack-400">
        {totalItems} Courses in Cart
      </p>
      {total > 0 ? (
        <div className="mt-8 text-richblack-300">
          Cart functionality will be implemented here.
        </div>
      ) : (
        <p className="mt-14 text-center text-3xl text-richblack-100">
          Your cart is empty
        </p>
      )}
    </>
  )
}

export default Cart
