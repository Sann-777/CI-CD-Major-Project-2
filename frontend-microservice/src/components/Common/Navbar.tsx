import { useEffect, useState } from 'react'
import { AiOutlineMenu, AiOutlineShoppingCart } from 'react-icons/ai'
import { BsChevronDown } from 'react-icons/bs'
import { useSelector } from 'react-redux'
import { Link, matchPath, useLocation } from 'react-router-dom'
import { RootState } from '@/store'
import { ACCOUNT_TYPE } from '@/utils/constants'
import { NavbarLinks } from '@/data/navbar-links'
import { apiConnector } from '@/services/api'
import ProfileDropdown from './ProfileDropdown'
// import logo from '../../assets/Logo/Logo-Full-Light.png'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const res = await apiConnector.get('/api/v1/category/showAllCategories')
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
      className={`flex h-16 items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== '/' ? 'bg-richblack-800' : 'bg-richblack-900'
      } transition-all duration-200 shadow-lg`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="text-2xl lg:text-3xl font-bold text-yellow-50">StudyNotion</div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-8 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === 'Catalog' ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-richblack-700 ${
                        matchRoute('/catalog/:catalogName')
                          ? 'text-yellow-25 bg-richblack-700'
                          : 'text-richblack-25'
                      }`}
                    >
                      <p className="font-medium text-base lg:text-lg">{link.title}</p>
                      <BsChevronDown className="transition-transform duration-200 group-hover:rotate-180" />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px] shadow-xl border border-richblack-200">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5 border-l border-t border-richblack-200"></div>
                        {loading ? (
                          <p className="text-center py-4 text-base lg:text-lg">Loading...</p>
                        ) : subLinks.length ? (
                          <>
                            {subLinks
                              ?.filter((subLink) => subLink?.name?.length > 0)
                              ?.map((subLink, i) => (
                                <Link
                                  key={i}
                                  to={`/catalog/${subLink.name
                                    .split(' ')
                                    .join('-')
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-3 pl-4 hover:bg-richblack-50 transition-colors duration-200 font-medium text-base lg:text-lg"
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <>
                            <Link
                              to="/catalog/web-development"
                              className="rounded-lg bg-transparent py-3 pl-4 hover:bg-richblack-50 transition-colors duration-200 font-medium text-base lg:text-lg"
                            >
                              <p>Web Development</p>
                            </Link>
                            <Link
                              to="/catalog/data-science"
                              className="rounded-lg bg-transparent py-3 pl-4 hover:bg-richblack-50 transition-colors duration-200 font-medium text-base lg:text-lg"
                            >
                              <p>Data Science</p>
                            </Link>
                            <Link
                              to="/catalog/mobile-development"
                              className="rounded-lg bg-transparent py-3 pl-4 hover:bg-richblack-50 transition-colors duration-200 font-medium text-base lg:text-lg"
                            >
                              <p>Mobile Development</p>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    to={link?.path}
                    className={`relative inline-flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-richblack-700 ${
                      matchRoute(link?.path)
                        ? 'text-yellow-25 bg-richblack-700'
                        : 'text-richblack-25'
                    }`}
                  >
                    <p className="font-medium text-base lg:text-lg">{link.title}</p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100 hover:text-yellow-50 transition-colors duration-200" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-richblack-600 text-yellow-100 text-xs px-2 py-1 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          
          {token === null && (
            <>
              <Link to="/login">
                <button className="rounded-lg border border-richblack-700 bg-richblack-700 px-4 py-2 text-richblack-100 hover:bg-richblack-600 transition-colors duration-200 text-base lg:text-lg">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-lg bg-yellow-50 px-4 py-2 text-richblack-900 font-semibold hover:bg-yellow-100 transition-colors duration-200 text-base lg:text-lg">
                  Sign up
                </button>
              </Link>
            </>
          )}
          
          {token !== null && (
            <ProfileDropdown />
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-richblack-100 hover:text-yellow-50 transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <AiOutlineMenu className="text-2xl" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-richblack-800 border-b border-richblack-700 md:hidden z-50">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation Links */}
            {NavbarLinks.map((link, index) => (
              <div key={index}>
                {link.title === 'Catalog' ? (
                  <div>
                    <div className="flex items-center justify-between py-2">
                      <p className="text-richblack-100 text-base lg:text-lg font-medium">Catalog</p>
                      <BsChevronDown className="text-richblack-100" />
                    </div>
                    <div className="pl-4 space-y-2">
                      {loading ? (
                        <p className="text-richblack-100 text-sm lg:text-base py-2">Loading...</p>
                      ) : subLinks.length ? (
                        subLinks
                          ?.filter((subLink) => subLink?.name?.length > 0)
                          ?.map((subLink, i) => (
                            <Link
                              key={i}
                              to={`/catalog/${subLink.name
                                .split(' ')
                                .join('-')
                                .toLowerCase()}`}
                              className="block text-richblack-100 text-base lg:text-lg py-2 hover:text-yellow-50"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {subLink.name}
                            </Link>
                          ))
                      ) : (
                        <>
                          <Link
                            to="/catalog/web-development"
                            className="block text-richblack-100 text-base lg:text-lg py-2 hover:text-yellow-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Web Development
                          </Link>
                          <Link
                            to="/catalog/data-science"
                            className="block text-richblack-100 text-base lg:text-lg py-2 hover:text-yellow-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Data Science
                          </Link>
                          <Link
                            to="/catalog/mobile-development"
                            className="block text-richblack-100 text-base lg:text-lg py-2 hover:text-yellow-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Mobile Development
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link 
                    to={link?.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <p className={`py-2 border-b border-richblack-600 text-base lg:text-lg ${
                      matchRoute(link?.path)
                        ? 'text-yellow-25'
                        : 'text-richblack-25'
                    }`}>
                      {link.title}
                    </p>
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 space-y-3 border-t border-richblack-600">
              {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                <Link 
                  to="/dashboard/cart" 
                  className="flex items-center gap-2 text-richblack-100 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <AiOutlineShoppingCart className="text-xl" />
                  <span className="text-base lg:text-lg">Cart</span>
                  {totalItems > 0 && (
                    <span className="bg-richblack-600 text-yellow-100 text-xs px-2 py-1 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}
              
              {token === null && (
                <div className="space-y-2">
                  <Link 
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <button className="w-full rounded-lg border border-richblack-700 bg-richblack-700 px-4 py-3 text-richblack-100 hover:bg-richblack-600 text-base lg:text-lg">
                      Log in
                    </button>
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <button className="w-full rounded-lg bg-yellow-50 px-4 py-3 text-richblack-900 font-semibold hover:bg-yellow-100 text-base lg:text-lg">
                      Sign up
                    </button>
                  </Link>
                </div>
              )}
              
              {token !== null && (
                <div className="py-2">
                  <ProfileDropdown />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar
