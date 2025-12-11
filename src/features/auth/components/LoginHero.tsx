import { PackagePlus } from 'lucide-react';

export const LoginHero = () => {
  return (
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
      <div className="absolute inset-0 bg-slate-900" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
      
      <div className="relative z-20 flex items-center text-lg font-medium">
        <PackagePlus className="mr-2 h-6 w-6" />
        FPTU Lost & Found
      </div>
      
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="text-lg">
            "Hệ thống giúp sinh viên tìm lại đồ thất lạc nhanh chóng và an toàn. 
            Kết nối cộng đồng FPTU tại cả 2 cơ sở."
          </p>
          <footer className="text-sm">Phòng Dịch vụ Sinh viên</footer>
        </blockquote>
      </div>
    </div>
  );
};