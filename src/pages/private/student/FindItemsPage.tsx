import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { useGetFoundItemsQuery, useGetCategoriesQuery, useGetCampusesQuery } from '@/features/items/itemApi';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import type { Campus, Category, FoundItem } from '@/types';

const FindItemsPage = () => {
    const navigate = useNavigate();
    const user = useAppSelector(selectCurrentUser);

    const [searchParams] = useSearchParams();
    const urlKeyword = searchParams.get('keyword') || "";

    // API calls
    const { data: campuses = [], isLoading: isCampusesLoading } = useGetCampusesQuery();
    const { data: categories = [] } = useGetCategoriesQuery();

    const [keyword, setKeyword] = useState(urlKeyword);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    
    // Lấy ID từ user (đã có campusId từ login) làm mặc định
    const [selectedCampus, setSelectedCampus] = useState<string>(() => {
        if (user?.campusId) {
            return user.campusId.toString();
        }
        return "all";
    });

    const { data: items = [], isLoading, isFetching } = useGetFoundItemsQuery({
        campusId: selectedCampus === "all" ? undefined : selectedCampus
    });

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tìm đồ thất lạc</h1>
                    <p className="text-slate-500 mt-1">
                        Tra cứu các vật phẩm đã được tìm thấy và lưu kho tại các Campus.
                    </p>
                </div>
                <Button onClick={() => navigate('/report-lost')} variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    Chưa thấy đồ của bạn? Báo mất ngay
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm mb-8 top-20 z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm theo tên đồ vật, mô tả..."
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
                                    <SelectValue placeholder={isCampusesLoading ? "Đang tải..." : "Chọn Campus"} />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả Campus</SelectItem>
                                {campuses.map((campus: Campus) => (
                                    <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                                        {campus.campusName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-3">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Loại tài sản" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả các loại</SelectItem>
                                {categories.map((cat: Category) => (
                                    <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                                        {cat.categoryName}
                                    </SelectItem>
                                ))}
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
                                setSelectedCategory("all");
                            }}
                        >
                            Xóa lọc
                        </Button>
                    </div>
                </div>
            </div>

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
            ) : items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item: FoundItem) => (
                        <Card key={item.foundItemId} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 flex flex-col">

                            <div className="bg-slate-100 relative">
                                <AspectRatio ratio={4 / 3}>
                                    <img
                                        src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : "https://placehold.co/400x300?text=No+Image"} 
                                        alt={item.title}
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </AspectRatio>
                                <Badge className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm">
                                    {item.status}
                                </Badge>
                            </div>

                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider mb-2">
                                        {item.categoryName}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-orange-600 transition-colors">
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
                                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded mt-2 line-clamp-2">
                                    {item.campusName}
                                </div>
                            </CardContent>

                            <CardFooter className="p-4 pt-0 mt-auto">
                                <Button className="w-full gap-2" onClick={() => navigate(`/items/${item.foundItemId}`)}>
                                    Xem chi tiết <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900">Không tìm thấy kết quả nào</h3>
                    <p className="text-slate-500 mt-2 max-w-sm text-center">
                        Hãy thử thay đổi từ khóa hoặc bộ lọc. Nếu vẫn không thấy, hãy tạo tin báo mất.
                    </p>
                    <Button variant="link" onClick={() => navigate('/report-lost')} className="mt-4 text-orange-600">
                        Tạo tin báo mất đồ &rarr;
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FindItemsPage;