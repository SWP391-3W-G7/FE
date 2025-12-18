import { useState } from 'react';
import { format } from 'date-fns';
import { PackageCheck, MapPin, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// API
import { useGetFoundItemsQuery, useUpdateItemStatusMutation } from '@/features/items/itemApi';

// UI Libs
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { FoundItem } from '@/types';

const ITEMS_PER_PAGE = 5;

export const IncomingItemsTable = () => {
  const { toast } = useToast();

  // 1. Lấy dữ liệu từ API
  const { data, isLoading } = useGetIncomingItemsQuery();

  // Defensive data extraction (handles flat array or paginated response)
  const rawItems = (data as any)?.items || (Array.isArray(data) ? data : []);

  // 👇 QUAN TRỌNG: Chỉ lọc lấy những item có status là 'Open'
  const openItems = rawItems.filter((item: FoundItem) => item.status === 'Open');

  // 2. Mutation update status
  const [updateItemStatus, { isLoading: isUpdating }] = useUpdateItemStatusMutation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(openItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = openItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // State cho Modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const handleOpenModal = (id: number) => {
    setSelectedItemId(id);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedItemId) return;

    try {
      await updateItemStatus({
        id: selectedItemId,
        status: 'Stored'
      }).unwrap();

      toast({
        title: "Nhập kho thành công!",
        description: `Vật phẩm #${selectedItemId} đã được chuyển sang trạng thái Stored.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-orange-500" />
        <p>Đang tải danh sách vật phẩm mới...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[80px]">Hình ảnh</TableHead>
            <TableHead className="w-[250px]">Vật phẩm</TableHead>
            <TableHead>Thông tin nhặt được</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                Không có vật phẩm nào cần nhập kho (Status: Open).
              </TableCell>
            </TableRow>
          ) : (
            paginatedItems.map((item: FoundItem) => (
              <TableRow key={item.foundItemId}>
                {/* Cột 1: Ảnh */}
                <TableCell>
                  <div className="h-12 w-12 rounded border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img
                      src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : "https://placehold.co/100?text=No+Img"}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </TableCell>

                {/* Cột 2: Tên & Danh mục */}
                <TableCell>
                  <div className="font-semibold text-slate-900 line-clamp-2" title={item.title}>
                    {item.title}
                  </div>
                  <Badge variant="secondary" className="mt-1 font-normal text-[10px]">
                    {item.categoryName}
                  </Badge>
                </TableCell>

                {/* Cột 3: Thời gian & Địa điểm */}
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm text-slate-600">
                    <div className="flex items-center gap-1" title="Nơi nhặt">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span className="line-clamp-1">{item.foundLocation}</span>
                    </div>
                    <span className="text-xs text-slate-400 ml-4">
                      {format(new Date(item.foundDate), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </TableCell>

                {/* Cột 4: Trạng thái */}
                <TableCell>
                  <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                    {item.status}
                  </Badge>
                </TableCell>

                {/* Cột 5: Nút bấm Action */}
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    className="bg-[#EC6824] hover:bg-[#EC6824]/90 text-white shadow-sm"
                    onClick={() => handleOpenModal(item.foundItemId)}
                  >
                    <PackageCheck className="w-4 h-4 mr-2" />
                    Nhập kho
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
          <span className="text-sm text-slate-500">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, openItems.length)} / {openItems.length} vật phẩm
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* MODAL CONFIRM */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              Xác nhận nhập kho
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn chuyển vật phẩm <strong>#{selectedItemId}</strong> sang trạng thái
              <span className="font-bold text-slate-900"> Đã lưu kho (Stored)</span>?
              <br /><br />
              Hành động này xác nhận rằng bạn đã nhận được vật phẩm và cất giữ an toàn.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy bỏ</Button>
            <Button onClick={handleConfirm} disabled={isUpdating} className="bg-orange-600 hover:bg-orange-700">
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận nhập kho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};