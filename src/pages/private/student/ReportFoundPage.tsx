import { ReportFoundForm } from '@/features/items/components/ReportFoundForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ReportFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Báo nhặt được đồ</h1>
          <p className="text-slate-500 mt-2">
            Cảm ơn hành động đẹp của bạn! Hãy điền thông tin để giúp đồ vật tìm về chủ nhân.
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle>Thông tin tài sản nhặt được</CardTitle>
            <CardDescription>
              Vui lòng mô tả chính xác hiện trạng lúc nhặt được.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ReportFoundForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportFoundPage;