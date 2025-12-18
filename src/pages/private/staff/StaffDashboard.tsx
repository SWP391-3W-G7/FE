import { FileSearch } from 'lucide-react';

// Components
import { StaffStats } from '@/features/items/components/StaffStats';
import { IncomingItemsTable } from '@/features/items/components/IncomingItemsTable';
import { InventoryTable } from '@/features/items/components/InventoryTable';
import { ClaimsManagement } from '@/features/claims/components/ClaimsManagement';
import { DisputeResolver } from '@/features/items/components/DisputeResolver';
import { ReturnCounter } from '@/features/items/components/ReturnCounter';
import { LostReportsManager } from '@/features/items/components/LostReportsManager';

// API hooks for counts
import { 
  useGetIncomingItemsQuery, 
  useGetInventoryItemsQuery, 
  useGetPendingClaimsQuery,
  useGetReadyToReturnItemsQuery 
} from '@/features/items/itemApi';

// UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { FoundItem, Claim } from '@/types';

export const StaffDashboard = () => {
  // Fetch data for tab counts
  const { data: incomingItems } = useGetIncomingItemsQuery();
  const { data: inventoryItems } = useGetInventoryItemsQuery();
  const { data: pendingClaims } = useGetPendingClaimsQuery();
  const { data: readyItems } = useGetReadyToReturnItemsQuery();

  // Calculate counts - ensure data is array before filtering
  const incomingArray = Array.isArray(incomingItems) ? incomingItems : [];
  const inventoryArray = Array.isArray(inventoryItems) ? inventoryItems : [];
  const claimsArray = Array.isArray(pendingClaims) ? pendingClaims : [];
  const readyArray = Array.isArray(readyItems) ? readyItems : [];

  const incomingCount = incomingArray.filter((item: FoundItem) => item.status === 'Open').length;
  const inventoryCount = inventoryArray.length;
  const claimsCount = claimsArray.filter((c: Claim) => c.status === 'Pending').length;
  const returnCount = readyArray.length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      
      {/* PHẦN 1: HEADER & STATS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staff Dashboard</h1>
            <p className="text-slate-500">Quản lý quy trình Lost & Found tại Campus.</p>
          </div>
          
          {/* Nút bật "Tin Báo Mất" */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 border-slate-300">
                <FileSearch className="w-4 h-4" /> Tra cứu Tin Báo Mất
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[800px] sm:max-w-[800px] overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Danh sách Sinh viên báo mất</SheetTitle>
                <SheetDescription>
                  Tra cứu nhanh để đối chiếu với đồ vật vừa nhặt được.
                </SheetDescription>
              </SheetHeader>
              <LostReportsManager />
            </SheetContent>
          </Sheet>
        </div>

        {/* Stats */}
        <StaffStats /> 
      </div>

      <Separator />

      {/* PHẦN 2: WORKSPACE */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
        <Tabs defaultValue="incoming" className="w-full">
          
          {/* TabsList với số lượng */}
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border h-12">
            <TabsTrigger value="incoming" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 rounded-none h-full text-base gap-2">
              1. Nhập kho
              {incomingCount > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 ml-1">
                  {incomingCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="storage" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 rounded-none h-full text-base gap-2">
              2. Kho hàng
              {inventoryCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 ml-1">
                  {inventoryCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="process" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 rounded-none h-full text-base gap-2">
              3. Xử lý & Duyệt
              {claimsCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 ml-1">
                  {claimsCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="return" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 rounded-none h-full text-base gap-2">
              4. Trả đồ
              {returnCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 ml-1">
                  {returnCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* NỘI DUNG CÁC BƯỚC */}
          
          {/* STEP 1: NHẬP KHO */}
          <TabsContent value="incoming" className="mt-6">
             <IncomingItemsTable />
          </TabsContent>

          {/* STEP 2: KHO HÀNG */}
          <TabsContent value="storage" className="mt-6">
             <InventoryTable />
          </TabsContent>

          {/* STEP 3: XỬ LÝ */}
          <TabsContent value="process" className="mt-6 space-y-8">
             {/* Phần A: Tranh chấp */}
             <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  ⚠️ Khu vực Tranh chấp (Cần xử lý trước)
                </h3>
                <DisputeResolver />
             </div>

             {/* Phần B: Duyệt đơn thường */}
             <div>
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  📋 Danh sách yêu cầu nhận đồ (Claims)
                </h3>
                <ClaimsManagement />
             </div>
          </TabsContent>

          {/* STEP 4: TRẢ ĐỒ */}
          <TabsContent value="return" className="mt-6">
             <ReturnCounter />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};