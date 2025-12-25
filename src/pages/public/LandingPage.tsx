import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, PackagePlus, Calendar, ArrowRight, PackageOpen } from 'lucide-react';
import { formatDateVN } from '@/utils/dateUtils';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetFoundItemsQuery } from '@/features/items/itemApi';
import { useAppSelector } from '@/store';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import type { FoundItem } from '@/types';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Auth state
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Only fetch items if user is authenticated
  const { data: response, isLoading } = useGetFoundItemsQuery(
    { Status: "Stored" },
    { skip: !isAuthenticated }
  );

  const recentItems = useMemo(() => {
    if (!isAuthenticated) return [];
    const itemsArray = response?.items || [];
    return [...itemsArray]
      .sort((a, b) => new Date(b.foundDate).getTime() - new Date(a.foundDate).getTime())
      .slice(0, 4);
  }, [response, isAuthenticated]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/items?keyword=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/items');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">

      <section className="relative py-20 lg:py-32 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-orange-200 text-orange-600 bg-orange-50">
            Hệ thống Tìm đồ thất lạc FPT University HCM
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Mất đồ? <span className="text-orange-600">Đừng hoảng!</span><br />
            Chúng tôi ở đây để hỗ trợ bạn.
          </h1>

          <p className="mx-auto max-w-[700px] text-slate-500 text-lg md:text-xl mb-10">
            Kết nối sinh viên FPTU. Tra cứu nhanh chóng, xác minh dễ dàng.
          </p>

          <div className="max-w-2xl mx-auto flex gap-2 mb-10 shadow-lg p-2 rounded-lg bg-white border border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                className="pl-10 h-11 border-none shadow-none focus-visible:ring-0 text-base bg-transparent"
                placeholder="Bạn đang tìm gì? (VD: Thẻ sinh viên, Ví...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              size="lg"
              className="h-11 px-8 bg-slate-900 hover:bg-slate-800"
              onClick={handleSearch}
            >
              Tìm ngay
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-red-600 hover:bg-red-700 shadow-md gap-2"
              onClick={() => navigate('/report-lost')}
            >
              <Bell className="h-5 w-5" /> Tôi bị mất đồ
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-blue-600 text-blue-600 hover:bg-blue-50 shadow-md gap-2"
              onClick={() => navigate('/report-found')}
            >
              <PackagePlus className="h-5 w-5" /> Tôi nhặt được đồ
            </Button>
          </div>
        </div>
      </section>

      {/* Only show this section for authenticated users */}
      {isAuthenticated && (
        <>
          <Separator />

          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Vừa tìm thấy</h2>
                  <p className="text-slate-500 mt-1">Các món đồ mới được tiếp nhận tại kho Service</p>
                </div>
                <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => navigate('/items')}>
                  Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-[200px] w-full rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))
                ) : recentItems.length > 0 ? (
                  recentItems.map((item: FoundItem) => (
                    <Card key={item.foundItemId}
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden flex flex-col h-full"
                      onClick={() => navigate(`/items/${item.foundItemId}`)}
                    >
                      <div className="w-full bg-slate-100 relative border-b border-slate-100">
                        <AspectRatio ratio={4 / 3}>
                          {item.imageUrls && item.imageUrls.length > 0 ? (
                            <img
                              src={item.imageUrls[0]}
                              alt={item.title}
                              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-50">
                              <PackageOpen className="h-10 w-10 text-slate-300" />
                            </div>
                          )}
                        </AspectRatio>
                        <Badge className={`absolute top-2 right-2 shadow-sm ${item.status === 'Returned' ? 'bg-slate-500' : 'bg-green-500 hover:bg-green-600'
                          }`}>
                          {item.status}
                        </Badge>
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                          {item.categoryName}
                        </div>
                        <CardTitle className="text-base line-clamp-2 min-h-[3rem] group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-4 pt-0 space-y-2 text-sm text-slate-600 flex-grow">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{formatDateVN(item.foundDate)}</span>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0 mt-auto pb-4">
                        <Button
                          variant="secondary"
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium"
                        >
                          Chi tiết
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 text-slate-500">
                    Chưa có đồ thất lạc nào được ghi nhận gần đây.
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="py-12 bg-slate-900 text-white">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "2+", label: "Campus Hỗ Trợ" },
            { val: "150+", label: "Đồ Được Trả Lại" },
            { val: "24h", label: "Thời Gian Xử Lý" },
            { val: "100%", label: "Miễn Phí" },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-4xl font-bold text-orange-500 mb-2">{stat.val}</div>
              <div className="text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;