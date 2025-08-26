import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useParams } from 'react-router-dom'
import CourseReviewModal from '@/components/core/ViewCourse/CourseReviewModal'
import VideoDetailsSidebar from '@/components/core/ViewCourse/VideoDetailsSidebar'
import { getFullDetailsOfCourse } from '@/services/operations/courseDetailsAPI'
import {
  setCompletedLectures,
  setCourseSectionData,
  setCourseEntireData,
  setTotalNoOfLectures,
} from '@/store/slices/viewCourseSlice'
import { RootState } from '@/store'

const ViewCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const { token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)

  useEffect(() => {
    const setCourseSpecificDetails = async () => {
      const courseData = await getFullDetailsOfCourse(courseId!, token!)
      dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
      dispatch(setCourseEntireData(courseData.courseDetails))
      dispatch(setCompletedLectures(courseData.completedVideos))
      let lectures = 0
      courseData?.courseDetails?.courseContent?.forEach((sec: any) => {
        lectures += sec.subSection.length
      })
      dispatch(setTotalNoOfLectures(lectures))
    }
    setCourseSpecificDetails()
  }, [courseId, token, dispatch])

  return (
    <>
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
          <div className="mx-6">
            <Outlet />
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}

export default ViewCourse
