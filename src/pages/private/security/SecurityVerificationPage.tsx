import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, FileQuestion, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useGetLostItemsForVerificationQuery, useVerifyLostItemMutation } from '@/features/items/itemApi';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SecurityVerificationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAppSelector(selectCurrentUser);

  const [keyword, setKeyword] = useState<string>("");
  const [selectedCampus, setSelectedCampus] = useState<string>(user?.campusId || "all");
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<string>("");

  const { data: items = [], isLoading, refetch } = useGetLostItemsForVerificationQuery({
    campusId: selectedCampus === "all" ? undefined : selectedCampus,
    keyword: keyword.trim() || undefined,
  });

  const [verifyLostItem, { isLoading: isVerifying }] = useVerifyLostItemMutation();

  const handleOpenVerifyDialog = (itemId: string) => {
    setSelectedItemId(itemId);
    setVerified(null);
    setVerificationNotes("");
    setVerifyDialogOpen(true);
  };

  const handleVerify = async () => {
    if (!selectedItemId || verified === null) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn kết quả xác minh.",
      });
      return;
    }

    try {
      await verifyLostItem({
        lostItemId: selectedItemId,
        verified,
        notes: verificationNotes || undefined,
      }).unwrap();

      toast({
        title: "Xác minh thành công!",
        description: `Kết quả xác minh đã được ghi nhận: ${verified ? "Xác nhận đúng" : "Không xác nhận"}`,
      });

      setVerifyDialogOpen(false);
      setSelectedItemId(null);
      setVerified(null);
      setVerificationNotes("");
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể ghi nhận kết quả xác minh.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Đang xử lý</Badge>;
      case 'Found':
        return <Badge className="bg-green-500 hover:bg-green-600">Đã tìm thấy</Badge>;
      case 'Closed':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Đã đóng</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Xác minh báo cáo mất đồ</h1>
        <p className="text-slate-500 mt-1">
          Xác minh vị trí và thời gian mất đồ theo báo cáo của sinh viên. Hỗ trợ điều tra khi có tranh chấp.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên đồ vật, mô tả, vị trí mất..."
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

      {/* Items List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.lostItemID} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-red-50 rounded-full text-red-600">
                        <FileQuestion className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-4">{item.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-700">Vị trí mất:</p>
                          <p className="text-slate-600">{item.lostLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-700">Thời gian mất:</p>
                          <p className="text-slate-600">
                            {format(new Date(item.lostDate), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenVerifyDialog(item.lostItemID.toString())}
                      className="whitespace-nowrap"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Xác minh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-medium text-slate-900">Không có báo cáo nào</h3>
          <p className="text-slate-500 mt-2 max-w-sm text-center">
            Không có báo cáo mất đồ nào cần xác minh.
          </p>
        </div>
      )}

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Xác minh báo cáo mất đồ</DialogTitle>
            <DialogDescription>
              Xác minh vị trí và thời gian mất đồ. Ghi chú chi tiết để hỗ trợ điều tra sau này.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">Kết quả xác minh</Label>
              <RadioGroup value={verified === null ? "" : verified.toString()} onValueChange={(value) => setVerified(value === "true")}>
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-slate-50">
                  <RadioGroupItem value="true" id="verified" />
                  <Label htmlFor="verified" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Xác nhận đúng</p>
                      <p className="text-xs text-slate-500">Vị trí và thời gian khớp với báo cáo</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-slate-50">
                  <RadioGroupItem value="false" id="not-verified" />
                  <Label htmlFor="not-verified" className="flex items-center gap-2 cursor-pointer flex-1">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Không xác nhận</p>
                      <p className="text-xs text-slate-500">Thông tin không khớp hoặc không rõ ràng</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Ghi chú xác minh</Label>
              <Textarea
                placeholder="Ghi chú chi tiết về vị trí, thời gian, nhân chứng (nếu có)..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-1">
                Ghi chú này sẽ giúp Staff và hệ thống xử lý tốt hơn khi có tranh chấp.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setVerifyDialogOpen(false);
                setVerified(null);
                setVerificationNotes("");
              }}
              disabled={isVerifying}
            >
              Hủy
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isVerifying || verified === null}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isVerifying ? "Đang xác minh..." : "Ghi nhận kết quả"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityVerificationPage;

