import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { getUserDetails } from '@/services/operations/profileAPI'
import { ACCOUNT_TYPE } from '@/types'

// Components
import Navbar from '@/components/Common/Navbar'
import OpenRoute from '@/components/core/Auth/OpenRoute'
import PrivateRoute from '@/components/core/Auth/PrivateRoute'
import Spinner from '@/components/Common/Spinner'

// Pages
import Home from '@/pages/Home'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Catalog from '@/pages/Catalog'
import CourseDetails from '@/pages/CourseDetails'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import ForgotPassword from '@/pages/ForgotPassword'
import UpdatePassword from '@/pages/UpdatePassword'
import VerifyEmail from '@/pages/VerifyEmail'
import Dashboard from '@/pages/Dashboard'
import ViewCourse from '@/pages/ViewCourse'
import Error from '@/pages/Error'

// Dashboard Components
import MyProfile from '@/components/core/Dashboard/MyProfile'
import Settings from '@/components/core/Dashboard/Settings'
import EnrolledCourses from '@/components/core/Dashboard/EnrolledCourses'
import Cart from '@/components/core/Dashboard/Cart'
import AddCourse from '@/components/core/Dashboard/AddCourse'
import MyCourses from '@/components/core/Dashboard/MyCourses'
import EditCourse from '@/components/core/Dashboard/EditCourse'
import Instructor from '@/components/core/Dashboard/Instructor'
import VideoDetails from '@/components/core/ViewCourse/VideoDetails'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.profile)
  const { loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      const token = JSON.parse(localStorage.getItem('token')!)
      dispatch(getUserDetails(token, navigate))
    }
  }, [dispatch, navigate])

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-screen flex-col bg-richblack-900 font-inter">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route path="/catalog/:catalogName" element={<Catalog />} />
        
        {/* Open Route - for Only Non Logged in User */}
        <Route
          path="/login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="/update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />

        {/* Private Route - for Only Logged in User */}
        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Route for all users */}
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/settings" element={<Settings />} />
          
          {/* Route only for Instructors */}
          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/instructor" element={<Instructor />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
            </>
          )}
          
          {/* Route only for Students */}
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="dashboard/enrolled-courses"
                element={<EnrolledCourses />}
              />
              <Route path="dashboard/cart" element={<Cart />} />
            </>
          )}
        </Route>

        {/* For the watching course lectures */}
        <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <Route
              path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
              element={<VideoDetails />}
            />
          )}
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  )
}

export default App
