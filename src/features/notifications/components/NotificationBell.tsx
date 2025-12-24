import React from 'react';
import { Bell, Trash2, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { markAsRead, markAllAsRead, clearNotifications } from '@/features/notifications/notificationSlice';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
        case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return <Info className="h-4 w-4 text-blue-500" />;
    }
};

export const NotificationBell: React.FC = () => {
    const dispatch = useAppDispatch();
    const { notifications, unreadCount } = useAppSelector((state) => state.notifications);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-orange-600 focus-visible:ring-0">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-sm">Thông báo</h3>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => dispatch(markAllAsRead())}>
                                Đánh dấu đã đọc
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600" onClick={() => dispatch(clearNotifications())}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="h-80">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "flex gap-3 p-4 border-b last:border-0 transition-colors cursor-pointer hover:bg-slate-50",
                                        !n.isRead && "bg-blue-50/50 hover:bg-blue-50"
                                    )}
                                    onClick={() => dispatch(markAsRead(n.id))}
                                >
                                    <div className="mt-1">
                                        <NotificationIcon type={n.type} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={cn("text-sm font-medium leading-none", !n.isRead && "font-bold text-slate-900")}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: vi })}
                                        </p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="h-2 w-2 rounded-full bg-blue-600 self-center"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Không có thông báo mới</p>
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
