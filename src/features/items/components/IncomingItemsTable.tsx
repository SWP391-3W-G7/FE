import { useState } from 'react';
import { formatVN } from '@/utils/dateUtils';
import { PackageCheck, MapPin, Loader2, AlertCircle, Bell } from 'lucide-react';

// API
import { useGetIncomingItemsQuery, useUpdateItemStatusMutation, useRequestDropoffMutation } from '@/features/items/itemApi';

// UI Libs
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import type { FoundItem } from '@/types';

export const IncomingItemsTable = () => {
  const { toast } = useToast();

  // 1. Lấy dữ liệu từ API (Chỉ lấy status 'Open' theo yêu cầu)
  const { data, isLoading } = useGetIncomingItemsQuery({ Status: 'Open', PageNumber: 1, PageSize: 20 });

  // 👇 Lấy danh sách items từ response phân trang
  const openItems = data?.items || [];

  // 2. Mutation update status
  const [updateItemStatus, { isLoading: isUpdating }] = useUpdateItemStatusMutation();
  
  // 3. Mutation request dropoff (notification)
  const [requestDropoff, { isLoading: isSendingNotification }] = useRequestDropoffMutation();

  // State cho Modal Nhập kho
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  // State cho Modal Gửi thông báo
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyItemId, setNotifyItemId] = useState<number | null>(null);
  const [notifyNote, setNotifyNote] = useState("");

  const handleOpenModal = (id: number) => {
    setSelectedItemId(id);
    setIsOpen(true);
  };
  
  const handleOpenNotifyModal = (id: number) => {
    setNotifyItemId(id);
    setNotifyNote("");
    setIsNotifyOpen(true);
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
  
  const handleSendNotification = async () => {
    if (!notifyItemId) return;

    try {
      await requestDropoff({
        id: notifyItemId,
        note: notifyNote || "Vui lòng mang đồ đến phòng lưu kho để nhận lại."
      }).unwrap();

      toast({
        title: "Gửi thông báo thành công!",
        description: `Đã gửi thông báo cho người nhặt được vật phẩm #${notifyItemId}.`,
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
      setIsNotifyOpen(false);
      setNotifyNote("");
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể gửi thông báo. Vui lòng thử lại.",
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
          {/* 👇 SỬA: Kiểm tra độ dài của openItems thay vì items gốc */}
          {openItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                Không có vật phẩm nào cần nhập kho (Status: Open).
              </TableCell>
            </TableRow>
          ) : (
            // 👇 SỬA: Map qua openItems
            openItems.map((item: FoundItem) => (
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
                      {formatVN(item.foundDate)}
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
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => handleOpenNotifyModal(item.foundItemId)}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Gửi thông báo
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#EC6824] hover:bg-[#EC6824]/90 text-white shadow-sm"
                      onClick={() => handleOpenModal(item.foundItemId)}
                    >
                      <PackageCheck className="w-4 h-4 mr-2" />
                      Nhập kho
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* MODAL CONFIRM NHẬP KHO */}
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
      
      {/* MODAL GỬI THÔNG BÁO */}
      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Bell className="h-5 w-5" />
              Gửi thông báo nhận đồ
            </DialogTitle>
            <DialogDescription className="pt-2">
              Gửi thông báo đến người đã nhặt được vật phẩm <strong>#{notifyItemId}</strong> để họ mang đến phòng lưu kho.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Nội dung thông báo (tùy chọn)
            </label>
            <Textarea
              placeholder="Vui lòng mang đồ đến phòng lưu kho để nhận lại..."
              value={notifyNote}
              onChange={(e) => setNotifyNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setIsNotifyOpen(false)}>Hủy bỏ</Button>
            <Button onClick={handleSendNotification} disabled={isSendingNotification} className="bg-blue-600 hover:bg-blue-700">
              {isSendingNotification && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi thông báo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
