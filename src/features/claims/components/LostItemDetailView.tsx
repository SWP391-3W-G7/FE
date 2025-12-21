import { formatDateVN } from '@/utils/dateUtils';
import { MapPin, Clock, History } from 'lucide-react';

// API
import { useGetLostItemByIdQuery, useGetCategoriesQuery } from '@/features/items/itemApi';

// Utils
import { getItemImages, getItemTitle, getItemId, getItemCategory, getItemLocation, getItemDate, getItemDescription } from '../utils/claimsHelpers';

interface LostItemDetailViewProps {
    itemId: number;
}

export const LostItemDetailView = ({ itemId }: LostItemDetailViewProps) => {
    const { data: item, isLoading, error } = useGetLostItemByIdQuery(itemId);
    const { data: categories } = useGetCategoriesQuery();

    if (isLoading) return <div className="p-4 text-center text-slate-400 text-xs">Đang tải tin báo mất...</div>;
    if (error || !item) return null;

    return (
        <div className="bg-orange-50/50 rounded-lg border border-orange-100 p-3 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <History className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <h5 className="text-xs font-bold text-orange-800 uppercase tracking-tight">Tin báo mất gốc của SV</h5>
            </div>

            <div className="space-y-3">
                {getItemImages(item).length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {getItemImages(item).map((url: string, idx: number) => (
                            <div key={idx} className="aspect-square rounded border bg-white overflow-hidden shadow-sm">
                                <img src={url} alt={`Lost Item ${idx}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <div className="font-bold text-slate-900 text-sm">{getItemTitle(item)}</div>
                    <div className="text-[10px] text-slate-500 font-medium">#{getItemId(item)} • {getItemCategory(item, categories)}</div>
                </div>

                <div className="text-xs text-slate-600 line-clamp-3 bg-white/50 p-2 rounded border border-orange-100/50">
                    {getItemDescription(item)}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="w-3 h-3" /> {getItemLocation(item)}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" /> {getItemDate(item) ? formatDateVN(getItemDate(item)) : "N/A"}
                    </div>
                </div>
            </div>
        </div>
    );
};
