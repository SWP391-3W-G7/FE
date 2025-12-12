import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Package, Plus, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { useGetStaffFoundItemsQuery, useGetCategoriesQuery } from '@/features/items/itemApi';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UpdateStatusDialog from '@/features/items/components/UpdateStatusDialog';

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

const StaffDashboard = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);

  const [keyword, setKeyword] = useState<string>("");
  const [selectedCampus, setSelectedCampus] = useState<string>(user?.campusId || "all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: categories = [] } = useGetCategoriesQuery();

  const { data: items = [], isLoading, isFetching, refetch } = useGetStaffFoundItemsQuery({
    campusId: selectedCampus === "all" ? undefined : selectedCampus,
    keyword: keyword.trim() || undefined,
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });
  
  // Filter by category on client side since API doesn't support it yet
  const filteredByCategory = selectedCategory === "all" 
    ? items 
    : items.filter(item => item.categoryID.toString() === selectedCategory);

  // Filter items by tab
  const filteredItems = activeTab === "all" 
    ? filteredByCategory 
    : filteredByCategory.filter(item => item.status === activeTab);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý đồ nhặt được</h1>
          <p className="text-slate-500 mt-1">
            Quản lý và cập nhật trạng thái các đồ vật đã được nhặt và lưu kho.
          </p>
        </div>
        <Button 
          onClick={() => navigate(window.location.pathname.includes('/test/') ? '/test/staff/create' : '/staff/create-item')} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Tạo hồ sơ mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên đồ vật, mô tả..."
              className="pl-9"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Loại" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.categoryID} value={cat.categoryID.toString()}>
                    {cat.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Unclaimed">Chưa lưu kho</SelectItem>
                <SelectItem value="Stored">Đã lưu kho</SelectItem>
                <SelectItem value="Claimed">Đã được nhận</SelectItem>
                <SelectItem value="Returned">Đã trả về</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Button
              variant="ghost"
              className="w-full text-xs text-slate-500"
              onClick={() => {
                setKeyword("");
                setSelectedCampus("all");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
            >
              Xóa lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs for quick status filter */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="Unclaimed">Chưa lưu kho</TabsTrigger>
          <TabsTrigger value="Stored">Đã lưu kho</TabsTrigger>
          <TabsTrigger value="Claimed">Đã được nhận</TabsTrigger>
          <TabsTrigger value="Returned">Đã trả về</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Items Grid */}
      {isLoading || isFetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.foundItemID} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 flex flex-col">
              
              <div className="bg-slate-100 relative">
                <AspectRatio ratio={4 / 3}>
                  <img
                    src={item.thumbnailURL}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </AspectRatio>
                <div className="absolute top-2 right-2">
                  {getStatusBadge(item.status)}
                </div>
              </div>

              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider mb-2">
                    {item.categoryName}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-2 text-sm text-slate-600 flex-1">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-1" title={`${item.foundLocation} - ${item.campusName}`}>
                    {item.foundLocation}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>{format(new Date(item.foundDate), "dd/MM/yyyy HH:mm")}</span>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded mt-2">
                  {item.campusName}
                </div>
              </CardContent>

              <div className="p-4 pt-0 flex gap-2">
                <Button 
                  className="flex-1 gap-2 text-xs" 
                  variant="outline"
                  onClick={() => navigate(window.location.pathname.includes('/test/') ? `/test/staff/items/${item.foundItemID}` : `/staff/items/${item.foundItemID}`)}
                >
                  Xem chi tiết <ArrowUpRight className="h-3 w-3" />
                </Button>
                {item.status !== 'Returned' && (
                  <UpdateStatusDialog 
                    foundItemId={item.foundItemID.toString()} 
                    currentStatus={item.status}
                    onUpdateSuccess={() => refetch()}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-medium text-slate-900">Không tìm thấy đồ vật nào</h3>
          <p className="text-slate-500 mt-2 max-w-sm text-center">
            Hãy thử thay đổi bộ lọc hoặc tạo hồ sơ mới cho đồ vật.
          </p>
          <Button onClick={() => navigate(window.location.pathname.includes('/test/') ? '/test/staff/create' : '/staff/create-item')} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Tạo hồ sơ mới
          </Button>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;

