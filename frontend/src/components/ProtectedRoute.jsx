import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext.jsx';

export function ProtectedRoute() {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function RoleRoute({ roles }) {
  const { token, user } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}


