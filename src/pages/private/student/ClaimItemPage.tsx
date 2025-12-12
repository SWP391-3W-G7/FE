import { useParams, useNavigate } from 'react-router-dom';
import { useGetFoundItemByIdQuery } from '@/features/items/itemApi';
import { ClaimForm } from '@/features/claims/components/ClaimForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const ClaimItemPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: item, isLoading } = useGetFoundItemByIdQuery(id || "");

  if (isLoading) {
    return <div className="container py-10"><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!item) {
    return <div className="container py-10 text-center">Không tìm thấy món đồ này.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 pl-0" onClick={() => navigate(-1)}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại tìm kiếm
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{item.title}</h1>
            <div className="flex gap-2">
               <Badge variant="outline">{item.categoryName}</Badge>
               <Badge variant="secondary" className="bg-orange-100 text-orange-700">{item.status}</Badge>
            </div>
          </div>
          
          <Card className="overflow-hidden border-slate-200">
            <div className="bg-slate-100">
               <AspectRatio ratio={16 / 9}>
                 <img src={item.thumbnailURL} alt={item.title} className="w-full h-full object-cover" />
               </AspectRatio>
            </div>
            <CardContent className="p-6 space-y-4">
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
                    <p className="font-medium text-slate-900">Thời gian</p>
                    <p className="text-slate-500">{new Date(item.foundDate).toLocaleString('vi-VN')}</p>
                  </div>
               </div>
               <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 mt-4">
                  ℹ️ Đây là thông tin công khai. Để nhận lại, bạn cần cung cấp bằng chứng xác thực ở form bên cạnh.
               </div>
            </CardContent>
          </Card>
        </div>

        <div>
           <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold mb-1">Xác minh sở hữu</h2>
              <p className="text-slate-500 text-sm mb-6">
                Thông tin này sẽ được gửi bí mật đến Staff để đối chiếu.
              </p>
              
              <ClaimForm foundItemId={id || ""} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default ClaimItemPage;