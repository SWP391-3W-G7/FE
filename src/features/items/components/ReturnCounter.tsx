import { useState } from 'react';
import { Search, UserCheck, PackageCheck, Loader2 } from 'lucide-react';

// API
import { useGetReadyToReturnItemsQuery, useUpdateClaimStatusMutation } from '@/features/claims/claimApi';

// UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Import Interface của bạn (hoặc định nghĩa lại nếu chung file)
import type { Claim } from '@/types'; // Giả sử bạn để interface ở đây

export const ReturnCounter = () => {
  const { toast } = useToast();

  // 1. Lấy danh sách Claim đã Approved
  const { data, isLoading } = useGetReadyToReturnItemsQuery();

  // 2. Hook update status Claim Request
  const [updateClaimStatus, { isLoading: isProcessing }] = useUpdateClaimStatusMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Defensive data extraction (handles flat array or paginated response)
  const allClaims: Claim[] = (data as any)?.items || (Array.isArray(data) ? data : []);

  // Filter: Tìm theo tên SV hoặc MSSV
  const filteredClaims = allClaims.filter(claim =>
    (claim.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (String(claim.studentId).toLowerCase()).includes(searchTerm.toLowerCase())
  );

  const handleConfirmReturn = async () => {
    // Check null
    if (!selectedClaim || !selectedClaim.foundItemId) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không tìm thấy ID vật phẩm." });
      return;
    }

    try {
      // --- LOGIC CHÍNH: Gọi API update Claim Request sang 'Returned' ---
      await updateClaimStatus({
        claimId: selectedClaim.claimId,
        status: 'Returned'
      }).unwrap();

      toast({
        title: "Hoàn tất trả đồ!",
        description: `Yêu cầu #${selectedClaim.claimId} đã được cập nhật trạng thái Returned.`,
        className: "bg-green-50 border-green-200 text-green-800"
      });

      setIsDialogOpen(false);
      setSelectedClaim(undefined);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi hệ thống",
        description: "Không thể cập nhật trạng thái món đồ."
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Đang tải danh sách chờ trả...</div>;

  return (
    <div className="space-y-6">
      {/* SEARCH BAR */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            className="pl-10 h-11 text-lg"
            placeholder="Nhập tên hoặc MSSV người nhận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LIST CLAIM APPROVED */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClaims?.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded border border-dashed">
            Không tìm thấy yêu cầu nào khớp với từ khóa.
          </div>
        ) : (
          filteredClaims?.map((claim) => (
            <Card key={claim.claimId} className="flex flex-col border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ready to Return
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">Claim #{claim.claimId}</span>
                </div>
                {/* Sử dụng foundItemTitle từ Claim interface */}
                <CardTitle className="text-lg mt-2 leading-tight min-h-[3rem] line-clamp-2">
                  {claim.foundItemTitle || "Vật phẩm không tên"}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Thông tin người nhận */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-md border border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                    {claim.studentName?.charAt(0) || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 truncate">{claim.studentName || "Không tên"}</p>
                    <p className="text-sm text-slate-500">{claim.studentId}</p>
                  </div>
                </div>

                {/* NOTE: Interface Claim không có location, nên mình ẩn đi hoặc hiển thị ID để tra cứu */}
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border p-2 rounded">
                  <PackageCheck className="w-4 h-4 text-orange-500" />
                  <span>ID Vật phẩm: <span className="font-mono font-bold text-slate-700">{claim.foundItemId}</span></span>
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
                        Thao tác này sẽ đổi trạng thái vật phẩm <strong>#{claim.foundItemId} - {claim.foundItemTitle}</strong> thành <strong>Returned</strong>.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 bg-slate-50 p-4 rounded text-sm border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <input type="checkbox" id="check1" className="w-4 h-4 accent-green-600 cursor-pointer" />
                        <label htmlFor="check1" className="cursor-pointer select-none">Đã kiểm tra thẻ sinh viên ({claim.studentId})</label>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <input type="checkbox" id="check2" className="w-4 h-4 accent-green-600 cursor-pointer" />
                        <label htmlFor="check2" className="cursor-pointer select-none">Sinh viên đã xác nhận tình trạng đồ</label>
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