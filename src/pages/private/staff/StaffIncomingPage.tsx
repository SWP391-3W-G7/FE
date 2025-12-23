import { Card, CardContent } from "@/components/ui/card";
import { IncomingItemsTable } from '@/features/items/components/IncomingItemsTable';

const StaffIncomingPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nhập kho</h1>
                <p className="text-slate-500 mt-1">Quản lý và tiếp nhận các vật phẩm mới đưa vào kho.</p>
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
