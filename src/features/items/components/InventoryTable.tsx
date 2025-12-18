import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Search, AlertTriangle, Loader2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

// API
import { useGetInventoryItemsQuery, useGetCategoriesQuery } from '@/features/items/itemApi';

// UI Libs
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FoundItem } from '@/types';

const ITEMS_PER_PAGE = 5;

export const InventoryTable = () => {
  // 1. Chỉ lấy dữ liệu để hiển thị
  // 1. Lấy dữ liệu từ API (Chỉ lấy status 'Stored')
  const { data, isLoading } = useGetInventoryItemsQuery({ Status: 'Stored', PageNumber: 1, PageSize: 20 });

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // 👇 Lấy danh sách items từ response phân trang
  const rawItems = data?.items || [];

  // 2. Lọc danh sách (Chỉ tìm theo tên item)
  const filteredItems = rawItems.filter((item: FoundItem) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
        <p>Đang tải dữ liệu kho...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Tìm kiếm vật phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button size="icon" variant="secondary">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Table Data */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[300px]">Vật phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Ngày nhập kho</TableHead>
              <TableHead>Tình trạng lưu kho</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredItems || filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  Không tìm thấy vật phẩm nào trong kho.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item: FoundItem) => {
                // Tính số ngày tồn kho
                const daysInStorage = differenceInDays(new Date(), new Date(item.foundDate));
                const isOverdue = daysInStorage > 180; // > 6 tháng

                return (
                  <TableRow key={item.foundItemId}>
                    {/* Cột 1: Thông tin vật phẩm */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                          <img
                            src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : "https://placehold.co/100?text=Img"}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 line-clamp-1" title={item.title}>
                            {item.title}
                          </div>
                          {/* Hiển thị ID nhỏ bên dưới để dễ đối soát */}
                          <div className="text-[10px] text-slate-400">#{item.foundItemId}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Danh mục */}
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {item.categoryName}
                      </Badge>
                    </TableCell>

                    {/* Cột 3: Thời gian */}
                    <TableCell>
                      <div className="text-sm font-medium text-slate-700">
                        {format(new Date(item.foundDate), "dd/MM/yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Đã lưu {daysInStorage} ngày
                      </div>
                    </TableCell>

                    {/* Cột 4: Trạng thái / Cảnh báo */}
                    <TableCell>
                      {isOverdue ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive" className="cursor-help inline-flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Tồn kho lâu
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Vật phẩm đã lưu kho hơn 6 tháng.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                          Đang lưu giữ
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
            <span className="text-sm text-slate-500">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};