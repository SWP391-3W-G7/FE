import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { loginSuccess } from '@/features/auth/authSlice';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { type UserRole, type User } from '@/types';
import { ROLES } from '@/config/roles';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // Lấy token từ URL params (BE sẽ redirect về với token)
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const fullName = searchParams.get('fullName');
      const roleName = searchParams.get('roleName') || searchParams.get('role');
      const campusId = searchParams.get('campusId');
      const campusName = searchParams.get('campusName');
      const studentIdCardUrl = searchParams.get('studentIdCardUrl');
      const status = searchParams.get('status');
      const error = searchParams.get('error');

      if (error) {
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: decodeURIComponent(error),
        });
        navigate('/login', { replace: true });
        return;
      }

      if (!token) {
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: "Không nhận được token từ server.",
        });
        navigate('/login', { replace: true });
        return;
      }

      // Normalize role
      let role = (roleName || 'USER').toUpperCase();
      if (role.includes('SECURITY') || role === 'MANAGER') {
        role = 'SECURITY';
      } else if (role.includes('ADMIN')) {
        role = 'ADMIN';
      } else if (role.includes('STAFF')) {
        role = 'STAFF';
      } else {
        role = 'STUDENT';
      }

      const user: User = {
        email: email || '',
        fullName: fullName || '',
        campusName: campusName || '',
        role: role as UserRole,
        campusId: campusId ? Number(campusId) : 1,
        studentIdCardUrl: studentIdCardUrl || undefined,
        status: status || undefined,
      };

      // Dispatch login success
      dispatch(loginSuccess({
        user,
        token,
      }));

      // Ngay sau khi login thành công, fetch profile để lấy đầy đủ thông tin user
      // (bao gồm studentIdCardUrl và status vì URL params có thể không chứa đầy đủ)
      try {
        const { authApi } = await import('@/features/auth/authApi');
        const profileResult = await dispatch(authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }));
        if ('data' in profileResult) {
          console.log("✅ Profile fetched successfully after Google login:", profileResult.data);
        }
      } catch (profileError) {
        console.error("⚠️ Failed to fetch profile after Google login:", profileError);
      }

      toast({
        title: "Đăng nhập thành công!",
        description: `Xin chào ${user.fullName}`,
      });

      // Redirect based on role
      let redirectPath = '/items';
      if (role === ROLES.ADMIN) {
        redirectPath = '/admin/dashboard';
      } else if (role === ROLES.SECURITY) {
        redirectPath = '/security/dashboard';
      } else if (role === ROLES.STAFF) {
        redirectPath = '/staff/dashboard';
      }

      navigate(redirectPath, { replace: true });
    };

    handleCallback();
  }, [searchParams, dispatch, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Đang xử lý đăng nhập...</h2>
        <p className="text-slate-500 mt-2">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
