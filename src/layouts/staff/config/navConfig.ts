import {
    BarChart3,
    Package,
    ClipboardCheck,
    Undo2,
    LayoutDashboard,
    FileSearch
} from 'lucide-react';

export interface NavItem {
    title: string;
    path: string;
    icon: any;
}

export const staffNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        path: '/staff/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Nhập kho',
        path: '/staff/incoming',
        icon: Package,
    },
    {
        title: 'Kho hàng',
        path: '/staff/inventory',
        icon: BarChart3,
    },
    {
        title: 'Xử lý & Duyệt',
        path: '/staff/verify',
        icon: ClipboardCheck,
    },
    {
        title: 'Trả đồ',
        path: '/staff/return',
        icon: Undo2,
    },
    {
        title: 'Tin báo mất',
        path: '/staff/lost-reports',
        icon: FileSearch,
    },
];
