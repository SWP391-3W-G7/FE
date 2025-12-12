import { useParams, useNavigate } from 'react-router-dom';
import { useGetFoundItemByIdQuery } from '@/features/items/itemApi';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Calendar, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import UpdateStatusDialog from '@/features/items/components/UpdateStatusDialog';
import { format } from 'date-fns';

const StaffItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: item, isLoading, refetch } = useGetFoundItemByIdQuery(id || "");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Stored':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Đã lưu kho</Badge>;
      case 'Claimed':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Đã được nhận</Badge>;
      case 'Returned':
        return <Badge className="bg-green-500 hover:bg-green-600">Đã trả về</Badge>;
      case 'Unclaimed':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Chưa lưu kho</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="container py-10"><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!item) {
    return <div className="container py-10 text-center">Không tìm thấy món đồ này.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 pl-0" onClick={() => navigate(window.location.pathname.includes('/test/') ? '/test/staff/dashboard' : '/staff/dashboard')}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại quản lý
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{item.title}</h1>
              {getStatusBadge(item.status)}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{item.categoryName}</Badge>
            </div>
          </div>
          
          <Card className="overflow-hidden border-slate-200">
            <div className="bg-slate-100">
               <AspectRatio ratio={16 / 9}>
                 <img src={item.thumbnailURL} alt={item.title} className="w-full h-full object-cover" />
               </AspectRatio>
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Mô tả</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                 <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                 <div>
                   <p className="font-medium text-slate-900">Khu vực nhặt được</p>
                   <p className="text-slate-500">{item.foundLocation} - {item.campusName}</p>
                 </div>
              </div>
              
              <Separator />
              
              <div className="flex items-start gap-3">
                 <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                 <div>
                   <p className="font-medium text-slate-900">Thời gian nhặt được</p>
                   <p className="text-slate-500">{format(new Date(item.foundDate), "dd/MM/yyyy HH:mm")}</p>
                 </div>
              </div>

              {(item as any).storageLocation && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Vị trí lưu trữ</p>
                      <p className="text-slate-500">{(item as any).storageLocation}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
           <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Quản lý đồ vật</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Cập nhật trạng thái của đồ vật trong quá trình xử lý.
                  </p>
                  
                  {item.status !== 'Returned' && (
                    <UpdateStatusDialog 
                      foundItemId={item.foundItemID.toString()} 
                      currentStatus={item.status}
                      onUpdateSuccess={() => refetch()}
                    />
                  )}

                  {item.status === 'Returned' && (
                    <div className="bg-green-50 p-4 rounded-md text-sm text-green-700">
                      ✓ Đồ vật đã được trả về cho chủ sở hữu.
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900">Trạng thái hiện tại</h4>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {item.status === 'Stored' && 'Đồ vật đã được lưu kho và sẵn sàng để sinh viên tìm kiếm và yêu cầu nhận lại.'}
                    {item.status === 'Claimed' && 'Có sinh viên đã yêu cầu nhận đồ và đang chờ xác minh hoặc đã được duyệt.'}
                    {item.status === 'Returned' && 'Đồ vật đã được trả về cho chủ sở hữu thành công.'}
                    {item.status === 'Unclaimed' && 'Đồ vật chưa được lưu kho chính thức.'}
                  </p>
                </div>
              </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default StaffItemDetailPage;

