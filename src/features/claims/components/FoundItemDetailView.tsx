import { formatDateVN } from '@/utils/dateUtils';
import { MapPin, Clock, Package } from 'lucide-react';

// API
import { useGetFoundItemDetailsQuery, useGetCategoriesQuery, useGetCampusesForAdminQuery } from '@/features/items/itemApi';

// Utils
import { getItemImages, getItemTitle, getItemId, getItemCategory, getItemLocation, getItemDate, getItemCampus, getItemDescription } from '../utils/claimsHelpers';

interface FoundItemDetailViewProps {
    itemId: number;
}

export const FoundItemDetailView = ({ itemId }: FoundItemDetailViewProps) => {
    const { data: item, isLoading, error } = useGetFoundItemDetailsQuery(itemId);
    const { data: categories } = useGetCategoriesQuery();
    const { data: campuses } = useGetCampusesForAdminQuery();

    if (isLoading) return <div className="p-8 text-center text-slate-400">Đang tải thông tin vật phẩm...</div>;
    if (error || !item) return <div className="p-8 text-center text-red-500 text-xs italic">Không tìm thấy thông tin vật phẩm #{itemId}</div>;

    return (
        <div className="space-y-4">
            {getItemImages(item).length > 0 ? (
                <div className="grid grid-cols-1 gap-2 mb-4">
                    {getItemImages(item).map((url: string, idx: number) => (
                        <div key={idx} className="aspect-video rounded-lg overflow-hidden border bg-white shadow-sm">
                            <img src={url} alt={`Found Item ${idx}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-100 mb-4">
                    <Package className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 text-center">Không có hình ảnh vật phẩm gốc.</p>
                </div>
            )}

            <div className="space-y-3 text-sm">
                <div>
                    <h5 className="font-bold text-slate-900 leading-tight mb-1">{getItemTitle(item)}</h5>
                    <p className="text-slate-500 text-[11px] italic">#{getItemId(item)} • {getItemCategory(item, categories)}</p>
                </div>

                <div className="bg-white p-3 rounded-md border border-slate-200 text-slate-700 text-xs shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mô tả gốc:</p>
                    <p>{getItemDescription(item)}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate">{getItemLocation(item)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{getItemDate(item) ? formatDateVN(getItemDate(item)) : "N/A"}</span>
                    </div>
                </div>

                <div className="bg-blue-50 p-2 rounded text-[10px] text-blue-800 border border-blue-100 mt-2">
                    <Package className="w-3 h-3 inline mr-1" />
                    Đang được giữ tại: <strong>{getItemCampus(item, campuses)}</strong>
                </div>
            </div>
        </div>
    );
};
