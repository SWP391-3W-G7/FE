import { useState } from 'react';
import { Search, UserCheck, Loader2, Calendar, User, FileText, Image as ImageIcon } from 'lucide-react';
import { formatDateVN } from '@/utils/dateUtils';

// API
import { useGetApprovedClaimsQuery, useUpdateClaimStatusMutation } from '@/features/claims/claimApi';

// UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Types
import type { Claim } from '@/types';

export const ReturnClaimList = () => {
    const { toast } = useToast();

    // 1. Lấy danh sách Claims đã Approved (sẵn sàng trả đồ)
    const { data: approvedClaims, isLoading } = useGetApprovedClaimsQuery();
    // 2. Hook cập nhật status claim sang Returned
    const [updateClaimStatus, { isLoading: isProcessing }] = useUpdateClaimStatusMutation();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClaim, setSelectedClaim] = useState<Claim | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Defensive data extraction - API trả về PaginatedResponse
    const allClaims: Claim[] = approvedClaims?.items || [];

    // Filter: Tìm theo tên item hoặc tên sinh viên
    const filteredClaims = allClaims.filter(claim =>
        (claim.foundItemTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (claim.lostItemTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (claim.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleConfirmReturn = async () => {
        if (!selectedClaim || !selectedClaim.claimId) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không tìm thấy Claim ID để xác nhận trả đồ." });
            return;
        }

        try {
            // Gọi API cập nhật status claim sang 'Returned'
            await updateClaimStatus({ claimId: selectedClaim.claimId, status: "Returned" }).unwrap();

            toast({
                title: "Hoàn tất trả đồ!",
                description: `Claim #${selectedClaim.claimId} đã được cập nhật trạng thái Returned.`,
                className: "bg-green-50 border-green-200 text-green-800"
            });

            setIsDialogOpen(false);
            setSelectedClaim(undefined);

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Lỗi hệ thống",
                description: "Không thể cập nhật trạng thái claim."
            });
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Đang tải danh sách claim chờ trả...</div>;

    return (
        <div className="space-y-6">
            {/* SEARCH BAR */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                        className="pl-10 h-11 text-lg"
                        placeholder="Tìm theo tên vật phẩm hoặc tên sinh viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* LIST APPROVED CLAIMS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClaims?.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded border border-dashed">
                        Không có claim nào đang chờ trả.
                    </div>
                ) : (
                    filteredClaims?.map((claim) => (
                        <Card key={claim.claimId} className="flex flex-col border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Approved - Sẵn sàng trả
                                    </Badge>
                                    <span className="text-xs font-mono text-slate-400">Claim #{claim.claimId}</span>
                                </div>
                                {/* Hiển thị thông tin item */}
                                <CardTitle className="text-lg mt-2 leading-tight min-h-[3rem] line-clamp-2">
                                    {claim.foundItemTitle || claim.lostItemTitle || "Vật phẩm không tên"}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-3">
                                {/* Evidence Images */}
                                {claim.evidences && claim.evidences.length > 0 && claim.evidences[0].imageUrls?.length > 0 && (
                                    <div className="aspect-video rounded-md overflow-hidden border bg-slate-100">
                                        <img
                                            src={claim.evidences[0].imageUrls[0]}
                                            alt="Evidence"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Thông tin chi tiết */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <User className="w-4 h-4 text-indigo-500" />
                                        <span className="font-medium">{claim.studentName || "Không rõ"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span>Ngày claim: {claim.claimDate ? formatDateVN(claim.claimDate) : "N/A"}</span>
                                    </div>
                                    {claim.priority && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <FileText className="w-4 h-4 text-orange-500" />
                                            <span>Priority: <span className={`font-medium ${claim.priority === 'High' ? 'text-red-600' : 'text-slate-700'}`}>{claim.priority}</span></span>
                                        </div>
                                    )}
                                    {claim.evidences && claim.evidences.length > 0 && (
                                        <div className="flex items-center gap-2 text-slate-500 bg-white border p-2 rounded">
                                            <ImageIcon className="w-4 h-4 text-green-500" />
                                            <span>{claim.evidences.length} bằng chứng đính kèm</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-2">
                                <Dialog open={isDialogOpen && selectedClaim?.claimId === claim.claimId} onOpenChange={(open) => {
                                    setIsDialogOpen(open);
                                    if (open) setSelectedClaim(claim);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full bg-slate-900 hover:bg-slate-800 transition-colors">
                                            <UserCheck className="mr-2 h-4 w-4" /> Xác nhận trả đồ
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Xác nhận bàn giao</DialogTitle>
                                            <DialogDescription>
                                                Thao tác này sẽ đổi trạng thái claim <strong>#{claim.claimId}</strong> thành <strong>Returned</strong>.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4 py-4 bg-slate-50 p-4 rounded text-sm border border-slate-100">
                                            <div className="space-y-2">
                                                <p><strong>Vật phẩm:</strong> {claim.foundItemTitle || claim.lostItemTitle}</p>
                                                <p><strong>Người nhận:</strong> {claim.studentName}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <input type="checkbox" id={`check1-${claim.claimId}`} className="w-4 h-4 accent-green-600 cursor-pointer" />
                                                <label htmlFor={`check1-${claim.claimId}`} className="cursor-pointer select-none">Đã xác minh người nhận</label>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <input type="checkbox" id={`check2-${claim.claimId}`} className="w-4 h-4 accent-green-600 cursor-pointer" />
                                                <label htmlFor={`check2-${claim.claimId}`} className="cursor-pointer select-none">Người nhận đã xác nhận tình trạng đồ</label>
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                                            <Button onClick={handleConfirmReturn} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                                                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Hoàn tất & Đổi trạng thái
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
