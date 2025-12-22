import { StaffStats } from '@/features/items/components/StaffStats';
import { Separator } from "@/components/ui/separator";

export const StaffDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Staff Dashboard</h1>
        <p className="text-slate-500">Tổng quan quy trình Lost & Found tại Campus.</p>
      </div>

      <StaffStats />

      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-slate-800">Hoạt động gần đây</h3>
          <p className="text-slate-500 text-sm">Chọn các tab bên sidebar để thực hiện các nghiệp vụ quản lý kho, duyệt yêu cầu hoặc trả đồ.</p>
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Bạn có thể theo dõi thống kê chi tiết ở bảng trên.</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>Các nghiệp vụ đã được tách biệt vào các tab ở Sidebar phía bên trái.</span>
            </div>
          </div>
        </div>

        <div className="col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-slate-800">Thông tin nhanh</h3>
          <div className="space-y-4">
            <div className="p-3 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">
              Chào mừng trở lại! Hãy kiểm tra các yêu cầu mới trong phần Nhập kho.
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Hỗ trợ</p>
              <p className="text-sm text-slate-600 leading-relaxed">Nếu gặp vấn đề trong quá trình xử lý, vui lòng liên hệ quản trị viên hệ thống.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};