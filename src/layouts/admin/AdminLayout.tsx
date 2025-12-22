import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col fixed inset-y-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <AdminSidebar isCollapsed={isCollapsed} />
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
                    isCollapsed={isCollapsed}
                />

                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="p-0 border-none w-64">
                    <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default AdminLayout;
