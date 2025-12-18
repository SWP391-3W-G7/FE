import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, User, MapPin, Send, MessageSquare, Package } from 'lucide-react';

// API
import { useGetPendingClaimsQuery, useRequestMoreInfoMutation, useVerifyClaimMutation } from '@/features/items/itemApi';

// UI
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- TYPES DEFINITION ---
export interface Evidence {
    evidenceId: number;
    title: string;
    description: string;
    createdAt: string;
    imageUrls: string[];
}

export interface Claim {
    claimId: number;
    claimDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    foundItemId: number | null;
    lostItemId: number | null;
    foundItemTitle: string | null;
    studentId: number;
    studentName: string | null;
    evidences: Evidence[];
    actionLogs: string;
}

export const ClaimsManagement = () => {
    const { toast } = useToast();
    const { data: claims, isLoading } = useGetPendingClaimsQuery();

    const [verifyClaim, { isLoading: isProcessing }] = useVerifyClaimMutation();
    const [requestMoreInfo, { isLoading: isRequesting }] = useRequestMoreInfoMutation();

    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // State cho Request Info (Nội dung này sẽ map vào 'description')
    const [infoMessage, setInfoMessage] = useState("");
    const [showRequestDialog, setShowRequestDialog] = useState(false);

    // --- HANDLERS ---
    
    // ĐÃ SỬA: Hàm này giờ gửi đúng 4 trường: claimId, title, description, images
    const handleRequestInfo = async () => {
        if (!selectedClaim || !infoMessage) return;
        try {
            await requestMoreInfo({ 
                claimId: selectedClaim.claimId, 
                title: "Yêu cầu bổ sung thông tin", // Title bắt buộc: Đặt mặc định hoặc thêm input nếu cần
                description: infoMessage,           // Map nội dung admin nhập vào description
                images: []                          // Mảng rỗng (string[]) vì admin không up ảnh
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

    const handleApprove = async () => {
        if (!selectedClaim) return;
        try {
            await verifyClaim({ claimId: selectedClaim.claimId, status: 'Approved' }).unwrap();
            toast({ title: "Đã duyệt yêu cầu!", description: "Sinh viên sẽ nhận được thông báo đến nhận đồ." });
            setIsOpen(false);
        } catch (e) { console.error(e); }
    };

    const handleReject = async () => {
        if (!selectedClaim) return;
        try {
            await verifyClaim({ claimId: selectedClaim.claimId, status: 'Rejected', reason: rejectReason }).unwrap();
            toast({ variant: "destructive", title: "Đã từ chối", description: "Yêu cầu đã bị hủy bỏ." });
            setIsOpen(false);
        } catch (e) { console.error(e); }
    };

    // --- RENDER ---
    if (isLoading) return <div className="p-4 text-center text-slate-500">Đang tải danh sách yêu cầu...</div>;

    // Ensure claims is an array
    const claimsArray = Array.isArray(claims) ? claims : [];

    return (
        <div className="bg-white rounded border shadow-sm">
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
                    {claimsArray.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Không có yêu cầu nào chờ duyệt.</TableCell></TableRow>
                    ) : (
                        claimsArray.map((claim) => (
                            <TableRow key={claim.claimId}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                                {claim.studentName?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{claim.studentName || "Không tên"}</div>
                                            <div className="text-xs text-slate-500">{claim.studentId}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-slate-900">{claim.foundItemTitle || "N/A"}</div>
                                    <div className="text-xs text-slate-400">ID Vật phẩm: {claim.foundItemId}</div>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                    {format(new Date(claim.claimDate), "dd/MM/yyyy HH:mm")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog open={isOpen && selectedClaim?.claimId === claim.claimId} onOpenChange={(open) => {
                                        setIsOpen(open);
                                        if (open) {
                                            setSelectedClaim(claim);
                                            setRejectReason("");
                                            setShowRequestDialog(false);
                                        }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                                <Eye className="w-4 h-4 mr-2" /> Xem xét
                                            </Button>
                                        </DialogTrigger>

                                        {/* MODAL CHI TIẾT */}
                                        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                                            <DialogHeader>
                                                <DialogTitle>Thẩm định yêu cầu #{claim.claimId}</DialogTitle>
                                                <DialogDescription>So sánh thông tin cung cấp với vật phẩm thực tế.</DialogDescription>
                                            </DialogHeader>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 flex-1 overflow-hidden">
                                                {/* CỘT TRÁI: THÔNG TIN VẬT PHẨM */}
                                                <Card className="p-4 bg-slate-50 border-slate-200 h-full overflow-y-auto">
                                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-orange-500" /> Vật phẩm yêu cầu
                                                    </h4>
                                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-100 mb-4">
                                                        <Package className="w-12 h-12 text-slate-300 mb-2" />
                                                        <p className="text-sm text-slate-500">Hình ảnh vật phẩm gốc không có trong dữ liệu Claim.</p>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <p><strong>Tên vật phẩm:</strong> {claim.foundItemTitle}</p>
                                                        <p><strong>ID Hệ thống:</strong> {claim.foundItemId}</p>
                                                        <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-100 mt-2">
                                                            <MapPin className="w-3 h-3 inline mr-1" />
                                                            Vui lòng kiểm tra ID này trong Kho hàng để xác định vị trí lưu trữ.
                                                        </div>
                                                    </div>
                                                </Card>

                                                {/* CỘT PHẢI: BẰNG CHỨNG SV CUNG CẤP */}
                                                <Card className="p-4 bg-blue-50/50 border-blue-100 h-full flex flex-col">
                                                    <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2 shrink-0">
                                                        <User className="w-4 h-4" /> Bằng chứng từ sinh viên
                                                    </h4>
                                                    <ScrollArea className="flex-1 pr-4">
                                                        {claim.evidences && claim.evidences.length > 0 ? (
                                                            <div className="space-y-6">
                                                                {claim.evidences.map((ev, index) => (
                                                                    <div key={ev.evidenceId || index} className="border-b border-blue-200 pb-4 last:border-0 last:pb-0">
                                                                        <div className="font-semibold text-sm text-blue-900 mb-1">
                                                                            #{index + 1}: {ev.title}
                                                                        </div>
                                                                        {ev.imageUrls && ev.imageUrls.length > 0 && (
                                                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                                                {ev.imageUrls.map((url, imgIdx) => (
                                                                                    <div key={imgIdx} className="aspect-square rounded overflow-hidden border bg-white">
                                                                                        <img src={url} alt={`Evidence ${imgIdx}`} className="w-full h-full object-cover" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        <div className="bg-white p-3 rounded text-sm text-slate-700 border border-slate-200 italic">
                                                                            "{ev.description}"
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-400 mt-1 text-right">
                                                                            Gửi lúc: {format(new Date(ev.createdAt), "dd/MM HH:mm")}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-10 text-slate-500 italic">
                                                                Sinh viên chưa gửi bằng chứng nào.
                                                            </div>
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
                                                            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
                                                                Từ chối
                                                            </Button>
                                                            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isProcessing}>
                                                                Duyệt
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full space-y-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                                                            <label className="text-sm font-medium text-yellow-800">Nhắn tin cho sinh viên:</label>
                                                            <Textarea
                                                                placeholder="VD: Em vui lòng chụp thêm ảnh mặt sau của thẻ..."
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
                                </TableCell>
                            </TableRow>
                        ))
                    )})()
                </TableBody>
            </Table>
        </div>
    );
};