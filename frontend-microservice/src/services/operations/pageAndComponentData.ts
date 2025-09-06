import { toast } from 'react-hot-toast'
import { apiCall } from '../api'
import { categories } from '../apis'

export const getCatalogPageData = async (categoryId: string) => {
  const toastId = toast.loading("Loading...")
  let result = []
  try {
    const response = await apiCall('POST', categories.CATEGORY_PAGE_DETAILS_API, {
      categoryId: categoryId,
    })

    if (!response?.data?.success) {
      throw new Error("Could not Fetch Category page data.")
    }

    result = response?.data
  } catch (error: any) {
    console.log("CATALOG PAGE DATA API ERROR....", error)
    toast.error(error.message)
    result = error.response?.data
  }
  toast.dismiss(toastId)
  return result
}
