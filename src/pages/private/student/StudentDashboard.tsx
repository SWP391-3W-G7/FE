import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Clock, CheckCircle2, XCircle, 
  Package, FileQuestion 
} from 'lucide-react';

import { 
  useGetMyLostItemsQuery, 
  useGetMyFoundReportsQuery, 
  useGetMyClaimsQuery 
} from '@/features/items/itemApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Open':
    case 'Pending':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1"/> Đang xử lý</Badge>;
    case 'Approved':
    case 'Found':
    case 'Stored':
      return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1"/> Hoàn tất/Đã duyệt</Badge>;
    case 'Rejected':
    case 'Closed':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Đã đóng/Từ chối</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const StudentDashboard = () => {
  const navigate = useNavigate();

  const { data: lostItems, isLoading: loadLost } = useGetMyLostItemsQuery();
  const { data: foundItems, isLoading: loadFound } = useGetMyFoundReportsQuery();
  const { data: claims, isLoading: loadClaims } = useGetMyClaimsQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý hồ sơ cá nhân</h1>
        <p className="text-slate-500 mt-1">Theo dõi trạng thái các báo cáo và yêu cầu nhận đồ của bạn.</p>
      </div>

      <Tabs defaultValue="claims" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="claims">Yêu cầu nhận đồ</TabsTrigger>
          <TabsTrigger value="lost">Tin báo mất</TabsTrigger>
          <TabsTrigger value="found">Tin báo nhặt</TabsTrigger>
        </TabsList>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử nhận đồ</CardTitle>
              <CardDescription>Danh sách các món đồ bạn đã gửi yêu cầu xác minh.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadClaims ? <Skeleton className="h-20 w-full" /> : 
               claims?.length === 0 ? <p className="text-center text-slate-500 py-4">Chưa có yêu cầu nào.</p> :
               claims?.map((claim) => (
                <div key={claim.claimID} className="flex items-center gap-4 border p-4 rounded-lg bg-white shadow-sm hover:bg-slate-50 transition-colors">
                  <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden shrink-0">
                    <img src={claim.foundItem.thumbnail} alt="" className="h-full w-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 line-clamp-1">{claim.foundItem.title}</h4>
                    <p className="text-xs text-slate-500">
                      Gửi ngày: {format(new Date(claim.claimDate), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(claim.status)}
                    {claim.status === 'Approved' && (
                      <span className="text-xs text-green-600 font-medium">Vui lòng đến phòng DVSV nhận đồ</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

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
               lostItems?.map((item) => (
                <div key={item.lostItemID} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
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
                   <div>{getStatusBadge(item.status)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

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
               foundItems?.map((item) => (
                <div key={item.foundItemID} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
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
                   <div>{getStatusBadge(item.status)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default StudentDashboard;