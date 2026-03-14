import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const auth = localStorage.getItem('auth')

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
