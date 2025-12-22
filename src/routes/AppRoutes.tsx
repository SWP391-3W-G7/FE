import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '@/config/roles';
import MainLayout from '@/layouts/MainLayout';
import AuthPage from '@/pages/public/AuthPage';
import LandingPage from '@/pages/public/LandingPage';
import GoogleCallbackPage from '@/pages/public/GoogleCallbackPage';
import ReportItemPage from '@/pages/private/student/ReportItemPage';
import ProtectedRoute from './ProtectedRoute';
import ReportFoundPage from '@/pages/private/student/ReportFoundPage';
import FindItemsPage from '@/pages/private/student/FindItemsPage';
import ClaimItemPage from '@/pages/private/student/ClaimItemPage';
import ProfilePage from '@/pages/private/student/ProfilePage';
import MyItemsPage from '@/pages/private/student/MyItemsPage';
import EditLostItemPage from '@/pages/private/student/EditLostItemPage';
import EditFoundItemPage from '@/pages/private/student/EditFoundItemPage';
import SecurityLogPage from '@/pages/private/security/SecurityLogPage';
import StaffLayout from '@/layouts/staff/StaffLayout';
import AdminLayout from '@/layouts/admin/AdminLayout';

// Lazy load Staff Pages
const StaffDashboard = lazy(() => import('@/pages/private/staff/StaffDashboard').then(module => ({ default: module.StaffDashboard })));
const StaffIncomingPage = lazy(() => import('@/pages/private/staff/StaffIncomingPage'));
const StaffInventoryPage = lazy(() => import('@/pages/private/staff/StaffInventoryPage'));
const StaffVerifyPage = lazy(() => import('@/pages/private/staff/StaffVerifyPage'));
const StaffReturnPage = lazy(() => import('@/pages/private/staff/StaffReturnPage'));

// Lazy load Admin Pages
const AdminDashboard = lazy(() => import('@/pages/private/admin/AdminDashboard'));
const AdminCampusPage = lazy(() => import('@/pages/private/admin/AdminCampusPage'));
const AdminUsersPage = lazy(() => import('@/pages/private/admin/AdminUsersPage'));
const PendingUsersPage = lazy(() => import('@/pages/private/admin/PendingUsersPage'));

const SecurityDashboard = lazy(() => import('@/pages/private/security/SecurityDashboard'));

// Fallback loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
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
          <Route path="/my-items" element={<MyItemsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-lost/:id" element={<EditLostItemPage />} />
          <Route path="/edit-found/:id" element={<EditFoundItemPage />} />
        </Route>
      </Route>

      {/* Staff Workspace */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]} />}>
        <Route element={<StaffLayout />}>
          <Route index path="/staff/dashboard" element={
            <Suspense fallback={<PageLoader />}>
              <StaffDashboard />
            </Suspense>
          } />
          <Route path="/staff/incoming" element={
            <Suspense fallback={<PageLoader />}>
              <StaffIncomingPage />
            </Suspense>
          } />
          <Route path="/staff/inventory" element={
            <Suspense fallback={<PageLoader />}>
              <StaffInventoryPage />
            </Suspense>
          } />
          <Route path="/staff/verify" element={
            <Suspense fallback={<PageLoader />}>
              <StaffVerifyPage />
            </Suspense>
          } />
          <Route path="/staff/return" element={
            <Suspense fallback={<PageLoader />}>
              <StaffReturnPage />
            </Suspense>
          } />
        </Route>
      </Route>

      {/* Security */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SECURITY]} />}>
        <Route element={<MainLayout />}>
          <Route path="/security/dashboard" element={
            <Suspense fallback={<PageLoader />}>
              <SecurityDashboard />
            </Suspense>
          } />
          <Route path="/security/log-item" element={<SecurityLogPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.SECURITY]} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<div className='p-10 text-2xl font-bold text-center'>Dashboard Quản Lý (Dành cho Staff/Security)</div>} />
        </Route>
      </Route>

      {/* Admin Workspace */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="/admin/campus" element={
            <Suspense fallback={<PageLoader />}>
              <AdminCampusPage />
            </Suspense>
          } />
          <Route path="/admin/users" element={
            <Suspense fallback={<PageLoader />}>
              <AdminUsersPage />
            </Suspense>
          } />
          <Route path="/admin/pending-users" element={
            <Suspense fallback={<PageLoader />}>
              <PendingUsersPage />
            </Suspense>
          } />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-10 text-center text-gray-500">404 - Trang không tồn tại</div>} />
    </Routes>
  );
};

export default AppRoutes;