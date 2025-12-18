import { useState } from 'react';
import { format } from 'date-fns';
import { Search, MapPin, Tag, Image as ImageIcon, Calendar, ChevronRight } from 'lucide-react';

// API
import { useGetAllLostItemsQuery } from '@/features/items/itemApi';

// UI Components
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LostItem } from '@/types';


export const LostReportsManager = () => {
  const { data: lostItems, isLoading } = useGetAllLostItemsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic - ensure array safety
  const itemsArray = Array.isArray(lostItems) ? lostItems : [];
  const filteredItems = itemsArray.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.lostLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-4 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-4">
       {/* SEARCH */}
       <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm theo tên đồ, địa điểm, loại..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
       </div>

       <div className="text-sm text-slate-500 flex items-center justify-between">
          <span>Tìm thấy <span className="font-bold text-slate-900">{filteredItems.length}</span> tin báo mất</span>
          <Badge variant="outline">{searchTerm ? "Đang lọc" : "Tất cả"}</Badge>
       </div>

       {/* LIST - Card style thay vì Table */}
       <ScrollArea className="h-[calc(100vh-250px)]">
         <div className="space-y-3 pr-4">
           {filteredItems.length === 0 ? (
             <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
               Không tìm thấy kết quả nào.
             </div>
           ) : (
             filteredItems.map((item: LostItem) => (
               <div 
                 key={item.lostItemId} 
                 className="flex gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow cursor-pointer group"
               >
                 {/* Ảnh */}
                 <div className="h-16 w-16 rounded-lg bg-slate-100 border flex items-center justify-center overflow-hidden shrink-0">
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

                 {/* Thông tin */}
                 <div className="flex-1 min-w-0">
                   <div className="flex items-start justify-between gap-2">
                     <div className="font-semibold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                       {item.title}
                     </div>
                     <Badge 
                       variant={item.status === 'Open' ? 'default' : 'secondary'} 
                       className={`shrink-0 text-[10px] ${
                         item.status === 'Open' ? 'bg-blue-600' : 
                         item.status === 'Found' ? 'bg-green-600' : 'bg-slate-500'
                       }`}
                     >
                       {item.status}
                     </Badge>
                   </div>
                   
                   <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                     {item.description}
                   </p>

                   <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                     <div className="flex items-center gap-1">
                       <MapPin className="w-3 h-3 text-slate-400" />
                       <span className="truncate max-w-[150px]">{item.lostLocation}</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <Tag className="w-3 h-3 text-slate-400" />
                       <span>{item.categoryName}</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <Calendar className="w-3 h-3 text-slate-400" />
                       <span>{format(new Date(item.lostDate), "dd/MM/yyyy")}</span>
                     </div>
                   </div>
                 </div>

                 {/* Arrow */}
                 <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors self-center shrink-0" />
               </div>
             ))
           )}
         </div>
       </ScrollArea>
    </div>
  );
};