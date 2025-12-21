import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, MapPin, UserCheck } from 'lucide-react';

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/admin/users',
      label: 'Quản lý người dùng',
      icon: Users,
    },
    {
      path: '/admin/pending-users',
      label: 'Users chờ duyệt',
      icon: UserCheck,
    },
    {
      path: '/admin/campus',
      label: 'Quản lý Campus',
      icon: MapPin,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 mb-6">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                className={isActive ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-600'}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminNav;
