import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  User as UserIcon,
  Lock,
  Save,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  AlertCircle,
  Camera
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppDispatch } from '@/store';
import { updateUser } from '@/features/auth/authSlice';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation
} from '@/features/auth/authApi';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Schema for profile update
const profileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phoneNumber: z.string().regex(/^[0-9+]{9,11}$/, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
});

// Schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const { data: user, isLoading: loadingProfile } = useGetProfileQuery();
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({ fullName: data.fullName }).unwrap();
      dispatch(updateUser({ fullName: data.fullName }));
      toast({
        title: 'Cập nhật thành công!',
        description: 'Thông tin cá nhân đã được lưu.',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast({
        title: 'Đổi mật khẩu thành công!',
        description: 'Mật khẩu mới đã được cập nhật.',
      });
      passwordForm.reset();
    } catch (error: any) {
      console.error('Password change error:', error);
      const message = error?.data?.message || 'Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra.';
      toast({
        variant: 'destructive',
        title: 'Lỗi đổi mật khẩu',
        description: message,
      });
    }
  };

  if (loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const isVerified = !!user?.studentIdCardUrl;
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900 transition-colors"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Verification */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-slate-700 shadow-xl mb-4 group-hover:border-orange-500 transition-all duration-300">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-slate-700 text-3xl font-bold text-white uppercase italic">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>

              <h2 className="text-xl font-bold italic line-clamp-1">{user?.fullName}</h2>
              <p className="text-slate-400 text-sm mb-4">@{user?.username || 'user'}</p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge className={cn(
                  "px-3 py-1",
                  isVerified ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                )}>
                  {isVerified ? (
                    <BadgeCheck className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                </Badge>
                <Badge variant="outline" className="border-slate-700 text-slate-300">
                  {user?.role}
                </Badge>
              </div>

              <div className="w-full space-y-4 pt-4 border-t border-slate-700/50 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-orange-500" />
                  <span className="text-slate-300 truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-slate-300">{user?.campusName}</span>
                </div>
                {user?.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <span className="text-slate-300">{user?.phoneNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Student ID Card Section */}
          <Card className="border-slate-100 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-600" />
                Thẻ sinh viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isVerified ? (
                <div className="relative aspect-[3/2] rounded-lg overflow-hidden border border-slate-200 shadow-inner group">
                  <img
                    src={user?.studentIdCardUrl}
                    alt="Student ID Card"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <Camera className="h-8 w-8 text-slate-300" />
                  <p className="text-xs text-slate-500">Bạn chưa tải lên ảnh thẻ sinh viên để xác minh danh tính.</p>
                  <Button size="sm" variant="outline" className="text-xs mt-2 border-orange-200 text-orange-700 hover:bg-orange-50">
                    Xác minh ngay
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-orange-600" />
                Thông tin tài khoản
              </h3>
              <p className="text-sm text-slate-500">Quản lý và cập nhật thông tin cá nhân của bạn.</p>
            </div>

            <div className="p-6">
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-600">Email công việc</Label>
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="bg-slate-50 border-slate-200 text-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">Campus đăng ký</Label>
                      <Input
                        value={user?.campusName || ''}
                        disabled
                        className="bg-slate-50 border-slate-200 text-slate-600"
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-600">Họ và tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Nguyễn Văn A" className="border-slate-200 focus:border-orange-500 transition-colors" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-600">Số điện thoại</FormLabel>
                          <FormControl>
                            <Input placeholder="09xxxxxxx" className="border-slate-200 focus:border-orange-500 transition-colors" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={updatingProfile} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px] shadow-lg shadow-orange-600/20">
                      {updatingProfile ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang lưu...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Lưu thay đổi
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-600" />
                Bảo mật & Mật khẩu
              </h3>
              <p className="text-sm text-slate-500">Đảm bảo an toàn bằng cách thay đổi mật khẩu định kỳ.</p>
            </div>

            <div className="p-6">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <div className="space-y-4 max-w-md">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-600">Mật khẩu hiện tại</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" className="border-slate-200 focus:border-orange-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-600">Mật khẩu mới</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" className="border-slate-200 focus:border-orange-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-600">Xác nhận mật khẩu mới</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" className="border-slate-200 focus:border-orange-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={changingPassword} variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 min-w-[140px]">
                      {changingPassword ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                          Đang xử lý...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          Đổi mật khẩu
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
