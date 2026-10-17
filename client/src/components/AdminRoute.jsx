import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component that restricts access to administrator accounts only.
 * - If not logged in: Redirects to /login?redirect=/admin
 * - If logged in as regular user: Redirects to / (Home)
 * - If logged in as admin: Renders the protected page
 */
export default function AdminRoute({ children }) {
  const { userInfo } = useAuth();
  const location = useLocation();

  if (!userInfo) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!userInfo.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
