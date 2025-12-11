import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  PackagePlus, 
  Menu, 
  LogOut, 
  User as UserIcon, 
  History, 
  Bell 
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store';
import { logout, selectCurrentUser, selectIsAuthenticated } from '@/features/auth/authSlice';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

const MainLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Tìm đồ thất lạc', path: '/items' },
    { name: 'Về chúng tôi', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* 1. Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-orange-600 hover:opacity-90 transition-opacity">
              <PackagePlus className="h-7 w-7" />
              <span className="hidden sm:inline-block">FPTU Lost & Found</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                    isActive(link.path) ? "text-orange-600 font-bold" : "text-slate-600"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* 2. Right Actions (Auth only) */}
          <div className="flex items-center gap-4">
            
            {/* Auth Section */}
            {isAuthenticated && user ? (
              // --- LOGGED IN VIEW ---
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-orange-600">
                   <Bell className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} />
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <Badge variant="secondary" className="mt-2 w-fit text-[10px] uppercase">
                          {user.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/my-claims')}>
                      <History className="mr-2 h-4 w-4" />
                      Lịch sử báo mất
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Hồ sơ cá nhân
                    </DropdownMenuItem>
                    {/* Nếu là Staff/Admin thì hiện nút vào Dashboard */}
                    {(user.role === 'STAFF' || user.role === 'ADMIN') && (
                       <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                          <PackagePlus className="mr-2 h-4 w-4" />
                          Trang Quản Trị
                        </DropdownMenuItem>
                       </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // --- GUEST VIEW ---
              <div className="flex items-center gap-2">
                 <Link to="/login">
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6">
                    Đăng nhập
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6 text-slate-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-6 mt-10">
                   <Link to="/" className="text-lg font-bold flex items-center gap-2 mb-4">
                      <PackagePlus className="h-6 w-6 text-orange-600" />
                      FPTU Lost & Found
                   </Link>
                   <nav className="flex flex-col gap-4">
                      {navLinks.map((link) => (
                        <Link 
                          key={link.path} 
                          to={link.path} 
                          className="text-lg font-medium text-slate-700 hover:text-orange-600"
                        >
                          {link.name}
                        </Link>
                      ))}
                      {!isAuthenticated && (
                        <Link to="/login" className="text-lg font-medium text-blue-600">
                          Đăng nhập
                        </Link>
                      )}
                   </nav>
                </div>
              </SheetContent>
            </Sheet>

          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <PackagePlus className="h-5 w-5 text-orange-600" /> 
                 FPTU Lost & Found
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Hệ thống hỗ trợ tìm kiếm và trao trả đồ thất lạc cho sinh viên, 
                giảng viên và cán bộ nhân viên Đại học FPT TP.HCM.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/items" className="hover:text-orange-600">Tìm đồ thất lạc</Link></li>
                <li><Link to="/report" className="hover:text-orange-600">Báo mất đồ</Link></li>
                <li><Link to="/guidelines" className="hover:text-orange-600">Quy trình nhận lại</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>Phòng Dịch vụ Sinh viên (P.102)</li>
                <li>Hotline: (028) 7300 5588</li>
                <li>Email: sro.hcm@fpt.edu.vn</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} FPT University. Developed by your Awesome Team.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;