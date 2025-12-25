import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { type RoleType } from '@/config/roles';
import { useAppSelector } from '@/store';

interface ProtectedRouteProps {
  allowedRoles?: RoleType[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user?.role) {
    const hasAccess = allowedRoles.includes(user.role as RoleType);

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;