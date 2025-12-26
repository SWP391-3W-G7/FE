import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '@/config/roles';
import MainLayout from '@/layouts/MainLayout';
import AuthPage from '@/pages/public/AuthPage';
import LandingPage from '@/pages/public/LandingPage';
import GoogleCallbackPage from '@/pages/public/GoogleCallbackPage';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRedirect from './RoleBasedRedirect';
import StaffLayout from '@/layouts/staff/StaffLayout';
import AdminLayout from '@/layouts/admin/AdminLayout';

// Lazy load Student Pages
const ReportItemPage = lazy(() => import('@/pages/private/student/ReportItemPage'));
const ReportFoundPage = lazy(() => import('@/pages/private/student/ReportFoundPage'));
const FindItemsPage = lazy(() => import('@/pages/private/student/FindItemsPage'));
const ClaimItemPage = lazy(() => import('@/pages/private/student/ClaimItemPage'));
const ProfilePage = lazy(() => import('@/pages/private/student/ProfilePage'));
const MyItemsPage = lazy(() => import('@/pages/private/student/MyItemsPage'));
const EditLostItemPage = lazy(() => import('@/pages/private/student/EditLostItemPage'));
const EditFoundItemPage = lazy(() => import('@/pages/private/student/EditFoundItemPage'));

// Lazy load Security Pages
const SecurityLogPage = lazy(() => import('@/pages/private/security/SecurityLogPage'));
const SecurityDashboard = lazy(() => import('@/pages/private/security/SecurityDashboard'));

// Lazy load Staff Pages
const StaffDashboard = lazy(() => import('@/pages/private/staff/StaffDashboard').then(module => ({ default: module.StaffDashboard })));
const StaffIncomingPage = lazy(() => import('@/pages/private/staff/StaffIncomingPage'));
const StaffInventoryPage = lazy(() => import('@/pages/private/staff/StaffInventoryPage'));
const StaffVerifyPage = lazy(() => import('@/pages/private/staff/StaffVerifyPage'));
const StaffReturnPage = lazy(() => import('@/pages/private/staff/StaffReturnPage'));
const StaffLostReportsPage = lazy(() => import('@/pages/private/staff/StaffLostReportsPage'));

// Lazy load Admin Pages
const AdminDashboard = lazy(() => import('@/pages/private/admin/AdminDashboard'));
const AdminCampusPage = lazy(() => import('@/pages/private/admin/AdminCampusPage'));
const AdminUsersPage = lazy(() => import('@/pages/private/admin/AdminUsersPage'));
const PendingUsersPage = lazy(() => import('@/pages/private/admin/PendingUsersPage'));

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

      {/* Public - Homepage with role-based redirect */}
      <Route element={<MainLayout />}>
        <Route path="/" element={
          <RoleBasedRedirect>
            <LandingPage />
          </RoleBasedRedirect>
        } />
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route element={<MainLayout />}>
          <Route path="/report-lost" element={
            <Suspense fallback={<PageLoader />}>
              <ReportItemPage />
            </Suspense>
          } />
          <Route path="/report-found" element={
            <Suspense fallback={<PageLoader />}>
              <ReportFoundPage />
            </Suspense>
          } />
          <Route path="/items" element={
            <Suspense fallback={<PageLoader />}>
              <FindItemsPage />
            </Suspense>
          } />
          <Route path="/items/:id" element={
            <Suspense fallback={<PageLoader />}>
              <ClaimItemPage />
            </Suspense>
          } />
          <Route path="/my-items" element={
            <Suspense fallback={<PageLoader />}>
              <MyItemsPage />
            </Suspense>
          } />
          <Route path="/my-claims" element={<Navigate to="/my-items" replace />} />
          <Route path="/profile" element={
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          } />
          <Route path="/edit-lost/:id" element={
            <Suspense fallback={<PageLoader />}>
              <EditLostItemPage />
            </Suspense>
          } />
          <Route path="/edit-found/:id" element={
            <Suspense fallback={<PageLoader />}>
              <EditFoundItemPage />
            </Suspense>
          } />
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
          <Route path="/staff/lost-reports" element={
            <Suspense fallback={<PageLoader />}>
              <StaffLostReportsPage />
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
          <Route path="/security/log-item" element={
            <Suspense fallback={<PageLoader />}>
              <SecurityLogPage />
            </Suspense>
          } />
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