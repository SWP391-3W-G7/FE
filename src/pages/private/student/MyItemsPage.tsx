import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useGetMyLostItemsQuery,
    useGetMyFoundItemsQuery,
    useDeleteLostItemMutation,
    useDeleteFoundItemMutation
} from '@/features/items/itemApi';
import { useGetMyClaimsQuery } from '@/features/claims/claimApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Loader2, Package, Search, History,
    CheckCircle2, Clock, XCircle,
    Pencil, Trash2, AlertCircle,
    ChevronLeft, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatVN = (dateStr: string) => {
    try {
        return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
        return dateStr;
    }
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status.toLowerCase()) {
        case 'open':
            return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Đang tìm</Badge>;
        case 'resolved':
        case 'found':
            return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Đã giải quyết</Badge>;
        case 'closed':
            return <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">Đã đóng</Badge>;
        case 'pending':
            return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Chờ duyệt</Badge>;
        case 'approved':
            return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Đã duyệt</Badge>;
        case 'rejected':
            return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Bị từ chối</Badge>;
        case 'returned':
            return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Đã nhận đồ</Badge>;
        case 'stored':
            return <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">Đã lưu kho</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

const MyItemsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Read default tab from navigation state (e.g., from ClaimForm)
    const defaultTab = (location.state as { defaultTab?: string })?.defaultTab || 'lost-items';

    const { data: lostItems = [], isLoading: loadingLost } = useGetMyLostItemsQuery();
    const { data: foundItems = [], isLoading: loadingFound } = useGetMyFoundItemsQuery();
    const { data: claims = [], isLoading: loadingClaims } = useGetMyClaimsQuery();

    const [deleteLostItem] = useDeleteLostItemMutation();
    const [deleteFoundItem] = useDeleteFoundItemMutation();

    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        type: 'lost' | 'found';
        id: number;
        title: string;
    } | null>(null);

    // Pagination state for claims
    const [claimsPage, setClaimsPage] = useState(1);
    const CLAIMS_PER_PAGE = 6;
    const totalClaimsPages = Math.ceil(claims.length / CLAIMS_PER_PAGE);
    const paginatedClaims = claims.slice(
        (claimsPage - 1) * CLAIMS_PER_PAGE,
        claimsPage * CLAIMS_PER_PAGE
    );

    const handleDelete = async () => {
        if (!deleteDialog) return;
        try {
            if (deleteDialog.type === 'lost') {
                await deleteLostItem(deleteDialog.id).unwrap();
            } else {
                await deleteFoundItem(deleteDialog.id).unwrap();
            }
            toast({
                title: "Thành công",
                description: `Đã xóa tin báo "${deleteDialog.title}"`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể xóa tin báo lúc này.",
            });
        } finally {
            setDeleteDialog(null);
        }
    };

    if (loadingLost || loadingFound || loadingClaims) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý mục cá nhân</h1>
                    <p className="text-slate-500">Xem và quản lý các tin báo mất, tin báo tìm và yêu cầu nhận đồ của bạn.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/report-lost')} className="bg-orange-600 hover:bg-orange-700">
                        Báo mất đồ
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/report-found')} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        Báo nhặt đồ
                    </Button>
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-6">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full max-w-2xl border">
                    <TabsTrigger value="lost-items" className="flex-1 gap-2 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm">
                        <Search className="h-4 w-4" />
                        <span>Tin báo mất ({lostItems.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="found-items" className="flex-1 gap-2 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                        <Package className="h-4 w-4" />
                        <span>Tin báo tìm ({foundItems.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="claims" className="flex-1 gap-2 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">
                        <History className="h-4 w-4" />
                        <span>Yêu cầu nhận đồ ({claims.length})</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="lost-items" className="space-y-4 outline-none">
                    {lostItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lostItems.map((item) => (
                                <Card key={item.lostItemId} className="flex flex-col overflow-hidden hover:shadow-lg transition-all border-slate-200">
                                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden group">
                                        {item.imageUrls && item.imageUrls.length > 0 ? (
                                            <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Package className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <StatusBadge status={item.status} />
                                        </div>
                                    </div>
                                    <CardHeader className="p-4 space-y-1">
                                        <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{item.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 font-medium text-slate-500">
                                            {item.categoryName} <span className="text-slate-300">•</span> {item.campusName}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-sm flex-1">
                                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded">
                                            <Clock className="h-4 w-4 text-orange-500" />
                                            <span>Mất ngày: {formatVN(item.lostDate)}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 border-t bg-slate-50/50 flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => navigate(`/edit-lost/${item.lostItemId}`)}
                                            disabled={item.status !== 'Open'}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => setDeleteDialog({ isOpen: true, type: 'lost', id: item.lostItemId, title: item.title })}
                                            disabled={item.status !== 'Open'}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Xóa
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Search className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Chưa có tin báo mất nào</h3>
                            <p className="text-slate-500 mt-2 max-w-xs text-center">Các món đồ bạn báo mất sẽ xuất hiện tại đây để bạn dễ dàng theo dõi.</p>
                            <Button variant="link" onClick={() => navigate('/report-lost')} className="mt-4 text-orange-600 font-bold">
                                Tạo tin báo mất đồ ngay &rarr;
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="found-items" className="space-y-4 outline-none">
                    {foundItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {foundItems.map((item) => (
                                <Card key={item.foundItemId} className="flex flex-col overflow-hidden hover:shadow-lg transition-all border-slate-200">
                                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden group">
                                        {item.imageUrls && item.imageUrls.length > 0 ? (
                                            <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Package className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <StatusBadge status={item.status} />
                                        </div>
                                    </div>
                                    <CardHeader className="p-4 space-y-1">
                                        <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{item.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 font-medium text-slate-500">
                                            {item.categoryName} <span className="text-slate-300">•</span> {item.campusName}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-sm flex-1">
                                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <span>Nhặt ngày: {formatVN(item.foundDate)}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 border-t bg-slate-50/50 flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => navigate(`/edit-found/${item.foundItemId}`)}
                                            disabled={item.status !== 'Open'}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => setDeleteDialog({ isOpen: true, type: 'found', id: item.foundItemId, title: item.title })}
                                            disabled={item.status !== 'Open'}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Xóa
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Package className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Chưa có tin báo tìm nào</h3>
                            <p className="text-slate-500 mt-2 max-w-xs text-center">Cảm ơn bạn đã có ý định giúp đỡ cộng đồng tìm lại đồ thất lạc.</p>
                            <Button variant="link" onClick={() => navigate('/report-found')} className="mt-4 text-blue-600 font-bold">
                                Báo nhặt được đồ ngay &rarr;
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="claims" className="space-y-4 outline-none">
                    {claims.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedClaims.map((claim) => (
                                    <Card key={claim.claimId} className="flex flex-col overflow-hidden hover:shadow-lg transition-all border-slate-200">
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">Yêu cầu #{claim.claimId.toString().padStart(4, '0')}</CardTitle>
                                                <StatusBadge status={claim.status} />
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                <span>Ngày gửi: {formatVN(claim.claimDate)}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm flex-1 space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đồ vật liên quan:</span>
                                                <span className="font-medium text-slate-700">{claim.foundItemTitle || "Thông tin đã bị ẩn"}</span>
                                            </div>

                                            {claim.evidences && claim.evidences[0] && (
                                                <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/50 italic text-slate-600 relative overflow-hidden group">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-200"></div>
                                                    <p className="line-clamp-3">"{claim.evidences[0].description}"</p>
                                                </div>
                                            )}

                                            {claim.status === 'Approved' && (
                                                <div className="flex items-start gap-3 text-green-700 bg-green-50 p-3 rounded-xl border border-green-100 shadow-sm animate-pulse">
                                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold">Yêu cầu đã được duyệt!</p>
                                                        <p className="text-xs opacity-80">Vui lòng mang theo Thẻ sinh viên đến phòng Dịch vụ Sinh viên (P.102) tại campus của bạn để nhận lại đồ.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {claim.status === 'Rejected' && (
                                                <div className="flex items-start gap-3 text-red-700 bg-red-50 p-3 rounded-xl border border-red-100 shadow-sm">
                                                    <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold">Yêu cầu bị từ chối</p>
                                                        <p className="text-xs opacity-80">Rất tiếc, bằng chứng bạn cung cấp chưa đủ để xác minh quyền sở hữu. Vui lòng kiểm tra lại hoặc liên hệ Staff.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {claim.status === 'Pending' && (
                                                <div className="flex items-start gap-3 text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100 shadow-sm">
                                                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold">Đang chờ xử lý</p>
                                                        <p className="text-xs opacity-80">Staff sẽ kiểm tra bằng chứng của bạn trong vòng 24-48h làm việc. Vui lòng kiên nhẫn.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="p-4 border-t bg-slate-50/50">
                                            <Button variant="outline" size="sm" className="w-full text-slate-600" onClick={() => navigate(`/items/${claim.foundItemId}`)}>
                                                Xem chi tiết đồ vật nhặt được
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalClaimsPages > 1 && (
                                <div className="flex items-center justify-center gap-4 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setClaimsPage(p => Math.max(1, p - 1))}
                                        disabled={claimsPage === 1}
                                        className="gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Trước
                                    </Button>
                                    <span className="text-sm text-slate-600 font-medium">
                                        Trang {claimsPage} / {totalClaimsPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setClaimsPage(p => Math.min(totalClaimsPages, p + 1))}
                                        disabled={claimsPage === totalClaimsPages}
                                        className="gap-1"
                                    >
                                        Sau
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <History className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Chưa có yêu cầu nhận đồ nào</h3>
                            <p className="text-slate-500 mt-2 max-w-xs text-center">Khi bạn tìm thấy đồ vật của mình trong danh sách đồ nhặt được và gửi yêu cầu, chúng sẽ hiển thị ở đây.</p>
                            <Button variant="link" onClick={() => navigate('/items')} className="mt-4 text-emerald-600 font-bold">
                                Khám phá danh sách đồ nhặt được ngay &rarr;
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog?.isOpen} onOpenChange={(open) => !open && setDeleteDialog(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">Xác nhận xóa tin báo</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 pt-2">
                            Bạn có chắc chắn muốn xóa tin báo <strong className="text-slate-900">"{deleteDialog?.title}"</strong>?
                            <br /><br />
                            Hành động này <span className="text-red-600 font-bold underline">không thể hoàn tác</span>. Tin báo sẽ biến mất khỏi hệ thống và bạn sẽ không nhận được thông báo liên quan nữa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="rounded-xl border-slate-200">Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-200"
                        >
                            Xác nhận xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MyItemsPage;
