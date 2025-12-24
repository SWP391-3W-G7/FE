import {
    LayoutDashboard,
    Users,
    UserPlus,
    Building2
} from 'lucide-react';

export interface AdminNavItem {
    title: string;
    path: string;
    icon: any;
}

export const adminNavItems: AdminNavItem[] = [
    {
        title: 'Dashboard',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Quản lý người dùng',
        path: '/admin/users',
        icon: Users,
    },
    {
        title: 'Users chờ duyệt',
        path: '/admin/pending-users',
        icon: UserPlus,
    },
    {
        title: 'Quản lý Campus',
        path: '/admin/campus',
        icon: Building2,
    },
];
