import { Routes, Route } from 'react-router-dom';
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
import { StaffDashboard } from '@/pages/private/staff/StaffDashboard';

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
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
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
      <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
        {/* <Route path="/staff/dashboard" element={<StaffDashboard />} /> */}
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.SECURITY]} />}>
        <Route path="/dashboard" element={<div className='p-10 text-2xl font-bold text-center'>Dashboard Quản Lý (Dành cho Staff/Security)</div>} />
      </Route>


      <Route path="*" element={<div className="p-10 text-center text-gray-500">404 - Trang không tồn tại</div>} />
    </Routes>
  );
};

export default AppRoutes;