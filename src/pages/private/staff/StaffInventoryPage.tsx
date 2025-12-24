import { Card, CardContent } from "@/components/ui/card";
import { InventoryTable } from '@/features/items/components/InventoryTable';

const StaffInventoryPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Kho hàng</h1>
                <p className="text-slate-500 mt-1">Quản lý danh sách vật phẩm hiện có trong kho.</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <InventoryTable />
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffInventoryPage;
