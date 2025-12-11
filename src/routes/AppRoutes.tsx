import { Routes, Route } from 'react-router-dom';
import { ROLES } from '@/config/roles';
import MainLayout from '@/layouts/MainLayout';
import LoginPage from '@/pages/public/LoginPage';
import LandingPage from '@/pages/public/LandingPage';
// import LostItemsPage from '@/pages/items/LostItemsPage';
// import ReportItemPage from '@/pages/items/ReportItemPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<div className="p-10 text-red-500 text-center text-xl">403 - Bạn không có quyền truy cập!</div>} />
      
      <Route element={<MainLayout />}>
         <Route path="/" element={<LandingPage />} />
      </Route>


      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          
          {/* <Route path="/items" element={<LostItemsPage />} /> */}

          <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
            {/* <Route path="/report" element={<ReportItemPage />} /> */}
          </Route>

        </Route>
      </Route>


      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.SECURITY]} />}>
         <Route path="/dashboard" element={<div className='p-10 text-2xl font-bold text-center'>Dashboard Quản Lý (Dành cho Staff/Security)</div>} />
      </Route>


      <Route path="*" element={<div className="p-10 text-center text-gray-500">404 - Trang không tồn tại</div>} />
    </Routes>
  );
};

export default AppRoutes;