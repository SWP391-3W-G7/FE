import { useState } from 'react';
import { formatDateVN, formatTimeVN } from '@/utils/dateUtils';
import { Search, Trash2, MoreHorizontal, MapPin, Tag, Image as ImageIcon } from 'lucide-react';

// API
import { useGetAllLostItemsQuery } from '@/features/items/itemApi';

// UI Components
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { LostItem } from '@/types';


export const LostReportsManager = () => {
   // Giả sử API trả về data dạng LostItem[]
   const { data, isLoading } = useGetAllLostItemsQuery();
   const [searchTerm, setSearchTerm] = useState("");

   // Defensive data extraction (handles flat array or paginated response)
   const lostItems: LostItem[] = (data as any)?.items || (Array.isArray(data) ? data : []);

   // Filter logic cập nhật theo các trường có sẵn
   const filteredItems = lostItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lostLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
   );

   if (isLoading) return <div className="p-4 text-center text-slate-500">Đang tải dữ liệu...</div>;

   return (
      <div className="space-y-4">
         {/* HEADER & SEARCH */}
         <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
            <div className="relative w-96">
               <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
               <Input
                  placeholder="Tìm theo tên đồ, địa điểm, loại..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="text-sm text-slate-500">
               Tổng cộng: <span className="font-bold text-slate-900">{filteredItems?.length || 0}</span> tin
            </div>
         </div>

         {/* TABLE */}
         <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
               <TableHeader className="bg-slate-50">
                  <TableRow>
                     <TableHead className="w-[80px]">Hình ảnh</TableHead>
                     <TableHead className="w-[300px]">Vật phẩm báo mất</TableHead>
                     <TableHead>Địa điểm & Danh mục</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead>Ngày mất</TableHead>
                     <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {filteredItems?.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                           Không tìm thấy kết quả nào.
                        </TableCell>
                     </TableRow>
                  ) : (
                     filteredItems?.map((item: LostItem) => (
                        <TableRow key={item.lostItemId} className="hover:bg-slate-50/50">
                           {/* Cột Hình ảnh */}
                           <TableCell>
                              <div className="h-12 w-12 rounded bg-slate-100 border flex items-center justify-center overflow-hidden">
                                 {item.imageUrls && item.imageUrls.length > 0 ? (
                                    <img
                                       src={item.imageUrls[0]}
                                       alt={item.title}
                                       className="h-full w-full object-cover"
                                    />
                                 ) : (
                                    <ImageIcon className="h-6 w-6 text-slate-300" />
                                 )}
                              </div>
                           </TableCell>

                           {/* Cột Thông tin chính */}
                           <TableCell>
                              <div className="font-semibold text-slate-900">{item.title}</div>
                              <div className="text-xs text-slate-500 line-clamp-1 mt-1" title={item.description}>
                                 {item.description}
                              </div>
                           </TableCell>

                           {/* Cột Địa điểm & Danh mục (Thay cho User) */}
                           <TableCell>
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{item.lostLocation}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Tag className="w-3 h-3" />
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border">
                                       {item.categoryName}
                                    </span>
                                 </div>
                              </div>
                           </TableCell>

                           {/* Cột Trạng thái */}
                           <TableCell>
                              <Badge variant={item.status === 'Open' ? 'default' : 'secondary'} className={
                                 item.status === 'Open' ? 'bg-blue-600 hover:bg-blue-700' :
                                    item.status === 'Found' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-500'
                              }>
                                 {item.status}
                              </Badge>
                           </TableCell>

                           {/* Cột Ngày giờ */}
                           <TableCell className="text-sm text-slate-500">
                              {formatDateVN(item.lostDate)}
                              <div className="text-xs text-slate-400">
                                 {formatTimeVN(item.lostDate)}
                              </div>
                           </TableCell>

                           {/* Cột Hành động */}
                           <TableCell className="text-right">
                              <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                       <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                       className="text-red-600 focus:text-red-600 cursor-pointer"
                                       onClick={() => console.log("Xóa item", item.lostItemId)}
                                    >
                                       <Trash2 className="w-4 h-4 mr-2" /> Xóa báo cáo (Spam)
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                              </DropdownMenu>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   );
};