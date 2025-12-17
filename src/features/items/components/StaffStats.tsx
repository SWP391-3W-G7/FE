import { Package, CheckCheck, Archive, FileText } from 'lucide-react';
import { useGetStaffStatsQuery } from '@/features/items/itemApi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StaffStats = () => {
  const { data: stats, isLoading } = useGetStaffStatsQuery();

  if (isLoading) return <div>Đang tính toán số liệu...</div>;

  return (
    <div className="space-y-6">
      {/* 4 CARDS TOP */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đồ nhặt được</CardTitle>
            <Package className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFound}</div>
            <p className="text-xs text-muted-foreground">+20 so với tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã trả thành công</CardTitle>
            <CheckCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.returnedCount}</div>
            <p className="text-xs text-muted-foreground">Tỷ lệ trả: {stats?.returnRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý (Claims)</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeClaims}</div>
            <p className="text-xs text-muted-foreground">Cần duyệt gấp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã thanh lý</CardTitle>
            <Archive className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.disposedCount}</div>
            <p className="text-xs text-muted-foreground">Hàng quá hạn 6 tháng</p>
          </CardContent>
        </Card>
      </div>

      {/* CHART ĐƠN GIẢN (Visual Only) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Phân loại đồ thất lạc phổ biến</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
               {stats?.categoryStats?.map((cat) => (
                 <div key={cat.name} className="flex items-center">
                    <div className="w-[100px] text-sm font-medium text-slate-500">{cat.name}</div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-slate-900" style={{ width: `${(cat.value / 150) * 100}%` }}></div>
                    </div>
                    <div className="w-[50px] text-right text-sm">{cat.value}</div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ghi chú nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 space-y-2">
               <p>- Tháng này sinh viên mất thẻ xe nhiều đột biến.</p>
               <p>- Đã thanh lý 5 bình nước để quên từ năm ngoái.</p>
               <p>- Cần kiểm tra lại Camera khu vực nhà xe A.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};