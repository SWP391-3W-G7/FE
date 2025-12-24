import { useState } from 'react';
import { Search, UserCheck, PackageCheck, Loader2, MapPin, Calendar } from 'lucide-react';
import { formatDateVN } from '@/utils/dateUtils';

// API
import { useGetApprovedMatchesQuery, useReturnMatchMutation } from '@/features/claims/claimApi';

// UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Types
import type { MatchedItem } from '@/types';

export const ReturnCounter = () => {
  const { toast } = useToast();

  // 1. Lấy danh sách Matches đã Approved (sẵn sàng trả đồ)
  const { data: approvedMatches, isLoading } = useGetApprovedMatchesQuery();
  // 2. Hook xác nhận trả đồ qua Matching API
  const [returnMatch, { isLoading: isProcessing }] = useReturnMatchMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<MatchedItem | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Defensive data extraction - API trả về PaginatedResponse
  const allMatches: MatchedItem[] = approvedMatches?.items || [];

  // Filter: Tìm theo tên item hoặc location
  const filteredMatches = allMatches.filter(match =>
    (match.lostItem?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (match.lostItem?.lostLocation?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleConfirmReturn = async () => {
    if (!selectedMatch || !selectedMatch.matchId) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không tìm thấy Match ID để xác nhận trả đồ." });
      return;
    }

    try {
      // Gọi API Matching/{matchId}/return để đổi status sang 'Returned'
      await returnMatch(selectedMatch.matchId).unwrap();

      toast({
        title: "Hoàn tất trả đồ!",
        description: `Vật phẩm "${selectedMatch.lostItem?.title}" đã được cập nhật trạng thái Returned.`,
        className: "bg-green-50 border-green-200 text-green-800"
      });

      setIsDialogOpen(false);
      setSelectedMatch(undefined);

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
            placeholder="Tìm theo tên vật phẩm hoặc địa điểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LIST APPROVED MATCHES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches?.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded border border-dashed">
            Không có vật phẩm nào đang chờ trả.
          </div>
        ) : (
          filteredMatches?.map((match) => (
            <Card key={match.matchId} className="flex flex-col border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ready to Return
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">Match #{match.matchId}</span>
                </div>
                {/* Hiển thị thông tin từ lostItem */}
                <CardTitle className="text-lg mt-2 leading-tight min-h-[3rem] line-clamp-2">
                  {match.lostItem?.title || "Vật phẩm không tên"}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                {/* Ảnh vật phẩm */}
                {match.lostItem?.imageUrls && match.lostItem.imageUrls.length > 0 && (
                  <div className="aspect-video rounded-md overflow-hidden border bg-slate-100">
                    <img 
                      src={match.lostItem.imageUrls[0]} 
                      alt={match.lostItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Thông tin chi tiết */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>{match.lostItem?.lostLocation || "Không rõ"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{match.lostItem?.lostDate ? formatDateVN(match.lostItem.lostDate) : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 bg-white border p-2 rounded">
                    <PackageCheck className="w-4 h-4 text-green-500" />
                    <span>Danh mục: <span className="font-medium text-slate-700">{match.lostItem?.categoryName || "N/A"}</span></span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Dialog open={isDialogOpen && selectedMatch?.matchId === match.matchId} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (open) setSelectedMatch(match);
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
                        Thao tác này sẽ đổi trạng thái vật phẩm <strong>"{match.lostItem?.title}"</strong> thành <strong>Returned</strong>.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 bg-slate-50 p-4 rounded text-sm border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <input type="checkbox" id={`check1-${match.matchId}`} className="w-4 h-4 accent-green-600 cursor-pointer" />
                        <label htmlFor={`check1-${match.matchId}`} className="cursor-pointer select-none">Đã xác minh người nhận</label>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <input type="checkbox" id={`check2-${match.matchId}`} className="w-4 h-4 accent-green-600 cursor-pointer" />
                        <label htmlFor={`check2-${match.matchId}`} className="cursor-pointer select-none">Người nhận đã xác nhận tình trạng đồ</label>
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