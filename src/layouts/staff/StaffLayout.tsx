import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StaffSidebar from './components/StaffSidebar';
import StaffHeader from './components/StaffHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const StaffLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col fixed inset-y-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <StaffSidebar isCollapsed={isCollapsed} />
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
                <StaffHeader
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
                    <StaffSidebar onClose={() => setIsSidebarOpen(false)} />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default StaffLayout;
