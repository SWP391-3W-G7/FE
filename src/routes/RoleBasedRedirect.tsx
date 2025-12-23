import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';
import { ROLES } from '@/config/roles';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

/**
 * Component to handle role-based redirects on public pages.
 * - If user is Staff/Admin/Security, redirect to their dashboard
 * - If user is Student or not logged in, show the children (public page)
 */
const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  // If not authenticated, show public page
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  // Redirect based on role
  switch (user.role) {
    case ROLES.STAFF:
      return <Navigate to="/staff/dashboard" replace />;
    case ROLES.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case ROLES.SECURITY:
      return <Navigate to="/security/dashboard" replace />;
    case ROLES.STUDENT:
    default:
      // Students can access public pages
      return <>{children}</>;
  }
};

export default RoleBasedRedirect;
