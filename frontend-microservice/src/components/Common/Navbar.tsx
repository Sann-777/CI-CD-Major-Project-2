import { useEffect, useState } from 'react'
import { AiOutlineMenu, AiOutlineShoppingCart } from 'react-icons/ai'
import { BsChevronDown } from 'react-icons/bs'
import { useSelector } from 'react-redux'
import { Link, matchPath, useLocation } from 'react-router-dom'
import { RootState } from '@/store'
import { ACCOUNT_TYPE } from '@/types'
import { NavbarLinks } from '@/data/navbar-links'
import { apiConnector } from '@/services/api'
import ProfileDropdown from './ProfileDropdown'
// import logo from '@/assets/Logo/Logo-Full-Light.png'

interface Category {
  _id: string
  name: string
  description: string
}

const Navbar = () => {
  const { token } = useSelector((state: RootState) => state.auth)
  const { user } = useSelector((state: RootState) => state.profile)
  const { totalItems } = useSelector((state: RootState) => state.cart)
  const location = useLocation()

  const [subLinks, setSubLinks] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const res = await apiConnector('GET', '/api/v1/category/showAllCategories')
        setSubLinks(res.data.data)
      } catch (error) {
        console.log('Could not fetch Categories.', error)
      }
      setLoading(false)
    }
    fetchCategories()
  }, [])

  const matchRoute = (route: string) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div
      className={`flex h-16 items-center justify-center border-b-[1px] border-b-richblack-700 ${location.pathname !== '/' ? 'bg-richblack-800' : 'bg-richblack-900'} transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
              <span className="text-richblack-900 font-bold text-xl">S</span>
            </div>
            <span className="text-white font-semibold text-2xl">StudyNotion</span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-8 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === 'Catalog' ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 py-2 text-richblack-25 ${
                        matchRoute('/catalog/:catalogName')
                          ? 'text-yellow-25'
                          : 'text-richblack-25'
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : subLinks.length ? (
                          <>
                            {subLinks
                              ?.filter((subLink) => subLink?.name?.length > 0)
                              ?.map((subLink, i) => (
                                <Link
                                  to={`/catalog/${subLink.name
                                    .split(' ')
                                    .join('-')
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                  key={i}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <>
                            <Link
                              to="/catalog/web-development"
                              className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                            >
                              <p>Web Development</p>
                            </Link>
                            <Link
                              to="/catalog/data-science"
                              className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                            >
                              <p>Data Science</p>
                            </Link>
                            <Link
                              to="/catalog/mobile-development"
                              className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                            >
                              <p>Mobile Development</p>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? 'text-yellow-25'
                          : 'text-richblack-25'
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Login / Signup / Dashboard */}
        <div className="hidden items-center gap-x-4 md:flex">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown />}
        </div>
        <button className="mr-4 md:hidden">
          <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
        </button>
      </div>
    </div>
  )
}

export default Navbar
