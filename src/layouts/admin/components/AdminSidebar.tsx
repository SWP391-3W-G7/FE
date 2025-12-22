import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { adminNavItems } from '../config/adminNavConfig';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminSidebarProps {
    onClose?: () => void;
    isCollapsed?: boolean;
}

const AdminSidebar = ({ onClose, isCollapsed }: AdminSidebarProps) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <TooltipProvider delayDuration={0}>
            <div className={`flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {/* Sidebar Header */}
                <div className={`h-16 flex items-center border-b border-slate-800 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
                    <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl text-indigo-500 overflow-hidden whitespace-nowrap">
                        <ShieldCheck className="h-7 w-7 shrink-0" />
                        {!isCollapsed && <span>Admin Portal</span>}
                    </Link>
                    {onClose && !isCollapsed && (
                        <Button variant="ghost" size="icon" className="md:hidden text-slate-400" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        const linkContent = (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                        : 'hover:bg-slate-800 hover:text-white text-slate-400'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                                {!isCollapsed && <span className="truncate">{item.title}</span>}
                            </Link>
                        );

                        if (isCollapsed) {
                            return (
                                <Tooltip key={item.path}>
                                    <TooltipTrigger asChild>
                                        {linkContent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {item.title}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return linkContent;
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className={`flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                        {!isCollapsed && <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Admin System</span>}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default AdminSidebar;
