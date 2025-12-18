import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetSystemReportsQuery, useGetCampusesQuery } from '@/features/items/itemApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Package, FileQuestion, Archive, CheckCircle2, Clock, MapPin, Users, Filter } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminNav from '@/components/AdminNav';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedCampusId, setSelectedCampusId] = useState<number | undefined>(undefined);
  
  const { data: reports, isLoading } = useGetSystemReportsQuery({ campusId: selectedCampusId });
  const { data: campuses = [], isLoading: campusesLoading, error: campusesError } = useGetCampusesQuery();

  console.log('Campuses data:', campuses);
  console.log('Campuses loading:', campusesLoading);
  console.log('Campuses error:', campusesError);

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
        <Select 
          value={selectedCampusId?.toString() || "all"} 
          onValueChange={(value) => setSelectedCampusId(value === "all" ? undefined : parseInt(value))}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Chọn Campus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Campus</SelectItem>
            {campuses.filter((c: any) => c?.campusId).map((campus: any) => (
              <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                {campus.campusName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đồ nhặt được</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reports.totalFound || 0}</div>
            <p className="text-xs text-muted-foreground">Đồ vật đã nhặt được</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng yêu cầu nhận đồ</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{reports.totalClaims || 0}</div>
            <p className="text-xs text-muted-foreground">Yêu cầu đang xử lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Found Items Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đồ nhặt được</CardTitle>
            <CardDescription>Phân bổ theo trạng thái hiện tại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.foundItemStats?.map((stat: { statusName: string; count: number }) => {
              const getIcon = (status: string) => {
                switch (status) {
                  case 'Open': return <Clock className="h-4 w-4 text-orange-500" />;
                  case 'Stored': return <Archive className="h-4 w-4 text-blue-500" />;
                  case 'Claimed': return <Package className="h-4 w-4 text-yellow-500" />;
                  case 'Returned': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
                  default: return <Package className="h-4 w-4 text-gray-500" />;
                }
              };
              
              return (
                <div key={stat.statusName} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(stat.statusName)}
                    <span className="text-sm">{stat.statusName}</span>
                  </div>
                  <Badge variant="outline">{stat.count}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Claim Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái yêu cầu nhận đồ</CardTitle>
            <CardDescription>Phân bổ theo trạng thái xử lý</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.claimStats?.map((stat: { statusName: string; count: number }) => {
              const getColor = (status: string) => {
                switch (status) {
                  case 'Pending': return 'text-orange-600';
                  case 'Approved': return 'text-green-600';
                  case 'Rejected': return 'text-red-600';
                  case 'Returned': return 'text-blue-600';
                  case 'Conflicted': return 'text-purple-600';
                  default: return 'text-gray-600';
                }
              };
              
              return (
                <div key={stat.statusName} className="flex items-center justify-between">
                  <span className="text-sm">{stat.statusName}</span>
                  <Badge variant="outline" className={getColor(stat.statusName)}>
                    {stat.count}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Category Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Thống kê theo loại đồ vật</CardTitle>
          <CardDescription>Phân loại đồ nhặt được theo category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reports.categoryStats?.map((cat: { name: string; value: number }) => (
              <div key={cat.name} className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-blue-600 mb-1">{cat.value}</div>
                <div className="text-sm text-slate-600">{cat.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default AdminDashboard;

