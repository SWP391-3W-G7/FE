import { Card, CardContent } from "@/components/ui/card";
import { IncomingItemsTable } from '@/features/items/components/IncomingItemsTable';
import { LostReportsManager } from '@/features/items/components/LostReportsManager';
import { Button } from "@/components/ui/button";
import { FileSearch } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const StaffIncomingPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nhập kho</h1>
                    <p className="text-slate-500 mt-1">Quản lý và tiếp nhận các vật phẩm mới đưa vào kho.</p>
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="gap-2 border-slate-300">
                            <FileSearch className="w-4 h-4" /> Tra cứu Tin Báo Mất
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[600px] sm:w-[540px] overflow-y-auto">
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

            <Card>
                <CardContent className="p-0">
                    <IncomingItemsTable />
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffIncomingPage;
