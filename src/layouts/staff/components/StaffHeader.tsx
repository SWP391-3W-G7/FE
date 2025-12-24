import { Bell, Menu, Search, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, selectCurrentUser } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface StaffHeaderProps {
    onMenuClick: () => void;
    onToggleSidebar: () => void;
    isCollapsed: boolean;
}

const StaffHeader = ({ onMenuClick, onToggleSidebar, isCollapsed }: StaffHeaderProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector(selectCurrentUser);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex text-slate-400 hover:text-orange-600"
                    onClick={onToggleSidebar}
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>

                <div className="hidden lg:flex items-center relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm nhanh..."
                        className="pl-9 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-orange-500 h-9 text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-orange-600">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 border-2 border-white rounded-full" />
                </Button>

                <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 h-10 rounded-full hover:bg-slate-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.fullName}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-medium">{user?.role}</p>
                            </div>
                            <Avatar className="h-8 w-8 border border-slate-200">
                                <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName} />
                                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                                    {user?.fullName?.charAt(0).toUpperCase() || "S"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user?.fullName}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                <Badge variant="secondary" className="mt-1 w-fit text-[10px] uppercase">
                                    {user?.role}
                                </Badge>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default StaffHeader;
