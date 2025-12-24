import { Card, CardContent } from "@/components/ui/card";
import { ClaimsManagement } from '@/features/claims/components/ClaimsManagement';

const StaffVerifyPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Xử lý & Duyệt</h1>
                <p className="text-slate-500 mt-1">Xem xét và phê duyệt các yêu cầu nhận đồ.</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <ClaimsManagement />
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffVerifyPage;
