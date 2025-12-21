import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, User, MapPin, Send, MessageSquare, Package, Check, X, Clock, AlertTriangle, ChevronLeft, ChevronRight, History } from 'lucide-react';

// API
import { useGetClaimByIdQuery, useRequestMoreInfoMutation, useVerifyClaimMutation, useUpdateClaimStatusMutation, useGetMatchByIdQuery, useGetPendingClaimsQuery, useGetConflictedClaimsQuery, useGetMatchingItemsQuery } from '@/features/claims/claimApi';
import { useGetFoundItemDetailsQuery, useGetCategoriesQuery, useGetCampusesForAdminQuery, useGetLostItemByIdQuery } from '@/features/items/itemApi';

// UI
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
import { type Claim, type Evidence, type ActionLog } from '@/types';

// Robust Property Helpers
const getProp = (obj: any, keys: string[]) => {
    if (!obj) return undefined;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return undefined;
};

const getItemImages = (item: any): string[] => {
    if (!item) return [];
    const urls = getProp(item, ['imageUrls', 'ImageUrls']);
    if (Array.isArray(urls) && urls.length > 0) return urls;
    const singleUrl = getProp(item, ['imageUrl', 'ImageUrl', 'thumbnail', 'Thumbnail']);
    if (typeof singleUrl === 'string' && singleUrl) return [singleUrl];
    return [];
};

const getItemTitle = (item: any) => getProp(item, ['title', 'Title']) || "N/A";
const getItemId = (item: any) => getProp(item, ['foundItemId', 'FoundItemId', 'lostItemId', 'LostItemId', 'id', 'Id']);

const getItemCategory = (item: any, categories?: any[]) => {
    const name = getProp(item, ['categoryName', 'CategoryName']);
    if (name) return name;
    const id = getProp(item, ['categoryId', 'CategoryId', 'categoryID', 'CategoryID']);
    if (id && categories) {
        const idNum = Number(id);
        const cat = categories.find(c => Number(getProp(c, ['categoryId', 'CategoryId'])) === idNum);
        return getProp(cat, ['categoryName', 'CategoryName']) || "N/A";
    }
    return "N/A";
};

const getItemLocation = (item: any) => getProp(item, ['foundLocation', 'FoundLocation', 'lostLocation', 'LostLocation']) || "N/A";
const getItemDate = (item: any) => getProp(item, ['foundDate', 'FoundDate', 'lostDate', 'LostDate', 'createdAt', 'CreatedAt', 'claimDate', 'ClaimDate']);

const getItemCampus = (item: any, campuses?: any[]) => {
    const name = getProp(item, ['campusName', 'CampusName']);
    if (name) return name;
    const id = getProp(item, ['campusId', 'CampusId', 'campusID', 'CampusID']);
    if (id && campuses) {
        const idNum = Number(id);
        const camp = campuses.find(c => Number(getProp(c, ['campusId', 'CampusId'])) === idNum);
        return getProp(camp, ['campusName', 'CampusName']) || "N/A";
    }
    return "N/A";
};

const getItemDescription = (item: any) => getProp(item, ['description', 'Description']) || "N/A";

