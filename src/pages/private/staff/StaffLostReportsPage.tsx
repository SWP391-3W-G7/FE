import { LostReportsManager } from '@/features/items/components/LostReportsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch } from 'lucide-react';

const StaffLostReportsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tin báo mất</h1>
                <p className="text-slate-500 mt-1">Tra cứu các tin báo mất từ sinh viên để đối chiếu với vật phẩm trong kho.</p>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <FileSearch className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Danh sách tin báo mất</CardTitle>
                            <CardDescription>Danh sách các vật phẩm sinh viên đã báo mất, có thể đối chiếu với đồ trong kho.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <LostReportsManager />
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffLostReportsPage;
