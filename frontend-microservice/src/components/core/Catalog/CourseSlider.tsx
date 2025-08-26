import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/pagination'
import { FreeMode, Pagination } from 'swiper/modules'
import Course_Card from './Course_Card'

interface Course {
  _id: string
  courseName: string
  courseDescription: string
  instructor: {
    firstName: string
    lastName: string
  }
  whatYouWillLearn: string
  courseContent: any[]
  ratingAndReviews: any[]
  price: number
  thumbnail: string
  tag: string[]
  category: string
  studentsEnrolled: string[]
  instructions: string[]
  status: string
  createdAt: string
  updatedAt: string
}

interface CourseSliderProps {
  Courses: Course[]
}

const CourseSlider: React.FC<CourseSliderProps> = ({ Courses }) => {
  return (
    <>
      {Courses?.length ? (
        <Swiper
          slidesPerView={1}
          spaceBetween={25}
          loop={true}
          modules={[FreeMode, Pagination]}
          breakpoints={{
            1024: {
              slidesPerView: 3,
            },
          }}
          className="max-h-[30rem]"
        >
          {Courses?.map((course, i) => (
            <SwiperSlide key={i}>
              <Course_Card course={course} Height={"h-[250px]"} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-xl text-richblack-5">No Course Found</p>
      )}
    </>
  )
}

export default CourseSlider
