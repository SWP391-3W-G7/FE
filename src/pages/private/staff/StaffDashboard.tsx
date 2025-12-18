import { FileSearch } from 'lucide-react';

// Components
import { StaffStats } from '@/features/items/components/StaffStats';
import { IncomingItemsTable } from '@/features/items/components/IncomingItemsTable';
import { InventoryTable } from '@/features/items/components/InventoryTable';
import { ClaimsManagement } from '@/features/claims/components/ClaimsManagement';
import { ReturnCounter } from '@/features/items/components/ReturnCounter';
import { LostReportsManager } from '@/features/items/components/LostReportsManager';

// API hooks for counts
import {
  useGetFoundItemsQuery,
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
import { useState } from 'react';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/features/auth/authSlice';

export const StaffDashboard = () => {
  // Fetch data for tab counts
  const user = useAppSelector(selectCurrentUser);

  const [selectedCampus, setSelectedCampus] = useState<string>(() => {
    if (user?.campusId) {
      return user.campusId.toString();
    }
    return "all";
  });
  const { data: foundItems } = useGetFoundItemsQuery({
    CampusId: selectedCampus === "all" ? undefined : selectedCampus
  });
   const { data: a } = useGetFoundItemsQuery({
  });
  console.log("ddasdada",a?.items);
  const { data: inventoryItems } = useGetInventoryItemsQuery();
  const { data: pendingClaims } = useGetPendingClaimsQuery();
  const { data: readyItems } = useGetReadyToReturnItemsQuery();

  // Calculate counts - ensure data is array before filtering
  const incomingArray = Array.isArray(foundItems?.items) ? foundItems?.items : [];
  const inventoryArray = Array.isArray(inventoryItems) ? inventoryItems : [];
  const claimsArray = Array.isArray(pendingClaims) ? pendingClaims : [];
  const readyArray = Array.isArray(readyItems) ? readyItems : [];

  const incomingCount = incomingArray.filter((item: FoundItem) => item.status === 'Open').length;
  const inventoryCount = inventoryArray.length;
  const claimsCount = claimsArray.filter((c: Claim) => c.status === 'Pending').length;
  const returnCount = readyArray.length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">

      {/* PHẦN 1: HEADER & STATS (Phần E đưa lên đây) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staff Dashboard</h1>
            <p className="text-slate-500">Quản lý quy trình Lost & Found tại Campus.</p>
          </div>

          {/* Nút bật "Tin Báo Mất" (Phần Reference - tách ra khỏi Flow) */}
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

        {/* Hiển thị Stats dạng thu gọn ở trên cùng */}
        <StaffStats />
      </div>

      <Separator />

      {/* PHẦN 2: WORKSPACE */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
        <Tabs defaultValue="incoming" className="w-full">

          {/* TabsList chỉ chứa các Bước (Steps) theo đúng logic 1-2-3-4 */}
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border h-12">
            <TabsTrigger value="incoming" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 rounded-none h-full text-base gap-2">
              1. Nhập kho
              {incomingCount > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 ml-1">
                  {incomingCount}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="storage" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 rounded-none h-full text-base">
              2. Kho hàng (Inventory)
            </TabsTrigger>

            <TabsTrigger value="process" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 rounded-none h-full text-base">
              3. Xử lý & Duyệt (Verify)
            </TabsTrigger>

            <TabsTrigger value="return" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 rounded-none h-full text-base">
              4. Trả đồ (Return)
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

          {/* STEP 3: XỬ LÝ (QUẢN LÝ CÔNG VIỆC) */}
          <TabsContent value="process" className="mt-6">
            <ClaimsManagement />
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