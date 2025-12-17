import { useNavigate } from 'react-router-dom';
import { useGetSystemReportsQuery } from '@/features/items/itemApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package, FileQuestion, Archive, CheckCircle2, Clock, MapPin, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AdminNav from '@/components/AdminNav';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: reports, isLoading } = useGetSystemReportsQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!reports) {
    return <div className="container mx-auto px-4 py-8">Không có dữ liệu</div>;
  }

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Báo cáo hệ thống</h1>
          <p className="text-slate-500 mt-1">
            Tổng quan về tình trạng đồ vật thất lạc và nhặt được trong hệ thống.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/admin/campus')}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Quản lý Campus
          </Button>
          <Button 
            onClick={() => navigate('/admin/users')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Users className="mr-2 h-4 w-4" />
            Quản lý người dùng
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đồ mất</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reports.totalLostItems}</div>
            <p className="text-xs text-muted-foreground">Báo cáo mất đồ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đồ nhặt được</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reports.totalFoundItems}</div>
            <p className="text-xs text-muted-foreground">Đồ vật đã nhặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang lưu kho</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{reports.itemsInStorage}</div>
            <p className="text-xs text-muted-foreground">Chờ chủ nhân nhận</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã trả về</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reports.itemsReturned}</div>
            <p className="text-xs text-muted-foreground">Đã trả cho chủ nhân</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đồ vật</CardTitle>
            <CardDescription>Phân bổ theo trạng thái hiện tại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Tạm thời (Open)</span>
              </div>
              <Badge variant="outline" className="text-orange-600">
                {reports.itemsOpen}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Đang lưu kho</span>
              </div>
              <Badge variant="outline" className="text-blue-600">
                {reports.itemsInStorage}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Đã được nhận (Claimed)</span>
              </div>
              <Badge variant="outline" className="text-yellow-600">
                {reports.itemsClaimed}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Đã trả về</span>
              </div>
              <Badge variant="outline" className="text-green-600">
                {reports.itemsReturned}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ thành công</CardTitle>
            <CardDescription>Hiệu quả hoạt động hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tỷ lệ trả về</span>
                  <span className="font-medium">
                    {reports.totalFoundItems > 0
                      ? Math.round((reports.itemsReturned / reports.totalFoundItems) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${reports.totalFoundItems > 0 ? (reports.itemsReturned / reports.totalFoundItems) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tỷ lệ tìm thấy</span>
                  <span className="font-medium">
                    {reports.totalLostItems > 0
                      ? Math.round((reports.totalFoundItems / reports.totalLostItems) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${reports.totalLostItems > 0 ? (reports.totalFoundItems / reports.totalLostItems) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campus-level Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Thống kê theo Campus
          </CardTitle>
          <CardDescription>Phân tích chi tiết theo từng cơ sở</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Tổng quan</TabsTrigger>
              <TabsTrigger value="lost">Đồ mất</TabsTrigger>
              <TabsTrigger value="found">Đồ nhặt</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {reports.campusStats.map((campus) => (
                <div key={campus.campusID} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{campus.campusName}</h3>
                    <Badge variant="outline">{campus.campusID}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Đồ mất</p>
                      <p className="text-lg font-bold text-red-600">{campus.totalLostItems}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Đồ nhặt</p>
                      <p className="text-lg font-bold text-blue-600">{campus.totalFoundItems}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Đang lưu</p>
                      <p className="text-lg font-bold text-orange-600">{campus.itemsInStorage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Đã trả</p>
                      <p className="text-lg font-bold text-green-600">{campus.itemsReturned}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="lost" className="space-y-4 mt-4">
              {reports.campusStats.map((campus) => (
                <div key={campus.campusID} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{campus.campusName}</h3>
                    <div className="text-2xl font-bold text-red-600">{campus.totalLostItems}</div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="found" className="space-y-4 mt-4">
              {reports.campusStats.map((campus) => (
                <div key={campus.campusID} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{campus.campusName}</h3>
                    <div className="text-2xl font-bold text-blue-600">{campus.totalFoundItems}</div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default AdminDashboard;