const ClaimActionLogs = ({ logs }: { logs: ActionLog[] }) => {
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

const FoundItemDetailView = ({ itemId }: { itemId: number }) => {
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
                        <span>{getItemDate(item) ? format(new Date(getItemDate(item)), "dd/MM/yyyy") : "N/A"}</span>
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

const LostItemDetailView = ({ itemId }: { itemId: number }) => {
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
                        <Clock className="w-3 h-3" /> {getItemDate(item) ? format(new Date(getItemDate(item)), "dd/MM/yyyy") : "N/A"}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MatchComparisonDialog = ({ matchId, isOpen, onOpenChange }: { matchId: number, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { data: match, isLoading, error } = useGetMatchByIdQuery(matchId, { skip: !matchId || !isOpen });
    const { data: categories } = useGetCategoriesQuery();
    const { data: campuses } = useGetCampusesForAdminQuery();

    if (!matchId) return null;

    const renderItemCard = (title: string, item: any, type: 'lost' | 'found', categories?: any[], campuses?: any[]) => (
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
                        {renderItemCard("Tin báo mất (Sinh viên)", getProp(match, ['lostItem', 'LostItem']), 'lost', categories, campuses)}
                        {renderItemCard("Vật phẩm nhặt được (Kho)", getProp(match, ['foundItem', 'FoundItem']), 'found', categories, campuses)}
                    </div>
                )}

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">Liên hệ sinh viên</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const ClaimsManagement = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("pending");

    // Pagination states for each tab
    const [pendingPage, setPendingPage] = useState(0);
    const [conflictedPage, setConflictedPage] = useState(0);
    const [matchesPage, setMatchesPage] = useState(0);
    const pageSize = 10;

    // Fetch reference data for ID-to-Name resolution
    const { data: campuses } = useGetCampusesForAdminQuery();

    // Fetching data for all tabs to get counts for badges
    const { data: pendingData, isLoading: isLoadingPending } = useGetPendingClaimsQuery({ pageNumber: pendingPage + 1, pageSize });
    const { data: conflictedData, isLoading: isLoadingConflicted } = useGetConflictedClaimsQuery({ pageNumber: conflictedPage + 1, pageSize });
    const { data: matchingData, isLoading: isLoadingMatches } = useGetMatchingItemsQuery({ pageNumber: matchesPage + 1, pageSize });

    // Extract items safely
    const pendingClaims = (pendingData as any)?.items || pendingData?.items || [];
    const conflictedClaims = (conflictedData as any)?.items || conflictedData?.items || [];
    const matches = matchingData?.items || [];

    const isLoading = activeTab === "pending" ? isLoadingPending : activeTab === "conflicted" ? isLoadingConflicted : isLoadingMatches;

    // Total counts and pagination info for the active tab
    const activeData = activeTab === "pending" ? pendingData : activeTab === "conflicted" ? conflictedData : matchingData;
    const currentPage = activeTab === "pending" ? pendingPage : activeTab === "conflicted" ? conflictedPage : matchesPage;
    const totalPages = activeData?.totalPages || 0;
    const totalCount = activeData?.totalCount || 0;
    const hasNext = activeData?.hasNext || false;

    const handlePageChange = (newPage: number) => {
        if (activeTab === "pending") setPendingPage(newPage);
        else if (activeTab === "conflicted") setConflictedPage(newPage);
        else setMatchesPage(newPage);
    };

    const [verifyClaim, { isLoading: isVerifying }] = useVerifyClaimMutation();
    const [updateClaimStatus, { isLoading: isStatusUpdating }] = useUpdateClaimStatusMutation();
    const [requestMoreInfo, { isLoading: isRequesting }] = useRequestMoreInfoMutation();

    const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
    const { data: fullClaim, isLoading: isDetailLoading } = useGetClaimByIdQuery(selectedClaimId || 0, { skip: !selectedClaimId });

    const isProcessing = isVerifying || isStatusUpdating;

    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // State cho Tự đối chiếu (Matches)
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
    const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);

    // State cho Request Info
    const [infoMessage, setInfoMessage] = useState("");
    const [showRequestDialog, setShowRequestDialog] = useState(false);

    // --- HANDLERS ---

    const handleRequestInfo = async () => {
        if (!selectedClaim || !infoMessage) return;
        try {
            await requestMoreInfo({
                claimId: selectedClaim.claimId,
                title: "Yêu cầu bổ sung thông tin",
                description: infoMessage,
                images: []
            }).unwrap();

            toast({ title: "Đã gửi yêu cầu", description: "Hệ thống đã cập nhật yêu cầu bổ sung bằng chứng." });
            setShowRequestDialog(false);
            setIsOpen(false);
            setInfoMessage("");
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể gửi yêu cầu." });
        }
    };

    const handleApprove = async (claimId?: number) => {
        const targetId = claimId || selectedClaim?.claimId;
        if (!targetId) return;
        try {
            await updateClaimStatus({ claimId: targetId, status: 'Approved' }).unwrap();
            toast({ title: "Đã duyệt yêu cầu!", description: "Sinh viên sẽ nhận được thông báo đến nhận đồ." });
            setIsOpen(false);
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể duyệt yêu cầu." });
        }
    };

    const handleReject = async (claimId?: number) => {
        const targetId = claimId || selectedClaim?.claimId;
        if (!targetId) return;

        try {
            if (!claimId && rejectReason) {
                await verifyClaim({ claimId: targetId, status: 'Rejected', reason: rejectReason }).unwrap();
            } else {
                await updateClaimStatus({ claimId: targetId, status: 'Rejected' }).unwrap();
            }
            toast({ variant: "destructive", title: "Đã từ chối", description: "Yêu cầu đã bị hủy bỏ." });
            setIsOpen(false);
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể từ chối yêu cầu." });
        }
    };

    // --- RENDER HELPERS ---
    const renderClaimsTable = (claimsList: Claim[], emptyMessage: string) => (
        <div className="bg-white rounded border shadow-sm border-blue-100">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Người yêu cầu</TableHead>
                        <TableHead>Món đồ claim</TableHead>
                        <TableHead>Ngày gửi</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {claimsList.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        claimsList.map((claim: Claim) => (
                            <TableRow key={claim.claimId} className="hover:bg-blue-50/30 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 ring-1 ring-slate-200">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                                {claim.studentName?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm">{claim.studentName || "Không tên"}</div>
                                            <div className="text-[10px] text-slate-500 font-mono">{claim.studentId}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-slate-900 text-sm truncate max-w-[200px]">{getProp(claim, ['foundItemTitle', 'FoundItemTitle']) || "N/A"}</div>
                                    <div className="text-[10px] text-slate-400">ID Vật phẩm: {getProp(claim, ['foundItemId', 'FoundItemId'])}</div>
                                </TableCell>
                                <TableCell className="text-slate-500 text-xs">
                                    {format(new Date(claim.claimDate), "dd/MM/yyyy HH:mm")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => handleApprove(claim.claimId)}
                                            disabled={isProcessing}
                                            title="Duyệt"
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleReject(claim.claimId)}
                                            disabled={isProcessing}
                                            title="Từ chối"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                                            onClick={() => {
                                                setSelectedClaim(claim);
                                                setSelectedClaimId(claim.claimId);
                                                setIsOpen(true);
                                                setShowRequestDialog(false);
                                                setRejectReason("");
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> Xem
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const renderGroupedClaimsTable = (claimsList: Claim[], emptyMessage: string) => {
        if (claimsList.length === 0) {
            return (
                <div className="bg-white rounded border border-red-100 shadow-sm text-center py-10 text-slate-400 italic">
                    {emptyMessage}
                </div>
            );
        }

        // Group by foundItemId
        const groups = claimsList.reduce((acc: Record<number, { title: string, items: Claim[] }>, claim) => {
            const id = Number(getProp(claim, ['foundItemId', 'FoundItemId'])) || 0;
            if (!acc[id]) {
                acc[id] = {
                    title: getProp(claim, ['foundItemTitle', 'FoundItemTitle']) || "Vật phẩm không xác định",
                    items: []
                };
            }
            acc[id].items.push(claim);
            return acc;
        }, {});

        return (
            <div className="space-y-6">
                {Object.entries(groups).map(([itemId, group]: [string, any]) => (
                    <div key={itemId} className="bg-white rounded border border-red-100 shadow-sm overflow-hidden">
                        <div className="bg-red-50/50 px-4 py-2 border-b border-red-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-red-500" />
                                <span className="font-bold text-slate-800 text-sm">Vật phẩm: {group.title}</span>
                                <Badge variant="outline" className="text-[10px] font-mono border-red-200 text-red-700 bg-white">ID: {itemId}</Badge>
                            </div>
                            <Badge className="bg-red-500 text-white text-[10px]">{group.items.length} yêu cầu tranh chấp</Badge>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30">
                                    <TableHead className="w-[200px]">Người yêu cầu</TableHead>
                                    <TableHead>Ngày gửi</TableHead>
                                    <TableHead>Loại bằng chứng</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {group.items.map((claim: Claim) => (
                                    <TableRow key={claim.claimId} className="hover:bg-red-50/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-7 w-7 ring-1 ring-red-100">
                                                    <AvatarFallback className="bg-red-50 text-red-600 text-[10px] font-bold">
                                                        {claim.studentName?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-xs text-slate-700">{claim.studentName || "Không tên"}</div>
                                                    <div className="text-[9px] text-slate-400 font-mono italic">{claim.studentId}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-[11px]">
                                            {format(new Date(claim.claimDate), "dd/MM/yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {claim.evidences && claim.evidences.length > 0 ? (
                                                    <Badge variant="outline" className="text-[9px] h-4 bg-blue-50 text-blue-600 border-blue-100">
                                                        {claim.evidences.length} bằng chứng
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[9px] h-4 text-slate-400 italic">No evidence</Badge>
                                                )}
                                                {claim.priority === 'High' && <Badge className="bg-orange-500 text-[9px] h-4 border-none">Ưu tiên</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleApprove(claim.claimId)}
                                                    disabled={isProcessing}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleReject(claim.claimId)}
                                                    disabled={isProcessing}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-[10px] border-red-100 text-red-700 hover:bg-red-50"
                                                    onClick={() => {
                                                        setSelectedClaim(claim);
                                                        setSelectedClaimId(claim.claimId);
                                                        setIsOpen(true);
                                                        setShowRequestDialog(false);
                                                        setRejectReason("");
                                                    }}
                                                >
                                                    <Eye className="w-3.5 h-3.5 mr-1" /> Chi tiết
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}
            </div>
        );
    };

    // --- RENDER ---
    if (isLoading) return <div className="p-12 text-center text-slate-500 font-medium">Đang tải danh sách công việc...</div>;

    return (
        <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/50 p-1 h-12">
                <TabsTrigger value="pending" className="gap-2 text-sm font-medium">
                    <MessageSquare className="w-4 h-4" />
                    Chờ xử lý ({pendingData?.totalCount || 0})
                </TabsTrigger>
                <TabsTrigger value="conflicted" className="gap-2 text-sm font-medium data-[state=active]:text-red-700 data-[state=active]:bg-red-50">
                    <AlertTriangle className={`w-4 h-4 ${conflictedClaims.length > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                    Tranh chấp ({conflictedData?.totalCount || 0})
                </TabsTrigger>
                <TabsTrigger value="matches" className="gap-2 text-sm font-medium">
                    <Send className="w-4 h-4" />
                    Tự đối chiếu ({matchingData?.totalCount || 0})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-0">
                {renderClaimsTable(pendingClaims, "Không có yêu cầu nào đang chờ xử lý.")}
            </TabsContent>

            <TabsContent value="conflicted" className="mt-0">
                {renderGroupedClaimsTable(conflictedClaims, "Hiện không có tranh chấp nào.")}
            </TabsContent>

            <TabsContent value="matches" className="mt-0">
                <div className="bg-white rounded border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead>Món Báo Mất (Student)</TableHead>
                                <TableHead>Món Nhặt Được (Inventory)</TableHead>
                                <TableHead>Ngày Match</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-slate-400 italic">
                                        Không có cặp đối chiếu tự động nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                matches.map((match: any) => (
                                    <TableRow key={match.matchId} className="hover:bg-slate-50/30">
                                        <TableCell>
                                            <div className="font-medium text-slate-900 text-sm">{getItemTitle(getProp(match, ['lostItem', 'LostItem']))}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                ID: {getItemId(getProp(match, ['lostItem', 'LostItem']))} • {getItemCampus(getProp(match, ['lostItem', 'LostItem']), campuses)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900 text-sm">{getItemTitle(getProp(match, ['foundItem', 'FoundItem']))}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                ID: {getItemId(getProp(match, ['foundItem', 'FoundItem']))} • {getItemCampus(getProp(match, ['foundItem', 'FoundItem']), campuses)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs">
                                            {format(new Date(match.createdAt), "dd/MM/yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50"
                                                onClick={() => {
                                                    setSelectedMatchId(match.matchId);
                                                    setIsMatchDialogOpen(true);
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-2" /> Xem xét
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-4 bg-slate-50 border-t border-x border-b rounded-b-lg">
                <div className="text-sm text-slate-500">
                    Trang <strong>{currentPage + 1}</strong> / {Math.max(1, totalPages)}
                    <span className="mx-2 text-slate-300">|</span>
                    Tổng số: {totalCount} yêu cầu
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0 || isLoading}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNext || isLoading}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* DIALOGS */}
            <MatchComparisonDialog
                matchId={selectedMatchId || 0}
                isOpen={isMatchDialogOpen}
                onOpenChange={setIsMatchDialogOpen}
            />

            {/* SHARED CLAIM DETAIL DIALOG */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Thẩm định yêu cầu #{selectedClaim?.claimId}
                            <Badge variant={selectedClaim?.status === 'Conflicted' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                                {selectedClaim?.status === 'Conflicted' ? 'Tranh chấp' : selectedClaim?.status}
                            </Badge>
                            {selectedClaim?.priority === 'High' && (
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-[10px] h-5 border-none">
                                    Ưu tiên cao
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>So sánh thông tin cung cấp với vật phẩm thực tế và xem lịch sử xử lý.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 flex-1 overflow-hidden">
                        {/* CỘT 1: THÔNG TIN VẬT PHẨM */}
                        <Card className="p-4 bg-slate-50 border-slate-200 h-full flex flex-col shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 shrink-0">
                                <Package className="w-4 h-4 text-orange-500" /> Vật phẩm gốc
                            </h4>
                            <ScrollArea className="flex-1 max-h-[350px] pr-4">
                                {selectedClaim?.foundItemId ? (
                                    <FoundItemDetailView itemId={selectedClaim.foundItemId} />
                                ) : (
                                    <div className="text-center py-10 text-slate-500 italic text-xs">
                                        Không xác định được ID vật phẩm.
                                    </div>
                                )}
                            </ScrollArea>
                        </Card>

                        {/* CỘT 2: BẰNG CHỨNG SV CUNG CẤP */}
                        <Card className="p-4 bg-white border-blue-100 h-full flex flex-col shadow-sm">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2 shrink-0">
                                <User className="w-4 h-4" /> Bằng chứng & Tin báo mất
                            </h4>
                            <ScrollArea className="flex-1 max-h-[350px] pr-4">
                                {selectedClaim?.lostItemId && (
                                    <LostItemDetailView itemId={selectedClaim.lostItemId} />
                                )}
                                {(() => {
                                    const evidences = fullClaim?.evidences || selectedClaim?.evidences || [];
                                    return evidences.length > 0 ? (
                                    <div className="space-y-6">
                                        {evidences.map((ev: Evidence, index: number) => (
                                            <div key={ev.evidenceId || index} className="border-b border-blue-50 pb-4 last:border-0 last:pb-0">
                                                <div className="font-semibold text-sm text-blue-900 mb-1">
                                                    #{index + 1}: {ev.title}
                                                </div>
                                                {ev.imageUrls && ev.imageUrls.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                        {ev.imageUrls.map((url: string, imgIdx: number) => (
                                                            <div key={imgIdx} className="aspect-square rounded overflow-hidden border bg-white shadow-sm">
                                                                <img src={url} alt={`Evidence ${imgIdx}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="bg-slate-50 p-3 rounded text-xs text-slate-700 border border-slate-100 italic">
                                                    "{ev.description}"
                                                </div>
                                                <div className="text-[9px] text-slate-400 mt-1 text-right italic font-mono">
                                                    {format(new Date(ev.createdAt), "dd/MM/yyyy HH:mm")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-slate-400 italic text-xs">
                                        Sinh viên chưa gửi bằng chứng nào.
                                    </div>
                                );
                                })()}
                            </ScrollArea>
                        </Card>

                        {/* CỘT 3: LỊCH SỬ XỬ LÝ (ACTION LOGS) */}
                        <Card className="p-4 bg-slate-50 border-slate-200 h-full flex flex-col shadow-sm">
                            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 shrink-0">
                                <Clock className="w-4 h-4 text-blue-500" /> Lịch sử yêu cầu
                            </h4>
                            <ScrollArea className="flex-1 pr-2">
                                {isDetailLoading ? (
                                    <div className="space-y-3 p-2">
                                        <div className="h-20 bg-slate-200/50 animate-pulse rounded" />
                                        <div className="h-20 bg-slate-200/50 animate-pulse rounded" />
                                    </div>
                                ) : (
                                    <ClaimActionLogs logs={fullClaim?.actionLogs || []} />
                                )}
                            </ScrollArea>
                        </Card>
                    </div>

                    <div className="mt-4 shrink-0">
                        {!showRequestDialog && (
                            <div className="mb-4">
                                <label className="text-sm font-medium mb-1.5 block">Lý do từ chối (Nếu chọn Reject):</label>
                                <Textarea
                                    placeholder="VD: Ảnh xác minh không khớp, mô tả sai màu sắc..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="h-20"
                                />
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
                            {!showRequestDialog ? (
                                <div className="flex w-full gap-2 justify-end">
                                    <Button variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-50" onClick={() => setShowRequestDialog(true)}>
                                        <MessageSquare className="w-4 h-4 mr-2" /> Yêu cầu thêm info
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleReject()} disabled={isProcessing}>
                                        Từ chối
                                    </Button>
                                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove()} disabled={isProcessing}>
                                        Duyệt
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-full space-y-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                                    <label className="text-sm font-medium text-yellow-800">Nhắn tin cho sinh viên:</label>
                                    <Textarea
                                        placeholder="Em vui lòng chụp thêm ảnh mặt sau của thẻ..."
                                        className="bg-white min-h-[80px]"
                                        value={infoMessage}
                                        onChange={(e) => setInfoMessage(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setShowRequestDialog(false)}>Hủy</Button>
                                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={handleRequestInfo} disabled={isRequesting}>
                                            <Send className="w-3 h-3 mr-1" /> Gửi yêu cầu
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </Tabs>
    );
};
