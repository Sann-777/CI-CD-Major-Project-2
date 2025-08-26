import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '@/store'

interface OpenRouteProps {
  children: React.ReactNode
}

function OpenRoute({ children }: OpenRouteProps) {
  const { token } = useSelector((state: RootState) => state.auth)

  if (token === null) {
    return <>{children}</>
  } else {
    return <Navigate to="/dashboard/my-profile" />
  }
}

export default OpenRoute
