import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Package, Plus, ArrowUpRight, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useGetSecurityTemporaryItemsQuery, useTransferToStaffMutation } from '@/features/items/itemApi';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SecurityDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAppSelector(selectCurrentUser);

  const [keyword, setKeyword] = useState<string>("");
  const [selectedCampus, setSelectedCampus] = useState<string>(user?.campusId || "all");
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [transferNote, setTransferNote] = useState<string>("");

  const { data: items = [], isLoading, isFetching, refetch } = useGetSecurityTemporaryItemsQuery({
    campusId: selectedCampus === "all" ? undefined : selectedCampus,
  });

  const [transferToStaff, { isLoading: isTransferring }] = useTransferToStaffMutation();

  // Filter by keyword
  const filteredItems = keyword.trim()
    ? items.filter(item => 
        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
        item.description.toLowerCase().includes(keyword.toLowerCase()) ||
        item.finderName.toLowerCase().includes(keyword.toLowerCase())
      )
    : items;

  const handleTransfer = async () => {
    if (!selectedItemId) return;

    try {
      await transferToStaff({
        foundItemId: selectedItemId,
        note: transferNote || undefined,
      }).unwrap();

      toast({
        title: "Chuyển giao thành công!",
        description: "Vật phẩm đã được chuyển đến DVSV Staff. Vui lòng bàn giao đồ vật thực tế.",
      });

      setTransferDialogOpen(false);
      setSelectedItemId(null);
      setTransferNote("");
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể chuyển giao lúc này.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý đồ nhặt được tạm thời</h1>
          <p className="text-slate-500 mt-1">
            Quản lý các vật phẩm đã được ghi nhận tạm thời (Status = Open). Sau đó chuyển giao đến DVSV Staff.
          </p>
        </div>
        <Button 
          onClick={() => navigate(window.location.pathname.includes('/test/') ? '/test/security/log' : '/security/log-item')} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Ghi nhận mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên đồ vật, mô tả, tên người giao nộp..."
              className="pl-9"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Select value={selectedCampus} onValueChange={setSelectedCampus}>
              <SelectTrigger>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <SelectValue placeholder="Campus" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Campus</SelectItem>
                <SelectItem value="hcm-nvh">HCM - NVH Sinh Viên</SelectItem>
                <SelectItem value="hcm-shtp">HCM - SHTP (Q9)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1">
            <Button
              variant="ghost"
              className="w-full text-xs text-slate-500"
              onClick={() => {
                setKeyword("");
                setSelectedCampus("all");
              }}
            >
              Xóa lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Chưa chuyển giao ({items.filter(i => !i.transferredToStaff).length})</TabsTrigger>
          <TabsTrigger value="transferred">Đã chuyển giao ({items.filter(i => i.transferredToStaff).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {/* Items Grid */}
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.filter(i => !i.transferredToStaff).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.filter(i => !i.transferredToStaff).map((item) => (
                <Card key={item.foundItemID} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 flex flex-col">
                  
                  <div className="bg-slate-100 relative">
                    <AspectRatio ratio={4 / 3}>
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <Package className="h-16 w-16 text-slate-400" />
                      </div>
                    </AspectRatio>
                    <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
                      {item.status}
                    </Badge>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-bold line-clamp-2">
                      {item.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-2 text-sm text-slate-600 flex-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{item.foundLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{format(new Date(item.foundDate), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs font-medium text-slate-700">Người giao nộp:</p>
                      <p className="text-xs text-slate-600">{item.finderName}</p>
                      {item.finderContact && (
                        <p className="text-xs text-slate-500">{item.finderContact}</p>
                      )}
                    </div>
                  </CardContent>

                  <div className="p-4 pt-0 flex gap-2">
                    <Button 
                      className="flex-1 gap-2 text-xs bg-green-600 hover:bg-green-700" 
                      onClick={() => {
                        setSelectedItemId(item.foundItemID.toString());
                        setTransferDialogOpen(true);
                      }}
                    >
                      <Send className="h-3 w-3" />
                      Chuyển Staff
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-medium text-slate-900">Không có đồ vật nào chờ chuyển giao</h3>
              <p className="text-slate-500 mt-2 max-w-sm text-center">
                Tất cả đồ vật đã được chuyển giao đến DVSV Staff.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transferred">
          {filteredItems.filter(i => i.transferredToStaff).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.filter(i => i.transferredToStaff).map((item) => (
                <Card key={item.foundItemID} className="border-green-200 bg-green-50/30">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <Badge className="bg-green-500 hover:bg-green-600">Đã chuyển</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-slate-600">
                    <p className="text-xs">Giao nộp bởi: {item.finderName}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(item.foundDate), "dd/MM/yyyy HH:mm")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              Chưa có đồ vật nào được chuyển giao.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển giao đến DVSV Staff</DialogTitle>
            <DialogDescription>
              Xác nhận chuyển giao vật phẩm đến phòng DVSV. Sau khi chuyển giao, vui lòng bàn giao đồ vật thực tế cho Staff.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Ghi chú (tùy chọn)</Label>
              <Textarea
                placeholder="Ghi chú về tình trạng đồ vật, vị trí lưu trữ tạm thời..."
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
              ⚠️ Lưu ý: Sau khi xác nhận, hãy bàn giao đồ vật thực tế cho phòng DVSV tại campus tương ứng.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTransferDialogOpen(false);
                setTransferNote("");
              }}
              disabled={isTransferring}
            >
              Hủy
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={isTransferring}
              className="bg-green-600 hover:bg-green-700"
            >
              {isTransferring ? "Đang chuyển..." : "Xác nhận chuyển giao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityDashboard;

