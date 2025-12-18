import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatInTimeZone } from "date-fns-tz";
import {
  Clock, CheckCircle2, XCircle,
  Package, FileQuestion, Pencil, Trash2
} from 'lucide-react';

import {
  useGetMyLostItemsQuery,
  useGetMyFoundItemsQuery,
  useGetMyClaimsQuery,
  useDeleteLostItemMutation,
  useDeleteFoundItemMutation
} from '@/features/items/itemApi';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { Claim, FoundItem, LostItem } from '@/types';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Pending':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Clock className="w-3 h-3 mr-1" /> Chờ xác nhận
        </Badge>
      );
    case 'Approved':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Đã nhận
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          <XCircle className="w-3 h-3 mr-1" /> Từ chối
        </Badge>
      );
    case 'Returned':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Trả lại
        </Badge>
      );
    case 'Open':
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          <Clock className="w-3 h-3 mr-1" /> Chưa nhận
        </Badge>
      );
    case 'Stored':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          <Package className="w-3 h-3 mr-1" /> Đã lưu kho
        </Badge>
      );
    case 'Closed':
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          <XCircle className="w-3 h-3 mr-1" /> Đã đóng
        </Badge>
      );
    case 'Found':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Đã tìm thấy
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: lostItems, isLoading: loadLost } = useGetMyLostItemsQuery();
  const { data: foundItems, isLoading: loadFound } = useGetMyFoundItemsQuery();
  const { data: claims, isLoading: loadClaims } = useGetMyClaimsQuery();

  const [deleteLostItem, { isLoading: deletingLost }] = useDeleteLostItemMutation();
  const [deleteFoundItem, { isLoading: deletingFound }] = useDeleteFoundItemMutation();

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'lost' | 'found';
    id: number;
    title: string;
  } | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      if (deleteDialog.type === 'lost') {
        await deleteLostItem(deleteDialog.id).unwrap();
      } else {
        await deleteFoundItem(deleteDialog.id).unwrap();
      }
      toast({
        title: "Đã xóa thành công!",
        description: `Tin báo "${deleteDialog.title}" đã được xóa.`,
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi xóa tin",
        description: "Không thể xóa tin báo này. Vui lòng thử lại sau.",
      });
    } finally {
      setDeleteDialog(null);
    }
  };

  const openDeleteDialog = (type: 'lost' | 'found', id: number, title: string) => {
    setDeleteDialog({ open: true, type, id, title });
  };

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý hồ sơ cá nhân</h1>
          <p className="text-slate-500 mt-1">Theo dõi trạng thái các báo cáo và yêu cầu nhận đồ của bạn.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/profile')}>
          Cài đặt tài khoản
        </Button>
      </div>

      <Tabs defaultValue="claims" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="claims">Yêu cầu nhận đồ</TabsTrigger>
          <TabsTrigger value="lost">Tin báo mất</TabsTrigger>
          <TabsTrigger value="found">Tin báo nhặt</TabsTrigger>
        </TabsList>

        {/* --- TAB YÊU CẦU NHẬN ĐỒ (CLAIMS) --- */}
        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử nhận đồ</CardTitle>
              <CardDescription>Danh sách các món đồ bạn đã gửi yêu cầu xác minh.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadClaims ? <Skeleton className="h-20 w-full" /> :
                claims?.length === 0 ? <p className="text-center text-slate-500 py-4">Chưa có yêu cầu nào.</p> :
                  claims?.map((claim: Claim) => {
                    const evidenceImage = claim.evidences && claim.evidences.length > 0 && claim.evidences[0].imageUrls.length > 0
                      ? claim.evidences[0].imageUrls[0]
                      : "https://placehold.co/150x150?text=No+Image";

                    return (
                      <div key={claim.claimId} className="flex items-center gap-4 border p-4 rounded-lg bg-white shadow-sm hover:bg-slate-50 transition-colors">
                        <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden shrink-0">
                          <img src={evidenceImage} alt="Evidence" className="h-full w-full object-cover" />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 line-clamp-1">
                            {claim.foundItemTitle || "Đồ vật chưa đặt tên"}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Gửi ngày: {formatInTimeZone(claim.claimDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(claim.status)}

                          {claim.status === 'Approved' && (
                            <span className="text-xs text-green-600 font-medium">Vui lòng đến phòng DVSV để nhận đồ</span>
                          )}
                          {claim.status === 'Rejected' && (
                            <span className="text-xs text-red-500">Yêu cầu xác minh không hợp lệ</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB TIN BÁO MẤT (LOST ITEMS) --- */}
        <TabsContent value="lost">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => navigate('/report-lost')} className="bg-red-600 hover:bg-red-700">
              + Báo mất đồ mới
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Đồ bạn bị mất</CardTitle>
              <CardDescription>Trạng thái tìm kiếm tài sản của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {loadLost ? <Skeleton className="h-20 w-full" /> :
                !lostItems || lostItems.length === 0 ? <p className="text-center text-slate-500 py-4">Chưa có tin báo mất nào.</p> :
                  lostItems?.map((item: LostItem) => (
                    <div key={item.lostItemId} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-50 rounded-full text-red-600">
                          <FileQuestion className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <div className="flex gap-2 text-sm text-slate-500 mt-1">
                            <span>{item.lostLocation}</span>
                            <span>•</span>
                            <span>{item.lostDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status)}

                        {/* Edit/Delete chỉ hiện khi status = Open */}
                        {item.status === 'Open' && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600"
                              onClick={() => navigate(`/edit-lost/${item.lostItemId}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600"
                              onClick={() => openDeleteDialog('lost', item.lostItemId, item.title)}
                              disabled={deletingLost}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB TIN BÁO NHẶT (FOUND ITEMS) --- */}
        <TabsContent value="found">
          <div className="flex justify-end mb-4">
            <Button size="sm" variant="outline" onClick={() => navigate('/report-found')} className="text-blue-600 border-blue-600">
              + Báo nhặt được
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Đồ bạn nhặt được</CardTitle>
              <CardDescription>Cảm ơn bạn đã giúp đỡ cộng đồng.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {loadFound ? <Skeleton className="h-20 w-full" /> :
                !foundItems || foundItems.length === 0 ? <p className="text-center text-slate-500 py-4">Chưa có tin báo nhặt nào.</p> :
                  foundItems?.map((item: FoundItem) => (
                    <div key={item.foundItemId} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <div className="flex gap-2 text-sm text-slate-500 mt-1">
                            <span>{item.foundLocation}</span>
                            <span>•</span>
                            <span>{item.campusName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status)}

                        {/* Edit/Delete chỉ hiện khi status = Open */}
                        {item.status === 'Open' && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600"
                              onClick={() => navigate(`/edit-found/${item.foundItemId}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600"
                              onClick={() => openDeleteDialog('found', item.foundItemId, item.title)}
                              disabled={deletingFound}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog?.open} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tin báo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tin báo <strong>"{deleteDialog?.title}"</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingLost || deletingFound}
            >
              {(deletingLost || deletingFound) ? "Đang xóa..." : "Xóa tin báo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentDashboard;