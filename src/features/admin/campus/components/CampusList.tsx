import { Building2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { CampusCard } from './CampusCard';
import type { CampusListProps } from '../types/campus';

export const CampusList = ({ campuses, isLoading, onEdit, onDelete }: CampusListProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-52 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (campuses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Chưa có Campus nào</h3>
                <p className="text-slate-500 mt-2 max-w-sm text-center">
                    Bắt đầu bằng cách thêm cơ sở đào tạo đầu tiên vào hệ thống quản lý.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campuses.map((campus) => (
                <CampusCard
                    key={campus.campusId}
                    campus={campus}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
