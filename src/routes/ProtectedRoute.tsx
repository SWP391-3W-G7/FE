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

  console.log("🔒 ProtectedRoute Check:");
  console.log("  - Path:", location.pathname);
  console.log("  - Authenticated:", isAuthenticated);
  console.log("  - User:", user);
  console.log("  - User Role:", user?.role, "Type:", typeof user?.role);
  console.log("  - Allowed Roles:", allowedRoles);

  if (!isAuthenticated || !user) {
    console.log("❌ Not authenticated, redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user.role) {
    const hasAccess = allowedRoles.includes(user.role as RoleType);
    console.log("  - Checking access:", user.role, "in", allowedRoles, "=", hasAccess);

    if (!hasAccess) {
      console.log("❌ Access denied - User role:", user.role, "Allowed roles:", allowedRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log("✅ Access granted to", location.pathname);
  return <Outlet />;
};

export default ProtectedRoute;