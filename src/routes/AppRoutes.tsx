import { Routes, Route } from 'react-router-dom';
import { ROLES } from '@/config/roles';
import MainLayout from '@/layouts/MainLayout';
import AuthPage from '@/pages/public/AuthPage';
import LandingPage from '@/pages/public/LandingPage';
// import LostItemsPage from '@/pages/items/LostItemsPage';
import ReportItemPage from '@/pages/private/student/ReportItemPage';
import ProtectedRoute from './ProtectedRoute';
import ReportFoundPage from '@/pages/private/student/ReportFoundPage';
import FindItemsPage from '@/pages/private/student/FindItemsPage';
import ClaimItemPage from '@/pages/private/student/ClaimItemPage';
import StudentDashboard from '@/pages/private/student/StudentDashboard';
import SecurityLogPage from '@/pages/private/security/SecurityLogPage';
import SecurityDashboard from '@/pages/private/security/SecurityDashboard';
import SecurityVerificationPage from '@/pages/private/security/SecurityVerificationPage';
import SecurityDisputePage from '@/pages/private/security/SecurityDisputePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/unauthorized" element={<div className="p-10 text-red-500 text-center text-xl">403 - Bạn không có quyền truy cập!</div>} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/report-lost" element={<ReportItemPage />} />
        <Route path="/report-found" element={<ReportFoundPage />} />
        <Route path="/items" element={<FindItemsPage />} />
        <Route path="/items/:id" element={<ClaimItemPage />} />
        <Route path="/my-claims" element={<StudentDashboard />} />
        
        {/* Test routes - Skip authentication for easy testing */}
        <Route path="/test/security/log" element={<SecurityLogPage />} />
        <Route path="/test/security/dashboard" element={<SecurityDashboard />} />
        <Route path="/test/security/verification" element={<SecurityVerificationPage />} />
        <Route path="/test/security/disputes" element={<SecurityDisputePage />} />
      </Route>


      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* <Route path="/items" element={<FindItemsPage />} /> */}
          {/* <Route path="/items" element={<LostItemsPage />} /> */}
          {/* <Route path="/items/:id" element={<ClaimItemPage />} /> */}
          {/* <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path="/report-lost" element={<ReportItemPage />} />
            <Route path="/report-found" element={<ReportFoundPage />} />
            <Route path="/my-claims" element={<StudentDashboard />} />
          </Route> */}

        </Route>
      </Route>


      {/* Security Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SECURITY]} />}>
        <Route element={<MainLayout />}>
          <Route path="/security/dashboard" element={<SecurityDashboard />} />
          <Route path="/security/log-item" element={<SecurityLogPage />} />
          <Route path="/security/verification" element={<SecurityVerificationPage />} />
          <Route path="/security/disputes" element={<SecurityDisputePage />} />
        </Route>
      </Route>

      {/* Legacy dashboard route - redirect based on role */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SECURITY]} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={
            <div className='p-10 text-2xl font-bold text-center'>
              Dashboard Quản Lý - Vui lòng sử dụng menu để điều hướng
            </div>
          } />
        </Route>
      </Route>


      <Route path="*" element={<div className="p-10 text-center text-gray-500">404 - Trang không tồn tại</div>} />
    </Routes>
  );
};

export default AppRoutes;