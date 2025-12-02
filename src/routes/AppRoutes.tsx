import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '@/config/roles';
import MainLayout from '@/layouts/MainLayout';
import LoginPage from '@/pages/auth/LoginPage';
import LostItemsPage from '@/pages/items/LostItemsPage';
import ReportItemPage from '@/pages/items/ReportItemPage';

import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<div className="p-10 text-red-500">Bạn không có quyền truy cập trang này!</div>} />


      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          
          <Route path="/" element={<Navigate to="/items" replace />} />
          
          <Route path="/items" element={<LostItemsPage />} />

          <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
             <Route path="/report" element={<ReportItemPage />} />
          </Route>

        </Route>
      </Route>


      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.SECURITY]} />}>
         <Route path="/dashboard" element={<div className='p-10'>Trang quản lý cho Staff (Todo)</div>} />
      </Route>


      <Route path="*" element={<div className="p-10 text-center">404 - Trang không tồn tại</div>} />
    </Routes>
  );
};

export default AppRoutes;