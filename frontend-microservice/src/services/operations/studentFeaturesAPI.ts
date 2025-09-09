import { toast } from 'react-hot-toast'
import { resetCart } from '@/store/slices/cartSlice'

// Simple enrollment function without payment
export async function enrollInCourse(
  token: string,
  courseId: string,
  dispatch: any
) {
  const toastId = toast.loading("Enrolling in course...")
  try {
    // Simulate enrollment process for the selected course
    console.log("Enrolling in course:", courseId, "with token:", token)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success("Successfully enrolled in course!")
    // Note: Navigation should be handled by the calling component
    dispatch(resetCart())
  } catch (error: any) {
    console.log("ENROLLMENT ERROR............", error)
    toast.error("Could not enroll in course.")
  }
  toast.dismiss(toastId)
}
