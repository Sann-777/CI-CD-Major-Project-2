import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '@/store'

interface PrivateRouteProps {
  children: React.ReactNode
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useSelector((state: RootState) => state.auth)

  if (token !== null) {
    return <>{children}</>
  } else {
    return <Navigate to="/login" />
  }
}

export default PrivateRoute
