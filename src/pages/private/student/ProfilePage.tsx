import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Lock, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppSelector, useAppDispatch } from '@/store';
import { selectCurrentUser, updateUser } from '@/features/auth/authSlice';
import { useUpdateProfileMutation, useChangePasswordMutation } from '@/features/auth/authApi';
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

// Schema for profile update
const profileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
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
  const user = useAppSelector(selectCurrentUser);

  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Cài đặt tài khoản</h1>
        <p className="text-slate-500 mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>Cập nhật thông tin hiển thị của bạn.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500">Email không thể thay đổi.</p>
                </div>

                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Campus</Label>
                  <Input
                    value={user?.campusName || ''}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <Button type="submit" disabled={updatingProfile} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {updatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Separator />

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription>Cập nhật mật khẩu đăng nhập của bạn.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu hiện tại</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
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
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
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
                      <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={changingPassword} variant="outline" className="w-full sm:w-auto">
                  <Lock className="mr-2 h-4 w-4" />
                  {changingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
