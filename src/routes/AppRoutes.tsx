import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '@/config/roles';
import MainLayout from '@/layouts/MainLayout';
import AuthPage from '@/pages/public/AuthPage';
import LandingPage from '@/pages/public/LandingPage';
import ReportItemPage from '@/pages/private/student/ReportItemPage';
import ProtectedRoute from './ProtectedRoute';
import ReportFoundPage from '@/pages/private/student/ReportFoundPage';
import FindItemsPage from '@/pages/private/student/FindItemsPage';
import ClaimItemPage from '@/pages/private/student/ClaimItemPage';
import StudentDashboard from '@/pages/private/student/StudentDashboard';
import ProfilePage from '@/pages/private/student/ProfilePage';
import EditLostItemPage from '@/pages/private/student/EditLostItemPage';
import EditFoundItemPage from '@/pages/private/student/EditFoundItemPage';
import SecurityLogPage from '@/pages/private/security/SecurityLogPage';
import AdminDashboard from '@/pages/private/admin/AdminDashboard';
import AdminCampusPage from '@/pages/private/admin/AdminCampusPage';
import AdminUsersPage from '@/pages/private/admin/AdminUsersPage';
import SecurityDashboard from '@/pages/private/security/SecurityDashboard';
import SecurityVerificationPage from '@/pages/private/security/SecurityVerificationPage';
import { StaffDashboard } from '@/pages/private/staff/StaffDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/unauthorized"
        element={<div className="p-10 text-red-500 text-center text-xl">403 - Bạn không có quyền truy cập!</div>}
      />

      {/* Public */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route element={<MainLayout />}>
          <Route path="/report-lost" element={<ReportItemPage />} />
          <Route path="/report-found" element={<ReportFoundPage />} />
          <Route path="/items" element={<FindItemsPage />} />
          <Route path="/items/:id" element={<ClaimItemPage />} />
          <Route path="/my-claims" element={<StudentDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-lost/:id" element={<EditLostItemPage />} />
          <Route path="/edit-found/:id" element={<EditFoundItemPage />} />
        </Route>
      </Route>

      {/* Staff */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF]} />}>
        <Route element={<MainLayout />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Route>
      </Route>

      {/* Security */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SECURITY]} />}>
        <Route element={<MainLayout />}>
          <Route path="/security/dashboard" element={<SecurityDashboard />} />
          <Route path="/security/log-item" element={<SecurityLogPage />} />
          <Route path="/security/verification" element={<SecurityVerificationPage />} />
        </Route>
      </Route>

      {/* Staff Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.SECURITY]} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<div className='p-10 text-2xl font-bold text-center'>Dashboard Quản Lý (Dành cho Staff/Security)</div>} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/campus" element={<AdminCampusPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-10 text-center text-gray-500">404 - Trang không tồn tại</div>} />
    </Routes>
  );
};

export default AppRoutes;
