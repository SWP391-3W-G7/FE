import { ReportLostForm } from '@/features/items/components/ReportLostForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ReportItemPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 hover:bg-transparent hover:text-orange-600"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Báo mất đồ</h1>
          <p className="text-slate-500 mt-2">
            Vui lòng điền đầy đủ thông tin để chúng tôi hỗ trợ tìm kiếm tài sản của bạn nhanh nhất.
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Thông tin tài sản</CardTitle>
            <CardDescription>
              Các trường đánh dấu <span className="text-red-500">*</span> là bắt buộc.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ReportLostForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportItemPage;