import { Card, CardContent } from "@/components/ui/card";
import { ReturnCounter } from '@/features/items/components/ReturnCounter';

const StaffReturnPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trả đồ</h1>
                <p className="text-slate-500 mt-1">Quản lý quy trình trả đồ vật cho chủ sở hữu.</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <ReturnCounter />
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffReturnPage;
