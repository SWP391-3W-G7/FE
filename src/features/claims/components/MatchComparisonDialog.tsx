import { format } from 'date-fns';
import { User, MapPin, Clock, Package, Check, X, Loader2 } from 'lucide-react';

// API
import { useGetMatchByIdQuery, useConfirmMatchMutation, useDismissMatchMutation } from '@/features/claims/claimApi';
import { useGetCategoriesQuery, useGetCampusesForAdminQuery } from '@/features/items/itemApi';

// UI
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Utils
import { getProp, getItemImages, getItemTitle, getItemId, getItemCategory, getItemLocation, getItemDate, getItemCampus, getItemDescription } from '../utils/claimsHelpers';

interface MatchComparisonDialogProps {
    matchId: number;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MatchComparisonDialog = ({ matchId, isOpen, onOpenChange }: MatchComparisonDialogProps) => {
    const { toast } = useToast();
    const { data: match, isLoading, error } = useGetMatchByIdQuery(matchId, { skip: !matchId || !isOpen });
    const { data: categories } = useGetCategoriesQuery();
    const { data: campuses } = useGetCampusesForAdminQuery();

    // Mutations for confirm/dismiss
    const [confirmMatch, { isLoading: isConfirming }] = useConfirmMatchMutation();
    const [dismissMatch, { isLoading: isDismissing }] = useDismissMatchMutation();

    const isProcessing = isConfirming || isDismissing;

    if (!matchId) return null;

    const handleConfirm = async () => {
        try {
            await confirmMatch(matchId).unwrap();
            toast({
                title: "Đã duyệt matching!",
                description: `Matching #${matchId} đã được xác nhận. Sinh viên sẽ được thông báo.`,
                className: "bg-green-50 border-green-200 text-green-800"
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Confirm match error:", error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể xác nhận matching. Vui lòng thử lại."
            });
        }
    };

    const handleDismiss = async () => {
        try {
            await dismissMatch(matchId).unwrap();
            toast({
                title: "Đã từ chối matching!",
                description: `Matching #${matchId} đã bị từ chối.`,
                className: "bg-orange-50 border-orange-200 text-orange-800"
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Dismiss match error:", error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể từ chối matching. Vui lòng thử lại."
            });
        }
    };

    const renderItemCard = (title: string, item: any, type: 'lost' | 'found') => (
        <Card className={`p-4 h-full flex flex-col ${type === 'lost' ? 'bg-orange-50/30 border-orange-100' : 'bg-blue-50/30 border-blue-100'}`}>
            <h5 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                {type === 'lost' ? <User className="w-4 h-4 text-orange-500" /> : <Package className="w-4 h-4 text-blue-500" />}
                {title}
            </h5>

            {getItemImages(item).length > 0 ? (
                <div className="grid grid-cols-1 gap-2 mb-4 shrink-0">
                    <div className="aspect-video rounded-lg overflow-hidden border bg-white shadow-sm">
                        <img src={getItemImages(item)[0]} alt={type} className="w-full h-full object-cover" />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 mb-4 shrink-0">
                    <Package className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[10px] text-slate-400 italic">Không có hình ảnh</p>
                </div>
            )}

            <div className="space-y-3 flex-1">
                <div>
                    <div className="font-bold text-slate-900 text-sm leading-tight mb-1">{getItemTitle(item)}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {getItemId(item)} • {getItemCategory(item, categories)}</div>
                </div>

                <div className="bg-white/80 p-3 rounded-md border border-slate-200 text-slate-700 text-xs shadow-sm flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mô tả:</p>
                    <p className="line-clamp-4">{getItemDescription(item)}</p>
                </div>

                <div className="grid grid-cols-1 gap-1.5 mt-auto pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{getItemLocation(item)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{getItemDate(item) ? format(new Date(getItemDate(item)), "dd/MM/yyyy") : "N/A"}</span>
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-slate-100 text-[10px] font-medium text-slate-500 mt-1">
                        Cơ sở: <strong>{getItemCampus(item, campuses)}</strong>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        So sánh đối chiếu tự động #{matchId}
                        {match?.status && (
                            <Badge variant="secondary" className="text-[10px]">
                                {match.status}
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Hệ thống tự động phát hiện sự tương đồng giữa tin báo mất và vật phẩm trong kho.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-20 text-center text-slate-400">Đang tải chi tiết đối chiếu...</div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">Lỗi khi tải dữ liệu đối chiếu.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {renderItemCard("Tin báo mất (Sinh viên)", getProp(match, ['lostItem', 'LostItem']), 'lost')}
                        {renderItemCard("Vật phẩm nhặt được (Kho)", getProp(match, ['foundItem', 'FoundItem']), 'found')}
                    </div>
                )}

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleDismiss} 
                        disabled={isProcessing || isLoading}
                    >
                        {isDismissing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <X className="w-4 h-4 mr-2" /> Từ chối
                    </Button>
                    <Button 
                        className="bg-green-600 hover:bg-green-700" 
                        onClick={handleConfirm}
                        disabled={isProcessing || isLoading}
                    >
                        {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Check className="w-4 h-4 mr-2" /> Duyệt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
