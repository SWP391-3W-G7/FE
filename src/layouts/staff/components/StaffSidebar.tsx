import { Link, useLocation } from 'react-router-dom';
import { PackagePlus, X } from 'lucide-react';
import { staffNavItems } from '../config/navConfig';
import { Button } from '@/components/ui/button';

interface StaffSidebarProps {
    onClose?: () => void;
    isCollapsed?: boolean;
}

const StaffSidebar = ({ onClose, isCollapsed }: StaffSidebarProps) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={`flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Sidebar Header */}
            <div className={`h-16 flex items-center border-b border-slate-800 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
                <Link to="/staff/dashboard" className="flex items-center gap-2 font-bold text-xl text-orange-500 overflow-hidden whitespace-nowrap">
                    <PackagePlus className="h-7 w-7 shrink-0" />
                    {!isCollapsed && <span>Staff Portal</span>}
                </Link>
                {onClose && !isCollapsed && (
                    <Button variant="ghost" size="icon" className="md:hidden text-slate-400" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {staffNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20'
                                : 'hover:bg-slate-800 hover:text-white text-slate-400'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? item.title : ""}
                        >
                            <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                            {!isCollapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className={`flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    {!isCollapsed && <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">System Online</span>}
                </div>
            </div>
        </div>
    );
};

export default StaffSidebar;
