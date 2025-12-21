import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { type ActionLog } from '@/types';

interface ClaimActionLogsProps {
    logs: ActionLog[];
}

export const ClaimActionLogs = ({ logs }: ClaimActionLogsProps) => {
    if (!logs || logs.length === 0) return (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Clock className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs italic">Chưa có lịch sử xử lý cho yêu cầu này.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {logs.map((log) => (
                <div key={log.actionId} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{log.actionType}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{format(new Date(log.actionDate), "dd/MM HH:mm")}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug mb-1">{log.actionDetails}</p>
                        <div className="flex items-center gap-1.5 opacity-70">
                            <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-500 font-bold">
                                {log.performedByName?.charAt(0) || "U"}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">{log.performedByName}</span>
                            {log.campusName && <span className="text-[10px] text-slate-100 bg-slate-400 px-1 rounded-sm text-[8px]">{log.campusName}</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
